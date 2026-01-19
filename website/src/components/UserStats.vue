<script>
import { getUserInfoRequest } from '../requests/GetUserInfoRequest';
import { getUserStatsRequest } from '../requests/GetUserStatsRequest';

export default {
	props: {
		user_id: String,
	},
	data() {
		return {
			stats: {},
			info: {},
			loaded: false,
		};
	},
	computed: {
		is_creator() {
			return this.info.is_creator;
		},
		is_moderator() {
			return this.info.is_moderator;
		},
		is_developer() {
			return this.info.is_developer || this.info.is_admin;
		},
		user_name() {
			return this.info.user_name;
		},
		finishes_tiers() {
			return this.stats.levels_finished_by_difficulty_tier;
		},
		unrated_finishes() {
			return (
				(this.stats.levels_finished_unique ?? 0) -
				(this.finishes_tiers.easy ?? 0) -
				(this.finishes_tiers.medium ?? 0) -
				(this.finishes_tiers.hard ?? 0) -
				(this.finishes_tiers.veryhard ?? 0) -
				(this.finishes_tiers.impossible ?? 0)
			);
		},
		top_1_tiers() {
			const tiers = this.stats.top1_by_difficulty_tier;
			tiers.veryhard = (tiers.veryhard ?? 0) + (tiers.impossible ?? 0); // expected 0
			return tiers;
		},
		unrated_top_1() {
			return (
				(this.stats.top1_total ?? 0) -
				(this.top_1_tiers.easy ?? 0) -
				(this.top_1_tiers.medium ?? 0) -
				(this.top_1_tiers.hard ?? 0) -
				(this.top_1_tiers.veryhard ?? 0) -
				(this.top_1_tiers.impossible ?? 0)
			);
		},
		top_10_tiers() {
			const tiers = this.stats.top10_by_difficulty_tier;
			tiers.veryhard = (tiers.veryhard ?? 0) + (tiers.impossible ?? 0); // expected 0
			return tiers;
		},
		unrated_top_10() {
			return (
				(this.stats.top10_total ?? 0) -
				(this.top_10_tiers.easy ?? 0) -
				(this.top_10_tiers.medium ?? 0) -
				(this.top_10_tiers.hard ?? 0) -
				(this.top_10_tiers.veryhard ?? 0) -
				(this.top_10_tiers.impossible ?? 0)
			);
		},
		formatted_last_active() {
			if (!this.stats.last_active_timestamp) return 'N/A';
			const date = new Date(this.stats.last_active_timestamp);
			return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
		},
		finish_percentage() {
			if (!this.stats.levels_played_unique || this.stats.levels_played_unique === 0) return 0;
			return Math.round((this.stats.levels_finished_unique / this.stats.levels_played_unique) * 100);
		},
		finish_percentages() {
			return {
				...Object.fromEntries(
					Object.entries(this.finishes_tiers).map(([key, value]) => {
						const percentage = Math.round((value / this.stats.levels_played_unique) * 100);
						return [key, percentage];
					}),
				),
				unrated: Math.round((this.unrated_finishes / this.stats.levels_played_unique) * 100),
			};
		},
	},
	methods: {
		async get_details() {
			this.loaded = false;
			this.stats = {};
			this.info = {};

			const stats_promise = getUserStatsRequest(this.$api_server_url, this.user_id);
			const info_promise = getUserInfoRequest(this.$api_server_url, this.user_id);
			const [stats, info] = await Promise.all([stats_promise, info_promise]);

			if (!stats) window.toast('Failed to load user stats', 'error');
			if (!info) window.toast('Failed to load user info', 'error');
			if (!stats || !info) return;

			this.stats = stats;
			this.info = info;
			this.loaded = true;
		},
		format_number(value) {
			let parts = String(value ?? 0).split('.');
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			return parts.join('.');
		},
	},
	created() {
		this.get_details();
	},
};
</script>

