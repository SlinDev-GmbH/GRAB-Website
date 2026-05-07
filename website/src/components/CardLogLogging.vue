<script>
import { GetLogRequest } from '../requests/logging/GetLogRequest';
import { DeleteLogRequest } from '../requests/logging/DeleteLogRequest';

export default {
	props: {
		log: Object,
	},
	data() {
		return {
			deleting: false,
			copied: false,
		};
	},
	methods: {
		copyId() {
			navigator.clipboard.writeText(this.log.user_id);
			this.copied = true;
			setTimeout(() => {
				this.copied = false;
			}, 2000);
		},
		async download_log() {
			const log = await GetLogRequest(this.log.key);
			if (!log) {
				window.toast('Failed to load log', 'error');
				return;
			}

			const blob = new Blob([log]);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = this.log.key;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		},
		async delete_log() {
			if (!this.deleting) {
				this.deleting = true;
				return;
			}

			const response = await DeleteLogRequest(this.log.key);
			console.log(response);
		},
		closeViewer() {
			this.showViewer = false;
			this.viewContent = null;
		},
		formatDate(ts) {
			const d = new Date(ts);
			return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
		},
		formatSize(bytes) {
			return (bytes / 1024).toFixed(1) + 'kb';
		},
	},
};
</script>

<template>
	<div class="log-card">
		<div class="log-main">
			<span class="username">{{ log.user_name }}</span>
			<button class="copy" @click="copyId" :title="log.user_id">
				<img v-show="!copied" src="./../assets/icons/copy.svg" />
				<img v-show="copied" src="./../assets/icons/copied.svg" />
			</button>
			<span class="context">{{ log.context }}</span>
		</div>
		<div class="log-meta">
			<span class="badge">v{{ log.client_version }}</span>
			<span class="badge">{{ log.platform }}</span>
			<span class="badge">{{ formatSize(log.size) }}</span>
		</div>
		<span class="ts">{{ formatDate(log.ts) }}</span>
		<div class="log-buttons">
			<button class="download" @click="download_log(log.key)">Download</button>
			<button class="delete" @click="delete_log(log.key)">
				{{ deleting ? 'Confirm?' : 'Delete' }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.log-card {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: start;
	gap: 4px 16px;
	padding: 10px 14px;
	border-radius: 10px;
	margin-bottom: 6px;
	background: #fff;
}
.log-main {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
}
.log-buttons {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	white-space: nowrap;
}
.log-buttons button {
	color: #fff;
	border: none;
	padding: 2px 10px;
	border-radius: 15px;
	cursor: pointer;
}
.download {
	background: var(--blue);
}
.delete {
	background: var(--red);
}
.copy {
	cursor: pointer;
	background-color: transparent;
	transition: transform 0.2s ease-in-out;
	display: grid;
	place-content: center;
	padding: 3px;
	border-radius: 5px;
	border: none;
}
.copy:hover {
	background-color: rgba(255, 255, 255, 0.1);
}
.copy img {
	height: 0.85rem;
	width: 0.85rem;
}
.log-meta {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	white-space: nowrap;
}
.log-card {
	background: var(--hover);
	transition: background 0.12s;
}
.username {
	color: #fff;
}
.context {
	color: rgba(255, 255, 255, 0.5);
}
.badge {
	font-size: 11px;
	padding: 2px 7px;
	border-radius: 99px;
	color: #fff;
	background: var(--hover);
}
.ts {
	color: rgba(255, 255, 255, 0.3);
}
</style>
