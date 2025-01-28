<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import * as THREE from 'three';
import { OrbitControls } from "../src/assets/OrbitContols.js";
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { getShopItemsRequest } from '../src/requests/GetShopItemsRequest.js';
import { getUserInfoRequest } from '../src/requests/GetUserInfoRequest.js';
import { Player } from '../src/assets/Player.js';
import PlayerToolsContent from './components/PlayerToolsContent.vue'
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
                { id: 'back', text: 'Back', onClick: () => { window.location.href = this.ToolsButtons[0].href } },
                { id: 'export-png', text: '↓ .png', onClick: this.exportPNG },
                { id: 'export-gltf', text: '↓ .gltf', onClick: this.exportGLTF },
            ],
            playerInfo: undefined,
            playerItems: undefined,
            player: undefined,
            canvas: null,
        }
    },
    components: {
        PlayerToolsContent
    },

    computed: {
        ...mapState(useUserStore, ['accessToken', 'isLoggedIn']),
    },

    created() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        const user_id = new URLSearchParams(window.location.search).get('user_id')
        this.ToolsButtons[0].href = `${window.location.origin}/levels?tab=tab_other_user&user_id=${user_id}`
    },
    async mounted() {
        const items = await getShopItemsRequest(this.$api_server_url)
        this.itemsList = items

        if (this.$route.query.user_id) {
            const userData = await getUserInfoRequest(this.$api_server_url)
            this.playerInfo = userData
            this.playerItems = userData.active_customizations.items
        }
        
        const { scene, camera, renderer } = await this.initScene();
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        this.render();
        this.initPlayer();
    },

    methods: {
        //main player rendering
        async initScene() {

            THREE.ColorManagement.enabled = true;
            
            const renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById("player-renderer"), //idk why but things are broken when it not this element, maybe I have skill issue
                alpha: true,
                transparent: true,
                antialias: true,
                preserveDrawingBuffer: true,

            });
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(400, 450)

            const scene = new THREE.Scene()

            const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
            directionalLight.position.set(0, 1, -2);

            const AmbientLight = new THREE.AmbientLight(0xffffff, 1.0);

            scene.add(AmbientLight, directionalLight)

            const camera = new THREE.PerspectiveCamera(55, 400 / 450, 1, 1000)
            camera.position.set(0, 0, -3.5)

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false
            controls.maxPolarAngle = Math.PI
            controls.addEventListener("start", () => (document.body.style.cursor = "none"))
            controls.addEventListener("end", () => (document.body.style.cursor = "auto"))

            return { scene, camera, renderer }
        },

        render() {
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.render);
        },

        initPlayer() {
            this.scene.userData.primary_color = this.playerInfo.active_customizations.player_color_primary.color
            this.scene.userData.secondary_color = this.playerInfo.active_customizations.player_color_secondary.color

            this.player = new Player(import.meta.env.BASE_URL, this.scene, this.itemsList, this.playerItems);
        },

        /*
         :3     Ԑ: 
        */

        //tools:

        exportPNG() {
            const canvas = document.getElementById('player-renderer')
            const link = document.createElement('a')
            link.download = `${this.playerInfo.user_name}.png`
            link.href = canvas.toDataURL()
            link.click()
        },
        exportGLTF() {
            const exporter = new GLTFExporter();
            exporter.parse(this.scene, (gltf) => {
                const blob = new Blob([JSON.stringify(gltf)], { type: 'text/json' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `${this.playerInfo.user_name}.gltf`
                link.click()
            }, (error) => console.error('An error happened', error))
        },

        changeColor(colorObject) {
            if (colorObject.page === "primary") {
                this.scene.userData.primary_color = colorObject.color
            }
            if (colorObject.page === "secondary") {
                this.scene.userData.secondary_color = colorObject.color
            }
            MeshUtils.applyColorsToAll(this.scene)
        }

    }
}
</script>

<template>
    <main id="player-viewer">
        <div class="user-tools">
            <button v-for="button in ToolsButtons" :key="button.id" :id="button.id" :href="button.href"
                @click="button.onClick">
                {{ button.text }}
            </button>
        </div>

        <div id="player-container">
            <canvas id="player-renderer"></canvas>
        </div>

        <PlayerToolsContent v-if="itemsList && player && playerInfo" :player="player" :playerInfo="playerInfo"
            :itemsList="itemsList" @changeColor="changeColor($event)" />

        <canvas id="canvas"></canvas>

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
    justify-content: space-evenly;
    align-items: center;
    height: 100vh;
    width: 100vw;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0;
    column-gap: 30px;
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

#player-renderer {
    z-index: 2;
    width: 400px;
    height: 450px;
}

@media screen and (max-width: 1001px) {

    /* when the menu wraps */
    #player-renderer {
        height: 40svh !important;
        width: calc(calc(40svh / 450) * 400) !important;
    }
}

#canvas {
    position: fixed;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}

::-webkit-scrollbar {
    width: 0;
}
</style>
