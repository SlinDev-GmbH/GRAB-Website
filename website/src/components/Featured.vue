<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { GetLevelBrowserRequest } from '../requests/GetLevelBrowserRequest'
import ScrollList from './ScrollList.vue'

export default {
  computed: {
    ...mapState(useUserStore, ['accessToken']),
    isSection() {
      return this.currentSection.hasOwnProperty('sections')
    },
    isList() {
      return this.currentSection.hasOwnProperty('list_key')
    }
  },

  components: {
    ScrollList
  },

  data() {
    return {
      featured: {},
      currentSection: {},
      displayingLevels: false,
      sectionStack: [],
      loaded: false,
    }
  },

  emits: ['tabChanged'],

  methods: {
    async loadFeatured() {
      const result = await GetLevelBrowserRequest(this.$api_server_url)
      if(result !== false) {
        return result
      }
      return []
    },

    tabChanged(query) {
      this.$emit('tabChanged', query)
    },

    handleBack() {
      if (this.sectionStack.length > 0) {
        this.currentSection = this.sectionStack.pop();
      } else {
        this.currentSection = this.featured;
      }
    },

    setSection(section) {
      console.log(section);
      if (section.hasOwnProperty('list_key')) {
        if (section.list_key.startsWith('user:')) {
          const userID = section.list_key.split(':')[1];
          this.tabChanged({tab: 'tab_other_user', user_id: userID});
        }
      }
      this.sectionStack.push(this.currentSection);
      this.currentSection = section;
    },

    shouldRenderSection(section) {
      if (section.hasOwnProperty('list_key')) {
        if (section.list_key.startsWith('builtin:')) {
          return false
        }
        if (['ok_newest', 'newest'].includes(section.list_key)) {
          return false
        }
      }
      if (section.hasOwnProperty('type') && section.type === 'space') {
        return false
      }
      return true
    },

    isSpace(section) {
      return section.hasOwnProperty('type') && section.type === 'space'
    },
  },


  async mounted() {
    let featured = await this.loadFeatured();
    this.featured = featured;
    this.currentSection = this.featured;
    this.loaded = true;
  },

}
</script>

<template>
  <div class="section-header">
    <button v-if="loaded && this.currentSection !== this.featured" @click="this.handleBack">back</button>
    <h2 v-if="this.currentSection !== this.featured" class="section-title">{{ this.currentSection.hasOwnProperty("title_short") ? this.currentSection.title_short : this.currentSection.title }}</h2>
  </div>
  <div v-if="isList">
    <ScrollList :listType="this.currentSection.list_key" :difficulty="''" :tag="''" :searchTerm="''" :otherUserID="null" @tab-changed="(query) => this.tabChanged(query)"/>
  </div>
  <div v-else-if="isSection" class="sections">
    <div class="section-element-title" v-for="section in this.currentSection.sections">
      <div class="section-button" v-if="shouldRenderSection(section)" @click="this.setSection(section)">
        {{ section.title }}
      </div>
      <div v-else-if="isSpace(section)" :style="`height: ${section.size/4}px`"></div>
    </div>
  </div>
</template>

<style scoped>
  .sections {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
  .section-element-title {
    width: 100%;
    text-align: center;
    color: #FFFFFF;
    font-size: 20px;
    font-weight: bold;
    border-radius: 15px;
    box-sizing: border-box;
    text-decoration: none;
    margin-bottom: 5px;
  }
  .section-button {
    cursor: pointer;
    font-weight: 400;
  }
  .section-title, .section-element-title {
    color: white;
  }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: 10px;
  }
  .section-header button {
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
    cursor: pointer;
  }
</style>
