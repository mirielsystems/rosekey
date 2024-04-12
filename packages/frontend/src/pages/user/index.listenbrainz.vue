<template>
<MkContainer :foldable="true">
	<template #header>
		<i class="ti ti-headphones" style="margin-right: 0.5em"></i>Music
	</template>

	<div style="padding: 8px">
		<div class="flex">
			<template v-if="loading">
				<p>Loading...</p>
			</template>
			<template v-else-if="listenbrainz.title">
				<a v-if="listenbrainz.title" :href="listenbrainz.musicbrainzurl">{{ buttonLabel }}
					<img v-if="listenbrainz.img" class="image" :src="listenbrainz.img" :alt="listenbrainz.title"/>
					<div class="flex flex-col items-start">
						<p class="text-sm font-bold">Now Playing: {{ listenbrainz.title }}</p>
						<p class="text-xs font-medium">{{ listenbrainz.artist }}</p>
					</div>
				</a>
				<a v-if="listenbrainz.listenbrainzurl" :href="listenbrainz.listenbrainzurl">
					<div class="playicon">
						<i class="ti ti-player-play-filled"></i>
					</div>
				</a>
				<button :disabled="loading || sending" class="share-button" @click="sendMusicNote">{{ buttonLabel }}</button>
			</template>
			<template v-else>
				<p>Data not available</p>
			</template>
		</div>
	</div>
</MkContainer>
</template>
  
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import * as misskey from 'cherrypick-js';
import MkContainer from '@/components/MkContainer.vue';
import { misskeyApi } from '@/scripts/misskey-api.js';

const props = withDefaults(
	defineProps<{
    user: misskey.entities.User;
  }>(),
	{},
);

const listenbrainz = ref({ title: '', artist: '', lastlisten: '', img: '', musicbrainzurl: '', listenbrainzurl: '' });
const loading = ref(false);
const sending = ref(false);
const sentSuccessfully = ref(false);
const sendFailed = ref(false);

let timerId: number | null = null;

const getNowPlayingData = async () => {
	if (props.user.listenbrainz) {
		loading.value = true; // データ取得中の状態に設定
		try {
			const response = await fetch(`https://api.listenbrainz.org/1/user/${props.user.listenbrainz}/playing-now`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			if (data.payload.listens && data.payload.listens.length !== 0) {
				const title: string = data.payload.listens[0].track_metadata.track_name;
				const artist: string = data.payload.listens[0].track_metadata.artist_name;
				const lastlisten: string = data.payload.listens[0].playing_now;
				const img = 'https://coverartarchive.org/img/big_logo.svg';
				listenbrainz.value.title = title;
				listenbrainz.value.artist = artist;
				listenbrainz.value.lastlisten = lastlisten;
				// Get additional data asynchronously
				await getLMData(title, artist);
			} else {
				// If no data available, reset listenbrainz
				resetListenbrainz();
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(error.message);
			}
		} finally {
			loading.value = false; // データ取得が完了したので、ローディング状態を解除
		}
	}
};

const getLMData = async (title: string, artist: string) => {
	try {
		const response = await fetch(`https://api.listenbrainz.org/1/metadata/lookup/?artist_name=${artist}&recording_name=${title}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await response.json();
		if (!data.recording_name) {
			return;
		}
		const titler: string = data.recording_name;
		const artistr: string = data.artist_credit_name;
		const img: string = data.release_mbid ? `https://coverartarchive.org/release/${data.release_mbid}/front-250` : 'https://coverartarchive.org/img/big_logo.svg';
		const musicbrainzurl: string = data.recording_mbid ? `https://musicbrainz.org/recording/${data.recording_mbid}` : '#';
		const listenbrainzurl: string = data.recording_mbid ? `https://listenbrainz.org/player?recording_mbids=${data.recording_mbid}` : '#';
		listenbrainz.value.title = titler;
		listenbrainz.value.artist = artistr;
		listenbrainz.value.img = img;
		listenbrainz.value.musicbrainzurl = musicbrainzurl;
		listenbrainz.value.listenbrainzurl = listenbrainzurl;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
		}
	}
};

const resetListenbrainz = () => {
	listenbrainz.value.title = '';
	listenbrainz.value.artist = '';
	listenbrainz.value.lastlisten = '';
	listenbrainz.value.img = '';
	listenbrainz.value.musicbrainzurl = '';
	listenbrainz.value.listenbrainzurl = '';
};

onMounted(() => {
	// Call immediately
	getNowPlayingData();
	// Polling interval
	timerId = window.setInterval(getNowPlayingData, 15000);
});

// コンポーネントがアンマウントされるときに実行
onBeforeUnmount(() => {
	// ポーリングを停止
	if (timerId) {
		clearInterval(timerId);
	}
});

const sendMusicNote = () => {
	sending.value = true;
	misskeyApi('notes/create', {
		text: `${listenbrainz.value.title} を再生中\nアーティスト名: ${listenbrainz.value.artist}\nURL: ${listenbrainz.value.listenbrainzurl}`,
	}).then(message => {
		sentSuccessfully.value = true;
		setTimeout(() => {
			sentSuccessfully.value = false;
		}, 3000); // 3秒後に送信完了状態を解除
	}).catch(err => {
		console.error(err);
		sendFailed.value = true; // 送信失敗のフラグを設定
	}).finally(() => {
		sending.value = false;
	});
};

const buttonLabel = computed(() => {
	return sending.value ? '送信中...' : sentSuccessfully.value ? '送信完了' : sendFailed.value ? '送信失敗' : '音楽を共有';
});

// sending.valueが変更された場合にsentSuccessfully.valueをリセットする
watch(sending, (newValue) => {
	if (!newValue) {
		sentSuccessfully.value = false;
		sendFailed.value = false;
	}
});
</script>

<style lang="scss" scoped>
.flex {
	display: flex;
	align-items: center;
}
.flex a {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.image {
	height: 4.8rem;
	margin-right: 0.7rem;
}
.items-start {
	align-items: flex-start;
}
.flex-col {
	display: flex;
	flex-direction: column;
}
.text-sm {
	font-size: 0.875rem;
	margin: 0;
	margin-bottom: 0.3rem;
}
.font-bold {
	font-weight: 700;
}
.text-xs {
	font-size: 0.75rem;
	margin: 0;
}
.font-medium {
	font-weight: 500;
}
.playicon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	font-size: 1.7rem;
	padding-left: 3rem;
}
.share-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.share-button:hover {
  background-color: #0056b3;
}
</style>
