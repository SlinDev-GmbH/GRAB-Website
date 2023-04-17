<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import ModerationTools from './ModerationTools.vue'
import VerifyLevelButton from './VerifyLevelButton.vue'

export default {
  components: {
    ModerationTools,
    VerifyLevelButton
  },

  props: {
    item: Object,
    moderationItem : Object
  },

  data() {
    return {
      cardColor: 'white'
    }
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
    },

    hasStatistics() {
      return this.moderationItem? false : true
    },

    difficulty() {
      let difficulty = "unrated"
      let difficultyColor = "#969696"
      if("statistics" in this.item)
      {
        if("difficulty" in this.item.statistics && "total_played" in this.item.statistics)
        {
          if(this.item.statistics.difficulty !== 1.0 && this.item.statistics.total_played > 0)
          {
            if(this.item.statistics.difficulty < 0.01)
            {
              difficulty = "very hard"
              difficultyColor = "#EA0000"
            }
            else if(this.item.statistics.difficulty < 0.1)
            {
              difficulty = "hard"
              difficultyColor = "#F19400"
            }
            else if(this.item.statistics.difficulty < 0.4)
            {
              difficulty = "medium"
              difficultyColor = "#E1C800"
            }
            else
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
      return 'levels/viewer/?level=' + this.item.identifier
    },

    hasOKStamp() {
      return this.item.tags?.includes('ok') ?? false;
    },

    isModerationCell() {
      return this.moderationItem !== null
    },

    ...mapState(useUserStore, ['isModerator'])
  },

  methods: {
    didHandleCell(bad) {
      if(bad === true)
      {
        this.cardColor = 'lightcoral'
      }
      else
      {
        this.cardColor = 'lightgreen'
      }
    }
  }
}
</script>

<template>
  <div class="level-card" :style="{'background-color': cardColor}">
    <div v-if="hasStatistics" :style="{color: difficulty.color}" class="difficulty">{{ difficulty.difficulty }}</div><div v-if="hasStatistics && item.statistics" class="plays">plays: {{ item.statistics.total_played }}</div><br v-if="hasStatistics">
    <div class="title">{{ item.title }}</div>
    <div class="creators">{{ creators }}</div>
    <div class="more-button">More Levels</div>
    <div class="description">{{ item.description }}</div>
    <VerifyLevelButton v-if="isModerator" :level-info="item"/>
    <ModerationTools v-if="isModerationCell" :moderation-item="moderationItem" @handled="didHandleCell"/>
    <a target="_blank" :href="viewerURL" class="play-button">OPEN</a>
    <img v-if="hasOKStamp" alt="OK Stamp" class="stamp" src="./../assets/stamp_ok.png" width="453" height="180" />
  </div>
</template>

<style>
.level-card {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 3%;
  padding-bottom: 60px;
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
  text-align:center;
  text-decoration: none;
}

.stamp {
  position: absolute;
  right: 2%;
  bottom: 3%;
  width: 15%;
  height: auto;
}
</style>
