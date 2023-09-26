<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { AddCuratedListRequest } from '../requests/AddCuratedListRequest.js'

export default {
    props: {
        typeSelector: Object,
        oldLevelList: Array,
        levelList: Array,
        typesList: Array,
    },

    computed: {
        ...mapState(useUserStore, ['accessToken'])
    },

    emits: ['handled'],

    methods: {
        async addNewList() {
            if (!this.accessToken) {
                alert("No access token!");
                return;
            }
            const name = prompt("Please enter the name of the new list:");
            if (name) {
                result = await AddCuratedListRequest(this.$api_server_url, accessToken, name);
                if (result) {
                    this.typesList = result;
                    this.$emit('handled', true)
                }
            }
        },
    }
}
</script>

<template>
    <button class="button" id="add-new-list-button" @click="addNewList">Add New List</button>
</template>

<style>
#add-new-list-button {
    background-color: #00bc87;
}
</style>
