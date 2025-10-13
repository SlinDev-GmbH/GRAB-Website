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
    otherUserID: String,
    horizontal: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      items: [],
      loading: false,
      isInitialLoad: true,
      activeLoad: null,
      filterChoice: "All",
      auditFilter: {
        user_name: "User",
        log_type: "Action"
      }
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
    
    ...mapState(useUserStore, ['isLoggedIn', 'userID', 'accessToken', 'isSuperModerator'])
  },

  watch: {
    filterChoice: {
      handler() {
        this.updateVisibleItems();
      },
      immediate: true
    },
    auditFilter: {
      handler() {
        this.updateVisibleItems();
      },
      immediate: true,
      deep: true
    },

    async listType() {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async difficulty() {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async tag() {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    },

    async searchTerm() {
      if(this.isInitialLoad && this.loading) return
      this.items = []
      this.nextPage = null
      await this.loadMore()
    }
  },

  methods: {
    updateVisibleItems() {
      this.items.forEach(item => {
        item.visible = this.itemMatchesFilter(item);
      });
    },

    itemMatchesFilter(item) {
      if (this.listType == 'tab_audit') {
        return (this.auditFilter.user_name === 'User' || item.userInfo?.user_name == this.auditFilter.user_name) &&
          (this.auditFilter.log_type === "Action" || item.request.split(/\/|\?/)[5] == this.auditFilter.log_type);
      } else {
        if (this.filterChoice == "All") return true;
        for (let key in item) {
          if (key.startsWith('reported_score_') && key.slice(15).toLowerCase().includes(this.filterChoice.toLowerCase())) {
            console.log(key);
            return true;
          }
        }
      }
      return false;
    },

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
      
      this.items = [...this.items, ...levels.map(level => ({ ...level, visible: true }))];
      userStore.setList(this.listType, this.items)
      this.loading = false
      this.$emit('loaded')
      this.isInitialLoad = false
    },

    handleScroll() {
      const scrollY = window.scrollY;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.getBoundingClientRect().height;
      if (totalHeight - (scrollY + visibleHeight) < 1 && !this.loading && this.nextPage !== undefined) {
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
      window.toast(successes + ' users punished', "message");
      if(this.listType === "tab_reported_users"){
        this.items = [];
      }
    }

  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },

  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  },
}
</script>


<template>
  <button v-if="listType == 'tab_reported_users' && isSuperModerator" id="punish-all-button" @click="punishAllUsers">Punish All</button>
  <DropDown v-if="listType == 'tab_reported_levels' && isSuperModerator" :options='["All", "Sexual", "Tips", "Violence", "Hatespeech", "Glitch", "Loweffort","Other"]' :defaultChoice='"All"' :flip='true' @changeSelection="filterChoice = $event" style="margin-bottom: 5px;"/>
  <DropDown v-if="listType == 'tab_audit' && isSuperModerator" :options='["User", ...new Set(items.map(e=>e.userInfo?.user_name))]' :defaultChoice='"User"' :flip='true' @changeSelection="auditFilter.user_name = $event" style="margin-bottom: 5px;"/>
  <DropDown v-if="listType == 'tab_audit' && isSuperModerator" :options='["Action", ...new Set(items.map(e=>e.request.split(/\/|\?/)[5]))]' :defaultChoice='"Action"' :flip='true' @changeSelection="auditFilter.log_type = $event" style="margin-bottom: 5px; margin-left: 1rem;"/>
  <div :class="'grid-container' + (this.horizontal ? ' horizontal-list' : '') + (listType == 'tab_audit' ? ' log-list' : '')">
    <div v-for="(item, index) in items" :key="index" v-show="item.visible" class="grid-item">
      <CardUser v-if="wantsUserCells" :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" @profile="showOtherUserLevels" @toggle_role="item[$event] = !item[$event]"/>
      <CardLog v-else-if="listType == 'tab_audit'" :item="item" />
      <CardLevel v-else :item="'object_info' in item? item.object_info : item" :moderationItem="'object_info' in item? item : null" :bestReason="bestReason(item)" :index="index" :listType="listType" @more="showOtherUserLevels" />
    </div>
  </div>
  <div v-if="loading" class="loading">Loading more items...</div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 2rem;
}
@media screen and (max-width: 730px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 0.8rem;
  }
}
@media screen and (max-width: 500px) {
  .grid-container {
    grid-template-columns: 1fr 1fr;
  }
}
.horizontal-list {
  display: flex;
  flex-direction: row;
  width: fit-content;
}
.log-list {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.grid-item {
  min-width: 100%;
}
.grid-item:not(.log-list .grid-item) {
  max-width: 450px;
}
.horizontal-list .grid-item {
  width: 300px;
  min-width: 0;
}
@media screen and (max-width: 600px) {
  .horizontal-list .grid-item:not(.log-list .grid-item) {
    max-width: 200px;
  }
}

.loading {
  margin: 20px 0;
}

#punish-all-button {
  font-weight: bold;
  background-color: var(--red);
  border-radius: 20px;
  cursor: pointer;
  padding: 10px 20px;
  margin-block: 5px;
}
</style>