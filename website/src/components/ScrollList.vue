<script>
import CardLevel from './CardLevel.vue'
import CardUser from './CardUser.vue'

import { listRequest } from '../requests/ListRequest.js'
import { resetReportsRequest } from '../requests/ResetReportsRequest'
import { moderationActionRequest } from '../requests/ModerationActionRequest'

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  components: {
    CardLevel,
    CardUser
  },

  emits: ['tabChanged', 'loaded'],

  props: {
    listType: String,
    difficulty: String,
    tag: String,
    searchTerm: String,
    otherUserID: String
  },

  data() {
    return {
      items: [],
      loading: false,
      isInitialLoad: true,
      activeLoad: null
    }
  },

  created() {
    let targetQuery = this.$route.query
    if(Object.keys(targetQuery).length === 0) {
      targetQuery = localStorage.getItem('currentLocation')
      if(targetQuery) {
        localStorage.removeItem('currentLocation')
        targetQuery = JSON.parse(targetQuery)
      }
      else targetQuery = {}
    }
    const userID = targetQuery['user_id']
    let currentTab = targetQuery['tab']
    const currentSearch = targetQuery['search']
    if(!currentTab) currentTab = 'tab_newest'

    if(userID) {
      this.$emit('tabChanged', { tab: 'tab_other_user', user_id: userID })
    }
    // this next line " && currentTab !== 'tab_featured'" is the temporary fix. without it, featured wont work. but with it, the tab wont auto switch
    else if((currentSearch && currentSearch.length > 0) || (currentTab !== this.listType && currentTab !== 'tab_featured')) {
      let query = {tab: currentTab}
      if(currentSearch) query['search'] = currentSearch
      this.$emit('tabChanged', query)
    }
    else {
      this.loadMore();
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

  watch: {
    async listType(type) {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async difficulty(type) {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async tag(type) {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async searchTerm(type) {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    }
  },

  methods: {
    async loadLevels() {
      const result = await listRequest(this.$api_server_url, this.accessToken, this.listType, this.difficulty, this.tag, this.searchTerm, this.$max_level_format_version, this.otherUserID? this.otherUserID : this.userID, this.nextPage)
      if(result !== false) {
        if(result && result.length > 0) this.nextPage = result[result.length - 1].page_timestamp
        else this.nextPage = null
        if(this.listType === 'tab_favorite_levels') return result.reverse()
        return result
      }
      return []
    },

    async loadMore() {
      if(this.loading && 
        this.listType === this.activeLoad?.listType && 
        this.difficulty === this.activeLoad?.difficulty && 
        this.tag === this.activeLoad?.tag && 
        this.searchTerm === this.activeLoad?.searchTerm && 
        this.otherUserID === this.activeLoad?.otherUserID) return

      this.loading = true

      this.activeLoad = {
        listType: this.listType,
        difficulty: this.difficulty,
        tag: this.tag,
        searchTerm: this.searchTerm,
        otherUserID: this.otherUserID
      }

      const levels = await this.loadLevels()
      if(this.activeLoad.searchTerm !== this.searchTerm || 
        this.activeLoad.listType !== this.listType ||
        this.activeLoad.difficulty!== this.difficulty ||
        this.activeLoad.tag!== this.tag ||
        this.activeLoad.otherUserID!== this.otherUserID) return

      this.items = [...this.items, ...levels]
      const userStore = useUserStore()
      userStore.setList(this.items)
      this.loading = false
      this.$emit('loaded')
      this.isInitialLoad = false
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
      this.$emit('tabChanged', {tab: 'tab_other_user', user_id: userID})
    },

    bestReason(item) {
      let bestReason = ''
      let bestReasonScore = 0
      for(var key in item)
      {
        if(key.startsWith('reported_score_'))
        {
          if(item[key] > bestReasonScore)
          {
            bestReasonScore = item[key]
            bestReason = key.slice(15)
          }
        }
      }
      return bestReason
    },

    async punishAllUsers() {
      let successes = 0;
      for (const item of this.items) {
        console.log(item);
        let success = 1;
        const userID = item?.object_info?.user_id;
        const reason = this.bestReason(item);
        if(!userID) break;
        if(!await moderationActionRequest(this.$api_server_url, this.accessToken, userID, 'user_' + reason)) {success = 0};
        if(!await resetReportsRequest(this.$api_server_url, this.accessToken, userID)) {success = 0};
        successes += success;
      }
      alert(successes + ' users punished');
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
  <img v-if="otherUserID == '29sgp24f1uorbc6vq8d2k'" class="rick" src="../assets/rick_astley.png" />
  <button v-if="listType == 'tab_reported_users'" id="punish-all-button" @click="punishAllUsers">Punish All</button>
  <div class="grid-container">
    <div v-for="(item, index) in items" :key="index" class="grid-item">
      <CardUser v-if="wantsUserCells" :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" @profile="showOtherUserLevels" />
      <CardLevel v-else :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" :index="index" :listType="listType" @more="showOtherUserLevels" />
    </div>
  </div>
  <div v-if="loading" class="loading">Loading more items...</div>
</template>


<style scoped>
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

img.rick {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}

#punish-all-button {
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  padding: 10px 20px;
  margin-block: 5px;
}
</style>