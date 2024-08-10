<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { unscheduleDeletionRequest } from '../requests/UnscheduleDeletionRequest'

export default {
  props: {
    level_id : String
  },

  emits: ['handled'],

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async unscheduleDeletion() {
      if(!await unscheduleDeletionRequest(this.$api_server_url, this.accessToken, this.level_id)) {
        this.$emit('handled', true);
        return
      }
      this.$emit('handled', false)
    },
  }
}
</script>

<template>
  <div class="undelete-level-button-container">
    <button class="undelete-level-button" @click="unscheduleDeletion">Recover</button>
  </div>
</template>

<style scoped>
  .undelete-level-button {
    min-width:30%;
    height: 30px;
    font-weight: bold;
    background-color: green;
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
  }

  .undelete-level-button-container {
    margin-top: 5px;
  }
</style>
