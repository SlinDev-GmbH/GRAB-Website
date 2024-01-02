<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationInfo from './ModerationInfo.vue'
import ModerationPopup from './ModerationPopup.vue'

import { moderationActionRequest } from '../requests/ModerationActionRequest'
import { removeModerationActionRequest } from '../requests/RemoveModerationActionRequest'

import { setUserInfoAdmin } from '../requests/SetUserInfoAdmin'


export default {
  components: {
    ModerationInfo,
    ModerationPopup
  },

  emits: ['handled'],

  props: {
    userInfo : Object
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
    <button class="moderation-hide-button" @click="showModerationPopup=true">Punish</button>
    <button class="moderation-approve-button" @click="removeModerationAction">Remove Strike</button>

    <br><br>
    <button class="moderation-approve-button" @click="makeVerifier">Make Verifier</button>

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
</style>
