<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';

import DropDown from './DropDown.vue';

import { giftCosmeticRequest } from '../requests/GiftCosmeticRequest.js';
import { getShopProductsRequest } from '../requests/GetShopProductsRequest.js';

export default {
	components: {
		DropDown,
	},

	props: {
		userID: String,
	},

	data() {
		return {
			cosmeticID: null,
			showModal: false,
		};
	},

	computed: {
		...mapState(useUserStore, ['accessToken', 'isAdmin', 'isSuperModerator']),
	},

	methods: {
		async giftCosmetic() {
			await giftCosmeticRequest(this.$api_server_url, this.accessToken, this.userID, this.cosmeticID);
			this.close();
		},

		async getCosmeticPacks() {
			const shop = await getShopProductsRequest(this.$api_server_url);
			this.cosmeticPacks = Object.keys(shop);
		},

		close() {
			this.showModal = false;
		},
	},

	created() {
		if (this.isAdmin) {
			this.getCosmeticPacks();
		} else if (this.isSuperModerator) {
			this.cosmeticPacks = ['pack_special_mountain_1'];
		}
	},
};
</script>

<template>
	<button v-if="isSuperModerator" class="gift-button" @click="showModal = true">Gift Cosmetic</button>

	<div class="cosmetic-picker" v-if="showModal">
		<DropDown :options="['Pack', ...cosmeticPacks]" :defaultChoice="'Pack'" :flip="true" @changeSelection="cosmeticID = $event" />
		<div class="buttons">
			<button class="cancel-button" @click="close">Cancel</button>
			<button class="gift-button" @click="giftCosmetic">Gift Cosmetic</button>
		</div>
	</div>
</template>

<style scoped>
.gift-button {
	padding: 5px 10px;
	font-weight: bold;
	background-color: var(--green);
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}
.cancel-button {
	padding: 5px 10px;
	font-weight: bold;
	background-color: var(--red);
	font-size: 12px;
	border-radius: 15px;
	cursor: pointer;
}
.buttons {
	display: flex;
	gap: 10px;
}

#cosmetic-options {
	width: 100%;
	height: 100%;
	font-size: 12px;
	font-weight: bold;
	background-color: var(--hover);
	border-radius: 15px;
	padding: 0.5rem;
}

.cosmetic-picker {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: var(--background);
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 100;
	border: 2px solid var(--hover);
	gap: 10px;
	border-radius: 15px;
}
</style>
