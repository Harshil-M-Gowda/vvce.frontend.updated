import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

import AuthPage       from './pages/auth/AuthPage'
import VerifyEmail    from './pages/auth/VerifyEmail'
import ResetPassword  from './pages/auth/ResetPassword'
import TeamInvite     from './pages/auth/TeamInvite'

import StudentDashboard from './pages/student/Dashboard'
import EventFeed        from './pages/student/EventFeed'
import CalendarPage     from './pages/student/CalendarPage'
import MyRegistrations  from './pages/student/MyRegistrations'
import Certificates     from './pages/student/Certificates'

import AdminDashboard from './pages/admin/Dashboard'
import CreateEvent    from './pages/admin/CreateEvent'
import ManageEvents   from './pages/admin/ManageEvents'
import Participants   from './pages/admin/Participants'

import AuthorityDashboard from './pages/authority/Dashboard'
import Approvals          from './pages/authority/Approvals'
import ClubMonitor        from './pages/authority/ClubMonitor'
import ClashDetect        from './pages/authority/ClashDetect'
import AttendanceView     from './pages/authority/AttendanceView'
import DeanPortal         from './pages/authority/DeanPortal'
import PrincipalPortal    from './pages/authority/PrincipalPortal'

function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-400/20">
          <span className="font-black text-slate-900 text-lg">VV</span>
        </div>
        <div className="text-white/40 text-sm animate-pulse font-medium">Loading…</div>
      </div>
    </div>
  )
}

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />
  const routes = { student: '/dashboard', admin: '/admin/dashboard', authority: '/authority/dashboard' }
  return <Navigate to={routes[user.role] || '/login'} replace />
}

const wrap = (Component, roles) => (
  <RequireAuth roles={roles}>
    <Layout><Component /></Layout>
  </RequireAuth>
)

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<AuthPage />} />
      <Route path="/verify-email"   element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/team-invite"    element={<TeamInvite />} />
      <Route path="/"               element={<RoleRedirect />} />

      {/* Student */}
      <Route path="/dashboard"     element={wrap(StudentDashboard,['student'])} />
      <Route path="/events"        element={wrap(EventFeed,       ['student'])} />
      <Route path="/calendar"      element={wrap(CalendarPage,    ['student'])} />
      <Route path="/registrations" element={wrap(MyRegistrations, ['student'])} />
      <Route path="/certificates"  element={wrap(Certificates,    ['student'])} />

      {/* Admin */}
      <Route path="/admin/dashboard"         element={wrap(AdminDashboard,['admin'])} />
      <Route path="/admin/create-event"      element={wrap(CreateEvent,   ['admin'])} />
      <Route path="/admin/events"            element={wrap(ManageEvents,  ['admin'])} />
      <Route path="/admin/participants/:eventId?" element={wrap(Participants,['admin'])} />

      {/* Authority */}
      <Route path="/authority/dashboard"          element={wrap(AuthorityDashboard,['authority'])} />
      <Route path="/authority/approvals"          element={wrap(Approvals,         ['authority'])} />
      <Route path="/authority/clubs"              element={wrap(ClubMonitor,       ['authority'])} />
      <Route path="/authority/clash-detect"       element={wrap(ClashDetect,       ['authority','admin'])} />
      <Route path="/authority/attendance"         element={wrap(AttendanceView,    ['authority','admin'])} />
      <Route path="/authority/dean-portal"        element={wrap(DeanPortal,        ['authority'])} />
      <Route path="/authority/principal-portal"   element={wrap(PrincipalPortal,   ['authority'])} />

      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <div className="text-7xl mb-4">🚫</div>
            <h1 className="font-black text-2xl text-slate-800 mb-2">Access Denied</h1>
            <p className="text-slate-500 mb-6">You don't have permission to view this page.</p>
            <a href="/" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors inline-block">
              Go Home
            </a>
          </div>
        </div>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
