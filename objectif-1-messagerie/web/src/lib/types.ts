export type User = { id: number; name: string }

export type Message = {
  id: number
  conversationId: number
  authorId: number
  text: string
  time: number
  replyToId?: number
  edited?: boolean
  deleted?: boolean
  attachment?: string
  reactions: Record<string, number>
}

export type Conversation = {
  id: number
  title: string
  unread: number
  pinned: boolean
  muted: boolean
  archived: boolean
}

/** Interface UI <-> TModeler : compte. Remplacer le mock par une implémentation TModeler. */
export interface AccountBridge {
  restoreSession(): Promise<User | null>
  login(identifier: string, password: string): Promise<User>
  register(name: string, identifier: string, password: string): Promise<User>
  logout(): Promise<void>
}

/** Interface UI <-> TModeler : messagerie. Remplacer le mock par une implémentation TModeler. */
export interface MessagingBridge {
  subscribe(listener: () => void): () => void
  conversations(): Conversation[]
  messages(conversationId: number): Message[]
  lastMessage(conversationId: number): Message | undefined
  send(conversationId: number, text: string, opts?: { replyToId?: number; attachment?: string }): void
  edit(messageId: number, text: string): void
  remove(messageId: number): void
  react(messageId: number, emoji: string): void
  markRead(conversationId: number): void
  setPinned(conversationId: number, value: boolean): void
  setMuted(conversationId: number, value: boolean): void
  setArchived(conversationId: number, value: boolean): void
  createConversation(title: string): number
}
