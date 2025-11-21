import adapter from 'svelte-adapter-azure-swa';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Configure esbuild to handle native modules
			esbuild: (defaultOptions) => ({
				...defaultOptions,
				// Mark onnxruntime-node as external so it's not bundled
				external: [
					...(defaultOptions.external || []),
					'onnxruntime-node'
				],
				// Add a plugin to handle .node files
				plugins: [
					...(defaultOptions.plugins || []),
					{
						name: 'node-loader',
						setup(build) {
							// Mark .node files as external
							build.onResolve({ filter: /\.node$/ }, (args) => ({
								path: args.path,
								external: true
							}));
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
