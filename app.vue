<script setup lang="ts">
import { borderRadiusMap } from '~/theme';

const appConfig = useAppConfig();
const { globals, theme, ui } = appConfig;
const { fileUrl } = useFiles();

// Merge Directus theme with local theme
if (globals?.theme) {
	if (globals.theme.primary) {
		theme.primary = globals.theme.primary;
		ui.primary = globals.theme.primary;
	}
	if (globals.theme.gray) {
		theme.gray = globals.theme.gray;
		ui.gray = globals.theme.gray;
	}
	if (globals.theme.borderRadius) {
		theme.borderRadius = globals.theme.borderRadius;
	}
}

// JSON-LD
useSchemaOrg([
	defineOrganization({
		name: globals?.title ?? 'Demo Site',
		logo: globals?.logo_on_light_bg ? fileUrl(globals?.logo_on_light_bg) : '/logos/agencyos.png',
		sameAs: () => {
			const socialLinks = globals?.social_links ?? [];
			return socialLinks.map((link) => link.url);
		},
	}),
]);

useHead({
	style: [
		{
			id: 'border-radius',
			innerHTML: `:root {${Object.entries(borderRadiusMap[theme.borderRadius])
				.map(([key, value]) => `--border-radius-${key}: ${value};`)
				.join('\n')}\n${Object.entries(theme.fonts)
				.map(([key, value]) => `--font-${key}: ${value};`)
				.join('\n')}`,
		},
	],
});
</script>
<template>
	<NuxtLayout>
		<NuxtLoadingIndicator
			color="repeating-linear-gradient(to right,#FF99DD
    0%,#94a3b8 100%)"
		/>
		<NuxtPage />
	</NuxtLayout>
</template>
