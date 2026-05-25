import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { registrationsAPI, eventsAPI, attendanceAPI } from '../../api'
import { Spinner, EmptyState, Button, Select } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Participants() {
  const { eventId } = useParams()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(eventId || '')
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attendance, setAttendance] = useState({})

  useEffect(() => {
    eventsAPI.list({ limit: 50 }).then(r => {
      setEvents(r.data.data || [])
      if (!selectedEvent && r.data.data.length > 0) setSelectedEvent(String(r.data.data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    setLoading(true)
    registrationsAPI.eventRegs(selectedEvent)
      .then(r => {
        setParticipants(r.data.data || [])
        const a = {}
        ;(r.data.data || []).forEach(p => { a[p.id] = p.attended ?? false })
        setAttendance(a)
      })
      .finally(() => setLoading(false))
  }, [selectedEvent])

  const saveAttendance = async () => {
    setSaving(true)
    try {
      const list = participants.map(p => ({ registration_id: p.id, attended: !!attendance[p.id] }))
      await attendanceAPI.mark({ event_id: parseInt(selectedEvent), attendance_list: list })
      toast.success('Attendance saved!')
    } catch {} finally { setSaving(false) }
  }

  const exportCSV = () => {
    const rows = [['USN','Name','Branch','Year','Section','Team','Status','Attendance']]
    participants.forEach(p => rows.push([p.usn, p.name, p.branch, p.year, p.section, p.team_name || 'Solo', p.status, attendance[p.id] ? 'Present' : 'Absent']))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'participants.csv'; a.click()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select className="input w-full sm:w-64" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          <option value="">Select an event</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!participants.length}>⬇ Export CSV</Button>
          <Button size="sm" onClick={saveAttendance} disabled={saving || !participants.length}>{saving ? 'Saving...' : '💾 Save Attendance'}</Button>
        </div>
      </div>

      {!selectedEvent && <EmptyState icon="👥" title="Select an event" desc="Choose an event above to view participants." />}
      {selectedEvent && loading && <Spinner />}
      {selectedEvent && !loading && participants.length === 0 && <EmptyState icon="🎫" title="No participants yet" />}
      {selectedEvent && !loading && participants.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['USN','Name','Branch','Year','Team','Status','Attendance'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.usn}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-navy">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.branch}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.year}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.team_name || 'Solo'}</td>
                    <td className="px-4 py-3"><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-gold"
                          checked={!!attendance[p.id]}
                          onChange={e => setAttendance(prev => ({ ...prev, [p.id]: e.target.checked }))} />
                        <span className={`text-xs font-semibold ${attendance[p.id] ? 'text-emerald-600' : 'text-red-400'}`}>
                          {attendance[p.id] ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
