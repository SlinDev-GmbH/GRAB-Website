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

  emits: ['handled', 'hide', 'approve'],

  props: {
    moderationItem : Object
  },

  data() {
    return {
      showModerationPopup: false,
      isPunished: false,
      isReset: false
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
        this.$emit('hide')
      }
    },

    async approveLevel()
    {
      if(!await approveLevelRequest(this.$api_server_url, this.accessToken, this.moderationItem.object_info.identifier)) return
      this.$emit('approve')
    },

    async punishUser() {
      const userID = this.moderationItem.object_info.user_id
      if(!userID) return;
      if(!await moderationActionRequest(this.$api_server_url, this.accessToken, userID, 'user_' + this.bestReason)) return
      if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return
      this.isPunished = true;
      this.$emit('handled', true)
    },

    async resetUserReports()
    {
      const userID = this.moderationItem.object_info.user_id
      if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return
      this.isReset = true;
      this.$emit('handled', false)
    }
  }
}
</script>

<template>
  <div class="moderation-tools">
    <ModerationInfo v-if="moderationItem.object_info.moderation_info" :info="moderationItem.object_info.moderation_info" :previous="true"/>

    <div v-if="reports.length && !isReset && !isPunished" class="moderation-title">Reports:</div>
    <div v-if="!isReset && !isPunished">
      <div class="report-count" v-for="(value) in reports" :key="value[0]">
        {{ value[0].slice(15) }}: {{ value[1] }}
      </div>
    </div>
    <div class="buttons">
      <button v-if="isLevel" class="moderation-hide-button" @click="showModerationPopup=true">Hide</button>
      <button v-else class="moderation-hide-button" @click="punishUser">Punish</button>
      <button v-if="isLevel" class="moderation-approve-button" @click="approveLevel">Approve</button>
      <button v-else class="moderation-approve-button" @click="resetUserReports">Reset</button>
    </div>
  </div>

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" :config="popupConfig" :identifier="moderationItem.object_info.identifier" />
  </Teleport>
</template>

<style scoped>
.moderation-tools {
  width: 100%;
  display: flex;
  flex-direction: column;
  
}

.moderation-title {
  font-weight: bold;
  margin-left: 10px;
  margin-top: 5px;
}

.moderation-hide-button {
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--red);
  border-radius: 15px;
  cursor: pointer;
}

.moderation-approve-button {
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--green);
  border-radius: 15px;
  cursor: pointer;
}
@media screen and (max-width: 600px) {
  .moderation-hide-button, .moderation-approve-button {
    height: 25px;
    width: 70px;
    font-size: 0.7rem;
  }
}
.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5em;
  padding-top: 0.5em;
  margin-top: auto;
}

.report-count {
  font-size: 0.9rem;
  line-height: 1.1rem;
  margin-left: 15px;
}
</style>
