<script>
import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { useUserStore } from '@/stores/user'

export default {
  props: {
    tabActive: String
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