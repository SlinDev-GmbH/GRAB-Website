<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { SetIsAttestationExemptRequest } from '../requests/roles/SetIsAttestationExemptRequest.js';

export default {
	emits: ['change'],
	props: {
		userID: String,
		isAttestationExempt: Boolean,
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isSuperModerator']),
	},

	methods: {
		async toggleAttestationExempt() {
			if (!(await SetIsAttestationExemptRequest(this.userID, !this.isAttestationExempt))) return;
			this.$emit('change');
		},
	},
};
</script>

<template>
	<button
		v-if="isSuperModerator"
		:class="isAttestationExempt ? 'disable-attestation-exempt-button' : 'enable-attestation-exempt-button'"
		@click="toggleAttestationExempt"
	>
		{{ isAttestationExempt ? 'Disable' : 'Enable' }} Attestation Bypass
	</button>
</template>

<style scoped>
.enable-attestation-exempt-button,
.disable-attestation-exempt-button {
	padding: 5px 10px;
	font-weight: bold;
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}

.enable-attestation-exempt-button {
	background-color: var(--green);
}

.disable-attestation-exempt-button {
	background-color: var(--red);
}
</style>
