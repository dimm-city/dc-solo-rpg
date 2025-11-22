import adapter from 'svelte-adapter-azure-swa';
import { readFileSync } from 'fs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Configure esbuild to handle native modules
			esbuild: (defaultOptions) => ({
				...defaultOptions,
				// Mark onnxruntime-node as external
				external: [...(defaultOptions.external || []), 'onnxruntime-node'],
				// Add a loader for .node files
				loader: {
					...(defaultOptions.loader || {}),
					'.node': 'empty'
				},
				// Add plugins to handle onnxruntime-node module resolution
				plugins: [
					...(defaultOptions.plugins || []),
					{
						name: 'onnx-runtime-external',
						setup(build) {
							// Intercept onnxruntime-node imports and mark as external
							build.onResolve({ filter: /^onnxruntime-node$/ }, (args) => {
								return {
									path: 'onnxruntime-node',
									external: true
								};
							});

							// Intercept all onnxruntime-node internal files and mark as external
							build.onResolve({ filter: /onnxruntime-node/ }, (args) => {
								return {
									path: args.path,
									external: true,
									namespace: 'onnx-stub'
								};
							});

							// Return empty content for .node files to avoid load errors
							build.onLoad({ filter: /\.node$/ }, () => {
								return {
									contents: '',
									loader: 'empty'
								};
							});
						}
					}
				]
			})
		}),
		version: {
			name: process.env.npm_package_version || 'development'
		}
	}
};

export default config;
