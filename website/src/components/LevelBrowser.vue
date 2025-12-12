<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import NavBar from './NavBar.vue';
import LevelTitle from './LevelTitle.vue';
import UserTitle from './UserTitle.vue';
import ScrollList from './ScrollList.vue';
import LoginButton from './LoginButton.vue';
import CurrencyInfo from './CurrencyInfo.vue';
import FeaturedLevels from './FeaturedLevels.vue';
import LevelDifficultySortingControls from './LevelDifficultySortingControls.vue';
import LevelTagSortingControls from './LevelTagSortingControls.vue';
import LegalTerms from './LegalTerms.vue';
import ScrollToTop from './ScrollToTop.vue';

export default {
	components: {
		NavBar,
		LevelTitle,
		UserTitle,
		ScrollList,
		LoginButton,
		CurrencyInfo,
		FeaturedLevels,
		LevelDifficultySortingControls,
		LevelTagSortingControls,
		LegalTerms,
		ScrollToTop,
	},

	data() {
		return {
			tabActive: this.$route.query?.tab ?? 'tab_newest',
			searchTerm: '',
			userID: null,
			difficultyFilter: '',
			tagFilter: '',
			isLoading: false,
		};
	},
	computed: {
		...mapState(useUserStore, ['isModerator', 'isSuperModerator', 'accessToken', 'isLoggedIn']),

		showLevelTitle() {
			const options = [
				'tab_newest',
				'tab_ok_newest',
				'tab_favorite_levels',
				'tab_verify_queue',
				'tab_reported_levels',
				'tab_featured',
			];
			return options.includes(this.tabActive);
		},
		showSortingControls() {
			const options = ['tab_newest', 'tab_ok_newest'];
			return options.includes(this.tabActive);
		},
		showUserTitle() {
			const options = ['tab_my_levels', 'tab_other_user'];
			return options.includes(this.tabActive);
		},
		tagString() {
			const passthroughOptions = ['tab_verify_queue', 'tab_reported_levels', 'tab_featured'];
			if (passthroughOptions.includes(this.tabActive)) return this.tabActive;

			if (this.tabActive === 'tab_favorite_levels') return 'favorite_levels';
			return (
				(this.tabActive == 'tab_ok_newest' ? 'ok_' : '') +
				(this.tagFilter == '' ? '' : this.tagFilter + '_') +
				'newest' +
				(this.difficultyFilter == '' ? '' : '_' + this.difficultyFilter)
			);
		},
	},

	methods: {
		tabChanged(query) {
			this.tabActive = query.tab;
			if ('search' in query) this.searchTerm = query['search'];
			if ('user_id' in query) this.userID = query['user_id'];
			else this.userID = null;
			this.$router.push({ query: query });
		},

		searchChanged(value) {
			this.userID = null;
			this.searchTerm = value;
			let query = {
				tab: this.tabActive,
			};
			if (value && value.length > 0) query['search'] = value;
			this.$router.push({ query: query });
		},

		async copyAccessToken() {
			await navigator.clipboard.writeText(this.accessToken);
		},

		difficultyChanged(filter) {
			this.isLoading = true;
			this.difficultyFilter = filter;
		},

		tagChanged(filter) {
			this.isLoading = true;
			this.tagFilter = filter;
		},

		loaded() {
			this.isLoading = false;
		},
	},
	watch: {
		'$route.query': {
			handler(newQuery) {
				this.tabActive = newQuery.tab || 'tab_newest';
				this.searchTerm = newQuery.search || '';
				this.userID = newQuery.user_id || null;
			},
		},
	},
	created() {
		document.title = 'GRAB Levels';
	},
};
</script>

