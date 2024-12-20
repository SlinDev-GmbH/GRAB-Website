<script>
import { GetLevelReportInfoRequest } from "../requests/GetLevelReportInfoRequest.js";
import { GetLevelDetailsRequest } from '../requests/GetLevelDetailsRequest.js'

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

import VLazyImage from 'v-lazy-image'
import ReportModerationTools from './ReportModerationTools.vue'
import VerifyLevelButton from './VerifyLevelButton.vue'
import SkipLevelButton from './SkipLevelButton.vue'
import HideLevelButton from './HideLevelButton.vue'
import UnhideLevelButton from './UnhideLevelButton.vue'
import FavoriteLevelButton from './FavoriteLevelButton.vue'
import ReportLevelButton from './ReportLevelButton.vue'
import UnscheduleDeletionButton from './UnscheduleDeletionButton.vue'
import ThumbnailFullscreenButton from './ThumbnailFullscreenButton.vue'

export default {
  components: {
    ReportModerationTools,
    VerifyLevelButton,
    SkipLevelButton,
    VLazyImage,
    HideLevelButton,
    UnhideLevelButton,
    FavoriteLevelButton,
    ReportLevelButton,
    UnscheduleDeletionButton,
    ThumbnailFullscreenButton
  },

  emit: ['more'],

  props: {
    item: Object,
    moderationItem : Object,
    index: Number,
    listType: String,
    bestReason: String
  },

  data() {
    return {
      cardColor: 'transparent',
      imageKeys: [],
      isHidden: this.item.hidden,
      isApproved: false,
      isSkipped: false,
      isRecovered: false,
      currentModerationImage: 0,
      imageInterval: undefined,
    }
  },
  provide() {
    return {
      bestReason: (computed(()=>this.bestReason))
    }
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return this.item.creators.join(', ')

      return ''
    },

    tags() {
      if(this.item.tags && this.item.tags.length > 0) {
        return this.item.tags.filter(t => t !== 'ok')
      }
      return []
    },

    hasImage() {
      if(this.item.images && this.item.images.thumb)
      {
        return true
      }
      else if(this.moderationItem && this.moderationItem.image)
      {
        return true
      }
      return false
    },

    randomGradient() {
      const randomColor = () => {
        let r = Math.floor(Math.random() * 256)
        let g = Math.floor(Math.random() * 256)
        let b = Math.floor(Math.random() * 256)
        return `rgb(${r}, ${g}, ${b})`
      }

      const randomColor1 = randomColor();
      const randomColor2 = randomColor();
      return `background-image: linear-gradient(to bottom right, ${randomColor1}, ${randomColor2})`
    },

    hasStatistics() {
      return this.moderationItem? false : true
    },

    hasDifficulty() {
      return (this.listType !== "tab_favorite_levels")
    },

    difficulty() {
      let difficulty = this.item.statistics?.difficulty_string || "unrated";
      if (difficulty == "veryhard") {
        difficulty = "very hard";
      }
      return difficulty;
    },

    viewerURL() {
      return '/levels/viewer/?level=' + this.item.identifier
    },

    hasOKStamp() {
      return this.item.tags?.includes('ok') ?? false;
    },

    isModerationCell() {
      return this.moderationItem !== null
    },

    formattedPlays() {
      if (this.hasStatistics && this.item.statistics) {
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

    ...mapState(useUserStore, ['isVerifier', 'isAdmin', 'isSuperModerator', 'isLoggedIn', 'accessToken'])
  },

  async created() {
    if (this.hasImage && this.isModerationCell) {
      this.imageKeys = await this.getReportImages();
    }
  },

  methods: {
    hideState(){
      this.isHidden = !this.isHidden
    },

    showMoreLevels() {
      this.$emit('more', this.item.identifier.split(':')[0])
    },

    setListIndex(index) {
      const userStore = useUserStore()
      userStore.setListIndex(index)
    },

    async getReportImages() {
      const report_info = await GetLevelReportInfoRequest(this.$api_server_url, this.item.identifier, this.accessToken);
      const keys = [];
      if ("images" in report_info) {
        for (let i in report_info.images) {
          if (report_info.images[i].key) {
            keys.push('https://grab-images.slin.dev/' + report_info.images[i].key);
          }
        }
      }
      return keys;
    },
    async fetchFallbackThumbnail(levelIdentifier) {
      try {
        const response = await GetLevelDetailsRequest(this.$api_server_url, levelIdentifier.replace(':','/'));
        if (response.images && response.images.thumb) {
          return `${this.$images_server_url + response.images.thumb.key}`;
        }
      } catch (error) {
        console.error("Error fetching thumbnail:", error);
      }
      return null;
    },
    async handleThumbnailError(event) {
      const fallbackURL = await this.fetchFallbackThumbnail(this.item.identifier);
      if (fallbackURL) {
        event.src = fallbackURL;
      } else {
        console.warn("Fallback thumbnail not available for:", this.item.identifier);
      }
    }
  },

  mounted() {
    if (this.hasImage && this.isModerationCell) {
    this.imageInterval = setInterval(() => {
      this.currentModerationImage++;
      if (this.currentModerationImage >= this.imageKeys.length) {
        this.currentModerationImage = 0;
      }
    }, 600);
  }
  },
  unmounted() {
    if (this.imageInterval) clearInterval(this.imageInterval);
  }
}
</script>

<template>
  <div class="level-card" :style="{'background-color': cardColor}">
    <div class="card">
      <div class="card-images">
        <div :style="randomGradient" class="random-gradient"></div>
        <v-lazy-image v-if="hasImage && !isModerationCell" class="thumbnail" :intersection-options="{ rootMargin: '50%' }" :src="this.$images_server_url + this.item.images.thumb.key" :width="this.item.images.thumb.width" :height="this.item.images.thumb.height" @error="handleThumbnailError"/>
        <div v-if="hasImage && isModerationCell" class="moderation-images">
          <v-lazy-image v-for="(image, i) in this.imageKeys" v-show="i == this.currentModerationImage" class="thumbnail" :intersection-options="{ rootMargin: '50%' }" :src="image" :key="image" width="512" height="288"  @error="handleThumbnailError"/>
        </div>
      </div>

      <div class="card-overlay">
        <img v-if="hasOKStamp" alt="Verified" class="stamp" src="./../assets/creator.png" width="20" height="20" />
        <div v-if="hasStatistics && item.statistics" class="plays">
          <img src="./../assets/icon_plays.png" alt="plays: ">
          <span>{{ formattedPlays }}</span>
        </div>
        <div v-if="hasStatistics && hasDifficulty" :class="`difficulty difficulty-${this.item.statistics?.difficulty_string || 'unrated'}`">{{ difficulty }}</div>
      </div>
      
      <div class="card-hover">
        <div class="hover-top">
          <ThumbnailFullscreenButton v-if="hasImage && !isModerationCell" :imageUrl="this.$images_server_url + this.item.images.full.key" :thumbnailUrl="this.$images_server_url + this.item.images.thumb.key"/>
          <a target="_blank" :href="viewerURL + (this.listType == 'tab_verify_queue' ? '&verify_queue' : '')" class="play-button" @click="setListIndex(index)">OPEN</a>
        </div>
        <div class="hover-middle">
          <div class="description">{{ item.description }}</div>
        </div>
        <div class="hover-bottom">
          <div class="tags" v-if="tags != []">
            <span v-for="tag in tags" class="tag" :key="tag">{{ tag }}</span>  
          </div>
        </div>
      </div>

      <div class="card-fixed">
        <ReportLevelButton v-if="isLoggedIn" :level_id="item.identifier" />
        <FavoriteLevelButton v-if="isLoggedIn" :level_id="item.identifier"/>
      </div>
    </div>
    <div class="details">
      <div class="title" :style="(this.isApproved || this.isRecovered) ? 'color: var(--green)' : (this.isHidden || this.isSkipped || (this.listType === 'tab_deletion_queue' && !isRecovered)) ? 'color: var(--red);' : ''">
        {{ item.title }}
        <span v-if="this.isHidden" class="hidden-tag">Hidden</span>
        <span v-else-if="this.isSkipped" class="hidden-tag">Skipped</span>
        <span v-else-if="this.isApproved" class="approved-tag">Approved</span>
        <span v-if="this.listType === 'tab_deletion_queue' && !isRecovered" class="hidden-tag">Deleted</span>
      </div>
      <div class="creators">By
        <span @click="showMoreLevels" :title="creators">
          {{ creators ? creators : ".." }}
        </span>
      </div>
    </div>
    <div v-if="!listType.startsWith('curated_')" class="privileged-buttons">
      <VerifyLevelButton v-if="isVerifier && this.listType !== 'tab_deletion_queue' && !isModerationCell" :level-info="item"/>
      <SkipLevelButton v-if="isVerifier && this.listType === 'tab_verify_queue'" :level-info="item" @skipped="isSkipped=true;"/>
      
      <HideLevelButton v-show="!isHidden" v-if="!isHidden && isSuperModerator && !isModerationCell && this.listType !== 'tab_verify_queue' && this.listType !== 'tab_deletion_queue'" :level_id="item.identifier" @hide="hideState"/>
      <UnhideLevelButton  v-show="isHidden" v-if="isSuperModerator && !isModerationCell && this.listType !== 'tab_verify_queue'" :level_id="item.identifier" @hide="hideState"/>
      
      <UnscheduleDeletionButton v-if="!isRecovered && isAdmin && this.listType === 'tab_deletion_queue'" :level_id="item.identifier" @recovered="isRecovered=true"/>
    </div>
    <ReportModerationTools v-if="isModerationCell" :moderation-item="moderationItem" @hide="isHidden=true;" @approve="isApproved=true;"/>
  </div>
</template>

<style scoped>
.level-card {
  width: 100%;
  height: 100%;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.card {
  display: grid;
  grid-template-areas: "card";
  aspect-ratio: 512 / 288;
  width: 100%;
  border-radius: 15px;
  box-shadow: 0 0 0 #0005;
  transition: box-shadow 0.1s linear, scale 0.2s ease;
}
.card:hover {
  box-shadow: 3px 3px 0 #0005;
  scale: 1.05;
}
.card-images, .card-overlay, .card-hover {
  grid-area: card;
  width: 100%;
  height: 100%;
}

.card-images {
  display: grid;
  grid-template-areas: "thumb";
  border-radius: 15px;
  overflow: hidden;
  aspect-ratio: 512 / 288;
}
.card-overlay {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 10px;
  visibility: visible;
  opacity: 1;
  transition: opacity 0.3s linear;
}
.card:hover .card-overlay {
  visibility: hidden;
  opacity: 0;
}
.card-hover {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: #0005;
  border-radius: 15px;
  background-image: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  background-size: 100%;
  background-repeat: no-repeat;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s linear;
}
.card:hover .card-hover {
  visibility: visible;
  opacity: 1;
}
.card-fixed {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  grid-area: card;
  width: 100%;
  height: fit-content;
  margin-top: auto;
  padding: 10px;
}

.thumbnail {
  grid-area: thumb;
  object-fit: contain;
  object-position: center;
  width: 100%;
  height: 100%;
}
.moderation-images {
  grid-area: thumb;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  display: flex;
  flex-direction: row;
}
.random-gradient {
  grid-area: thumb;
  width: 100%;
  height: 100%;
}

.hover-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  padding: 10px;
  padding-bottom: 0;
}
.hover-middle {
  display: grid;
  place-content: center;
  height: 100%;
  padding-inline: 1rem;
}
.hover-bottom {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  padding: 10px;
  padding-top: 0;
  padding-bottom: 1rem;
  margin-top: auto;
  min-height: 2rem;
}

.stamp {
  width: 1.3rem;
  height: 1.3rem;
}
.difficulty {
  font-size: 0.8rem;
  white-space: nowrap;
  border-radius: 5rem;
  padding-inline: 0.4rem;
  margin-left: auto;
}
.plays {
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
}
.plays img {
  width: 0.65rem;
  height: 0.8rem;
}

.tags {
  display: flex;
  flex-direction: row;
  gap: 2px;
}
.tag {
  font-size: 13px;
  font-style: italic;
  background-color: var(--green);
  padding: 0 8px;
  border-radius: 50px;
}

.play-button {
  background-color: var(--hover);
  color: var(--light);
  font-weight: bold;
  white-space: nowrap;
  border-radius: 5rem;
  height: 2rem;
  padding-inline: 3rem;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  place-content: center;
  transition: background-color 0.1s linear, scale 0.1s linear;
}
.play-button:hover {
  background-color: var(--active);
  scale: 1.05;
}
.description {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  text-shadow: 1px 1px 0px #000;
  font-size: 0.74rem;
  -webkit-box-orient: vertical;
  max-height: 3.3rem;
}

.details {
  max-width: 100%;
}

.title {
  padding-top: 5px;
  font-size: 1.2rem;
  font-style: bold;
  line-height: 0.9;
  margin-left: 1rem;
  margin-top: 5px;
}
.creators {
  font-size: 1rem;
  font-style: italic;
  margin-left: 1rem;
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  gap: 5px;
}
.creators span {
  font-style: normal;
  cursor: pointer;
  color: var(--alt);
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  max-height: 1.3rem;
}
.hidden-tag {
  font-size: 12px;
  font-style: italic;
  background-color: var(--red);
  padding: 0 8px;
  border-radius: 50px;
  margin-left: 5px;
}
.approved-tag {
  font-size: 12px;
  font-style: italic;
  background-color: var(--green);
  padding: 0 8px;
  border-radius: 50px;
  margin-left: 5px;
}

.privileged-buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.6rem;
  padding-inline: 10px;
  padding-top: 5px;
  margin-top: auto;
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
</style>
