<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { setLevelTagsRequest } from '../requests/SetLevelTagsRequest.js';
import { removeLevelFromVerificationQueueRequest } from '../requests/RemoveLevelFromVerificationQueueRequest.js';

export default {
	props: {
		levelInfo: Object,
	},

	emits: ['skipped'],

	data() {
		return {
			isVerified: false,
			isLoading: false,
		};
	},

	created() {
		this.isVerified = this.levelInfo?.tags?.includes('ok') ?? false;
	},

	computed: {
		...mapState(useUserStore, ['accessToken']),
	},

	methods: {
		async toggleVerifyLevel() {
			if (this.isLoading) return;
			this.isLoading = true;
			let newModTags = [];
			if (!this.isVerified) newModTags.push('ok');

			const oldState = this.isVerified;
			this.isVerified = !this.isVerified;
			if (!(await setLevelTagsRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier, newModTags, undefined))) {
				//Reset to previous state if an error was encountered
				this.isVerified = oldState;
				return;
			}
			this.isLoading = false;

			if (await removeLevelFromVerificationQueueRequest(this.$api_server_url, this.accessToken, this.levelInfo.identifier)) {
				this.$emit('skipped');
			}
		},
	},
};
</script>

<template>
	<div>
		<button v-if="isVerified" class="moderation-unverify-button" @click="toggleVerifyLevel">Unverify</button>
		<button v-else class="moderation-verify-button" @click="toggleVerifyLevel">Verify</button>
	</div>
</template>

<style scoped>
.moderation-verify-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--green);
	border-radius: 15px;
	cursor: pointer;
}
.moderation-unverify-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--red);
	border-radius: 15px;
	cursor: pointer;
}
@media screen and (max-width: 600px) {
	.moderation-verify-button,
	.moderation-unverify-button {
		height: 25px;
		width: 70px;
		font-size: 0.7rem;
	}
}
</style>
