<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'
import SetCreatorButton from './SetCreatorButton.vue'
import SetVerifierButton from './SetVerifierButton.vue'
import SetModeratorButton from './SetModeratorButton.vue'
import SetComplexityOverrideButton from './SetComplexityOverrideButton.vue'
import GiftCosmeticButton from './GiftCosmeticButton.vue'
import UserModerationTools from './UserModerationTools.vue'
import PurchaseHistory from './PurchaseHistory.vue'
import ModerationHistory from './ModerationHistory.vue'

import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'

export default {

  components: {
    SetCreatorButton,
    SetVerifierButton,
    SetModeratorButton,
    GiftCosmeticButton,
    UserModerationTools,
    PurchaseHistory,
    ModerationHistory,
    SetComplexityOverrideButton
  },

  props: {
    otherUserID: String
  },

  computed: {
    profileGradient() {
      const color1 = this.userInfo?.active_customizations?.player_color_primary?.color;
      const color2 = this.userInfo?.active_customizations?.player_color_secondary?.color;
      if (color1 && color1.length == 3 && color2 && color2.length == 3) {
        const rgb1 = `rgb(${color1[0] * 255}, ${color1[1] * 255}, ${color1[2] * 255})`;
        const rgb2 = `rgb(${color2[0] * 255}, ${color2[1] * 255}, ${color2[2] * 255})`;
        return `background-image: linear-gradient(to bottom right, ${rgb1}, ${rgb2})`
      }
      return '';
    },

    ...mapState(useUserStore, ['userID', 'isAdmin', 'isSuperModerator', 'accessToken'])
  },

  data() {
    return {
      name: undefined,
      identifier: undefined,
      count: undefined,
      isVerified: false,
      isVerifier: false,
      isModerator: false,
      isDeveloper: false,
      loaded: false,
      userInfo: undefined,
      showPurchaseHistory: false,
      showModerationHistory: false,
      copied: false
    }
  },

  methods: {
    async updateDetails() {
      this.count = undefined
      this.name = undefined
      this.identifier = undefined
      this.isVerified = false
      this.isVerifier = false
      this.isModerator = false
      this.isDeveloper = false
      this.loaded = false

      const currentUserID = this.otherUserID? this.otherUserID : this.userID
      if(!currentUserID) return
      const userInfo = await getUserInfoRequest(this.$api_server_url, currentUserID)
      if(userInfo === false || currentUserID !== (this.otherUserID? this.otherUserID : this.userID)) return
      console.log(userInfo)
      this.userInfo = userInfo
      this.identifier = userInfo.user_id
      this.count = userInfo.user_level_count
      this.name = userInfo.user_name
      this.isVerified = userInfo.is_creator
      this.isVerifier = userInfo.is_verifier
      this.isModerator = userInfo.is_moderator
      this.isDeveloper = userInfo.is_admin
      this.loaded = true
    },

    copyId() {
      navigator.clipboard.writeText(this.identifier);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  },

  created() {
    this.updateDetails()
  },

  watch: {
    otherUserID() {
      this.updateDetails()
    }
  }
}
</script>


<template>
  <div class="user-title-wrapper" :style="(loaded && !isSuperModerator) ? 'padding-bottom: 1rem;' : '' ">
    <div class="user-tab-title-container">
      <div class="profile-icon" :style="profileGradient"></div>
      <div>
        <div v-if="name" class="user-tab-name">
          {{ name }}
          <img v-if="isVerified" alt="Creator" title="Creator" class="creator-icon" src="./../assets/creator.png" />
          <span v-if="isModerator" title="Moderator" class="moderator-icon">M</span>
          <span v-if="isDeveloper" title="Developer" class="developer-icon">D</span>
          <div class="user-buttons">
            <a v-if="loaded" class="player-button" :href="'player?user_id='+identifier">View</a>
          </div>
        </div>
        <div v-if="count" class="user-tab-count">
          {{ count }} level{{ count > 1 ? 's' : '' }}
        </div>
      </div>
      <div v-if="loaded && isAdmin" class="history-buttons">
        <button class="history-button" @click="this.showPurchaseHistory = !this.showPurchaseHistory">
          Purchases
          <img src="./../assets/icons/clock.svg" alt="history">
        </button>
        <button class="history-button" @click="this.showModerationHistory = !this.showModerationHistory">
          Moderation
          <img src="./../assets/icons/clock.svg" alt="history">
        </button>
      </div>
    </div>
    <div>
      <div v-if="loaded && isSuperModerator" class="user-id">
        <span>{{ identifier }}</span>
        <button class="copy" @click="copyId">
          <img v-show="!copied" src="./../assets/icons/copy.svg">
          <img v-show="copied" src="./../assets/icons/copied.svg">
        </button>
      </div>
      <div v-if="loaded && isSuperModerator" class="user-tab-moderation-container">
        <UserModerationTools v-if="loaded && (isSuperModerator || isAdmin)" :user-info="userInfo" :user-page="true"/>
      </div>
    </div>
  </div>
  <div class="user-tab-admin-container" v-if="loaded && isAdmin">
    <div class="user-buttons">
      <div>
        <SetCreatorButton v-if="loaded" :userID="identifier" :isCreator="isVerified"/>
        <SetVerifierButton v-if="loaded" :userID="identifier" :isVerifier="isVerifier"/>
        <SetModeratorButton v-if="loaded" :userID="identifier" :isModerator="isModerator"/>
      </div>
      <div>
        <GiftCosmeticButton v-if="loaded" :userID="identifier"/>
        <SetComplexityOverrideButton v-if="loaded" :userID="identifier"/>
      </div>
    </div>
  </div>
  <PurchaseHistory v-if="showPurchaseHistory && loaded && isAdmin" :userID="identifier" :show="showPurchaseHistory"/>
  <ModerationHistory v-if="showModerationHistory && loaded && isAdmin" :userID="identifier" :show="showModerationHistory"/>
</template>


<style scoped>

.user-title-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  align-items: center;
}
.user-tab-title-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: fit-content;
  flex-direction: row;
  background-color: var(--hover);
  padding: 0.5rem 1rem;
  border-radius: 15px;
  width: 100%;
}
.user-tab-admin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  width: fit-content;
  flex-direction: column;
  padding-inline: 10px;
  padding-bottom: 1rem;
}
.user-tab-moderation-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  padding-inline: 10px;
  width: fit-content;
  padding-bottom: 1rem;
}

