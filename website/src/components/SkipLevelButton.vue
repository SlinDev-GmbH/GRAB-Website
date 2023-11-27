<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { removeLevelFromVerificationQueueRequest } from '../requests/RemoveLevelFromVerificationQueueRequest.js'

export default {
  props: {
    levelInfo : Object
  },

  data() {
    return {
      isSkipped: false
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async SkipLevel()
    {
      if (await removeLevelFromVerificationQueueRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier)) {
        this.isSkipped = true;
      }
    }
  }
}
</script>

<template>
  <div>
    <button v-if="!isSkipped" class="moderation-skip-button" @click="SkipLevel">Skip</button>
    <button v-else class="moderation-skipped-button">Skipped</button>
  </div>
</template>

<style scoped>
.moderation-skip-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: #ffae00;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 5px;
}
.moderation-skipped-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  margin-top: 5px;
}
</style>
