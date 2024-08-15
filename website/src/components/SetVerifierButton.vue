<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setVerifier } from '../requests/SetVerifier.js'

export default {
  props: {
    userID: String,
    isVerifier: Boolean
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin'])
  },

  methods: {
    async toggleVerifier() {
      await setVerifier(this.$api_server_url, this.accessToken, this.userID, !this.isVerifier);
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" :class="isVerifier ? 'remove-verifier-button' : 'make-verifier-button'" @click="toggleVerifier">{{ isVerifier ? "Remove" : "Make" }} Verifier</button>
</template>

<style scoped>
  .make-verifier-button, .remove-verifier-button {
    padding: 5px 10px;
    font-weight: bold;
    color: white;
    border: none;
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .make-verifier-button {
    background-color: green;
  }

  .remove-verifier-button {
    background-color: red;
  }
</style>
