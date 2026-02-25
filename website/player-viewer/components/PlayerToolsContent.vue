<script>
import CosmeticCard from './CosmeticCard.vue';
import NavBar from './NavBar.vue';
import ColorPallete from './ColorPallete.vue';

import * as THREE from 'three';

export default {
	data() {
		return {
			navDirectory: undefined,
			selectedPrimaryColor: null,
			selectedSecondaryColor: null,
			filterChoice: 'All',
			pageColorIndices: {},
		};
	},
	created() {
		this.scenes = [];
		this.divRenderer = null;
		this.boundSetupUI = this.setupUI.bind(this);
	},
	async mounted() {
		this.setupUI();

		this.navDirectory = 'items';

		const divRenderer = await this.initScene();
		this.divRenderer = divRenderer;
		window.addEventListener('resize', this.boundSetupUI);
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.boundSetupUI);
	},
	components: {
		CosmeticCard,
		NavBar,
		ColorPallete,
	},
	props: {
		playerInfo: {
			type: Object,
			required: true,
		},
		player: {
			type: Object,
			required: false,
		},
		itemsList: {
			type: Object,
			required: true,
		},
	},

	computed: {
		isItemsSelected() {
			return this.navDirectory === 'items';
		},
		isColorTypeSelected() {
			return this.navDirectory === 'primary' || this.navDirectory === 'secondary';
		},
	},
	methods: {
		async initScene() {
			const divRenderer = new THREE.WebGLRenderer({
				canvas: this.canvas,
				alpha: true,
				transparent: true,
				antialias: true,
			});
			divRenderer.setPixelRatio(window.devicePixelRatio);
			divRenderer.setAnimationLoop(this.divRenderLoop);
			return divRenderer;
		},

		setupUI() {
			this.canvas = document.getElementById('canvas');
			if (!this.canvas) {
				console.error('Canvas element not found');
				return;
			}
			let page = document.getElementById('player-viewer');
			let positionInfo = page.getBoundingClientRect();
			let height2 = positionInfo.height;
			let width2 = positionInfo.width;
			this.canvas.style.height = `${height2}px`;
			this.canvas.style.width = `${width2}px`;
		},
		updateSize() {
			let width = this.canvas.clientWidth;
			let height = this.canvas.clientHeight;
			if (this.canvas.width !== width || this.canvas.height != height) {
				this.divRenderer.setSize(width, height, false);
			}
		},

		divRenderLoop() {
			this.updateSize();
			this.divRenderer.clear();
			this.divRenderer.setScissorTest(true);
			this.scenes.forEach((scene) => {
				let element = scene.userData.element;
				let rect = element.getBoundingClientRect();

				let cardList = document.getElementById('card-list');
				let cardListRect = cardList.getBoundingClientRect();

				if (rect.bottom <= cardListRect.top || rect.top >= cardListRect.bottom) {
					return;
				}

				let camera = scene.userData.camera;

				let width = rect.right - rect.left;
				let height = rect.bottom - rect.top;
				let left = rect.left;
				let bottom = this.divRenderer.domElement.clientHeight - rect.bottom;
				let scissorTop = Math.max(0, cardListRect.top - rect.top);
				let scissorBottom = Math.max(0, rect.bottom - cardListRect.bottom);

				let adjustedHeight = height - (scissorTop + scissorBottom);

				if (adjustedHeight <= 0) return;

				let adjustedBottom = bottom + scissorBottom;

				this.divRenderer.setViewport(left, bottom, width, height);
				this.divRenderer.setScissor(left, adjustedBottom, width, adjustedHeight);

				this.divRenderer.render(scene, camera);
			});
			this.divRenderer.setScissorTest(false);
		},
		handleColorSelected(page, color_index, color) {
			this.pageColorIndices[page] = color_index;
			this.$emit('changeColor', { page: page, color: color });
		},
	},
};
</script>
<template>
	<div id="customizations">
		<div id="categories-content">
			<NavBar @UpdateNav="navDirectory = $event" @changeSelection="filterChoice = $event" :isItemsSelected="isItemsSelected" />

			<div class="card-list" id="card-list" v-show="isItemsSelected">
				<CosmeticCard
					v-if="player"
					v-for="(item, itemName) in itemsList"
					:itemName="itemName"
					:itemObject="item"
					:player="player"
					:filterChoice="filterChoice"
					@updateSceneList="scenes.push($event)"
					:secondaryColor="playerInfo.active_customizations.player_color_secondary.color"
					:primaryColor="playerInfo.active_customizations.player_color_primary.color"
				/>
			</div>

			<ColorPallete
				v-if="isColorTypeSelected"
				:pageColorIndices="pageColorIndices"
				:page="navDirectory"
				@color-selected="handleColorSelected($event.page, $event.index, $event.color)"
			/>
		</div>
		<div id="content"></div>
	</div>
</template>
<style scoped>
#customizations {
	width: min(620px, 38vw);
	min-width: 420px;
	height: 100%;
	min-height: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
}

@media screen and (max-width: 1001px) {
	#customizations {
		width: 100%;
		min-width: 0;
		height: 52svh !important;
	}
}

#categories-content {
	display: flex;
	flex-direction: column;
	width: 100%;
	flex: 1 1 auto;
	min-height: 0;
	padding: 0;
	position: relative;
}

.card-list {
	width: 100%;
	flex: 1 1 auto;
	min-height: 0;
	height: auto;
	margin-bottom: 0;
	overflow-y: scroll;
	display: grid;
	gap: 1rem;
	padding: 1rem;
	grid-template-columns: 1fr 1fr;
	scrollbar-width: none;
}
</style>
