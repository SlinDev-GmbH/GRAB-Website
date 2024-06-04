<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ReportModerationTools from './ReportModerationTools.vue'
import UserModerationTools from './UserModerationTools.vue'

export default {
  components: {
    ReportModerationTools,
    UserModerationTools
  },

  emit: ['profile'],

  props: {
    item: Object,
    moderationItem : Object
  },

  data() {
    return {
      cardColor: 'white'
    }
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
    },

    isReportModerationCell() {
      return this.moderationItem !== null
    },

    isUserModerationCell() {
      return this.moderationItem === null && this.isSuperModerator
    },

    ...mapState(useUserStore, ['isSuperModerator'])
  },

  methods: {
    didHandleCell(bad) {
      if(bad === true)
      {
        this.cardColor = 'lightcoral'
      }
      else
      {
        this.cardColor = 'lightgreen'
      }
    },

    showProfile() {
      this.$emit('profile', this.item.user_id)
    }
  }
}
</script>

<template>
  <div class="user-card" :style="{'background-color': cardColor}">
    <div class="user-name">{{ item.user_name }}</div>
    <img v-if="item.is_creator" alt="creator" class="creator-icon" src="./../assets/creator.png" />
    <img v-if="item.is_moderator" alt="moderator" class="moderator-icon" src="./../assets/moderator.png" />
    <div v-if="item.user_level_count" class="level-count">Levels: {{ item.user_level_count }}</div>
    <div v-if="isAdmin" class="user-id">User ID: {{ item.user_id }}</div>
    <ReportModerationTools v-if="isReportModerationCell" :moderation-item="moderationItem" @handled="didHandleCell"/>
    <UserModerationTools v-if="isUserModerationCell" :user-info="item" @handled="didHandleCell"/>
    <div class="profile-button" @click="showProfile">PROFILE</div>
  </div>
</template>

<style scoped>
.user-card {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  padding-bottom: 60px;
  overflow-wrap: break-word;
}

.user-name {
  font-size: 20px;
  font-style: bold;
  line-height: 1.0;
  display: inline-block;
}

.user-id {
  font-size: 15px;
  font-style: italic;
}

.level-count {
  font-size: 15px;
  display: -webkit-box;   
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;     
  overflow: hidden;
}

.profile-button {
  display: block;
  position: absolute;
  bottom: 5%;
  width: 40%;
  left: 30%;
  line-height: 30px;
  border: none;
  border-radius: 10px;
  background-color:#4642BE;
  color: #FFFFFF;
  font-weight: bold;
  font-size: 15px;
  text-align:center;
  text-decoration: none;
  cursor: pointer;
}

.creator-icon, .moderator-icon {
  width: 20px;
  height: 20px;
  margin-left: 3px;
  position: relative;
  top: 3px;
}
</style>
