import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../../api'
import { StatCard, SectionHeader, Button, Spinner } from '../../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    usersAPI.adminDashboard().then(r => setDash(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const ev = dash?.events || {}
  const monthly = dash?.monthly_registrations || []

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={ev.total || 0} color="navy" icon="📅" />
        <StatCard label="Approved Events" value={ev.approved || 0} color="teal" icon="✅" />
        <StatCard label="Pending Approval" value={ev.pending || 0} sub="Awaiting" color="gold" icon="⏳" />
        <StatCard label="Total Registrations" value={dash?.total_registrations || 0} color="navy" icon="👥" />
      </div>

      {/* AICTE info banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs mb-1">Platform Mode</p>
          <p className="font-black text-2xl text-amber-400">Free Events Only</p>
          <p className="text-white/40 text-xs mt-1">Payment gateway not active — all events are free to register</p>
        </div>
        <div className="text-4xl">🎟</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card p-5">
          <SectionHeader title="Registrations (Last 6 Months)" />
          {monthly.length === 0
            ? <p className="text-center text-slate-400 text-sm py-10">No data available</p>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8fa3b1' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8fa3b1' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 }} />
                  <Bar dataKey="count" fill="#f0a500" radius={[6,6,0,0]} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Create Event', icon: '➕', path: '/admin/create-event' },
              { label: 'Manage Events', icon: '📋', path: '/admin/events' },
              { label: 'View Participants', icon: '👥', path: '/admin/participants' },
              { label: 'Clash Detect', icon: '⚠️', path: '/authority/clash-detect' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="p-4 rounded-xl border border-slate-100 hover:border-gold/40 hover:bg-gold/5 transition-all text-left">
                <div className="text-2xl mb-2">{a.icon}</div>
                <p className="font-syne font-semibold text-navy text-sm">{a.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
