<script>
export default {
  props: {
    info : Object,
    previous: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isBan() {
      return this.info.type === "ban"
    },

    cleanInfo() {
      let tempInfo = this.info
      if("date_end" in tempInfo && !this.isBan) delete tempInfo.date_end //Only show single date if not a ban
      return Object.fromEntries(Object.entries(tempInfo).map(function(value) {
        if(value[0].includes("date_")) return [value[0].slice(5), (new Date(value[1])).toDateString()]
        return value
      }));
    },

    banProgress() {
      if(!this.isBan) return 0;
      const start = new Date(this.info.date_start);
      const end = new Date(this.info.date_end);
      const now = new Date();
      const elapsed = now.getTime() - start.getTime();
      const duration = end.getTime() - start.getTime();
      const progress = Math.min((elapsed / duration) * 100, 100);
      return progress;
    }
  }
}
</script>

<template>
  <div class="moderation-info">
    <div class="previous">
      <span class="strike" :style="previous ? 'background-color: var(--yellow);' : ''">{{ cleanInfo.strike }}</span>
      <span class="type">{{ cleanInfo.type }}</span>
      <span class="reason">{{ cleanInfo.reason }}</span>
    </div>
    <div class="dates">
      <span class="start">{{ cleanInfo.start }}</span>
      <div v-if="this.isBan && cleanInfo.start" class="progress">
        <span class="percentage" :style="'width: ' + banProgress + '%;'"></span>
      </div>
      <span v-if="this.isBan" class="end">{{ cleanInfo.end }}</span>
    </div>
  </div>
</template>

<style scoped>
.moderation-info {
  width: 100%;
  min-height: 0px;
  background-color: var(--button);
  border-radius: 15px;
  padding: 0.5rem;
  max-width: 100%;
  overflow: hidden;
}
.previous {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.type {
  text-transform: uppercase;
  font-weight: bold;
}
.strike {
  background-color: var(--red);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 50%;
}
.reason {
  border-radius: 15px;
  background-color: var(--hover);
  padding-inline: 0.5rem;
  line-height: 1.2rem;
}
.dates {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.end {
  margin-left: auto;
}
.progress {
  background-color: var(--red);
  height: 5px;
  border-radius: 5px;
  width: 100%;
}
.percentage {
  display: block;
  background-color: var(--green);
  height: 100%;
  border-radius: 5px;
  max-width: 100%;
}
@media screen and (max-width: 600px) {
  .type {
    font-size: 0.8rem;
  }
  .strike {
    font-size: 1rem;
    width: 1.2rem;
    height: 1.2rem;
  }
  .reason {
    font-size: 0.8rem;
    padding-inline: 0.3rem;
    line-height: 1rem;
  }
  .dates {
    font-size: 12px;
  }
}
</style>
