<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { reportLevelRequest } from '../requests/ReportLevelRequest'
import { hideLevelRequest } from '../requests/HideLevelRequest'
import { resetReportsRequest } from '../requests/ResetReportsRequest'
import { moderationActionRequest } from '../requests/ModerationActionRequest'
import { GetLevelDetailsRequest } from '../requests/GetLevelDetailsRequest'

export default {
  emits: ['close', 'handled'],
  props: {
    show: Boolean,
    config: String,
    identifier: String
  },
  inject: ['bestReason'],

  data() {
    return {
      currentSelection: '',
      banDuration: undefined,
      message: ''
    }
  },

  computed: {
    options() {
      if(this.config.includes("level_"))
      {
        let reasons = [{reason: 'level_sexual', title: 'Sexual Content / Genitals'},
          {reason: 'level_violence', title: 'Detailed Violence'},
          {reason: 'level_hatespeech', title: 'Inappropriate Language'},
          {reason: 'level_loweffort', title: 'Very low effort level'},
          {reason: 'level_tips', title: 'Asking for Tips'},
          {reason: 'level_other', title: 'Other'}]

          if(this.isSuperModerator && this.config === "level_hide") {
            reasons.push({reason: 'no_punish', title: 'Don\'t punish'})
          }

        return reasons
      }
      else
      {
        return [{reason: 'user_hatespeech', title: 'Inappropriate Language'},
          {reason: 'user_behavior', title: 'Inappropriate Behavior'},
          {reason: 'user_noise', title: 'Loud music / Screeching / other weird noises'},
          {reason: 'user_editor', title: 'Building inappropriate things in the editor'},
          {reason: 'user_tips', title: 'Repeatedly asking for Tips'},
          {reason: 'user_other', title: 'Other'}]
      }
    },

    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isSuperModerator'])
  },
  created(){
    if(this.bestReason){
      this.currentSelection=(this.config.includes("level_")?'level_':'user_')+this.bestReason;
    }
  },
  methods: {
    async doModerationAction() {
      const reason = this.currentSelection;
      this.$emit('close')
      if(this.config === 'level_hide')
      {
        if(!await hideLevelRequest(this.$api_server_url, this.accessToken, this.identifier)) return //Hide the level and reset reports on it

        let noPunish = (reason === 'no_punish')
        if(reason === 'level_tips')
        {
          const result = await GetLevelDetailsRequest(this.$api_server_url, this.identifier)
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
        }

        const userID = this.identifier.split(':')[0]

        if(!noPunish || this.message)
        {
          if(!await moderationActionRequest(this.$api_server_url, this.accessToken, userID, reason, 0, this.message)) return
        }

        if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) return //This just resets reports on the user (since a moderation action is being taken on them alread)
      }
      else if(this.config === 'level_report')
      {
        if(!await reportLevelRequest(this.$api_server_url, this.accessToken, this.identifier, reason.replace('level_', ''))) return
      }
      else if(this.config === 'user_ban')
      {
        const duration = this.banDuration * 24 * 60 * 60;
        if(!await moderationActionRequest(this.$api_server_url, this.accessToken, this.identifier, reason, duration)) return
        if(!await resetReportsRequest(this.$api_server_url, this.accessToken, this.identifier)) return
      }
      this.$emit('handled', true)
    }
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div v-if="config==='level_hide'" class="modal-header">Hide Level</div>
        <div v-else-if="config==='level_report'" class="modal-header">Report Level</div>
        <div v-else-if="config==='user_report'" class="modal-header">Report User</div>
        <div v-else-if="config==='user_ban'" class="modal-header">Ban User</div>

        <div class="modal-body">
          <form>
            <select style="width: 70%" v-model="currentSelection">
              <option value="">- Select -</option>
              <option v-for="(reason) in options" :id="reason.reason" :value="reason.reason" :key="reason.reason">
              {{ reason.title }}
              </option>
            </select>

            <textarea v-if="config==='level_hide'" v-model="message" id="message" placeholder="Optional Message"></textarea>
            <input v-if="config==='user_ban'" v-model="banDuration" type="number" style="width: 70%" placeholder="Duration (days)">
          </form>
        </div>

        <div class="modal-footer">
          <button class="modal-default-button" @click="doModerationAction">OK</button>
          <button class="modal-cancel-button" @click="$emit('close', false)">CANCEL</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>

#message {
  width: 100%;
  height: 60px;
  resize: none;
  margin-top: 10px;
  margin-bottom: 10px;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: fit-content;
  margin: auto;
  padding: 20px 30px;
  background-color: var(--background);
  border: 2px solid var(--hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.modal-header {
  color: var(--red);
  font-size: 18px;
  font-weight: bold;
}

.modal-body {
  margin: 20px 0;
}

.modal-body textarea, .modal-body input, .modal-body select {
  background-color: var(--hover);
  border-radius: 15px;
  padding: 0.5rem;
}
.modal-body form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-default-button {
  float: right;
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--blue);
  border-radius: 15px;
  cursor: pointer;
}
.modal-cancel-button {
  float: right;
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--red);
  border-radius: 15px;
  cursor: pointer;
  margin-right: 5px;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>