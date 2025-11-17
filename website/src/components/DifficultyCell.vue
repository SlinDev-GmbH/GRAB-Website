<script>
export default {
	props: {
		level: Object,
	},
	computed: {
		difficulty() {
			let difficulty = this.level?.statistics?.difficulty_string ?? 'unrated';
			if (difficulty === 'veryhard') difficulty = 'very hard';
			if (this.level.identifier === '29r46v7djliny6t4rzvq7:1654257963') difficulty = 'mountain';
			return difficulty;
		},
		id() {
			return this.difficulty.replaceAll(' ', '_');
		},
	},
};
</script>

<template>
	<div :class="`difficulty ${id}`">{{ difficulty }}</div>
</template>

<style scoped>
.difficulty {
	font-size: 0.8rem;
	white-space: nowrap;
	border-radius: 5rem;
	width: fit-content;
	padding-inline: 0.4rem;
}

@media screen and (max-width: 500px) {
	.difficulty {
		font-size: 0.6rem;
	}
}

.impossible {
	background-color: #7f007f;
}
.very_hard {
	background-color: #ea0000;
}
.hard {
	background-color: #f19400;
}
.medium {
	background-color: #e1c800;
}
.easy {
	background-color: #2bba84;
}
.unrated {
	background-color: #969696;
}
.mountain {
	background-color: #3b3b3b;
}
</style>
