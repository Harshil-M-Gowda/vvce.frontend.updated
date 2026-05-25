// ClashDetect.jsx
import { useState } from 'react'
import { eventsAPI } from '../../api'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function ClashDetect() {
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!date) return
    setLoading(true)
    try {
      const r = await eventsAPI.clashCheck({ date, venue: venue || undefined })
      setResult(r.data)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl">
      <p className="text-slate-500 text-sm mb-6">Check if a proposed date and venue has any scheduling conflicts before approving or creating an event.</p>
      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Select Date *</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Venue (optional — leave blank to check all venues)</label>
          <input className="input" value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Seminar Hall A" />
        </div>
        <button onClick={check} disabled={!date || loading}
          className="btn-gold px-6 py-2.5 text-sm rounded-lg font-syne font-bold disabled:opacity-50">
          {loading ? 'Checking...' : '🔍 Check for Conflicts'}
        </button>

        {result && (
          <div className={`rounded-xl p-4 border ${result.hasClash ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            {result.hasClash ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <p className="font-semibold text-amber-700">{result.events.length} conflict(s) found on this date</p>
                </div>
                {result.events.map((ev, i) => (
                  <div key={i} className="ml-6 text-sm text-amber-600 mb-1">
                    • <strong>{ev.name}</strong> at {ev.event_time} — {ev.venue} ({ev.club_name})
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <p className="font-semibold text-emerald-700">✅ No conflicts — this date{venue ? ' and venue are' : ' is'} available!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClashDetect
