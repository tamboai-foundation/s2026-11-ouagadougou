export type User = { id: number; name: string; bio?: string; joinedAt?: number }

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
  /** Gestion des utilisateurs (M1 SI, module 1) : voir les users, rechercher, modifier son profil, supprimer son compte. */
  subscribe(listener: () => void): () => void
  users(query?: string): User[]
  user(id: number): User | undefined
  updateProfile(patch: { name?: string; bio?: string }): void
  deleteAccount(): Promise<void>
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

/** Publication (M1 SI, module 3) : média facultatif (photo ou vidéo) et légende. `mediaUrl` vide : légende seule, affichée sur une carte colorée. */
export type Post = {
  id: number
  authorId: number
  caption: string
  mediaUrl: string
  /** Type du média (`image` ou `video`) ; absent si `mediaUrl` est vide. */
  mediaType?: 'image' | 'video'
  time: number
  edited?: boolean
  /** Identifiants des utilisateurs qui ont aimé la publication. */
  likes: number[]
}

export type PostComment = {
  id: number
  postId: number
  authorId: number
  text: string
  time: number
  /** Réponse à un commentaire : identifiant du commentaire parent (un seul niveau d'imbrication dans l'interface). */
  parentId?: number
  edited?: boolean
  deleted?: boolean
  likes: number[]
}

/** Interface UI <-> TModeler : publications vidéo, likes, commentaires et réponses. Remplacer le mock par une implémentation TModeler. */
export interface VideoBridge {
  subscribe(listener: () => void): () => void
  /** Fil d'actualité : publications de tous les utilisateurs, la plus récente en premier. */
  posts(): Post[]
  userPosts(userId: number): Post[]
  publish(input: { caption: string; file?: File }): Post
  editPost(postId: number, caption: string): void
  removePost(postId: number): void
  /** Aime ou n'aime plus (bascule) pour l'utilisateur connecté. */
  toggleLike(postId: number): void
  comments(postId: number): PostComment[]
  addComment(postId: number, text: string, parentId?: number): void
  editComment(commentId: number, text: string): void
  removeComment(commentId: number): void
  toggleCommentLike(commentId: number): void
}
