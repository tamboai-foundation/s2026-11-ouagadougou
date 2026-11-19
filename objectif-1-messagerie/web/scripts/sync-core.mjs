import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'

// Copie la lib Kotlin/Wasm construite (npm run core:build) dans src/core : Vite la traite comme le reste du code
// (le .wasm est emis par Vite, voir vite.config.ts). Ne jamais la mettre dans public/ : Vite refuse d'importer depuis public/.
const src = 'core/build/dist/wasmJs/productionLibrary'
if (!existsSync(src)) {
  console.error(`Introuvable : ${src} (lancer d'abord : npm run core:build)`)
  process.exit(1)
}
rmSync('public/core', { recursive: true, force: true }) // ancien emplacement
mkdirSync('src/core', { recursive: true })
cpSync(src, 'src/core', { recursive: true })
console.log('core copié dans src/core :', readdirSync('src/core').join(', '))
