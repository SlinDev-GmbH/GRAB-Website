<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { makeCreatorRequest } from '../requests/MakeCreatorRequest.js'

export default {
  props: {
    userID : String
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin'])
  },

  methods: {
    async makeCreator() {
      console.log(this.userID);
      await makeCreatorRequest(this.$api_server_url, this.userID, this.accessToken)
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" class="creator-button" @click="makeCreator">MAKE CREATOR</button>
</template>

<style scoped>
.creator-button {
  padding-block: 5px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}
</style>
