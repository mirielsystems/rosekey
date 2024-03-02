/*
 * SPDX-FileCopyrightText: dakkar and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
*/

import { ref, Ref } from 'vue';
import * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import { defaultStore } from '@/store.js';
import { MenuItem } from '@/types/menu.js';

/*
	this script should eventually contain all Sharkey-specific bits of
	boosting and quoting that we would otherwise have to replicate in
	`{M,S}kNote{,Detailed,Sub}.vue`
 */

export type Visibility = 'public' | 'home' | 'followers' | 'specified';

export function smallerVisibility(a: Visibility | string, b: Visibility | string): Visibility {
	if (a === 'specified' || b === 'specified') return 'specified';
	if (a === 'followers' || b === 'followers') return 'followers';
	if (a === 'home' || b === 'home') return 'home';
	// if (a === 'public' || b === 'public')
	return 'public';
}

export function visibilityIsAtLeast(a: Visibility | string, b: Visibility | string): boolean {
	return smallerVisibility(a, b) === b;
}

export function boostMenuItems(appearNote: Ref<Misskey.entities.Note>, renote: (v: Visibility, l: boolean) => void): MenuItem[] {
	const localOnly = ref(defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly);
	const effectiveVisibility = (
		appearNote.value.channel?.isSensitive
			? smallerVisibility(appearNote.value.visibility, 'home')
			: appearNote.value.visibility
	);

	const menuItems: MenuItem[] = [];
	if (visibilityIsAtLeast(effectiveVisibility, 'public')) {
		menuItems.push({
			type: 'button',
			icon: 'ph-globe-hemisphere-west ph-bold ph-lg',
			text: i18n.ts._visibility['public'],
			action: () => {
				renote('public', localOnly.value);
			},
		} as MenuItem);
	}
	if (visibilityIsAtLeast(effectiveVisibility, 'home')) {
		menuItems.push({
			type: 'button',
			icon: 'ph-house ph-bold ph-lg',
			text: i18n.ts._visibility['home'],
			action: () => {
				renote('home', localOnly.value);
			},
		} as MenuItem);
	}
	if (visibilityIsAtLeast(effectiveVisibility, 'followers')) {
		menuItems.push({
			type: 'button',
			icon: 'ph-lock ph-bold ph-lg',
			text: i18n.ts._visibility['followers'],
			action: () => {
				renote('followers', localOnly.value);
			},
		} as MenuItem);
	}

	return [
		...menuItems,
		{
			type: 'switch',
			icon: 'ph-planet ph-bold ph-lg',
			text: i18n.ts._timelines.local,
			ref: localOnly,
		} as MenuItem,
	];
}
