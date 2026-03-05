import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Journal from './pages/Journal'
import MentalGrowth from './pages/MentalGrowth'
import VisionBoard from './pages/VisionBoard'
import MyStory from './pages/MyStory'
import Reminders from './pages/Reminders'
import Profile from './pages/Profile'
import IntroSession from './pages/IntroSession'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function IntroGuard({ children }) {
  const { user, loading, introCompleted } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!introCompleted) return <Navigate to="/intro" replace />
  return children
}

function AppRoutes() {
  const { user, introCompleted } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      <Route path="/intro" element={
        <ProtectedRoute>
          {introCompleted ? <Navigate to="/" replace /> : <IntroSession />}
        </ProtectedRoute>
      } />

      <Route element={<IntroGuard><Layout /></IntroGuard>}>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/growth" element={<MentalGrowth />} />
        <Route path="/vision" element={<VisionBoard />} />
        <Route path="/story" element={<MyStory />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
