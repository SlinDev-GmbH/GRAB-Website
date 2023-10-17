<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { AddToCuratedListRequest } from '../requests/AddToCuratedListRequest.js'
import { RemoveFromCuratedListRequest } from '../requests/RemoveFromCuratedListRequest.js'
import { GetLevelDetailsRequest } from '../requests/GetLevelDetailsRequest.js'
import CurationLevelCard from './CurationLevelCard.vue'
import { listRequest } from '../requests/ListRequest'

export default {
  components: {
    CurationLevelCard
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
      levelList: []
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
      for (let i = 0; i < this.levelList.length; i++) {
        let levelId = this.levelList[i]["identifier"];
        let position = this.oldLevelList.findIndex(obj => obj.identifier === levelId);
        if (position !== i) {
          AddToCuratedListRequest(this.$api_server_url, this.accessToken, levelId, this.type, i.toString().padStart(8, '0'));
          console.log(levelId, this.type, i.toString().padStart(8, '0'));
        }
      }
      for (let i = 0; i < this.oldLevelList.length; i++) {
        let levelId = this.oldLevelList[i]["identifier"];
        let position = this.levelList.findIndex(obj => obj.identifier === levelId);
        if (position === -1) {
          RemoveFromCuratedListRequest(this.$api_server_url, this.accessToken, levelId, this.type);
          console.log(levelId, this.type);
        }
      }
      this.oldLevelList = this.levelList.slice();
		},

    setSelected(index) {
      this.selected = index;
    },
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
    <input type="button" value="Add Levels" id="add-levels-button" @click="addLevels"/><br />
    <input type="button" value="Remove Level" id="remove-levels-button" @click="removeLevel"/><br />
    <input type="button" value="Move Level Up" id="move-up-button" @click="moveLevelUp"/><br />
    <input type="button" value="Move Level Down" id="move-down-button" @click="moveLevelDown"/><br />
    <br>
    <input type="button" value="Send" id="send-button" @click="sendUpdates"/>
  </div>
</template>

<style scoped>
.selected .level-card {
    background-color: #c3c3c3;
}
#controls input {
    font-size: 20px;
    padding: 10px;
    margin-left: 10px;
    width: 20%;
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    border: none;
    border-radius: 15px;
}
#controls {
    text-align: center;
    clear: right;
    float: left;
    width: 27%;
}
#controls input {
    margin: 10px;
    width: 100%;
    margin-right: 0;
    margin-left: 20px;
    background-color: #555;
}
#controls input:nth-child(1) {
    margin-top: 0;
}
#controls #send-button {
    background-color: #00bc87;
}
#controls #add-levels-button {
    background-color: #00bc87;
}
#controls #remove-levels-button {
    background-color: red;
}
</style>
