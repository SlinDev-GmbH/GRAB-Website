<script>
export default {
  props: {
    item: Object,
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
    },

    hasImage() {
      if(this.item.images && this.item.images.thumb)
      {
        return true
      }
      return false
    },

    viewerURL() {
      return '/levels/viewer/?level=' + this.item.identifier
    },

    creatorUrl() {
      return '/levels?tab=tab_other_user&user_id=' + this.item.identifier.split(':')[0]
    },

    difficulty() {
      let difficulty = this.item.statistics?.difficulty_string || "unrated";
      if (difficulty == "veryhard") {
        difficulty = "very hard";
      }
      return difficulty;
    },

    formattedPlays() {
      if (this.item.statistics) {
        const plays = this.item.statistics.total_played;
        if (plays >= 1000000) {
          return (plays / 1000000).toFixed(1) + 'm';
        } else if (plays >= 1000) {
          return (plays / 1000).toFixed(1) + 'k';
        } else {
          return plays.toString();
        }
      }
      return 'N/a'
    },
  }
}
</script>

<template>
  <div class="level-card">
    <div class="details">
      <div class="thumb-wrapper">
        <img v-if="hasImage" class="thumbnail" :src="this.$images_server_url + this.item.images.thumb.key" :width="this.item.images.thumb.width" :height="this.item.images.thumb.height" />
        <div v-if="item.statistics" class="plays">
          <img src="./../assets/icon_plays.png" alt="plays: ">
          <span>{{ formattedPlays }}</span>
        </div>
      </div>
      <div class="info">
        <div class="title">
          {{ item.title }}
          <div :class="`difficulty difficulty-${this.item.statistics?.difficulty_string || 'unrated'}`">{{ difficulty }}</div>
        </div>
        <div class="creators">{{ creators }}</div>
      </div>
    </div>
    <div class="buttons">
      <a target="_blank" :href=creatorUrl class="user-button">USER</a>
      <a target="_blank" :href=viewerURL class="open-button">OPEN</a>
    </div>
  </div>
</template>

<style scoped>
.level-card {
  width: 100%;
  background-color: var(--button);
  border-radius: 10px;
  padding: 3%;
  margin-block: 10px;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px
}
.details {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 15%;
}

.buttons a {
  color: #FFFFFF;
  font-size: 15px;
  margin: auto 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 90px;
  font-weight: bold;
  border-radius: 15px;
  cursor: pointer;
}

.open-button {
  background-color: var(--green);
}

.user-button {
  background-color: var(--blue);
}

.title {
  padding-top: 5px;
  font-size: 20px;
  line-height: 0.9;
  width: 100%;
  text-align: left;
}

.creators {
  font-size: 15px;
  font-style: italic;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: 15px;
  display: -webkit-box;   
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;     
  overflow: hidden;
  padding-top: 10px;
}

.difficulty {
  font-size: 0.8rem;
  white-space: nowrap;
  border-radius: 5rem;
  padding: 0.2rem 0.4rem;
  width: fit-content;
  display: inline-block;
}
.plays {
  grid-area: center;
  font-size: 0.8rem;
  white-space: nowrap;
  background-color: var(--hover);
  border-radius: 5rem;
  padding-inline: 0.4rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  width: fit-content;
  height: fit-content;
  margin: auto;
}
.plays img {
  width: 0.65rem;
  height: 0.8rem;
}

.thumb-wrapper {
  display: grid;
  width: max(20%, 100px);
  height: auto;
  grid-template-areas: "center";
}
.thumbnail {
  display: block;
  object-fit: contain;
  object-position: center;
  width: 100%;
  height: auto;
  border-radius: 10px;
  grid-area: center;
}

.difficulty-impossible {
  background-color: #7f007f;
}
.difficulty-veryhard {
  background-color: #EA0000;
}
.difficulty-hard {
  background-color: #F19400;
}
.difficulty-medium {
  background-color: #E1C800;
}
.difficulty-easy {
  background-color: #2BBA84;
}
.difficulty-unrated {
  background-color: #969696;
}

@media screen and (max-width: 750px) {
  .level-card {
    flex-direction: column;
  }
  .buttons {
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
  }
  .buttons a {
    font-size: 13px;
    height: fit-content;
    padding-block: 2px;
  }
}
</style>
