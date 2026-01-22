import { fileURLToPath, URL } from 'node:url';

import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import postcssNesting from 'postcss-nesting';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), mkcert()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	assetsInclude: ['**/*.gltf', '**/*.glb'],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				'levels/viewer': resolve(__dirname, 'levels/viewer/index.html'),
			},
			output: {
				manualChunks(path) {
					if (!path.includes('node_modules')) return;
					const name = path.toString().split('node_modules/')[1].split('/')[0].toString();

					if (name.includes('three')) return 'three';
				},
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
			},
		},
		outDir: resolve(__dirname, '../public'),
		emptyOutDir: true,
		target: 'es2020',
	},
	server: {
		https: true,
	},
	css: {
		postcss: {
			plugins: [postcssNesting],
		},
	},
});
