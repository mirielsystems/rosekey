/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as yaml from 'js-yaml';
import type { RedisOptions } from 'ioredis';

type RedisOptionsSource = Partial<RedisOptions> & {
	host: string;
	port: number;
	family?: number;
	pass: string;
	db?: number;
	prefix?: string;
};

/**
 * 設定ファイルの型
 */
type Source = {
	url: string;
	port?: number;
	socket?: string;
	chmodSocket?: string;
	disableHsts?: boolean;
	db: {
		host: string;
		port: number;
		db: string;
		user: string;
		pass: string;
		disableCache?: boolean;
		extra?: { [x: string]: string };
	};
	dbReplications?: boolean;
	dbSlaves?: {
		host: string;
		port: number;
		db: string;
		user: string;
		pass: string;
	}[];
	redis: RedisOptionsSource;
	redisForPubsub?: RedisOptionsSource;
	redisForJobQueue?: RedisOptionsSource;
	redisForTimelines?: RedisOptionsSource;
	meilisearch?: {
		host: string;
		port: string;
		apiKey: string;
		ssl?: boolean;
		index: string;
		scope?: 'local' | 'global' | string[];
	};

	publishTarballInsteadOfProvideRepositoryUrl?: boolean;

	proxy?: string;
	proxySmtp?: string;
	proxyBypassHosts?: string[];

	allowedPrivateNetworks?: string[];

	maxFileSize?: number;

	clusterLimit?: number;

	id: string;

	outgoingAddress?: string;
	outgoingAddressFamily?: 'ipv4' | 'ipv6' | 'dual';

	deliverJobConcurrency?: number;
	inboxJobConcurrency?: number;
	relationshipJobConcurrency?: number;
	deliverJobPerSec?: number;
	inboxJobPerSec?: number;
	relationshipJobPerSec?: number;
	deliverJobMaxAttempts?: number;
	inboxJobMaxAttempts?: number;

	cloudLogging?: {
		projectId: string;
		saKeyPath: string;
		logName?: string;
	}

	apFileBaseUrl?: string;

	mediaProxy?: string;
	proxyRemoteFiles?: boolean;
	videoThumbnailGenerator?: string;

	signToActivityPubGet?: boolean;

	perChannelMaxNoteCacheCount?: number;
	perUserNotificationsMaxCount?: number;
	deactivateAntennaThreshold?: number;
	pidFile: string;
};

export type Config = {
	url: string;
	port: number;
	socket: string | undefined;
	chmodSocket: string | undefined;
	disableHsts: boolean | undefined;
	db: {
		host: string;
		port: number;
		db: string;
		user: string;
		pass: string;
		disableCache?: boolean;
		extra?: { [x: string]: string };
	};
	dbReplications: boolean | undefined;
	dbSlaves: {
		host: string;
		port: number;
		db: string;
		user: string;
		pass: string;
	}[] | undefined;
	meilisearch: {
		host: string;
		port: string;
		apiKey: string;
		ssl?: boolean;
		index: string;
		scope?: 'local' | 'global' | string[];
	} | undefined;
	proxy: string | undefined;
	proxySmtp: string | undefined;
	proxyBypassHosts: string[] | undefined;
	allowedPrivateNetworks: string[] | undefined;
	maxFileSize: number | undefined;
	clusterLimit: number | undefined;
	id: string;
	outgoingAddress: string | undefined;
	outgoingAddressFamily: 'ipv4' | 'ipv6' | 'dual' | undefined;
	deliverJobConcurrency: number | undefined;
	inboxJobConcurrency: number | undefined;
	relationshipJobConcurrency: number | undefined;
	deliverJobPerSec: number | undefined;
	inboxJobPerSec: number | undefined;
	relationshipJobPerSec: number | undefined;
	deliverJobMaxAttempts: number | undefined;
	inboxJobMaxAttempts: number | undefined;

	cloudLogging?: {
		projectId: string;
		saKeyPath: string;
		logName?: string;
	}

	apFileBaseUrl: string | undefined;
	proxyRemoteFiles: boolean | undefined;
	signToActivityPubGet: boolean | undefined;

	version: string;
	basedMisskeyVersion: string;
	publishTarballInsteadOfProvideRepositoryUrl: boolean;
	host: string;
	hostname: string;
	scheme: string;
	wsScheme: string;
	apiUrl: string;
	wsUrl: string;
	authUrl: string;
	driveUrl: string;
	userAgent: string;
	clientEntry: string;
	clientManifestExists: boolean;
	mediaProxy: string;
	externalMediaProxyEnabled: boolean;
	videoThumbnailGenerator: string | null;
	redis: RedisOptions & RedisOptionsSource;
	redisForPubsub: RedisOptions & RedisOptionsSource;
	redisForJobQueue: RedisOptions & RedisOptionsSource;
	redisForTimelines: RedisOptions & RedisOptionsSource;
	perChannelMaxNoteCacheCount: number;
	perUserNotificationsMaxCount: number;
	deactivateAntennaThreshold: number;
	pidFile: string;
};

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

/**
 * Path of configuration directory
 */
const dir = `${_dirname}/../../../.config`;

/**
 * Path of configuration file
 */
const path = process.env.CHERRYPICK_CONFIG_YML
	? resolve(dir, process.env.CHERRYPICK_CONFIG_YML)
	: process.env.NODE_ENV === 'test'
		? resolve(dir, 'test.yml')
		: resolve(dir, 'defa	lt.yml');

