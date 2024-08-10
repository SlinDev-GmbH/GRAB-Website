<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  props: {
    item: Object
  },

  computed: {

    logType() {
      let log_type = this.item.request.split("/")[5];

      return log_type;
    },

    logDetails() {
      let log_details = this.item.request;

      return log_details;
    },

    logTimeString() {
      const date = new Date(this.item.timestamp);
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
  <div class="log-card">
    <div class="log-header">
      <h4 class="log-type">{{ this.logType }}</h4>
      
      <a class="log-user" :href="'/levels?tab=tab_other_user&user_id=' + item.userInfo.user_id">{{ item.userInfo.user_name }}</a>
      <img v-if="item.userInfo.is_verifier" alt="Verifier" title="Verifier" class="icon" src="./../assets/creator.png" />
      <img v-if="item.userInfo.is_moderator" alt="Moderator" title="Moderator" class="icon" src="./../assets/moderator.png" />
    </div>
    <span>{{ this.logDetails }}</span>
    <div class="log-footer">
      <span>{{ this.logTimeString }}</span>
      <span>{{ item.valid ? 'successful' : 'invalid' }}</span>
    </div>
  </div>
</template>

<style scoped>
.log-card {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
}
.log-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
.log-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  justify-content: space-between;
}
.log-type {
  margin-right: auto;
}
.log-user, .log-user:visited {
  color: black;
}
.icon {
  width: 15px;
  height: 15px;
}
</style>
