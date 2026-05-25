import { useEffect, useState } from 'react'
import { usersAPI } from '../../api'
import { StatCard, Spinner, EmptyState } from '../../components/ui'

export default function ClubMonitor() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersAPI.clubs().then(r => setClubs(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  const totalEvents = clubs.reduce((s, c) => s + parseInt(c.total_events || 0), 0)
  const totalPart   = clubs.reduce((s, c) => s + parseInt(c.total_participants || 0), 0)

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Clubs" value={clubs.length} color="navy" icon="🏛️" />
        <StatCard label="Total Events" value={totalEvents} color="gold" icon="📅" />
        <StatCard label="Total Participants" value={totalPart.toLocaleString()} color="teal" icon="👥" />
      </div>

      {clubs.length === 0
        ? <EmptyState icon="🏛️" title="No clubs found" />
        : <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Club','Total Events','Upcoming','Participants','Last Event'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clubs.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-navy text-sm">{c.club_name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{c.total_events}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{c.upcoming_events}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{parseInt(c.total_participants || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {c.last_event_date ? new Date(c.last_event_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  )
}
