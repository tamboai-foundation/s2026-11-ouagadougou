# NGoma — Web (React + TModeler)

Projet de départ Foundation. Package Kotlin : `ai.tambo.foundation.ngoma`. Charte rouge (`#E0262D`, voir `tailwind.config.js`).

## Lancer l'interface (mocks)
```
npm install
npm run dev
```
Build de vérification : `npm run build`.

## Écrans (de quoi réaliser le Module 1 SI)
Barre d'onglets : **Messages**, **Vidéos**, **Personnes**, **Profil**.
1. **Gestion des utilisateurs** : inscription / connexion, **Personnes** (liste, recherche, profil d'une personne, écrire un message), **Profil** (modifier son nom et sa description, voir ses vidéos, se déconnecter, supprimer son compte).
2. **Conversations et messages** : liste des conversations (recherche, filtres, épingler, sourdine, archiver), conversation (envoi, réponse, modification, suppression, réactions, pièce jointe).
3. **Publications vidéo et interactions**, façon TikTok : **Vidéos** (fil à défilement vertical, lecture de la vidéo visible), publier (photo ou vidéo, facultatives, + légende ; une légende seule est acceptée), modifier la légende, supprimer, j'aime, commentaires et réponses (aimer, modifier, supprimer les siens), publications des autres, onglet « Mes vidéos ».

## Mocks (niveau ui-bridge-TModeler)
- Interfaces : `src/lib/types.ts` (`AccountBridge`, `MessagingBridge`, `VideoBridge`).
- Mocks : `src/lib/mock.ts` (tout identifiant est accepté).
- Point de bascule : `src/lib/bridge.ts`. Remplacer les mocks par des implémentations qui appellent le core Kotlin/Wasm.
- Les écrans ne changent pas : votre travail est de **concevoir vos modèles TModeler** (utilisateur, conversation, message, publication, commentaire, j'aime) puis d'écrire les trois implémentations des interfaces (`AccountBridge`, `MessagingBridge`, `VideoBridge`) à partir de ces modèles. Les photos et vidéos choisies dans l'interface sont des fichiers : à enregistrer comme médias TModeler.

## TModeler (core Kotlin/Wasm)
- `core/` : `co.tamboai:TModeler:1.0.1` (Maven Central), `core/src/commonMain/.../NGomaCore.kt` (init) et `models/Note.kt` (modèle d'exemple).
- Construire (un seul build Gradle à la fois, c'est lourd) :
```
npm run core:build
npm run sync:core
```
  Le core est copié dans `src/core` (jamais dans `public/` : Vite refuse d'y importer du code) et chargé par `src/lib/tm.ts` ; sans lui l'interface marche avec les mocks.
- Règles TModeler web : `TextField` / `BoolField` avec `.default(...)` ; nom de base = nom + version (`DB_VERSION` dans `NGomaCore.kt`, l'incrémenter repart d'une base vide).
