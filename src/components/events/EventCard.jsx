import { useState } from 'react'
import { Heart, Bookmark, Users, MapPin, Clock, Calendar } from 'lucide-react'
import { Button, Modal, Input, Select } from '../ui'
import { registrationsAPI, paymentsAPI } from '../../api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const CAT_COLORS = {
  Technical: 'bg-teal-brand/90', Cultural: 'bg-red-600/90', Sports: 'bg-blue-600/90',
  Workshop: 'bg-orange-600/90', Management: 'bg-purple-600/90', 'Non-Technical': 'bg-slate-600/90', Other: 'bg-slate-500/90',
}
const CAT_BG = {
  Technical: '#0d3a3c', Cultural: '#3c1215', Sports: '#0a2240',
  Workshop: '#2d1a0a', Management: '#1a0a2d', 'Non-Technical': '#1a1a2d',
}
const EMOJIS = { Technical: '💻', Cultural: '🎭', Sports: '⚽', Workshop: '🤖', Management: '📋', 'Non-Technical': '🎤' }

export function EventCard({ event, onRegister, showHighlight, registered }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [regModal, setRegModal] = useState(false)

  const emoji = EMOJIS[event.category] || '🎪'
  const bg = CAT_BG[event.category] || '#0a1628'
  const catColor = CAT_COLORS[event.category] || 'bg-slate-600/90'

  return (
    <>
      <div className={`card overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer
        ${showHighlight ? 'ring-2 ring-gold' : ''}`}>
        {/* Poster */}
        <div className="relative h-44 flex items-center justify-center" style={{ background: bg }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="text-5xl relative z-10">{emoji}</span>
          <span className={`absolute top-3 right-3 text-white text-[10px] font-bold font-syne uppercase px-2 py-1 rounded-full ${catColor}`}>
            {event.category}
          </span>
          {showHighlight && (
            <span className="absolute bottom-2 left-3 bg-gold text-navy text-[10px] font-bold font-syne px-2 py-0.5 rounded">
              ★ Recommended
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-syne font-bold text-navy text-[15px] mb-0.5 leading-tight">{event.name}</h3>
          <p className="text-xs text-slate-400 mb-3">by {event.club_name}</p>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={11} className="shrink-0" />
              {format(new Date(event.event_date), 'EEE, MMM d yyyy')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={11} className="shrink-0" /> {event.event_time}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={11} className="shrink-0" /> {event.venue}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{event.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users size={11} />
              {event.registered_count || 0}/{event.max_participants} seats
              {event.registration_fee > 0 && <span className="ml-2 text-navy font-semibold">₹{event.registration_fee}</span>}
              {event.registration_fee == 0 && <span className="ml-2 text-emerald-600 font-semibold">Free</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setLiked(v => !v)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border transition-all
                  ${liked ? 'bg-red-50 border-red-200 text-red-400' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400'}`}>
                <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => setSaved(v => !v)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all
                  ${saved ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-gold/40 hover:text-gold'}`}>
                <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
              </button>
              {registered
                ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold font-syne rounded-lg border border-emerald-200">✓ Registered</span>
                : <Button size="sm" onClick={() => setRegModal(true)}>Register</Button>
              }
            </div>
          </div>
        </div>
      </div>

      <RegisterModal
        open={regModal}
        onClose={() => setRegModal(false)}
        event={event}
        onSuccess={() => { setRegModal(false); onRegister && onRegister(event.id) }}
      />
    </>
  )
}

function RegisterModal({ open, onClose, event, onSuccess }) {
  const [type, setType] = useState('solo')
  const [teamName, setTeamName] = useState('')
  const [teammates, setTeammates] = useState([''])
  const [step, setStep] = useState('details') // details | payment
  const [payMethod, setPayMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  const addTeammate = () => setTeammates(t => [...t, ''])
  const updateTeammate = (i, v) => setTeammates(t => t.map((x, j) => j === i ? v : x))

  const handleRegister = async () => {
    setLoading(true)
    try {
      if (event.registration_fee > 0) {
        setStep('payment')
        setLoading(false)
        return
      }
      await registrationsAPI.register({
        event_id: event.id,
        team_name: type === 'team' ? teamName : undefined,
        teammates: type === 'team' ? teammates.filter(Boolean) : [],
      })
      toast.success('Registration confirmed! Check your email.')
      onSuccess()
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) msgs.forEach(e => toast.error(e.message))
    } finally { setLoading(false) }
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const payRes = await paymentsAPI.initiate({ event_id: event.id, method: payMethod })
      await paymentsAPI.verify({ payment_id: payRes.data.data.payment_id, gateway_payment_id: 'MOCK_' + Date.now() })
      await registrationsAPI.register({
        event_id: event.id,
        team_name: type === 'team' ? teamName : undefined,
        teammates: type === 'team' ? teammates.filter(Boolean) : [],
      })
      toast.success('Payment successful! Registration confirmed. Receipt sent.')
      onSuccess()
    } catch { } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={step === 'details' ? `Register — ${event?.name}` : 'Complete Payment'}>
      {step === 'details' ? (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
            <div className="font-semibold text-navy">{event?.name}</div>
            <div>{format(new Date(event?.event_date), 'EEE, MMM d')} · {event?.event_time} · {event?.venue}</div>
          </div>

          <Select label="Participation Type" value={type} onChange={e => setType(e.target.value)}>
            <option value="solo">Solo</option>
            <option value="team">Team</option>
          </Select>

          {type === 'team' && (
            <>
              <Input label="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name" />
              <div>
                <label className="label">Teammates (VVCE emails)</label>
                {teammates.map((tm, i) => (
                  <input key={i} className="input mb-2" type="email"
                    value={tm} onChange={e => updateTeammate(i, e.target.value)}
                    placeholder={`teammate${i + 1}@vvce.ac.in`} />
                ))}
                <button onClick={addTeammate} className="text-xs text-gold hover:underline">+ Add teammate</button>
              </div>
            </>
          )}

          {event?.registration_fee > 0 && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Registration Fee</div>
              <div className="font-syne font-extrabold text-2xl text-navy">₹{event.registration_fee}</div>
            </div>
          )}

          <Button className="w-full justify-center" onClick={handleRegister} disabled={loading}>
            {loading ? 'Processing...' : event?.registration_fee > 0 ? 'Proceed to Payment' : 'Confirm Registration'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs text-slate-500">Total Amount</div>
            <div className="font-syne font-extrabold text-3xl text-navy">₹{event?.registration_fee}</div>
          </div>

          <div className="flex gap-2">
            {['upi', 'card', 'netbanking'].map(m => (
              <button key={m} onClick={() => setPayMethod(m)}
                className={`flex-1 py-2 rounded-lg border text-sm font-syne font-semibold capitalize transition-all
                  ${payMethod === m ? 'border-gold bg-gold/10 text-navy' : 'border-slate-200 text-slate-400 hover:border-gold/40'}`}>
                {m === 'upi' ? 'UPI' : m === 'card' ? 'Card' : 'Net Banking'}
              </button>
            ))}
          </div>

          {payMethod === 'upi' && (
            <Input label="UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
          )}
          {payMethod === 'card' && (
            <div className="space-y-3">
              <Input label="Card Number" placeholder="1234 5678 9012 3456" maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Expiry" placeholder="MM/YY" />
                <Input label="CVV" placeholder="•••" maxLength={3} type="password" />
              </div>
            </div>
          )}

          <Button className="w-full justify-center" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${event?.registration_fee}`}
          </Button>
        </div>
      )}
    </Modal>
  )
}
