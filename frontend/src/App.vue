<script setup></script>

<template>
	<header class="container">
		<nav>
			<ul>
				<li><RouterLink to="/"><strong>Cost Notes</strong></RouterLink></li>
			</ul>
			<ul>
				<li><RouterLink to="/categories">Categories</RouterLink></li>
			</ul>
		</nav>
	</header>
	<main class="container">
		<RouterView />
	</main>
</template>

<style scoped></style>
