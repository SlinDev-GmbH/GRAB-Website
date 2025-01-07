<script>
export default {
  props: {
    item: Object
  },

  computed: {

    logType() {
      return this.item.request.split(/\/|\?/)[5];
    },

    logDetails() {
      return this.item.request;
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
    },

    hasUser() {
      return this.userLink != '';
    },
    hasLevel() {
      return this.levelLink != '';
    },
    userLink() {
      const type = this.logType;
      const request = this.item.request;

      const url = new URL(request);
      const params = new URLSearchParams(url.search);
      const pathname = url.pathname;

      let user_id = params.get('user_id');
      if (!user_id) {
        let parts = pathname.split('/');
        parts.splice(0, parts.indexOf(type)+1);
        if (parts.length == 1) user_id = parts[0];
      }

      if (!user_id) return '';
      return `${window.location.origin}/levels?tab=tab_other_user&user_id=${user_id}`;
    },
    levelLink() {
      const type = this.logType;
      const request = this.item.request;

      const url = new URL(request);
      const params = new URLSearchParams(url.search);
      const pathname = url.pathname;

      let level_id = params.get('level_id');
      if (!level_id) {
        let parts = pathname.split('/');
        parts.splice(0, parts.indexOf(type)+1);
        if (parts.length == 2) level_id = `${parts[0]}:${parts[1]}`;
      }

      if (!level_id) return '';
      return `${window.location.origin}/levels/viewer/?level=${level_id}`;
    },
  }
}
</script>

<template>
  <div class="log-card">
    <div class="log-header">
      <h4 class="log-type">{{ this.logType }}</h4>
      
      <a class="log-user" :href="'/levels?tab=tab_other_user&user_id=' + item.userInfo.user_id">{{ item.userInfo.user_name }}</a>
      <span v-if="item.userInfo.is_verifier" title="Verifier" class="verifier-icon">V</span>
      <span v-if="item.userInfo.is_moderator" title="Moderator" class="moderator-icon">M</span>
      <span v-if="item.userInfo.is_admin" title="Developer" class="developer-icon">D</span>
    </div>
    <span>{{ this.logDetails }}</span>
    <div class="log-actions">
      <a v-if="hasLevel" class="level-button" :href="levelLink">level</a>
      <a v-if="hasUser" class="user-button" :href="userLink">user</a>
    </div>
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
  background-color: var(--hover);
  border-radius: 15px;
  padding: 0.5rem 1rem;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
}
.log-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.log-actions {
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
.log-footer > span {
  opacity: 0.7;
  font-size: 0.9rem;
}
.log-type {
  margin-right: auto;
}

.verifier-icon {
  width: 15px;
  height: 15px;
  line-height: 15px;
  background-color: #4eac36;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.moderator-icon {
  width: 15px;
  height: 15px;
  line-height: 15px;
  background-color: #DE9343;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.developer-icon {
  width: 15px;
  height: 15px;
  line-height: 15px;
  background-color: #DD3619;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.log-card > span {
  font-size: 0.8rem;
}
.log-actions > a {
  height: 20px;
  width: 70px;
  font-weight: bold;
  background-color: var(--blue);
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
@media screen and (max-width: 500px) {
  .log-type {
    margin-right: 100%;
  }
}
</style>
