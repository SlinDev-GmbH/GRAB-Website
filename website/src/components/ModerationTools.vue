<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationInfo from './ModerationInfo.vue'
import ModerationPopup from './ModerationPopup.vue'

import { approveLevelRequest } from '../requests/ApproveLevelRequest'
import { resetReportsRequest } from '../requests/ResetReportsRequest'
import { moderationActionRequest } from '../requests/ModerationActionRequest'

export default {
  components: {
    ModerationInfo,
    ModerationPopup
  },

  emits: ['handled'],

  props: {
    moderationItem : Object
  },

  data() {
    return {
      showModerationPopup: false
    }
  },

  computed: {
    reports() {
      return Object.entries(this.moderationItem).filter(([key]) => key.includes('reported_score_'))
    },

    isLevel() {
      return this.moderationItem.object_type === 'level'
    },

    popupConfig() {
      if(this.isLevel) return 'level_hide'
      return 'user_ban'
    },

    bestReason() {
      let bestReason = ''
      let bestReasonScore = 0
      for(var key in this.moderationItem)
      {
        if(key.startsWith('reported_score_'))
        {
          if(this.moderationItem[key] > bestReasonScore)
          {
            bestReasonScore = this.moderationItem[key]
            bestReason = key.slice(15)
          }
        }
      }
      return bestReason
    },

    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    handledModerationPopup(handled) {
      if(handled === true)
      {
        this.$emit('handled', true)
      }
    },

    async approveLevel()
    {
      if(!await approveLevelRequest(this.$api_server_url, this.accessToken, this.moderationItem.object_info.identifier)) return
      this.$emit('handled', false)
    },

    async punishUser() {
      const userID = this.moderationItem.object_info.user_id
      if(!userID) return;
      if(!await moderationActionRequest(this.$api_server_url, this.accessToken, userID, 'user_' + this.bestReason)) return
      if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return
      this.$emit('handled', true)
    },

    async resetUserReports()
    {
      const userID = this.moderationItem.object_info.user_id
      if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return
      this.$emit('handled', false)
    }
  }
}
</script>

<template>
  <div class="moderation-tools">
    <div v-if="moderationItem.object_info.moderation_info" class="moderation-title">Previous Strike:</div>
    <ModerationInfo v-if="moderationItem.object_info.moderation_info" :info="moderationItem.object_info.moderation_info"/>

    <div class="moderation-title">Reports:</div>
    <div v-for="(value) in reports">
      {{ value[0].slice(15) }}: {{ value[1] }}
    </div>
    <br>
    <button v-if="isLevel" class="moderation-hide-button" @click="showModerationPopup=true">Hide</button>
    <button v-else class="moderation-hide-button" @click="punishUser">Punish</button>
    <button v-if="isLevel" class="moderation-approve-button" @click="approveLevel">Approve</button>
    <button v-else class="moderation-approve-button" @click="resetUserReports">Reset</button>
  </div>

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" :config="popupConfig" :identifier="moderationItem.object_info.identifier" />
  </Teleport>
</template>

<style>
.moderation-tools {
  width: 100%;
  min-height: 0px;
  padding-top: 5%;
  padding-bottom: 5%;
}

.moderation-title {
  font-weight: bold;
}

.moderation-hide-button {
  width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  margin-left: 17.5%;
  margin-right: 5%;
}

.moderation-approve-button {
  width:30%;
  height: 30px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  border-radius: 15px;
}
</style>
