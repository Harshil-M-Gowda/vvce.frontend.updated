import { useState } from 'react'
import { attendanceAPI } from '../../api'
import { Spinner } from '../../components/ui'
import { format } from 'date-fns'
import { Users, MapPin, Clock } from 'lucide-react'

export default function AttendanceView() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [sheetLoading, setSheetLoading] = useState(false)
  const [sheet, setSheet] = useState(null)

  const fetchByDate = async () => {
    setLoading(true)
    try {
      const r = await attendanceAPI.byDate(date)
      setEvents(r.data.data || [])
      setExpanded(null)
    } catch {} finally { setLoading(false) }
  }

  const loadSheet = async (eventId) => {
    if (expanded === eventId) { setExpanded(null); return }
    setExpanded(eventId)
    setSheetLoading(true)
    try {
      const r = await attendanceAPI.eventSheet(eventId)
      setSheet(r.data)
    } catch {} finally { setSheetLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <input type="date" className="input w-48" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={fetchByDate} className="btn-gold px-5 py-2 text-sm rounded-lg font-syne font-bold">
          View Events
        </button>
      </div>

      {loading && <Spinner />}

      {!loading && events.length === 0 && date && (
        <div className="card p-8 text-center">
          <p className="text-slate-400 text-sm">No events on {format(new Date(date), 'MMMM d, yyyy')}</p>
        </div>
      )}

      {events.map(ev => (
        <div key={ev.id} className="card overflow-hidden">
          <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50" onClick={() => loadSheet(ev.id)}>
            <div className="w-10 h-10 rounded-xl bg-navy-gradient flex items-center justify-center text-lg shrink-0">📋</div>
            <div className="flex-1">
              <p className="font-syne font-bold text-navy">{ev.name}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock size={11} />{ev.event_time}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{ev.venue}</span>
                <span className="flex items-center gap-1"><Users size={11} />{ev.present || 0} present / {ev.total_registered || 0} total</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              {ev.total_registered > 0 && (
                <div className="font-syne font-bold text-2xl text-gold">
                  {Math.round(((ev.present || 0) / ev.total_registered) * 100)}%
                </div>
              )}
              <p className="text-xs text-slate-400">{expanded === ev.id ? '▲ Hide' : '▼ View'} attendance</p>
            </div>
          </div>

          {expanded === ev.id && (
            <div className="border-t border-slate-100">
              {sheetLoading ? <Spinner /> : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {['USN','Name','Branch','Year','Team','Status'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(sheet?.data || []).map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 text-xs font-mono text-slate-400">{p.usn}</td>
                        <td className="px-4 py-3 text-sm font-medium text-navy">{p.student_name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{p.branch}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{p.year}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{p.team_name || 'Solo'}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${p.attended ? 'badge-approved' : 'badge-rejected'}`}>
                            {p.attended ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
