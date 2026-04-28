<script>
import { GetUserLogsRequest } from '../requests/logging/GetUserLogsRequest';

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
			loaded: false,
			logs: [],
		};
	},
	methods: {
		async get_logs() {
			this.loaded = false;
			this.logs = [];

			const logs = await GetUserLogsRequest(this.user_id);

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
	watch: {
		user_id(new_value, old_value) {
			if (new_value !== old_value) this.get_logs();
		},
	},
};
</script>

<template>
	<div class="logs" v-if="loaded">
		<CardLogLogging v-for="log in logs.rows" :key="log.key" :log="log" />
	</div>
</template>

<style scoped>
.logs {
	font-family: var(--font-mono, monospace);
	padding: 0.75rem 0;
}
</style>
