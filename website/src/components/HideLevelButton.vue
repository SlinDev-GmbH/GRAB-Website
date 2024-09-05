<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationPopup from './ModerationPopup.vue'

export default {
  components: {
    ModerationPopup
  },

  emits: ['handled'],

  props: {
    level_id : String
  },

  data() {
    return {
      showModerationPopup: false
    }
  },

  methods: {
    handledModerationPopup(handled) {
      if(handled === true)
      {
        this.$emit('handled', true)
        this.$emit('hideBtn')

      }
    },
  }
}
</script>

<template>
  <div class="moderation-hide-level-button-container">
    <button class="moderation-hide-level-button" @click="showModerationPopup=true">Hide</button>
  </div>

  <Teleport to="body">
    <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" config="level_hide" :identifier="level_id" />
  </Teleport>
</template>

<style scoped>
.moderation-hide-level-button {
  min-width:30%;
  height: 30px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.moderation-hide-level-button-container {
  margin-top: 5px;
}
</style>
