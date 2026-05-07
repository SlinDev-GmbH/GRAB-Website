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
		};
	},
	methods: {
		async get_logs() {
			this.loading = true;
			this.logs = [];
			this.cursor = null;

			const result = await SearchLogsRequest();

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

			const result = await SearchLogsRequest(this.cursor);

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
	<div class="logs" v-if="loaded">
		<CardLogLogging v-for="log in logs" :key="log.key" :log="log" />
		<div v-if="loading" class="loading">Loading more...</div>
	</div>
</template>

<style scoped>
.loading {
	margin: 20px 0;
}
</style>
