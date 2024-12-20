<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

import CurationControls from './CurationControls.vue'
import NewCurationButton from './NewCurationButton.vue'
import RemoveCurationButton from './RemoveCurationButton.vue'
import LegalTerms from './LegalTerms.vue'
import DropDown from './DropDown.vue'

import { GetCuratedListsRequest } from '../requests/GetCuratedListsRequest';

export default {
  components: {
	CurationControls,
	NewCurationButton,
	RemoveCurationButton,
	LegalTerms,
	DropDown,
  },

  computed: {
	  ...mapState(useUserStore, ['isAdmin', 'accessToken']),
  },

  data() {
	return {
	  typesList: [],
	  type: ""
	}
  },

  async created() {
	const result = await GetCuratedListsRequest(this.$api_server_url)
	if (result) {
	  this.typesList = result;
	  this.type = this.typesList[0] || "Error";
	}
  },

  methods: {
	handleTypeListUpdate(typesList) {
		this.typesList = typesList
	}
  },
}
</script>

<template>
	<div id="curation">
		<a class="back-button" href="/levels">
			<img src="./../assets/icon_back.png" alt="back">
		</a>
		<header>
			<h1>Curated Level Lists</h1>
			<div id="list-control">
				<DropDown :options='typesList.length ? typesList : ["Loading.."]' :defaultChoice='typesList[0] || "Loading.."' :flip='true' @changeSelection="type = $event"/>
				<div v-if="isAdmin" id="buttonWrapper">
					<NewCurationButton @handled="handleTypeListUpdate"/>
					<RemoveCurationButton @handled="handleTypeListUpdate"/>
				</div>
			</div>
		</header>
		<main>
			<CurationControls :type="type"/>
		</main>
		<LegalTerms/>
	</div>
</template>

<style scoped>
#curation {
	padding: 2rem;
	font-weight: normal;

	height: 100svh;
	max-height: 100svh;
	margin: 0 auto;
	color: var(--color-text);
	background: var(--color-background);
	background-image: var(--gradient);
	line-height: 1.6;
	font-family: 'Roboto', sans-serif;
	font-size: 15px;
	text-rendering: optimizeLegibility;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	display: grid;
	grid-template-rows: 150px auto;
}

#curation header {
	max-width: 1000px;
	margin: 0 auto;
	display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
	width: 100%;
	padding-inline: 1rem;
}

#list-control {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding-bottom: 1rem;
}

main {
	max-width: 1000px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: auto min(200px, 30%);
	width: 100%;
	height: 100%;
	max-height: calc(100svh - 150px - 4rem);
}

::-webkit-scrollbar {
	display: none;
}
html {
	padding-bottom: 20px;
}
body {
	background-color: var(--blue);
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
#typeSelector {
	font-size: 20px;
	text-align: center;
	display: block;
	padding-inline: 10px;
	border-radius: 10px;
	border: 2px solid #ccc;
	margin: 0 auto;
	width: 100%;
	height: 40px;
}
#buttonWrapper {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
	gap: 15px;
}

.back-button {
	position: absolute;
	top: 10px;
	left: 10px;
    width: 40px;
    height:  40px;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--hover);
    cursor: pointer;
}
.back-button img {
    width: 23px;
    height: 20px;
    opacity: 0.7;
    transition: opacity 0.3s linear;
}
.back-button:hover img {
    opacity: 1;
}
</style>
