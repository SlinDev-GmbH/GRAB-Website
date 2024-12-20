<script>
import { GetLevelBrowserRequest } from '../requests/GetLevelBrowserRequest'
import DropDown from './DropDown.vue';

export default {
  components: {
    DropDown
  },

  data() {
    return {
      tags: [],
      loaded: false,
    }
  },

  props: {
    currentTab: String,
    isLoading: Boolean,
    currentValue: String,
  },

  methods: {
    applyFilter(filter) {
      if (this.isLoading || filter == this.currentValue) {
        return;
      }

      if (filter == "All") filter = '';
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
    let featured = await this.loadFeatured();
    this.tags = featured.tags;
    this.loaded = true;
  },

  emits: [
    'filter'
  ],
}
</script>


<template>
  <div class="tag-filter-container">
    <DropDown :options='["All", ...tags]' :defaultChoice='"All"' @changeSelection="applyFilter($event)"/>
  </div>
</template>


<style scoped>
.tag-filter-container {
  margin-top: 10px;
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 7px;
  row-gap: 0;
  flex-wrap: wrap;
  padding-block: 4px;
  margin-bottom: auto;
}
.filter {
  padding: 0 5px;
  margin: 0 2px;
  border-radius: 5px;
  cursor: pointer;
}
.filter:hover {
  background-color: var(--hover);
}
.active-tag-filter {
  background-color: var(--hover);
}
</style>