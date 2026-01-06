<script setup></script>

<template>
	<header>
		<nav>
			<ul>
				<li>
					<RouterLink to="/"><strong>Cost Notes</strong></RouterLink>
				</li>
			</ul>
			<ul>
				<li><RouterLink to="/categories">Categories</RouterLink></li>
			</ul>
		</nav>
	</header>
	<main>
		<RouterView />
	</main>
</template>

<style scoped>
	main {
		flex: 1;

		display: flex;
		flex-direction: column;
	}
</style>
