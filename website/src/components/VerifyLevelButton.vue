<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setLevelTagsRequest } from '../requests/SetLevelTagsRequest.js'

export default {
  props: {
    levelInfo : Object
  },

  data() {
    return {
      isVerified: false
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
      let newTags = this.levelInfo?.tags ?? []
      if(this.isVerified) newTags = newTags.filter(e => e !== 'ok');
      else newTags.push('ok')
      const oldState = this.isVerified
      this.isVerified = !this.isVerified
      if(!await setLevelTagsRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier, newTags))
      {
        //Reset to previous state if an error was encountered
        this.isVerified = oldState
        return
      }
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

<style>
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
