<script>
import { SearchLogsRequest } from '../requests/logging/SearchLogsRequest';

import CardLogLogging from './CardLogLogging.vue';

export default {
	components: {
		CardLogLogging,
	},
	data() {
		return {
			logs: [],
			cursor: null,
			loading: false,
			loaded: false,
			showFilters: false,
			filters: {
				user_id: '',
				claimed_user_id: '',
				claimed_username: '',
				context: '',
				client_version: '',
				platform: '',
				since: '',
				until: '',
			},
			appliedQuery: null,
		};
	},
	computed: {
		hasActiveFilters() {
			return this.appliedQuery !== null && Object.keys(this.appliedQuery).length > 0;
		},
	},
	methods: {
		buildQuery() {
			const query = {};
			for (const [key, value] of Object.entries(this.filters)) {
				if (value !== '') {
					if (key === 'since' || key === 'until') {
						query[key] = new Date(value).getTime();
					} else {
						query[key] = value;
					}
				}
			}
			return Object.keys(query).length > 0 ? query : null;
		},
		async applyFilters() {
			this.appliedQuery = this.buildQuery();
			await this.get_logs();
		},
		async clearFilters() {
			this.filters = {
				user_id: '',
				claimed_user_id: '',
				claimed_username: '',
				context: '',
				client_version: '',
				platform: '',
				since: '',
				until: '',
			};
			this.appliedQuery = null;
			await this.get_logs();
		},
		toggleFilters() {
			this.showFilters = !this.showFilters;
		},
		async get_logs() {
			this.loading = true;
			this.logs = [];
			this.cursor = null;

			const result = await SearchLogsRequest(null, this.appliedQuery || {});

			if (!result) {
				window.toast('Failed to load logs', 'error');
				this.loading = false;
				this.loaded = true;
				return;
			}

			this.logs = result.rows;
			this.cursor = result.next_cursor;
			this.loading = false;
			this.loaded = true;
		},
		async loadMore() {
			if (this.loading || !this.cursor) return;

			this.loading = true;

			const result = await SearchLogsRequest(this.cursor, this.appliedQuery || {});

			if (!result) {
				window.toast('Failed to load logs', 'error');
				this.loading = false;
				return;
			}

			this.logs = [...this.logs, ...result.rows];
			this.cursor = result.next_cursor;
			this.loading = false;
		},
		handleScroll() {
			const scrollY = window.scrollY;
			const visibleHeight = window.innerHeight;
			const totalHeight = document.documentElement.getBoundingClientRect().height;
			if (totalHeight - (scrollY + visibleHeight) < 1 && !this.loading && this.cursor) {
				this.loadMore();
			}
		},
	},
	created() {
		this.get_logs();
	},
	mounted() {
		window.addEventListener('scroll', this.handleScroll);
	},
	unmounted() {
		window.removeEventListener('scroll', this.handleScroll);
	},
};
</script>

<template>
	<div class="log-viewer" v-if="loaded">
		<div class="log-toolbar">
			<button class="filter-toggle" @click="toggleFilters">
				{{ showFilters ? 'Hide Filters' : 'Show Filters' }}
				<span v-if="hasActiveFilters" class="filter-badge">{{ Object.keys(appliedQuery).length }}</span>
			</button>
			<button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">Clear Filters</button>
		</div>
		<div v-if="showFilters" class="filter-panel">
			<div class="filter-row">
				<input v-model="filters.user_id" placeholder="user_id" @keydown.enter="applyFilters" />
				<input v-model="filters.claimed_user_id" placeholder="claimed_user_id" @keydown.enter="applyFilters" />
				<input v-model="filters.claimed_username" placeholder="claimed_username" @keydown.enter="applyFilters" />
			</div>
			<div class="filter-row">
				<input v-model="filters.context" placeholder="context" @keydown.enter="applyFilters" />
				<input v-model="filters.client_version" placeholder="client_version" @keydown.enter="applyFilters" />
				<input v-model="filters.platform" placeholder="platform" @keydown.enter="applyFilters" />
			</div>
			<div class="filter-row">
				<input v-model="filters.since" type="datetime-local" />
				<input v-model="filters.until" type="datetime-local" />
			</div>
			<button class="apply-btn" @click="applyFilters">Apply</button>
		</div>
		<div class="logs">
			<CardLogLogging v-for="log in logs" :key="log.key" :log="log" />
		</div>
		<div v-if="loading" class="loading">Loading more...</div>
		<div v-if="!loading && loaded && logs.length === 0" class="empty">No logs found</div>
	</div>
</template>

<style scoped>
.log-toolbar {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}
.filter-toggle,
.clear-btn,
.apply-btn {
	color: #fff;
	border: none;
	padding: 6px 14px;
	border-radius: 15px;
	cursor: pointer;
	font-size: 13px;
}
.filter-toggle {
	background: var(--blue);
}
.clear-btn {
	background: var(--red);
}
.apply-btn {
	background: var(--green);
}
.filter-badge {
	display: inline-block;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 99px;
	padding: 0 6px;
	margin-left: 4px;
	font-size: 11px;
	line-height: 16px;
}
.filter-panel {
	background: var(--hover);
	border-radius: 10px;
	padding: 12px;
	margin-bottom: 12px;
}
.filter-row {
	display: flex;
	gap: 12px;
	margin-bottom: 8px;
	flex-wrap: wrap;
}
.filter-row input {
	flex: 1;
	min-width: 160px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 15px;
	padding: 6px 8px;
	color: #fff;
	font-size: 13px;
	font-family: monospace;
	outline: none;
}
.filter-row input:focus {
	border-color: var(--blue);
}
.filter-row input::placeholder {
	color: rgba(255, 255, 255, 0.25);
}
.logs {
	font-family: monospace;
	padding: 0.75rem 0;
}
.loading {
	margin: 20px 0;
}
.empty {
	margin: 20px 0;
	color: rgba(255, 255, 255, 0.4);
}
</style>
