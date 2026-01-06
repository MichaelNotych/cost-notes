<script setup></script>

<template>
	<div class="px-4 py-6 max-w-2xl mx-auto w-full">
		<header class="flex justify-between items-center mb-8">
			<RouterLink to="/" class="text-sky-600 font-bold text-lg">CN</RouterLink>
			<nav>
				<ul>
					<li>
						<RouterLink to="/categories" class="uppercase text-sm transition-colors hover:text-sky-600"
							>Categories</RouterLink
						>
					</li>
				</ul>
			</nav>
		</header>
		<main>
			<RouterView />
		</main>
	</div>
</template>

<style>
body {
	@apply bg-gray-950 text-gray-100;
	margin: 0;
	padding: 0;
}
</style>
