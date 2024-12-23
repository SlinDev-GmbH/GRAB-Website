<script>
export default {
  data() {
    return {
      scrolledFar: false,
    }
  },

  methods: {
    scrollToTop() {
      this.$parent.$el.scrollTop = 0;
    },

    onScroll() {
      this.scrolledFar = this.$parent.$el.scrollTop > window.innerHeight;
    }
  },

  mounted() {
    this.$parent.$el.addEventListener("scroll", this.onScroll);
  },
  unmounted() {
    this.$parent.$el.removeEventListener("scroll", this.onScroll);
  }
};
</script>

<template>
  <button v-if="scrolledFar" class="scroll-to-top" @click="scrollToTop">
    <img src="./../assets/arrow_up.png" alt="^">
  </button>
</template>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 40px;
  height: 40px;
  background-color: var(--hover);
  color: var(--hover);
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
}
.scroll-to-top img {
  width: 60%;
  height: 60%;
  filter: invert();
  transition: opacity 0.3s ease;
  opacity: 0.5;
}
.scroll-to-top:hover img {
  opacity: 1;
}
</style>