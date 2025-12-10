<script>
export default {
	props: {
		currentTab: String,
		isLoading: Boolean,
		currentValue: String,
	},

	methods: {
		applyFilter(filter) {
			if (this.isLoading) {
				return;
			}
			const previous = document.querySelector('.active-difficulty-filter');
			if (previous) {
				previous.classList.remove('active-difficulty-filter');
				if (previous.id == `filter-${filter}`) {
					this.$emit('filter', '');
					return;
				}
			}
			document.getElementById(`filter-${filter}`).classList.add('active-difficulty-filter');
			this.$emit('filter', filter);
		},
	},

	mounted() {
		if (this.currentValue) {
			document.getElementById(`filter-${this.currentValue}`).classList.add('active-difficulty-filter');
		}
	},

	emits: ['filter'],
};
</script>

<template>
	<div class="difficulty-filter-container">
		<div class="filter" id="filter-unrated" @click="applyFilter('unrated')">unrated</div>
		<div class="filter" id="filter-easy" @click="applyFilter('easy')">easy</div>
		<div class="filter" id="filter-medium" @click="applyFilter('medium')">medium</div>
		<div class="filter" id="filter-hard" @click="applyFilter('hard')">hard</div>
		<div class="filter" id="filter-veryhard" @click="applyFilter('veryhard')">very hard</div>
		<div class="filter" id="filter-impossible" @click="applyFilter('impossible')">impossible</div>
	</div>
</template>

<style scoped>
.difficulty-filter-container {
	width: 100%;
	margin-top: 10px;
	border-radius: 10px;
	padding-left: 10px;
	padding-right: 10px;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 7px;
	flex-wrap: wrap;
	padding-block: 4px;
}
.filter {
	font-size: 0.9rem;
	border-radius: var(--rad);
	cursor: pointer;
	padding: 0.1rem 0.6rem;
	color: var(--light);
	background-color: var(--diff-color);
	border: 2px solid transparent;
	transition: transform 0.3s linear;
	transform: scale(1);
}
.filter:hover {
	transform: scale(1.1);
}
.active-difficulty-filter {
	border: 2px solid var(--light);
}
@media screen and (max-width: 630px) {
	.filter {
		font-size: 0.8rem;
		padding: 0.05rem 0.5rem;
	}
}

#filter-unrated {
	--diff-color: #969696;
}
#filter-easy {
	--diff-color: #2bba84;
}
#filter-medium {
	--diff-color: #e1c800;
}
#filter-hard {
	--diff-color: #f19400;
}
#filter-veryhard {
	--diff-color: #ea0000;
}
#filter-impossible {
	--diff-color: #7f007f;
}
</style>
