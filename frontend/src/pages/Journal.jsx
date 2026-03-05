import { useState, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { BookOpen, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import './Pages.css'

export default function Journal() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [messages, setMessages] = useState({})
  const [loadingMsgs, setLoadingMsgs] = useState({})

  useEffect(() => {
    chatAPI.getSessions()
      .then(r => setSessions(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (messages[id]) return
    setLoadingMsgs(s => ({...s, [id]: true}))
    try {
      const { data } = await chatAPI.getHistory(id)
      setMessages(s => ({...s, [id]: Array.isArray(data) ? data : []}))
    } catch {}
    finally { setLoadingMsgs(s => ({...s, [id]: false})) }
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="generic-page page">
      <div className="page-header">
        <h1>Journal</h1>
        <p>Your conversations, automatically saved day by day</p>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state card">
          <BookOpen size={32} color="var(--text-muted)"/>
          <p>No journal entries yet. Start a chat with AIRA to begin.</p>
        </div>
      ) : (
        <div className="journal-list">
          {sessions.map((s, i) => {
            const id = s.session_id || s._id || i
            const isOpen = expanded === id
            return (
              <div key={id} className={`journal-entry card ${isOpen ? 'open' : ''}`}>
                <button className="journal-header" onClick={() => toggle(id)}>
                  <div className="journal-meta">
                    <MessageCircle size={15} color="var(--accent)"/>
                    <div>
                      <p className="journal-title">{s.session_title || `Session ${i + 1}`}</p>
                      {s.created_at && (
                        <p className="journal-date">{new Date(s.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                </button>

                {isOpen && (
                  <div className="journal-messages">
                    {loadingMsgs[id] ? (
                      <div style={{padding:'20px', display:'flex', justifyContent:'center'}}>
                        <div className="spinner"/>
                      </div>
                    ) : (messages[id] || []).map((msg, j) => (
                      <div key={j} className={`journal-msg ${msg.role}`}>
                        <span className="journal-role">{msg.role === 'user' ? 'You' : 'AIRA'}</span>
                        <p>{msg.content}</p>
                      </div>
                    ))}
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
