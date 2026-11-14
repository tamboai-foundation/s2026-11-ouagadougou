import { useEffect, useState } from 'react'
import { accountBridge, messagingBridge, type User } from './lib/bridge'
import { startTModeler } from './lib/tm'
import Splash from './components/Splash'
import Auth from './components/Auth'
import Home from './components/Home'

type Phase = 'splash' | 'auth' | 'home'

export default function App() {
  const [phase, setPhase] = useState<Phase>('splash')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      await startTModeler()
      const u = await accountBridge.restoreSession()
      if (!alive) return
      setUser(u)
      setPhase(u ? 'home' : 'auth')
    })()
    return () => {
      alive = false
    }
  }, [])

  if (phase === 'splash') return <Splash />
  if (phase === 'auth' || !user) {
    return (
      <Auth
        onDone={(u) => {
          setUser(u)
          setPhase('home')
        }}
      />
    )
  }
  return (
    <Home
      user={user}
      bridge={messagingBridge}
      onLogout={async () => {
        await accountBridge.logout()
        setUser(null)
        setPhase('auth')
      }}
    />
  )
}
