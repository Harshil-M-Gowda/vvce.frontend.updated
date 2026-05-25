import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'
import { notificationsAPI, eventsAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const PAGE_TITLES = {
  '/dashboard':                    'My Dashboard',
  '/events':                       'Event Feed',
  '/calendar':                     'Calendar',
  '/registrations':                'My Registrations',
  '/certificates':                 'Certificates & AICTE Points',
  '/admin/dashboard':              'Admin Dashboard',
  '/admin/create-event':           'Create New Event',
  '/admin/events':                 'Manage Events',
  '/admin/participants':           'Participants',
  '/authority/dashboard':          'Authority Dashboard',
  '/authority/approvals':          'Event Approvals',
  '/authority/clubs':              'Club Monitor',
  '/authority/clash-detect':       'Clash Detection',
  '/authority/attendance':         'Attendance',
  '/authority/dean-portal':        'Dean Student Welfare Portal',
  '/authority/principal-portal':   'Principal Portal',
}

export default function Layout({ children }) {
  const { user }   = useAuth()
  const location   = useLocation()
  const [notifs, setNotifs]     = useState([])
  const [unread, setUnread]     = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const panelRef = useRef()

  const title = PAGE_TITLES[location.pathname] || 'VVCE Events Hub'

  useEffect(() => {
    notificationsAPI.list().then(r => {
      setNotifs(r.data.data || [])
      setUnread(r.data.unread_count || 0)
    }).catch(() => {})

    if (user?.role === 'authority') {
      eventsAPI.list({ status: 'pending', limit: 1 })
        .then(r => setPendingCount(r.data.pagination?.total || 0))
        .catch(() => {})
    }
  }, [location.pathname, user?.role])

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {})
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x))
    setUnread(u => Math.max(0, u - 1))
  }

  const markAll = async () => {
    await notificationsAPI.markAllRead().catch(() => {})
    setNotifs(n => n.map(x => ({ ...x, is_read: true })))
    setUnread(0)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar pendingCount={pendingCount} />

      {/* Main content — responsive left margin */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-56 transition-all duration-200">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4 md:px-6">
          {/* Mobile spacer for hamburger */}
          <div className="flex items-center gap-3">
            <div className="w-8 lg:w-0 shrink-0" /> {/* spacer for mobile hamburger */}
            <h1 className="font-black text-slate-800 text-base md:text-lg truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Notifications */}
            <div ref={panelRef} className="relative">
              <button onClick={() => setShowNotifs(v => !v)}
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors relative">
                <Bell size={16} className="text-slate-500" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAll} className="text-xs text-amber-600 hover:underline font-medium">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifs.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-8">No notifications yet</p>
                    ) : notifs.map(n => (
                      <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors
                          ${!n.is_read ? 'border-l-2 border-amber-400' : ''}`}>
                        <p className="text-[13px] text-slate-700 leading-snug font-medium">{n.title}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-slate-300 mt-1">
                          {n.created_at ? format(new Date(n.created_at), 'MMM d, h:mm a') : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
              <span className="font-black text-slate-900 text-xs">{user?.name?.[0]}</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
