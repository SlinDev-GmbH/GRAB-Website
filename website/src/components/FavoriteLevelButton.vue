<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { setUserFavorites } from '../requests/SetUserFavoritesRequest.js'
import { removeUserFavorites } from '../requests/RemoveUserFavoritesRequest.js'

export default {

    props: {
        level_id: String
    },

    computed: {
        ...mapState(useUserStore, ['accessToken']),
        isFavorited() {
            const userStore = useUserStore()
            return userStore.isFavorited(this.level_id)
        }
    },

    methods: {
        async addFavoriteLevel() {
            if (this.accessToken) {
                const userStore = useUserStore()
                const result = await setUserFavorites(this.$api_server_url, this.level_id, this.accessToken)
                if (result === true) {
                    userStore.addFavoriteLevel(this.level_id)
                } 
            }
        },
        async removeFavoriteLevel() {
            if (this.accessToken) {
                const userStore = useUserStore()
                const result = await removeUserFavorites(this.$api_server_url, this.level_id, this.accessToken)
                if (result === true) {
                    userStore.removeFavoriteLevel(this.level_id)
                }
            }
        }
    }
}
</script>

<template>
    <img v-if="isFavorited" class="favorite-button" @click="removeFavoriteLevel" src="./../assets/icons/star_on.svg" alt="Add to Favorites">
    <img v-else class="favorite-button" @click="addFavoriteLevel" src="./../assets/icons/star_off.svg" alt="Remove from Favorites">
</template>

<style scoped>
.favorite-button {
    width: 30px;
    height: 30px;
    aspect-ratio: 1/1;
    cursor: pointer;
    background-color: var(--hover);
    border-radius: 50%;
    padding: 5px;
    transition: background-color 0.1s linear, transform 0.1s linear;
    transform: scale(1);
}

.favorite-button:hover {
    background-color: var(--active);
    transform: scale(1.05);
}
@media screen and (max-width: 500px) {
  .favorite-button {
    width: 20px;
    height: 20px;
    padding: 3px;
  }
}
</style>
