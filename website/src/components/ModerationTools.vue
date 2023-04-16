<script>
import ModerationInfo from './ModerationInfo.vue'

export default {
  components: {
    ModerationInfo
  },

  props: {
    moderationItem : Object
  },

  computed: {
    reports() {
      return Object.entries(this.moderationItem).filter(([key]) => key.includes('reported_score_'))
    },

    isLevel(){
      return this.moderationItem.object_type === 'level'
    }
  }
}
</script>

<template>
  <div class="moderation-tools">
    <div v-if="moderationItem.object_info.moderation_info" class="moderation-title">Previous Strike:</div>
    <ModerationInfo v-if="moderationItem.object_info.moderation_info" :info="moderationItem.object_info.moderation_info"/>

    <div class="moderation-title">Reports:</div>
    <div v-for="(value) in reports">
      {{ value[0].slice(15) }}: {{ value[1] }}
    </div>
    <br>
    <button v-if="isLevel" class="moderation-hide-button">Hide</button>
    <button v-else class="moderation-hide-button">Punish</button>
    <button v-if="isLevel" class="moderation-approve-button">Approve</button>
    <button v-else class="moderation-approve-button">Reset</button>
  </div>
</template>

<style>
.moderation-tools {
  width: 100%;
  min-height: 0px;
  padding-top: 5%;
  padding-bottom: 5%;
}

.moderation-title {
  font-weight: bold;
}

.moderation-hide-button {
  width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  margin-left: 17.5%;
  margin-right: 5%;
}

.moderation-approve-button {
  width:30%;
  height: 30px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  border-radius: 15px;
}
</style>
