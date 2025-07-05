<script>
import DropDown from '../../src/components/DropDown.vue'

export default {
    data() {
        return {
            NavBar: [
                { id: "items", text: "Cosmetics", onClick: this.handleNavBarInput },
                { id: 'primary', text: 'Main Color', onClick: this.handleNavBarInput },
                { id: 'secondary', text: 'Second Color', onClick: this.handleNavBarInput }
            ],
            active: "items",
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
            this.active = event.target.id
            this.$emit('UpdateNav', event.target.id);
        }

    }
}
</script>
<template>
    <nav class="navbar">
        <button v-for="option in NavBar" :key="option.id" :id="option.id" @click="option.onClick" :class="active == option.id ? 'active' : ''">
            {{ option.text }}
        </button>
        <DropDown v-show="isItemsSelected" :options='["All", "Heads", "Head - Hats", "Head - Face Items", "Bodies", "Body - Backpack", "Body - Neck", "Body - Waist", "Body - Badge", "Hands", "Grapples", "Checkpoints"]' :defaultChoice='"All"' @changeSelection="$emit('changeSelection', $event)"/>
    </nav>
</template>
<style>
.navbar {
    z-index: 4;
    display: flex;
    flex-direction: row;
    padding-inline: 15px;
    padding-block: 3px;
    align-items: center;
    height: fit-content;
}
.dropdown-content {
    overflow: scroll;
    max-height: 300px;
}

.navbar *:last-child {
    margin-left: auto;
}

.navbar button {
    color: white;
    font-size: 16px;
    cursor: pointer;
    text-align: center;
    background: #50505029;
    border-radius: 20px;
    margin-right: 10px;
    padding-inline: 14px;
    line-height: 0;
    border: none;
    height: 30px;
}

.navbar button.active {
    background: #0000004f;
}
</style>
