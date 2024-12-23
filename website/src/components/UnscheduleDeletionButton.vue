<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { unscheduleDeletionRequest } from '../requests/UnscheduleDeletionRequest'

export default {
  props: {
    level_id : String
  },

  emits: ['recovered'],

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async unscheduleDeletion() {
      if(!await unscheduleDeletionRequest(this.$api_server_url, this.accessToken, this.level_id)) {
        this.$emit('recovered');
      }
    },
  }
}
</script>

<template>
  <button class="undelete-level-button" @click="unscheduleDeletion">Recover</button>
</template>

<style scoped>
  .undelete-level-button {
    height: 30px;
    width: 90px;
    font-weight: bold;
    background-color: var(--green);
    border-radius: 15px;
    cursor: pointer;
  }
  @media screen and (max-width: 600px) {
  .undelete-level-button {
    height: 25px;
    width: 70px;
    font-size: 0.7rem;
  }
}
</style>
