<script setup lang="ts">
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
	<header class="glassmorphism-nav fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-4/5 max-w-7xl">
		<div class="glassmorphism-container flex items-center justify-between h-16 px-6">
			<!-- Logo -->
			<NuxtLink href="/" class="flex items-center space-x-3 py-2">
				<Logo class="h-8 text-white drop-shadow-lg" />
				<span v-if="globals?.title" class="text-white font-bold text-lg tracking-tight drop-shadow-sm">{{ globals.title }}</span>
			</NuxtLink>

			<!-- Navigation -->
			<nav class="hidden md:flex md:space-x-1 lg:space-x-2" aria-label="Global">
				<NavigationMenuItem v-for="item in navigation?.items" :key="item.id" :item="item" />
			</nav>

			<!-- Actions -->
			<div class="flex items-center space-x-4">
				<DarkModeToggle class="hidden text-white/80 md:block hover:text-white transition-colors" bg="dark" />
				<div class="hidden md:flex items-center space-x-3">
					<UButton 
						to="/contact-us" 
						color="white" 
						variant="ghost" 
						size="sm"
						class="glass-button"
					>
						Let's Talk
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
		<NavigationMobileMenu v-if="navigation" :navigation="navigation" />
	</header>

	<!-- Spacer to prevent content from hiding behind fixed nav -->
	<div class="h-24"></div>
</template>

<style scoped>
.glassmorphism-nav {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 24px;
	transition: all 0.3s ease;
	box-shadow: 
		0 8px 32px rgba(0, 0, 0, 0.3),
		0 0 0 1px rgba(255, 255, 255, 0.05),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glassmorphism-nav:hover {
	background: rgba(0, 0, 0, 0.4);
	border-color: rgba(255, 255, 255, 0.2);
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
	background: rgba(139, 69, 19, 0.8);
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
