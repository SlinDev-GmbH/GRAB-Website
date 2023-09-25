<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  computed: {
    ...mapState(useUserStore, ['isAdmin']),
    ...mapState(useUserStore, ['accessToken']),
  },

  data() {
    return {
      typeSelector: null,
      oldLevelList: [],
      levelList: [],
      typesList: [],
    }
  },

  mounted() {
    this.typeSelector = document.getElementById("typeSelector");
    // This stores the original level list as it is on the server
    fetch(this.$api_server_url + 'get_curated_lists').then(response => {
      response.json().then(data => {
        this.typesList = data;
        this.displayTypeSelector();
        this.handleTypeChange();
      });
    });
  },

  methods: {
		async addLevels() { // adds a new levels to the list
      let levelIds = prompt("Please enter the list of URLs, each one in a new line: ");
      if (levelIds !== null) {
				let ids = levelIds.split("\n");
				for (const id of ids) {
					let parts = id.split("level=");
					let levelId = parts[1];
					await fetch(this.$api_server_url + 'details/' + levelId.split(":").join("/")).then(response => {
						response.json().then(data => {
							this.levelList.push(data);
							this.displayList();
						});
					});
				}
			}
		},

    handleTypeChange() {
      let type = this.typeSelector.options[this.typeSelector.selectedIndex].value;
      fetch(this.$api_server_url + 'list?max_format_version=8&type=curated_' + type).then(response => {
        response.json().then(data => {
          this.oldLevelList = data;
          this.levelList = this.oldLevelList.slice();
          this.displayList();
        });
      });
    },

		removeLevel() { // removes the selected level from the list
			let index = document.getElementById("levelList").selectedIndex;
			this.levelList.splice(index, 1);
			this.displayList();
		},

		moveLevelUp() { // moves the selected level up by one
			let index = document.getElementById("levelList").selectedIndex;
			if (index > 0) {
				let levelId = this.levelList[index];
				let temp = this.levelList[index - 1];
				this.levelList[index - 1] = levelId;
				this.levelList[index] = temp;
				this.displayList();
				document.getElementById("levelList").selectedIndex = index - 1;
			}
		},

		moveLevelDown() { // moves the selected level down by one
			let index = document.getElementById("levelList").selectedIndex;
			if (index < this.levelList.length - 1) {
				let levelId = this.levelList[index];
				let temp = this.levelList[index + 1];
				this.levelList[index + 1] = levelId;
				this.levelList[index] = temp;
				this.displayList();
				document.getElementById("levelList").selectedIndex = index + 1;
			}
		},
		
		sendUpdates() { // sends all updates to the server
			if (!this.accessToken) {
				alert("No access token!");
				return;
			}
			let type = this.typeSelector.options[this.typeSelector.selectedIndex].value;
		  for (let i = 0; i < this.levelList.length; i++) {
		    let levelId = this.levelList[i]["identifier"];
		    let position = this.oldLevelList.findIndex(obj => obj.identifier === levelId);
		    if (position !== i) {
		      fetch(this.$api_server_url + 'add_to_curated_list?' + 'level_id=' + levelId + '&list_key=' + type + '&level_key=' + i.toString().padStart(8, '0') + '&access_token=' + this.accessToken);
		    }
		  }
		  for (let i = 0; i < this.oldLevelList.length; i++) {
		    let levelId = this.oldLevelList[i]["identifier"];
		    let position = this.levelList.findIndex(obj => obj.identifier === levelId);
		    if (position === -1) {
		      fetch(this.$api_server_url + 'remove_from_curated_list?' + 'level_id=' + levelId + '&list_key=' + type + '&access_token=' + this.accessToken);
		    }
		  }
		  this.oldLevelList = this.levelList.slice();
		},

		displayTypeSelector() { // displays the list in the page
			this.typeSelector.innerHTML = '';
			for (let i = 0; i < this.typesList.length; i++) {
				let type = this.typesList[i];
				let option = document.createElement('option');
				option.value = type;
				option.text = type;
				this.typeSelector.appendChild(option);
			}
		},

		displayList() { // displays the list in the page
			let listElement = document.getElementById('levelList');
			listElement.innerHTML = '';
			listElement.size = this.levelList.length;
			for (let i = 0; i < this.levelList.length; i++) {
				let levelTitle = this.levelList[i]["title"];
				let option = document.createElement('option');
				option.value = levelTitle;
				option.text = levelTitle;
				listElement.appendChild(option);
			}
		},

    addNewList() {
			if (!this.accessToken) {
				alert("No access token!");
				return;
			}
			const name = prompt("Please enter the name of the new list:");
			if (name) {
				fetch(this.$api_server_url + 'add_curated_list?' + "name=" + name + "&access_token=" + this.accessToken).then(response => {
					response.json().then(data => {
						this.typesList = data;
						this.displayTypeSelector();
					});
				});
			}
		},

    removeList() {
			if (!this.accessToken) {
				alert("No access token!");
				return;
			}
      const name = prompt("Please enter the name of the list to remove:");
			if (name) {
				fetch(this.$api_server_url + 'remove_curated_list?' + "name=" + name + "&access_token=" + accessToken).then(response => {
					response.json().then(data => {
						this.typesList = data;
						this.displayTypeSelector();
					});
				});
			}
		}
  }
}
</script>

<template>
  <h1>Curated Level Lists</h1>
	<div id="buttonWrapper">
		<button class="button" id="add-new-list-button" @click="addNewList">Add New List</button>
		<button class="button" id="remove-list-button" @click="removeList">Remove List</button>
	</div>
	<div id="typeSelectorWrapper">
		<select id="typeSelector" @change="handleTypeChange"></select>
	</div>
	<div id="container">
		<select id="levelList"></select>
		<div id="controls">
			<input type="button" value="Add Levels" id="add-levels-button" @click="addLevels"/><br />
			<input type="button" value="Remove Level" id="remove-levels-button" @click="removeLevel"/><br />
			<input type="button" value="Move Level Up" id="move-up-button" @click="moveLevelUp"/><br />
			<input type="button" value="Move Level Down" id="move-down-button" @click="moveLevelDown"/><br />
			<br>
			<input type="button" value="Send" id="send-button" @click="sendUpdates"/>
		</div>
	</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
::-webkit-scrollbar {
    display: none;
}
html {
    padding-bottom: 20px;
}
body {
    background-color: #4BA0D6;
    padding-inline: 10px;
    margin-inline: auto;
    max-width: 960px;
    font-family: 'Roboto', sans-serif;
}
h1 {
    margin-block: 40px;
    text-align: center;
    font-size: 32px;
    padding-top: 15px;
    padding-bottom: 15px;
}
select:focus-visible {
    outline: none;
}
#typeSelectorWrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 20px;
}
#typeSelector {
    font-size: 20px;
    text-align: center;
    display: block;
    margin-left: 10px;
    padding: 10px;
    border-radius: 10px;
    border: 2px solid #ccc;
    flex: 1;
}
#buttonWrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 10px;
}
.button, #controls input {
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
#add-new-list-button {
    background-color: #00bc87;
}
#remove-list-button {
    background-color: red;
}
#container {
    margin: 0 auto;
    padding: 10px;
    width: 100%;
    display: block;
    height: 0;
    padding-block: 0;
}
#levelList {
    float: left;
    font-size: 20px;
    text-align: center;
    border-radius: 10px;
    border: 2px solid #ccc;
    width: 70%;
    margin-left: 0;
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
