<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isFloating = ref(true); // Always floating header

function onScroll() {
	// Disabled - keeping header always floating
	// isFloating.value = window.scrollY > 40;
}

onMounted(() => {
	window.addEventListener('scroll', onScroll);
});
onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
});
const { theme, globals } = useAppConfig();

const {
	data: navigation,
	pending,
	error,
} = await useAsyncData(
	'mainNavigation',
	() => {
		return useDirectus(
			readItem('navigation', 'main', {
				fields: [
					{
						items: [
							'id',
							'has_children',
							'title',
							'icon',
							'image',
							'label',
							'type',
							'url',
							{
								page: ['permalink', 'title'],
								children: [
									'id',
									'title',
									'has_children',
									'icon',
									'image',
									'label',
									'type',
									'url',
									{
										page: ['permalink', 'title'],
									},
								],
							},
						],
					},
				],
			}),
		);
	},
	{
		transform: (data) => data,
	},
);
</script>
<template>
	<header :class="[
		    'glassmorphism-nav fixed z-50 transition-all duration-300 left-1/2 transform -translate-x-1/2',
			isFloating
				? 'w-4/5 max-w-7xl rounded-2xl mt-2 pt-0'
				: 'w-full max-w-none rounded-none mt-0 pt-0 top-0'
		]">
		<div class="flex transition-all duration-300">
			<div :class="['glassmorphism-container flex justify-between ml-6 mr-6 items-center h-16 w-full transition-all duration-300', isFloating ? 'justify-between px-6' : 'justify-center px-0']">
				<!-- Logo -->
				<NuxtLink
					href="/"
					:class="[
						'flex items-center space-x-3 py-2 transition-all duration-300',
						isFloating ? 'logo-anim' : 'logo-anim'
					]"
					style="will-change: transform, left;"
				>
					<Logo class="h-8 text-white drop-shadow-lg" />
					
				</NuxtLink>

				<!-- Navigation -->
				<nav
					class="hidden md:flex md:space-x-1 lg:space-x-2 transition-all duration-300"
					aria-label="Global"
				>
					<NavigationMenuItem v-for="item in navigation?.items" :key="item.id" :item="item" />
				</nav>

				<!-- Actions -->
				<div
					class="flex items-center space-x-4 transition-all duration-300"
				>
					<DarkModeToggle class="hidden text-white/80 md:block hover:text-white transition-colors" bg="dark" />
					<div class="hidden md:flex items-center space-x-3">
						<UButton 
							to="/contact-us" 
							color="white" 
							variant="ghost" 
							size="sm"
							class="glass-button"
						>
							Chat With Us
						</UButton>
						<UButton 
							to="/portal" 
							color="primary" 
							size="sm"
							class="glass-button-primary"
						>
							Login
						</UButton>
					</div>
				</div>
			</div>
		</div>
	<NavigationMobileMenu v-if="navigation" :navigation="navigation" />
	</header>

</template>

<style scoped>

/* The base nav style, morphs with classes */
.glassmorphism-nav {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	background: rgba(0, 0, 0, 0.3);
	border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	box-shadow:
		0 8px 32px rgba(0, 0, 0, 0.3),
		0 0 0 1px rgba(255, 255, 255, 0.05),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glassmorphism-nav:hover {
	background: rgba(0, 0, 0, 0.4);
	border-bottom-color: rgba(255, 255, 255, 0.2);
	box-shadow:
		0 12px 40px rgba(0, 0, 0, 0.4),
		0 0 0 1px rgba(255, 255, 255, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glassmorphism-container {
	position: relative;
}

.glassmorphism-container::before {
	content: '';
	position: absolute;
	top: 0;
	left: -10%;
	right: -10%;
	bottom: 0;
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0.0) 0%,
		rgba(255, 255, 255, 0.03) 50%,
		rgba(255, 255, 255, 0.0) 100%
	);
	border-radius: 24px;
	z-index: -1;
}

.glass-button {
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
	font-family: var(--font-futuruRegular);
}

.glass-button:hover {
	background: rgba(255, 255, 255, 0.2);
	border-color: rgba(255, 255, 255, 0.3);
	transform: translateY(-1px);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.glass-button-primary {
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	transition: all 0.3s ease;
}

.glass-button-primary:hover {
	background: rgba(139, 69, 19, 0.9);
	transform: translateY(-1px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Mobile responsiveness for floating bar */
@media (max-width: 768px) {
	.glassmorphism-nav {
		width: 95%;
		top: 12px;
	}
	
	.glassmorphism-container {
		padding-left: 16px;
		padding-right: 16px;
	}
}
</style>
