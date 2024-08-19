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

import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'
import { getUserCurrencyRequest } from '../requests/GetUserCurrencyRequest.js'

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
    ...mapState(useUserStore, ['userID']),
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['isSuperModerator']),
    ...mapState(useUserStore, ['accessToken'])
  },

  data() {
    return {
      name: undefined,
      identifier: undefined,
      count: undefined,
      isVerified: false,
      isVerifier: false,
      isModerator: false,
      currencyData: undefined,
      loaded: false,
      userInfo: undefined,
      showPurchaseHistory: false,
      showModerationHistory: false
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
      this.loaded = false
      this.currencyData = undefined

      const currentUserID = this.otherUserID? this.otherUserID : this.userID
      if(!currentUserID) return
      if (this.userID == currentUserID) {
        this.currencyData = await getUserCurrencyRequest(this.$api_server_url, this.accessToken);
      }
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
      this.loaded = true
    }
  },

  created() {
    this.updateDetails()
  },

  watch: {
    otherUserID(newTab) {
      this.updateDetails()
    }
  }
}
</script>


<template>
  <div class="user-tab-title-container">
    <div v-if="name" class="user-tab-name">
      {{ name }}
      <img v-if="isVerified" alt="Creator" title="Creator" class="creator-icon" src="./../assets/creator.png" />
      <img v-if="isModerator" alt="Moderator" title="Moderator" class="moderator-icon" src="./../assets/moderator.png" />
    </div>
    <div v-if="count" class="user-tab-count">
      {{ count }} level{{ count > 1 ? 's' : '' }}
    </div>
    <div class="user-buttons">
      <a v-if="loaded" class="player-button" :href="'player?user_id='+identifier">View</a>
    </div>
  </div>
  <div v-if="currencyData" class="user-tab-currency-container">
    <div class="user-tab-currency">
      {{ currencyData.currency }} coin{{ currencyData.currency > 1 ? 's' : '' }}
    </div>
    <div class="user-tab-total-tips">
      ({{ currencyData.tips_total }} tip{{ currencyData.tips_total > 1 ? 's' : '' }})
    </div>
    <div v-if="currencyData.tips && currencyData.tips > 0" class="user-tab-unclaimed-tips">
      {{ currencyData.tips }} unclaimed tip{{ currencyData.tips > 1 ? 's' : '' }}!
    </div>
  </div>
  <div class="user-tab-admin-container" v-if="loaded && isAdmin">
    <div class="user-buttons">
      <SetCreatorButton v-if="loaded" :userID="identifier" :isCreator="isVerified"/>
      <SetVerifierButton v-if="loaded" :userID="identifier" :isVerifier="isVerifier"/>
      <SetModeratorButton v-if="loaded" :userID="identifier" :isModerator="isModerator"/>
      <GiftCosmeticButton v-if="loaded" :userID="identifier"/>
      <SetComplexityOverrideButton v-if="loaded" :userID="identifier"/>
      <button class="history-button" @click="this.showPurchaseHistory = !this.showPurchaseHistory">Purchase History</button>
      <button class="history-button" @click="this.showModerationHistory = !this.showModerationHistory">Moderation History</button>
    </div>
  </div>
  <div v-if="loaded && (isSuperModerator || isAdmin)" class="user-tab-moderation-container">
    <UserModerationTools v-if="loaded && (isSuperModerator || isAdmin)" :user-info="userInfo" :user-page="true"/>
  </div>
  <PurchaseHistory v-if="showPurchaseHistory && loaded && isAdmin" :userID="identifier" :show="showPurchaseHistory"/>
  <ModerationHistory v-if="showModerationHistory && loaded && isAdmin" :userID="identifier" :show="showModerationHistory"/>
</template>


<style scoped>
.user-tab-title-container, .user-tab-currency-container, .user-tab-moderation-container, .user-tab-admin-container {
  width: 100%;
  height: 50px;
  min-height: 50px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
}
.user-tab-admin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  flex-direction: column;
}
.user-tab-moderation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.user-tab-name {
  vertical-align: middle;
  line-height: 50px;
  font-size: 20px;
  font-weight: bold;
  float: left;
}
.user-tab-count {
  vertical-align: middle;
  line-height: 50px;
  float: right;
}
.user-tab-currency {
  vertical-align: middle;
  line-height: 50px;
  float: left;
  font-weight: bold;
  font-size: 16px;
  margin-right: 5px;
}
.user-tab-total-tips {
  vertical-align: middle;
  line-height: 49px;
  float: left;
  margin-top: 1px;
  font-size: 12px;
}
.user-tab-unclaimed-tips {
  vertical-align: middle;
  line-height: 50px;
  float: right;
  font-weight: 600;
}
.creator-icon {
  width: 20px;
  height: 20px;
  margin-left: 3px;
  position: relative;
  top: 3px;
}

.moderator-icon {
  width: 20px;
  height: 20px;
  margin-left: 6px;
  position: relative;
  top: 3px;
}
.user-buttons {
  float: left;
  margin-inline: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 5px;
}

.player-button {
  padding: 2px 5px 1px 5px;
  font-weight: bold;
  background-color: #4642BE;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}
.history-button {
  padding: 5px 10px;
  font-weight: bold;
  background-color: #4642BE;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}
</style>