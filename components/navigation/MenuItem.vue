<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import type { RouteLocationRaw } from '#vue-router';
import type { NavigationItem } from '~~/types';

const route = useRoute();
const { $directus } = useNuxtApp();

const props = defineProps<{
	item: NavigationItem;
}>();

const popover: Ref<any> = ref(null);

// Smart grid layout calculator
const getSmartLayout = (childrenCount: number) => {
	switch (childrenCount) {
		case 1:
			return { rows: [[0]], maxWidth: 400 }; // 1 full width
		case 2:
			return { rows: [[0, 1]], maxWidth: 600 }; // 2 columns
		case 3:
			return { rows: [[0], [1, 2]], maxWidth: 600 }; // 1 full + 2 bottom
		case 4:
			return { rows: [[0, 1], [2, 3]], maxWidth: 600 }; // 2x2
		case 5:
			return { rows: [[0, 1, 2], [3, 4]], maxWidth: 800 }; // 3 top + 2 bottom
		case 6:
			return { rows: [[0, 1, 2], [3, 4, 5]], maxWidth: 800 }; // 3x2
		case 7:
			return { rows: [[0, 1], [2, 3, 4], [5, 6]], maxWidth: 800 }; // 2-3-2
		case 8:
			return { rows: [[0, 1, 2, 3], [4, 5, 6, 7]], maxWidth: 900 }; // 4x2
		case 9:
			return { rows: [[0, 1, 2], [3, 4, 5], [6, 7, 8]], maxWidth: 800 }; // 3x3
		default:
			// For 10+ children, use 4 columns with multiple rows
			const rows: number[][] = [];
			for (let i = 0; i < childrenCount; i += 4) {
				rows.push(Array.from({ length: Math.min(4, childrenCount - i) }, (_, j) => i + j));
			}
			return { rows, maxWidth: 900 };
	}
};

// Computed layout based on children count
const smartLayout = computed(() => {
	const childrenCount = (props.item.children as NavigationItem[])?.length || 0;
	return getSmartLayout(childrenCount);
});

// Function to get image URL from Directus
const getDirectusImageUrl = (imageId: string | null, transforms?: string) => {
	if (!imageId) return null;
	
	try {
		const baseUrl = $directus.url.replace('/graphql', '').replace('/items', '');
		const transformQuery = transforms ? `?${transforms}` : '';
		return `${baseUrl}/assets/${imageId}${transformQuery}`;
	} catch (error) {
		console.warn('Error generating Directus image URL:', error);
		return null;
	}
};

// Fallback images for items without uploaded images
const getFallbackImage = (index: number) => {
	const fallbacks = [
		'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format',
		'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&auto=format',
		'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format',
		'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&auto=format',
		'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop&auto=format',
		'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&auto=format'
	];
	return fallbacks[index % fallbacks.length];
};

// Get the final image URL (Directus or fallback)
const getCardImage = (childItem: NavigationItem, index: number) => {
	const directusImage = getDirectusImageUrl(
		childItem.image as string, 
		'width=400&height=300&fit=cover&quality=80'
	);
	return directusImage || getFallbackImage(index);
};

// If route changes close the menu
watch(
	() => route.path,
	() => {
		return popover.value?.();
	},
);
</script>
<template>
	<NuxtLink
		v-if="!item.has_children"
		:href="getNavItemUrl(item) as RouteLocationRaw"
		class="glass-menu-link"
		exact-active-class="glass-menu-link-active"
		:target="item.open_in_new_tab ? '_blank' : '_self'"
	>
		{{ item.title }}
	</NuxtLink>

	<Popover v-else v-slot="{ close }" class="relative" as="div">
		<PopoverButton
			:ref="
				() => {
					popover = close;
				}
			"
			class="glass-menu-link group"
		>
			{{ item.title }}
			<Icon 
				name="heroicons:chevron-down" 
				class="flex-none w-4 h-4 ml-2 text-white/60 transition-transform duration-200 group-hover:text-white group-data-[headlessui-state~=open]:rotate-180" 
				aria-hidden="true" 
			/>
		</PopoverButton>

		<transition
			enter-active-class="transition duration-300 ease-out"
			enter-from-class="translate-y-4 opacity-0 scale-95"
			enter-to-class="translate-y-0 opacity-100 scale-100"
			leave-active-class="transition duration-200 ease-in"
			leave-from-class="translate-y-0 opacity-100 scale-100"
			leave-to-class="translate-y-4 opacity-0 scale-95"
		>
			<PopoverPanel
				class="absolute z-50 mt-6 -left-20 transform"
				:style="{ width: `${smartLayout.maxWidth}px` }"
			>
				<div class="glass-dropdown">
					<div class="p-6 space-y-4">
						<!-- Render each row -->
						<div 
							v-for="(row, rowIndex) in smartLayout.rows" 
							:key="`row-${rowIndex}`"
							class="grid gap-4"
							:class="{
								'grid-cols-1': row.length === 1,
								'grid-cols-2': row.length === 2,
								'grid-cols-3': row.length === 3,
								'grid-cols-4': row.length === 4
							}"
						>
							<!-- Render each child in the row -->
							<NuxtLink
								v-for="childIndex in row"
								:key="(item.children as NavigationItem[])[childIndex].id"
								:href="getNavItemUrl((item.children as NavigationItem[])[childIndex]) as RouteLocationRaw"
								class="image-card group"
								:class="{
									'col-span-full': row.length === 1 && smartLayout.rows.length > 1
								}"
							>
								<!-- Background Image -->
								<div 
									class="image-card-bg"
									:style="{ backgroundImage: `url(${getCardImage((item.children as NavigationItem[])[childIndex], childIndex)})` }"
								></div>
								
								<!-- Loading State -->
								<div 
									v-if="(item.children as NavigationItem[])[childIndex].image && !getDirectusImageUrl((item.children as NavigationItem[])[childIndex].image as string)"
									class="image-card-loading"
								>
									<Icon name="heroicons:photo" class="w-8 h-8 text-white/50" />
								</div>
								
								<!-- Overlay -->
								<div class="image-card-overlay">
									<!-- Content -->
									<div class="image-card-content">
										<div class="flex items-center space-x-3 mb-3">
											<div 
												v-if="(item.children as NavigationItem[])[childIndex].icon"
												class="icon-container"
											>
												<Icon
													:name="convertIconName((item.children as NavigationItem[])[childIndex].icon as string) as string"
													class="w-6 h-6 text-white"
												/>
											</div>
										</div>
										<h3 class="image-card-title">
											{{ (item.children as NavigationItem[])[childIndex].title }}
										</h3>
										<p v-if="(item.children as NavigationItem[])[childIndex].label" class="image-card-description">
											{{ (item.children as NavigationItem[])[childIndex].label }}
										</p>
									</div>
									
									<!-- Hover arrow -->
									<div class="image-card-arrow">
										<Icon name="heroicons:arrow-right" class="w-5 h-5" />
									</div>
								</div>
							</NuxtLink>
						</div>
					</div>
				</div>
			</PopoverPanel>
		</transition>
	</Popover>
