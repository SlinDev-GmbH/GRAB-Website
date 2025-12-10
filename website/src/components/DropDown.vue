<template>
	<div class="dropdown">
		<button @click="toggleDropdown" class="dropdown-button">
			<slot name="button-content">{{ selection }}</slot>
		</button>
		<div v-if="isOpen" class="dropdown-content" :style="this.flip ? 'left: 0;' : 'right: 0;'">
			<div
				v-for="option in options"
				:key="option"
				:class="'dropdown-item' + (option == selection ? ' selected' : '')"
				@click="selectOption(option)"
			>
				{{ option }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			isOpen: false,
			selection: undefined,
		};
	},
	created() {
		this.selection = this.defaultChoice;
	},
	props: {
		options: {
			type: Array,
			required: true,
		},
		defaultChoice: {
			type: String,
			required: true,
		},
		flip: {
			type: Boolean,
			default: false,
			required: false,
		},
	},
	methods: {
		toggleDropdown() {
			this.isOpen = !this.isOpen;
		},
		selectOption(option) {
			this.selection = option;
			this.isOpen = false;
			this.$emit('changeSelection', this.selection);
		},
		handleClickOutside(event) {
			if (!this.$el.contains(event.target)) {
				this.isOpen = false;
			}
		},
	},

	watch: {
		defaultChoice: {
			handler(value, old) {
				if (this.selection == old) {
					this.selection = value;
				}
			},
			immediate: true,
		},
	},
	mounted() {
		document.addEventListener('click', this.handleClickOutside);
	},
	unmounted() {
		document.removeEventListener('click', this.handleClickOutside);
	},
};
</script>

<style scoped>
.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown-button {
	padding: 8px 40px;
	cursor: pointer;
	background-color: var(--button);
	border-radius: 15px;
}

.dropdown-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: absolute;
	background-color: var(--background);
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	z-index: 1;
	border-radius: 10px;
	padding: 3px;
	gap: 2px;
}

.dropdown-item {
	padding: 0.2rem 0.4rem;
	cursor: pointer;
	background-color: var(--background);
	width: 100%;
	border-radius: 10px;
}

.dropdown-item.selected {
	background-color: var(--alt);
}

.dropdown-item:hover {
	background-color: var(--hover);
}
</style>
