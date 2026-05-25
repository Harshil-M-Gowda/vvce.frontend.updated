import { useEffect, useState, useRef } from 'react'
import { certificatesAPI, certV2API } from '../../api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Upload, Download, Eye, Trash2, CheckCircle, Clock, X } from 'lucide-react'

const CERT_TYPE_LABELS = { platform: 'VVCE Platform', external: 'External / Prior' }

function UploadModal({ onClose, onUploaded }) {
  const [file, setFile]   = useState(null)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handleUpload = async () => {
    if (!file)  { toast.error('Please select a certificate file'); return }
    if (!title) { toast.error('Please enter a title'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('certificate', file)
      fd.append('title', title)
      fd.append('notes', notes)
      await certV2API.uploadExternal(fd)
      toast.success('Certificate uploaded! It will be reviewed by admin.')
      onUploaded()
      onClose()
    } catch { toast.error('Upload failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Upload Certificate</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Certificate Title *</label>
            <input type="text" placeholder="e.g. Hackathon Participation – XYZ 2024"
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
            <textarea rows={2} placeholder="Additional notes about this certificate…"
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">File (PDF / Image) *</label>
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 transition-colors bg-slate-50">
              {file ? (
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-sm font-semibold text-slate-700 px-4 truncate max-w-64">{file.name}</div>
                  <div className="text-xs text-slate-400">{(file.size/1024).toFixed(0)} KB</div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="mx-auto text-slate-300 mb-2" />
                  <div className="text-sm text-slate-500 font-medium">Click to upload</div>
                  <div className="text-xs text-slate-400">PDF or image, max 5MB</div>
                </div>
              )}
              <input type="file" ref={fileRef} accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
          <button onClick={handleUpload} disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl text-sm font-bold hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50">
            {saving ? 'Uploading…' : 'Upload Certificate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CertCard({ cert, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const isExternal = cert.cert_type === 'external'
  const isVerified = cert.is_verified

  const handleDelete = async () => {
    if (!confirm('Delete this certificate?')) return
    setDeleting(true)
    try {
      await certV2API.delete(cert.id)
      toast.success('Certificate deleted')
      onDeleted(cert.id)
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handlePreview = () => {
    if (cert.file_url) window.open(cert.file_url, '_blank')
    else toast.error('File not available for preview')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Type + Status bar */}
      <div className={`h-1.5 w-full ${isExternal ? 'bg-gradient-to-r from-purple-400 to-violet-500' : 'bg-gradient-to-r from-amber-400 to-yellow-500'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${isExternal ? 'bg-purple-100' : 'bg-amber-100'}`}>
              <span className="text-xl">{isExternal ? '📂' : '🏅'}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">{cert.title || cert.event_name || 'Certificate'}</p>
              {cert.event_name && cert.title !== cert.event_name && (
                <p className="text-xs text-slate-400 mt-0.5">{cert.event_name}</p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                  ${isExternal ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                  {CERT_TYPE_LABELS[cert.cert_type] || cert.cert_type}
                </span>
                {isExternal && (
                  <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isVerified ? <><CheckCircle size={9} /> Verified</> : <><Clock size={9} /> Pending</>}
                  </span>
                )}
                {cert.aicte_points > 0 && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-gold-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
                    ⭐ {cert.aicte_points} pts
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {cert.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3 italic">{cert.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {cert.event_date ? format(new Date(cert.event_date), 'MMM d, yyyy') :
              cert.created_at ? format(new Date(cert.created_at), 'MMM d, yyyy') : ''}
          </p>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handlePreview}
              className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
              <Eye size={13} />
            </button>
            {cert.file_url && (
              <a href={cert.file_url} download
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors inline-flex">
                <Download size={13} />
              </a>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 bg-slate-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Certificates() {
  const [certs, setCerts]         = useState([])
  const [points, setPoints]       = useState({ total_points: 0, imported_points: 0, earned_points: 0, history: [], semester_points: [] })
  const [loading, setLoading]     = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter]       = useState('all')

  const load = () => {
    setLoading(true)
    Promise.all([
      certificatesAPI.myCerts(),
      certificatesAPI.myPoints(),
    ]).then(([c, p]) => {
      setCerts(c.data?.data || [])
      setPoints(p.data || { total_points: 0, imported_points: 0, earned_points: 0, history: [], semester_points: [] })
    }).catch(() => {})
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? certs
    : filter === 'platform' ? certs.filter(c => c.cert_type === 'platform')
    : certs.filter(c => c.cert_type === 'external')

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AICTE Points', value: points.total_points, icon: '⭐', color: 'from-amber-400 to-yellow-500', textDark: true },
          { label: 'Earned on Platform', value: points.earned_points, icon: '🏅', color: 'from-slate-700 to-slate-900' },
          { label: 'Imported / Prior',   value: points.imported_points, icon: '📥', color: 'from-purple-500 to-violet-600' },
          { label: 'Certificates',       value: certs.length, icon: '📄', color: 'from-teal-500 to-cyan-600' },
        ].map(card => (
          <div key={card.label} className={`relative bg-gradient-to-br ${card.color} rounded-2xl p-5 overflow-hidden`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`font-black text-3xl ${card.textDark ? 'text-slate-900' : 'text-white'} leading-none`}>{card.value}</div>
            <div className={`text-xs mt-1 font-medium ${card.textDark ? 'text-slate-700' : 'text-white/70'}`}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
          {[['all','All'],['platform','VVCE Platform'],['external','External']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter===k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl text-sm font-bold hover:from-amber-500 hover:to-amber-600 transition-all">
          <Upload size={14} /> Upload Certificate
        </button>
      </div>

      {/* Certificate Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="text-5xl mb-3">🏅</div>
          <p className="font-semibold text-slate-700">No certificates yet</p>
          <p className="text-slate-400 text-sm mt-1">Participate in events or upload your previous certificates.</p>
          <button onClick={() => setShowUpload(true)}
            className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors inline-flex items-center gap-2">
            <Upload size={14} /> Upload External Certificate
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CertCard key={c.id} cert={c} onDeleted={id => setCerts(p => p.filter(x => x.id !== id))} />
          ))}
        </div>
      )}

      {/* Points History */}
      {points.history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">AICTE Points History</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {points.history.map((h, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">⭐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{h.reason}</p>
                  {h.event_name && <p className="text-xs text-slate-400 truncate">{h.event_name}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-amber-600 text-sm">+{h.points}</span>
                  <p className="text-[10px] text-slate-400">
                    {h.created_at ? format(new Date(h.created_at), 'MMM d') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={load} />}
    </div>
  )
}