</template>

<style scoped lang="postcss">
	.glass-menu-link {
		@apply relative text-white/80 hover:text-white transition-all duration-300 font-medium py-3 px-4 inline-flex items-center outline-none rounded-lg;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		font-family: 'Futuru-Regular', sans-serif !important;
	}

.glass-menu-link:hover {
	background: rgba(255, 255, 255, 0.1);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.glass-menu-link-active {
	background: rgba(255, 255, 255, 0.2);
	color: white;
}

.glass-dropdown {
	backdrop-filter: blur(30px);
	-webkit-backdrop-filter: blur(30px);
	background: rgba(0, 0, 0, 0.7);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 16px;
	box-shadow: 
		0 25px 50px rgba(0, 0, 0, 0.5),
		0 0 0 1px rgba(255, 255, 255, 0.08),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.image-card {
	@apply relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer;
	height: 120px; /* Fixed height for consistency */
}

/* Full width cards for single items */
.image-card.col-span-full {
	height: 140px; /* Slightly taller for full-width cards */
}

.image-card-bg {
	@apply absolute inset-0;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	transition: transform 0.3s ease;
}

.image-card:hover .image-card-bg {
	transform: scale(1.05);
}

.image-card-loading {
	@apply absolute inset-0 flex items-center justify-center;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
}

.image-card:hover {
	transform: translateY(-2px) scale(1.02);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.image-card-overlay {
	@apply absolute inset-0 p-4 flex flex-col justify-between;
	background: linear-gradient(
		135deg,
		rgba(0, 0, 0, 0.7) 0%,
		rgba(0, 0, 0, 0.4) 50%,
		rgba(0, 0, 0, 0.8) 100%
	);
	backdrop-filter: blur(2px);
	-webkit-backdrop-filter: blur(2px);
}

.image-card:hover .image-card-overlay {
	background: linear-gradient(
		135deg,
		rgba(0, 0, 0, 0.8) 0%,
		rgba(0, 0, 0, 0.5) 50%,
		rgba(0, 0, 0, 0.9) 100%
	);
}

.image-card-content {
	@apply flex-1;
}

.icon-container {
	@apply flex items-center justify-center w-10 h-10 rounded-lg border border-white/20;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
}

.image-card-title {
	@apply text-white font-bold text-lg leading-tight mb-2;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	font-family: 'Futuru-Regular', sans-serif;
}

.image-card-description {
	@apply text-white/80 text-sm leading-snug;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
	font-family: 'Futuru-Regular', sans-serif;
}

.image-card-arrow {
	@apply self-end opacity-0 transform translate-x-2 transition-all duration-300 text-white;
}

.image-card:hover .image-card-arrow {
	@apply opacity-100 transform translate-x-0;
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
	.glass-dropdown {
		width: 90vw !important;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.grid {
		grid-template-columns: repeat(2, 1fr) !important;
	}
	
	.image-card {
		height: 100px;
	}
	
	.image-card.col-span-full {
		grid-column: 1 / -1;
		height: 120px;
	}
}
</style>

<style lang="postcss">
/* Unscoped - targets PopoverButton buttons specifically */
button.glass-menu-link {
	font-family: 'Futuru-Regular', sans-serif !important;
}
</style>
