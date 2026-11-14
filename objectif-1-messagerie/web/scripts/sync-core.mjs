import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'

// Copie la lib Kotlin/Wasm construite (npm run core:build) vers public/core, servie telle quelle au navigateur.
const src = 'core/build/dist/wasmJs/productionLibrary'
if (!existsSync(src)) {
  console.error(`Introuvable : ${src} (lancer d'abord : npm run core:build)`)
  process.exit(1)
}
mkdirSync('public/core', { recursive: true })
cpSync(src, 'public/core', { recursive: true })
console.log('core copié :', readdirSync('public/core').join(', '))
