<script>
import ModerationTools from './ModerationTools.vue'

export default {
  components: {
    ModerationTools
  },

  props: {
    item: Object,
    moderationItem : Object
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
    },

    viewerURL() {
      return 'viewer/?level=' + this.item.identifier
    },

    isModerationCell() {
      return this.moderationItem !== null
    }
  }
}
</script>

<template>
  <div class="user-card">
    <div class="user-name">{{ item.user_name }}</div>
    <img v-if="item.is_creator" alt="OK Stamp" class="creator-icon" src="./../assets/creator.png" />
    <div v-if="item.user_level_count" class="level-count">Levels: {{ item.user_level_count }}</div>
    <div class="user-id">User ID: {{ item.user_id }}</div>
    <ModerationTools v-if="isModerationCell" :moderation-item="moderationItem"/>
    <a target="_blank" :href="viewerURL" class="profile-button">PROFILE</a>
  </div>
</template>

<style>
.user-card {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  padding-bottom: 60px;
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
}

.creator-icon {
  width: 20px;
  height: 20px;
  margin-left: 3px;
  position: relative;
  top: 3px;
}
</style>
