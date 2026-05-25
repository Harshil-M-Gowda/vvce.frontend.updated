import { useEffect, useState, useCallback } from 'react'
import { eventsAPI, registrationsAPI } from '../../api'
import { EventCard } from '../../components/events/EventCard'
import { Spinner, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { Search, Filter } from 'lucide-react'

const CATS = ['', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Management', 'Non-Technical']

export default function EventFeed() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [registeredIds, setRegisteredIds] = useState(new Set())

  const interests = user?.interests ? JSON.parse(user.interests) : []
  const techInterest = interests.some(i => i.toLowerCase().includes('technical'))

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const [evRes, regRes] = await Promise.all([
        eventsAPI.list({ search, category, page, limit: 9 }),
        registrationsAPI.myRegistrations(),
      ])
      setEvents(evRes.data.data || [])
      setPagination(evRes.data.pagination)
      const ids = new Set([
        ...(regRes.data.upcoming || []).map(r => r.event_id),
        ...(regRes.data.completed || []).map(r => r.event_id),
      ])
      setRegisteredIds(ids)
    } finally { setLoading(false) }
  }, [search, category, page])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchEvents, 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search events, clubs, descriptions..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select className="input pl-9 pr-8 w-full sm:w-44"
            value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            {CATS.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>
      </div>

      {/* Interest banner */}
      {techInterest && !category && !search && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
          <span className="text-xl">⭐</span>
          <p className="text-sm text-navy font-medium">Events matching your <strong>Technical</strong> interest are highlighted</p>
        </div>
      )}

      {loading
        ? <Spinner />
        : events.length === 0
          ? <EmptyState icon="🔍" title="No events found" desc="Try a different search or filter." />
          : <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map(ev => (
                  <EventCard key={ev.id} event={ev}
                    showHighlight={techInterest && ev.category === 'Technical'}
                    registered={registeredIds.has(ev.id)}
                    onRegister={id => setRegisteredIds(prev => new Set([...prev, id]))} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-syne font-semibold disabled:opacity-40 hover:border-navy transition-colors">
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
                  <button disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-syne font-semibold disabled:opacity-40 hover:border-navy transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
      }
    </div>
  )
}
