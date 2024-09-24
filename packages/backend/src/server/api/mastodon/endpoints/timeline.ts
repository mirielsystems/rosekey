import { ParsedUrlQuery } from 'querystring';
import { convertConversation, convertList, MastoConverters } from '../converters.js';
import { getClient } from '../MastodonApiServerService.js';
import type { Entity } from 'megalodon';
import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config.js';
import { NotesRepository, UsersRepository } from '@/models/_.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';

export function limitToInt(q: ParsedUrlQuery) {
	const object: any = q;
	if (q.limit) if (typeof q.limit === 'string') object.limit = parseInt(q.limit, 10);
	if (q.offset) if (typeof q.offset === 'string') object.offset = parseInt(q.offset, 10);
	return object;
}

export function argsToBools(q: ParsedUrlQuery) {
	// Values taken from https://docs.joinmastodon.org/client/intro/#boolean
	const toBoolean = (value: string) =>
		!['0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF'].includes(value);

	// Keys taken from:
	// - https://docs.joinmastodon.org/methods/accounts/#statuses
	// - https://docs.joinmastodon.org/methods/timelines/#public
	// - https://docs.joinmastodon.org/methods/timelines/#tag
	const object: any = q;
	if (q.only_media) if (typeof q.only_media === 'string') object.only_media = toBoolean(q.only_media);
	if (q.exclude_replies) if (typeof q.exclude_replies === 'string') object.exclude_replies = toBoolean(q.exclude_replies);
	if (q.exclude_reblogs) if (typeof q.exclude_reblogs === 'string') object.exclude_reblogs = toBoolean(q.exclude_reblogs);
	if (q.pinned) if (typeof q.pinned === 'string') object.pinned = toBoolean(q.pinned);
	if (q.local) if (typeof q.local === 'string') object.local = toBoolean(q.local);
	return q;
}

// 文字列を簡単な数値に変換
function generateNumericID(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // 32bit整数に変換
    }
    return Math.abs(hash);
}

