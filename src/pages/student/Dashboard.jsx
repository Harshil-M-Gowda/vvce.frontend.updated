import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentAPI, eventsAPI, certificatesAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Button, Spinner } from '../../components/ui'
import { format } from 'date-fns'

const StatBadge = ({ icon, value, label, color }) => {
  const colors = {
    gold: 'from-amber-400 to-yellow-500',
    navy: 'from-slate-700 to-slate-900',
    teal: 'from-teal-500 to-cyan-600',
    purple: 'from-purple-500 to-violet-600',
    rose: 'from-rose-500 to-pink-600',
  }
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${colors[color] || colors.navy} opacity-10 translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform`} />
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-3xl text-slate-800 leading-none mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  )
}

const SemPoint = ({ sem, pts, max = 30 }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-400 w-14 shrink-0">{sem}</span>
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700"
        style={{ width: `${Math.min((pts / max) * 100, 100)}%` }} />
    </div>
    <span className="text-xs font-bold text-slate-700 w-8 text-right">{pts}</span>
  </div>
)

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      studentAPI.getProfile().catch(() => null),
      eventsAPI.list({ limit: 4 }).catch(() => ({ data: { data: [] } })),
    ]).then(([p, e]) => {
      setProfile(p?.data?.data || null)
      setEvents(e?.data?.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const pts = profile?.total_points || 0
  const ptsGoal = 100
  const semPts = profile?.semester_points || []
  const stats = profile?.stats || {}
  const skills = profile?.skills || []
  const achievements = profile?.achievements || []
  const interests = Array.isArray(profile?.interests) ? profile.interests : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 mb-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/40" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border-2 border-amber-400/40">
                  <span className="font-black text-2xl text-slate-900">{user?.name?.[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-0.5">Welcome back 👋</p>
              <h2 className="font-black text-white text-2xl md:text-3xl tracking-tight">{user?.name?.split(' ')[0]}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {[profile?.branch, profile?.year, `Sec ${profile?.section}`, profile?.usn].filter(Boolean).map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('profile')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10">
              Edit Profile
            </button>
            <button onClick={() => navigate('/events')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-400/20">
              Browse Events →
            </button>
          </div>
        </div>

        {/* Quick AICTE Points Progress */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-medium">AICTE Activity Points Progress</span>
            <span className="text-amber-400 font-black text-sm">{pts} / {ptsGoal} pts</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((pts / ptsGoal) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 mb-6 shadow-sm border border-slate-100">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'activity', label: '⭐ Activity Points' },
          { key: 'profile', label: '👤 My Profile' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === t.key ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBadge icon="🎫" value={stats.registered_events || 0} label="Registered Events" color="navy" />
            <StatBadge icon="⭐" value={pts} label="AICTE Points" color="gold" />
            <StatBadge icon="🏅" value={stats.certificates || 0} label="Certificates" color="teal" />
            <StatBadge icon="📅" value={stats.upcoming_events || 0} label="Upcoming Events" color="purple" />
          </div>

          {/* Events + Info Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg">Upcoming Events</h3>
                <button onClick={() => navigate('/events')} className="text-sm text-slate-500 hover:text-slate-800 font-medium">View All →</button>
              </div>
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-slate-500 text-sm">No upcoming events. Check back soon!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {events.map(ev => (
                    <div key={ev.id} className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => navigate('/events')}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-amber-400 transition-colors">
                          <span className="text-lg">🎯</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{ev.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ev.event_date ? format(new Date(ev.event_date), 'MMM d, yyyy') : ''}</p>
                          <p className="text-xs text-slate-400 truncate">{ev.venue}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">{ev.category}</span>
                        <span className="text-xs font-bold text-amber-500">{ev.registration_fee > 0 ? `₹${ev.registration_fee}` : 'Free'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Semester Points */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Semester-wise Points</h4>
                {semPts.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">No activity yet</div>
                ) : (
                  <div className="space-y-3">
                    {semPts.map(s => <SemPoint key={s.semester} sem={s.semester} pts={s.points} />)}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {interests.length === 0
                    ? <p className="text-xs text-slate-400">No interests added yet</p>
                    : interests.map(i => (
                      <span key={i} className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-medium">{i}</span>
                    ))
                  }
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY POINTS TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-6 text-slate-900">
              <p className="text-sm font-medium opacity-80">Total AICTE Points</p>
              <p className="font-black text-5xl mt-1">{pts}</p>
              <p className="text-sm opacity-70 mt-1">out of {ptsGoal} goal</p>
              <div className="mt-4 h-2 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((pts / ptsGoal) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Semester-wise Breakdown</h3>
              {semPts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-slate-400 text-sm">No semester data yet. Earn points by participating in events!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {semPts.map(s => <SemPoint key={s.semester} sem={s.semester} pts={s.points} max={30} />)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">How to earn AICTE Points</h3>
            <p className="text-sm text-slate-500 mb-4">Participate in college events to earn AICTE Activity Points for your academic record.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: '🎯', title: 'Technical Events', pts: '5–15 pts' },
                { icon: '🎭', title: 'Cultural Events', pts: '3–10 pts' },
                { icon: '🏆', title: 'Competitions', pts: '10–25 pts' },
              ].map(c => (
                <div key={c.title} className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-slate-700 text-sm">{c.title}</p>
                  <p className="text-xs text-amber-600 font-bold mt-1">{c.pts}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <ProfileEditor profile={profile} user={user} onSaved={setProfile} />
      )}
    </div>
  )
}

// ── Profile Editor Sub-component ──────────────────────────────────────────────
function ProfileEditor({ profile, user, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: profile?.phone || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    achievements: profile?.achievements || [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [achieveInput, setAchieveInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await studentAPI.updateProfile(form)

      if (photoFile) {
        const fd = new FormData(); fd.append('photo', photoFile)
        await studentAPI.uploadPhoto(fd)
      }
      if (resumeFile) {
        const fd = new FormData(); fd.append('resume', resumeFile)
        await studentAPI.uploadResume(fd)
      }

      const updated = await studentAPI.getProfile()
      onSaved(updated.data.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }))
      setSkillInput('')
    }
  }

  const addAchievement = () => {
    if (achieveInput.trim()) {
      setForm(p => ({ ...p, achievements: [...p.achievements, achieveInput.trim()] }))
      setAchieveInput('')
    }
  }

  // Need toast imported inside — use a simple inline notification pattern
  const toast = { success: (m) => alert(`✅ ${m}`), error: (m) => alert(`❌ ${m}`) }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-black text-slate-800 text-lg">Edit Profile</h3>
        <p className="text-slate-400 text-sm mt-1">Keep your profile up to date</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Photo + Resume row */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Profile Photo</label>
            <label className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 cursor-pointer transition-colors bg-slate-50">
              {photoFile ? (
                <img src={URL.createObjectURL(photoFile)} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : profile?.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl">📷</div>
                  <div className="text-[10px] text-slate-400 mt-1">Upload</div>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Resume (PDF)</label>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 cursor-pointer transition-colors bg-slate-50 h-24">
              <div className="text-2xl">📄</div>
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  {resumeFile ? resumeFile.name : profile?.resume_url ? 'Resume uploaded ✓' : 'Upload Resume'}
                </div>
                <div className="text-xs text-slate-400">PDF, max 5MB</div>
              </div>
              <input type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
            <input className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
              value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
            <input type="tel" placeholder="+91 98765 43210"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
              value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">LinkedIn URL</label>
            <input type="url" placeholder="linkedin.com/in/yourname"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
              value={form.linkedin} onChange={e => setForm(p => ({...p, linkedin: e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">GitHub URL</label>
            <input type="url" placeholder="github.com/yourusername"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
              value={form.github} onChange={e => setForm(p => ({...p, github: e.target.value}))} />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio / About</label>
          <textarea rows={3} placeholder="Tell us about yourself..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 resize-none"
            value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Skills</label>
          <div className="flex gap-2 mb-2">
            <input placeholder="Add a skill (e.g. Python, React)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400"
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button onClick={addSkill} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-amber-500 transition-colors">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map(s => (
              <span key={s} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium flex items-center gap-1.5">
                {s}
                <button onClick={() => setForm(p => ({...p, skills: p.skills.filter(x => x !== s)}))}
                  className="text-amber-400 hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Achievements</label>
          <div className="flex gap-2 mb-2">
            <input placeholder="Add an achievement..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400"
              value={achieveInput} onChange={e => setAchieveInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
            <button onClick={addAchievement} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-amber-500 transition-colors">Add</button>
          </div>
          <div className="space-y-2">
            {form.achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-sm">
                <span className="text-amber-500">🏆</span>
                <span className="flex-1 text-slate-700">{a}</span>
                <button onClick={() => setForm(p => ({...p, achievements: p.achievements.filter((_, j) => j !== i)}))}
                  className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl font-bold text-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 shadow-lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
