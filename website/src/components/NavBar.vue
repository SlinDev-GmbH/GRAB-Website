<script>
export default {
  emits: ['tabChanged', 'searchChanged'],

  data() {
    return {
      tabActive: 'tab_newest',
      searchTypingTimer: '',
      searchTerm: ''
    }
  },

  computed: {
    wantsSearch() {
      return this.tabActive === 'tab_newest' || this.tabActive === 'tab_search_users'
    }
  },

  methods: {
   setTabActive(tabName) {
    this.searchTerm = ''
    this.tabActive = tabName
    this.$emit('tabChanged', tabName)
   },

   changedSearchTerm(term) {
    clearTimeout(this.searchTypingTimer);
    this.searchTypingTimer = setTimeout(() => {
      let searchTerm = term
      if(searchTerm && searchTerm.length > 0)
      {
        searchTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '')
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
    <button :class="tabActive==='tab_verified'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_verified')" id="tab_verified">Verified Levels</button>
    <button :class="tabActive==='tab_search_users'? 'tablinks active' : 'tablinks'" @click="setTabActive('tab_search_users')" id="tab_search_users">Players</button>
    <input v-if="wantsSearch" type="text" id="search_field" placeholder="Search.." @input="event => changedSearchTerm(event.target.value)" :value="searchTerm">
  </div>
</template>


<style>
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
  width: 15%;
  padding: 6px;
  border: none;
  margin-top: 8px;
        margin-bottom: 8px;
        border-radius: 5px;
  margin-right: 8px;
  font-size: 14px;
}
</style>