<script>
export default {
  props: {
    imageUrl: String,
    thumbnailUrl: String
  },

  data() {
    return {
      showPopup: false
    };
  },

  mounted() {
    document.addEventListener('keydown', this.closeOnEscape);
  },

  unmounted() {
    document.removeEventListener('keydown', this.closeOnEscape);
  },

  methods: {
    closeOnEscape(event) {
      if (event.key === 'Escape') {
        this.showPopup = false;
      }
    }
  }
}
</script>

<template>
  <div>
    <button class="thumbnail-fullscreen-button" @click="showPopup=true">
      <img src="./../assets/icons/fullscreen.svg" alt="Full Screen">
    </button>
  
    <Teleport v-if="showPopup" to="body">
      <div class="thumbnail-popup" @click="showPopup=false">
        <div class="images">
          <img class="thumb" v-if="thumbnailUrl" :src="thumbnailUrl">
          <img :src="imageUrl">
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.thumbnail-fullscreen-button {
  width: 30px;
  height: 30px;
  aspect-ratio: 1/1;
  cursor: pointer;
  background-color: var(--hover);
  border-radius: 50%;
  padding: 3px;
  transition: background-color 0.1s linear, scale 0.1s linear;
}
@media screen and (max-width: 500px) {
  .thumbnail-fullscreen-button {
    width: 20px;
    height: 20px;
    padding: 1px;
  }
}
.thumbnail-fullscreen-button:hover {
  background-color: var(--active);
  scale: 1.05;
}
.thumbnail-fullscreen-button img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  padding: 3px;
}
.thumbnail-popup {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #0005;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.images {
  width: min(90svh, 90svw);
  height: min(90svh, 90svw);

  display: grid;
  grid-template-areas: "images";
}
.thumbnail-popup img {
  grid-area: images;
  width: 100%;
  height: auto;
  margin: auto;
  border-radius: 15px;
  border: 3px solid transparent;
}
.thumbnail-popup img.thumb {
  border: 3px solid var(--hover);
}
</style>