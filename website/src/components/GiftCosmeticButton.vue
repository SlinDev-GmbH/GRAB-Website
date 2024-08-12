<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { giftCosmeticRequest } from '../requests/GiftCosmeticRequest.js'
import { getShopProductsRequest } from '../requests/GetShopProductsRequest.js'

export default {
  props: {
    userID : String
  },

  data() {
    return {
      cosmeticID: null,
      showModal: false
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken']),
    ...mapState(useUserStore, ['isAdmin'])
  },

  methods: {
    async giftCosmetic() {
      await giftCosmeticRequest(this.$api_server_url, this.accessToken, this.userID, this.cosmeticID);
      this.showModal = false;
    },

    async getCosmeticPacks() {
      const shop = await getShopProductsRequest(this.$api_server_url);
      this.cosmeticPacks = Object.keys(shop);
    }
  },

  created() {
    if (this.isAdmin) {
      this.getCosmeticPacks();
    }
  }
}
</script>

<template>
    <button v-if="isAdmin" class="gift-button" @click="showModal = true">Gift Cosmetic</button>

    <div class="cosmetic-picker" v-if="showModal">
      <select name="cosmetic-options" id="cosmetic-options" v-model="cosmeticID">
        <option v-for="cosmetic of cosmeticPacks" :key="cosmetic" :value="cosmetic">{{cosmetic}}</option>
      </select>
      <button class="gift-button" @click="giftCosmetic">Gift Cosmetic</button>
    </div>
</template>

<style scoped>
.gift-button {
  padding: 5px 10px;
  font-weight: bold;
  background-color: green;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 15px;
  cursor: pointer;
}

#cosmetic-options {
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: bold;
}

.cosmetic-picker {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border: 1px solid black;
  gap: 10px;
}
</style>
