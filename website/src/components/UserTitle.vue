<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'
import MakeCreatorButton from './MakeCreatorButton.vue'

import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'

export default {

  components: {
    MakeCreatorButton
  },

  props: {
    otherUserID: String
  },

  computed: {
    ...mapState(useUserStore, ['userID'])
  },

  data() {
    return {
      name: undefined,
      identifier: undefined,
      count: undefined,
      isVerified: false,
      isModerator: false,
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

      const currentUserID = this.otherUserID? this.otherUserID : this.userID
      if(!currentUserID) return
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
    </div>
    <div v-if="count" class="user-tab-count">
      Level count: {{ count }}
    </div>
  </div>
</template>


<style scoped>
.user-tab-title-container {
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
}
</style>