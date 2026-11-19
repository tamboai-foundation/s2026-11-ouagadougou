// Chargement du core Kotlin/Wasm (TModeler) : initialisation seulement + modèle d'exemple Note.
// Le core est construit par `npm run core:build` puis copié par `npm run sync:core` dans src/core.
// Sans lui, l'interface fonctionne quand même avec les mocks.
import { DB_NAME } from './config'

type NGomaCore = {
  ngomaInit(dbName: string): boolean
  ngomaCreateNote(title: string, content: string): number
  ngomaNoteCount(): number
}

let core: NGomaCore | null = null

export async function startTModeler(): Promise<boolean> {
  try {
    // Présent seulement après npm run sync:core : sans lui, aucune erreur, l'interface reste sur les mocks
    const load = Object.values(import.meta.glob<{ default?: unknown }>('../core/ngoma-core-web-wasm-js.mjs'))[0]
    if (!load) return false
    const mod = await load()
    const c = (mod.default ?? mod) as NGomaCore
    if (!c.ngomaInit(DB_NAME)) return false
    core = c
    return true
  } catch {
    return false
  }
}

export function noteCount(): number | null {
  return core ? core.ngomaNoteCount() : null
}

export function createNote(title: string, content: string): boolean {
  if (!core) return false
  core.ngomaCreateNote(title, content)
  return true
}
