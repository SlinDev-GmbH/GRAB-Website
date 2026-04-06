<script>
import { useUserStore } from '@/stores/user';
import { mapState } from 'pinia';

import { LevelLoader } from '../assets/LevelLoader.js';
import * as THREE from 'three';

import { PrefabBlockRequest } from '../requests/prefabs/PrefabBlockRequest.js';
import { ModerationActionRequest } from '../requests/users/ModerationActionRequest.js';
import { PrefabDeleteRequest } from '../requests/prefabs/PrefabDeleteRequest.js';
import { DownloadPrefabRequest } from '../requests/prefabs/DownloadPrefabRequest.js';

import CopyButton from './CopyButton.vue';

export default {
	components: {
		CopyButton,
	},

	props: {
		prefabsList: Array,
		userID: String,
	},

	data() {
		return {
			prefabs: [],
			container: null,
			currentlyBlocking: -1,
			currentlyDeleting: -1,
			isDragging: false,
			draggedIdentifier: null,
			lastMousePos: { x: 0, y: 0 },
			startMousePos: { x: 0, y: 0 },
			hasEngagedRotation: false,
			wasDraggingBeforeUp: false,
		};
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isSuperModerator']),
	},

	methods: {
		async loadPrefab(prefab) {
			const { data, identifier } = prefab;
			if (!data) return { ...prefab, keys_only: true };

			if (!window._prefabCache) window._prefabCache = {};
			if (window._prefabCache[identifier]) return window._prefabCache[identifier];

			const binaryString = atob(data);
			const uint8Array = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				uint8Array[i] = binaryString.charCodeAt(i);
			}

			const result = await window._levelLoader.load(uint8Array);

			const bounds = new THREE.Box3().setFromObject(result.scene);
			const size = new THREE.Vector3();
			bounds.getSize(size);
			const center = new THREE.Vector3();
			bounds.getCenter(center);
			
			result.scene.userData.size = size;
			result.scene.userData.center = center;

			window._prefabCache[identifier] = result;
			return result;
		},

		async reloadPrefabs() {
			if (!window._levelLoader)
				window._levelLoader = new LevelLoader({
					sky: false,
					lights: true,
					text: true,
					triggers: true,
					code: true,
					sound: true,
					light: true,
					sublevels: true,
					static: true,
				});

			const existingData = new Map();
			(this.prefabs || []).forEach((p) => {
				const id = p.identifier || p.customMetadata?.identifier;
				if (id && p.threeJsData) {
					existingData.set(id, p.threeJsData);
				}
			});

			this.prefabs = (this.prefabsList || []).map((p) => {
				const id = p.identifier || p.customMetadata?.identifier;
				return {
					...p,
					identifier: id,
					threeJsData: id ? existingData.get(id) || null : null,
					isLoading3d: false,
				};
			});

			this.$nextTick(() => {
				this.renderPrefabs();
			});
		},

		renderPrefabs() {
			const canvas = this.$refs.canvas;
			if (!canvas) return;
			this.container = this.$refs.prefabsViewer;
			if (!this.container) return;

			if (!this.renderer) {
				this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
				this.renderer.setClearColor(0x000000, 0);
				this.renderer.setPixelRatio(window.devicePixelRatio);
			}

			this.replacePrefabs();

			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
			}

			const clock = new THREE.Clock();
			const animate = () => {
				this.animationFrameId = requestAnimationFrame(animate);
				
				const delta = clock.getDelta();
				const containerRect = this.container.getBoundingClientRect();
				const containerWidth = this.container.clientWidth;
				const containerHeight = this.container.clientHeight;
				const frustumSize = this.frustumSize || 5;
				const aspect = containerWidth / containerHeight;

				this.scene.children.forEach(obj => obj.userData.foundThisFrame = false);

				const prefabItems = this.$refs.prefabItems || [];
				this.prefabs.forEach((prefabState, index) => {
					const itemElement = prefabItems[index];
					if (!itemElement) return;

					const itemRect = itemElement.getBoundingClientRect();
					const isVisible = (
						itemRect.bottom > containerRect.top &&
						itemRect.top < containerRect.bottom
					);

					if (isVisible && !prefabState.threeJsData && !prefabState.isLoading3d) {
						if (prefabState.data) {
							prefabState.isLoading3d = true;
							this.loadPrefab(prefabState).then((data) => {
								prefabState.threeJsData = data;
								prefabState.isLoading3d = false;
							});
						} else if (prefabState.identifier) {
							prefabState.isLoading3d = true;
							DownloadPrefabRequest(this.userID, prefabState.identifier).then((binaryData) => {
								if (binaryData) {
									const base64 = btoa(String.fromCharCode(...new Uint8Array(binaryData)));
									prefabState.data = base64;
									if (prefabState.keys_only) delete prefabState.keys_only;
									this.loadPrefab(prefabState).then((data) => {
										prefabState.threeJsData = data;
										prefabState.isLoading3d = false;
									});
								} else {
									prefabState.isLoading3d = false;
								}
							});
						}
					}

					let object = this.scene.children.find((obj) => obj.userData.identifier === prefabState.identifier);

					if (isVisible && prefabState.threeJsData) {
						if (!object) {
							const threeJsData = prefabState.threeJsData;
							const clonedScene = threeJsData.scene.clone();
							object = new THREE.Group();
							object.add(clonedScene);
							object.userData.identifier = prefabState.identifier;
							this.scene.add(object);
						}

						const threeJsData = prefabState.threeJsData;
						const prefabScene = threeJsData.scene;
						const center = prefabScene.userData.center;
						const size = prefabScene.userData.size;
						const clonedScene = object.children[0];

						if (center && size && clonedScene) {
							const maxDim = Math.max(size.x, size.y, size.z);
							const targetWidth = frustumSize * aspect * (itemRect.width / containerWidth);
							const targetHeight = frustumSize * (itemRect.height / containerHeight);
							const baseScale = Math.min(targetWidth, targetHeight) / Math.max(maxDim, 0.01);
							
							const zoom = object.userData.zoom || 1.0;
							const finalScale = baseScale * zoom;

							clonedScene.scale.set(finalScale * 0.7, finalScale * 0.7, finalScale * 0.7);
							clonedScene.position.set(-center.x * finalScale, -center.y * finalScale + maxDim * finalScale * 0.05, -center.z * finalScale);
						}

						object.userData.foundThisFrame = true;
						object.userData.element = itemElement;

						if (!object.userData.manuallyRotated) {
							object.rotation.y += 1 * delta;
							if (Math.abs(object.rotation.x) > 0.01) {
								object.rotation.x += (0 - object.rotation.x) * (delta * 2);
							} else {
								object.rotation.x = 0;
							}
						}

						const x = (itemRect.left - containerRect.left + itemRect.width / 2) / containerWidth - 0.5;
						const y = (itemRect.top - containerRect.top + itemRect.height / 2) / containerHeight - 0.5;
						object.position.set(x * frustumSize * aspect, -y * frustumSize, 0);
						object.visible = true;
					} else if (object) {
						object.visible = false;
					}
				});

				this.scene.children.forEach(obj => {
					if (!obj.userData.foundThisFrame) {
						obj.visible = false;
					}
				});

				this.renderer.render(this.scene, this.camera);
			};
			animate();

			window.addEventListener('resize', this.onWindowResize);
		},

		replacePrefabs() {
			if (!this.container) this.container = this.$refs.prefabsViewer;
			if (!this.container) return;
			if (!this.scene) this.scene = new THREE.Scene();

			const currentIdentifiers = new Set((this.prefabs || []).map((p) => p.identifier));
			const toRemove = [];
			this.scene.children.forEach((child) => {
				if (child instanceof THREE.Group && child.userData.identifier) {
					if (!currentIdentifiers.has(child.userData.identifier)) {
						toRemove.push(child);
					}
				}
			});

			toRemove.forEach((child) => {
				child.traverse((c) => {
					if (c.geometry) c.geometry.dispose();
					if (c.material) {
						if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
						else c.material.dispose();
					}
				});
				this.scene.remove(child);
			});

			const containerWidth = this.container.clientWidth;
			const containerHeight = this.container.clientHeight;

			if (this.renderer) {
				this.renderer.setSize(containerWidth, containerHeight);
			}

			const frustumSize = 5;
			this.frustumSize = frustumSize;
			const aspect = containerWidth / containerHeight;
			
			if (!this.camera) {
				this.camera = new THREE.OrthographicCamera(
					(frustumSize * aspect) / -2,
					(frustumSize * aspect) / 2,
					frustumSize / 2,
					frustumSize / -2,
					0.1,
					1000,
				);
				this.camera.position.z = frustumSize;
			} else {
				this.camera.left = (frustumSize * aspect) / -2;
				this.camera.right = (frustumSize * aspect) / 2;
				this.camera.top = frustumSize / 2;
				this.camera.bottom = frustumSize / -2;
				this.camera.updateProjectionMatrix();
			}
		},

		onWindowResize() {
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(() => {
				if (this.container && this.renderer) {
					this.replacePrefabs();
				}
			}, 100);
		},

		async downloadPrefab(index) {
			const prefab = this.prefabs[index];
			if (!prefab) return;

			const prefabData = prefab.data;
			const identifier = prefab.identifier;

			if (prefabData) {
				const binaryString = atob(prefabData);
				const uint8Array = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					uint8Array[i] = binaryString.charCodeAt(i);
				}
				let fileBlob = new Blob([uint8Array], { type: 'application/x-protobuf' });
				let url = window.URL.createObjectURL(fileBlob);
				let a = document.createElement('a');
				a.href = url;
				a.download = 'prefab_' + this.userID + '_' + identifier + '.level';
				a.click();
			} else if (identifier) {
				const data = await DownloadPrefabRequest(this.userID, identifier);
				if (data) {
					const formattedBuffer = new Uint8Array(data);
					const fileBlob = new Blob([formattedBuffer], { type: 'application/x-protobuf' });
					const url = window.URL.createObjectURL(fileBlob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'prefab_' + this.userID + '_' + identifier + '.level';
					a.click();
				}
			}
		},

		async deletePrefab(index) {
			if (this.currentlyDeleting === index) {
				const prefabID = this.prefabs[index]?.identifier;
				if (prefabID) {
					if (await PrefabDeleteRequest(this.userID, prefabID)) {
						this.prefabs[index].blocked = true;
					}
				}
			} else {
				this.currentlyDeleting = index;
			}
		},

		async blockPrefab(index) {
			if (this.currentlyBlocking === index) {
				const prefabID = this.prefabs[index]?.identifier;
				if (prefabID) {
					if (await PrefabBlockRequest(this.userID, prefabID)) {
						await ModerationActionRequest(this.userID, 'user_editor');
						this.prefabs[index].blocked = true;
					}
				}
			} else {
				this.currentlyBlocking = index;
			}
		},

		handleMouseDown(event, index) {
			const prefabState = this.prefabs[index];
			if (!prefabState) return;
			
			this.isDragging = true;
			this.draggedIdentifier = prefabState.identifier;

			const prefabGroup = this.scene.children.find(
				(obj) => obj instanceof THREE.Group && obj.userData.identifier === this.draggedIdentifier
			);
			if (prefabGroup && prefabGroup.userData.resetTimer) {
				clearTimeout(prefabGroup.userData.resetTimer);
			}

			this.lastMousePos = {
				x: event.clientX || (event.touches ? event.touches[0].clientX : 0),
				y: event.clientY || (event.touches ? event.touches[0].clientY : 0),
			};
			this.startMousePos = { ...this.lastMousePos };
			this.hasEngagedRotation = false;
			this.wasDraggingBeforeUp = false;
			this.startPinchDistance = 0;
			this.initialZoomDuringPinch = 1.0;
		},

		handleMouseMove(event) {
			if (!this.isDragging || !this.draggedIdentifier) return;

			const touches = event.touches || [];
			const isPinch = touches.length === 2;

			const currentX = event.clientX || (touches[0] ? touches[0].clientX : 0);
			const currentY = event.clientY || (touches[0] ? touches[0].clientY : 0);

			const prefabGroup = this.scene.children.find(
				(obj) => obj instanceof THREE.Group && obj.userData.identifier === this.draggedIdentifier
			);

			if (isPinch && prefabGroup) {
				const dx = touches[0].clientX - touches[1].clientX;
				const dy = touches[0].clientY - touches[1].clientY;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (!this.startPinchDistance) {
					this.startPinchDistance = dist;
					this.initialZoomDuringPinch = prefabGroup.userData.zoom || 1.0;
				} else {
					const ratio = dist / this.startPinchDistance;
					prefabGroup.userData.zoom = Math.max(0.1, Math.min(10, this.initialZoomDuringPinch * ratio));
				}
				this.lastMousePos = { x: currentX, y: currentY };
				return;
			}

			const deltaX = currentX - this.lastMousePos.x;
			const deltaY = currentY - this.lastMousePos.y;

			const totalDeltaX = Math.abs(currentX - this.startMousePos.x);
			const totalDeltaY = Math.abs(currentY - this.startMousePos.y);

			if (!this.hasEngagedRotation) {
				const threshold = 5;
				if (totalDeltaX > threshold || totalDeltaY > threshold) {
					if (totalDeltaY > totalDeltaX * 1.5 && event.touches) {
						this.isDragging = false;
						this.draggedIdentifier = null;
						this.wasDraggingBeforeUp = true;
						setTimeout(() => { this.wasDraggingBeforeUp = false; }, 100);
						return;
					}
					this.hasEngagedRotation = true;
				} else {
					return;
				}
			}

			if (event.touches) {
				if (event.cancelable) event.preventDefault();
			}

			if (prefabGroup) {
				prefabGroup.rotation.y += deltaX * 0.01;
				prefabGroup.rotation.x += deltaY * 0.01;
				prefabGroup.userData.manuallyRotated = true;
			}

			this.lastMousePos = { x: currentX, y: currentY };
		},

		handleMouseUp() {
			if (this.draggedIdentifier) {
				const identifier = this.draggedIdentifier;
				const prefabGroup = this.scene.children.find(
					(obj) => obj instanceof THREE.Group && obj.userData.identifier === identifier
				);
				if (prefabGroup) {
					prefabGroup.userData.resetTimer = setTimeout(() => {
						prefabGroup.userData.manuallyRotated = false;
						prefabGroup.userData.zoom = 1.0;
					}, 3000);
				}
				if (this.hasEngagedRotation) {
					this.wasDraggingBeforeUp = true;
					setTimeout(() => {
						this.wasDraggingBeforeUp = false;
					}, 100);
				}
			}
			this.isDragging = false;
			this.draggedIdentifier = null;
		},

		handleBlockClick(event) {
			if (this.wasDraggingBeforeUp) {
				event.preventDefault();
				event.stopPropagation();
				return true;
			}
			return false;
		},

		handleWheel(event) {
			if (!this.isDragging || !this.draggedIdentifier) return;
			
			const prefabGroup = this.scene.children.find(
				(obj) => obj instanceof THREE.Group && obj.userData.identifier === this.draggedIdentifier
			);

			if (prefabGroup) {
				if (event.cancelable) event.preventDefault();
				const zoom = prefabGroup.userData.zoom || 1.0;
				
				if (event.deltaY < 0) {
					prefabGroup.userData.zoom = Math.min(10, zoom * 1.1);
				} else {
					prefabGroup.userData.zoom = Math.max(0.1, zoom / 1.1);
				}
				
				prefabGroup.userData.manuallyRotated = true;
				if (prefabGroup.userData.resetTimer) {
					clearTimeout(prefabGroup.userData.resetTimer);
				}
			}
		},
	},

	watch: {
		async prefabsList() {
			await this.reloadPrefabs();
		},
	},

	emits: ['escape'],

	async mounted() {
		// instead of data() since reactivity messes with threejs
		this.renderer = null;
		this.camera = null;
		this.scene = null;

		await this.reloadPrefabs();
		document.body.style.overflow = 'hidden';
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mouseup', this.handleMouseUp);
		window.addEventListener('wheel', this.handleWheel, { passive: false });
		window.addEventListener('touchmove', this.handleMouseMove, { passive: false });
		window.addEventListener('touchend', this.handleMouseUp);
	},

	beforeUnmount() {
		window.removeEventListener('resize', this.onWindowResize);

		if (this.renderer) {
			this.renderer.dispose();
		}

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		if (this.scene) {
			this.scene.traverse((child) => {
				if (child.geometry) child.geometry.dispose();
				if (child.material) {
					if (Array.isArray(child.material)) {
						child.material.forEach((m) => m.dispose());
					} else {
						child.material.dispose();
					}
				}
			});
			this.scene = null;
		}

		window.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('mouseup', this.handleMouseUp);
		window.removeEventListener('wheel', this.handleWheel);
		window.removeEventListener('touchmove', this.handleMouseMove, { passive: false });
		window.removeEventListener('touchend', this.handleMouseUp);
		document.body.style.overflow = '';
	},
};
</script>

