<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'

import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'

export default {
  props: {
    otherUserID: String
  },

  computed: {
    ...mapState(useUserStore, ['userID'])
  },

  data() {
    return {
      name: undefined,
      count: undefined,
      isVerified: false,
    }
  },

  methods: {
    async updateCounter() {
      this.count = undefined
      this.name = undefined
      this.isVerified = false

      const currentUserID = this.otherUserID? this.otherUserID : this.userID
      if(!currentUserID) return
      const userInfo = await getUserInfoRequest(this.$api_server_url, currentUserID)
      if(userInfo === false || currentUserID !== (this.otherUserID? this.otherUserID : this.userID)) return
      console.log(userInfo)
      this.count = userInfo.user_level_count
      this.name = userInfo.user_name
      this.isVerified = userInfo.is_creator
    }
  },

  created() {
    this.updateCounter()
  },

  watch: {
    otherUserID(newTab) {
      this.updateCounter()
    }
  }
}
</script>


<template>
  <div class="user-tab-title-container">
    <div v-if="name" class="user-tab-name">
      {{ name }}
      <img v-if="isVerified" alt="OK Stamp" class="creator-icon" src="./../assets/creator.png" />
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
</style>