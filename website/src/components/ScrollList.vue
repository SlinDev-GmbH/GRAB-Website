<script>
import CardLevel from './CardLevel.vue'
import CardUser from './CardUser.vue'
import CardLog from './CardLog.vue'
import DropDown from './DropDown.vue'

import { listRequest } from '../requests/ListRequest.js'
import { resetReportsRequest } from '../requests/ResetReportsRequest'
import { moderationActionRequest } from '../requests/ModerationActionRequest'

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  components: {
    CardLevel,
    CardUser,
    CardLog,
    DropDown
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
      activeLoad: null,
      filterChoice: "All"
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
    filterType() {
            return this.filterChoice.toLowerCase();
    },
    
    sortedItems() {
      if (this.listType !== 'tab_reported_levels') {
        return this.items;
      }

      let filter = this.filterType;
      if (filter === "all") return this.items;

      return [...this.items].sort((a, b) => {
        const scoreA = a[`reported_score_${filter}`] || 0;
        const scoreB = b[`reported_score_${filter}`] || 0;
        return scoreB - scoreA; 
      });
    },

    ...mapState(useUserStore, ['isLoggedIn']),
    ...mapState(useUserStore, ['userID']),
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['isSuperModerator'])
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
      
      this.activeLoad = {
        listType: this.listType,
        difficulty: this.difficulty,
        tag: this.tag,
        searchTerm: this.searchTerm,
        otherUserID: this.otherUserID
      }

      const userStore = useUserStore()

      if(this.loading && 
        this.listType === this.activeLoad?.listType && 
        this.difficulty === this.activeLoad?.difficulty && 
        this.tag === this.activeLoad?.tag && 
        this.searchTerm === this.activeLoad?.searchTerm && 
        this.otherUserID === this.activeLoad?.otherUserID) return

      this.loading = true

      let levels = await this.loadLevels()
      if(this.activeLoad.searchTerm !== this.searchTerm || 
        this.activeLoad.listType !== this.listType ||
        this.activeLoad.difficulty!== this.difficulty ||
        this.activeLoad.tag!== this.tag ||
        this.activeLoad.otherUserID!== this.otherUserID) return

      const processedItems = useUserStore().getProcessedList(this.listType);
      if (processedItems) levels = levels.filter(item => !processedItems.includes(item));
      
      this.items = [...this.items, ...levels]
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
      const promises = this.items.map(async (item) => {
        const userID = item?.object_info?.user_id;
        const reason = this.bestReason(item);        
        const userStore = useUserStore()

        if (!userID) return { success: 0 };
        
        const [actionSuccess, reportsSuccess] = await Promise.all([
          moderationActionRequest(this.$api_server_url, this.accessToken, userID, 'user_' + reason),
          resetReportsRequest(this.$api_server_url, this.accessToken, userID)
        ]);

        if (actionSuccess && reportsSuccess) {
          userStore.pushProcessedList(this.listType, item);
        }

        const success = actionSuccess && reportsSuccess ? 1 : 0;
        return { success };
      });

      const results = await Promise.all(promises);
      const successes = results.reduce((total, result) => total + result.success, 0);
      alert(successes + ' users punished');
      if(this.listType === "tab_reported_users"){
        this.items = [];
      }
    },

    filterByReason(item) {
      let filter = this.filterType;
      if (filter == "all") return true;
      for (let key in item) {
        if (key.startsWith('reported_score_') && key.slice(15).toLowerCase().includes(filter)) {
          return true; 
        }
      }
      return false; 
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
  <button v-if="listType == 'tab_reported_users' && (isAdmin || isSuperModerator)" id="punish-all-button" @click="punishAllUsers">Punish All</button>
  <DropDown v-if="listType == 'tab_reported_levels' && (isAdmin || isSuperModerator)" :options='["All", "Sexual", "Tips", "Violence", "Hatespeech", "Glitch", "Loweffort","Other"]' :defaultChoice='"All"' @changeSelection="filterChoice = $event" style="margin-bottom: 5px;"/>
  <div class="grid-container" :style="listType == 'tab_audit' ? 'grid-template-columns: 1fr' : ''">
    <div v-for="(item, index) in sortedItems" :key="index" class="grid-item" v-show="listType == 'tab_reported_levels'?filterByReason(item):true" >
      <CardUser v-if="wantsUserCells" :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" @profile="showOtherUserLevels" />
      <CardLog v-else-if="listType == 'tab_audit'" :item="item" />
      <CardLevel v-else :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" :bestReason="bestReason(item)" :index="index" :listType="listType" @more="showOtherUserLevels" />
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