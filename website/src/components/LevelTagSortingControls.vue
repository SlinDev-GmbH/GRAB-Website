<script>
import { GetLevelBrowserRequest } from '../requests/GetLevelBrowserRequest'

export default {

  data() {
    return {
      tags: [],
      loaded: false
    }
  },

  props: {
    currentTab: String,
    isLoading: Boolean,
    currentValue: String,
  },

  methods: {
    applyFilter(filter) {
      if (this.isLoading) {
        return;
      }
      const previous = document.querySelector(".active-tag-filter");
      if (previous) {
        previous.classList.remove('active-tag-filter');
        if (previous.id == `filter-${filter}`) {
          this.$emit('filter', '');
          return;
        }
      }
      document.getElementById(`filter-${filter}`).classList.add('active-tag-filter');
      this.$emit('filter', filter)
    },

    async loadFeatured() {
      const result = await GetLevelBrowserRequest(this.$api_server_url)
      if(result !== false) {
        return result
      }
      return []
    }
  },

  async mounted() {
    // this.$emit('filter', '');
    // add tag buttons
    let featured = await this.loadFeatured();
    this.tags = featured.tags;
    this.loaded = true;
  },

  emits: [
    'filter'
  ],

  // watch: {
  //   async currentTab(type) {
  //     const current = document.querySelector(".active-tag-filter");
  //     if (current) {
  //       current.classList.remove('active-tag-filter');
  //     }
  //   },
  // }
}
</script>


<template>
  <div class="tag-filter-container">
    <div v-if="loaded" v-for="tag in tags" :class="'filter' + (tag === currentValue ? ' active-tag-filter' : '')" :id="'filter-'+tag" @click="applyFilter(tag)">{{ tag }}</div>
  </div>
</template>


<style scoped>
.tag-filter-container {
  width: 100%;
  margin-top: 10px;
  border-radius: 10px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 7px;
  row-gap: 0;
  flex-wrap: wrap;
  padding-block: 4px;
}
.filter {
  padding: 0 5px;
  margin: 0 2px;
  border-radius: 5px;
  cursor: pointer;
}
.filter:hover {
  background-color: rgba(58, 170, 231, 0.4);
}
.active-tag-filter {
  background-color: rgba(58, 170, 231, 0.4);
}
</style>