<template>
	<div class="stats-container" v-if="loaded">
		<div class="stat-card header-card">
			<div class="user-info">
				<span class="user-name">{{ user_name }}</span>
				<img v-if="is_creator" title="Creator" alt="creator" class="creator-icon" src="./../assets/icons/checkmark.svg" />
				<span v-if="is_moderator" title="Moderator" class="moderator-icon">M</span>
				<span v-if="is_developer" title="Developer" class="developer-icon">D</span>
				<span class="user-score">{{ format_number(Math.floor(stats.rating.total * 10) / 10) }}</span>
			</div>
			<a class="profile-button" :href="'levels?tab=tab_other_user&user_id=' + info.user_id"> Levels </a>
		</div>

		<div class="stat-card finishes-card">
			<div class="card-header">
				<h2>Finishes</h2>
			</div>
			<div class="main-progress-area">
				<div class="progress-numbers">
					<span class="big-num">{{ format_number(stats.levels_finished_unique) }}</span>
					<span class="separator">/</span>
					<span class="total-num">{{ format_number(stats.levels_played_unique) }} Levels</span>
				</div>
				<div class="progress-bar-container">
					<div class="progress-segments">
						<div
							class="unrated"
							:style="{
								width: finish_percentages.unrated + '%',
							}"
						></div>
						<div
							class="easy"
							:style="{
								width: finish_percentages.easy + '%',
							}"
						></div>
						<div
							class="medium"
							:style="{
								width: finish_percentages.medium + '%',
							}"
						></div>
						<div
							class="hard"
							:style="{
								width: finish_percentages.hard + '%',
							}"
						></div>
						<div
							class="veryhard"
							:style="{
								width: finish_percentages.veryhard + '%',
							}"
						></div>
						<div
							class="impossible"
							:style="{
								width: finish_percentages.impossible + '%',
							}"
						></div>
					</div>
					<span class="progress-percent">{{ finish_percentage }}%</span>
				</div>
			</div>

			<div class="tier-row">
				<div class="unrated" title="Unrated">{{ format_number(unrated_finishes) }}</div>
				<div class="easy" title="Easy">{{ format_number(finishes_tiers.easy) }}</div>
				<div class="medium" title="Medium">{{ format_number(finishes_tiers.medium) }}</div>
				<div class="hard" title="Hard">{{ format_number(finishes_tiers.hard) }}</div>
				<div class="veryhard" title="Very Hard">{{ format_number(finishes_tiers.veryhard) }}</div>
				<div class="impossible" title="Impossible">{{ format_number(finishes_tiers.impossible) }}</div>
			</div>
		</div>

		<div class="stat-card records-card">
			<h2>Records</h2>
			<div class="records-grid">
				<div class="grid-label">World Records</div>
				<div class="grid-total">{{ format_number(stats.top1_total) }}</div>
				<div class="tier-row">
					<div class="unrated">{{ format_number(unrated_top_1) }}</div>
					<div class="easy">{{ format_number(top_1_tiers.easy) }}</div>
					<div class="medium">{{ format_number(top_1_tiers.medium) }}</div>
					<div class="hard">{{ format_number(top_1_tiers.hard) }}</div>
					<div class="veryhard">{{ format_number(top_1_tiers.veryhard) }}</div>
				</div>

				<div class="grid-label">Top 10s</div>
				<div class="grid-total">{{ format_number(stats.top10_total) }}</div>
				<div class="tier-row">
					<div class="unrated">{{ format_number(unrated_top_10) }}</div>
					<div class="easy">{{ format_number(top_10_tiers.easy) }}</div>
					<div class="medium">{{ format_number(top_10_tiers.medium) }}</div>
					<div class="hard">{{ format_number(top_10_tiers.hard) }}</div>
					<div class="veryhard">{{ format_number(top_10_tiers.veryhard) }}</div>
				</div>
			</div>
		</div>

		<div class="stat-card activity-card">
			<h2>Activity</h2>
			<div class="activity-grid">
				<div class="activity-item">
					<span class="act-label">Last Active</span>
					<span class="act-value">{{ formatted_last_active }}</span>
				</div>
				<div class="activity-item">
					<span class="act-label">Days Active</span>
					<span class="act-value">{{ stats.days_active_unique }} Days</span>
				</div>
				<div class="activity-item">
					<span class="act-label">Current Streak</span>
					<span class="act-value">{{ stats.streak_days_current }} Days</span>
				</div>
				<div class="activity-item">
					<span class="act-label">Longest Streak</span>
					<span class="act-value">{{ stats.streak_days_longest }} Days</span>
				</div>
			</div>
		</div>

		<div class="stat-card levels-card">
			<h2>Creator Stats</h2>
			<div class="two-col-grid">
				<div class="stat-pair">
					<span class="label">Total Plays</span>
					<span class="value">{{ format_number(stats.creator_total_plays_received) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Unique Plays</span>
					<span class="value">{{ format_number(stats.creator_total_plays_received_unique) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Total Finishes</span>
					<span class="value">{{ format_number(stats.creator_total_finishes_received) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Unique Finishes</span>
					<span class="value">{{ format_number(stats.creator_total_finishes_received_unique) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Likes Received</span>
					<span class="value">{{ format_number(stats.creator_total_likes_received) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Tips Received</span>
					<span class="value">{{ format_number(stats.creator_total_tips_received_count) }}</span>
				</div>
			</div>
			<hr class="divider" />
			<div class="two-col-grid">
				<div class="stat-pair">
					<span class="label">Likes given</span>
					<span class="value"
						>{{ format_number(stats.likes_given_unique) }} / {{ format_number(stats.ratings_given_unique) }}</span
					>
				</div>
				<div class="stat-pair">
					<span class="label">Tips given</span>
					<span class="value">{{ format_number(stats.tips_given_unique) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Own levels published</span>
					<span class="value">{{ format_number(stats.publish_verification_total_count) }}</span>
				</div>
				<div class="stat-pair">
					<span class="label">Other's levels published</span>
					<span class="value">{{ format_number(stats.publish_verification_non_own_count) }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* layout */
.stats-container {
	--unrated: #969696;
	--easy: #2bba84;
	--medium: #e1c800;
	--hard: #f19400;
	--veryhard: #ea0000;
	--impossible: #aa00aa;

	width: 100%;
	max-width: 800px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding: 1rem;
}
.stat-card {
	background-color: var(--hover);
	border-radius: 15px;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
}
.header-card {
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.5rem;
}
h2 {
	margin: 0 0 1rem 0;
	font-size: 1.2rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	font-weight: 700;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 1.2em;
}
.user-name {
	font-size: 1.2em;
	font-weight: 700;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
}

.main-progress-area {
	margin-bottom: 1.5rem;
}
.progress-numbers {
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}
.big-num {
	font-size: 2.5rem;
	font-weight: 800;
	line-height: 1;
}
.separator {
	font-size: 1.5rem;
}
.total-num {
	font-size: 1.2rem;
}

.progress-bar-container {
	display: flex;
	align-items: center;
	gap: 1rem;
}
.progress-segments {
	width: 100%;
	flex-grow: 1;
	height: 12px;
	border-radius: 12px;
	overflow: hidden;
	background-color: var(--hover);
	display: flex;
	> div {
		height: 100%;
		background-color: var(--difficulty);
	}
}
.progress-percent {
	font-weight: bold;
}

.tier-row {
	display: flex;
	gap: 0.75rem;
	justify-content: space-between;
	> div {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 30px;
		font-weight: 800;
		color: #fff;
		height: 2.5rem;
		font-size: 1.1rem;
		background-color: var(--difficulty);
	}
}

.unrated {
	--difficulty: var(--unrated);
}
.easy {
	--difficulty: var(--easy);
}
.medium {
	--difficulty: var(--medium);
}
.hard {
	--difficulty: var(--hard);
}
.veryhard {
	--difficulty: var(--veryhard);
}
.impossible {
	--difficulty: var(--impossible);
}

.records-grid {
	display: grid;
	grid-template-columns: 120px 50px 1fr;
	gap: 0.75rem;
	row-gap: 1.5rem;
	align-items: center;
}
.grid-label {
	font-weight: 500;
	font-size: 1.2rem;
}
.grid-total {
	font-weight: 800;
	font-size: 1.2rem;
	text-align: center;
}

.activity-grid {
	display: flex;
	justify-content: space-around;
	background: #fff1;
	border-radius: 15px;
	padding: 1rem;
}
.activity-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.25rem;
}
.act-label {
	font-size: 0.8rem;
	opacity: 0.8;
	text-transform: uppercase;
}
.act-value {
	font-size: 1.1rem;
	font-weight: 700;
}

.two-col-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem 2rem;
	background: #fff1;
	border-radius: 15px;
	padding: 1em;
}
.stat-pair {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.divider {
	border: none;
	margin: 1rem 0;
	width: 100%;
}
.value {
	font-weight: 700;
}
/* icons */
.creator-icon {
	width: 20px;
	height: 20px;
}
.moderator-icon {
	width: 20px;
	height: 20px;
	line-height: 20px;
	background-color: #de9343;
	border-radius: 50%;
	font-size: 14px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}
.developer-icon {
	width: 20px;
	height: 20px;
	line-height: 20px;
	background-color: #dd3619;
	border-radius: 50%;
	font-size: 14px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}
.profile-button {
	padding: 0.2rem 0.6rem;
	font-weight: bold;
	background-color: var(--blue);
	color: white;
	border-radius: 30px;
	cursor: pointer;
}

@media screen and (max-width: 620px) {
	.records-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		.tier-row {
			width: 100%;
		}
	}
}
@media screen and (max-width: 600px) {
	.activity-grid {
		flex-wrap: wrap;
		gap: 1em;
		column-gap: 0;
	}
	.activity-item {
		width: 50%;
	}
}
@media screen and (max-width: 510px) {
	.two-col-grid {
		grid-template-columns: 1fr;
	}
}
</style>
