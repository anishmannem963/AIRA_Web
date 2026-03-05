import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'
import { User, Pencil, Check, X, Flame } from 'lucide-react'
import './Pages.css'

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userAPI.getProfile()
      .then(r => { setProfile(r.data); setForm(r.data) })
      .catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await userAPI.updateProfile({ name: form.name, age: form.age, sex: form.sex, interests: form.interests })
      await refreshUser()
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const p = profile || user

  return (
    <div className="generic-page page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your personal space</p>
      </div>

      <div className="profile-top card">
        <div className="profile-avatar-lg">
          {(p?.username || 'A')[0].toUpperCase()}
        </div>
        <div className="profile-info-main">
          <h2>{p?.username || 'User'}</h2>
          <p>{p?.email || ''}</p>
          {p?.streak_count > 0 && (
            <div className="streak-badge">
              <Flame size={14}/> {p.streak_count} day streak
            </div>
          )}
        </div>
        {!editing ? (
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            <Pencil size={14}/> Edit
          </button>
        ) : (
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? <span className="spinner"/> : <><Check size={14}/> Save</>}
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              <X size={14}/>
            </button>
          </div>
        )}
      </div>

      <div className="profile-fields card" style={{marginTop:16}}>
        <h3 style={{fontSize:'0.85rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:20}}>
          Personal Details
        </h3>
        {[
          { key: 'name', label: 'Name' },
          { key: 'age',  label: 'Age'  },
          { key: 'sex',  label: 'Sex'  },
          { key: 'interests', label: 'Interests' },
        ].map(({ key, label }) => (
          <div key={key} className="profile-field">
            <label>{label}</label>
            {editing ? (
              <input
                value={form[key] || ''}
                onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            ) : (
              <span className="field-value">{p?.[key] || <em className="empty-field">Not set</em>}</span>
            )}
          </div>
        ))}
      </div>

      <button
        className="btn btn-danger"
        style={{marginTop:24, width:'100%', justifyContent:'center'}}
        onClick={async () => { await logout(); window.location.href = '/login' }}
      >
        Log Out
      </button>
    </div>
  )
}
