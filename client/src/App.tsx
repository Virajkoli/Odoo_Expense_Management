import { useEffect, useState } from 'react'
import './App.css'

type Flags = { gpt5?: boolean }

function App() {
  const [count, setCount] = useState(0)
  const [flags, setFlags] = useState<Flags>({})

  useEffect(() => {
    // Placeholder: normally fetch from /api/flags with auth token
    setFlags({ gpt5: true })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900/40 backdrop-blur rounded-xl shadow-lg border border-white/10 p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Expense Management</h1>
          <span className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className={`size-2 rounded-full ${flags.gpt5 ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
            GPT-5: {flags.gpt5 ? 'Enabled' : 'Disabled'}
          </span>
        </header>
        <div className="space-y-3">
          <p className="text-slate-300">Sample counter to verify the client runs:</p>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition" onClick={() => setCount((x) => x + 1)}>
            Count is {count}
          </button>
        </div>
        <p className="text-xs text-slate-400">TailwindCSS is configured. Replace this demo with real screens.</p>
      </div>
    </div>
  )
}

export default App
