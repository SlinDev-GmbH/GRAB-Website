<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import CurationControls from './CurationControls.vue'
import NewCurationButton from './NewCurationButton.vue'
import RemoveCurationButton from './RemoveCurationButton.vue'
import Terms from './Terms.vue'

import { GetCuratedListsRequest } from '../requests/GetCuratedListsRequest';

export default {
  components: {
	CurationControls,
	NewCurationButton,
	RemoveCurationButton,
	Terms,
  },

  computed: {
	...mapState(useUserStore, ['isAdmin']),
	...mapState(useUserStore, ['accessToken']),
  },

  data() {
	return {
	  typeSelector: null,
	  typesList: [],
	  selected: 0,
	  type: ""
	}
  },

  async created() {
	const result = await GetCuratedListsRequest(this.$api_server_url)
	if (result) {
	  this.typesList = result;
	  this.displayTypeSelector();
	  this.handleTypeChange();
	}
  },

  mounted() {
	this.typeSelector = document.getElementById("typeSelector");
  },

  methods: {
	async handleTypeChange() {
	  this.type = this.typeSelector.options[this.typeSelector.selectedIndex].value;
	},

	handleTypeListUpdate(typesList) {
		this.typesList = typesList
		this.displayTypeSelector()
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
	}
  }
}
</script>

<template>
	<div id="curation">
		<header>
			<a class="back-button" href="/levels">Back</a>
			<h1>Curated Level Lists</h1>
			<div v-if="isAdmin" id="buttonWrapper">
				<NewCurationButton @handled="handleTypeListUpdate"/>
				<RemoveCurationButton @handled="handleTypeListUpdate"/>
			</div>
			<div id="typeSelectorWrapper">
				<select id="typeSelector" @change="handleTypeChange"></select>
			</div>
		</header>
		<main>
			<CurationControls :type="type"/>
		</main>
		<Terms/>
	</div>
</template>

<style scoped>

#curation {
  padding: 2rem;
  font-weight: normal;
  
  height: 100vh;
  max-height: 100vh;
  color: var(--color-text);
  background: var(--color-background);
  line-height: 1.6;
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: grid;
  grid-template-rows: 20vh 70vh;
}

main {
	display: flex;
	flex-direction: row;
	height: 70vh;
	max-width: 1000px;
	margin: 0 auto;
}

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
	margin: 0;
	text-align: center;
	font-size: 32px;
	padding: 0;
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
	max-width: 1000px;
	margin: 0 auto;
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
	width: max(20%, 150px);
	color: #fff;
	cursor: pointer;
	font-weight: bold;
	border: none;
	border-radius: 15px;
}
.back-button {
	font-size: 20px;
	padding: 10px 20px;
	margin-left: 10px;
	color: #fff;
	background-color: #00bc87;
	cursor: pointer;
	font-weight: bold;
	border: none;
	border-radius: 15px;
}
</style>
