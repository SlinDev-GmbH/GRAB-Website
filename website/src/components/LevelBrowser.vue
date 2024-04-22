<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import NavBar from './NavBar.vue'
import LevelTitle from './LevelTitle.vue'
import UserTitle from './UserTitle.vue'
import ScrollList from './ScrollList.vue'
import LoginButton from './LoginButton.vue'
import Featured from './Featured.vue'
import LevelDifficultySortingControls from './LevelDifficultySortingControls.vue'
import LevelTagSortingControls from './LevelTagSortingControls.vue'

export default {
  components: {
    NavBar,
    LevelTitle,
    UserTitle,
    ScrollList,
    LoginButton,
    Featured,
    LevelDifficultySortingControls,
    LevelTagSortingControls,
  },

  data() {
    return {
      tabActive: 'tab_newest',
      searchTerm: '',
      userID: null,
      difficultyFilter: '',
      tagFilter: '',
      isLoading: false
    }
  },

  computed: {
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['isModerator']),
    ...mapState(useUserStore, ['accessToken']),
    showLevelTitle() {
      const options = ['tab_newest', 'tab_ok_newest', 'tab_favorite_levels','tab_verify_queue']
      return options.includes(this.tabActive)
    },
    showSortingControls() {
      const options = ['tab_newest', 'tab_ok_newest']
      return options.includes(this.tabActive)
    },
    showUserTitle() {
      const options = ['tab_my_levels', 'tab_other_user']
      return options.includes(this.tabActive)
    },
    tagString() {
      if (this.tabActive === 'tab_favorite_levels') return 'favorite_levels'
      if (this.tabActive === 'tab_verify_queue') return 'verify_queue'
      return (this.tabActive == 'tab_ok_newest' ? 'ok_' : '') + (this.tagFilter == '' ? '' : this.tagFilter + '_') + 'newest' + (this.difficultyFilter == '' ? '' : '_' + this.difficultyFilter)
    }
  },

  methods: {
    tabChanged(query) {
      this.tabActive = query.tab
      this.difficultyFilter = ''
      this.tagFilter = ''
      if('search' in query) this.searchTerm = query['search']
      else this.searchTerm = ''
      if('user_id' in query) this.userID = query['user_id']
      else this.userID = null
      this.$router.push({ query: query})
    },

    searchChanged(value) {
      this.userID = null
      this.searchTerm = value
      let query = {
        tab: this.tabActive
      }
      if(value && value.length > 0) query['search'] = value
      this.$router.push({ query: query })
    },

    async copyAccessToken(event)
    {
      await navigator.clipboard.writeText(this.accessToken);
    },

    difficultyChanged(filter) {
      this.isLoading = true;
      this.difficultyFilter = filter;
    },

    tagChanged(filter) {
      this.isLoading = true;
      this.tagFilter = filter;
    },

    loaded() {
      this.isLoading = false;
    }
  }
}
</script>

<template>
  <header>
    <img alt="GRAB logo" class="logo" src="../assets/logo.png" />
    <LoginButton />
    <a v-if="isModerator" class="curation-button" type="button" href="/curation" target="_blank">Curation</a>
    <button v-if="isAdmin" class="access-token-button" type="button" @click="copyAccessToken">Access Token</button>
    <NavBar :tab-active="tabActive" @tab-changed="(query) => this.tabChanged(query)" @search-changed="(value) => this.searchChanged(value)" :search-term="searchTerm" />
    <LevelDifficultySortingControls v-if="showSortingControls" :currentTab="tabActive" :isLoading="isLoading" @filter="difficultyChanged" />
    <LevelTagSortingControls v-if="showSortingControls" :currentTab="tabActive" :isLoading="isLoading" @filter="tagChanged" />
    <LevelTitle v-if="showLevelTitle" :tagString="tagString"/>
  </header>
  <main>
    <UserTitle v-if="showUserTitle" :other-user-i-d="userID"/>
    <Featured v-if="tabActive === 'tab_featured'" @tab-changed="(query) => this.tabChanged(query)"/>
    <ScrollList v-else :list-type="tabActive" :difficulty="difficultyFilter" :tag="tagFilter" :search-term="searchTerm" :other-user-i-d="userID" @tab-changed="(query) => this.tabChanged(query)" @loaded="loaded"/>
  </main>
</template>

<style scoped>
header {
  padding-bottom: 30px;
}

.logo {
  margin: 0 auto;
  padding-bottom: 30px;
  height: auto;
  max-width: 50%;
  display: block;
}

@media screen and (max-width: 500px) {
  .logo {
    padding-bottom: 5px;
  }
}

.access-token-button {
  width: 120px;
  height:  30px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 15px;
  box-sizing: border-box;
  text-decoration: none;
  background-color: burlywood;
  color: #FFFFFF;
  text-align: center;
  border: none;
  top: 70px;
  right: 0px;
  position: absolute;
  cursor: pointer;
}

.curation-button {
  width: 120px;
  height:  30px;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 15px;
  box-sizing: border-box;
  text-decoration: none;
  background-color: #00BC87;
  color: #FFFFFF;
  text-align: center;
  border: none;
  top: 35px;
  right: 0px;
  position: absolute;
  cursor: pointer;
  padding-block: 3px;
}
</style>
