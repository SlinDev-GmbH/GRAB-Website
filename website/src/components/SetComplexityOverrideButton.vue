<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { setComplexityOverride } from '../requests/SetComplexityOverride.js'

export default {
  props: {
    userID: String
  },

  data() {
    return {
      showPopup: false,
      complexity: 0
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin'])
  },

  methods: {
    async setComplexity(complexity) {
      await setComplexityOverride(this.$api_server_url, this.accessToken, this.userID, complexity);
      this.showPopup = false;
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" class="complexity-override-button" @click="showPopup = true">Set Complexity</button>
    <div v-if="showPopup" class="complexity-override-popup">
      <input class="complexity-override-input" min="0" type="number" name="complexity" id="complexity" :value="complexity" @input="event => complexity = event.target.value">
      <div>
        <button class="complexity-reset-button" @click="setComplexity(0)">Reset</button>
        <button class="complexity-override-button" @click="setComplexity(complexity)">Set Complexity</button>
      </div>
    </div>
</template>

<style scoped>
  .complexity-override-button, .complexity-reset-button {
    padding: 5px 10px;
    font-weight: bold;
    color: white;
    border: none;
    font-size: 12px;
    border-radius: 15px;
    cursor: pointer;
    background-color: green;
  }

  .complexity-reset-button {
    margin-right: 5px;
    background-color: red;
  }
  
  .complexity-override-input {
    padding: 5px;
    margin-bottom: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .complexity-override-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
