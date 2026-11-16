import { AccountBridgeMock, MessagingBridgeMock } from './mock'
import type { AccountBridge, MessagingBridge } from './types'

// Point de bascule mock -> TModeler : remplacer ces deux instances par des implémentations qui appellent le core Kotlin/Wasm.
export const accountBridge: AccountBridge = new AccountBridgeMock()
export const messagingBridge: MessagingBridge = new MessagingBridgeMock()

export * from './types'
export { ME } from './mock'
