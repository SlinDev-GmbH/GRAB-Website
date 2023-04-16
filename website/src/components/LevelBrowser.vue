<script>
import NavBar from './NavBar.vue'
import ScrollList from './ScrollList.vue'

export default {
  components: {
    NavBar,
    ScrollList
  },

  data() {
    return {
      tabActive: 'tab_newest'
    }
  },

  methods: {
    tabChanged(value) {
      this.tabActive = value
    }
  }
}
</script>

<template>
  <header>
    <img alt="GRAB logo" class="logo" src="../assets/logo.png" width="453" height="180" />
    <NavBar @tab-changed="(value) => this.tabChanged(value)" />
  </header>
  <main>
    <ScrollList :list-type="tabActive" />
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
