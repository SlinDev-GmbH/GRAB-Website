<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'

import { LevelLoader } from '../assets/LevelLoader.js'
import * as THREE from 'three'

import { prefabBlockRequest } from '../requests/PrefabBlockRequest.js'

export default {

  props: {
    prefabsList: Array,
    userID: String,
  },

  data() {
    return {
      loader: undefined,
      prefabs: [],
      container: null,
      currentlyBlocking: -1,
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken', 'isSuperModerator'])
  },

  methods: {
    async loadPrefab(prefab) {
      const { data, identifier } = prefab;

      if (!window._prefabCache) window._prefabCache = {};

      let result = window._prefabCache[identifier];

      if (!result) {
        const binaryString = atob(data);
        const uint8Array = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }

        result = await window._levelLoader.load(uint8Array);
        window._prefabCache[identifier] = result;
      }

      return result;
    },

    async reloadPrefabs() {
      const prefabs = [];

      if (!window._levelLoader) window._levelLoader = new LevelLoader({
        sky: false,
        lights: true,
        text: true,
        triggers: true,
        sound: true,
        sublevels: true,
        static: true,
      });

      for (const prefab of (this.prefabsList || [])) {
        prefabs.push(await this.loadPrefab(prefab));
      }

      this.prefabs = prefabs;

      this.$nextTick(() => {
        this.renderPrefabs();
      })
    },

    renderPrefabs() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      if (!this.container) this.container = this.$refs.prefabsList;
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
        this.renderer.render(this.scene, this.camera);

        let delta = clock.getDelta();
        this.scene.children.forEach((object) => {
          if (object instanceof THREE.Group) {
            object.rotation.y += 1 * delta;
          }
        });

        // this.prefabs.forEach(prefab => {
        //   prefab.update(delta);
        // });
      }
      animate();

      window.addEventListener('resize', this.onWindowResize)
    },

    replacePrefabs() {
      if (!this.scene) {
        this.scene = new THREE.Scene();
      } else {
        while(this.scene.children.length > 0) {
          this.scene.children[0].traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          this.scene.remove(this.scene.children[0]);
        }
      }

      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.scrollHeight + this.container.scrollTop;

      this.renderer.setSize(containerWidth, containerHeight);

      const frustumSize = 5;
      const aspect = containerWidth / containerHeight;
      if (!this.camera) {
        this.camera = new THREE.OrthographicCamera(
          frustumSize * aspect / -2,
          frustumSize * aspect / 2,
          frustumSize / 2,
          frustumSize / -2,
          0.1,
          1000
        );
        this.camera.position.z = frustumSize;
      } else {
        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;
        this.camera.updateProjectionMatrix();
      }

      const prefabItems = this.$refs.prefabItems || [];
      prefabItems.forEach((element, index) => {
        const prefab = this.prefabs[index];
        if (prefab && prefab.scene) {
          const clonedScene = prefab.scene.clone();
          const prefabGroup = new THREE.Group();

          const itemRect = element.getBoundingClientRect();
          const containerRect = this.container.getBoundingClientRect();

          const x = (itemRect.left - containerRect.left + itemRect.width / 2) / containerWidth - 0.5;
          const y = (itemRect.top - containerRect.top + itemRect.height / 2) / containerHeight - 0.5;

          if (!prefab.scene.userData.size || !prefab.scene.userData.center) {
            const bounds = new THREE.Box3().setFromObject(clonedScene);

            const size = new THREE.Vector3();
            bounds.getSize(size);
            prefab.scene.userData.size = size;

            const center = new THREE.Vector3();
            bounds.getCenter(center);
            prefab.scene.userData.center = center;
          }

          const { center, size } = prefab.scene.userData;

          const targetWidth = frustumSize * aspect * (itemRect.width / containerWidth);
          const targetHeight = frustumSize * (itemRect.height / containerHeight);

          const maxDim = Math.max(size.x, size.y, size.z);
          let scale = Math.min(targetWidth, targetHeight) / maxDim;
          clonedScene.scale.set(scale * 0.7, scale * 0.7, scale * 0.7);

          prefabGroup.position.set(x * frustumSize * aspect, -y * frustumSize, 0);
          clonedScene.position.set(-center.x * scale, -center.y * scale + (maxDim * scale * 0.05), -center.z * scale);

          prefabGroup.add(clonedScene);
          this.scene.add(prefabGroup);
        }
      });
    },

    onWindowResize() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.container && this.renderer) {
          this.replacePrefabs();
        }
      }, 100);
    },

    downloadPrefab(index) {
      const prefabData = this.prefabsList[index]?.data;
      if (prefabData) {
        const binaryString = atob(prefabData);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        let fileBlob = new Blob([uint8Array], { type: "application/x-protobuf" });
        let url = window.URL.createObjectURL(fileBlob);
        let a = document.createElement('a');
        a.href = url;
        a.download = "prefab_" + this.userID + "_" + this.prefabsList[index].identifier + '.level';
        a.click();
      }
    },

    async blockPrefab(index) {
      if (this.currentlyBlocking === index) {
        const prefabID = this.prefabsList[index]?.identifier;
        if (prefabID) {
          if(await prefabBlockRequest(this.$api_server_url, this.accessToken, this.userID, prefabID)) {
            this.prefabs[index].blocked = true;
          }
        }
      } else {
        this.currentlyBlocking = index;
      }
    },
  },

  watch: {
    async prefabsList() {
      await this.reloadPrefabs();
    }
  },

  emits: [ 'escape' ],

  async mounted() {
    // instead of data() since reactivity messes with threejs
    this.renderer = null;
    this.camera = null;
    this.scene = null;

    await this.reloadPrefabs();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize)

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
  },
}
</script>


<template>
  <dialog class="prefabs-wrapper" @click="(e) => { if (e.target.tagName === 'DIALOG') this.$emit('escape'); }">
    <div class="prefabs-container">
      <h2 class="prefabs-heading">
        Prefabs
        <img v-if="this.prefabsList[this.prefabsList.length - 1]?.cursor" src="./../assets/icons/loading.svg" alt="loading...">
      </h2>
      <div class="prefabs-list-wrapper">
        <div class="prefabs-list" ref="prefabsList">
          <div v-for="(prefab, index) in this.prefabs" :key="index" :class="'prefab-item' + (prefab.blocked ? ' blocked-prefab' : '')" ref="prefabItems">
            <button class="prefab-button download-prefab-button" @click="() => { downloadPrefab(index); }">
              Download
            </button>
            <button v-if="isSuperModerator" class="prefab-button block-prefab-button" @click="() => { blockPrefab(index); }">
              {{ currentlyBlocking === index ? 'Confirm' : 'Block' }}
            </button>
          </div>
          <div v-if="this.prefabsList[this.prefabsList.length - 1]?.cursor" class='prefab-item prefab-item-loading'>
            <img src="./../assets/icons/loading.svg" alt="loading...">
          </div>
        </div>
        <canvas ref="canvas" class="canvas"></canvas>
      </div>
    </div>
  </dialog>
</template>


<style scoped>
  @keyframes rotate-spinner {
    from {rotate: 0deg;}
    to {rotate: 360deg;}
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
  .blocked-prefab {
    background-color: #CE311650;
  }
  .prefabs-list-wrapper {
    height: 100%;
    width: 100%;
    overflow: scroll;
    position: relative;
    padding: 10px;
    padding-top: 0;
  }
  .canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    margin-inline: 10px;
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

