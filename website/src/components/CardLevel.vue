<script>
export default {
  props: {
    item: Object
  },

  computed: {
    creators() {
      if(this.item.creators && this.item.creators.length > 0)
        return 'by ' + this.item.creators.join(', ')

      return ''
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
      /*cell.innerHTML += '<b class="cell-difficulty" style="' + difficultyColor + '">' + difficulty + '</b>'

      if("statistics" in levelInfo && "total_played" in levelInfo.statistics)
      {
        cell.innerHTML += '<span class="cell-plays">plays: ' + levelInfo.statistics.total_played + '</span>'
      }
      cell.innerHTML += '<br>'*/
    },

    viewerURL() {
      return 'levels/viewer/?level=' + this.item.identifier
    },

    hasOKStamp() {
      return this.item.tags?.includes('ok') ?? false;
    }
  }
}
</script>

<template>
  <div class="card">
    <div :style="{color: difficulty.color}" class="difficulty">{{ difficulty.difficulty }}</div><div v-if="item.statistics" class="plays">plays: {{ item.statistics.total_played }}</div><br>
    <div class="title">{{ item.title }}</div>
    <div class="creators">{{ creators }}</div>
    <div class="more-button">More Levels</div>
    <div class="description">{{ item.description }}</div>
    <a target="_blank" :href="viewerURL" class="play-button">OPEN</a>
    <img v-if="hasOKStamp" alt="OK Stamp" class="stamp" src="./../assets/stamp_ok.png" width="453" height="180" />
  </div>
</template>

<style>
.card {
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
