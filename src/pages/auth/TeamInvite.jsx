import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { registrationsAPI } from '../../api'

export default function TeamInvite() {
  const [params]            = useSearchParams()
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'accepted' | 'declined' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const token = params.get('token')

  const handle = async (action) => {
    if (!token) { setErrorMsg('No invitation token found.'); setStatus('error'); return }
    setStatus('loading')
    try {
      await registrationsAPI.teamApprove({ token, action })
      setStatus(action === 'accept' ? 'accepted' : 'declined')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process invitation. It may have expired.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
          <div className="p-8 text-center">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-400/20">
              <span className="font-black text-slate-900 text-lg">VV</span>
            </div>

            {/* IDLE — show accept/decline */}
            {status === 'idle' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Team Invitation 🤝</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You've been invited to join a team for an event on VVCE Events Hub.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handle('accept')}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl text-sm hover:shadow-lg hover:shadow-emerald-400/20 transition-all">
                    ✓ Accept
                  </button>
                  <button onClick={() => handle('decline')}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                    Decline
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Not sure? You can accept and withdraw registration later.
                </p>
              </div>
            )}

            {/* LOADING */}
            {status === 'loading' && (
              <div className="space-y-3 py-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-amber-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Processing…</p>
              </div>
            )}

            {/* ACCEPTED */}
            {status === 'accepted' && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">You're in the team! 🎉</h2>
                  <p className="text-slate-500 text-sm">Invitation accepted. Check your VVCE email for confirmation.</p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all">
                  Go to Dashboard →
                </Link>
              </div>
            )}

            {/* DECLINED */}
            {status === 'declined' && (
              <div className="space-y-4">
                <div className="text-5xl">👋</div>
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Invitation Declined</h2>
                  <p className="text-slate-500 text-sm">No worries! You can always join other events.</p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all">
                  Back to Sign In
                </Link>
              </div>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Something went wrong</h2>
                  <p className="text-slate-500 text-sm">{errorMsg}</p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all">
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-4">
          VVCE Events Hub · Vidyavardhaka College of Engineering
        </p>
      </div>
    </div>
  )
}
