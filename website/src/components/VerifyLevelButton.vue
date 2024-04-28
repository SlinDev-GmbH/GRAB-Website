<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setLevelTagsRequest } from '../requests/SetLevelTagsRequest.js'
import { removeLevelFromVerificationQueueRequest } from '../requests/RemoveLevelFromVerificationQueueRequest.js'

export default {
  props: {
    levelInfo : Object
  },

  data() {
    return {
      isVerified: false,
      isLoading: false
    }
  },

  created() {
    this.isVerified = this.levelInfo?.tags?.includes('ok') ?? false
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async toggleVerifyLevel()
    {
      if (this.isLoading) return
      this.isLoading = true
      let newModTags = []
      if(!this.isVerified) newModTags.push('ok')

      const oldState = this.isVerified
      this.isVerified = !this.isVerified
      if(!await setLevelTagsRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier, newModTags, undefined)) 
      {
        //Reset to previous state if an error was encountered
        this.isVerified = oldState
        return
      }
      this.isLoading = false

      await removeLevelFromVerificationQueueRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier)
    }
  }
}
</script>

<template>
  <div>
    <button v-if="isVerified" class="moderation-unverify-button" @click="toggleVerifyLevel">Unverify</button>
    <button v-else class="moderation-verify-button" @click="toggleVerifyLevel">Verify</button>
  </div>
</template>

<style scoped>
.moderation-verify-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.moderation-unverify-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}
</style>
