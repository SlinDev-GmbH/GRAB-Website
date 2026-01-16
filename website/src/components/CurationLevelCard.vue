<script>
import DifficultyCell from './DifficultyCell.vue';

export default {
	props: {
		item: Object,
	},

	components: {
		DifficultyCell,
	},

	computed: {
		creators() {
			if (this.item.creators && this.item.creators.length > 0) return 'by ' + this.item.creators.join(', ');

			return '';
		},

		hasImage() {
			if (this.item.images && this.item.images.thumb) {
				return true;
			}
			return false;
		},

		viewerURL() {
			return '/levels/viewer/?level=' + this.item.identifier;
		},

		creatorUrl() {
			return '/levels?tab=tab_other_user&user_id=' + this.item.identifier.split(':')[0];
		},

		formattedPlays() {
			if (this.item.statistics) {
				const plays = this.item.statistics.total_played;
				if (plays == null) return 'N/a';
				if (plays >= 1000000) {
					return (plays / 1000000).toFixed(1) + 'm';
				} else if (plays >= 1000) {
					return (plays / 1000).toFixed(1) + 'k';
				} else {
					return plays.toString();
				}
			}
			return 'N/a';
		},
	},
};
</script>

<template>
	<div class="level-card">
		<div class="details">
			<div class="thumb-wrapper">
				<img
					v-if="hasImage"
					class="thumbnail"
					:src="this.$images_server_url + this.item.images.thumb.key"
					:width="this.item.images.thumb.width"
					:height="this.item.images.thumb.height"
				/>
				<div v-if="item.statistics" class="plays">
					<img src="./../assets/icons/person.svg" alt="plays: " />
					<span>{{ formattedPlays }}</span>
				</div>
			</div>
			<div class="info">
				<div class="title">
					{{ item.title }}
					<DifficultyCell :level="item" class="difficulty" />
				</div>
				<div class="creators">{{ creators }}</div>
			</div>
		</div>
		<div class="buttons">
			<a target="_blank" :href="creatorUrl" class="user-button">USER</a>
			<a target="_blank" :href="viewerURL" class="open-button">OPEN</a>
		</div>
	</div>
</template>

<style scoped>
.level-card {
	width: 100%;
	background-color: var(--button);
	border-radius: 10px;
	padding: 3%;
	margin-block: 10px;
	overflow-wrap: break-word;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
}
.details {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	gap: 10px;
}

.info {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
}

.buttons {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;
	width: 15%;
}

.buttons a {
	color: #ffffff;
	font-size: 15px;
	margin: auto 0;
	white-space: nowrap;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 30px;
	width: 90px;
	font-weight: bold;
	border-radius: 15px;
	cursor: pointer;
}

.open-button {
	background-color: var(--green);
}

.user-button {
	background-color: var(--blue);
}

.title {
	padding-top: 5px;
	font-size: 20px;
	line-height: 0.9;
	width: 100%;
	text-align: left;
}

.creators {
	font-size: 15px;
	font-style: italic;
	text-align: left;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.description {
	font-size: 15px;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	padding-top: 10px;
}

.difficulty {
	padding-block: 0.2rem;
	display: inline-block;
}
.plays {
	font-size: 0.8rem;
	white-space: nowrap;
	background-color: #0005;
	border-radius: 5rem;
	padding-inline: 0.4rem;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	gap: 0.2rem;
	width: fit-content;
	height: fit-content;
	margin: auto;
	transition: background-color 0.3s ease, transform 0.3s ease;
	transform: scale(1);
}
.thumb-wrapper:hover .plays {
	background-color: var(--background);
	transform: scale(1.2);
}
.plays img {
	width: 0.65rem;
	height: 0.8rem;
}

.thumb-wrapper {
	display: grid;
	width: max(20%, 100px);
	height: fit-content;
	place-content: center;
	aspect-ratio: 512 / 288;
}
.thumbnail {
	display: block;
	object-fit: contain;
	object-position: center;
	width: 100%;
	height: auto;
	border-radius: 10px;
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
}

@media screen and (max-width: 750px) {
	.level-card {
		flex-direction: column;
	}
	.details {
		width: 100%;
	}
	.buttons {
		flex-direction: row;
		justify-content: flex-end;
		width: 100%;
	}
	.buttons a {
		font-size: 13px;
		height: fit-content;
		padding-block: 2px;
	}
}
</style>