.user-tab-name {
  font-size: 20px;
  font-weight: 600;
  margin-right: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
.user-tab-count {
  margin-left: auto;
  opacity: 0.7;
}
.creator-icon {
  width: 20px;
  height: 20px;
}

.moderator-icon {
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #DE9343;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.developer-icon {
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #DD3619;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  height: 60px;
  width: 60px;
  aspect-ratio: 1/1;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 10px;
  margin-block: 0.5rem;
  margin-right: 1rem;
}
.user-buttons {
  float: left;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}
.user-buttons > div {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}

.player-button {
  padding: 2px 8px 1px 8px;
  font-weight: bold;
  background-color: var(--blue);
  color: white;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}
.history-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-left: auto;
}
.history-button {
  padding: 5px 10px;
  padding-right: 6px;
  font-weight: bold;
  background-color: var(--blue);
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}
.history-button img {
  height: 16px;
  width: 16px;
}

.user-id {
  font-size: 15px;
  font-style: italic;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  padding-inline: 10px;
}
.user-id span {
  opacity: 0.5;
}
.copy {
  cursor: pointer;
  background-color: transparent;
  transition: transform 0.2s ease-in-out;
  display: grid;
  place-content: center;
  padding: 3px;
  border-radius: 5px;
}
.copy:hover {
  background-color: var(--hover);
}
.copy img {
  height: 1rem;
  width: 1rem;
}
</style>