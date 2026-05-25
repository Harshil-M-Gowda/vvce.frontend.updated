import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../../api'

export default function ResetPassword() {
  const [params]              = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [status, setStatus]     = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [matchError, setMatchError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMatchError('')
    setErrorMsg('')
    if (password !== confirm) {
      setMatchError('Passwords do not match.')
      return
    }
    const token = params.get('token')
    if (!token) {
      setErrorMsg('No reset token found. Please use the link from your email.')
      return
    }
    setStatus('loading')
    try {
      await authAPI.resetPassword({ token, password })
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
      setStatus('error')
    }
  }

  const sharedWrapper = (children) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
          <div className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-400/20">
              <span className="font-black text-slate-900 text-sm">VV</span>
            </div>
            {children}
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-4">
          VVCE Events Hub · Vidyavardhaka College of Engineering
        </p>
      </div>
    </div>
  )

  if (status === 'done') return sharedWrapper(
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="font-black text-slate-800 text-xl mb-1">Password Reset!</h2>
        <p className="text-slate-500 text-sm">Your password has been updated. You can now sign in with your new password.</p>
      </div>
      <Link to="/login"
        className="block w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-black rounded-xl text-sm hover:shadow-lg transition-all text-center">
        Sign In →
      </Link>
    </div>
  )

  return sharedWrapper(
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-black text-slate-800 text-xl mb-1">Reset Password</h2>
        <p className="text-slate-400 text-sm mb-5">Choose a strong new password for your account.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
        <input type="password" minLength={8} required placeholder="Min 8 characters"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
        <input type="password" required placeholder="Repeat your password"
          value={confirm} onChange={e => { setConfirm(e.target.value); setMatchError('') }}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all
            ${matchError ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/10'}`} />
        {matchError && <p className="text-red-500 text-[11px] mt-1">{matchError}</p>}
      </div>

      {(status === 'error' || errorMsg) && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 mt-2">
        {status === 'loading' ? 'Resetting…' : 'Reset Password'}
      </button>

      <p className="text-center text-xs text-slate-400">
        <Link to="/login" className="text-amber-500 hover:underline font-medium">Back to Sign In</Link>
      </p>
    </form>
  )
}
