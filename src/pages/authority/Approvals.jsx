// Approvals.jsx
import { useEffect, useState } from 'react'
import { eventsAPI } from '../../api'
import { Button, Spinner, EmptyState, Modal, Textarea } from '../../components/ui'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Approvals() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [actionType, setActionType] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = () => {
    setLoading(true)
    eventsAPI.list({ status: 'pending', limit: 50 })
      .then(r => setEvents(r.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openModal = (ev, action) => { setModal(ev); setActionType(action); setRemarks('') }

  const handleAction = async () => {
    setProcessing(true)
    try {
      await eventsAPI.approve(modal.id, { status: actionType, remarks })
      toast.success(`Event ${actionType} successfully`)
      setModal(null)
      load()
    } catch {} finally { setProcessing(false) }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="text-slate-500 text-sm mb-5">{events.length} event(s) pending approval</p>
      {events.length === 0
        ? <EmptyState icon="✅" title="All clear!" desc="No events pending approval." />
        : <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-syne font-bold text-navy">{ev.name}</p>
                    <span className="badge badge-pending">Pending</span>
                  </div>
                  <p className="text-sm text-slate-500">{ev.club_name} · {format(new Date(ev.event_date), 'EEE, MMM d yyyy')} · {ev.event_time}</p>
                  <p className="text-sm text-slate-500">📍 {ev.venue} · {ev.max_participants} seats · {ev.registration_fee > 0 ? `₹${ev.registration_fee}` : 'Free'}</p>
                  {ev.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ev.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="success" size="sm" onClick={() => openModal(ev, 'approved')}>✓ Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => openModal(ev, 'rejected')}>✗ Reject</Button>
                  <Button variant="outline" size="sm" onClick={() => openModal(ev, 'changes_requested')}>↩ Changes</Button>
                </div>
              </div>
            ))}
          </div>
      }

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={`${actionType === 'approved' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Request Changes for'} — ${modal?.name}`}>
        <div className="space-y-4">
          <Textarea label="Remarks (optional)" value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Add any notes or feedback for the organizer..." />
          <div className="flex gap-3">
            <Button
              variant={actionType === 'approved' ? 'success' : actionType === 'rejected' ? 'danger' : 'outline'}
              className="flex-1 justify-center"
              onClick={handleAction} disabled={processing}>
              {processing ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : actionType === 'rejected' ? 'Rejection' : 'Changes Request'}`}
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


