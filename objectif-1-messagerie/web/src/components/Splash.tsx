export default function Splash() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-brand text-white gap-5">
      <h1 className="text-5xl font-extrabold tracking-tight">NGoma</h1>
      <div className="w-9 h-9 rounded-full border-4 border-white/40 border-t-white animate-spin" />
      <p className="text-sm text-white/85">Chargement…</p>
    </div>
  )
}
