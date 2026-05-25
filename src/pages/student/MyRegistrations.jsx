import { useEffect, useState } from 'react'
import { registrationsAPI } from '../../api'
import { Tabs, Spinner, EmptyState, Button } from '../../components/ui'
import { format } from 'date-fns'
import { MapPin, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyRegistrations() {
  const [data, setData] = useState({ upcoming: [], completed: [] })
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    registrationsAPI.myRegistrations()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this registration?')) return
    try {
      await registrationsAPI.cancel(id)
      toast.success('Registration cancelled')
      load()
    } catch {}
  }

  const list = tab === 'upcoming' ? data.upcoming : data.completed

  return (
    <div>
      <Tabs
        tabs={[
          { label: 'Upcoming', value: 'upcoming', count: data.upcoming.length },
          { label: 'Completed', value: 'completed', count: data.completed.length },
        ]}
        active={tab} onChange={setTab} />

      {loading ? <Spinner /> : list.length === 0
        ? <EmptyState icon={tab === 'upcoming' ? '🎫' : '✅'}
            title={tab === 'upcoming' ? 'No upcoming registrations' : 'No completed events'}
            desc="Browse events and register to see them here."
            action={<Button size="sm" onClick={() => window.location.href='/events'}>Browse Events</Button>} />
        : <div className="space-y-3">
            {list.map(reg => (
              <div key={reg.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-gradient flex items-center justify-center shrink-0 text-xl">
                  {reg.category === 'Technical' ? '💻' : reg.category === 'Cultural' ? '🎭' : reg.category === 'Sports' ? '⚽' : '🎪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-syne font-bold text-navy text-sm">{reg.event_name}</p>
                  <p className="text-xs text-slate-400 mb-2">{reg.club_name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{format(new Date(reg.event_date), 'MMM d, yyyy')} · {reg.event_time}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{reg.venue}</span>
                    {reg.team_name && <span className="flex items-center gap-1"><Users size={11} />Team: {reg.team_name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${tab === 'upcoming' ? 'badge-approved' : 'bg-slate-100 text-slate-500'}`}>
                    {tab === 'upcoming' ? 'Registered' : 'Completed'}
                  </span>
                  {tab === 'upcoming' && (
                    <Button variant="danger" size="sm" onClick={() => cancel(reg.id)}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
