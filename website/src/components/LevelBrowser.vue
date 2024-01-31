<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import NavBar from './NavBar.vue'
import LevelTitle from './LevelTitle.vue'
import UserTitle from './UserTitle.vue'
import ScrollList from './ScrollList.vue'
import LoginButton from './LoginButton.vue'
import Featured from './Featured.vue'

export default {
  components: {
    NavBar,
    LevelTitle,
    UserTitle,
    ScrollList,
    LoginButton,
    Featured
  },

  data() {
    return {
      tabActive: 'tab_newest',
      searchTerm: '',
      userID: null
    }
  },

  computed: {
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['isModerator']),
    ...mapState(useUserStore, ['accessToken']),
    showLevelTitle() {
      const options = ['tab_newest', 'tab_ok', 'tab_favorite_levels']
      return options.includes(this.tabActive)
    },
    showUserTitle() {
      const options = ['tab_my_levels', 'tab_other_user']
      return options.includes(this.tabActive)
    }
  },

  methods: {
    tabChanged(query) {
      this.tabActive = query.tab
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
    <LevelTitle v-if="showLevelTitle" :tab-active="tabActive"/>
  </header>
  <main>
    <UserTitle v-if="showUserTitle" :other-user-i-d="userID"/>
    <Featured v-if="tabActive === 'tab_featured'" @tab-changed="(query) => this.tabChanged(query)"/>
    <ScrollList v-else :list-type="tabActive" :search-term="searchTerm" :other-user-i-d="userID" @tab-changed="(query) => this.tabChanged(query)"/>
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
