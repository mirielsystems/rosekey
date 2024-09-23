/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import querystring from 'querystring';
import { Inject, Injectable } from '@nestjs/common';
import megalodon, { MegalodonInterface } from 'megalodon';
import { v4 as uuid } from 'uuid';
import { bindThis } from '@/decorators.js';
import type { FastifyInstance } from 'fastify';
import { Buffer } from 'buffer';

function getClient(BASE_URL: string, authorization: string | undefined): MegalodonInterface {
	const accessTokenArr = authorization?.split(' ') ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	const generator = (megalodon as any).default;
	const client = generator('misskey', BASE_URL, accessToken) as MegalodonInterface;
	return client;
}

@Injectable()
export class OAuth2ProviderService {
	constructor() {}

	@bindThis
	public async createServer(fastify: FastifyInstance): Promise<void> {
		// CORS 設定
		fastify.addHook('onRequest', (request, reply, done) => {
			reply.header('Access-Control-Allow-Origin', '*');
			reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			reply.header('Access-Control-Allow-Credentials', 'true');
			done();
		});

		// OPTIONS メソッドに対応することで、CORS プリフライトリクエストに対応
		fastify.options('*', async (request, reply) => {
			reply.header('Access-Control-Allow-Origin', '*');
			reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			reply.header('Access-Control-Allow-Credentials', 'true');
			reply.code(204).send();
		});

		fastify.addContentTypeParser('application/x-www-form-urlencoded', (request, payload, done) => {
			let body = '';
			payload.on('data', (data) => {
				body += data;
			});
			payload.on('end', () => {
				try {
					const parsed = querystring.parse(body);
					done(null, parsed);
				} catch (e: any) {
					done(e);
				}
			});
			payload.on('error', done);
		});

		fastify.get('/authorize', async (request, reply) => {
			const query: any = request.query;
			let param = 'mastodon=true';
			if (query.state) param += `&state=${query.state}`;
			if (query.redirect_uri) param += `&redirect_uri=${query.redirect_uri}`;
			const client = query.client_id ? query.client_id : '';
			reply.redirect(
				`${Buffer.from(client.toString(), 'base64').toString()}?${param}`,
			);
		});

		fastify.get('/authorize/', async (request, reply) => {
			const query: any = request.query;
			let param = 'mastodon=true';
			if (query.state) param += `&state=${query.state}`;
			if (query.redirect_uri) param += `&redirect_uri=${query.redirect_uri}`;
			const client = query.client_id ? query.client_id : '';
			reply.redirect(
				`${Buffer.from(client.toString(), 'base64').toString()}?${param}`,
			);
		});

		fastify.post('/token', async (request, reply) => {
			const body: any = request.body || request.query;
			let client_id: string | null = body.client_id;
			let client_secret: string | null = body.client_secret;
		
			// client_secret_basic 認証を処理
			const authorizationHeader = request.headers['authorization'];
			if (authorizationHeader && authorizationHeader.startsWith('Basic ')) {
				const base64Credentials = authorizationHeader.slice('Basic '.length).trim();
				const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
				const [providedClientId, providedClientSecret] = credentials.split(':');
		
				client_id = providedClientId;
				client_secret = providedClientSecret;
			}
		
			const BASE_URL = `${request.protocol}://${request.hostname}`;
			const client = getClient(BASE_URL, '');
		
			if (body.grant_type === 'client_credentials') {
				const ret = {
					access_token: uuid(),
					token_type: 'Bearer',
					scope: 'read',
					created_at: Math.floor(new Date().getTime() / 1000),
				};
				reply.send(ret);
				return;
			}
		
			let token = body.code || null;
			if (!client_id) {
				reply.code(400).send({ error: 'client_id が無効です' });
				return;
			}
		
			try {
				if (client_secret === null) {
					throw new Error('client_secret が無効です');
				}
				
				const atData = await client.fetchAccessToken(client_id, client_secret, token ? token : '');
				const ret = {
					access_token: atData.accessToken,
					token_type: 'Bearer',
					scope: body.scope || 'read write follow push',
					created_at: Math.floor(new Date().getTime() / 1000),
				};
				reply.send(ret);
			} catch (err: any) {
				reply.code(401).send(err.response?.data || { error: '無効なリクエストです' });
			}			
		});
	}
}