<template>
	<dialog
		class="prefabs-wrapper"
		@click="
			(e) => {
				if (e.target.tagName === 'DIALOG') this.$emit('escape');
			}
		"
	>
		<div class="prefabs-container">
			<h2 class="prefabs-heading">
				Prefabs
				<img v-if="this.prefabsList[this.prefabsList.length - 1]?.cursor" src="./../assets/icons/loading.svg" alt="loading..." />
			</h2>
			<div class="prefabs-viewer" ref="prefabsViewer">
				<div class="prefabs-list-wrapper">
					<div class="prefabs-list" ref="prefabsList">
						<div
							v-for="(prefab, index) in this.prefabs"
							:key="index"
							:class="'prefab-item' + (prefab.blocked ? ' blocked-prefab' : '')"
							ref="prefabItems"
							@mousedown="handleMouseDown($event, index)"
							@touchstart="handleMouseDown($event, index)"
							@clickCapture="handleBlockClick"
						>
							<div class="prefab-info" v-if="prefab.keys_only">
								<div>
									<div>
										{{ prefab.customMetadata.complexity }}
										<img src="./../assets/icons/block.svg" alt="prefabs" />
									</div>
									<div>{{ prefab.size }} b</div>
									<div class="format">v{{ prefab.customMetadata.format_version }}</div>
								</div>
								<div><b>Identifier</b></div>
								<CopyButton :value="prefab.customMetadata.identifier" />
								<div><b>Creator</b></div>
								<CopyButton :value="prefab.customMetadata.creator_id" />
								<div><b>Uploaded</b></div>
								<CopyButton :value="prefab.uploaded" />
								<div><b>Key</b></div>
								<CopyButton :value="prefab.key" />
								<div><b>Hash</b></div>
								<CopyButton :value="prefab.customMetadata.hash" />
								<div><b>Etag</b></div>
								<CopyButton :value="prefab.etag" />
								<div><b>Version</b></div>
								<CopyButton :value="prefab.version" />
							</div>
							<button
								class="prefab-button download-prefab-button"
								@click="
									() => {
										downloadPrefab(index);
									}
								"
							>
								Download
							</button>
							<button
								v-if="isSuperModerator"
								class="prefab-button block-prefab-button"
								@click="
									() => {
										blockPrefab(index);
									}
								"
							>
								{{ currentlyBlocking === index ? 'Confirm' : 'Block' }}
							</button>
							<button
								v-if="isSuperModerator"
								class="prefab-button block-prefab-button"
								@click="
									() => {
										deletePrefab(index);
									}
								"
							>
								{{ currentlyDeleting === index ? 'Confirm' : 'Delete' }}
							</button>
						</div>
						<div v-if="this.prefabsList[this.prefabsList.length - 1]?.cursor" class="prefab-item prefab-item-loading">
							<img src="./../assets/icons/loading.svg" alt="loading..." />
						</div>
					</div>
				</div>
				<canvas ref="canvas" class="canvas"></canvas>
			</div>
		</div>
	</dialog>
