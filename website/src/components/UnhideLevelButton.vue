<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { unhideLevelRequest } from '../requests/UnhideLevelRequest'

export default {
  emits:['hide'],
  props: {
    level_id : String
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  methods: {
    async doModerationAction() {
      if(await unhideLevelRequest(this.$api_server_url, this.accessToken, this.level_id))  {
        this.$emit('hide');
      } return;
    },
  }
}
</script>

<template>
  <div>
    <button class="moderation-unhide-level-button" @click="doModerationAction">Unhide</button>
  </div>
</template>

<style scoped>
.moderation-unhide-level-button {
  height: 30px;
  width: 90px;
  font-weight: bold;
  background-color: var(--yellow);
  border-radius: 15px;
  cursor: pointer;
}
</style>
