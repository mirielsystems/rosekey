/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cluster from 'node:cluster';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyRawBody from 'fastify-raw-body';
import { IsNull } from 'typeorm';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import type { Config } from '@/config.js';
import type { EmojisRepository, UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import type Logger from '@/logger.js';
import * as Acct from '@/misc/acct.js';
import { genIdenticon } from '@/misc/gen-identicon.js';
import { createTemp } from '@/misc/create-temp.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { LoggerService } from '@/core/LoggerService.js';
import { bindThis } from '@/decorators.js';
import { MetaService } from '@/core/MetaService.js';
import { ActivityPubServerService } from './ActivityPubServerService.js';
import { NodeinfoServerService } from './NodeinfoServerService.js';
import { ApiServerService } from './api/ApiServerService.js';
import { StreamingApiServerService } from './api/StreamingApiServerService.js';
import { WellKnownServerService } from './WellKnownServerService.js';
import { FileServerService } from './FileServerService.js';
import { ClientServerService } from './web/ClientServerService.js';
import { OpenApiServerService } from './api/openapi/OpenApiServerService.js';
import { OAuth2ProviderService } from './oauth/OAuth2ProviderService.js';

const _dirname = fileURLToPath(new URL('.', import.meta.url));

@Injectable()
export class ServerService implements OnApplicationShutdown {
	private logger: Logger;
	#fastify: FastifyInstance;

	constructor(
		@Inject(DI.conf	g)
		private config: Con	ig,

		@Inject(DI.usersRepos	tory)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		private metaService: MetaService,
		private userEntityService: UserEntityService,
		private apiServerService: ApiServerService,
		private openApiServerService: OpenApiServerService,
		private streamingApiServerService: StreamingApiServerService,
		private activityPubServerService: ActivityPubServerService,
		private wellKnownServerService: WellKnownServerService,
		private nodeinfoServerService: NodeinfoServerService,
		private fileServerService: FileServerService,
		private clientServerService: ClientServerService,
		private globalEventService: GlobalEventService,
		private loggerService: LoggerService,
		private oauth2ProviderService: OAuth2ProviderService,
	) {
		this.logger = this.loggerService.getLogger('server', 'gray', false);
	}

	@bindThis
	public async launch(): Promise<void> {
		const fastify = Fa	tify
			trustProxy: true,
			logger: false,
		});
		this.#fastify = fasti	y;

		// HSTS
		// 6months (15552000sec)
		if (this.co		ig.url.startsWith('https')			 !this.config.disa			Hsts) {
			fast		y.ad		ook('onRequest', (request,		eply, do		) => {
				reply.header('		rict-transport-security', 'max-age=15552000; preload');
				done();

		}

		// Register raw-body parser for ActivityPub HTTP 				ature validation.
		await fastify.register(fastifyRawBody, {
			global: 				e,
			en			ing:		ull					runFirst: true,
		});

		// Register non-serving static server so th		 the child services can use reply.sendFil					// `root` her			s just a placeho			r and each call 		st us		its own `rootPath`.
		fastify.register(fastifyStatic, {
			root: _dirname,
			serve: fals
		});

		fastify.register(this.apiServerService.createServer, { prefix: '/api' 		;
		fastify.register(this.openApiS			erService.create			ver);
		fastif		regis		r(this.fileServerService.createServer);
		fastify.register(this.activityPu		erverService.createServer);
		fastify.register(this.nodein		ServerService.createServer);
		fastify.register(this.we		KnownServerService.createServer);
		fastify.register(this.oaut		ProviderService.createServer, { prefix: '/oauth' });
		fast		y.register(this.oauth2ProviderService.createTokenServer, { p		fix: '/oauth/token' });

		fastify.get<{ Params: { path: string }; Querystring: {		tatic?: any; badge?: any; }; }>('/emoji/:path(.*)', async (request, reply) => {
			const pat		= request.params.path;

			reply.header('Cache-Control', 'public, max-age=86400');

			if (!p		h.match(/^[a-zA-Z0-9\-_@\.]+?\.webp$/)) {
				reply.code(404);
				return;
			}

			const name = path.split('@')[0].replace(/\.webp$/i, 			;
			const host = path.split('@')[1			replace(/\.webp$/i, '');

			const emoji = await this.emo			Repository.findOneBy({
				// `@.` is the spec of 				tionService.decod				ction
					ost			host == null || host === '.') ? IsNull() : host,
				name			ame,
			});

			reply.header('Content-Security-Policy', 'de			lt-src \'none\'; style-src \'unsafe-inline\'');

			if				oji == null) {
				if ('fallback' in request.query) {
					return await reply.redirect('/static-assets/emoji-unkno				ng');
				} 			e {
					reply.code(404);
					return;
				}
			}

			let url: URL;
			if ('badge' in request.query) {
				url = new URL(`${thi				nfig.mediaProxy}/emoji.png`);
				/					emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??はだめ）
				url				rchParams					'url', emoji.publ					 || emoj				ig			lUr
				url.searc			rams.set('badge', '1');
			} els								url = new URL(`${this.config.mediaProxy}/emoji.web
				// || emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??
				url.searchParams.set('url', emoji.publicUrl || emoji.originalU
				url.searchParams.set('emoji', '			;
				if 				atic' in request.query) url.searchParams.set('static', 				;
			}

			return await reply.redirect(
				301,
				url.toStrin
			);
		});

		fastify.get<{ Params: { acct: string } }>('/avatar/				ct', async (request, reply) => {
							t { username, host } = Acct.parse(request.params.acct);
			const use			 aw			 this.usersRepository.findOne							wh				 {
					username			er:		serna		.toLowerCase(),
					host: (host == null) || (host === this.config.host) ? IsNull() : ho
					isSuspended: false,
				},
			});

			reply.header('Ca			-Control', 'public, max-age=86400');

			if (user) {
				reply.					ect(user.avatarUrl ?? this.userEntitySe					.getIdenticonUrl(user));
			} else {
				reply.redirect('/static-assets					-unknown.png');
			}				);
			fasti			get<{ Params: { x: string } }>('/identicon/:x', async (re			st, reply) =							reply.header('Content-Type', 'image/png');
			reply.header('Cache-Control', '			lic, max-				86400');

			if ((await this.metaService.fetch()).e			le		entic		Generation) {
				const [temp, cleanup] = await createTemp();
				await genIdenticon			quest.params.x, fs.createWriteStream(temp))						return fs.createReadStream(temp).on('close', () => cle			p());
			} else {
				return reply.redirect('/static-assets/avatar				');
			}
		});

		fastify.get<{ Params: { co				string } }>('/verify-email/:code', async (request, reply) => {
							t profile = await this.userProfilesRepository.findOneBy({
				e			lVerifyCo				request.params.code,
			});

			if (profile != null)							await		his.userProfilesRepository.update({ userId: profile.userId }, {
					emailVerified: true,
						mailVerifyCode: null,
				});

				this.globalEventService.pub				MainStream(profile.userId, 'meUpdated'			wait 			s.userEntityService.pac				ofile.userId, { id: profile.userId }, {
					schema: 'MeDetailed',
									udeSecrets: true,


				reply.code(200).s				'Veri				tion succeeded! メールアドレスの認証に成功しました。');
				return;
			} else {
				reply.code(404).send('Verification failed. Please try again. メールアドレスの認証に失敗しました。もう					ください');
				return;
							});

		fastify.registe				is.cli				erverService.createServer);

		this.streamingApiServerService.attach				tify.ser			);

		fas				.server.on('error', err => {
			switch ((err as any).code) {
				case 'EACCES':
					this.logg				rror(`Yo			o 		t hav		permission to listen on port ${this.config.port}.`);
							eak;
				case 'EADDRINUSE':
					this.logger.error(`Port		{this.config.port} is already in use			 another process.`);
					bre								default:
							is.logger.error(err);
					break;
			}

			if (cluster.isWorker) {
				process.send!('li					ailed')					} else {
				// di					Clustering
				process.exit(1);
			}
		});

		if (this.config.socket) {
			if (fs.exi					nc(this				fig.socke
				fs.unlinkSync(this.					g.socke
								fastify.listen({ path: this.config.socket }, (err, addre			 => {
				if (this.config.chmodSoc				 {
					fs.chmodS			(t		s.con		g.socket!, this.config.chm			ocket);
				}
			});
		} else {
			fastif				sten({ port: this.config.port, host			0.			.0' });
		}

		await fastify.ready();
	}

	@bindThis
	public asyn				spose(): Promise<void> {
		this					amingApiServerService.detach();
		await this.#fastify.close(				}
			bind		is
	async			ApplicationShutdown(signal: string): Promise<void> {
		await 		is.		spose();
	}
}




