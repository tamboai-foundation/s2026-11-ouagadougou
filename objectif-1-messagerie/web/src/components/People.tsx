import { useState } from 'react'
import { accountBridge, videoBridge, ME, type User } from '../lib/bridge'
import { Avatar, useBridge } from './Home'
import { PostMiniature } from './VideoFeed'

/** Gestion des utilisateurs (M1 SI, module 1) : voir les utilisateurs, rechercher, ouvrir un profil, écrire à quelqu'un. */
export default function People({ onWrite }: { onWrite: (name: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const users = useBridge(accountBridge, () => accountBridge.users(query))
  const current = selected != null ? accountBridge.user(selected) : undefined

  return (
    <div className="h-full flex">
      <aside className={`${current ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] shrink-0 bg-white border-r border-hairline flex-col`}>
        <div className="p-4">
          <h2 className="font-extrabold text-xl mb-3">Personnes</h2>
          <input
            className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm outline-none"
            placeholder="Rechercher un utilisateur"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="text-xs text-secondary mt-2">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-hairline">
          {users.length === 0 && <p className="p-4 text-sm text-secondary">Aucun utilisateur ne correspond.</p>}
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-hairline ${u.id === selected ? 'bg-brand-50' : 'hover:bg-page'}`}
            >
              <Avatar name={u.name} />
              <div className="min-w-0">
                <p className="font-semibold truncate">{u.name}{u.id === ME ? ' (vous)' : ''}</p>
                <p className="text-[13px] text-secondary truncate">{u.bio || 'Pas de description'}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className={`${current ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col`}>
        {current ? (
          <UserDetail user={current} onBack={() => setSelected(null)} onWrite={onWrite} />
        ) : (
          <div className="h-full flex items-center justify-center text-secondary">Sélectionnez une personne</div>
        )}
      </main>
    </div>
  )
}

function UserDetail({ user, onBack, onWrite }: { user: User; onBack: () => void; onWrite: (name: string) => void }) {
  const posts = useBridge(videoBridge, () => videoBridge.userPosts(user.id))
  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white border-b border-hairline p-6 flex flex-col items-center gap-2 relative">
        <button className="md:hidden absolute left-4 top-4 text-sm text-brand font-semibold" onClick={onBack}>← Retour</button>
        <Avatar name={user.name} size={84} />
        <h2 className="text-2xl font-extrabold">{user.name}</h2>
        <p className="text-secondary text-sm text-center max-w-md">{user.bio || 'Pas de description'}</p>
        {user.joinedAt && <p className="text-xs text-secondary/70">Membre depuis le {new Date(user.joinedAt).toLocaleDateString('fr-FR')}</p>}
        {user.id !== ME && (
          <button className="mt-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold px-5 py-2.5" onClick={() => onWrite(user.name)}>
            Écrire un message
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-3">Vidéos ({posts.length})</h3>
        {posts.length === 0 ? (
          <p className="text-sm text-secondary">Aucune vidéo publiée.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {posts.map((p) => <PostMiniature key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
