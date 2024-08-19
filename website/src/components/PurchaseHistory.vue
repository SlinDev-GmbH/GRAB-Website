<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import { getUserPurchaseHistoryRequest } from '../requests/GetUserPurchaseHistoryRequest.js'

export default {

  props: {
    userID: String,
    show: Boolean,
  },

  data() {
    return {
      history: []
    }
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },

  async mounted() {
    if (this.show) {
      this.history = (await getUserPurchaseHistoryRequest(this.$api_server_url, this.accessToken, this.userID)).reverse();
    }
  },

  methods: {
    timeString(item) {
      const date = new Date(item.date);
      const now = new Date();
      const timeDiff = now.getTime() - date.getTime();

      // time since log
      const yearsSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
      const monthsSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * (365 / 12)));
      const weeksSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
      const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursSince = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesSince = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      // time of log
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);

      const timeString = `${day}/${month}/${year}`;
      let timeSinceString = "Just now";

      if (yearsSince > 0) {
        timeSinceString = `${yearsSince} ${yearsSince != 1 ? 'years' : 'year'} ago`;
      } else if (monthsSince > 0) {
        timeSinceString = `${monthsSince} ${monthsSince != 1 ? 'months' : 'month'} ago`;
      } else if (weeksSince > 0) {
        timeSinceString = `${weeksSince} ${weeksSince != 1 ? 'weeks' : 'week'} ago`;
      } else if (daysSince > 0) {
        timeSinceString = `${daysSince} ${daysSince != 1 ? 'days' : 'day'} ago`;
      } else if (hoursSince > 0) {
        timeSinceString = `${hoursSince} ${hoursSince != 1 ? 'hours' : 'hour'} ago`;
      } else if (minutesSince > 0) {
        timeSinceString = `${minutesSince} ${minutesSince != 1 ? 'minutes' : 'minute'} ago`;
      }

      return `${timeString} (${timeSinceString})`;
    }
  }

}
</script>


<template>
  <h3>Purchases</h3>
  <div class="history">
    <div v-for="(item, index) in history" :key="index" class="history-item">
      <div>
        <h4>{{ item.title }} <span class="item-id">{{ item.platform_receipt_id }}</span></h4>
        <span>{{ this.timeString(item) }}</span>
      </div>
      <h3>{{ item.price }} {{ item.price_currency }}</h3>
    </div>
  </div>
</template>


<style scoped>
  .history {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 15px
  }
  .history-item {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    padding-inline: 15px;
  }
  .history-item h4 {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;  
  }
  .item-id {
    color: #888;
    font-size: 12px;
    font-style: italic;
  }
</style>