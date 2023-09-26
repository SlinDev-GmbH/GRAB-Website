<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { RemoveCuratedListRequest } from '../requests/RemoveCuratedListRequest.js'

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
        async removeList() {
            if (!this.accessToken) {
                alert("No access token!");
                return;
            }
            const name = prompt("Please enter the name of the list to remove:");
            if (name) {
                result = await RemoveCuratedListRequest(this.$api_server_url, accessToken, name);
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
    <button class="button" id="remove-list-button" @click="removeList">Remove List</button>
</template>

<style>
#remove-list-button {
    background-color: red;
}
</style>
