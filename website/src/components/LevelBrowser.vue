<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import NavBar from './NavBar.vue'
import ScrollList from './ScrollList.vue'
import LoginButton from './LoginButton.vue'

export default {
  components: {
    NavBar,
    ScrollList,
    LoginButton
  },

  data() {
    return {
      tabActive: 'tab_newest',
      searchTerm: ''
    }
  },

  computed: {
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['accessToken']),
  },

  methods: {
    tabChanged(value) {
      this.tabActive = value
    },

    searchChanged(value) {
      this.searchTerm = value
    },

    openCuration() {
      window.location.href = '/curation/'
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
    <img alt="GRAB logo" class="logo" src="../assets/logo.png" width="453" height="180" />
    <LoginButton />
    <button v-if="isAdmin" class="access-token-button" type="button" @click="copyAccessToken">Acces Token</button>
    <button v-if="isAdmin" class="curation-button" type="button" @click="openCuration">Curation</button>
    <NavBar :tab-active="tabActive" @tab-changed="(value) => this.tabChanged(value)" @search-changed="(value) => this.searchChanged(value)" />
  </header>
  <main>
    <ScrollList :list-type="tabActive" :search-term="searchTerm" @tab-changed="(value) => this.tabChanged(value)"/>
  </main>
</template>

<style>
header {
  padding-bottom: 30px;
}

.logo {
  margin: 0 auto;
  padding-bottom: 30px;
  height: auto;
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
  top: 35px;
  right: 0px;
  position: absolute;
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
  top: 70px;
  right: 0px;
  position: absolute;
}
</style>
