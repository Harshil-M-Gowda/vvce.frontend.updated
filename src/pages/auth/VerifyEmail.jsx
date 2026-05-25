import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../../api'

// Standalone page — no Layout wrapper, no auth required.
// Reached via email link: http://localhost:3000/verify-email?token=<uuid>
export default function VerifyEmail() {
  const [params]             = useSearchParams()
  const [status, setStatus]  = useState('loading') // 'loading' | 'success' | 'error' | 'no-token'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = params.get('token')

    if (!token || token.trim() === '') {
      setStatus('no-token')
      return
    }

    // Slight delay so loading state is visible (avoids flash on fast networks)
    const timer = setTimeout(async () => {
      try {
        const res = await authAPI.verifyEmail(token)
        // Backend returns { success: true, message: '...' }
        if (res.data?.success) {
          setStatus('success')
        } else {
          setErrorMsg(res.data?.message || 'Verification failed.')
          setStatus('error')
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'The link is invalid or has expired.'
        setErrorMsg(msg)
        setStatus('error')
      }
    }, 600)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />

          <div className="p-8 text-center">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-400/20">
              <span className="font-black text-slate-900 text-lg">VV</span>
            </div>

            {/* LOADING */}
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mx-auto"
                  style={{ borderWidth: '3px' }} />
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Verifying your email</h2>
                  <p className="text-slate-400 text-sm">Please wait a moment…</p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {status === 'success' && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Email Verified! 🎉</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Your VVCE Events Hub account is now active. You can sign in and start exploring events.
                  </p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-black rounded-xl text-sm hover:shadow-lg hover:shadow-amber-400/20 transition-all">
                  Sign In to VVCE Events Hub →
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
                  <h2 className="font-black text-slate-800 text-xl mb-1">Verification Failed</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {errorMsg || 'This link is invalid or has already been used.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Link to="/login"
                    className="block w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all">
                    Back to Sign In
                  </Link>
                  <p className="text-xs text-slate-400">
                    Already verified?{' '}
                    <Link to="/login" className="text-amber-500 hover:underline font-medium">Try logging in</Link>
                  </p>
                </div>
              </div>
            )}

            {/* NO TOKEN */}
            {status === 'no-token' && (
              <div className="space-y-4">
                <div className="text-5xl">🔗</div>
                <div>
                  <h2 className="font-black text-slate-800 text-xl mb-1">Missing Token</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    No verification token found. Please use the exact link from your email.
                  </p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all">
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/30 text-xs mt-4">
          VVCE Events Hub · Vidyavardhaka College of Engineering
        </p>
      </div>
    </div>
  )
}
