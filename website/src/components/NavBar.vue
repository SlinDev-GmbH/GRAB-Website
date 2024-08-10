<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  emits: ['tabChanged', 'searchChanged'],

  props: {
    tabActive: String,
    searchTerm: String
  },

  data() {
    return {
      searchTypingTimer: ''
    }
  },

  computed: {
    wantsSearch() {
      return this.tabActive === 'tab_newest' || this.tabActive === 'tab_search_users'
    },
    ...mapState(useUserStore, ['isLoggedIn']),
    ...mapState(useUserStore, ['isVerifier']),
    ...mapState(useUserStore, ['isSuperModerator'])
  },

  methods: {
   setTabActive(tabName) {
    this.$emit('tabChanged', {tab: tabName})
   },

   changedSearchTerm(term) {
    clearTimeout(this.searchTypingTimer);
    this.searchTypingTimer = setTimeout(() => {
      let searchTerm = term
      if(searchTerm && searchTerm.length > 0)
      {
        searchTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, ' ')
      }
      this.$emit('searchChanged', searchTerm)
    }, 500);
   }
  }
}
</script>


<template>
  <div class="tab" id="tabbar">
    <button :class="tabActive==='tab_newest'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_newest')" id="tab_newest">All Levels</button>
    <button :class="tabActive==='tab_ok_newest'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_ok_newest')" id="tab_ok_newest">Verified Levels</button>
    <button :class="tabActive==='tab_featured'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_featured')" id="tab_featured">Featured</button>
    <button v-if="isLoggedIn" :class="tabActive==='tab_my_levels'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_my_levels')" id="tab_my_levels">My Levels</button>
    <button v-if="isLoggedIn" :class="tabActive==='tab_favorite_levels'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_favorite_levels')" id="tab_favorite_levels">My Favorites</button>
    <button :class="tabActive==='tab_search_users'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_search_users')" id="tab_search_users">Players</button>
    <br v-if="isVerifier || isSuperModerator"><br v-if="isVerifier || isSuperModerator">
    <button v-if="isVerifier" :class="tabActive==='tab_verify_queue'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_verify_queue')" id="tab_verify_queue">Verify Queue</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_reported_levels'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_reported_levels')" id="tab_reported_levels">Reported Levels</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_reported_users'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_reported_users')" id="tab_reported_users">Reported Users</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_banned_users'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_banned_users')" id="tab_banned_users">Banned Users</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_hidden'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_hidden')" id="tab_hidden">Hidden Levels</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_deletion_queue'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_deletion_queue')" id="tab_deletion_queue">Deletion Queue</button>
    <button v-if="isSuperModerator" :class="tabActive==='tab_audit'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_audit')" id="tab_audit">Audit Log</button>
    <input v-if="wantsSearch" spellcheck="false" type="text" id="search_field" placeholder="Search.." @input="event => changedSearchTerm(event.target.value)" :value="searchTerm">
  </div>
</template>


<style scoped>
.tab {
  width: 100%;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 10px;
}

/* Style the buttons that are used to open the tab content */
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-weight: medium;
  height: 100%;
  font-size: 14px;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

.tab input[type=text] {
  float: right;
  min-width: 15%;
  padding: 6px;
  border: none;
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 5px;
  margin-right: 8px;
  font-size: 14px;
}
</style>
