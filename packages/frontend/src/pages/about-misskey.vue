<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :contentMax="600" :marginMin="20">
			<div class="_gaps_m znqjceqz">
				<div v-panel class="about">
					<div ref="containerEl" class="container" :class="{ playing: easterEggEngine != null }">
						<img src="/client-assets/about-icon.png" alt="" class="icon" draggable="false" @load="iconLoaded" @click="gravity"/>
						<div class="cherrypick">Rosekey</div>
						<div class="version" @click="whatIsNewCherryPick">v{{ version }}</div>
						<div class="version" style="font-size: 11px;" @click="whatIsNewMisskey">v{{ basedMisskeyVersion }} (Based on Misskey)</div>
						<span v-for="emoji in easterEggEmojis" :key="emoji.id" class="emoji" :data-physics-x="emoji.left" :data-physics-y="emoji.top" :class="{ _physics_circle_: !emoji.emoji.startsWith(':') }">
							<MkCustomEmoji v-if="emoji.emoji[0] === ':'" class="emoji" :name="emoji.emoji" :normal="true" :noStyle="true"/>
							<MkEmoji v-else class="emoji" :emoji="emoji.emoji" :normal="true" :noStyle="true"/>
						</span>
					</div>
					<button v-if="thereIsTreasure" class="_button treasure" @click="getTreasure"><img src="/fluent-emoji/1f3c6.png" class="treasureImg"></button>
				</div>
				<div style="text-align: center;">
					{{ i18n.ts._aboutMisskey.about }}<br><a href="https://misskey-hub.net/docs/about-misskey/" target="_blank" class="_link">{{ i18n.ts.learnMore }}</a>
				</div>
				<div v-if="$i != null" style="text-align: center;">
					<MkButton primary rounded inline @click="iLoveCherryPick">I <Mfm text="$[jelly ❤]"/> #CherryPick</MkButton>
				</div>
				<FormSection>
					<template #label>Rosekey</template>
					<div class="_gaps_s">
						<FormLink to="https://github.com/freelynetwork/rosekey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutMisskey.source }}
							<template #suffix>GitHub</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._aboutMisskey.projectMembers }}</template>
					<div :class="$style.contributors">
						<a href="https://github.com/noridev" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/11006910?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@noridev
								<span :class="$style.contributorClient">
									<span :class="$style.cherry">Cherry</span><span :class="$style.pick">Pick</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/syuilo" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/4439005?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@syuilo
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/tamaina" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/7973572?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@tamaina
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/acid-chicken" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/20679825?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@acid-chicken
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/kakkokari-gtyih" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/67428053?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@kakkokari-gtyih
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/tai-cha" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/40626578?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@tai-cha
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/samunohito" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/46447427?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@samunohito
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
						<a href="https://github.com/anatawa12" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/22656849?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@anatawa12
								<span :class="$style.contributorClient">
									<span :class="$style.misskey">Misskey</span>
								</span>
							</span>
						</a>
					</div>
				</FormSection>
				<!--
				<FormSection>
					<template #label>Special thanks</template>
					<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));grid-gap:24px;align-items:center;">
						<div>
							<a style="display: inline-block;" class="masknetwork" title="Mask Network" href="https://mask.io/" target="_blank"><img style="width: 100%;" src="https://misskey-hub.net/sponsors/masknetwork.png" alt="Mask Network"></a>
						</div>
						<div>
							<a style="display: inline-block;" class="xserver" title="XServer" href="https://www.xserver.ne.jp/" target="_blank"><img style="width: 100%;" src="https://misskey-hub.net/sponsors/xserver.png" alt="XServer"></a>
						</div>
						<div>
							<a style="display: inline-block;" class="skeb" title="Skeb" href="https://skeb.jp/" target="_blank"><img style="width: 100%;" src="https://misskey-hub.net/sponsors/skeb.svg" alt="Skeb"></a>
						</div>
					</div>
				</FormSection>
				-->
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, computed } from 'vue';
import { version, basedMisskeyVersion } from '@/config.js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import { physics } from '@/scripts/physics.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { defaultStore } from '@/store.js';
import * as os from '@/os.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { claimAchievement, claimedAchievements } from '@/scripts/achievements.js';
import { $i } from '@/account.js';

const thereIsTreasure = ref($i && !claimedAchievements.includes('foundTreasure'));

