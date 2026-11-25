import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Le chargeur Kotlin/Wasm cherche './ngoma-core-web-wasm-js.wasm' par rapport à la page : on le rend relatif au module,
// pour que Vite émette le .wasm (dev et build) et qu'il soit trouvé sur toutes les routes (guide React TModeler, §10.2).
const kotlinWasmUrl = (): Plugin => ({
  name: 'kotlin-wasm-url',
  enforce: 'pre',
  transform(code, id) {
    if (!/ngoma-core-web-wasm-js\.uninstantiated\.mjs/.test(id)) return null
    return code.replace(
      "const wasmFilePath = './ngoma-core-web-wasm-js.wasm';",
      "const wasmFilePath = new URL('./ngoma-core-web-wasm-js.wasm', import.meta.url).href;",
    )
  },
})

export default defineConfig({
  plugins: [kotlinWasmUrl(), react()],
  // Le module Kotlin/Wasm utilise le top-level await : cible esnext
  optimizeDeps: { esbuildOptions: { target: 'esnext' } },
  build: { target: 'esnext' },
})
