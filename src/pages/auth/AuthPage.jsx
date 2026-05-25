import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { clubsAPI } from '../../api'
import toast from 'react-hot-toast'

const VVCE_DOMAIN = '@vvce.ac.in'
const BRANCHES    = ['CS','IS','EC','ME','CV','EE','AE','CH']
const DEPTS       = ['Computer Science','Information Science','Electronics & Communication','Mechanical','Civil','Electrical','Aeronautical','Chemical']
const INTERESTS   = ['Technical','Non-Technical','Communication','Cultural','Sports','Management','Other']
const CLUB_CATS   = ['Technical','Cultural','Sports','Literary','Social Service','Entrepreneurship','Other']
const AUTH_ROLES  = ['Principal','Vice Principal','Dean Academics','Dean Student Welfare','Faculty','HOD','Other']

function FieldError({ msg }) {
  return msg ? <p className="text-red-500 text-[11px] mt-0.5">{msg}</p> : null
}

function FInput({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}
      <input {...props}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/10'}`} />
      <FieldError msg={error} />
    </div>
  )
}

function FSelect({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}
      <select {...props}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 bg-white">
        {children}
      </select>
    </div>
  )
}

export default function AuthPage() {
  const [tab, setTab]             = useState('login')
  const [signupType, setSignupType] = useState('student')
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState({})
  const { login, register }       = useAuth()
  const navigate                  = useNavigate()

  const [loginData, setLoginData] = useState({ email: '', password: '' })

  const [sd, setSd] = useState({
    name: '', usn: '', email: '', password: '',
    year: '1st Year', semester: 'Sem 1', branch: 'CS', department: 'Computer Science',
    section: 'A', phone: '', interests: [],
    has_prior_points: false, prior_points: '',
  })

  const [cd, setCd] = useState({
    name: '', email: '', password: '',
    club_name: '', club_category: 'Technical',
    faculty_coordinator: '', club_email: '', phone: '', club_description: '',
  })

  const [ad, setAd] = useState({ name: '', email: '', password: '', designation: 'Faculty' })

  const validateEmail = (e) => !e.endsWith(VVCE_DOMAIN) ? 'Only VVCE institutional email IDs allowed' : ''

  const handleLogin = async (e) => {
    e.preventDefault()
    const emailErr = validateEmail(loginData.email)
    if (emailErr) { toast.error(emailErr); return }
    setLoading(true)
    try {
      const user = await login(loginData.email, loginData.password)
      const routes = { student: '/dashboard', admin: '/admin/dashboard', authority: '/authority/dashboard' }
      navigate(routes[user.role] || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleStudentSignup = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!sd.name.trim())  errs.name     = 'Name is required'
    if (!sd.usn.trim())   errs.usn      = 'USN is required'
    if (!sd.phone.trim()) errs.phone    = 'Phone number is required'
    const ee = validateEmail(sd.email)
    if (ee) errs.email = ee
    if (sd.password.length < 8) errs.password = 'Min 8 characters'
    if (sd.has_prior_points && (!sd.prior_points || isNaN(parseInt(sd.prior_points))))
      errs.prior_points = 'Enter a valid number'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await register({
        ...sd,
        role: 'student',
        prior_points: sd.has_prior_points ? parseInt(sd.prior_points) : 0,
      })
      toast.success('Account created! Check your VVCE email to verify.')
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleClubSignup = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!cd.name.trim()) errs.cname = 'Your name required'
    if (!cd.club_name.trim()) errs.club_name = 'Club name required'
    if (!cd.faculty_coordinator.trim()) errs.faculty_coordinator = 'Faculty coordinator required'
    const ee = validateEmail(cd.email)
    if (ee) errs.cemail = ee
    if (cd.password.length < 8) errs.cpassword = 'Min 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await clubsAPI.register(cd)
      toast.success('Club registration submitted! Awaiting Dean Student Welfare approval.')
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  const handleAuthoritySignup = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!ad.name.trim()) errs.aname = 'Name required'
    const ee = validateEmail(ad.email)
    if (ee) errs.aemail = ee
    if (ad.password.length < 8) errs.apassword = 'Min 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await register({ ...ad, role: 'authority' })
      toast.success('Account created! Check your VVCE email to verify.')
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const toggleInterest = (i) => setSd(p => ({
    ...p, interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i]
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-8 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
              <span className="font-black text-slate-900 text-sm">VV</span>
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">VVCE Events Hub</h1>
              <p className="text-white/40 text-[11px]">Vidyavardhaka College of Engineering</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 overflow-y-auto max-h-[78vh]">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
            {[['login','Sign In'],['signup','Register']].map(([k,l]) => (
              <button key={k} onClick={() => { setTab(k); setErrors({}) }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                  ${tab===k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* ── LOGIN ─────────────────────────────────────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <FInput label="VVCE Email" type="email" placeholder="yourname@vvce.ac.in"
                value={loginData.email} onChange={e => setLoginData(p=>({...p,email:e.target.value}))} required />
              <FInput label="Password" type="password" placeholder="••••••••"
                value={loginData.password} onChange={e => setLoginData(p=>({...p,password:e.target.value}))} required />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-black rounded-xl text-sm hover:shadow-lg hover:shadow-amber-400/20 transition-all disabled:opacity-50">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <p className="text-center text-xs text-slate-400">
                <Link to="/forgot-password" className="text-amber-500 hover:underline font-medium">Forgot password?</Link>
              </p>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700">
                ⚠️ Club Admin accounts require approval from Dean Student Welfare before you can log in.
              </div>
            </form>
          )}

          {/* ── SIGNUP ────────────────────────────────────────────────── */}
          {tab === 'signup' && (
            <div>
              {/* Role picker */}
              <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">I am registering as</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { k:'student',   icon:'🎓', label:'Student',     sub:'Attend events' },
                  { k:'club',      icon:'🏛', label:'Club Admin',  sub:'Organize events' },
                  { k:'authority', icon:'👔', label:'Authority',   sub:'Dean / Faculty' },
                ].map(o => (
                  <button key={o.k} type="button" onClick={() => { setSignupType(o.k); setErrors({}) }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all
                      ${signupType===o.k ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                    <div className="text-xl mb-1">{o.icon}</div>
                    <div className="text-xs font-bold text-slate-700">{o.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{o.sub}</div>
                  </button>
                ))}
              </div>

              {/* ── STUDENT SIGNUP ── */}
              {signupType === 'student' && (
                <form onSubmit={handleStudentSignup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="Full Name" placeholder="YOUR NAME" error={errors.name}
                      value={sd.name} onChange={e => setSd(p=>({...p,name:e.target.value.toUpperCase()}))} />
                    <FInput label="USN" placeholder="1VV21CS001" error={errors.usn}
                      value={sd.usn} onChange={e => setSd(p=>({...p,usn:e.target.value.toUpperCase()}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FSelect label="Branch" value={sd.branch} onChange={e => setSd(p=>({...p,branch:e.target.value}))}>
                      {BRANCHES.map(b=><option key={b}>{b}</option>)}
                    </FSelect>
                    <FSelect label="Section" value={sd.section} onChange={e => setSd(p=>({...p,section:e.target.value}))}>
                      {['A','B','C','D'].map(s=><option key={s}>{s}</option>)}
                    </FSelect>
                    <FSelect label="Year" value={sd.year} onChange={e => setSd(p=>({...p,year:e.target.value}))}>
                      {['1st Year','2nd Year','3rd Year','4th Year'].map(y=><option key={y}>{y}</option>)}
                    </FSelect>
                    <FSelect label="Semester" value={sd.semester} onChange={e => setSd(p=>({...p,semester:e.target.value}))}>
                      {['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'].map(s=><option key={s}>{s}</option>)}
                    </FSelect>
                  </div>
                  <FSelect label="Department" value={sd.department} onChange={e => setSd(p=>({...p,department:e.target.value}))}>
                    {DEPTS.map(d=><option key={d}>{d}</option>)}
                  </FSelect>
                  <FInput label="Phone Number" type="tel" placeholder="+91 98765 43210" error={errors.phone}
                    value={sd.phone} onChange={e => setSd(p=>({...p,phone:e.target.value}))} />
                  <FInput label="VVCE Email" type="email" placeholder="yourname@vvce.ac.in" error={errors.email}
                    value={sd.email} onChange={e => setSd(p=>({...p,email:e.target.value}))} />
                  <FInput label="Password (min 8 chars)" type="password" placeholder="••••••••" error={errors.password}
                    value={sd.password} onChange={e => setSd(p=>({...p,password:e.target.value}))} />

                  {/* Interests */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {INTERESTS.map(i => (
                        <button type="button" key={i} onClick={() => toggleInterest(i)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                            ${sd.interests.includes(i) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prior AICTE points */}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sd.has_prior_points}
                        onChange={e => setSd(p=>({...p,has_prior_points:e.target.checked,prior_points:''}))}
                        className="w-4 h-4 rounded accent-amber-500" />
                      <span className="text-sm font-semibold text-slate-700">I have previously earned AICTE points</span>
                    </label>
                    {sd.has_prior_points && (
                      <div>
                        <FInput label="Total AICTE points already earned" type="number" min="0" max="500"
                          placeholder="e.g. 25" error={errors.prior_points}
                          value={sd.prior_points} onChange={e => setSd(p=>({...p,prior_points:e.target.value}))} />
                        <p className="text-[11px] text-amber-700 mt-1">
                          You can also upload previous certificates in the Certificates section after login.
                        </p>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50">
                    {loading ? 'Creating account…' : 'Create Student Account →'}
                  </button>
                  <p className="text-[11px] text-center text-slate-400">Check your VVCE email to verify your account.</p>
                </form>
              )}

              {/* ── CLUB ADMIN SIGNUP ── */}
              {signupType === 'club' && (
                <form onSubmit={handleClubSignup} className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    ⏳ Club accounts require <strong>Dean Student Welfare approval</strong> before you can log in.
                  </div>
                  <FInput label="Your Full Name" placeholder="Club representative name" error={errors.cname}
                    value={cd.name} onChange={e => setCd(p=>({...p,name:e.target.value}))} />
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="Club Name" placeholder="CSE Club" error={errors.club_name}
                      value={cd.club_name} onChange={e => setCd(p=>({...p,club_name:e.target.value}))} />
                    <FSelect label="Category" value={cd.club_category} onChange={e => setCd(p=>({...p,club_category:e.target.value}))}>
                      {CLUB_CATS.map(c=><option key={c}>{c}</option>)}
                    </FSelect>
                  </div>
                  <FInput label="Faculty Coordinator Name" placeholder="Dr. / Prof. Name" error={errors.faculty_coordinator}
                    value={cd.faculty_coordinator} onChange={e => setCd(p=>({...p,faculty_coordinator:e.target.value}))} />
                  <FInput label="Club Email" type="email" placeholder="cseclub@vvce.ac.in"
                    value={cd.club_email} onChange={e => setCd(p=>({...p,club_email:e.target.value}))} />
                  <FInput label="Your VVCE Email" type="email" placeholder="yourname@vvce.ac.in" error={errors.cemail}
                    value={cd.email} onChange={e => setCd(p=>({...p,email:e.target.value}))} />
                  <FInput label="Phone Number" type="tel" placeholder="+91 98765 43210"
                    value={cd.phone} onChange={e => setCd(p=>({...p,phone:e.target.value}))} />
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Club Description</label>
                    <textarea rows={2} placeholder="Brief description of your club…"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-400 resize-none"
                      value={cd.club_description} onChange={e => setCd(p=>({...p,club_description:e.target.value}))} />
                  </div>
                  <FInput label="Password (min 8 chars)" type="password" placeholder="••••••••" error={errors.cpassword}
                    value={cd.password} onChange={e => setCd(p=>({...p,password:e.target.value}))} />
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50">
                    {loading ? 'Submitting…' : 'Submit for Approval →'}
                  </button>
                </form>
              )}

              {/* ── AUTHORITY SIGNUP ── */}
              {signupType === 'authority' && (
                <form onSubmit={handleAuthoritySignup} className="space-y-3">
                  <FInput label="Full Name" placeholder="Dr. / Prof. Name" error={errors.aname}
                    value={ad.name} onChange={e => setAd(p=>({...p,name:e.target.value}))} />
                  <FSelect label="Designation" value={ad.designation} onChange={e => setAd(p=>({...p,designation:e.target.value}))}>
                    {AUTH_ROLES.map(r=><option key={r}>{r}</option>)}
                  </FSelect>
                  <FInput label="VVCE Email" type="email" placeholder="yourname@vvce.ac.in" error={errors.aemail}
                    value={ad.email} onChange={e => setAd(p=>({...p,email:e.target.value}))} />
                  <FInput label="Password (min 8 chars)" type="password" placeholder="••••••••" error={errors.apassword}
                    value={ad.password} onChange={e => setAd(p=>({...p,password:e.target.value}))} />
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-black rounded-xl text-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50">
                    {loading ? 'Creating…' : 'Create Authority Account →'}
                  </button>
                  <p className="text-[11px] text-center text-slate-400">Check your VVCE email to verify your account.</p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
