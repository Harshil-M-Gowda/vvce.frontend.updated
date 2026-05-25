import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app load
  useEffect(() => {
    const token = localStorage.getItem('vvce_token')
    const stored = localStorage.getItem('vvce_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
        // Silently refresh from server
        authAPI.me()
          .then(res => { setUser(res.data.user); localStorage.setItem('vvce_user', JSON.stringify(res.data.user)) })
          .catch(() => logout())
          .finally(() => setLoading(false))
      } catch { logout(); setLoading(false) }
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user: u } = res.data
    localStorage.setItem('vvce_token', token)
    localStorage.setItem('vvce_user', JSON.stringify(u))
    setUser(u)
    toast.success(`Welcome back, ${u.name.split(' ')[0]}!`)
    return u
  }, [])

  const register = useCallback(async (data) => {
    await authAPI.register(data)
    toast.success('Account created! Check your VVCE email to verify.')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vvce_token')
    localStorage.removeItem('vvce_user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('vvce_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
