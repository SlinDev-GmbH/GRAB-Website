<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import { setDeveloper } from '../requests/SetDeveloper.js';

export default {
	emits: ['change'],
	props: {
		userID: String,
		isDeveloper: Boolean,
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isAdmin']),
	},

	methods: {
		async toggleDeveloper() {
			if (!(await setDeveloper(this.$api_server_url, this.accessToken, this.userID, !this.isDeveloper))) return;
			this.$emit('change');
		},
	},
};
</script>

<template>
	<button v-if="isAdmin" :class="isDeveloper ? 'remove-developer-button' : 'make-developer-button'" @click="toggleDeveloper">
		{{ isDeveloper ? 'Remove' : 'Make' }} Developer
	</button>
</template>

<style scoped>
.make-developer-button,
.remove-developer-button {
	padding: 5px 10px;
	font-weight: bold;
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}

.make-developer-button {
	background-color: var(--green);
}

.remove-developer-button {
	background-color: var(--red);
}
</style>
