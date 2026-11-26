import { useEffect, useRef, useState } from 'react'
import { accountBridge, videoBridge, ME, type Post, type PostComment } from '../lib/bridge'
import { Avatar, useBridge } from './Home'

const GRADIENTS = [
  'from-rose-500 to-orange-400',
  'from-indigo-600 to-sky-400',
  'from-emerald-600 to-lime-400',
  'from-fuchsia-600 to-pink-400',
  'from-slate-800 to-slate-500',
]

export function timeAgo(t: number) {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000))
  if (s < 60) return "à l'instant"
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`
  return `il y a ${Math.round(s / 86400)} j`
}

const authorName = (id: number) => accountBridge.user(id)?.name ?? 'Utilisateur'

/** Photo ou vidéo de la publication ; sans média (légende seule), une carte colorée avec la légende. */
function PostMedia({ post, active }: { post: Post; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) void v.play().catch(() => undefined)
    else v.pause()
  }, [active])
  if (post.mediaUrl && post.mediaType === 'image') {
    return <img src={post.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-contain bg-black" />
  }
  if (post.mediaUrl) {
    return <video ref={ref} src={post.mediaUrl} className="absolute inset-0 w-full h-full object-contain bg-black" loop muted playsInline controls={false} />
  }
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[post.id % GRADIENTS.length]} flex items-center justify-center p-10`}>
      <p className="text-white/95 text-2xl md:text-3xl font-extrabold text-center leading-snug drop-shadow">{post.caption}</p>
    </div>
  )
}

/** Vignette d'une publication (profils, liste de mes vidéos). */
export function PostMiniature({ post }: { post: Post }) {
  return (
    <div className={`aspect-[9/14] rounded-2xl overflow-hidden relative bg-gradient-to-br ${GRADIENTS[post.id % GRADIENTS.length]}`}>
      {post.mediaUrl && post.mediaType === 'image' && <img src={post.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {post.mediaUrl && post.mediaType !== 'image' && <video src={post.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted playsInline />}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs">
        <p className="line-clamp-2 font-semibold">{post.caption || (post.mediaType === 'image' ? 'Photo' : 'Vidéo')}</p>
        <p className="opacity-80">❤️ {post.likes.length}</p>
      </div>
    </div>
  )
}

/** Fil de vidéos façon TikTok (M1 SI, module 3) : défilement vertical, publier, aimer, commenter, modifier et supprimer ses vidéos. */
export default function VideoFeed() {
  const [mineOnly, setMineOnly] = useState(false)
  const posts = useBridge(videoBridge, () => (mineOnly ? videoBridge.userPosts(ME) : videoBridge.posts()))
  const [commentsFor, setCommentsFor] = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)

  // La vidéo visible (au moins 60 % de l'écran) est lue, les autres sont en pause.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting && e.intersectionRatio >= 0.6) setActiveId(Number((e.target as HTMLElement).dataset.post))
      },
      { root: el, threshold: [0.6] },
    )
    el.querySelectorAll('[data-post]').forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [posts.length, mineOnly])

  return (
    <div className="h-full relative bg-black">
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-5 p-3 text-white bg-gradient-to-b from-black/50 to-transparent">
        <button className={`font-bold text-[15px] ${mineOnly ? 'opacity-60' : 'underline underline-offset-8'}`} onClick={() => setMineOnly(false)}>Pour vous</button>
        <button className={`font-bold text-[15px] ${mineOnly ? 'underline underline-offset-8' : 'opacity-60'}`} onClick={() => setMineOnly(true)}>Mes vidéos</button>
        <button className="absolute right-3 rounded-full bg-brand px-4 py-1.5 text-sm font-bold" onClick={() => setPublishing(true)}>+ Publier</button>
      </div>

      <div ref={root} className="h-full overflow-y-scroll snap-y snap-mandatory">
        {posts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/80">
            <p>{mineOnly ? "Vous n'avez rien publié pour l'instant." : 'Aucune publication pour le moment.'}</p>
            <button className="rounded-full bg-brand px-5 py-2 font-bold text-white" onClick={() => setPublishing(true)}>Publier</button>
          </div>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} active={p.id === activeId} onComments={() => setCommentsFor(p.id)} />
        ))}
      </div>

      {commentsFor != null && <CommentsSheet postId={commentsFor} onClose={() => setCommentsFor(null)} />}
      {publishing && <PublishDialog onClose={() => setPublishing(false)} onDone={() => { setPublishing(false); setMineOnly(false); root.current?.scrollTo({ top: 0 }) }} />}
    </div>
  )
}

