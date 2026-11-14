import { useState, type FormEvent } from 'react'
import { accountBridge, type User } from '../lib/bridge'

export default function Auth({ onDone }: { onDone: (u: User) => void }) {
  const [register, setRegister] = useState(false)
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [pwd, setPwd] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const u = register ? await accountBridge.register(name, id, pwd) : await accountBridge.login(id, pwd)
    setBusy(false)
    onDone(u)
  }

  const input =
    'w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

  return (
    <div className="h-full flex items-center justify-center bg-page p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-brand">NGoma</h1>
        <p className="text-secondary text-sm -mt-2">{register ? 'Créer un compte' : 'Connexion'}</p>
        {register && <input className={input} placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className={input} placeholder="Téléphone ou e-mail" value={id} onChange={(e) => setId(e.target.value)} />
        <input className={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <button disabled={busy} className="rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold py-3 disabled:opacity-60">
          {register ? "S'inscrire" : 'Se connecter'}
        </button>
        <button type="button" className="text-sm text-brand font-medium" onClick={() => setRegister(!register)}>
          {register ? "J'ai déjà un compte" : 'Créer un compte'}
        </button>
        <p className="text-xs text-secondary/70">Mode démo : tout identifiant est accepté.</p>
      </form>
    </div>
  )
}
