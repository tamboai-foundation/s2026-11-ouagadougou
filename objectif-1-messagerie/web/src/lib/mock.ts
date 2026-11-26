import type { AccountBridge, Conversation, Message, MessagingBridge, Post, PostComment, User, VideoBridge } from './types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const SESSION_KEY = 'ngoma_mock_user'

const OTHERS: User[] = [
  { id: 2, name: 'Awa Traoré', bio: 'Développeuse mobile, Bamako.', joinedAt: Date.now() - 30 * 86_400_000 },
  { id: 3, name: 'Kofi Mensah', bio: 'Design et vidéo, Accra.', joinedAt: Date.now() - 20 * 86_400_000 },
  { id: 4, name: 'Fatou Diop', bio: 'Étudiante en informatique, Dakar.', joinedAt: Date.now() - 12 * 86_400_000 },
  { id: 5, name: 'Moussa Keita', bio: 'Cybersécurité.', joinedAt: Date.now() - 5 * 86_400_000 },
  { id: 6, name: 'Aïcha Bello', bio: 'Passionnée de musique et de code.', joinedAt: Date.now() - 2 * 86_400_000 },
]

export class AccountBridgeMock implements AccountBridge {
  private listeners = new Set<() => void>()
  private me: User | null = null

  private emit() {
    this.listeners.forEach((l) => l())
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  async restoreSession(): Promise<User | null> {
    await sleep(900)
    const raw = localStorage.getItem(SESSION_KEY)
    this.me = raw ? (JSON.parse(raw) as User) : null
    return this.me
  }
  private async open(name: string): Promise<User> {
    await sleep(400)
    this.me = { id: 1, name: name.trim() || 'Moi', bio: '', joinedAt: Date.now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.me))
    return this.me
  }
  login(identifier: string, _password: string) {
    return this.open(identifier)
  }
  register(name: string, _identifier: string, _password: string) {
    return this.open(name)
  }
  async logout() {
    localStorage.removeItem(SESSION_KEY)
    this.me = null
  }

  // Gestion des utilisateurs (M1 SI, module 1)
  users(query = '') {
    const all = this.me ? [this.me, ...OTHERS] : OTHERS
    const q = query.trim().toLowerCase()
    return all.filter((u) => !q || u.name.toLowerCase().includes(q) || (u.bio ?? '').toLowerCase().includes(q))
  }
  user(id: number) {
    return this.users().find((u) => u.id === id)
  }
  updateProfile(patch: { name?: string; bio?: string }) {
    if (!this.me) return
    this.me = { ...this.me, ...patch, name: (patch.name ?? this.me.name).trim() || this.me.name }
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.me))
    this.emit()
  }
  async deleteAccount() {
    await this.logout()
    this.emit()
  }
}

export const ME = 1

export class MessagingBridgeMock implements MessagingBridge {
  private listeners = new Set<() => void>()
  private nextId = 100
  private convs: Conversation[] = [
    { id: 1, title: 'Awa Traoré', unread: 2, pinned: true, muted: false, archived: false },
    { id: 2, title: 'Équipe NGoma', unread: 0, pinned: false, muted: false, archived: false },
    { id: 3, title: 'Kofi Mensah', unread: 1, pinned: false, muted: false, archived: false },
    { id: 4, title: 'Fatou Diop', unread: 0, pinned: false, muted: true, archived: false },
  ]
  private msgs: Message[] = []

  constructor() {
    const now = Date.now()
    this.seed(1, 2, 'Salut ! Tu as vu le nouveau projet ?', now - 3_600_000)
    this.seed(1, 2, 'On commence demain matin.', now - 3_500_000)
    this.seed(2, 3, "Bienvenue dans l'équipe NGoma.", now - 86_400_000)
    this.seed(2, ME, "Merci, content d'être là !", now - 86_000_000)
    this.seed(3, 4, "Tu peux m'envoyer le rapport ?", now - 7_200_000)
    this.seed(4, 5, 'Bonne journée à tous.', now - 172_800_000)
  }

  private seed(conversationId: number, authorId: number, text: string, time: number) {
    this.msgs.push({ id: this.nextId++, conversationId, authorId, text, time, reactions: {} })
  }

