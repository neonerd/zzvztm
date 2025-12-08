import * as esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import vuePlugin from 'esbuild-plugin-vue3'

const isServe = process.argv.includes('--serve')

const buildOptions = {
	entryPoints: ['src/game.ts', 'src/editor.ts'],
	bundle: true,
	outdir: 'dist',
	alias: {
		'vue': 'vue/dist/vue.esm-bundler.js'
	},
	plugins: [
		vuePlugin(),
		copy({
			resolveFrom: 'cwd',
			assets: {
				from: ['src/static/*'],
				to: ['dist'],
			},
			watch: isServe,
		})
	],
}

async function build() {
	await esbuild.build(buildOptions)
	console.log('Build complete!')
}

async function serve() {
	let ctx = await esbuild.context(buildOptions)
	await ctx.serve({
		port: 8080,
		servedir: 'dist'
	})
	console.log('Server running at http://localhost:8080')
}

(async () => {
	if (isServe) {
		await serve()
	} else {
		await build()
	}
})()
