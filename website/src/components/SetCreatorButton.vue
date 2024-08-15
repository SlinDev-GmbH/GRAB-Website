<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setCreator } from '../requests/SetCreator.js'

export default {
  props: {
    userID: String,
    isCreator: Boolean
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin'])
  },

  methods: {
    async toggleCreator() {
      await setCreator(this.$api_server_url, this.accessToken, this.userID, !this.isCreator);
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" :class="isCreator ? 'remove-creator-button' : 'make-creator-button'" @click="toggleCreator">{{ isCreator ? "Remove" : "Make" }} Creator</button>
</template>

<style scoped>
  .make-creator-button, .remove-creator-button {
    padding: 5px 10px;
    font-weight: bold;
    color: white;
    border: none;
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .make-creator-button {
    background-color: green;
  }

  .remove-creator-button {
    background-color: red;
  }
</style>
