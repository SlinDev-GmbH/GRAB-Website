<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'

import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { getUserInfoRequest } from '../requests/GetUserInfoRequest.js'

export default {
  props: {
    tabActive: String,
    otherUserID: String
  },

  computed: {
    ...mapState(useUserStore, ['userID'])
  },

  data() {
    return {
      count: 0
    }
  },

  methods: {
    async updateCounter() {
      this.count = undefined
      if(this.tabActive === 'tab_favorite_levels')
      {
        const userStore = useUserStore()
        this.count = userStore.favoriteLevels.length
      }
      else if(this.tabActive === 'tab_my_levels' || this.tabActive === 'tab_other_user')
      {
        const currentUserID = this.otherUserID? this.otherUserID : this.userID
        if(!currentUserID) return
        console.log(currentUserID)
        const userInfo = await getUserInfoRequest(this.$api_server_url, currentUserID)
        if(userInfo === false || currentUserID !== (this.otherUserID? this.otherUserID : this.userID)) return
        this.count = userInfo.user_level_count
      }
      else
      {
        const currentTab = this.tabActive
        const result = await getLevelCountRequest(this.$api_server_url, this.tabActive.replace('tab_', ''))
        if(result !== false && currentTab === this.tabActive) this.count = result
      }
    }
  },

  created() {
    this.updateCounter()
  },

  watch: {
    tabActive(newTab) {
      this.updateCounter()
    }
  }
}
</script>


<template>
  <div v-if="count" class="level-tab-title">
    Level count: {{ count }}
  </div>
</template>


<style>
.level-tab-title {
  float: right;
}
</style>