<template>
	<div class="color-grid">
		<div
			v-for="(color, index) in colors"
			:key="index"
			class="color-box"
			:style="getColorStyle(color, index)"
			@click="selectColor(index)"
		></div>
	</div>
</template>

<script>
export default {
	props: {
		page: {
			type: String,
			required: true,
		},
		pageColorIndices: {
			type: Object,
			required: false,
		},
	},
	data() {
		return {
			colors: [],
			selectedIndex: null,
		};
	},
	created() {
		this.generateColors();
	},
	methods: {
		generateColors() {
			this.colors = Array.from({ length: 100 }, (_, i) => {
				const row = Math.floor(i / 10);
				const column = i % 10;
				const color = this.GetColor(row, column);
				return this.LinearToGamma([color.r, color.g, color.b]);
			});
		},
		getColorStyle(color, index) {
			const style = { backgroundColor: color };
			if (index === this.selectedIndex) {
				style.outline = '3px solid #333';
			}
			return style;
		},
		selectColor(index) {
			this.selectedIndex = index;
			this.$emit('color-selected', { page: this.page, index: this.selectedIndex, color: this.colors[index] });
		},
		GetColor(row, column) {
			if (row == 0) {
				return this.ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0);
			}
			if (row <= 5 && row != 0) {
				return this.ConvertHSVToRGB((2.0 * Math.PI * column) / 10.0, 1.0, row / (10.0 - 4.0));
			} else {
				return this.ConvertHSVToRGB((2.0 * Math.PI * column) / 10.0, 1.0 - (row - 5.0) / (10.0 - 5.0), 1.0);
			}
		},
		ConvertHSVToRGB(h, s, v, alpha = 1) {
			let hi = (h * 3.0) / Math.PI;
			const f = hi - Math.floor(hi);
			if (hi >= 3.0) {
				hi -= 6.0;
			}
			if (hi < -3.0) {
				hi += 6.0;
			}
			let r = Math.max(v, 0.0);
			let g = Math.max(v - s * v, 0.0);
			let b = Math.max(v - s * f * v, 0.0);
			let a = Math.max(v - s * (1.0 - f) * v, 0.0);
			if (hi < -2.0) {
				return { r: r, g: a, b: g, a: alpha };
			} else if (hi < -1.0) {
				return { r: b, g: r, b: g, a: alpha };
			} else if (hi < 0.0) {
				return { r: g, g: r, b: a, a: alpha };
			} else if (hi < 1.0) {
				return { r: g, g: b, b: r, a: alpha };
			} else if (hi < 2.0) {
				return { r: a, g: g, b: r, a: alpha };
			} else {
				return { r: r, g: g, b: b, a: alpha };
			}
		},
		LinearToGamma([r, g, b]) {
			r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
			g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
			b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
			return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
		},
	},
	watch: {
		page() {
			this.selectedIndex = null;
			if (this.pageColorIndices && this.pageColorIndices[this.page] !== undefined) {
				this.selectedIndex = this.pageColorIndices[this.page];
			}
		},
	},
};
</script>

<style scoped>
.color-grid {
	display: grid;
	grid-template-columns: repeat(10, 0.8fr);
	gap: 4px;
	max-width: 400px;
}

.color-box {
	aspect-ratio: 1;
	cursor: pointer;
}

.color-box:hover,
.color-box:active {
	cursor: pointer;
	outline: 3px solid #333;
}
</style>