function PostCard({ post, active, onComments }: { post: Post; active: boolean; onComments: () => void }) {
  const count = useBridge(videoBridge, () => videoBridge.comments(post.id).filter((c) => !c.deleted).length)
  const [menu, setMenu] = useState(false)
  const liked = post.likes.includes(ME)
  const mine = post.authorId === ME

  function edit() {
    setMenu(false)
    const caption = window.prompt('Modifier la légende', post.caption)
    if (caption !== null) videoBridge.editPost(post.id, caption)
  }
  function remove() {
    setMenu(false)
    if (window.confirm('Supprimer cette vidéo ?')) videoBridge.removePost(post.id)
  }

  return (
    <section data-post={post.id} className="h-full snap-start snap-always relative overflow-hidden">
      <PostMedia post={post} active={active} />
      <div className="absolute inset-x-0 bottom-0 p-4 pr-20 pb-6 bg-gradient-to-t from-black/70 to-transparent text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar name={authorName(post.authorId)} size={32} />
          <span className="font-bold">{authorName(post.authorId)}</span>
          <span className="text-xs opacity-70">{timeAgo(post.time)}</span>
        </div>
        {post.mediaUrl && post.caption && <p className="text-sm">{post.caption}{post.edited ? ' (modifié)' : ''}</p>}
        {!post.mediaUrl && post.edited && <p className="text-xs opacity-70">modifié</p>}
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
        <button className="flex flex-col items-center" onClick={() => videoBridge.toggleLike(post.id)} aria-label="J'aime">
          <span className="text-3xl drop-shadow">{liked ? '❤️' : '🤍'}</span>
          <span className="text-xs font-bold">{post.likes.length}</span>
        </button>
        <button className="flex flex-col items-center" onClick={onComments} aria-label="Commentaires">
          <span className="text-3xl drop-shadow">💬</span>
          <span className="text-xs font-bold">{count}</span>
        </button>
        {mine && (
          <div className="relative">
            <button className="text-3xl drop-shadow" onClick={() => setMenu(!menu)} aria-label="Plus">⋮</button>
            {menu && (
              <div className="absolute right-10 bottom-0 bg-white text-ink rounded-xl shadow-lg border border-hairline py-1 w-44 text-sm">
                <button className="w-full text-left px-4 py-2 hover:bg-page" onClick={edit}>Modifier la légende</button>
                <button className="w-full text-left px-4 py-2 hover:bg-page text-negative" onClick={remove}>Supprimer la vidéo</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/** Commentaires et réponses d'une publication : ajouter, répondre, aimer, modifier et supprimer les siens. */
function CommentsSheet({ postId, onClose }: { postId: number; onClose: () => void }) {
  const all = useBridge(videoBridge, () => videoBridge.comments(postId))
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<PostComment | null>(null)
  const [editing, setEditing] = useState<PostComment | null>(null)
  const visible = all.filter((c) => !c.deleted || all.some((r) => r.parentId === c.id && !r.deleted))
  const roots = visible.filter((c) => c.parentId == null)

  function submit() {
    const value = text.trim()
    if (!value) return
    if (editing) videoBridge.editComment(editing.id, value)
    else videoBridge.addComment(postId, value, replyTo ? (replyTo.parentId ?? replyTo.id) : undefined)
    setText('')
    setReplyTo(null)
    setEditing(null)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-end md:items-stretch md:justify-end bg-black/40" onClick={onClose}>
      <div className="bg-white w-full md:w-[420px] h-[75%] md:h-full rounded-t-3xl md:rounded-none flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center px-4 py-3 border-b border-hairline">
          <h3 className="font-bold flex-1">Commentaires ({all.filter((c) => !c.deleted).length})</h3>
          <button className="text-xl px-2" onClick={onClose} aria-label="Fermer">✕</button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          {roots.length === 0 && <p className="text-sm text-secondary">Aucun commentaire. Soyez le premier !</p>}
          {roots.map((c) => (
            <div key={c.id} className="flex flex-col gap-3">
              <CommentRow c={c} onReply={() => { setReplyTo(c); setEditing(null) }} onEdit={() => { setEditing(c); setReplyTo(null); setText(c.text) }} />
              {visible.filter((r) => r.parentId === c.id).map((r) => (
                <div key={r.id} className="ml-10">
                  <CommentRow c={r} onReply={() => { setReplyTo(r); setEditing(null) }} onEdit={() => { setEditing(r); setReplyTo(null); setText(r.text) }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-hairline p-3 flex flex-col gap-2">
          {(replyTo || editing) && (
            <div className="flex items-center text-xs text-secondary bg-page rounded-lg px-3 py-1.5">
              <span className="flex-1 truncate">{editing ? 'Modification du commentaire' : `Réponse à ${authorName(replyTo!.authorId)}`}</span>
              <button onClick={() => { setReplyTo(null); setEditing(null); setText('') }}>Annuler</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none"
              placeholder="Ajouter un commentaire…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <button className="rounded-full bg-brand text-white px-4 font-semibold disabled:opacity-50" disabled={!text.trim()} onClick={submit}>
              {editing ? 'Enregistrer' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentRow({ c, onReply, onEdit }: { c: PostComment; onReply: () => void; onEdit: () => void }) {
  const mine = c.authorId === ME
  const liked = c.likes.includes(ME)
  return (
    <div className="flex gap-2.5">
      <Avatar name={authorName(c.authorId)} size={32} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px]"><b>{authorName(c.authorId)}</b> <span className="text-secondary">{timeAgo(c.time)}{c.edited ? ' · modifié' : ''}</span></p>
        {c.deleted ? (
          <p className="text-sm italic text-secondary">Commentaire supprimé</p>
        ) : (
          <>
            <p className="text-sm break-words">{c.text}</p>
            <div className="flex gap-4 text-xs text-secondary mt-1">
              <button onClick={() => videoBridge.toggleCommentLike(c.id)}>{liked ? '❤️' : '🤍'} {c.likes.length}</button>
              <button onClick={onReply}>Répondre</button>
              {mine && <button onClick={onEdit}>Modifier</button>}
              {mine && <button className="text-negative" onClick={() => videoBridge.removeComment(c.id)}>Supprimer</button>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Publier : photo ou vidéo (facultatif) et/ou légende ; une légende seule est acceptée. */
function PublishDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const preview = file ? URL.createObjectURL(file) : ''
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function publish() {
    videoBridge.publish({ caption, file: file ?? undefined })
    onDone()
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-extrabold">Publier</h3>
        <label className="rounded-2xl border-2 border-dashed border-hairline aspect-video flex items-center justify-center text-secondary text-sm cursor-pointer overflow-hidden bg-page">
          {preview
            ? (file?.type.startsWith('image/')
              ? <img src={preview} alt="" className="w-full h-full object-contain bg-black" />
              : <video src={preview} className="w-full h-full object-contain bg-black" muted controls />)
            : 'Ajouter une photo ou une vidéo (facultatif)'}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <textarea
          className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-brand"
          rows={3}
          placeholder="Légende"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <button className="rounded-xl px-4 py-2.5 font-semibold text-secondary" onClick={onClose}>Annuler</button>
          <button className="rounded-xl bg-brand hover:bg-brand-dark text-white px-5 py-2.5 font-semibold disabled:opacity-50" disabled={!file && !caption.trim()} onClick={publish}>
            Publier
          </button>
        </div>
      </div>
    </div>
  )
}
