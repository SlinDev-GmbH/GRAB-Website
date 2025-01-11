<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setCreator } from '../requests/SetCreator.js'

export default {
  emits: ['change'],
  props: {
    userID: String,
    isCreator: Boolean
  },

  computed: {
    ...mapState(useUserStore, ['accessToken', 'isSuperModerator'])
  },

  methods: {
    async toggleCreator() {
      if (!await setCreator(this.$api_server_url, this.accessToken, this.userID, !this.isCreator)) return;
      this.$emit('change');
    }
  }
}
</script>

<template>
    <button v-if="isSuperModerator" :class="isCreator ? 'remove-creator-button' : 'make-creator-button'" @click="toggleCreator">{{ isCreator ? "Remove" : "Make" }} Creator</button>
</template>

<style scoped>
  .make-creator-button, .remove-creator-button {
    padding: 5px 10px;
    font-weight: bold;
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .make-creator-button {
    background-color: var(--green);
  }

  .remove-creator-button {
    background-color: var(--red);
  }
</style>
