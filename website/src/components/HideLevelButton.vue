<script>
import ModerationPopup from './ModerationPopup.vue'

export default {
  components: {
    ModerationPopup
  },

  emits: ['hide'],

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
        this.$emit('hide');
      }
    },
  }
}
</script>

<template>
  <div>
    <button class="moderation-hide-level-button" @click="showModerationPopup=true">Hide</button>
    
    <Teleport to="body">
      <ModerationPopup :show="showModerationPopup" @close="showModerationPopup = false" @handled="handledModerationPopup" config="level_hide" :identifier="level_id" />
    </Teleport>
  </div>
</template>

<style scoped>
.moderation-hide-level-button {
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--red);
  border-radius: 15px;
  cursor: pointer;
}
</style>