let easterEggReady = false;
const easterEggEmojis = ref<{
	id: string,
	top: number,
	left: number,
	emoji: string
}[]>([]);
const easterEggEngine = ref<{ stop: () => void } | null>(null);
const containerEl = shallowRef<HTMLElement>();

const whatIsNewCherryPick = () => {
	window.open(`https://github.com/kokonect-link/cherrypick/blob/develop/CHANGELOG_CHERRYPICK.md#${version.replace(/\./g, '')}`, '_blank');
};

const whatIsNewMisskey = () => {
	window.open(`https://github.com/misskey-dev/misskey/blob/develop/CHANGELOG.md#${basedMisskeyVersion.replace(/\./g, '')}`, '_blank');
};

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl.value.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.value.push({
			id: i.toString(),
			top: -(128 + (Math.random() * 256)),
			left: (Math.random() * containerWidth),
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine.value = physics(containerEl.value);
}

function iLoveCherryPick() {
	os.post({
		initialText: 'I $[jelly ❤] #Rosekey',
		instant: true,
	});
}

function getTreasure() {
	thereIsTreasure.value = false;
	claimAchievement('foundTreasure');
}

function donateCherryPick(ev: MouseEvent) {
	os.popupMenu([{
		text: 'Patreon',
		icon: 'ti ti-pig-money',
		action: () => {
			window.open('https://www.patreon.com/noridev', '_blank');
		},
	}, {
		text: 'Paypal',
		icon: 'ti ti-pig-money',
		action: () => {
			window.open('https://www.paypal.me/noridev', '_blank');
		},
	}, {
		text: 'Toss (Korea)',
		icon: 'ti ti-pig-money',
		action: () => {
			window.open('https://toss.me/noridev', '_blank');
		},
	}], ev.currentTarget ?? ev.target);
}

onBeforeUnmount(() => {
	if (easterEggEngine.value) {
		easterEggEngine.value.stop();
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.aboutMisskey,
	icon: null,
}));
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		border-radius: var(--radius);

		> .treasure {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			margin: 0 auto;
			width: min-content;

			> .treasureImg {
				width: 25px;
				vertical-align: bottom;
			}
		}

		> .container {
			position: relative;
			text-align: center;
			padding: 16px;

			&.playing {
				&, * {
					user-select: none;
				}

				* {
					will-change: transform;
				}

				> .emoji {
					visibility: visible;
				}
			}

			> .icon {
				display: block;
				width: 80px;
				margin: 0 auto;
				border-radius: 16px;
				position: relative;
				z-index: 1;
			}

			> .cherrypick {
				margin: 0.75em auto 0 auto;
				width: max-content;
				position: relative;
				z-index: 1;
			}

			> .version {
				margin: 0 auto;
				width: max-content;
				opacity: 0.5;
				position: relative;
				z-index: 1;

        &:hover {
          text-decoration: underline;
          color: var(--link);
        }
			}

			> .emoji {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				visibility: hidden;

				> .emoji {
					pointer-events: none;
					font-size: 24px;
					width: 24px;
				}
			}
		}
	}
}
</style>

<style lang="scss" module>
.contributors {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.contributor {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--buttonHoverBg);
	}

	&.active {
		color: var(--accent);
		background: var(--buttonHoverBg);
	}
}

.contributorAvatar {
	width: 30px;
	border-radius: 100%;
}

.contributorUsername {
	margin-left: 12px;
}

.contributorClient {
	display: block;
	font-size: 11px;
	font-weight: bold;

	> .misskey {
		color: #86b300;
	}

	> .cherry {
		color: var(--cherry);
	}

	> .pick {
		color: var(--pick);
	}
}

.patronsWithIcon {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.patronWithIcon {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;
}

.patronIcon {
	width: 24px;
	border-radius: 100%;
}

.patronName {
	margin-left: 12px;
}

.main {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  background: var(--buttonBg);
  border-radius: 6px;
  font-size: 0.9em;

  &:hover {
    text-decoration: none;
    background: var(--buttonHoverBg);
  }

  &.active {
    color: var(--accent);
    background: var(--buttonHoverBg);
  }
}

.icon {
  margin-right: 0.75em;
  flex-shrink: 0;
  text-align: center;
  color: var(--fgTransparentWeak);

  &:empty {
    display: none;

    & + .text {
      padding-left: 4px;
    }
  }
}

.text {
  flex-shrink: 1;
  white-space: normal;
  padding-right: 12px;
  text-align: center;
}

.suffix {
  margin-left: auto;
  opacity: 0.7;
  white-space: nowrap;
}
</style>
