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

    viewerURL() {
      return 'levels/viewer/?level=' + this.item.identifier
    },
  }
}
</script>

<template>
  <div class="level-card">
    <div class="title">{{ item.title }}</div>
    <div class="creators">{{ creators }}</div>
    <div class="description">{{ item.description }}</div>
    <a target="_blank" :href=viewerURL class="open-button">OPEN</a>
  </div>
</template>

<style scoped>
.open-button {
  display: block;
  width: 30%;
  line-height: 30px;
  border: none;
  border-radius: 10px;
  background-color:#00BC87;
  color: #FFFFFF;
  font-weight: bold;
  font-size: 15px;
  text-align:center;
  text-decoration: none;
  margin: 10px auto 0;
}

.level-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  margin-block: 10px;
  overflow-wrap: break-word;
}

.title {
  padding-top: 5px;
  font-size: 20px;
  font-style: bold;
  line-height: 0.9;
}

.creators {
  font-size: 15px;
  font-style: italic;
}

.description {
  font-size: 15px;
  display: -webkit-box;   
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;     
  overflow: hidden;
  padding-top: 10px;
}
</style>
