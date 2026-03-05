import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatAPI, userAPI, sentimentAPI } from '../services/api'
import toast from 'react-hot-toast'
import { MessageCircle, TrendingUp, Star, BookMarked, Bell, Flame, Zap } from 'lucide-react'
import './Home.css'

const QUICK_LINKS = [
  { to: '/chat',      icon: MessageCircle, label: 'New Chat',      desc: 'Talk to AIRA',         color: '#9b7fe8' },
  { to: '/growth',    icon: TrendingUp,    label: 'Mental Growth', desc: 'Track your wellness',  color: '#6ec6a0' },
  { to: '/vision',    icon: Star,          label: 'Vision Board',  desc: 'Your goals',           color: '#e8c47f' },
  { to: '/story',     icon: BookMarked,    label: 'My Story',      desc: 'Your journey',         color: '#e87f9b' },
  { to: '/reminders', icon: Bell,          label: 'Reminders',     desc: 'Daily nudges',         color: '#7fc4e8' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [motivation, setMotivation] = useState('')
  const [latestScore, setLatestScore] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    userAPI.getMotivation().then(r => setMotivation(r.data?.message || r.data?.motivation || '')).catch(() => {})
    sentimentAPI.getAll().then(r => {
      const data = Array.isArray(r.data) ? r.data : []
      if (data.length) setLatestScore(data[data.length - 1]?.mental_score)
    }).catch(() => {})
  }, [])

  const startChat = async () => {
    setCreating(true)
    try {
      const { data } = await chatAPI.newSession()
      navigate(`/chat/${data.session_id || data._id}`)
    } catch { toast.error('Could not start session') }
    finally { setCreating(false) }
  }

  return (
    <div className="home-page page">
      {/* Ambient bg */}
      <div className="home-ambient" />

      {/* Header */}
      <header className="home-header">
        <div>
          <p className="home-greeting">{greeting()},</p>
          <h1 className="home-name">{user?.username || 'Friend'} <span className="wave">👋</span></h1>
        </div>
        <div className="header-score">
          {latestScore !== null && (
            <div className="score-pill">
              <Zap size={13} />
              <span>Score: {typeof latestScore === 'number' ? latestScore.toFixed(1) : latestScore}</span>
            </div>
          )}
        </div>
      </header>

      {/* Hero CTA */}
      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-aira-badge">
            <div className="aira-pulse" />
            <span>AIRA is here for you</span>
          </div>
          <h2>How are you feeling<br/><em>today?</em></h2>
          <p>Let's take on each day together, one meaningful conversation at a time.</p>
          <button className="btn btn-primary hero-btn" onClick={startChat} disabled={creating}>
            {creating ? <span className="spinner" /> : <><MessageCircle size={16}/> Start a new session</>}
          </button>
        </div>
        <div className="hero-visual">
          <div className="orb-ring" />
          <div className="orb-inner">
            <Flame size={32} color="#9b7fe8" />
          </div>
        </div>
      </div>

      {/* Motivation card */}
      {motivation && (
        <div className="motivation-card fade-in">
          <div className="motivation-label"><Zap size={12} /> Today's motivation</div>
          <p className="motivation-text">"{motivation}"</p>
        </div>
      )}

      {/* Quick links */}
      <section>
        <h3 className="section-title">Quick Access</h3>
        <div className="quick-grid">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc, color }) => (
            <button key={to} className="quick-card" onClick={() => navigate(to)}>
              <div className="quick-icon" style={{ '--qc': color }}>
                <Icon size={18} />
              </div>
              <div className="quick-text">
                <span className="quick-label">{label}</span>
                <span className="quick-desc">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
