import { build } from 'vite'
import { gzipSync } from 'node:zlib'
import { mkdir, writeFile } from 'node:fs/promises'

function owner(id) {
  const normalized = id.replaceAll('\\', '/')
  const marker = '/node_modules/'
  const index = normalized.lastIndexOf(marker)
  if (index === -1) return normalized.includes('/src/') ? 'application' : 'build helpers'
  const parts = normalized.slice(index + marker.length).split('/')
  return parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

await build({
  build: { write: false },
  plugins: [{
    name: 'bundle-profile',
    async generateBundle(_options, bundle) {
      const chunks = []
      for (const item of Object.values(bundle)) {
        if (item.type !== 'chunk') continue
        const totals = new Map()
        const modules = Object.entries(item.modules).map(([id, module]) => {
          const packageName = owner(id)
          totals.set(packageName, (totals.get(packageName) ?? 0) + module.renderedLength)
          return { id, packageName, renderedBytes: module.renderedLength }
        })
        chunks.push({
          file: item.fileName, entry: item.isEntry,
          bytes: Buffer.byteLength(item.code), gzipBytes: gzipSync(item.code).byteLength,
          imports: item.imports, dynamicImports: item.dynamicImports,
          packages: [...totals].map(([name, renderedBytes]) => ({ name, renderedBytes })).sort((a, b) => b.renderedBytes - a.renderedBytes),
          modules: modules.sort((a, b) => b.renderedBytes - a.renderedBytes),
        })
      }
      const report = {
        note: 'Package/module renderedBytes are Rollup pre-minification contributions, not additive final compressed sizes. Chunk sizes are emitted minified bytes.',
        chunks,
      }
      await mkdir('reports', { recursive: true })
      await writeFile('reports/bundle-profile.json', JSON.stringify(report, null, 2) + '\n')
      for (const chunk of chunks) {
        console.log(`\n${chunk.file}: ${chunk.bytes} bytes; gzip ${chunk.gzipBytes} bytes`)
        console.table(chunk.packages.slice(0, 12))
        console.table(chunk.modules.slice(0, 8).map(module => ({ ...module, id: module.id.replace(process.cwd().replaceAll('\\', '/'), '.') })))
      }
    },
  }],
})
