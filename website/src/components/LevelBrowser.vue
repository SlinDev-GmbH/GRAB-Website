<script>
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

  methods: {
    tabChanged(value) {
      this.tabActive = value
    },

    searchChanged(value) {
      this.searchTerm = value
    }
  }
}
</script>

<template>
  <header>
    <LoginButton />
    <img alt="GRAB logo" class="logo" src="../assets/logo.png" width="453" height="180" />
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
  display: flex;
  margin: 0 auto auto auto;
  padding-bottom: 30px;
  height: auto;
}
</style>
