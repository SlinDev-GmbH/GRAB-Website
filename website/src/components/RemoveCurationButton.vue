<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { RemoveCuratedListRequest } from '../requests/RemoveCuratedListRequest.js'

export default {

    computed: {
        ...mapState(useUserStore, ['accessToken'])
    },

    emits: ['handled'],

    methods: {
        async removeList() {
            if (!this.accessToken) {
                alert("No access token!");
                return;
            }
            const name = prompt("Please enter the name of the list to remove:");
            if (name) {
                const result = await RemoveCuratedListRequest(this.$api_server_url, this.accessToken, name);
                if (result) {
                    this.$emit('handled', result)
                }
            }
        },
    }
}
</script>

<template>
    <button class="button" id="remove-list-button" @click="removeList">Remove List</button>
</template>

<style scoped>
#remove-list-button {
    background-color: var(--red);
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
