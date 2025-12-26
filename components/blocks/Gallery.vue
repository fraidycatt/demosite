<script setup lang="ts">
import type { BlockGallery, BlockGalleryFile, File } from '~/types';

const props = defineProps<{
	data: BlockGallery;
}>();

const galleryItems = computed(() => {
	return props.data.gallery_items?.map((item: BlockGalleryFile) => {
		return item.directus_files_id as File;
	});
});
</script>

<template>
	<BlockContainer :fullWidth="true" class="min-h-screen flex items-center justify-center px-6 lg:px-16">
		<TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
		<TypographyHeadline v-if="data.headline" :content="data.headline" size="lg" />
		<VGallery v-if="galleryItems && galleryItems.length > 0" :items="galleryItems" />
	</BlockContainer>
</template>
