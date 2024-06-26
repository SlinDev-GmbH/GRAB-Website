<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  props: {
    item: Object,
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
    },

    hasImage() {
      if(this.item.images && this.item.images.thumb)
      {
        return true
      }
      return false
    },

    viewerURL() {
      return '/levels/viewer/?level=' + this.item.identifier
    },

    creatorUrl() {
      return '/levels?tab=tab_other_user&user_id=' + this.item.identifier.split(':')[0]
    }
  }
}
</script>

<template>
  <div class="level-card">
    <img v-if="hasImage" class="thumbnail" :src="this.$images_server_url + this.item.images.thumb.key" :width="this.item.images.thumb.width" :height="this.item.images.thumb.height" />
    <div class="info">
      <div class="title">{{ item.title }}</div>
      <div class="creators">{{ creators }}</div>
    </div>
    <div class="buttons">
      <a target="_blank" :href=creatorUrl class="user-button">USER</a>
      <a target="_blank" :href=viewerURL class="open-button">OPEN</a>
    </div>
  </div>
</template>

<style scoped>
.level-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  margin-block: 10px;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px
}

.info {
  max-width: 55%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-right: auto;
}

.buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 15%;
}

.buttons a {
  display: block;
  width: 100%;
  line-height: 30px;
  border: none;
  border-radius: 10px;
  color: #FFFFFF;
  font-weight: bold;
  font-size: 15px;
  text-align:center;
  text-decoration: none;
  margin: auto 0;
  overflow-x: hidden;
  white-space: nowrap;
}

.open-button {
  background-color:#00BC87;
}

.user-button {
  background-color:#4642BE;
}

.title {
  padding-top: 5px;
  font-size: 20px;
  font-style: bold;
  line-height: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.creators {
  font-size: 15px;
  font-style: italic;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: 15px;
  display: -webkit-box;   
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;     
  overflow: hidden;
  padding-top: 10px;
}

.thumbnail {
  position: relative;
  margin: 0;
  display: block;
  object-fit: contain;
  object-position: center;
  width: 20%;
  height: auto;
  border-radius: 10px;
}
</style>
