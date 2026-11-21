import * as esbuild from 'esbuild'
import fs from 'node:fs'

// Automatically attaches exported Game_* classes to window at the end of each file so JsonEx._decode can use them
const exposeSaveClassesPlugin = {
	name: 'expose-save-classes',
	setup(build)
	{
		build.onLoad({ filter: /src[\\/]objects[\\/].*\.js$/ }, async args =>
		{
			const source = await fs.promises.readFile(args.path, 'utf8')
			const exports = [...source.matchAll(/export\s+class\s+(\w+)/g)].map(m => m[1])
			if (exports.length === 0) return null

			const globals = exports.map(name => `window.${name} = ${name};`).join('\n')
			return {
				contents: `${source}\n${globals}\n`,
				loader: 'js'
			}
		})
	}
}

// Maps packages loaded via <script> tags in index.html to window globals
const globalScriptsPlugin = globalsMap => ({
	name: 'global-scripts',
	setup(build)
	{
		const keys = Object.keys(globalsMap)
		if (keys.length === 0) return

		const filter = new RegExp(
			`^(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`
		)
		build.onResolve({ filter }, args => ({
			path: args.path,
			namespace: 'global-script'
		}))
		build.onLoad({ filter: /.*/, namespace: 'global-script' }, args => ({
			contents: `module.exports = ${globalsMap[args.path]};`,
			loader: 'js'
		}))
	}
})

const config = {
	entryPoints: ['src/main.js'],
	bundle: true,
	outfile: 'dist/rmmz.js',
	format: 'esm',
	platform: 'browser',
	target: 'esnext',
	sourcemap: true,
	keepNames: true, // Preserves constructor.name for JsonEx._encode even if minified
	external: ['fs', 'path', 'nw'], // Node / NW.js built-ins
	plugins: [
		exposeSaveClassesPlugin,
		globalScriptsPlugin({
			'effekseer': 'window.effekseer',
			'vorbisdecoder': 'window.vorbisdecoder'
		})
	]
}

if (process.argv.includes('--watch'))
{
	const ctx = await esbuild.context(config)
	await ctx.watch()
	console.log('Watching for changes...')
} else
{
	await esbuild.build(config)
}
