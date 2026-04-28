<script>
import { SearchLogsRequest } from '../requests/logging/SearchLogsRequest';

import CardLogLogging from './CardLogLogging.vue';

export default {
	components: {
		CardLogLogging,
	},
	data() {
		return {
			loaded: false,
			logs: [],
		};
	},
	methods: {
		async get_logs() {
			this.loaded = false;
			this.logs = [];

			const logs = await SearchLogsRequest();

			if (!logs) {
				window.toast('Failed to load logs', 'error');
				return;
			}

			this.logs = logs;
			this.loaded = true;
		},
	},
	created() {
		this.get_logs();
	},
};
</script>

<template>
	<div class="logs" v-if="loaded">
		<CardLogLogging v-for="log in logs.rows" :key="log.key" :log="log" />
	</div>
</template>

<style scoped></style>
