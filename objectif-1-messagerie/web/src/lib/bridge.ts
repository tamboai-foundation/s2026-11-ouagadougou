import { AccountBridgeMock, MessagingBridgeMock, VideoBridgeMock } from './mock'
import type { AccountBridge, MessagingBridge, VideoBridge } from './types'

// Point de bascule mock -> TModeler : remplacer ces trois instances par des implémentations qui appellent le core Kotlin/Wasm.
export const accountBridge: AccountBridge = new AccountBridgeMock()
export const messagingBridge: MessagingBridge = new MessagingBridgeMock()
export const videoBridge: VideoBridge = new VideoBridgeMock()

export * from './types'
export { ME } from './mock'