</template>

<style scoped>
@keyframes rotate-spinner {
	from {
		rotate: 0deg;
	}
	to {
		rotate: 360deg;
	}
}
.prefabs-heading {
	display: grid;
	grid-template-columns: 1fr 0;
	place-content: center;

	img {
		left: 0.5em;
		margin: auto;
		animation: rotate-spinner 1s infinite linear;
	}
}
.prefabs-wrapper {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: grid;
	place-content: center;
	background-color: var(--layer);
}
.prefabs-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 5px;
	padding-top: 5px;
	width: 80svw;
	height: 80svh;
	background-color: var(--bg);
	border-radius: 25px;
	overflow: hidden;
}
.prefabs-list {
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	grid-gap: 10px;
	justify-content: center;
	overflow: visible;
	position: relative;

	&:has(.prefab-info) {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}
}
.prefab-item {
	width: 100%;
	height: 250px;
	padding: 10px;
	background-color: var(--button);
	border-radius: 15px;
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	justify-content: space-evenly;
	position: relative;

	&.prefab-item-loading {
		align-items: center;
		justify-content: center;

		> img {
			width: 30%;
			height: 30%;
			animation: rotate-spinner 1s infinite linear;
		}
	}
}
.prefab-info {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 80%;
	overflow-y: scroll;
	padding: 0.8rem;
	font-size: 0.8rem;
	display: flex;
	flex-direction: column;
	gap: 2px;
	line-break: anywhere;
	scrollbar-width: none !important;
	-ms-overflow-style: none !important;

	&::-webkit-scrollbar {
		width: 0 !important;
		height: 0 !important;
		display: none !important;
	}

	div {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 2px;

		img {
			height: 1rem;
		}
	}
	z-index: 2;
}
.blocked-prefab {
	background-color: #ce311650;
}
.prefabs-viewer {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
}
.canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1;
}
.prefabs-list-wrapper {
	height: 100%;
	width: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	position: relative;
	padding: 10px;
	padding-top: 0;
	scrollbar-width: none !important;
	-ms-overflow-style: none !important;
	z-index: 0;
	overscroll-behavior: contain;

	&::-webkit-scrollbar {
		width: 0 !important;
		height: 0 !important;
		display: none !important;
	}
}
.prefabs-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 5px;
	width: 80svw;
	height: 80svh;
	background-color: var(--bg);
	border-radius: 25px;
	overflow: hidden;
	position: relative;
}
.prefab-button {
	padding: 5px 10px;
	font-weight: bold;
	background-color: #666;
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 5px;
	z-index: 2;
}
.block-prefab-button {
	background-color: var(--red);
}
.download-prefab-button {
	background-color: var(--blue);
}
.blocked-prefab .block-prefab-button {
	display: none;
}
</style>
