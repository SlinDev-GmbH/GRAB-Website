<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { setSuperModerator } from '../requests/SetSuperModerator.js';

export default {
	emits: ['change'],
	props: {
		userID: String,
		isSuperModerator: Boolean,
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isAdmin']),
	},

	methods: {
		async toggleSuperModerator() {
			if (!(await setSuperModerator(this.$api_server_url, this.accessToken, this.userID, !this.isSuperModerator))) return;
			this.$emit('change');
		},
	},
};
</script>

<template>
	<button
		v-if="isAdmin"
		:class="isSuperModerator ? 'remove-super-moderator-button' : 'make-super-moderator-button'"
		@click="toggleSuperModerator"
	>
		{{ isSuperModerator ? 'Remove' : 'Make' }} Super Moderator
	</button>
</template>

<style scoped>
.make-super-moderator-button,
.remove-super-moderator-button {
	padding: 5px 10px;
	font-weight: bold;
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}

.make-super-moderator-button {
	background-color: var(--green);
}

.remove-super-moderator-button {
	background-color: var(--red);
}
</style>
