import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      const introCompleted = user?.intro_completed === 1 || user?.intro_completed === true || user?.assessment_flag === 1
      toast.success(`Welcome back, ${user?.username || 'friend'} 💜`)
      navigate(introCompleted ? '/' : '/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-ambient" />
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <div className="auth-orb"><Sparkles size={20} /></div>
          <h1>AIRA</h1>
        </div>
        <div className="auth-headline">
          <h2>Welcome back</h2>
          <p>Your companion has been waiting for you.</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <div className="field-wrap">
            <Mail size={15} className="field-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <div className="field-wrap">
            <Lock size={15} className="field-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 38, paddingRight: 38 }}
            />
            <button type="button" className="field-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
