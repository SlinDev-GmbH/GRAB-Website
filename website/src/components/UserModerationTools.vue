<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationInfo from './ModerationInfo.vue'
import ModerationPopup from './ModerationPopup.vue'
import SetCreatorButton from './SetCreatorButton.vue'
import SetVerifierButton from './SetVerifierButton.vue'
import SetModeratorButton from './SetModeratorButton.vue'

import { removeModerationActionRequest } from '../requests/RemoveModerationActionRequest'

export default {
  components: {
    ModerationInfo,
    ModerationPopup,
    SetCreatorButton,
    SetVerifierButton,
    SetModeratorButton
  },

  emits: ['handled'],

  props: {
    userInfo: Object,
    userPage: Boolean
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
      if (handled === true) {
        this.$emit('handled', true)
      }
    },

    async removeModerationAction() {
      const userID = this.userInfo.user_id
      if (!await removeModerationActionRequest(this.$api_server_url, this.accessToken, userID)) return
      this.$emit('handled', false)
    }
  }
}
</script>

<template>
  <div class="moderation-tools">
    <ModerationInfo v-if="userInfo.moderation_info && !userPage" :info="userInfo.moderation_info"/>

    <div class="punish-buttons" :style="userPage ? '' : 'padding-top: 0.5em;'">
      <button class="moderation-hide-button" @click="showModerationPopup=true">Punish</button>
      <button class="moderation-approve-button" @click="removeModerationAction">Pardon</button>
    </div>

    <div class="promote-buttons" v-if="!userPage">
      <SetCreatorButton :userID="this.userInfo.user_id" :isCreator="this.userInfo.is_creator"/>
      <SetVerifierButton :userID="this.userInfo.user_id" :isVerifier="this.userInfo.is_verifier"/>
      <SetModeratorButton :userID="this.userInfo.user_id" :isModerator="this.userInfo.is_moderator"/>
    </div>
  </div>

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" :config="popupConfig" :identifier="userInfo.user_id" />
  </Teleport>
</template>

<style scoped>
.moderation-tools {
  width: 100%;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
}

.punish-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5em;
  margin-top: auto;
}

.promote-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5em;
  padding-top: 0.5rem;
}

.moderation-title {
  font-weight: bold;
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
  .promote-buttons {
    gap: 3px;
    flex-wrap: wrap;
  }
}
</style>
