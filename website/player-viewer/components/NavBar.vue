<script>
import DropDown from '../../src/components/DropDown.vue'

export default {
    data() {
        return {
            NavBar: [
                { id: "items", text: "All Items", onClick: this.handleNavBarInput },
                { id: 'primary', text: 'Main Color', onClick: this.handleNavBarInput },
                { id: 'secondary', text: 'Second Color', onClick: this.handleNavBarInput }
            ],
        }
    },
    components:{
        DropDown
    },
    props:{
        isItemsSelected:{
            type: Boolean,
            require:true
        }
    },

    methods:{


        handleNavBarInput(event) {
            this.$emit('UpdateNav', event.target.id);
        },



    }
}
</script>
<template>
    <nav class="navbar">
        <button v-for="option in NavBar" :key="option.id" :id="option.id" @click="option.onClick">
            {{ option.text }}
        </button>
        <DropDown v-show="isItemsSelected" :options='["All", "Heads", "Hats", "Facewear", "Body", "Badge", "Neck", "Checkpoint", "Grapples"]' :defaultChoice='"All"' @changeSelection="$emit('changeSelection', $event)"/>
    </nav>
</template>
<style scoped>
.navbar {
    height: fit-content;
    z-index: 4;
}

.navbar button {
    color: #0f6db3;
    cursor: pointer;
    text-align: center;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    margin-right: 10px;
    padding-inline: 14px;
    border: none;
}
</style>