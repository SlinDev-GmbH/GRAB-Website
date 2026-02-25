<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';
import * as THREE from 'three';
import { OrbitControls } from '../src/assets/OrbitContols.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { GetShopItemsRequest } from '../src/requests/shop/GetShopItemsRequest.js';
import { GetUserInfoRequest } from '../src/requests/users/GetUserInfoRequest.js';
import { Player } from '../src/assets/Player.js';
import PlayerToolsContent from './components/PlayerToolsContent.vue';
import LegalTerms from '../src/components/LegalTerms.vue';
import MeshUtils from '../src/assets/MeshUtils.js';

/* LIST
Future:
    player.head = new model(file);
    player.neck = new model(file);
    etc
Colors for changing player are reactive
Make attachment stuff better somehow, aka get gud pleb
Refind neat verision of code for player positioning
*/
export default {
	data() {
		return {
			itemsList: undefined,
			ToolsButtons: [
				{
					id: 'back',
					text: 'Back',
					onClick: () => {
						window.location.href = this.ToolsButtons[0].href;
					},
				},
				{ id: 'export-png', text: '↓ .png', onClick: this.exportPNG },
				{ id: 'export-glb', text: '↓ .glb', onClick: this.exportGLB },
			],
			playerInfo: undefined,
			playerItems: undefined,
			player: undefined,
			canvas: null,
			animationFrameId: null,
		};
	},
	components: {
		PlayerToolsContent,
		LegalTerms,
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isLoggedIn']),
	},

	created() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.lastTarget = new THREE.Vector3();

		const user_id = new URLSearchParams(window.location.search).get('user_id');
		this.ToolsButtons[0].href = `${window.location.origin}/levels?tab=tab_other_user&user_id=${user_id}`;
	},
	async mounted() {
		const items = await GetShopItemsRequest();
		this.itemsList = items;

		if (this.$route.query.user_id) {
			const userData = await GetUserInfoRequest(this.$route.query.user_id);
			this.playerInfo = userData;
			this.playerItems = userData.active_customizations.items;
		}

		const { scene, camera, renderer } = await this.initScene();
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		this.render();
		this.initPlayer();
		window.addEventListener('resize', this.resizeRenderer);
		this.$nextTick(() => {
			this.resizeRenderer();
		});
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.resizeRenderer);
		if (this.controls) {
			this.controls.dispose();
			this.controls = null;
		}
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	},

	methods: {
		//main player rendering
		async initScene() {
			THREE.ColorManagement.enabled = true;
			const canvas = document.getElementById('player-renderer');
			const { width, height } = this.getRendererSize();

			const renderer = new THREE.WebGLRenderer({
				canvas: canvas,
				alpha: true,
				transparent: true,
				antialias: true,
				preserveDrawingBuffer: true,
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(width, height, true);

			const scene = new THREE.Scene();

			const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
			directionalLight.position.set(0, 1, -2);

			const AmbientLight = new THREE.AmbientLight(0xffffff, 1.3);

			scene.add(AmbientLight, directionalLight);

			const camera = new THREE.PerspectiveCamera(55, width / height, 1, 1000);
			camera.position.set(0, 0, -2.8);

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.enablePan = false;
			controls.enableZoom = true;
			controls.maxPolarAngle = Math.PI;
			controls.addEventListener('start', () => (document.body.style.cursor = 'none'));
			controls.addEventListener('end', () => (document.body.style.cursor = 'auto'));
			controls.userData = {};
			this.controls = controls;

			return { scene, camera, renderer };
		},

		render() {
			if (this.controls && this.controls.userData && this.controls.userData.recenterPending) {
				this.updatePlayerTarget();
				this.controls.userData.recenterPending = false;
			}
			this.renderer.render(this.scene, this.camera);
			this.animationFrameId = requestAnimationFrame(this.render);
		},

		updatePlayerTarget() {
			if (!this.scene || !this.controls) {
				return;
			}

			const bounds = new THREE.Box3().setFromObject(this.scene);
			if (bounds.isEmpty()) {
				return;
			}

			const center = bounds.getCenter(new THREE.Vector3());
			if (!center.equals(this.lastTarget)) {
				this.controls.target.copy(center);
				this.lastTarget.copy(center);
				this.controls.update();
			}
		},

		getRendererSize() {
			const container = document.getElementById('player-container');
			if (!container) {
				return { width: 400, height: 500 };
			}

			const width = Math.max(1, Math.floor(container.clientWidth));
			const height = Math.max(1, Math.floor(container.clientHeight));
			return { width, height };
		},

		resizeRenderer() {
			if (!this.renderer || !this.camera) {
				return;
			}

			const { width, height } = this.getRendererSize();
			this.renderer.setSize(width, height, true);
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		},

		initPlayer() {
			this.scene.userData.primary_color = this.playerInfo.active_customizations.player_color_primary.color;
			this.scene.userData.secondary_color = this.playerInfo.active_customizations.player_color_secondary.color;

			this.player = new Player(import.meta.env.BASE_URL, this.scene, this.itemsList, this.playerItems, () => {
				if (this.controls) {
					this.controls.userData.recenterPending = true;
				}
			});
			if (this.controls) {
				this.controls.userData.recenterPending = true;
			}
			this.$nextTick(() => {
				this.resizeRenderer();
			});
		},

		/*
         :3     Ԑ: 
        */

		//tools:

		exportPNG() {
			const canvas = document.getElementById('player-renderer');
			const link = document.createElement('a');
			link.download = `${this.playerInfo.user_name}.png`;
			link.href = canvas.toDataURL();
			link.click();
		},
		exportGLB() {
			const exporter = new GLTFExporter();
			exporter.parse(
				this.scene,
				(glb) => {
					const blob = new Blob([glb], { type: 'model/gltf-binary' });
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `${this.playerInfo.user_name}.glb`;
					link.click();
					URL.revokeObjectURL(link.href);
				},
				(error) => console.error('An error happened', error),
				{ binary: true },
			);
		},

		changeColor(colorObject) {
			if (colorObject.page === 'primary') {
				this.scene.userData.primary_color = colorObject.color;
			}
			if (colorObject.page === 'secondary') {
				this.scene.userData.secondary_color = colorObject.color;
			}
			MeshUtils.applyColorsToAll(this.scene);
		},
	},
};
</script>

<template>
	<main id="player-viewer">
		<div class="user-tools">
			<button v-for="button in ToolsButtons" :key="button.id" :id="button.id" :href="button.href" @click="button.onClick">
				{{ button.text }}
			</button>
		</div>

		<div id="player-container">
			<canvas id="player-renderer"></canvas>
		</div>

		<PlayerToolsContent
			v-if="itemsList && player && playerInfo"
			:player="player"
			:playerInfo="playerInfo"
			:itemsList="itemsList"
			@changeColor="changeColor($event)"
		/>

		<canvas id="canvas"></canvas>

		<LegalTerms />
	</main>
</template>

<style scoped>
#player-viewer {
	background-image: linear-gradient(#84c1f0, #e1f6ff, #84c1f0);
	background-size: 100% 100%;
	background-repeat: no-repeat;
	background-attachment: fixed;

	font-family: 'Nunito', sans-serif;
	font-weight: 700;

	display: flex;
	justify-content: flex-start;
	align-items: stretch;
	height: 100dvh;
	width: 100vw;
	flex-direction: row;
	flex-wrap: nowrap;
	margin: 0;
	column-gap: 24px;
	padding: 0 12px 0 0;
	overflow: hidden;
}

.user-tools {
	position: fixed;
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	top: 10px;
	left: 10px;
	z-index: 1000;
}

.user-tools button {
	width: 130px;
	height: 30px;
	font-size: 15px;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	border-radius: 15px;
	box-sizing: border-box;
	text-decoration: none;
	background-color: #00bc87;
	color: #fff;
	text-align: center;
	border: none;
	cursor: pointer;
	padding-block: 6px;
}

#back {
	background-color: red;
}

#player-container {
	flex: 1 1 0;
	min-width: 340px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

#player-renderer {
	z-index: 2;
	width: 100%;
	height: 100%;
}

@media screen and (max-width: 1001px) {
	#player-viewer {
		padding: 12px 12px 0;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
	}

	.user-tools {
		position: static;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 8px 12px 0;
		width: 100%;
		z-index: 2;
	}

	.user-tools button {
		width: 120px;
	}

	#player-container {
		width: 100%;
		max-width: 700px;
		min-width: 0;
		height: 36svh;
		flex: 0 0 auto;
	}

	#player-renderer {
		width: 100%;
		height: 100%;
	}
}

#canvas {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	pointer-events: none;
}

::-webkit-scrollbar {
	width: 0;
}
</style>
