// CalendarPage.jsx
import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { eventsAPI } from '../../api'
import { format, isSameDay } from 'date-fns'
import { MapPin, Clock } from 'lucide-react'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [allEvents, setAllEvents] = useState([])

  useEffect(() => {
    eventsAPI.list({ limit: 100 }).then(r => setAllEvents(r.data.data || [])).catch(() => {})
  }, [])

  const eventsOnDate = (date) => allEvents.filter(ev => isSameDay(new Date(ev.event_date), date))
  const selected = eventsOnDate(selectedDate)

  const tileContent = ({ date }) => {
    const has = eventsOnDate(date).length > 0
    return has ? <div className="w-1.5 h-1.5 bg-gold rounded-full mx-auto mt-0.5" /> : null
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card p-5">
        <h2 className="font-syne font-bold text-navy mb-4">Event Calendar</h2>
        <Calendar
          onChange={setSelectedDate} value={selectedDate}
          tileContent={tileContent}
          className="w-full border-0 font-dm" />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 bg-gold rounded-full" />
          <span>Dots indicate events on that date</span>
        </div>
      </div>

      <div>
        <h3 className="font-syne font-bold text-navy mb-3">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        {selected.length === 0
          ? <div className="card p-6 text-center"><p className="text-slate-400 text-sm">No events on this date</p></div>
          : selected.map(ev => (
            <div key={ev.id} className="card p-4 mb-3 border-l-4 border-l-gold">
              <p className="font-syne font-bold text-navy text-sm mb-1">{ev.name}</p>
              <p className="text-xs text-slate-400 mb-2">{ev.club_name}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock size={11} />{ev.event_time}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={11} />{ev.venue}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

