import { useState, useEffect } from 'react'
import { remindersAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Bell, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import './Pages.css'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ text: '', time: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ text: '', time: '' })

  const load = () => remindersAPI.getAll()
    .then(r => setReminders(Array.isArray(r.data) ? r.data : []))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.text.trim()) { toast.error('Please enter reminder text'); return }
    try {
      await remindersAPI.add(form.text.trim(), form.time)
      setForm({ text: '', time: '' })
      await load()
      toast.success('Reminder added! ⏰')
    } catch { toast.error('Failed to add reminder') }
  }

  const remove = async (id) => {
    try {
      await remindersAPI.delete(id)
      await load()
      toast.success('Reminder deleted')
    } catch { toast.error('Failed to delete') }
  }

  const saveEdit = async (id) => {
    try {
      await remindersAPI.update(id, editForm.text, editForm.time)
      setEditId(null)
      await load()
      toast.success('Reminder updated')
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="generic-page page">
      <div className="page-header">
        <h1>Reminders</h1>
        <p>Gentle nudges to keep you on track</p>
      </div>

      <div className="add-row" style={{flexWrap:'wrap', gap:10}}>
        <input
          placeholder="Reminder text..."
          value={form.text}
          onChange={e => setForm(f => ({...f, text: e.target.value}))}
          style={{flex:2, minWidth:160}}
        />
        <input
          type="datetime-local"
          value={form.time}
          onChange={e => setForm(f => ({...f, time: e.target.value}))}
          style={{flex:1, minWidth:160}}
        />
        <button className="btn btn-primary" onClick={add}>
          <Plus size={14}/> Add
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="empty-state card" style={{marginTop:20}}>
          <Bell size={32} color="var(--text-muted)"/>
          <p>No reminders yet. Want a little nudge from me?</p>
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map((r, i) => {
            const id = r._id || r.id || i
            return (
              <div key={id} className="reminder-card card">
                {editId === id ? (
                  <div className="edit-row">
                    <input
                      value={editForm.text}
                      onChange={e => setEditForm(f => ({...f, text: e.target.value}))}
                      style={{flex:2}}
                    />
                    <input
                      type="datetime-local"
                      value={editForm.time}
                      onChange={e => setEditForm(f => ({...f, time: e.target.value}))}
                      style={{flex:1}}
                    />
                    <button className="btn btn-primary" style={{padding:'8px 12px'}} onClick={() => saveEdit(id)}>
                      <Check size={14}/>
                    </button>
                    <button className="btn btn-ghost" style={{padding:'8px 12px'}} onClick={() => setEditId(null)}>
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <div className="reminder-row">
                    <Bell size={15} color="var(--accent)"/>
                    <div className="reminder-info">
                      <p className="reminder-text">{r.generated_reminder}</p>
                      {r.scheduled_time && (
                        <p className="reminder-time">{r.scheduled_time}</p>
                      )}
                    </div>
                    <span className={`reminder-status ${r.status}`}>{r.status || 'pending'}</span>
                    <div className="reminder-actions">
                      <button className="icon-btn" onClick={() => {
                        setEditId(id)
                        setEditForm({ text: r.generated_reminder, time: r.scheduled_time || '' })
                      }}><Pencil size={13}/></button>
                      <button className="icon-btn danger" onClick={() => remove(id)}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
