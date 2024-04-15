<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'
import MakeCreatorButton from './MakeCreatorButton.vue'

import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'
import { getUserCurrencyRequest } from '../requests/GetUserCurrencyRequest.js'

export default {

  components: {
    MakeCreatorButton
  },

  props: {
    otherUserID: String
  },

  computed: {
    ...mapState(useUserStore, ['userID']),
    ...mapState(useUserStore, ['accessToken'])
  },

  data() {
    return {
      name: undefined,
      identifier: undefined,
      count: undefined,
      isVerified: false,
      isModerator: false,
      currencyData: undefined,
      loaded: false
    }
  },

  methods: {
    async updateDetails() {
      this.count = undefined
      this.name = undefined
      this.identifier = undefined
      this.isVerified = false
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
      this.identifier = userInfo.user_id
      this.count = userInfo.user_level_count
      this.name = userInfo.user_name
      this.isVerified = userInfo.is_creator
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
    <div class="user-buttons">
      <MakeCreatorButton v-if="loaded && !isVerified" :userID="identifier"/>
      <a v-if="loaded" class="player-button" :href="'player?user_id='+identifier">View</a>
    </div>
    <div v-if="count" class="user-tab-count">
      {{ count }} level{{ count > 1 ? 's' : '' }}
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
</template>


<style scoped>
.user-tab-title-container, .user-tab-currency-container {
  width: 100%;
  height: 50px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
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
</style>