<script>
import { GetUserLogsRequest } from '../requests/logging/GetUserLogsRequest';
import { DeleteUserLogsRequest } from '../requests/logging/DeleteUserLogsRequest';

import CardLogLogging from './CardLogLogging.vue';

export default {
	components: {
		CardLogLogging,
	},
	props: {
		user_id: String,
	},
	data() {
		return {
			logs: [],
			cursor: null,
			loading: false,
			loaded: false,
			deletingAll: false,
		};
	},
	methods: {
		async deleteAll() {
			if (!this.deletingAll) {
				this.deletingAll = true;
				return;
			}

			const response = await DeleteUserLogsRequest(this.user_id);

			if (response) {
				window.toast('All logs deleted', 'message');
				this.logs = [];
				this.cursor = null;
			} else {
				window.toast('Failed to delete logs', 'error');
			}

			this.deletingAll = false;
		},
		async get_logs() {
			this.loading = true;
			this.logs = [];
			this.cursor = null;

			const result = await GetUserLogsRequest(this.user_id);

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

			const result = await GetUserLogsRequest(this.user_id, this.cursor);

			if (!result) {
				window.toast('Failed to load logs', 'error');
				this.loading = false;
				this.cursor = null; // dont spam the api
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
	watch: {
		user_id(new_value, old_value) {
			if (new_value !== old_value) this.get_logs();
		},
	},
};
</script>

<template>
	<div class="user-logs" v-if="loaded">
		<div class="toolbar" v-if="logs.length > 0">
			<button class="delete-all" @click="deleteAll">
				{{ deletingAll ? 'Confirm delete all?' : 'Delete All' }}
			</button>
		</div>
		<div class="logs">
			<CardLogLogging v-for="log in logs" :key="log.key" :log="log" />
		</div>
		<div v-if="loading" class="loading">Loading more...</div>
	</div>
</template>

<style scoped>
.user-logs {
	font-family: var(--font-mono, monospace);
}
.toolbar {
	display: flex;
	justify-content: flex-end;
	padding: 0.75rem 0 0 0;
}
.delete-all {
	color: #fff;
	background: var(--red);
	border: none;
	padding: 6px 14px;
	border-radius: 15px;
	cursor: pointer;
	font-size: 13px;
}
.logs {
	padding: 0.75rem 0;
}
.loading {
	margin: 20px 0;
}
</style>
