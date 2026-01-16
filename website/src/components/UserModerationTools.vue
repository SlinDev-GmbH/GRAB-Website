<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import ModerationInfo from './ModerationInfo.vue';
import ModerationPopup from './ModerationPopup.vue';
import SetCreatorButton from './SetCreatorButton.vue';
import SetVerifierButton from './SetVerifierButton.vue';
import SetModeratorButton from './SetModeratorButton.vue';
import SetSuperModeratorButton from './SetSuperModeratorButton.vue';
import SetDeveloperButton from './SetDeveloperButton.vue';
import GiftCosmeticButton from './GiftCosmeticButton.vue';
import SetComplexityOverrideButton from './SetComplexityOverrideButton.vue';

import { removeModerationActionRequest } from '../requests/RemoveModerationActionRequest';

export default {
	components: {
		ModerationInfo,
		ModerationPopup,
		SetCreatorButton,
		SetVerifierButton,
		SetModeratorButton,
		SetSuperModeratorButton,
		SetDeveloperButton,
		GiftCosmeticButton,
		SetComplexityOverrideButton,
	},

	emits: ['handled', 'toggle_role'],

	props: {
		userInfo: Object,
		userPage: Boolean,
	},

	data() {
		return {
			showModerationPopup: false,
			popupConfig: 'user_ban',
			showManagePopup: false,
		};
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isAdmin', 'isSuperModerator']),
	},

	methods: {
		handledModerationPopup(handled) {
			if (handled === true) {
				this.$emit('handled', true);
			}
		},

		async removeModerationAction() {
			const userID = this.userInfo.user_id;
			if (!(await removeModerationActionRequest(this.$api_server_url, this.accessToken, userID))) return;
			this.$emit('handled', false);
		},
	},
};
</script>

<template>
	<div class="moderation-tools">
		<ModerationInfo v-if="userInfo.moderation_info && !userPage" :info="userInfo.moderation_info" />

		<div class="punish-buttons" :style="userPage ? '' : 'padding-top: 0.5em;'">
			<button
				class="moderation-hide-button"
				@click="
					popupConfig = 'user_ban';
					showModerationPopup = true;
				"
			>
				Punish
			</button>
			<button class="moderation-approve-button" @click="removeModerationAction">Pardon</button>
			<button
				v-if="userPage"
				class="moderation-message-button"
				@click="
					popupConfig = 'user_message';
					showModerationPopup = true;
				"
			>
				Message
			</button>
			<button v-if="isSuperModerator" class="moderation-manage-button" @click="showManagePopup = true">Manage</button>
		</div>
	</div>

	<Teleport to="body">
		<ModerationPopup
			:show="showModerationPopup"
			@close="showModerationPopup = false"
			@handled="handledModerationPopup"
			:config="popupConfig"
			:identifier="userInfo.user_id"
		/>
		<div v-if="showManagePopup" class="manage-popup">
			<div class="manage-popup-content">
				<h1>Manage User</h1>
				<h2>Roles</h2>
				<div class="manage-buttons">
					<SetCreatorButton
						:userID="this.userInfo.user_id"
						:isCreator="this.userInfo.is_creator"
						@change="this.$emit('toggle_role', 'is_creator')"
					/>
					<SetVerifierButton
						:userID="this.userInfo.user_id"
						:isVerifier="this.userInfo.is_verifier"
						@change="this.$emit('toggle_role', 'is_verifier')"
					/>
					<SetModeratorButton
						:userID="this.userInfo.user_id"
						:isModerator="this.userInfo.is_moderator"
						@change="this.$emit('toggle_role', 'is_moderator')"
					/>
					<SetSuperModeratorButton
						:v-if="isAdmin"
						:userID="this.userInfo.user_id"
						:isSuperModerator="this.userInfo.is_supermoderator"
						@change="this.$emit('toggle_role', 'is_supermoderator')"
					/>
					<SetDeveloperButton
						:v-if="isAdmin"
						:userID="this.userInfo.user_id"
						:isDeveloper="this.userInfo.is_developer"
						@change="this.$emit('toggle_role', 'is_developer')"
					/>
				</div>
				<h2>Other</h2>
				<div class="manage-buttons">
					<GiftCosmeticButton :userID="this.userInfo.user_id" />
					<SetComplexityOverrideButton v-if="isAdmin" :userID="this.userInfo.user_id" />
				</div>
				<button class="cancel-button" @click="showManagePopup = false">Close</button>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.moderation-tools {
	width: 100%;
	display: flex;
	flex-direction: column;
	max-width: 100%;
	overflow: hidden;
}

.punish-buttons {
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 0.5em;
	margin-top: auto;
}

.moderation-title {
	font-weight: bold;
}

.moderation-hide-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--red);
	border-radius: 15px;
	cursor: pointer;
}

.moderation-approve-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--green);
	border-radius: 15px;
	cursor: pointer;
}

.moderation-message-button,
.moderation-manage-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--blue);
	border-radius: 15px;
	cursor: pointer;
}

.manage-popup {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
}
.manage-popup-content {
	background-color: white;
	padding: 20px;
	border-radius: 10px;
	width: 400px;
	max-width: 90%;
	background-color: var(--background);
	padding: 20px;
	border-radius: 15px;
	border: 2px solid var(--hover);
	box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

	h2 {
		margin-block: 20px 10px;
		font-weight: 500;
	}
}

.manage-buttons {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5em;
	padding-top: 0.5rem;
}

.cancel-button {
	height: 30px;
	width: 90px;
	font-weight: bold;
	background-color: var(--red);
	border-radius: 15px;
	cursor: pointer;
	margin-top: 20px;
}

@media screen and (max-width: 600px) {
	.moderation-hide-button,
	.moderation-approve-button,
	.moderation-message-button,
	.moderation-manage-button {
		height: 25px;
		width: 70px;
		font-size: 0.7rem;
	}
}
</style>
