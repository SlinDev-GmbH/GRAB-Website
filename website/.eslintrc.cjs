/* eslint-env node */

module.exports = {
	root: true,
	extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier/skip-formatting'],
	parserOptions: {
		ecmaVersion: 2020,
	},
	env: {
		node: true,
		es2020: true,
		browser: true,
	},
	rules: {
		'no-unused-vars': 'off',
		'vue/multi-word-component-names': 'off',
	},
};
