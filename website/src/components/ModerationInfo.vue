<script>
export default {
  props: {
    info : Object
  },

  computed: {
    isBan() {
      return this.info.type === "ban"
    },

    cleanInfo() {
      let tempInfo = this.info
      if("date_end" in tempInfo && !this.isBan) delete tempInfo.date_end //Only show single date if not a ban
      return Object.entries(tempInfo).map(function(value) {
        if(value[0].includes("date_")) return [value[0].slice(5), (new Date(value[1])).toDateString()]
        return value
      })
    }
  }
}
</script>

<template>
  <div class="moderation-info">
    <div v-for="(value) in cleanInfo">
      {{ value[0] }}: {{ value[1] }}
    </div>
    <br>
  </div>
</template>

<style>
.moderation-info {
  width: 100%;
  min-height: 0px;
}
</style>
