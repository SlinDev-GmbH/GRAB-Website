<script>
import { getLevelCountRequest } from '../requests/GetLevelCountRequest.js'
import { useUserStore } from '@/stores/user'

export default {
  props: {
    tagString: String
  },

  data() {
    return {
      count: 0
    }
  },

  computed: {
    listLevelCount()
    {
      const userStore = useUserStore()
      return userStore.list.length
    }
  },

  methods: {
    async updateCounter() {
      this.count = undefined
      if(this.tagString === 'favorite_levels')
      {
        const userStore = useUserStore()
        this.count = userStore.favoriteLevels.length
      }
      else
      {
        const currentTab = this.tagString
        const result = await getLevelCountRequest(this.$api_server_url, this.tagString)
        if(result !== false && currentTab === this.tagString) this.count = result
      }
    }
  },

  created() {
    this.updateCounter()
  },

  watch: {
    tagString(newTab) {
      this.updateCounter()
    }
  }
}
</script>


<template>
  <div v-if="count > 0" class="level-tab-title">
      {{ count }} level{{ count != 1 ? 's' : '' }}
  </div>
  <div v-else class="level-tab-title">
    {{ listLevelCount }} level{{ listLevelCount != 1 ? 's' : '' }}
  </div>
</template>


<style scoped>
.level-tab-title {
  float: right;
  padding-top: 3px;
}
</style>
