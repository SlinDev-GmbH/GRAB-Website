<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { GetLevelBrowserRequest } from '../requests/GetLevelBrowserRequest';
import ScrollList from './ScrollList.vue';

export default {
	computed: {
		...mapState(useUserStore, ['accessToken']),
		isSection() {
			return this.currentSection.sections;
		},
		isList() {
			return this.currentSection.list_key;
		},
	},

	components: {
		ScrollList,
	},

	data() {
		return {
			featured: {},
			currentSection: {},
			displayingLevels: false,
			sectionStack: [],
			loaded: false,
		};
	},

	emits: ['tabChanged'],

	methods: {
		async loadFeatured() {
			const result = await GetLevelBrowserRequest(this.$api_server_url);
			if (result !== false) {
				return result;
			}
			return [];
		},

		tabChanged(query) {
			this.$emit('tabChanged', query);
		},

		handleBack() {
			if (this.sectionStack.length > 0) {
				this.currentSection = this.sectionStack.pop();
			} else {
				this.currentSection = this.featured;
			}
			this.update_url_param();
		},

		update_url_param() {
			this.$router.replace({
				query: {
					tab: 'tab_featured',
					...(this.currentSection !== this.featured && { list: this.currentSection.title }),
				},
			});
		},

		setSection(section) {
			console.log(section);
			if (section.list_key) {
				if (section.list_key.startsWith('user:')) {
					const userID = section.list_key.split(':')[1];
					this.tabChanged({ tab: 'tab_other_user', user_id: userID });
				}
			}
			this.sectionStack.push(this.currentSection);
			this.currentSection = section;
			this.update_url_param();
		},

		shouldRenderSection(section) {
			if (section.list_key) {
				if (section.list_key.startsWith('builtin:')) {
					return false;
				}
				if (['ok_newest', 'newest'].includes(section.list_key)) {
					return false;
				}
			}
			if (section.type === 'space') {
				return false;
			}
			return true;
		},

		isSpace(section) {
			return section.type === 'space';
		},

		getThumbnail(section) {
			return this.$images_server_url + section.image;
		},

		flattened_sections() {
			const result = [];

			const visit = (node) => {
				result.push(node);
				if (node.sections) node.sections.forEach(visit);
			};

			// skip 'Level Browser'
			this.featured.sections.forEach(visit);
			return result;
		},
	},

	async mounted() {
		let featured = await this.loadFeatured();
		this.featured = featured;
		this.currentSection = this.featured;
		this.loaded = true;

		const list = this.$route.query?.list;
		if (list) {
			const sections = this.flattened_sections();
			const section = sections.find((section) => section.title === list);
			if (section) {
				this.setSection(section);
			}
		}
	},
};
</script>

<template>
	<div class="section-header">
		<button v-if="loaded && this.currentSection !== this.featured" @click="this.handleBack">
			<img src="./../assets/icons/back.svg" alt="back" />
		</button>
		<h2 v-if="this.currentSection !== this.featured" class="section-title">
			{{ this.currentSection.hasOwnProperty('title_short') ? this.currentSection.title_short : this.currentSection.title }}
		</h2>
	</div>
	<div v-if="isList">
		<ScrollList
			:listType="this.currentSection.list_key"
			:difficulty="''"
			:tag="''"
			:searchTerm="''"
			:otherUserID="null"
			@tab-changed="(query) => this.tabChanged(query)"
		/>
	</div>
	<div v-else-if="isSection" class="sections">
		<div class="section-element-title" v-for="section in this.currentSection.sections" :key="section.title">
			<div class="section-button" v-if="shouldRenderSection(section)">
				<span class="section-label" @click="this.setSection(section)">{{ section.title }}</span>
				<span class="view-all" @click="this.setSection(section)">View all</span>
			</div>
			<div v-if="shouldRenderSection(section) && section.list_key" class="featured-list-wrapper horizontal-list">
				<ScrollList
					:listType="section.list_key"
					:difficulty="''"
					:tag="''"
					:searchTerm="''"
					:otherUserID="null"
					:horizontal="true"
					@tab-changed="(query) => this.tabChanged(query)"
				/>
			</div>
			<div v-else-if="shouldRenderSection(section) && section.sections">
				<div class="featured-list-wrapper">
					<div class="section-list">
						<div
							v-for="subsection in section.sections"
							:key="subsection.title"
							class="section-card"
							@click="this.setSection(subsection)"
						>
							<img v-if="shouldRenderSection(subsection)" :src="getThumbnail(subsection)" />
							<span v-if="shouldRenderSection(subsection)">{{ subsection.title }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.sections {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 10px;
}
.section-label {
	font-weight: bold;
}
.section-element-title {
	width: 100%;
	font-size: 20px;
	border-radius: 15px;
	box-sizing: border-box;
	text-decoration: none;
	margin-bottom: 5px;
}
.section-element-title span {
	padding-inline: 1rem;
}
.section-button {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}
.section-button span {
	cursor: pointer;
}
.view-all {
	font-weight: 400;
	color: var(--light);
	opacity: 0.3;
	transition: opacity 0.2s linear;
}
.view-all:hover {
	opacity: 0.7;
}
.section-title,
.section-element-title {
	color: white;
}
.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-block: 10px;
}
.section-header button {
	width: 40px;
	height: 40px;
	font-size: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: var(--hover);
	cursor: pointer;
}
.section-header button img {
	width: 23px;
	height: 20px;
	opacity: 0.7;
	transition: opacity 0.3s linear;
}
.section-header button:hover img {
	opacity: 1;
}
.featured-list-wrapper {
	overflow-x: scroll;
	width: 100%;
	padding: 1rem;
	&::-webkit-scrollbar {
		display: none;
	}
}
.horizontal-list {
	min-height: 250px; /* TODO: better loading animation thing */
}
.section-list {
	display: flex;
	flex-direction: row;
	width: fit-content;
	grid-gap: 2rem;
	margin-bottom: 4rem;
}
.section-card {
	width: 300px;
	display: grid;
	aspect-ratio: 512 / 288;
	border-radius: 15px;
	box-shadow: 0 0 0 #0005;
	transition: box-shadow 0.1s linear, transform 0.2s ease;
	cursor: pointer;
	transform: scale(1);
}
.section-card img {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	border-radius: 15px;
}
.section-card:hover {
	box-shadow: 3px 3px 0 #0005;
	transform: scale(1.05);
}
.section-card:not(:has(img)) {
	display: none;
}
.section-card span {
	margin: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	outline: 2px solid var(--light);
	text-shadow: 1px 1px 0 #000;
	box-shadow: 3px 3px 0 #000;
	background-color: #0003;
	max-width: 90%;
	text-align: center;
}
@media screen and (max-width: 600px) {
	.section-card {
		max-width: 200px;
	}
	.section-card span {
		font-size: 1rem;
	}
}
@media screen and (max-width: 730px) {
	.section-list {
		gap: 0.8rem;
	}
}
@media screen and (max-width: 500px) {
	.section-list {
		gap: 0.5rem;
	}
	.section-card img {
		border-radius: 10px;
	}
}
</style>
