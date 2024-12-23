<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setModerator } from '../requests/SetModerator.js'

export default {
  props: {
    userID: String,
    isModerator: Boolean
  },

  computed: {
    ...mapState(useUserStore, ['accessToken', 'isAdmin'])
  },

  methods: {
    async toggleModerator() {
      await setModerator(this.$api_server_url, this.accessToken, this.userID, !this.isModerator);
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" :class="isModerator ? 'remove-moderator-button' : 'make-moderator-button'" @click="toggleModerator">{{ isModerator ? "Remove" : "Make" }} Moderator</button>
</template>

<style scoped>
  .make-moderator-button, .remove-moderator-button {
    padding: 5px 10px;
    font-weight: bold;
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .make-moderator-button {
    background-color: var(--green);
  }

  .remove-moderator-button {
    background-color: var(--red);
  }
  @media screen and (max-width: 600px) {
    .make-moderator-button, .remove-moderator-button {
      height: 25px;
      width: 70px;
      font-size: 0.6rem;
      line-height: 1;
    }
  }
</style>
