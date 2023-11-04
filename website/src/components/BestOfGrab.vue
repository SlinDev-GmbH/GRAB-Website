<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { GetBestOfGrabRequest } from '../requests/GetBestOfGrabRequest'
import ScrollList from './ScrollList.vue'

export default {
  computed: {
    ...mapState(useUserStore, ['isAdmin']),
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
      bestOfGrab: {},
      currentSection: {},
      displayingLevels: false,
    }
  },

  emits: ['tabChanged'],

  methods: {
    async loadBestOfGrab() {
      const result = await GetBestOfGrabRequest(this.$api_server_url)
      if(result !== false) {
        return result
      }
      return []
    },

    tabChanged(query) {
      console.log(query)
    },

    handleBack() {
      this.currentSection = this.bestOfGrab
    },

    setSection(section) {
      console.log(section);
      if (section.hasOwnProperty('list_key')) {
        if (section.list_key.startsWith('user:')) {
          const userID = section.list_key.split(':')[1]
          this.$emit('tabChanged', {tab: 'tab_other_user', user_id: userID})
        }
      }
      this.currentSection = section;
    },

    shouldRenderSection(section) {
      if (section.hasOwnProperty('list_key')) {
        if (section.list_key.startsWith('builtin:')) {
          return false
        }
        if (['ok', 'newest'].includes(section.list_key)) {
          return false
        }
      }
      return true
    }
  },

  async mounted() {
    let bestOfGrab = await this.loadBestOfGrab();
    this.bestOfGrab = bestOfGrab;
    this.currentSection = this.bestOfGrab;
  },

}
</script>

<template>
  <div class="section-header">
    <button v-if="this.currentSection !== this.bestOfGrab" @click="this.handleBack">back</button>
    <h2 v-if="this.currentSection !== this.bestOfGrab" class="section-title">{{ this.currentSection.title }}</h2>
  </div>
  <div v-if="isList">
    <ScrollList :listType="this.currentSection.list_key" :searchTerm="''" :otherUserID="null" @tab-changed="(query) => this.tabChanged(query)"/>
  </div>
  <div v-else-if="isSection" class="sections">
    <div class="section-element-title" v-for="section in this.currentSection.sections" @click="this.setSection(section)">
      <div v-if="shouldRenderSection(section)">
        {{ section.title }}
      </div>
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
    gap: 10px;
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
    cursor: pointer;
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
