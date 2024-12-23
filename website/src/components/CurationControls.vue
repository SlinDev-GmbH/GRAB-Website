<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { AddToCuratedListRequest } from '../requests/AddToCuratedListRequest.js'
import { RemoveFromCuratedListRequest } from '../requests/RemoveFromCuratedListRequest.js'
import { GetLevelDetailsRequest } from '../requests/GetLevelDetailsRequest.js'
import { listRequest } from '../requests/ListRequest'
import CurationLevelCard from './CurationLevelCard.vue'

export default {
  components: {
    CurationLevelCard,
  },

  props: {
    type: String,
  },

  computed: {
    ...mapState(useUserStore, ['accessToken'])
  },
    
  data() {
    return {
      selected: 0,
      oldLevelList: [],
      levelList: [],
      sendButtonText: "Send"
    }
  },

  created() {
    this.updateType();
  },

  watch: {
    type: function() {
      this.updateType();
    }
  },

  methods: {
    async updateType() {     
      if (this.type) {
        const result = await listRequest(this.$api_server_url, this.accessToken, `curated_${this.type}`, false, this.$max_level_format_version, false, false)
        if (result) {
          this.oldLevelList = result;
          this.levelList = this.oldLevelList.slice();
        }
      }
    },

    async addLevels() {
      let levelIds = prompt("Please enter the list of URLs, each one in a new line: ");
      if (levelIds !== null) {
        let ids = levelIds.split("\n");
        for (const id of ids) {
          let parts = id.split("level=");
          let levelId = parts[1];
          const results = await GetLevelDetailsRequest(this.$api_server_url, levelId)
          if (results) {
              this.levelList.push(results);
          }
        }
      }
    },
    
    removeLevel() {
      let index = this.selected;
      this.levelList.splice(index, 1);
    },
        
		moveLevelUp() {
			let index = this.selected;
			if (index > 0) {
				let levelId = this.levelList[index];
				let temp = this.levelList[index - 1];
				this.levelList[index - 1] = levelId;
				this.levelList[index] = temp;
				this.setSelected(index - 1);
			}
		},

    moveLevelTop() {
      let index = this.selected;
      if (index > 0) {
        let levelId = this.levelList[index];
        this.levelList.splice(index, 1);
        this.levelList.unshift(levelId);
        this.setSelected(0);
      }
    },

		moveLevelDown() {
			let index = this.selected;
			if (index < this.levelList.length - 1) {
				let levelId = this.levelList[index];
				let temp = this.levelList[index + 1];
				this.levelList[index + 1] = levelId;
				this.levelList[index] = temp;
				this.setSelected(index + 1);
			}
		},
		
		sendUpdates() {
			if (!this.accessToken) {
				alert("No access token!");
				return;
			}

      this.sendButtonText = "Sending..";
      let requests = [];

      for (let i = 0; i < this.levelList.length; i++) {
        let levelId = this.levelList[i]["identifier"];
        let position = this.oldLevelList.findIndex(obj => obj.identifier === levelId);
        if (position !== i) {
          requests.push(
            AddToCuratedListRequest(this.$api_server_url, this.accessToken, levelId, this.type, i.toString().padStart(8, '0'))
          );
        }
      }
      for (let i = 0; i < this.oldLevelList.length; i++) {
        let levelId = this.oldLevelList[i]["identifier"];
        let position = this.levelList.findIndex(obj => obj.identifier === levelId);
        if (position === -1) {
          requests.push(
            RemoveFromCuratedListRequest(this.$api_server_url, this.accessToken, levelId, this.type)
          );
        }
      }

      if (requests.length === 0) {
        this.sendButtonText = "No changes";
        setTimeout(() => {
          this.sendButtonText = "Send";
        }, 1000);
        return;
      }

      Promise.all(requests).then(() => {
        this.oldLevelList = this.levelList.slice();
        this.sendButtonText = "Sent!";
        setTimeout(() => {
          this.sendButtonText = "Send";
        }, 2000);
      }).catch(() => {
        alert("Error!");
      });
		},

    setSelected(index) {
      this.selected = index;
    },

    handleKey(event) {
      if (event.key === 'ArrowUp') {
        this.moveLevelUp();
      }
      else if (event.key === 'ArrowDown') {
        this.moveLevelDown();
      }
      else if (event.key === 'Delete') {
        this.removeLevel();
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.handleKey);
  },

  unmounted() {
    window.removeEventListener('keydown', this.handleKey);
  },
}
</script>

<template>
  <div id="levelList">
    <div v-for="(item, index) in levelList" :key="index" :class="'grid-item' + (index === selected ? ' selected' : '')">
      <CurationLevelCard :item="item" @click="setSelected(index)" />
    </div>
  </div>
  <div id="controls">
    <span id="count">{{ levelList.length }} levels</span>
    <input type="button" value="Add Levels" id="add-levels-button" @click="addLevels"/>
    <input type="button" value="Remove Level" id="remove-levels-button" @click="removeLevel"/>
    <input type="button" value="Move Up" id="move-up-button" @click="moveLevelUp"/>
    <input type="button" value="Move Down" id="move-down-button" @click="moveLevelDown"/>
    <input type="button" value="To Top" id="move-top-button" @click="moveLevelTop"/>
    <br>
    <input type="button" :value="sendButtonText" id="send-button" @click="sendUpdates"/>
  </div>
</template>

<style scoped>
.selected .level-card {
    background-color: var(--hover);
}
.grid-item {
  min-width: 0;
}
#controls input {
    font-size: 20px;
    background-color: var(--hover);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 100%;
    font-weight: bold;
    border-radius: 15px;
    cursor: pointer;
}
#controls {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
  height: fit-content;
  padding-inline: 10px;
  gap: 10px;
}
#controls #send-button {
    background-color: var(--green);
}
#controls #add-levels-button {
    background-color: var(--green);
}
#controls #remove-levels-button {
    background-color: var(--red);
}
#levelList {
  font-size: 20px;
  text-align: center;
  border-radius: 10px;
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  max-height: 100%;
}
#count {
  font-size: 18px;
  text-align: center;
  margin-top: 20px;
  margin-inline: auto;
  text-align: center;
}
@media screen and (max-width: 750px) {
  #controls input {
    font-size: 15px;
    height: fit-content;
    padding-block: 5px;
  }
}
</style>
