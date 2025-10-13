<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { AddCuratedListRequest } from '../requests/AddCuratedListRequest.js'

export default {

    computed: {
        ...mapState(useUserStore, ['accessToken'])
    },

    emits: ['handled'],

    methods: {
        async addNewList() {
            if (!this.accessToken) {
                window.toast("No access token!", "error");
                return;
            }
            const name = prompt("Please enter the name of the new list:");
            if (name) {
                const result = await AddCuratedListRequest(this.$api_server_url, this.accessToken, name);
                if (result) {
                    this.$emit('handled', result)
                }
            }
        },
    }
}
</script>

<template>
    <button class="button" id="add-new-list-button" @click="addNewList">Add List</button>
</template>

<style scoped>
#add-new-list-button {
    background-color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 90px;
    font-weight: bold;
    border-radius: 15px;
    cursor: pointer;
}
</style>
