<script>
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
  <img class="report-level-button" @click="showModerationPopup=true" src="./../assets/icons/report.svg" />

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
    background-color: var(--hover);
    border-radius: 50%;
    padding: 2px;
    transition: background-color 0.1s linear, scale 0.1s linear;
}
.report-level-button:hover {
  background-color: var(--active);
  scale: 1.05;
}
@media screen and (max-width: 500px) {
  .report-level-button {
    width: 20px;
    height: 20px;
  }
}
</style>
