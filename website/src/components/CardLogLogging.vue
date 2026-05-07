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
			showViewer: false,
			viewContent: null,
			viewLoading: false,
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
		async view_log() {
			this.viewLoading = true;
			this.showViewer = true;
			const log = await GetLogRequest(this.log.key);
			this.viewContent = log || 'Failed to load log';
			this.viewLoading = false;
		},
		closeViewer() {
			this.showViewer = false;
			this.viewContent = null;
		},
		closeOnEscape(event) {
			if (event.key === 'Escape') {
				this.closeViewer();
			}
		},
		formatDate(ts) {
			const d = new Date(ts);
			return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
		},
		formatSize(bytes) {
			return (bytes / 1024).toFixed(1) + 'kb';
		},
	},
	mounted() {
		document.addEventListener('keydown', this.closeOnEscape);
	},
	unmounted() {
		document.removeEventListener('keydown', this.closeOnEscape);
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
			<button class="view" @click="view_log">View</button>
			<button class="download" @click="download_log">Download</button>
			<button class="delete" @click="delete_log">
				{{ deleting ? 'Confirm?' : 'Delete' }}
			</button>
		</div>
	</div>

	<Teleport v-if="showViewer" to="body">
		<div class="log-viewer-overlay" @click.self="closeViewer">
			<div class="log-viewer-popup">
				<div class="log-viewer-header">
					<span>{{ log.key }}</span>
					<button class="close-btn" @click="closeViewer">&times;</button>
				</div>
				<pre class="log-viewer-content" v-if="!viewLoading">{{ viewContent }}</pre>
				<div v-else class="log-viewer-loading">Loading...</div>
			</div>
		</div>
	</Teleport>
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
.view {
	background: var(--green);
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

.log-viewer-overlay {
	position: fixed;
	top: 0;
	left: 0;
	background-color: #0008;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}
.log-viewer-popup {
	background: var(--background);
	border-radius: 12px;
	width: min(90vw, 900px);
	height: min(80vh, 600px);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.log-viewer-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 16px;
	background: rgba(255, 255, 255, 0.05);
	font-size: 12px;
	color: rgba(255, 255, 255, 0.5);
	font-family: monospace;
	gap: 12px;
}
.log-viewer-header span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.close-btn {
	background: none;
	border: none;
	color: #fff;
	font-size: 22px;
	cursor: pointer;
	padding: 0 4px;
	line-height: 1;
	flex-shrink: 0;
}
.log-viewer-content {
	margin: 0;
	padding: 16px;
	overflow: auto;
	flex: 1;
	font-family: monospace;
	font-size: 12px;
	color: #fff;
	line-height: 1.5;
	white-space: pre-wrap;
	word-break: break-all;
}
.log-viewer-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	color: rgba(255, 255, 255, 0.5);
}
</style>
