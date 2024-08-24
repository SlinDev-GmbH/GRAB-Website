<script>
import CosmeticCard from './CosmeticCard.vue';
import NavBar from './NavBar.vue';
import * as THREE from 'three';

export default {
    data() {
        return {
            navDirectory: undefined,
            colors: [],
            selectedPrimaryColor: null,
            selectedSecondaryColor: null,
            filterChoice: "All"
        }
    },
    created() {
        this.scenes = []
        this.divRenderer = null;
    },
    async mounted() {
        this.setupUI();
        this.generateColors();

        this.navDirectory = 'items'

        const divRenderer = await this.initScene();
        this.divRenderer = divRenderer

    },
    components: {
        CosmeticCard,
        NavBar
    },
    props: {
        playerInfo: {
            type: Object,
            required: true
        },
        player: {
            type: Object,
            required: false
        },
        itemsList: {
            type: Object,
            required: true
        }

    },

    computed: {
        isItemsSelected() {
            return this.navDirectory === 'items'
        },
        isColorTypeSelected() {
            return this.navDirectory === 'primary' || this.navDirectory === 'secondary';
        },
        outlinedColors() {
            return this.colors.map((color, index) => {
                if (this.navDirectory === "primary" && this.selectedPrimaryColor === index) {
                    return { color, outline: '3px solid #333' };
                } else if (this.navDirectory === "secondary" && this.selectedSecondaryColor === index) {
                    return { color, outline: '3px solid #333' };
                } else {
                    return { color, outline: '3px solid transparent' };
                }
            });
        }

    },
    methods: {
        async initScene() {
            const divRenderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                transparent: true,
                antialias: true
            });
            divRenderer.setPixelRatio(window.devicePixelRatio);
            divRenderer.setAnimationLoop(this.divRenderLoop);
            return divRenderer;
        },
        //color picker
        generateColors() {
            this.colors = Array.from({ length: 100 }, (_, i) => {
                const row = Math.floor(i / 10);
                const column = i % 10;
                const color = this.GetColor(row, column);
                return this.LinearToGamma([color.r, color.g, color.b]);
            });
        },


        GetColor(row, column) {
            if (row == 0) {
                return (this.ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0));
            }
            if (row <= 5 && row != 0) {
                return (this.ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0, row / (10.0 - 4.0)));
            } else {
                return (this.ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0 - (row - 5.0) / (10.0 - 5.0), 1.0));
            }
        },

        ConvertHSVToRGB(h, s, v, alpha) {
            let hi = h * 3.0 / Math.PI;
            const f = hi - Math.floor(hi);
            if (hi >= 3.0) {
                hi -= 6.0;
            }
            if (hi < -3.0) {
                hi += 6.0;
            }

            let r = Math.max(v, 0.0);
            let g = Math.max(v - s * v, 0.0);
            let b = Math.max(v - s * f * v, 0.0);
            let a = Math.max(v - s * (1.0 - f) * v, 0.0);

            if (hi < -2.0) {
                return { r: r, g: a, b: g, a: alpha };
            } else if (hi < -1.0) {
                return { r: b, g: r, b: g, a: alpha };
            } else if (hi < 0.0) {
                return { r: g, g: r, b: a, a: alpha };
            } else if (hi < 1.0) {
                return { r: g, g: b, b: r, a: alpha };
            } else if (hi < 2.0) {
                return { r: a, g: g, b: r, a: alpha };
            } else {
                return { r: r, g: g, b: b, a: alpha };
            }
        },

        LinearToGamma([r, g, b]) {
            r = (r <= 0.0031308) ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
            g = (g <= 0.0031308) ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
            b = (b <= 0.0031308) ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
            return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)}, 255)`;
        },

        handleColorClick(index) {
            if (this.navDirectory === "primary") {
                this.selectedPrimaryColor = index;
                } else {
                this.selectedSecondaryColor = index;
            }
        },

        setupUI() {
            this.canvas = document.getElementById("canvas");
            if (!this.canvas) {
                console.error('Canvas element not found');
                return;
            }
            let page = document.getElementById("player-viewer");
            let positionInfo = page.getBoundingClientRect();
            let height2 = positionInfo.height;
            let width2 = positionInfo.width;
            this.canvas.style.height = height2; // Fixed style assignment
            this.canvas.style.width = width2; // Fixed style assignment
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
            this.canvas.style.transform = `translateY(${window.scrollY}px), translateX(${window.scrollX})`;
            this.divRenderer.clear();
            this.divRenderer.setScissorTest(true);
            this.scenes.forEach((scene) => {

                let element = scene.userData.element;
                let rect = element.getBoundingClientRect();

                let content = document.getElementById("categories-content")
                let contentRect = content.getBoundingClientRect();

                if (rect.bottom > contentRect.bottom || rect.top < contentRect.top ||
                    rect.right < 0 || rect.left > this.divRenderer.domElement.clientWidth) {
                    return;
                }

                let camera = scene.userData.camera;

                let width = rect.right - rect.left;
                let height = rect.bottom - rect.top;
                let left = rect.left;
                let bottom = this.divRenderer.domElement.clientHeight - rect.bottom;


                this.divRenderer.setViewport(left, bottom, width, height);
                this.divRenderer.setScissor(left, bottom, width, height);

                this.divRenderer.render(scene, camera)

            });
            this.divRenderer.setScissorTest(false);

        },
    }
}
</script>
<template>
    <div id="customizations">
        <div id="categories-content">
            <NavBar @UpdateNav="navDirectory = $event" @changeSelection="filterChoice = $event" :isItemsSelected="isItemsSelected" />

            <div class="card-list" id="card-list" v-show="isItemsSelected">
                <CosmeticCard v-if="player" v-for="(item, itemName) in itemsList" :itemName="itemName"
                    :itemObject="item" :player="player" :filterChoice="filterChoice"
                    @updateSceneList="scenes.push($event)"
                    :secondaryColor="playerInfo.active_customizations.player_color_secondary.color"
                    :primaryColor="playerInfo.active_customizations.player_color_primary.color" />
            </div>

            <div class="palette" v-show="isColorTypeSelected">
                <div v-for="(color, index) in outlinedColors" :key="index" :id="'color-block-' + index"
                    class="color-block" :style="{
                        backgroundColor: color.color,
                        outline: color.outline
                    }" @click="handleColorClick(index)">
                </div>
            </div>

        </div>
        <div id="content"></div>
    </div>
</template>
<style scoped>
#customizations {
    width: 572px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
#categories-content {
    display: grid;
    overflow: hidden;
    outline: 2px solid green;
    width: 382px;
    height: 372px;
    padding: 3px;
    position: relative;
}

.palette {
    display: grid;
    grid-template-columns: repeat(10, 30px);
    grid-template-rows: repeat(10, 30px);
    gap: 5px;
    height: fit-content;
    justify-content: center;
}

.palette div {
    width: 30px;
    height: 30px;
    display: inline-block;
    outline: 3px solid transparent;
}

.palette div:hover,
.palette div:active,
.palette div.selected {
    cursor: pointer;
    outline: 3px solid #333;
}


.card-list {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    display: grid;
    gap: 1rem;
    padding: 1rem;
    grid-template-columns: auto auto;
}

</style>