  private emit() {
    this.listeners.forEach((l) => l())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  conversations() {
    return this.convs
  }
  messages(conversationId: number) {
    return this.msgs.filter((m) => m.conversationId === conversationId)
  }
  lastMessage(conversationId: number) {
    return [...this.messages(conversationId)].reverse().find((m) => !m.deleted)
  }

  send(conversationId: number, text: string, opts?: { replyToId?: number; attachment?: string }) {
    this.msgs.push({
      id: this.nextId++, conversationId, authorId: ME, text, time: Date.now(),
      replyToId: opts?.replyToId, attachment: opts?.attachment, reactions: {},
    })
    this.emit()
    // Réponse simulée d'un interlocuteur
    setTimeout(() => {
      this.seed(conversationId, 2, 'Bien reçu 👍', Date.now())
      this.convs = this.convs.map((c) => (c.id === conversationId ? { ...c, unread: c.unread + 1 } : c))
      this.emit()
    }, 1500)
  }

  private patch(id: number, f: (m: Message) => Message) {
    this.msgs = this.msgs.map((m) => (m.id === id ? f(m) : m))
    this.emit()
  }
  edit(id: number, text: string) {
    this.patch(id, (m) => ({ ...m, text, edited: true }))
  }
  remove(id: number) {
    this.patch(id, (m) => ({ ...m, deleted: true, text: '', attachment: undefined }))
  }
  react(id: number, emoji: string) {
    this.patch(id, (m) => ({ ...m, reactions: { ...m.reactions, [emoji]: (m.reactions[emoji] ?? 0) + 1 } }))
  }

  private patchConv(id: number, f: (c: Conversation) => Conversation) {
    this.convs = this.convs.map((c) => (c.id === id ? f(c) : c))
    this.emit()
  }
  markRead(id: number) {
    if (this.convs.find((c) => c.id === id)?.unread) this.patchConv(id, (c) => ({ ...c, unread: 0 }))
  }
  setPinned(id: number, value: boolean) {
    this.patchConv(id, (c) => ({ ...c, pinned: value }))
  }
  setMuted(id: number, value: boolean) {
    this.patchConv(id, (c) => ({ ...c, muted: value }))
  }
  setArchived(id: number, value: boolean) {
    this.patchConv(id, (c) => ({ ...c, archived: value }))
  }
  createConversation(title: string) {
    const id = Math.max(0, ...this.convs.map((c) => c.id)) + 1
    this.convs = [...this.convs, { id, title, unread: 0, pinned: false, muted: false, archived: false }]
    this.emit()
    return id
  }
}

export class VideoBridgeMock implements VideoBridge {
  private listeners = new Set<() => void>()
  private nextId = 1000
  private items: Post[] = []
  private notes: PostComment[] = []

  constructor() {
    const now = Date.now()
    const post = (authorId: number, caption: string, ago: number, likes: number[]) =>
      this.items.push({ id: this.nextId++, authorId, caption, mediaUrl: '', time: now - ago, likes })
    post(2, 'Ma première application de messagerie, étape par étape ✨', 3_600_000, [3, 4, 5])
    post(3, 'Un petit tour dans les coulisses de notre équipe 🎬', 7_200_000, [2])
    post(4, 'Astuce du jour : tester chaque écran avant de le montrer.', 20_000_000, [2, 3, 5, 6])
    post(5, 'Pourquoi on chiffre les messages ? Explication en 30 secondes.', 90_000_000, [])
    post(6, 'Bienvenue sur NGoma 👋', 180_000_000, [2, 3])
    const first = this.items[0].id
    const c1 = this.addNote(first, 3, 'Bravo, très clair !', now - 3_000_000)
    this.addNote(first, 4, 'Merci pour le partage 🙏', now - 2_800_000)
    this.addNote(first, 2, 'Merci Kofi !', now - 2_500_000, c1)
  }

  private addNote(postId: number, authorId: number, text: string, time: number, parentId?: number) {
    const id = this.nextId++
    this.notes.push({ id, postId, authorId, text, time, parentId, likes: [] })
    return id
  }
  private emit() {
    this.listeners.forEach((l) => l())
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  posts() {
    return [...this.items].sort((a, b) => b.time - a.time)
  }
  userPosts(userId: number) {
    return this.posts().filter((p) => p.authorId === userId)
  }
  publish(input: { caption: string; file?: File }) {
    const post: Post = {
      id: this.nextId++, authorId: ME, caption: input.caption.trim(),
      mediaUrl: input.file ? URL.createObjectURL(input.file) : '',
      mediaType: input.file ? (input.file.type.startsWith('image/') ? 'image' : 'video') : undefined,
      time: Date.now(), likes: [],
    }
    this.items.push(post)
    this.emit()
    return post
  }
  private patchPost(id: number, f: (p: Post) => Post) {
    this.items = this.items.map((p) => (p.id === id ? f(p) : p))
    this.emit()
  }
  editPost(postId: number, caption: string) {
    this.patchPost(postId, (p) => ({ ...p, caption: caption.trim(), edited: true }))
  }
  removePost(postId: number) {
    this.items = this.items.filter((p) => p.id !== postId)
    this.notes = this.notes.filter((c) => c.postId !== postId)
    this.emit()
  }
  toggleLike(postId: number) {
    this.patchPost(postId, (p) => ({ ...p, likes: p.likes.includes(ME) ? p.likes.filter((u) => u !== ME) : [...p.likes, ME] }))
  }

  comments(postId: number) {
    return this.notes.filter((c) => c.postId === postId).sort((a, b) => a.time - b.time)
  }
  addComment(postId: number, text: string, parentId?: number) {
    this.addNote(postId, ME, text.trim(), Date.now(), parentId)
    this.emit()
  }
  private patchNote(id: number, f: (c: PostComment) => PostComment) {
    this.notes = this.notes.map((c) => (c.id === id ? f(c) : c))
    this.emit()
  }
  editComment(commentId: number, text: string) {
    this.patchNote(commentId, (c) => ({ ...c, text: text.trim(), edited: true }))
  }
  removeComment(commentId: number) {
    this.patchNote(commentId, (c) => ({ ...c, deleted: true, text: '' }))
  }
  toggleCommentLike(commentId: number) {
    this.patchNote(commentId, (c) => ({ ...c, likes: c.likes.includes(ME) ? c.likes.filter((u) => u !== ME) : [...c.likes, ME] }))
  }
}
