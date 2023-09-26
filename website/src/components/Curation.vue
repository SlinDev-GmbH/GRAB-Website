<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import CurationControls from './CurationControls.vue'
import NewCurationButton from './NewCurationButton.vue'
import RemoveCurationButton from './RemoveCurationButton.vue'
import { listRequest } from '../requests/ListRequest'
import { GetCuratedListsRequest } from '../requests/GetCuratedListsRequest';

export default {
  components: {
    CurationControls,
    NewCurationButton,
    RemoveCurationButton,
  },

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

  async mounted() {
    this.typeSelector = document.getElementById("typeSelector");
    const result = await GetCuratedListsRequest(this.$api_server_url)
    if (result) {
      this.typesList = result;
      this.displayTypeSelector();
      this.handleTypeChange();
    }
  },

  methods: {
    async handleTypeChange() {
      let type = this.typeSelector.options[this.typeSelector.selectedIndex].value;
      const result = await listRequest(this.$api_server_url, this.accessToken, `curated_${type}`, false, this.$max_level_format_version, false, false)
      if (result) {
        this.oldLevelList = result;
        this.levelList = this.oldLevelList.slice();
        this.displayList();
      }
    },

		displayTypeSelector() {
			this.typeSelector.innerHTML = '';
			for (let i = 0; i < this.typesList.length; i++) {
				let type = this.typesList[i];
				let option = document.createElement('option');
				option.value = type;
				option.text = type;
				this.typeSelector.appendChild(option);
			}
		},

		displayList() {
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

    handleControlsUpdate(list) {
      if (list) {
        this.levelList = list;
        this.displayList();
      }
    }
  }
}
</script>

<template>
  <h1>Curated Level Lists</h1>
	<div id="buttonWrapper">
		<NewCurationButton :typesList="typesList" @handled="displayTypeSelector"/>
		<RemoveCurationButton :typesList="typesList" @handled="displayTypeSelector"/>
	</div>
	<div id="typeSelectorWrapper">
		<select id="typeSelector" @change="handleTypeChange"></select>
	</div>
	<div id="container">
		<select id="levelList"></select>
		<CurationControls :typeSelector="typeSelector" :oldLevelList="oldLevelList" :levelList="levelList" @handled="handleControlsUpdate"/>
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
.button {
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
</style>
