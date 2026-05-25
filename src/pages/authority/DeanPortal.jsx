import { useState, useEffect } from 'react'
import { deanAPI, clubsAPI } from '../../api'
import { format } from 'date-fns'

// ── Secondary Password Gate ───────────────────────────────────────────────────
function PasswordGate({ onSuccess }) {
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await deanAPI.verify(pwd)
      if (res.data.success) {
        sessionStorage.setItem('dean_token', res.data.deanToken)
        onSuccess()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied')
    } finally {
      setLoading(false) }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center shadow-2xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-400/20">
            <span className="text-2xl">🏛</span>
          </div>
          <h2 className="font-black text-white text-xl mb-1">Dean Student Welfare</h2>
          <p className="text-slate-400 text-sm mb-6">This portal requires secondary authentication</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter portal password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
              required
            />
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                🚫 {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-amber-400/20 transition-all disabled:opacity-50">
              {loading ? 'Verifying...' : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Stats Card ────────────────────────────────────────────────────────────────
const DeanStatCard = ({ icon, value, label, accent }) => {
  const accents = {
    amber: 'from-amber-400/20 to-yellow-400/10 border-amber-400/20 text-amber-500',
    teal: 'from-teal-400/20 to-cyan-400/10 border-teal-400/20 text-teal-500',
    rose: 'from-rose-400/20 to-pink-400/10 border-rose-400/20 text-rose-500',
    blue: 'from-blue-400/20 to-indigo-400/10 border-blue-400/20 text-blue-500',
  }
  return (
    <div className={`bg-gradient-to-br ${accents[accent] || accents.teal} border rounded-2xl p-5`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-black text-3xl text-slate-800 mb-1">{value ?? '—'}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  )
}

// ── Club Approval Card ────────────────────────────────────────────────────────
function ClubCard({ club, onApprove, onReject }) {
  const [rejReason, setRejReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-800">{club.club_name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{club.club_category} · {club.name}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
            ${club.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              club.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
              'bg-red-100 text-red-700'}`}>
            {club.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
          <div><span className="font-medium text-slate-700">Faculty: </span>{club.faculty_coordinator}</div>
          <div><span className="font-medium text-slate-700">Email: </span>{club.email}</div>
          <div><span className="font-medium text-slate-700">Club Email: </span>{club.club_email}</div>
          <div><span className="font-medium text-slate-700">Phone: </span>{club.phone || 'N/A'}</div>
        </div>
        {club.club_description && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 mb-3">{club.club_description}</p>
        )}
        <p className="text-[10px] text-slate-400">Submitted: {club.submitted_at ? format(new Date(club.submitted_at), 'MMM d, yyyy') : '—'}</p>
      </div>

      {club.status === 'pending' && (
        <div className="px-5 pb-5 flex flex-col gap-2">
          {showReject ? (
            <div className="space-y-2">
              <textarea rows={2} placeholder="Reason for rejection..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 resize-none"
                value={rejReason} onChange={e => setRejReason(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => onReject(club.club_admin_id || club.id, rejReason)}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                  Confirm Reject
                </button>
                <button onClick={() => setShowReject(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => onApprove(club.club_admin_id || club.id)}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
                ✓ Approve
              </button>
              <button onClick={() => setShowReject(true)}
                className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors">
                ✗ Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Dean Portal ──────────────────────────────────────────────────────────
export default function DeanPortal() {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem('dean_token'))
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [pendingClubs, setPendingClubs] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [clashes, setClashes] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    if (!unlocked) return
    loadAll()
  }, [unlocked])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, p, e, c] = await Promise.all([
        deanAPI.getStats().catch(() => null),
        clubsAPI.getPending().catch(() => null),
        deanAPI.getEvents().catch(() => null),
        deanAPI.detectClashes().catch(() => null),
      ])
      setStats(s?.data?.data)
      setPendingClubs(p?.data?.data || [])
      setAllEvents(e?.data?.data || [])
      setClashes(c?.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    const res = await deanAPI.getEvents({ date: dateFilter || undefined, search: searchFilter || undefined }).catch(() => null)
    setAllEvents(res?.data?.data || [])
  }

  const handleApprove = async (clubId) => {
    try {
      await clubsAPI.approve(clubId)
      await loadAll()
    } catch {}
  }

  const handleReject = async (clubId, reason) => {
    try {
      await clubsAPI.reject(clubId, { rejection_reason: reason })
      await loadAll()
    } catch {}
  }

  if (!unlocked) return <PasswordGate onSuccess={() => setUnlocked(true)} />

  const pendingOnly = pendingClubs.filter(c => c.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-amber-400/10 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <span className="text-xl">🏛</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-xl">Dean Student Welfare Portal</h2>
                <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">Authenticated</span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">Exclusive administrative portal</p>
            </div>
          </div>
          <button onClick={() => { sessionStorage.removeItem('dean_token'); setUnlocked(false) }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs font-medium transition-colors">
            🔒 Lock Portal
          </button>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'dashboard', label: '📊 Dashboard', badge: null },
          { key: 'approvals', label: '✅ Club Approvals', badge: pendingOnly.length || null },
          { key: 'events', label: '🗓 Event Monitor' },
          { key: 'clashes', label: '⚠️ Clash Detection', badge: clashes.length || null },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              ${activeSection === s.key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-100'}`}>
            {s.label}
            {s.badge ? (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{s.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DeanStatCard icon="🏛" value={stats?.total_clubs} label="Active Clubs" accent="teal" />
            <DeanStatCard icon="⏳" value={stats?.pending_approvals} label="Pending Approvals" accent="amber" />
            <DeanStatCard icon="📅" value={stats?.upcoming_events} label="Upcoming Events" accent="blue" />
            <DeanStatCard icon="⚠️" value={clashes.length} label="Slot Conflicts" accent="rose" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: '✅', label: 'Review Pending Clubs', action: () => setActiveSection('approvals'), badge: pendingOnly.length },
                { icon: '🗓', label: 'Monitor Events', action: () => setActiveSection('events'), badge: null },
                { icon: '⚠️', label: 'Check Clashes', action: () => setActiveSection('clashes'), badge: clashes.length },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-colors group">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">{a.label}</div>
                    {a.badge ? <div className="text-xs text-red-500 font-bold">{a.badge} item{a.badge !== 1 ? 's' : ''} pending</div> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLUB APPROVALS */}
      {activeSection === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Club Registration Requests</h3>
              <p className="text-sm text-slate-500">{pendingOnly.length} pending approval</p>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : pendingClubs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending club registrations.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingClubs.map(club => (
                <ClubCard key={club.id || club.approval_id} club={club}
                  onApprove={handleApprove} onReject={handleReject} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENT MONITOR */}
      {activeSection === 'events' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Filter by Date</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search Events</label>
              <input type="text" placeholder="Event name..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <button onClick={loadEvents} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-amber-500 transition-colors">
              Search
            </button>
            <button onClick={() => { setDateFilter(''); setSearchFilter(''); loadAll() }}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Clear
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Event', 'Date', 'Venue', 'Organizer', 'Status', 'Registrations'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEvents.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">No events found</td></tr>
                  ) : allEvents.map(ev => (
                    <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">{ev.name}</div>
                        <div className="text-xs text-slate-400">{ev.category}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {ev.event_date ? format(new Date(ev.event_date), 'MMM d, yyyy') : '—'}<br/>
                        <span className="text-slate-400">{ev.event_time}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-28 truncate">{ev.venue}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{ev.organizer_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                          ${ev.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            ev.approval_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'}`}>
                          {ev.approval_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">{ev.registration_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CLASH DETECTION */}
      {activeSection === 'clashes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Event Slot Conflict Detection</h3>
              <p className="text-sm text-slate-500">Events with same date/venue or time overlap</p>
            </div>
            <button onClick={loadAll} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              🔄 Refresh
            </button>
          </div>

          {clashes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-semibold text-slate-700">No conflicts detected</p>
              <p className="text-slate-400 text-sm mt-1">All approved upcoming events have unique slots.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clashes.map((clash, i) => (
                <div key={i} className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <span className="font-bold text-red-600 text-sm">Schedule Conflict Detected</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                      {clash.event_date ? format(new Date(clash.event_date), 'MMM d, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { name: clash.event1_name, venue: clash.event1_venue, time: clash.event_time },
                      { name: clash.event2_name, venue: clash.event2_venue, time: clash.event_time },
                    ].map((ev, j) => (
                      <div key={j} className="p-3 bg-red-50 rounded-xl">
                        <p className="font-semibold text-slate-800 text-sm">{ev.name}</p>
                        <p className="text-xs text-slate-500 mt-1">📍 {ev.venue}</p>
                        <p className="text-xs text-slate-500">🕐 {ev.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
