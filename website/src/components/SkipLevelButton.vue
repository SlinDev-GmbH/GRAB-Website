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
      if (this.isLoading) return
      this.isLoading = true
      await removeLevelFromVerificationQueueRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier)
      this.isSkipped = true
      this.isLoading = false
    }
  }
}
</script>

<template>
  <div class="moderation-skip-level-button-container">
    <button v-if="!isSkipped" class="moderation-skip-level-button" @click="skipLevel">Skip</button>
  </div>
</template>

<style scoped>
.moderation-skip-level-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.moderation-skip-level-button-container {
  margin-top: 5px;
}
</style>
