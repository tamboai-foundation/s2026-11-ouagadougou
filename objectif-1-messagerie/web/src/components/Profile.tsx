import { useState } from 'react'
import { accountBridge, videoBridge, ME } from '../lib/bridge'
import { Avatar, useBridge } from './Home'
import { PostMiniature } from './VideoFeed'

/** Mon profil (M1 SI, module 1) : modifier mon nom et ma description, voir mes vidéos, me déconnecter, supprimer mon compte. */
export default function Profile({ onLogout, onDeleted }: { onLogout: () => void; onDeleted: () => void }) {
  const me = useBridge(accountBridge, () => accountBridge.user(ME))
  const posts = useBridge(videoBridge, () => videoBridge.userPosts(ME))
  const [name, setName] = useState(me?.name ?? '')
  const [bio, setBio] = useState(me?.bio ?? '')
  const [saved, setSaved] = useState(false)
  const input = 'w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

  function save() {
    accountBridge.updateProfile({ name, bio })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }
  async function remove() {
    if (!window.confirm('Supprimer définitivement votre compte ?')) return
    await accountBridge.deleteAccount()
    onDeleted()
  }

  if (!me) return null
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Avatar name={me.name} size={72} />
            <div>
              <h2 className="text-2xl font-extrabold">{me.name}</h2>
              <p className="text-sm text-secondary">{posts.length} vidéo{posts.length > 1 ? 's' : ''} publiée{posts.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <label className="text-sm font-semibold">Nom</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          <label className="text-sm font-semibold">Description</label>
          <textarea className={input} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Parlez de vous en quelques mots" />
          <button className="rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold py-3" onClick={save}>
            {saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="font-bold mb-3">Mes vidéos</h3>
          {posts.length === 0 ? (
            <p className="text-sm text-secondary">Vous n'avez rien publié pour l'instant.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{posts.map((p) => <PostMiniature key={p.id} post={p} />)}</div>
          )}
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <button className="rounded-xl border border-hairline py-3 font-semibold" onClick={onLogout}>Se déconnecter</button>
          <button className="rounded-xl text-negative border border-negative/30 py-3 font-semibold" onClick={remove}>Supprimer mon compte</button>
        </div>
      </div>
    </div>
  )
}
