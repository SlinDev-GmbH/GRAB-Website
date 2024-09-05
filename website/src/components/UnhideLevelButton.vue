<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { unhideLevelRequest } from '../requests/UnhideLevelRequest'

export default {
  emits:['handled'],
  props: {
    level_id : String
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async doModerationAction() {
      if(await unhideLevelRequest(this.$api_server_url, this.accessToken, this.level_id))  {
        this.$emit('handled', false)
      } return
    },
  }
}
</script>

<template>
  <div class="moderation-unhide-level-button-container">
    <button class="moderation-unhide-level-button" @click="doModerationAction">Unhide</button>
  </div>
</template>

<style scoped>
.moderation-unhide-level-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: #ffae00;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.moderation-unhide-level-button-container {
  margin-top: 5px;
}
</style>
