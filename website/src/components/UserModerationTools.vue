<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationInfo from './ModerationInfo.vue'
import ModerationPopup from './ModerationPopup.vue'
import MakeCreatorButton from './MakeCreatorButton.vue'

import { moderationActionRequest } from '../requests/ModerationActionRequest'
import { removeModerationActionRequest } from '../requests/RemoveModerationActionRequest'

import { setUserInfoAdmin } from '../requests/SetUserInfoAdmin'


export default {
  components: {
    ModerationInfo,
    ModerationPopup,
    MakeCreatorButton,
  },

  emits: ['handled'],

  props: {
    userInfo : Object,
    userPage : Boolean
  },

  data() {
    return {
      showModerationPopup: false
    }
  },

  computed: {
    popupConfig() {
      return 'user_ban'
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

    async removeModerationAction()
    {
      const userID = this.userInfo.user_id
      if(!await removeModerationActionRequest(this.$api_server_url, this.accessToken, userID)) return
      this.$emit('handled', false)
    },

    async makeVerifier()
    {
      if(confirm("Do you really want to make this user a Verifier?"))
      {
        const userID = this.userInfo.user_id
        await setUserInfoAdmin(this.$api_server_url, this.accessToken, userID, true)
      }
    }
  }
}
</script>

<template>
  <div class="moderation-tools">
    <div v-if="userInfo.moderation_info" class="moderation-title">Current Strike:</div>
    <ModerationInfo v-if="userInfo.moderation_info" :info="userInfo.moderation_info"/>
    <br>
    <div class="punish-buttons">
      <button class="moderation-hide-button" @click="showModerationPopup=true">Punish</button>
      <button class="moderation-approve-button" @click="removeModerationAction">Remove Strike</button>
    </div>
    <br>
    <div class="promote-buttons" v-if="!userPage">
      <button v-if="!this.userInfo.is_verifier && !this.userInfo.is_moderator" class="moderation-verifier-button" @click="makeVerifier">Make Verifier</button>
      <MakeCreatorButton v-if="!this.userInfo.is_creator" :userID="this.userInfo.user_id" />
    </div>
  </div>

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" :config="popupConfig" :identifier="userInfo.user_id" />
  </Teleport>
</template>

<style scoped>
.moderation-tools {
  width: 100%;
  min-height: 0px;
  padding-top: 5%;
  padding-bottom: 5%;
}

.punish-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5em;
}

.promote-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5em;
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
  cursor: pointer;
}

.moderation-approve-button {
  width:30%;
  height: 30px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}
.moderation-verifier-button {
  padding-block: 5px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}
</style>
