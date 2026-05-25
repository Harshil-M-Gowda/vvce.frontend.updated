import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Technical','Cultural','Sports','Workshop','Management','Non-Technical','Other']

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  )
}

export default function CreateEvent() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [posterFile, setPosterFile] = useState(null)

  const [form, setForm] = useState({
    name: '', club_name: '', description: '', event_date: '', event_time: '',
    venue: '', max_participants: 100, category: 'Technical',
    gives_aicte_points: false, aicte_points_value: '',
    requires_payment_proof: false,
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())       e.name = 'Event name required'
    if (!form.club_name.trim())  e.club_name = 'Club name required'
    if (!form.event_date)        e.event_date = 'Date required'
    if (!form.event_time)        e.event_time = 'Time required'
    if (!form.venue.trim())      e.venue = 'Venue required'
    if (form.max_participants < 1) e.max_participants = 'Must be at least 1'
    if (form.gives_aicte_points && (!form.aicte_points_value || isNaN(parseInt(form.aicte_points_value))))
      e.aicte_points_value = 'Enter valid AICTE points'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (posterFile) fd.append('poster', posterFile)
      const res = await eventsAPI.create(fd)
      if (res.data.clash_warning?.length) {
        toast.success(`Event created! ⚠️ Clash detected with: ${res.data.clash_warning.map(c=>c.name).join(', ')}`)
      } else {
        toast.success('Event submitted for approval!')
      }
      navigate('/admin/events')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally { setLoading(false) }
  }

  const inputCls = (err) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all
    ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/10'}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-black text-slate-800 text-lg">Create New Event</h2>
          <p className="text-slate-400 text-sm mt-0.5">Fill in the details below. Event will be sent for authority approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Event Name *" error={errors.name}>
              <input value={form.name} onChange={e=>set('name',e.target.value)}
                placeholder="e.g. HackVVCE 2025" className={inputCls(errors.name)} />
            </Field>
            <Field label="Club / Organizer Name *" error={errors.club_name}>
              <input value={form.club_name} onChange={e=>set('club_name',e.target.value)}
                placeholder="e.g. CSE Club" className={inputCls(errors.club_name)} />
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={e=>set('description',e.target.value)}
              placeholder="Describe the event, schedule, prizes, etc."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 resize-none" />
          </Field>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Event Date *" error={errors.event_date}>
              <input type="date" value={form.event_date} onChange={e=>set('event_date',e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls(errors.event_date)} />
            </Field>
            <Field label="Start Time *" error={errors.event_time}>
              <input type="time" value={form.event_time} onChange={e=>set('event_time',e.target.value)}
                className={inputCls(errors.event_time)} />
            </Field>
            <Field label="Max Participants *" error={errors.max_participants}>
              <input type="number" min="1" value={form.max_participants} onChange={e=>set('max_participants',parseInt(e.target.value)||1)}
                className={inputCls(errors.max_participants)} />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Venue *" error={errors.venue}>
              <input value={form.venue} onChange={e=>set('venue',e.target.value)}
                placeholder="e.g. Seminar Hall A" className={inputCls(errors.venue)} />
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={e=>set('category',e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 bg-white">
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* AICTE Points Toggle */}
          <div className={`p-4 rounded-2xl border-2 transition-all
            ${form.gives_aicte_points ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors ${form.gives_aicte_points ? 'bg-amber-400' : 'bg-slate-300'}`}
                onClick={() => set('gives_aicte_points', !form.gives_aicte_points)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${form.gives_aicte_points ? 'left-6' : 'left-1'}`} />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">This event provides AICTE Activity Points</div>
                <div className="text-xs text-slate-500 mt-0.5">Toggle on to award points to participants</div>
              </div>
            </label>
            {form.gives_aicte_points && (
              <div className="mt-3">
                <Field label="AICTE Points Value *" error={errors.aicte_points_value}>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="100" value={form.aicte_points_value}
                      onChange={e=>set('aicte_points_value',e.target.value)}
                      placeholder="e.g. 10"
                      className={`${inputCls(errors.aicte_points_value)} max-w-xs`} />
                    <span className="text-sm text-amber-600 font-bold whitespace-nowrap">⭐ points per student</span>
                  </div>
                </Field>
              </div>
            )}
          </div>

          {/* Future: Payment Proof (UI only, no gateway) */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors ${form.requires_payment_proof ? 'bg-slate-700' : 'bg-slate-300'}`}
                onClick={() => set('requires_payment_proof', !form.requires_payment_proof)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                  ${form.requires_payment_proof ? 'left-6' : 'left-1'}`} />
              </div>
              <div>
                <div className="font-bold text-slate-700 text-sm">Require Payment Proof <span className="text-[10px] text-slate-400 font-normal ml-1">(Future feature — no payment gateway active)</span></div>
                <div className="text-xs text-slate-400 mt-0.5">Students will need to upload payment screenshot for registration</div>
              </div>
            </label>
          </div>

          {/* Poster Upload */}
          <Field label="Event Poster (optional)">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 cursor-pointer transition-colors bg-slate-50">
              <div className="text-2xl">🖼</div>
              <div>
                <div className="text-sm font-medium text-slate-700">{posterFile ? posterFile.name : 'Upload poster image'}</div>
                <div className="text-xs text-slate-400">PNG, JPG, max 5MB</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e=>setPosterFile(e.target.files[0])} />
            </label>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/admin/events')}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl text-sm font-bold hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 shadow-sm">
              {loading ? 'Submitting…' : 'Submit for Approval →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
