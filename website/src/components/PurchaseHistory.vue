<script>
export default {
	props: {
		userInfo: Object,
	},

	methods: {
		timeString(item) {
			const date = new Date(item.date);
			const now = new Date();
			const timeDiff = now.getTime() - date.getTime();

			// time since log
			const yearsSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
			const monthsSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * (365 / 12)));
			const weeksSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
			const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
			const hoursSince = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutesSince = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

			// time of log
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const year = String(date.getFullYear()).slice(-2);

			const timeString = `${day}/${month}/${year}`;
			let timeSinceString = 'Just now';

			if (yearsSince > 0) {
				timeSinceString = `${yearsSince} ${yearsSince != 1 ? 'years' : 'year'} ago`;
			} else if (monthsSince > 0) {
				timeSinceString = `${monthsSince} ${monthsSince != 1 ? 'months' : 'month'} ago`;
			} else if (weeksSince > 0) {
				timeSinceString = `${weeksSince} ${weeksSince != 1 ? 'weeks' : 'week'} ago`;
			} else if (daysSince > 0) {
				timeSinceString = `${daysSince} ${daysSince != 1 ? 'days' : 'day'} ago`;
			} else if (hoursSince > 0) {
				timeSinceString = `${hoursSince} ${hoursSince != 1 ? 'hours' : 'hour'} ago`;
			} else if (minutesSince > 0) {
				timeSinceString = `${minutesSince} ${minutesSince != 1 ? 'minutes' : 'minute'} ago`;
			}

			return `${timeString} (${timeSinceString})`;
		},

		history() {
			const history = [];

			const history_length = this.userInfo?.purchase_history_length || 0;
			for (let i = history_length - 1; i >= 0; i--) {
				history.push(this.userInfo[`purchase_history_${i}`]);
			}

			return history;
		},
		summary() {
			const summary = {};
			for (let item of this.history()) {
				let platform = item.platform_receipt_id.split(':')[1].split('_')[0];
				if (item.platform_receipt_id.split(':')[0] == 'steam_app') platform = 'steam';
				const currency = item.price_currency || 'USD';
				const price = item.price || 0;
				if (!(platform in summary)) summary[platform] = {};
				if (!(currency in summary[platform])) summary[platform][currency] = 0;
				summary[platform][currency] = (summary[platform][currency] * 100 + price * 100) / 100;
			}
			return summary;
		},
	},
};
</script>

<template>
	<h3>Purchases</h3>
	<h4>Summary</h4>
	<div class="summary">
		<div>
			<span>currency</span>
			<div class="currency">
				<span>{{ userInfo?.owned_currency || 0 }} currency</span>
				<span>{{ userInfo?.total_tips || 0 }} tips</span>
				<span>{{ userInfo?.current_tips || 0 }} unclaimed tips</span>
			</div>
		</div>
		<div v-for="[platform, platform_data] in Object.entries(this.summary())" :key="platform">
			<span>{{ platform }}</span>
			<div class="currency">
				<span v-for="[currency, value] in Object.entries(platform_data)" :key="currency">
					{{ value + ' ' + currency }}
				</span>
			</div>
		</div>
	</div>
	<h4>All</h4>
	<div class="history">
		<div v-for="(item, index) in this.history()" :key="index" class="history-item">
			<div>
				<h4>
					{{ item.title }} <span class="item-id">{{ item.platform_receipt_id }}</span>
				</h4>
				<span>{{ this.timeString(item) }}</span>
			</div>
			<h3>{{ item.price }} {{ item.price_currency }}</h3>
		</div>
	</div>
</template>

<style scoped>
.history,
.summary {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding-bottom: 15px;
}
.history-item,
.summary > div {
	padding: 10px;
	background-color: var(--button);
	border-radius: 15px;
	display: flex;
	align-items: center;
	gap: 10px;
	justify-content: space-between;
	padding-inline: 15px;
}
.history-item h4 {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10px;
}
.item-id {
	color: #888;
	font-size: 12px;
	font-style: italic;
}
.currency {
	display: flex;
	justify-content: space-between;
	gap: 0.8rem;
	width: 500px;
}
@media screen and (max-width: 690px) {
	.currency {
		width: 300px;
	}
}
</style>
