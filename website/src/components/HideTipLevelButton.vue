<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { hideLevelRequest } from '../requests/HideLevelRequest'
import { resetReportsRequest } from '../requests/ResetReportsRequest'
import { moderationActionRequest } from '../requests/ModerationActionRequest'
import { GetLevelDetailsRequest } from '../requests/GetLevelDetailsRequest'

export default {
  emits: ['handled'],

  props: {
    level_id : String
  },

  methods: {
    async handlePress(handled) {
      if(!await hideLevelRequest(this.$api_server_url, this.accessToken, this.level_id)) return

      let noPunish = false
      const result = await GetLevelDetailsRequest(this.$api_server_url, this.level_id)
      if(result) {
          if("levellist_newest_key" in result)
          {
            const reverseTimestamp = result.levellist_newest_key.split(":")[0]
            const timestamp = 8640000000000000 - reverseTimestamp
            const banDate = new Date('April 15, 2024 00:00:00');
            if(timestamp < banDate)
            {
              noPunish = true
            }
          }
      }

      const userID = this.level_id.split(':')[0]
      if(!noPunish)
      {
        if(!await moderationActionRequest(this.$api_server_url, this.accessToken, userID, "level_tips")) return
      }
      
      if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return
      this.$emit('handled', true)
    },
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  }
}
</script>

<template>
  <div class="moderation-hide-level-button-container">
    <button class="moderation-hide-level-button" @click="handlePress">Hide Tip</button>
  </div>
</template>

<style scoped>
.moderation-hide-level-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.moderation-hide-level-button-container {
  margin-top: 5px;
}
</style>