<template>
	<div id="level-browser">
		<img v-if="showUserTitle && userID == '29sgp24f1uorbc6vq8d2k'" class="rick" src="../assets/rick_astley.webp" />
		<header>
			<div class="home-link-wrapper">
				<CurrencyInfo v-if="isLoggedIn" />
				<a href="/" class="home-link">
					<img alt="GRAB logo" class="logo" src="/logo.webp" />
				</a>
				<LoginButton />
				<a v-if="isModerator" class="curation-button" type="button" href="/curation" target="_blank">Curation</a>
				<button v-if="isSuperModerator" class="access-token-button" type="button" @click="copyAccessToken">Access Token</button>
			</div>
			<div class="navigation">
				<NavBar
					:tab-active="tabActive"
					@tab-changed="(query) => this.tabChanged(query)"
					@search-changed="(value) => this.searchChanged(value)"
					:search-term="searchTerm"
				/>
				<div class="sorting">
					<LevelDifficultySortingControls
						v-if="showSortingControls"
						:currentTab="tabActive"
						:isLoading="isLoading"
						:currentValue="difficultyFilter"
						@filter="difficultyChanged"
					/>
					<LevelTagSortingControls
						v-if="showSortingControls"
						:currentTab="tabActive"
						:isLoading="isLoading"
						:currentValue="tagFilter"
						@filter="tagChanged"
					/>
				</div>
			</div>
			<LevelTitle v-if="showLevelTitle" :tagString="tagString" />
		</header>
		<main>
			<UserTitle v-if="showUserTitle" :other-user-i-d="userID" />
			<FeaturedLevels v-if="tabActive === 'tab_featured'" @tab-changed="(query) => this.tabChanged(query)" />
			<ScrollList
				v-else
				:list-type="tabActive"
				:difficulty="difficultyFilter"
				:tag="tagFilter"
				:search-term="searchTerm"
				:other-user-i-d="userID"
				@tab-changed="(query) => this.tabChanged(query)"
				@loaded="loaded"
			/>
		</main>
		<LegalTerms />
		<ScrollToTop />
	</div>
</template>

<style scoped>
#level-browser {
	color: var(--text);
	font-family: 'Nunito', 'Roboto', sans-serif;
	font-size: 1rem;
	line-height: 1.6;
	font-weight: normal;
	/* padding: 2rem; */
}

header {
	padding-bottom: 30px;
}

header,
main {
	/* this is important for scrolling, trust me */
	/* max-width: 1400px; */
	box-sizing: unset;
	padding-inline: calc((100% - 1400px) / 2);
	/* padding-inline: 1rem; */
	border: 1rem solid transparent;
	margin: 0 auto;
}

.logo {
	width: 100%;
	height: auto;
}
.home-link {
	width: fit-content;
	margin-inline: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 80%;
	max-width: 400px;
}
.home-link-wrapper {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
	padding-bottom: 30px;
}

@media screen and (max-width: 500px) {
	.logo {
		padding-bottom: 5px;
	}
}
@media screen and (max-width: 800px) {
	.home-link-wrapper {
		padding-top: 40px;
	}
	.logo {
		width: 80%;
	}
}
@media screen and (max-width: 630px) {
	.home-link-wrapper {
		padding-bottom: 10px;
	}
	.logo {
		width: 60%;
	}
}

.access-token-button {
	width: 120px;
	height: 30px;
	font-size: 15px;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	border-radius: 15px;
	box-sizing: border-box;
	background-color: var(--hover);
	text-align: center;
	top: 70px;
	right: 0px;
	position: absolute;
	cursor: pointer;
}

.curation-button {
	width: 120px;
	height: 30px;
	font-size: 15px;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	border-radius: 15px;
	box-sizing: border-box;
	text-decoration: none;
	background-color: var(--alt);
	color: #ffffff;
	text-align: center;
	top: 35px;
	right: 0px;
	position: absolute;
	cursor: pointer;
	padding-block: 3px;
}

@media screen and (max-width: 460px) {
	.curation-button,
	.access-token-button {
		font-size: 12px;
		width: 110px;
		height: 25px;
	}
	.curation-button {
		top: 30px;
	}
	.access-token-button {
		top: 60px;
	}
}

img.rick {
	width: 100vw;
	height: 100svh;
	position: fixed;
	top: 0;
	left: 0;
	object-fit: cover;
	opacity: 0.1;
	mix-blend-mode: luminosity;
}

.navigation {
	display: flex;
	flex-direction: column;
}

.sorting {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}
</style>
