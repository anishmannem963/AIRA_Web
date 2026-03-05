import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields'); return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match'); return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created! Let\'s get started 💜')
      navigate('/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
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
          <h2>Create your account</h2>
          <p>Begin your wellness journey today.</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <div className="field-wrap">
            <User size={15} className="field-icon" />
            <input placeholder="Username" value={form.username} onChange={set('username')} style={{paddingLeft:38}} />
          </div>
          <div className="field-wrap">
            <Mail size={15} className="field-icon" />
            <input type="email" placeholder="Email address" value={form.email} onChange={set('email')} style={{paddingLeft:38}} />
          </div>
          <div className="field-wrap">
            <Lock size={15} className="field-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              style={{paddingLeft:38, paddingRight:38}}
            />
            <button type="button" className="field-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          <div className="field-wrap">
            <Lock size={15} className="field-icon" />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={set('confirm')}
              style={{paddingLeft:38}}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
