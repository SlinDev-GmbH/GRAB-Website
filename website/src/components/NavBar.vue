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
    ...mapState(useUserStore, ['isLoggedIn', 'isVerifier', 'isSuperModerator'])
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
    <span class="search">
      <input v-if="wantsSearch" spellcheck="false" type="text" id="search_field" placeholder="Search.." @input="event => changedSearchTerm(event.target.value)">
    </span>
  </div>
</template>


<style scoped>
.tab {
  width: 100%;
}

.tab button {
  background-color: var(--button);
  border-radius: var(--rad);
  margin-inline: 0.4rem;
  float: left;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  transition: 0.3s;
  font-weight: bold;
  height: 100%;
  margin-bottom: 0.4rem;
}

.tab button:hover {
  background-color: var(--hover);
}

.tab button.active {
  background-color: var(--hover);
}

.tab input[type=text] {
  width: 100%;
  border-radius: var(--rad);
  padding: 0.8rem 1.2rem;
  background-color: var(--hover);
}
.search {
  min-width: 15%;
  padding-inline: 0.4rem;
  float: right;
  transition: all 0.3s linear;

  &:has(:focus) {
    min-width: min(40%, 400px);
  }
}
.search::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 10px;
  margin-right: 0.4rem;
  transform: translateY(-50%);
  height: 60%;
  aspect-ratio: 1/1;
  background-image: url(./../assets/icons/search.svg);
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.5;
  pointer-events: none;
}
@media screen and (max-width: 630px) {
  .search {
    width: 100%;
    margin-top: 0.5rem;
  }
  .tab button {
    font-size: 12px;
    padding: 0.6rem 1.0rem;
    margin-inline: 0.2rem;
  }
  .tab br {
    display: none;
  }
}
@media screen and (max-width: 400px) {
  .search input[type=text] {
    padding-block: 0.6rem;
  }
  .tab button {
    font-size: 11px;
    padding: 0.4rem 0.8rem;
    margin-inline: 0.15rem;
  }
}
</style>
