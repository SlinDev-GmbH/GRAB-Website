<script>
import CardLevel from './CardLevel.vue'
import CardUser from './CardUser.vue'
import { listRequest } from '../requests/ListRequest.js'

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  components: {
    CardLevel,
    CardUser
  },

  emits: ['tabChanged'],

  props: {
    listType: String,
    searchTerm: String
  },

  data() {
    return {
      items: [],
      loading: false,
      currentSearchTerm: '',
      otherUserID: null
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
    const userID = this.$route.query['user_id']
    if(userID) {
      this.otherUserID = userID
      this.$emit('tabChanged', 'tab_other_user')
    }
    else this.loadMore();
  },

  watch: {
    async listType(type) {
      this.currentSearchTerm = ''
      if(type !== 'tab_other_user') this.otherUserID = null
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
      const result = await listRequest(this.$api_server_url, this.accessToken, this.listType, this.currentSearchTerm, this.$max_level_format_version, this.otherUserID? this.otherUserID : this.userID, this.nextPage)
      if(result !== false) {
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

    async showOtherUserLevels(userID) {
      this.otherUserID = userID
      this.$emit('tabChanged', 'tab_other_user')
    }
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
      <CardLevel v-else :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" @more="showOtherUserLevels" />
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