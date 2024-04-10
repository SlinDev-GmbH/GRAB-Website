<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationPopup from './ModerationPopup.vue'

export default {
  components: {
    ModerationPopup
  },

  props: {
    level_id : String
  },

  data() {
    return {
      showModerationPopup: false
    }
  }
}
</script>

<template>
  <img class="report-level-button" @click="showModerationPopup=true" src="./../assets/report.svg" />

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" config="level_report" :identifier="level_id" alt="Report Level" />
  </Teleport>
</template>

<style scoped>
.report-level-button {
    width: 30px;
    height: 30px;
    aspect-ratio: 1/1;
    cursor: pointer;
}
</style>
