import { useEffect, useRef, useState } from 'react'
import { ME, type Conversation, type Message, type MessagingBridge } from '../lib/bridge'
import { Avatar, hour, useBridge } from './Home'

const EMOJIS = ['👍', '❤️', '😂', '😮']

export default function ConversationView({ conv, bridge }: { conv: Conversation; bridge: MessagingBridge }) {
  const messages = useBridge(bridge, () => bridge.messages(conv.id))
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editing, setEditing] = useState<Message | null>(null)
  const [menuFor, setMenuFor] = useState<number | null>(null)
  const [headerMenu, setHeaderMenu] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    bridge.markRead(conv.id)
  }, [messages.length, conv.id, bridge])

  function submit() {
    const text = input.trim()
    if (!text) return
    if (editing) bridge.edit(editing.id, text)
    else bridge.send(conv.id, text, { replyToId: replyTo?.id })
    setInput('')
    setReplyTo(null)
    setEditing(null)
  }

  const banner = editing ? 'Modification du message' : replyTo ? `Réponse à : ${replyTo.text}` : null

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-3 bg-white border-b border-hairline px-4 py-2.5 relative">
        <Avatar name={conv.title} size={40} />
        <h2 className="font-bold text-[17px] flex-1">{conv.title}</h2>
        <button className="text-xl px-2" onClick={() => setHeaderMenu(!headerMenu)}>⋮</button>
        {headerMenu && (
          <div className="absolute right-3 top-14 z-10 bg-white rounded-xl shadow-lg border border-hairline py-1 w-56 text-sm">
            <MenuItem onClick={() => { bridge.setPinned(conv.id, !conv.pinned); setHeaderMenu(false) }}>
              {conv.pinned ? 'Désépingler' : 'Épingler'}
            </MenuItem>
            <MenuItem onClick={() => { bridge.setMuted(conv.id, !conv.muted); setHeaderMenu(false) }}>
              {conv.muted ? 'Réactiver les notifications' : 'Mettre en sourdine'}
            </MenuItem>
            <MenuItem onClick={() => { bridge.setArchived(conv.id, !conv.archived); setHeaderMenu(false) }}>
              {conv.archived ? 'Désarchiver' : 'Archiver'}
            </MenuItem>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
        {messages.map((m) => {
          const mine = m.authorId === ME
          const quoted = m.replyToId ? messages.find((x) => x.id === m.replyToId) : undefined
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <button
                  disabled={m.deleted}
                  onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                  className={`max-w-[460px] text-left rounded-2xl px-3 py-2 ${mine ? 'bg-brand text-white' : 'bg-white text-ink'}`}
                >
                  {quoted && <p className="text-xs opacity-75 truncate mb-1">{quoted.text || 'Message supprimé'}</p>}
                  {m.deleted ? (
                    <span className="italic opacity-60 text-sm">Message supprimé</span>
                  ) : (
                    <>
                      {m.attachment && <p className="text-sm font-semibold">📎 {m.attachment}</p>}
                      {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    </>
                  )}
                  <p className="text-[11px] opacity-65 text-right">{hour(m.time)}{m.edited ? ' · modifié' : ''}</p>
                </button>
                {Object.keys(m.reactions).length > 0 && (
                  <span className="mt-0.5 bg-muted rounded-full px-2 py-0.5 text-xs">
                    {Object.entries(m.reactions).map(([e, n]) => `${e} ${n}`).join('  ')}
                  </span>
                )}
                {menuFor === m.id && (
                  <div className={`absolute z-10 top-full mt-1 ${mine ? 'right-0' : 'left-0'} bg-white rounded-xl shadow-lg border border-hairline py-1 w-48 text-sm`}>
                    <div className="flex px-2">
                      {EMOJIS.map((e) => (
                        <button key={e} className="flex-1 py-1" onClick={() => { bridge.react(m.id, e); setMenuFor(null) }}>{e}</button>
                      ))}
                    </div>
                    <MenuItem onClick={() => { setReplyTo(m); setEditing(null); setMenuFor(null) }}>Répondre</MenuItem>
                    {mine && (
                      <>
                        <MenuItem onClick={() => { setEditing(m); setReplyTo(null); setInput(m.text); setMenuFor(null) }}>Modifier</MenuItem>
                        <MenuItem onClick={() => { bridge.remove(m.id); setMenuFor(null) }}>Supprimer</MenuItem>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {banner && (
        <div className="flex items-center bg-brand-50 text-brand-dark text-[13px] px-4 py-1.5">
          <span className="flex-1 truncate">{banner}</span>
          <button onClick={() => { setEditing(null); setReplyTo(null); setInput('') }}>✕</button>
        </div>
      )}
      <footer className="flex items-center gap-2 bg-white border-t border-hairline p-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) bridge.send(conv.id, '', { attachment: f.name })
            e.target.value = ''
          }}
        />
        <button className="text-xl px-2" title="Joindre un fichier" onClick={() => fileRef.current?.click()}>📎</button>
        <input
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none"
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button onClick={submit} className="w-11 h-11 rounded-full bg-brand hover:bg-brand-dark text-white">
          {editing ? '✓' : '➤'}
        </button>
      </footer>
    </div>
  )
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="w-full text-left px-4 py-2 hover:bg-page" onClick={onClick}>
      {children}
    </button>
  )
}
