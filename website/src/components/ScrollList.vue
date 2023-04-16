<script>
import CardLevel from './CardLevel.vue'
import CardUser from './CardUser.vue'

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  components: {
    CardLevel,
    CardUser
  },

  props: {
    listType: String,
    searchTerm: String
  },

  data() {
    return {
      items: [],
      loading: false,
      currentSearchTerm: ''
    }
  },

  computed: {
    wantsUserCells() {
      const types = ['tab_search_users', 'tab_reported_users', 'tab_banned_users']
      return types.includes(this.listType)
    },
    wantsModerationUserCells() {
      const types = ['tab_reported_users']
      return types.includes(this.listType)
    },
    wantsModerationLevelCells() {
      const types = ['tab_reported_levels']
      return types.includes(this.listType)
    },
    ...mapState(useUserStore, ['isLoggedIn']),
    ...mapState(useUserStore, ['userID']),
    ...mapState(useUserStore, ['accessToken'])
  },

  created() {
    this.loadMore();
  },

  watch: {
    async listType(type) {
      this.currentSearchTerm = ''
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async searchTerm(type) {
      this.currentSearchTerm = type
      this.items = []
      this.nextPage = null
      await this.loadMore()
    }
  },

  methods: {
    async loadLevels() {
      let requestURL = this.$api_server_url + 'list?max_format_version=' + this.$max_level_format_version
      if(this.listType === 'tab_newest')
      {
        if(this.currentSearchTerm && this.currentSearchTerm.length > 0) requestURL += '&type=search&search_term=' + this.currentSearchTerm
      }
      else if(this.listType === 'tab_verified')
      {
        requestURL += '&type=ok'
      }
      else if(this.listType === 'tab_my_levels')
      {
        requestURL += '&user_id=' + this.userID
      }
      else if(this.listType === 'tab_favorite_levels')
      {
        requestURL = this.$api_server_url + 'get_favorite_levels'
      }
      else if(this.listType === 'tab_search_users')
      {
        requestURL += '&type=user_name&search_term=' + this.currentSearchTerm
      }
      else if(this.listType === 'tab_hidden')
      {
        requestURL += '&type=hidden'
      }
      else if(this.listType === 'tab_reported_levels')
      {
        requestURL = this.$api_server_url + 'report_list?type=level&max_format_version=' + this.$max_level_format_version;
      }
      else if(this.listType === 'tab_reported_users')
      {
        requestURL = this.$api_server_url + 'report_list?type=user';
      }
      else if(this.listType === 'tab_banned_users')
      {
        requestURL = this.$api_server_url + 'report_list?type=banned_user';
      }

      if(this.nextPage) requestURL += '&page_timestamp=' + this.nextPage

      let headers = {}
      if(this.isLoggedIn) headers['Authorization'] = 'Bearer ' + this.accessToken
      const response = await fetch(requestURL, { headers: headers })
      if(response.status == 200) {
        const result = await response.json()
        if(result && result.length > 0) this.nextPage = result[result.length - 1].page_timestamp
        else this.nextPage = null
        if(this.listType === 'tab_favorite_levels') return result.reverse()
        return result
      }
      return []
    },

    async loadMore() {
      this.loading = true

      const activeListType = this.listType
      const activeSearchTerm = this.currentSearchTerm

      const levels = await this.loadLevels()
      if(activeSearchTerm !== this.currentSearchTerm || activeListType !== this.listType) return

      console.log(levels)

      this.items = [...this.items, ...levels]
      this.loading = false
    },

    handleScroll() {
      const scrollY = window.scrollY;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollY + visibleHeight >= totalHeight && !this.loading && this.nextPage !== undefined) {
        this.loadMore();
      }
    },
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },

  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
}
</script>


<template>
  <div class="grid-container">
    <div v-for="(item, index) in items" :key="index" class="grid-item">
      <CardUser v-if="wantsUserCells" :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" />
      <CardLevel v-else :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" />
    </div>
  </div>
  <div v-if="loading" class="loading">Loading more items...</div>
</template>


<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 5px;
}

.grid-item {
  min-width: 0;
}

.loading {
  margin: 20px 0;
}
</style>