<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { setVerifier } from '../requests/SetVerifier.js';

export default {
	emits: ['change'],
	props: {
		userID: String,
		isVerifier: Boolean,
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isSuperModerator']),
	},

	methods: {
		async toggleVerifier() {
			if (!(await setVerifier(this.$api_server_url, this.accessToken, this.userID, !this.isVerifier))) return;
			this.$emit('change');
		},
	},
};
</script>

<template>
	<button v-if="isSuperModerator" :class="isVerifier ? 'remove-verifier-button' : 'make-verifier-button'" @click="toggleVerifier">
		{{ isVerifier ? 'Remove' : 'Make' }} Verifier
	</button>
</template>

<style scoped>
.make-verifier-button,
.remove-verifier-button {
	padding: 5px 10px;
	font-weight: bold;
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}

.make-verifier-button {
	background-color: var(--green);
}

.remove-verifier-button {
	background-color: var(--red);
}
</style>