export class ApiTimelineMastodon {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance, config: Config, private mastoconverter: MastoConverters) {
		this.fastify = fastify;
	}

	public async getTL() {
		this.fastify.get('/v1/timelines/public', async (_request, reply) => {
			const BASE_URL = `${_request.protocol}://${_request.hostname}`;
			const accessTokens = _request.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
	
			try {
				const query: any = _request.query;
	
				// localタイムラインとpublicタイムラインの選択
				const data = query.local === 'true'
					? await client.getLocalTimeline(argsToBools(limitToInt(query)))
					: await client.getPublicTimeline(argsToBools(limitToInt(query)));
	
				// データの処理と変換
				const convertedData = await Promise.all(
					data.data.map(async (status: Entity.Status) => {
						// `content_type` を Mastodon対応に変換
						if (status.content_type === "text/x.misskeymarkdown") {
							status.content_type = "text/plain";  // 例として text/plain に変換
						}
	
						// null フィールドの削除
						if (status.in_reply_to_id === null) delete status.in_reply_to_id;
						if (status.in_reply_to_account_id === null) delete status.in_reply_to_account_id;
						if (status.poll === null) delete status.poll;
	
						// IDが文字列なら、必要に応じて数値に変換
						if (isNaN(Number(status.id))) {
							status.id = generateNumericID(status.id);
						}
	
						return await this.mastoconverter.convertStatus(status);
					})
				);
	
				// 変換したデータを返信
				reply.send(convertedData);
	
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}	

	public async getHomeTl() {
		this.fastify.get('/v1/timelines/home', async (_request, reply) => {
			// プロキシやクライアントの状況に応じて適切にBASE_URLを設定
			const BASE_URL = `${_request.headers['x-forwarded-proto'] || _request.protocol}://${_request.headers['x-forwarded-host'] || _request.hostname}`;
			
			// アクセストークンを取得
			const accessTokens = _request.headers.authorization;
	
			// アクセストークンがない場合はエラーメッセージを返す
			if (!accessTokens) {
				reply.code(400).send({ error: 'Authorization token is missing' });
				return;
			}
	
			const client = getClient(BASE_URL, accessTokens);
			try {
				const query: any = _request.query;
				
				// ホームタイムラインを取得
				const data = await client.getHomeTimeline(limitToInt(query));
	
				// data.dataが配列かどうか確認し、配列でない場合はエラーを返す
				if (!Array.isArray(data.data)) {
					reply.code(500).send({ error: 'Unexpected response format' });
					return;
				}
	
				// タイムラインデータを変換し、レスポンスとして返す
				const convertedStatuses = await Promise.all(
					data.data.map(async (status: Entity.Status) => await this.mastoconverter.convertStatus(status))
				);
	
				reply.send(convertedStatuses);
			} catch (e: any) {
				console.error(e);
				
				// e.response.dataが存在しない場合に対応
				const errorResponse = e.response?.data || { error: 'Unknown error occurred' };
				reply.code(401).send(errorResponse);
			}
		});
	}	

	public async getTagTl() {
		this.fastify.get<{ Params: { hashtag: string } }>('/v1/timelines/tag/:hashtag', async (_request, reply) => {
			const BASE_URL = `${_request.protocol}://${_request.hostname}`;
			const accessTokens = _request.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const query: any = _request.query;
				const params: any = _request.params;
				const data = await client.getTagTimeline(params.hashtag, limitToInt(query));
				reply.send(await Promise.all(data.data.map(async (status: Entity.Status) => await this.mastoconverter.convertStatus(status))));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async getListTL() {
		this.fastify.get<{ Params: { id: string } }>('/v1/timelines/list/:id', async (_request, reply) => {
			const BASE_URL = `${_request.protocol}://${_request.hostname}`;
			const accessTokens = _request.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const query: any = _request.query;
				const params: any = _request.params;
				const data = await client.getListTimeline(params.id, limitToInt(query));
				reply.send(await Promise.all(data.data.map(async (status: Entity.Status) => await this.mastoconverter.convertStatus(status))));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async getConversations() {
		this.fastify.get('/v1/conversations', async (_request, reply) => {
			const BASE_URL = `${_request.protocol}://${_request.hostname}`;
			const accessTokens = _request.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const query: any = _request.query;
				const data = await client.getConversationTimeline(limitToInt(query));
				reply.send(data.data.map((conversation: Entity.Conversation) => convertConversation(conversation)));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async getList() {
		this.fastify.get<{ Params: { id: string } }>('/v1/lists/:id', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const params: any = _request.params;
				const data = await client.getList(params.id);
				reply.send(convertList(data.data));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async getLists() {
		this.fastify.get('/v1/lists', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const data = await client.getLists();
				reply.send(data.data.map((list: Entity.List) => convertList(list)));
			} catch (e: any) {
				console.error(e);
				return e.response.data;
			}
		});
	}

	public async getListAccounts() {
		this.fastify.get<{ Params: { id: string } }>('/v1/lists/:id/accounts', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const params: any = _request.params;
				const query: any = _request.query;
				const data = await client.getAccountsInList(params.id, query);
				reply.send(data.data.map((account: Entity.Account) => this.mastoconverter.convertAccount(account)));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async addListAccount() {
		this.fastify.post<{ Params: { id: string } }>('/v1/lists/:id/accounts', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const params: any = _request.params;
				const query: any = _request.query;
				const data = await client.addAccountsToList(params.id, query.accounts_id);
				reply.send(data.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async rmListAccount() {
		this.fastify.delete<{ Params: { id: string } }>('/v1/lists/:id/accounts', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const params: any = _request.params;
				const query: any = _request.query;
				const data = await client.deleteAccountsFromList(params.id, query.accounts_id);
				reply.send(data.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async createList() {
		this.fastify.post('/v1/lists', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const body: any = _request.body;
				const data = await client.createList(body.title);
				reply.send(convertList(data.data));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async updateList() {
		this.fastify.put<{ Params: { id: string } }>('/v1/lists/:id', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const body: any = _request.body;
				const params: any = _request.params;
				const data = await client.updateList(params.id, body.title);
				reply.send(convertList(data.data));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}

	public async deleteList() {
		this.fastify.delete<{ Params: { id: string } }>('/v1/lists/:id', async (_request, reply) => {
			try {
				const BASE_URL = `${_request.protocol}://${_request.hostname}`;
				const accessTokens = _request.headers.authorization;
				const client = getClient(BASE_URL, accessTokens);
				const params: any = _request.params;
				const data = await client.deleteList(params.id);
				reply.send({});
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				reply.code(401).send(e.response.data);
			}
		});
	}
}
