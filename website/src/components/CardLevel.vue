<script>
import { GetLevelReportInfoRequest } from "../requests/GetLevelReportInfoRequest.js";

import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

import VLazyImage from 'v-lazy-image'
import ReportModerationTools from './ReportModerationTools.vue'
import VerifyLevelButton from './VerifyLevelButton.vue'
import SkipLevelButton from './SkipLevelButton.vue'
import HideLevelButton from './HideLevelButton.vue'
import HideTipLevelButton from './HideTipLevelButton.vue'
import UnhideLevelButton from './UnhideLevelButton.vue'
import FavoriteLevelButton from './FavoriteLevelButton.vue'
import ReportLevelButton from './ReportLevelButton.vue'
import UnscheduleDeletionButton from './UnscheduleDeletionButton.vue'

export default {
  components: {
    ReportModerationTools,
    VerifyLevelButton,
    SkipLevelButton,
    VLazyImage,
    HideLevelButton,
    HideTipLevelButton,
    UnhideLevelButton,
    FavoriteLevelButton,
    ReportLevelButton,
    UnscheduleDeletionButton
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
      cardColor: 'white',
      imageKeys: [],
      isHidden: this.item.hidden
    }
  },
  provide(){
    return {
      bestReason: (computed(()=>this.bestReason))
    }
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

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

    hasStatistics() {
      return this.moderationItem? false : true
    },

    hasDifficulty() {
      return (this.listType !== "tab_favorite_levels")
    },

    difficulty() {
      let difficulty = "unrated"
      let difficultyColor = "#969696"
      if("statistics" in this.item)
      {
        if("difficulty" in this.item.statistics && "total_played" in this.item.statistics)
        {
          if(this.item.statistics.difficulty_string)
          {
            if(this.item.statistics.difficulty_string == "impossible")
            {
              difficulty = "impossible"
              difficultyColor = "#7f007f"
            }
            else if(this.item.statistics.difficulty_string == "veryhard")
            {
              difficulty = "very hard"
              difficultyColor = "#EA0000"
            }
            else if(this.item.statistics.difficulty_string == "hard")
            {
              difficulty = "hard"
              difficultyColor = "#F19400"
            }
            else if(this.item.statistics.difficulty_string == "medium")
            {
              difficulty = "medium"
              difficultyColor = "#E1C800"
            }
            else if(this.item.statistics.difficulty_string == "easy")
            {
              difficulty = "easy"
              difficultyColor = "#2BBA84"
            }
          }
        }
      }
      return {difficulty: difficulty, color: difficultyColor}
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

    ...mapState(useUserStore, ['isVerifier']),
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['isSuperModerator']),
    ...mapState(useUserStore, ['isLoggedIn']),
    ...mapState(useUserStore, ['accessToken'])
  },

  async created() {
    if(this.item.hidden === true) this.cardColor = 'lightcoral';
    if (this.hasImage && this.isModerationCell) {
      this.imageKeys = await this.getReportImages();
    }
  },

  methods: {
    hideState(){
      this.isHidden = !this.isHidden
    },
    didHandleCell(bad) {
      if(bad === true)
      {
        this.cardColor = 'lightcoral'
      }
      else
      {
        this.cardColor = 'lightgreen'
      }
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
        const response = await fetch(`https://api.slin.dev/grab/v1/details/${levelIdentifier.replace(':','/')}`);
        const data = await response.json();
        if (data.images && data.images.thumb) {
          return `${this.$images_server_url + data.images.thumb.key}`;
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

}
</script>

<template>
  <div class="level-card" :style="{'background-color': cardColor}">
    <v-lazy-image v-if="hasImage && !isModerationCell" class="thumbnail" :intersection-options="{ rootMargin: '50%' }" :src="this.$images_server_url + this.item.images.thumb.key" :width="this.item.images.thumb.width" :height="this.item.images.thumb.height" @error="handleThumbnailError"/>
    <div v-if="hasImage && isModerationCell" :class="'moderation-images' + (this.imageKeys.length > 1 ? ' moderation-images-multiple' : '')">
    <v-lazy-image v-for="image in this.imageKeys" class="thumbnail" :intersection-options="{ rootMargin: '50%' }" :src="image" width="512" height="288"  @error="handleThumbnailError"/>
    </div>
    <div v-if="hasStatistics && hasDifficulty" :style="{color: difficulty.color}" class="difficulty">{{ difficulty.difficulty }}</div>
    <div v-if="hasStatistics && item.statistics" class="plays">plays: {{ item.statistics.total_played }}</div><br v-if="hasStatistics">
    <div class="title">{{ item.title }}</div>
    <div class="tags">
      <span v-if="tags != []" v-for="tag in tags" class="tag">{{ tag }}</span>  
    </div>
    <div class="creators">{{ creators }}</div>
    <div class="more-button" @click="showMoreLevels">More Levels</div>
    <div class="description">{{ item.description }}</div>
    <VerifyLevelButton v-if="isVerifier && this.listType !== 'tab_deletion_queue'" :level-info="item"/>
    <SkipLevelButton v-if="isVerifier && this.listType === 'tab_verify_queue'" :level-info="item"/>
    <HideLevelButton v-show="!isHidden" v-if="!isHidden && (isSuperModerator || isAdmin) && !isModerationCell && this.listType !== 'tab_verify_queue' && this.listType !== 'tab_deletion_queue'" :level_id="item.identifier" @handled="didHandleCell" @hideBtn="hideState"/>
    <HideTipLevelButton v-if="isAdmin && !isModerationCell && !isHidden && this.listType !== 'tab_verify_queue'" :level_id="item.identifier" @handled="didHandleCell"/>
    <UnhideLevelButton  v-show="isHidden" v-if="isSuperModerator && !isModerationCell && this.listType !== 'tab_verify_queue'" :level_id="item.identifier" @handled="didHandleCell" @click="hideState"/>
    <UnscheduleDeletionButton v-if="isSuperModerator && this.listType === 'tab_deletion_queue'" :level_id="item.identifier" @handled="didHandleCell"/>
    <ReportModerationTools v-if="isModerationCell" :moderation-item="moderationItem" @handled="didHandleCell"/>
    <div class="interactions">
      <FavoriteLevelButton v-if="isLoggedIn" :level_id="item.identifier"/>
      <ReportLevelButton v-if="isLoggedIn" :level_id="item.identifier" />
    </div>
    <a target="_blank" :href="viewerURL + (this.listType == 'tab_verify_queue' ? '&verify_queue' : '')" class="play-button" @click="setListIndex(index)">OPEN</a>

    <img v-if="hasOKStamp" alt="OK Stamp" class="stamp" src="./../assets/stamp_ok.png" width="453" height="180" />
  </div>
</template>

<style scoped>

.moderation-images {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0%;
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
  overflow-y: hidden;
  overflow-x: scroll;
  display: flex;
  flex-direction: row;
}

.moderation-images-multiple::after {
  content: "...";
  display: block;
  width: 100%;
  height: 100%;
  margin-top: 30%;
  position: absolute;
  color: #0007;
  font-size: 60px;
  text-align: center;
}

.level-card {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  padding-bottom: 60px;
  overflow-wrap: break-word;
}

.difficulty {
  width: 30%;
  font-size: 15px;
  white-space: nowrap;
  text-align: left;
  float: left;
}

.plays {
  width: 45%;
  font-size: 15px;
  white-space: nowrap;
  text-align: right;
  float: right;
}

.title {
  padding-top: 5px;
  font-size: 20px;
  font-style: bold;
  line-height: 0.9;
}

.creators {
  font-size: 15px;
  font-style: italic;
}

.tags {
  display: flex;
  flex-direction: row;
  gap: 2px;
  padding-top: 2px;
}

.tag {
  font-size: 9px;
  font-style: italic;
  color: #001b29ca;
  background-color: #cfeaf6;
  padding: 0 8px;
  border-radius: 50px;
}

.description {
  font-size: 15px;
  display: -webkit-box;   
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;     
  overflow: hidden;
  padding-top: 10px;
}

.play-button {
  display: block;
  position: absolute;
  bottom: 5%;
  width: 40%;
  left: 30%;
  line-height: 30px;
  border: none;
  border-radius: 10px;
  background-color:#00BC87;
  color: #FFFFFF;
  font-weight: bold;
  font-size: 15px;
  text-align:center;
  text-decoration: none;
}

.more-button {
  cursor: pointer;
  display: block;
  width: fit-content;
  padding-left: 10px;
  padding-right: 10px;
  line-height: 20px;
  border: none;
  border-radius: 10px;
  background-color:#4642BE;
  color: #FFFFFF;
  font-weight: bold;
  font-size: 13px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.stamp {
  position: absolute;
  right: 2%;
  bottom: 3%;
  width: 15%;
  height: auto;
}

.thumbnail {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0%;
  display: block;
  object-fit: contain;
  object-position: center;
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.interactions {
  display: flex;
  width: 27%;
  flex-direction: row;
  justify-content: flex-start;
  gap: 8%;
  align-items: center;
  position: absolute;
  bottom: 5%;
  left: 3%;
}
</style>
