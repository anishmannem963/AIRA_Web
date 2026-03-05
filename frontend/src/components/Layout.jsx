import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MessageCircle, BookOpen, TrendingUp, Star,
  BookMarked, Bell, User, LogOut, Home, Sparkles
} from 'lucide-react'
import './Layout.css'

const NAV = [
  { to: '/',          icon: Home,          label: 'Home'          },
  { to: '/chat',      icon: MessageCircle, label: 'Chat'          },
  { to: '/journal',   icon: BookOpen,      label: 'Journal'       },
  { to: '/growth',    icon: TrendingUp,    label: 'Mental Growth' },
  { to: '/vision',    icon: Star,          label: 'Vision Board'  },
  { to: '/story',     icon: BookMarked,    label: 'My Story'      },
  { to: '/reminders', icon: Bell,          label: 'Reminders'     },
  { to: '/profile',   icon: User,          label: 'Profile'       },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-orb"><Sparkles size={16} /></div>
          <span className="logo-text">AIRA</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {(user?.username || 'A')[0].toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
