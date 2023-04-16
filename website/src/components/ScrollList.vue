<script>
import CardLevel from './CardLevel.vue'
import CardUser from './CardUser.vue'

export default {
  components: {
    CardLevel,
    CardUser
  },

  props: {
    listType: String
  },

  data() {
    return {
      items: [],
      loading: false
    }
  },

  computed: {
    wantsUserCells() {
      return this.listType === 'tab_search_users'
    }
  },

  created() {
    this.loadMore();
  },

  watch: {
    async listType(type) {
      this.items = []
      this.nextPage = null
      await this.loadMore()
    }
  },

  methods: {
    async loadLevels() {
      let requestURL = this.$api_server_url + 'list'
      if(this.listType === 'tab_search_users') requestURL += '?type=user_name&search_term=slin'
      else requestURL += '?max_format_version=' + this.$max_level_format_version
      if(this.listType === 'tab_verified') requestURL += '&type=ok'
      if(this.nextPage) requestURL += '&page_timestamp=' + this.nextPage
      let response = await fetch(requestURL)
      if(response.status == 200) {
        const result = await response.json()
        if(result && result.length > 0) this.nextPage = result[result.length - 1].page_timestamp
        else this.nextPage = null
        console.log(result)
        return result
      }
      return []
    },

    async loadMore() {
      this.loading = true
      const levels = await this.loadLevels()
      this.items = [...this.items, ...levels]
      this.loading = false
    },

    handleScroll() {
      const scrollY = window.scrollY;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollY + visibleHeight >= totalHeight && !this.loading && this.nextPage !== undefined) {
        this.loadMore();
      }
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
  <div class="grid-container">
    <div v-for="(item, index) in items" :key="index" class="grid-item">
      <CardUser v-if="wantsUserCells" :item="item" />
      <CardLevel v-else :item="item" />
    </div>
  </div>
  <div v-if="loading" class="loading">Loading more items...</div>
</template>


<style>
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
</style>