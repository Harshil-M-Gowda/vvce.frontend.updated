import { useState, useEffect } from 'react'
import { principalAPI } from '../../api'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  'Available in Cabin': { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✅', pulse: true },
  'In Meeting':         { color: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    icon: '🤝', pulse: false },
  'Outside Campus':     { color: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',icon: '🚗', pulse: false },
  'Busy':               { color: 'bg-red-500',      text: 'text-red-700',     bg: 'bg-red-50 border-red-200',      icon: '⛔', pulse: false },
  'Not Available':      { color: 'bg-slate-400',    text: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',  icon: '🔕', pulse: false },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG)

function PasswordGate({ onSuccess }) {
  const [pwd, setPwd]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await principalAPI.verify(pwd)
      if (res.data.success) {
        sessionStorage.setItem('principal_token', res.data.principalToken)
        onSuccess()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center shadow-2xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-400/20">
            <span className="text-3xl">🎓</span>
          </div>
          <h2 className="font-black text-white text-xl mb-1">Principal Portal</h2>
          <p className="text-slate-400 text-sm mb-6">Secondary authentication required</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="Enter portal password"
              value={pwd} onChange={e => setPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm" required />
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">🚫 {error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Verifying…' : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ScheduleModal({ row, onSave, onClose }) {
  const [form, setForm] = useState(row || {
    schedule_date: '', start_time: '', end_time: '', purpose: '', location: '', notes: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.schedule_date || !form.start_time || !form.end_time || !form.purpose) {
      toast.error('Date, times, and purpose are required')
      return
    }
    setSaving(true)
    try {
      if (row?.id) {
        await principalAPI.updateSchedule(row.id, form)
      } else {
        await principalAPI.addSchedule(form)
      }
      toast.success(row?.id ? 'Schedule updated' : 'Schedule added')
      onSave()
      onClose()
    } catch {
      toast.error('Failed to save schedule')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{row?.id ? 'Edit Schedule' : 'Add Schedule'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
              <input type="date" value={form.schedule_date}
                onChange={e => setForm(p=>({...p,schedule_date:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose *</label>
              <input type="text" placeholder="Meeting, Class, etc." value={form.purpose}
                onChange={e => setForm(p=>({...p,purpose:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time *</label>
              <input type="time" value={form.start_time}
                onChange={e => setForm(p=>({...p,start_time:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Time *</label>
              <input type="time" value={form.end_time}
                onChange={e => setForm(p=>({...p,end_time:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input type="text" placeholder="Cabin, Seminar Hall, etc." value={form.location}
              onChange={e => setForm(p=>({...p,location:e.target.value}))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea rows={2} placeholder="Additional notes…" value={form.notes}
              onChange={e => setForm(p=>({...p,notes:e.target.value}))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PrincipalPortal() {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem('principal_token'))
  const [tab, setTab]           = useState('availability')
  const [avail, setAvail]       = useState(null)
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading]   = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [schedModal, setSchedModal] = useState(null) // null | {} | row
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    loadData()
  }, [unlocked])

  const loadData = async () => {
    setLoading(true)
    try {
      const [a, s] = await Promise.all([
        principalAPI.getAvailability(),
        principalAPI.getSchedule(),
      ])
      setAvail(a.data.data)
      setStatusNote(a.data.data?.note || '')
      setSchedule(s.data.data || [])
    } finally { setLoading(false) }
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await principalAPI.updateAvailability({ status, note: statusNote })
      setAvail(p => ({ ...p, status, note: statusNote, updated_at: new Date().toISOString() }))
      toast.success(`Status: ${status}`)
    } catch { toast.error('Failed to update') }
    finally { setUpdating(false) }
  }

  const deleteScheduleRow = async (id) => {
    if (!confirm('Delete this schedule entry?')) return
    try {
      await principalAPI.deleteSchedule(id)
      setSchedule(p => p.filter(r => r.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (!unlocked) return <PasswordGate onSuccess={() => setUnlocked(true)} />

  const cfg = STATUS_CONFIG[avail?.status] || STATUS_CONFIG['Not Available']

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-400/20">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-xl">Principal Portal</h2>
                <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">Authenticated</span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">Manage availability and schedule</p>
            </div>
          </div>
          <button onClick={() => { sessionStorage.removeItem('principal_token'); setUnlocked(false) }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs font-medium transition-colors">
            🔒 Lock Portal
          </button>
        </div>
      </div>

      {/* Live Availability Card */}
      <div className={`p-5 rounded-2xl border-2 ${cfg.bg} transition-all`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full ${cfg.color}`} />
            {cfg.pulse && <div className={`absolute inset-0 rounded-full ${cfg.color} animate-ping opacity-60`} />}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Current Status</p>
            <p className={`font-black text-lg ${cfg.text}`}>{cfg.icon} {avail?.status || 'Not Available'}</p>
          </div>
          {avail?.updated_at && (
            <p className="ml-auto text-[11px] text-slate-400">
              Updated {format(new Date(avail.updated_at), 'MMM d, h:mm a')}
            </p>
          )}
        </div>
        {avail?.note && (
          <p className="text-sm text-slate-600 mb-4 italic">"{avail.note}"</p>
        )}
        {/* Note input */}
        <input type="text" placeholder="Optional status note (e.g. Back by 3 PM)…"
          value={statusNote} onChange={e => setStatusNote(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-purple-400 mb-3" />

        {/* Quick buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { label:'✅ Available', status:'Available in Cabin', cls:'bg-emerald-500 text-white hover:bg-emerald-600' },
            { label:'🤝 In Meeting', status:'In Meeting',        cls:'bg-blue-500 text-white hover:bg-blue-600' },
            { label:'🚗 Out of Campus', status:'Outside Campus',  cls:'bg-orange-500 text-white hover:bg-orange-600' },
            { label:'🔕 Not Available', status:'Not Available',   cls:'bg-slate-700 text-white hover:bg-slate-800' },
          ].map(b => (
            <button key={b.status} onClick={() => updateStatus(b.status)} disabled={updating}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${b.cls} disabled:opacity-50 shadow-sm`}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Full status selector */}
        <div className="flex gap-2">
          <select value={avail?.status || ''} onChange={e => updateStatus(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-purple-400">
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => updateStatus(avail?.status || 'Not Available')} disabled={updating}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
            {updating ? '…' : 'Update'}
          </button>
        </div>
      </div>

      {/* Schedule Manager */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Schedule Manager</h3>
            <p className="text-xs text-slate-400 mt-0.5">{schedule.length} item{schedule.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setSchedModal({})}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors">
            + Add Schedule
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : schedule.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-semibold text-slate-600">No schedule entries yet</p>
            <p className="text-sm text-slate-400 mt-1">Add your first schedule entry using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Date','Time','Purpose','Location','Notes',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map(row => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {format(parseISO(row.schedule_date), 'EEE, MMM d yyyy')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {row.start_time} – {row.end_time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 text-xs">{row.purpose}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{row.location || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-40 truncate">{row.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSchedModal(row)}
                          className="px-2 py-1 text-[10px] bg-slate-100 text-slate-600 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors font-medium">
                          Edit
                        </button>
                        <button onClick={() => deleteScheduleRow(row.id)}
                          className="px-2 py-1 text-[10px] bg-slate-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {schedModal !== null && (
        <ScheduleModal
          row={schedModal?.id ? schedModal : null}
          onSave={loadData}
          onClose={() => setSchedModal(null)}
        />
      )}
    </div>
  )
}
