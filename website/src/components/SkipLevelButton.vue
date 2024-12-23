<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { removeLevelFromVerificationQueueRequest } from '../requests/RemoveLevelFromVerificationQueueRequest.js'

export default {
  props: {
    levelInfo : Object
  },

  emits: ['skipped'],

  data() {
    return {
      isSkipped: false,
      isLoading: false
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async skipLevel()
    {
      if (this.isLoading) return;
      this.isLoading = true;
      await removeLevelFromVerificationQueueRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier);
      this.isSkipped = true;
      this.isLoading = false;
      this.$emit('skipped');
    }
  }
}
</script>

<template>
  <button v-if="!isSkipped" class="moderation-skip-level-button" @click="skipLevel">Skip</button>
</template>

<style scoped>
.moderation-skip-level-button {
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--red);
  border-radius: 15px;
  cursor: pointer;
}
@media screen and (max-width: 600px) {
  .moderation-skip-level-button {
    height: 25px;
    width: 70px;
    font-size: 0.7rem;
  }
}
</style>
