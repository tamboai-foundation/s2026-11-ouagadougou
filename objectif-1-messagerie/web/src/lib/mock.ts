import type { AccountBridge, Conversation, Message, MessagingBridge, User } from './types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const SESSION_KEY = 'ngoma_mock_user'

export class AccountBridgeMock implements AccountBridge {
  async restoreSession(): Promise<User | null> {
    await sleep(900)
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  }
  private async open(name: string): Promise<User> {
    await sleep(400)
    const user = { id: 1, name: name.trim() || 'Moi' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  }
  login(identifier: string, _password: string) {
    return this.open(identifier)
  }
  register(name: string, _identifier: string, _password: string) {
    return this.open(name)
  }
  async logout() {
    localStorage.removeItem(SESSION_KEY)
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
