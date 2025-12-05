<script>
export default {
	props: {
		value: String,
	},
	data() {
		return {
			copied: false,
		};
	},
	methods: {
		copy() {
			navigator.clipboard.writeText(this.value);
			this.copied = true;
			setTimeout(() => {
				this.copied = false;
			}, 2000);
		},
	},
};
</script>

<template>
	<div class="user-id">
		<span>{{ value }}</span>
		<button class="copy" @click="copy">
			<img v-show="!copied" src="./../assets/icons/copy.svg" />
			<img v-show="copied" src="./../assets/icons/copied.svg" />
		</button>
	</div>
</template>

<style scoped>
.user-id {
	font-style: italic;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	gap: 5px;
}
.user-id span {
	opacity: 0.5;
}
.copy {
	cursor: pointer;
	background-color: transparent;
	transition: transform 0.2s ease-in-out;
	display: grid;
	place-content: center;
	padding: 3px;
	border-radius: 5px;
}
.copy:hover {
	background-color: var(--hover);
}
.copy img {
	height: 1rem;
	width: 1rem;
}
</style>
