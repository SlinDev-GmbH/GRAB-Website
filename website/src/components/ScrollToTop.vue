<script>
export default {
  data() {
    return {
      scrolledFar: false,
    }
  },

  methods: {
    scrollToTop() {
      window.scrollTo(0, 0);
    },

    onScroll() {
      this.scrolledFar = window.scrollY > window.innerHeight;
    }
  },

  mounted() {
    window.addEventListener("scroll", this.onScroll);
  },
  unmounted() {
    window.removeEventListener("scroll", this.onScroll);
  }
};
</script>

<template>
  <button v-if="scrolledFar" class="scroll-to-top" @click="scrollToTop">
    <img src="./../assets/icons/up.svg" alt="^">
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
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-to-top img {
  width: 75%;
  height: 75%;
  transition: opacity 0.3s ease;
  opacity: 0.5;
}
.scroll-to-top:hover img {
  opacity: 1;
}
</style>