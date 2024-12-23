<script>
import { useUserStore } from '@/stores/user'
import { mapState } from 'pinia'

import { getUserCurrencyRequest } from '../requests/GetUserCurrencyRequest.js'

export default {
  data() {
    return {
      currencyData: undefined,
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken', 'userID']),

    formattedCoins() {
      const value = this.formatNumber(this.currencyData.currency);
      return `${value}`;
    },
    formattedTips() {
      const value = this.formatNumber(this.currencyData.tips_total);
      return `${value} tip${this.currencyData.tips_total > 1 ? 's' : ''}`;
    },
    formattedUnclaimedTips() {
      const value = this.formatNumber(this.currencyData.tips);
      return `${value} unclaimed tip${this.currencyData.tips > 1 ? 's' : ''}!`;
    }
  },

  methods: {
    formatNumber(number) {
      return number.toLocaleString();
    }
  },

  async mounted() {
    this.currencyData = await getUserCurrencyRequest(this.$api_server_url, this.accessToken);
  }
};
</script>

<template>
  <div v-if="currencyData" class="currency-info">
    <div>
      <img src="./../assets/icon_coins.png" alt="Coin">
      <div class="details">
        <div class="currency">{{ formattedCoins }}</div>
        <div class="total-tips">{{ formattedTips }}</div>
      </div>
    </div>
    <div>
      <div v-if="currencyData.tips" class="unclaimed-tips">{{ formattedUnclaimedTips }}</div>
    </div>
  </div>
</template>

<style scoped>
.currency-info {
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
  z-index: 1;
}
.currency-info > div {
  display: flex;
  justify-content: space-between;

  gap: 0.5rem;
}
.currency-info img {
  height: 38px;
  width: 38px;
}
.details {
  font-size: 14px;
}
.total-tips {
  font-size: 12px;
  opacity: 0.7;
}
.unclaimed-tips {
  font-size: 12px;
  color: var(--alt);
  background-color: var(--button);
  border-radius: 15px;
  padding: 2px 10px;
}
@media screen and (max-width: 630px) {
  .currency-info {
    flex-direction: row;
  }
}
</style>