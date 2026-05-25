import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI, principalAPI } from '../../api'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  'Available in Cabin': { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', pulse: true },
  'In Meeting':         { dot: 'bg-blue-500',    bg: 'bg-blue-50 border-blue-200',       text: 'text-blue-700',    pulse: false },
  'Outside Campus':     { dot: 'bg-orange-500',  bg: 'bg-orange-50 border-orange-200',   text: 'text-orange-700',  pulse: false },
  'Busy':               { dot: 'bg-red-500',      bg: 'bg-red-50 border-red-200',         text: 'text-red-700',     pulse: false },
  'Not Available':      { dot: 'bg-slate-400',    bg: 'bg-slate-50 border-slate-200',     text: 'text-slate-500',   pulse: false },
}

function StatCard({ icon, value, label, sub, color, onClick }) {
  const colors = {
    amber: 'border-amber-100 bg-amber-50',
    teal:  'border-teal-100 bg-teal-50',
    navy:  'border-slate-100 bg-white',
    rose:  'border-rose-100 bg-rose-50',
  }
  return (
    <div onClick={onClick}
      className={`rounded-2xl border p-5 ${colors[color] || colors.navy} ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-3xl text-slate-800 leading-none">{value ?? '—'}</div>
      <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  )
}

export default function AuthorityDashboard() {
  const [dash, setDash]     = useState(null)
  const [avail, setAvail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate            = useNavigate()

  useEffect(() => {
    Promise.all([
      usersAPI.authorityDashboard().catch(() => null),
      principalAPI.getAvailability().catch(() => null),
    ]).then(([d, a]) => {
      setDash(d?.data?.data || null)
      setAvail(a?.data?.data || null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  )

  const sc = STATUS_CONFIG[avail?.status] || STATUS_CONFIG['Not Available']

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="⏳" value={dash?.pending_approvals ?? 0} label="Pending Approvals" color="amber"
          onClick={() => navigate('/authority/approvals')}
          sub={<span className="text-amber-600 text-xs font-semibold">Review →</span>} />
        <StatCard icon="📅" value={dash?.events_this_month ?? 0} label="Events This Month" color="teal" />
        <StatCard icon="🏛" value={dash?.active_clubs ?? 0} label="Active Clubs" color="navy" />
        <StatCard icon="👥" value={(dash?.total_participants ?? 0).toLocaleString()} label="Total Participants" color="navy" />
      </div>

      {/* Principal Availability + Quick Nav row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Principal availability live widget */}
        <div className={`rounded-2xl border-2 p-5 ${sc.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-700 text-sm">Principal Availability</h3>
            <button onClick={() => navigate('/authority/principal-portal')}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-medium transition-colors">
              Manage →
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className={`w-4 h-4 rounded-full ${sc.dot}`} />
              {sc.pulse && <div className={`absolute inset-0 rounded-full ${sc.dot} animate-ping opacity-50`} />}
            </div>
            <div>
              <p className={`font-black text-base ${sc.text}`}>{avail?.status || 'Unknown'}</p>
              {avail?.note && <p className="text-xs text-slate-500 mt-0.5 italic">"{avail.note}"</p>}
              {avail?.updated_at && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Updated {format(new Date(avail.updated_at), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon:'✅', label:'Approve Events',   path:'/authority/approvals',       bg:'bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
            { icon:'🏛', label:'Club Monitor',     path:'/authority/clubs',            bg:'bg-blue-50 border-blue-100 hover:border-blue-300' },
            { icon:'⚠️', label:'Clash Detection',  path:'/authority/clash-detect',     bg:'bg-amber-50 border-amber-100 hover:border-amber-300' },
            { icon:'📋', label:'Attendance',       path:'/authority/attendance',       bg:'bg-purple-50 border-purple-100 hover:border-purple-300' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className={`p-4 rounded-xl border text-left transition-all ${a.bg}`}>
              <div className="text-2xl mb-2">{a.icon}</div>
              <p className="font-bold text-slate-700 text-sm leading-tight">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's events schedule */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">
            📅 Today's Events — {format(new Date(), 'MMMM d, yyyy')}
          </h3>
        </div>
        {(!dash?.todays_schedule || dash.todays_schedule.length === 0) ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">☀️</div>
            <p className="text-slate-500 text-sm font-medium">No approved events scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dash.todays_schedule.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="font-bold text-slate-700 text-sm w-20 shrink-0">{s.event_time}</div>
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">{s.venue} · {s.club_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special portals */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon:'🏛', label:'Dean Student Welfare Portal', sub:'Club approvals, event monitoring, clash detection', path:'/authority/dean-portal', gradient:'from-slate-900 to-slate-700', badge:'DEAN' },
          { icon:'🎓', label:'Principal Portal',            sub:'Live availability, schedule management',            path:'/authority/principal-portal', gradient:'from-purple-700 to-violet-700', badge:'PRINCIPAL' },
        ].map(p => (
          <button key={p.label} onClick={() => navigate(p.path)}
            className={`bg-gradient-to-r ${p.gradient} rounded-2xl p-5 text-left hover:shadow-xl transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{p.icon}</span>
              <span className="text-[10px] font-black px-2 py-1 bg-white/20 text-white rounded-lg tracking-wide">{p.badge}</span>
            </div>
            <p className="font-black text-white text-sm">{p.label}</p>
            <p className="text-white/50 text-xs mt-1">{p.sub}</p>
            <p className="text-white/40 text-xs mt-3 group-hover:text-white/70 transition-colors">Enter portal →</p>
          </button>
        ))}
      </div>
    </div>
  )
}
