<script>
import * as THREE from 'three';
import MeshUtils from '../../src/assets/MeshUtils';
import { SGMLoader } from "../../src/assets/sgmLoader";

export default {
    props: {
        itemName: {
            type: String,
            required: true
        },
        itemObject: {
            type: Object,
            required: true
        },
        player: Object,
        primaryColor: Array,
        secondaryColor: Array,
        filterChoice: String
    },
    computed: {
        hasDualEquip() {
            return ['grapple/hook', 'body/badge'].includes(this.itemObject.type);
        },
        filterType() {
            const filterMap = {
                "All": "All",
                "Heads": "head",
                "Hats": "head/hat",
                "Facewear": "head/glasses",
                "Body": "body",
                "Neck": "body/neck",
                "Badge": "body/badge",
                "Hands": "hand",
                "Checkpoint": "checkpoint",
                "Grapples": "grapple/hook"
            };

            return filterMap[this.filterChoice];
        }
    },
    mounted() {
        if(!this.itemObject.type.includes('currency') && !this.itemName.includes('rotation') ){
            this.setupThreeScene();
        }
    },
    methods: {
        isEquipped(side = null) {
            const activeModels = this.player.activeModels;

            if (side) {
                return Object.keys(activeModels).some(key => {
                    const model = this.player.activeModels[key];
                    if (model.name === this.itemName) {
                        if (key.includes(side)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    model ? model.name === this.itemName && key.includes(side) : false
                });
            } else {
                return Object.values(activeModels).some(model =>
                    model ? model.name === this.itemName : false
                );
            }

        },
        equip(side = undefined) {
            const type = side ? `${this.itemObject.type}/${side}` : this.itemObject.type;
            this.player.loadModel(this.itemName, type)
        },

        unequip(side) {
            const modelType = Object.keys(this.player.activeModels).find(key => {
                const model = this.player.activeModels[key];
                return model ? model.name === this.itemName && (side ? model.type.includes(side) : true) : false;
            });
            this.player.unequip(modelType);
        },
        setupThreeScene() {
            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(55, 1, 1, 1000);
            camera.position.z += 2;

            scene.userData.element = this.$refs.scene 
            scene.userData.camera = camera
            scene.userData.primary_color = this.primaryColor;
            scene.userData.secondary_color = this.secondaryColor;


            (async (scene) => {
                const sgmLoader = new SGMLoader()

                sgmLoader.load(this.itemObject.file, (model) => { 
                    model = MeshUtils.applyMaterialIndices(model, this.itemObject);
                    model = MeshUtils.applyColors(scene, this.itemObject, model);
                    model = this.applyPreviewRotation(model)
                    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

                    scene.add(model);
                });

            })(scene);
            return this.$emit('updateSceneList', scene);
        },

        applyPreviewRotation(model) {
            if (this.itemObject.preview_rotation !== undefined) {
                const [rx, ry, rz] = this.itemObject.preview_rotation.map(Number)
                let rotation = new THREE.Euler(ry * (Math.PI / 180), rx * (Math.PI / 180), rz * (Math.PI / 180))

                model.rotation.copy(rotation)
            }
            return model
        },


    }
}
</script>
<template>
    <div v-if="(itemObject.type === filterType || (filterType === 'All' && !itemObject.type.includes('currency'))) && (isEquipped || !itemName.includes('rotation'))"
        class="cosmetic-card">
        <h3>{{ itemObject.title }}</h3>
        <div class="scene" ref="scene"></div>
        <div v-if="hasDualEquip" class="btns-container">
            <button v-if="isEquipped('left')" @click="unequip('left')" class="btn-unequip">Un-equip Left</button>
            <button v-else @click="equip('left')" class="btn-preview">Preview Left</button>

            <button v-if="isEquipped('right')" @click="unequip('right')" class="btn-unequip">Un-equip Right</button>
            <button v-else @click="equip('right')" class="btn-preview">Preview Right</button>
        </div>
        <div v-else class="btns-container">
            <button v-if="isEquipped()" @click="unequip()" class="btn-unequip">Un-equip</button>
            <button v-else @click="equip()" class="btn-preview">Preview</button>
        </div>
    </div>
</template>
<style scoped>
.cosmetic-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: #6e6e6e15;
    border-radius: 15px;
    width: 100%;
    height: 160px;
    padding: 0.5rem;
}

.cosmetic-card h3 {
    margin: 0;
    font-size: 1em;
    text-align: center;
    color: #0f6db3;
    padding: 5px 10px;
}

.btns-container {

    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;

}

button {
    width: 80%;
    border-radius: 10px;
    text-align: center;
    margin: 0 auto;
    color: white;
    border: none;
    cursor: pointer;
    padding-block: 5px;
    padding-inline: 15px;
    z-index: 2;
}

.btn-preview {
    background-color: #27df61;
}

.btn-equip {
    background-color: #27df61;
}

.btn-unequip {
    background-color: #ff0000;
}

.scene {
    width: 200px;
    height: 200px;
}
</style>
