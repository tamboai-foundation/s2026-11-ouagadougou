import { useState } from 'react'
import { messagingBridge, type User } from '../lib/bridge'
import Home from './Home'
import VideoFeed from './VideoFeed'
import People from './People'
import Profile from './Profile'

export type Tab = 'messages' | 'videos' | 'people' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'videos', label: 'Vidéos', icon: '▶️' },
  { id: 'people', label: 'Personnes', icon: '👥' },
  { id: 'profile', label: 'Profil', icon: '🙂' },
]

/** Cadre de l'application : une barre d'onglets (à gauche sur grand écran, en bas sur mobile) et l'écran actif. */
export default function Shell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('messages')
  // Demande d'ouverture d'une conversation avec une personne (bouton « Écrire » de l'écran Personnes)
  const [openChatWith, setOpenChatWith] = useState<string | null>(null)

  function writeTo(name: string) {
    setOpenChatWith(name)
    setTab('messages')
  }

  return (
    <div className="h-full flex flex-col-reverse md:flex-row bg-page">
      <nav className="shrink-0 bg-white border-t md:border-t-0 md:border-r border-hairline flex md:flex-col items-center justify-around md:justify-start md:gap-2 md:w-[76px] md:py-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-label={t.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] font-semibold rounded-xl ${tab === t.id ? 'text-brand bg-brand-50' : 'text-secondary'}`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="flex-1 min-h-0 min-w-0">
        {tab === 'messages' && (
          <Home user={user} bridge={messagingBridge} onLogout={onLogout} openChatWith={openChatWith} onChatOpened={() => setOpenChatWith(null)} />
        )}
        {tab === 'videos' && <VideoFeed />}
        {tab === 'people' && <People onWrite={writeTo} />}
        {tab === 'profile' && <Profile onLogout={onLogout} onDeleted={onLogout} />}
      </div>
    </div>
  )
}
