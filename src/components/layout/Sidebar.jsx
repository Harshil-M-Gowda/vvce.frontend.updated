import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, CalendarDays, Ticket, Award, Rss,
  PlusCircle, ListChecks, Users, CheckSquare, Building2,
  AlertTriangle, ClipboardList, LogOut, Shield, GraduationCap, Menu, X
} from 'lucide-react'

const NAV = {
  student: [
    { label: 'Overview', items: [
      { icon: LayoutDashboard, text: 'Dashboard',    to: '/dashboard' },
      { icon: Rss,            text: 'Event Feed',    to: '/events' },
      { icon: CalendarDays,   text: 'Calendar',      to: '/calendar' },
    ]},
    { label: 'My Account', items: [
      { icon: Ticket, text: 'Registrations', to: '/registrations' },
      { icon: Award,  text: 'Certificates',  to: '/certificates' },
    ]},
  ],
  admin: [
    { label: 'Management', items: [
      { icon: LayoutDashboard, text: 'Dashboard',    to: '/admin/dashboard' },
      { icon: PlusCircle,      text: 'Create Event', to: '/admin/create-event' },
      { icon: ListChecks,      text: 'My Events',    to: '/admin/events' },
      { icon: Users,           text: 'Participants', to: '/admin/participants' },
    ]},
  ],
  authority: [
    { label: 'Overview', items: [
      { icon: LayoutDashboard, text: 'Dashboard',     to: '/authority/dashboard' },
      { icon: CheckSquare,     text: 'Approvals',     to: '/authority/approvals', badge: true },
      { icon: Building2,       text: 'Club Monitor',  to: '/authority/clubs' },
      { icon: AlertTriangle,   text: 'Clash Detect',  to: '/authority/clash-detect' },
      { icon: ClipboardList,   text: 'Attendance',    to: '/authority/attendance' },
    ]},
    { label: 'Special Portals', items: [
      { icon: Shield,          text: 'Dean SW Portal',   to: '/authority/dean-portal',      highlight: 'amber' },
      { icon: GraduationCap,   text: 'Principal Portal', to: '/authority/principal-portal', highlight: 'purple' },
    ]},
  ],
}

function NavItem({ item, pendingCount }) {
  const hColors = {
    amber:  { dot: 'bg-amber-400',  badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/30' },
    purple: { dot: 'bg-purple-400', badge: 'bg-purple-400/20 text-purple-300 border border-purple-400/30' },
  }
  const h = item.highlight ? hColors[item.highlight] : null

  return (
    <NavLink to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-xl text-[13px] font-medium transition-all group
         ${isActive
           ? 'bg-white/10 text-white'
           : 'text-white/50 hover:text-white hover:bg-white/5'
         } ${item.highlight ? 'relative' : ''}`
      }>
      {h && <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1 h-5 ${h.dot} rounded-full`} />}
      <item.icon size={15} className="shrink-0" />
      <span className="flex-1">{item.text}</span>
      {item.badge && pendingCount > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
      )}
      {h && (
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${h.badge}`}>
          {item.highlight === 'amber' ? 'DEAN' : 'PRINC'}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({ pendingCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const sections = NAV[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }
  const roleLabel = { student: 'Student', admin: 'Club Admin', authority: user?.designation || 'Authority' }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20">
          <span className="font-black text-slate-900 text-[12px]">VV</span>
        </div>
        <div>
          <div className="font-black text-white text-[14px] leading-tight">Events Hub</div>
          <div className="text-white/30 text-[10px]">VVCE</div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="ml-auto text-white/40 hover:text-white lg:hidden">
          <X size={18} />
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-2">
          <span className="font-black text-slate-900 text-sm">{user?.name?.[0]}</span>
        </div>
        <div className="font-bold text-white text-[13px] truncate">{user?.name}</div>
        <div className="text-white/40 text-[11px] mt-0.5">{roleLabel[user?.role]}</div>
        {user?.usn && <div className="text-white/25 text-[10px] mt-0.5 font-mono">{user.usn}</div>}
      </div>

      {/* Nav sections */}
      <nav className="py-2 flex-1 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.label} className="mb-1">
            <div className="px-5 pt-3 pb-1 text-[9px] font-black tracking-widest text-white/20 uppercase">{sec.label}</div>
            {sec.items.map(item => (
              <NavItem key={item.to} item={item} pendingCount={pendingCount} />
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-[13px] transition-all">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop fixed, mobile slide-in */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-56 bg-gradient-to-b from-slate-900 to-slate-900 z-50 transition-transform duration-200
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </aside>
    </>
  )
}