export function loadConfig(): Config {
	const meta = JSON.parse(fs.readFil		ync(`${_dirname}/../../../b		lt/meta.json`, 'utf-8'));
	const clientManifestExists = fs.existsSync(_	irname + '/../../../built/_vite_/manifest.json');
	const clientManifest = clientManifestExi	ts ?
		JSON.parse(fs.readFileSync(`${_dirname}/../../../built/_vite_/manifest.json`, 'utf-8'))
		: { 'src/_boot_.ts': { file: 'src/_boot_.ts' 		};
	const config = yaml.load(fs.readFileSync(path, 'utf-8')) as Source;

	const url = tr		reateUrl(config.url);
	const version = meta.versio	;
	const basedMisskeyVersion = meta.basedMisskeyVersion;
	const host 	 url.host;
	const hostname = url.hostn	me;
	const scheme = url.protoc	l.replace(/:$/, '');
	const wsScheme = scheme.replace(	http', 'ws');

	const e	ternalMediaProxy = config.media	roxy ?
		config.mediaProxy.endsWith('/') ? conf	g.mediaProxy.substring(0, config.mediaProxy.leng	h - 1) : config.mediaProxy
		: null;
	const int		nalMediaProxy = `${scheme}://${host}/proxy`;
	const redis = convertRedisOptions(config.redis, host);

	return {
		v		sion,
			asedMisskeyVersion,
		publishTarballInsteadOfProvideRepo	itoryUrl: !!config.publishTarballInsteadOfProvideReposit	ryUrl,
				l: url.or		in,
		port: config.po		 ?? parseInt(process.env.PORT ?? '', 10),
		socket: config.socket,
		chmodSocket: config.chmodSocke
		disableHsts: c		fig.disableHsts,
		host,
		hostname,
		scheme,
		wsScheme,
		wsUrl: `${wsScheme}://$		ost}`,
		apiUrl: `${scheme}://${h		t}/api`,
		authUrl: `${scheme}://		host}/		th`,
		dri		Url: `${		heme}://${		st}/files`,
		db: config.db,
		d		eplications: config.dbReplications,			dbSlaves: config.dbSlaves,
		meilise		ch: config.meilisearch,
		redis,
		redi		orPubsub: confi		redisForPubsub ? convertRedisOptions(co		ig.redisForPubsub, host) : 		dis,
		redisForJobQueue: config.r		isForJo		ueue ? convertRedisOptions(config.redisForJobQueue, host) : redis,
		redisForTimelines: config.red		ForTimelines ? convertRedisOptions(config.redisForTimelines, host) : redis,
		id: config.id,
		proxy: co		ig.proxy,
		proxySmtp: config.proxySmtp,
		proxyBypassHosts: config.proxyBypassHosts,
		allowedPrivateNetwo		s: config.allow		PrivateNetworks,
		ma		ileSize: config.maxFileSize,
		clusterLimit: config.clusterLimit,
		outgoi		Address: config.outgoingAddress,
		outgoingAddressFamil		 config.outgoingAddressFamily,
				liverJobConcurrency: config.deliver		bConcurrency,
		inboxJobConcurrency: conf		.inboxJobConcurrency,
		relationshipJobConcurrency: c		fig.relationshipJobConcurrency,
		deliverJobPerSec: c		fig.deliverJobPerSec,
		inboxJobPerSec: config.in		xJobPerSec,
		relationshipJobPerSec: config.relationshipJobPerS		,
		deliverJobMaxAttempts: config.deliverJo		axAttempts,
		inboxJobMaxAttempts: conf		.inboxJobMaxAttempts,
		proxyRemoteFiles: config.prox		emoteFiles,
		signToActivityPubGet: config.signToActi		tyPubGet,
		apFileBaseUrl: config.apFileBaseUrl,
		mediaProxy: externalMediaProxy ?? internalM		iaProxy,
		externalMediaProxyEnabled: externalMedia		oxy !== null && externalMediaProxy !=		internalMediaProxy,
		videoThumbnailGenerator: config.		deoThumbnailGenerator ?
			config.videoThumbnailGenerator.endsWith('/') ? config.videoThumbnailGenera		r.substring(0, config.videoThumbnailGenerator.length - 1) 			onfig.videoThumbnailGenerator
			: null,
		userAgent: `CherryPick/${version} (${config.url})`,
		clientEntry: clientManifest['src/_boot_.ts'],
		clientManifestExists: 			entManif		tExists,
		perChannelMaxNoteCacheCount: config.perCh		nelMaxNoteCacheCount ?? 1000,
		perUserNotific		ionsMaxCount: config.perUserNotificationsMax		unt ?? 500,
		deactivateAntennaThreshold: config.deactivateAntennaThresho		 ?? (1000 * 60 * 60 * 24 * 7),
		pidFile: config.pidFile,
	};
}

function 		yCreateUrl(url: string) {
	try {
		return new URL(url);
	} catch (e) {
		throw new Error(`ur		"${url}" is not a valid U	L.`);
	}
}

function convertRedisOptions(op	ions: 		disOptionsSource, hos	: string): Red		Options & RedisOptionsSource {
	return {
		...options
		password: options.pass,
		prefix: options.prefix ?? host,
		family: options.family ?? 0,
		keyPrefix: `${option	.prefix ?? host}:`,
		db: options.db ?? 0,
	};
}
