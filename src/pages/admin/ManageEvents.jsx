// ManageEvents.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsAPI, certificatesAPI } from '../../api'
import { Button, Spinner, EmptyState, Modal, Table } from '../../components/ui'
import { format } from 'date-fns'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [certModal, setCertModal] = useState(null) // event object
  const [file, setFile] = useState(null)
  const [pts, setPts] = useState('10')
  const navigate = useNavigate()

  useEffect(() => {
    eventsAPI.list({ status: 'approved', limit: 50 })
      .then(r => setEvents(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleBulkUpload = async () => {
    if (!file || !certModal) return
    const fd = new FormData()
    fd.append('certificate', file)
    fd.append('event_id', certModal.id)
    fd.append('aicte_points', pts)
    try {
      await certificatesAPI.bulkUpload(fd)
      toast.success('Certificates uploaded and students notified!')
      setCertModal(null)
    } catch {}
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate('/admin/create-event')}>+ Create Event</Button>
      </div>

      {events.length === 0
        ? <EmptyState icon="📋" title="No events yet" action={<Button onClick={() => navigate('/admin/create-event')}>Create your first event</Button>} />
        : <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-gradient flex items-center justify-center text-xl shrink-0">
                  {ev.category === 'Technical' ? '💻' : ev.category === 'Cultural' ? '🎭' : ev.category === 'Sports' ? '⚽' : '🎪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-syne font-bold text-navy text-sm">{ev.name}</p>
                  <p className="text-xs text-slate-400">{ev.club_name} · {format(new Date(ev.event_date), 'MMM d, yyyy')} · {ev.venue}</p>
                  <p className="text-xs text-slate-500 mt-1">{ev.registered_count || 0}/{ev.max_participants} registered</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`badge badge-${ev.approval_status}`}>{ev.approval_status}</span>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/participants/${ev.id}`)}>Participants</Button>
                  <Button variant="outline" size="sm" onClick={() => setCertModal(ev)}>
                    <Upload size={13} /> Certificates
                  </Button>
                </div>
              </div>
            ))}
          </div>
      }

      <Modal open={!!certModal} onClose={() => setCertModal(null)} title={`Upload Certificates — ${certModal?.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Upload a single certificate file. It will be distributed to all confirmed registrants.</p>
          <div>
            <label className="label">AICTE Points to Award</label>
            <input className="input" type="number" min="0" value={pts} onChange={e => setPts(e.target.value)} />
          </div>
          <div>
            <label className="label">Certificate File (PDF or Image)</label>
            <div onClick={() => document.getElementById('cert-bulk').click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-gold transition-colors">
              <Upload size={20} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">{file ? file.name : 'Click to upload'}</p>
              <input id="cert-bulk" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>
          <Button className="w-full justify-center" onClick={handleBulkUpload}>Upload & Notify Students</Button>
        </div>
      </Modal>
    </div>
  )
}

export default ManageEvents
