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
    ...mapState(useUserStore, ['accessToken', 'isAdmin'])
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
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .make-verifier-button {
    background-color: var(--green);
  }

  .remove-verifier-button {
    background-color: var(--red);
  }
  @media screen and (max-width: 600px) {
    .make-verifier-button, .remove-verifier-button {
    height: 25px;
    width: 70px;
    font-size: 0.6rem;
    line-height: 1;
  }
}
</style>
