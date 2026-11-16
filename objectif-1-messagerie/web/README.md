# NGoma — Web (React + TModeler)

Projet de départ Foundation. Package Kotlin : `ai.tambo.foundation.ngoma`. Charte rouge (`#E0262D`, voir `tailwind.config.js`).

## Lancer l'interface (mocks)
```
npm install
npm run dev
```
Build de vérification : `npm run build`.

## Écrans
Splash de chargement, connexion / inscription, liste des conversations (recherche, filtres, épingler, sourdine, archiver), conversation (envoi, réponse, modification, suppression, réactions, pièce jointe).

## Mocks (niveau ui-bridge-TModeler)
- Interfaces : `src/lib/types.ts` (`AccountBridge`, `MessagingBridge`).
- Mocks : `src/lib/mock.ts` (tout identifiant est accepté).
- Point de bascule : `src/lib/bridge.ts`. Remplacer les mocks par des implémentations qui appellent le core Kotlin/Wasm.

## TModeler (core Kotlin/Wasm)
- `core/` : `co.tamboai:TModeler:1.0.1` (Maven Central), `core/src/commonMain/.../NGomaCore.kt` (init) et `models/Note.kt` (modèle d'exemple).
- Construire (un seul build Gradle à la fois, c'est lourd) :
```
npm run core:build
npm run sync:core
```
  Le core est copié dans `public/core` et chargé par `src/lib/tm.ts` ; sans lui l'interface marche avec les mocks.
- Règles TModeler web : `TextField` / `BoolField` avec `.default(...)` ; nom de base = nom + version (`DB_VERSION` dans `NGomaCore.kt`, l'incrémenter repart d'une base vide).
