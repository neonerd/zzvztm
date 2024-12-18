import * as esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy'

async function serve () {
	let ctx = await esbuild.context({
		entryPoints: ['src/app.ts'],
		bundle: true,
		outdir: 'dist',
		plugins: [
			copy({
				resolveFrom: 'cwd',
				assets: {
					from: ['src/static/*'],
					to: ['dist'],
				},
				watch: true,
			})
		],
	})

	await ctx.serve({
		port: 8080,
		servedir: 'dist'
	})
}

(async() => {
	await serve()
})()
