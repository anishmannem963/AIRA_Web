import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatAPI, feedbackAPI } from '../services/api'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { Send, Plus, ThumbsUp, ThumbsDown, MessageCircle, ChevronLeft } from 'lucide-react'
import './Chat.css'

function TypingDots() {
  return (
    <div className="bubble aira-bubble typing-bubble">
      <span /><span /><span />
    </div>
  )
}

export default function Chat() {
  const { sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [activeId, setActiveId] = useState(routeSessionId || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Load sessions list
  useEffect(() => {
    chatAPI.getSessions()
      .then(r => setSessions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
  }, [])

  // Load history when session changes
  useEffect(() => {
    if (!activeId) return
    setLoadingHistory(true)
    chatAPI.getHistory(activeId)
      .then(r => setMessages(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Could not load messages'))
      .finally(() => setLoadingHistory(false))
  }, [activeId])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const newSession = async () => {
    try {
      const { data } = await chatAPI.newSession()
      const id = data.session_id || data._id
      setSessions(s => [data, ...s])
      setActiveId(id)
      setMessages([])
      navigate(`/chat/${id}`, { replace: true })
    } catch { toast.error('Failed to create session') }
  }

  const selectSession = (id) => {
    setActiveId(id)
    navigate(`/chat/${id}`, { replace: true })
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return
    if (!activeId) { await newSession(); return }

    const optimistic = {
      _id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(m => [...m, optimistic])
    setInput('')
    setSending(true)
    inputRef.current?.focus()

    try {
      const { data } = await chatAPI.send(activeId, text)
      setMessages(m => [...m, data])
    } catch { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const submitFeedback = async (msgId, type) => {
    if (!activeId) return
    try {
      await feedbackAPI.submit(activeId, msgId, type)
      setMessages(m => m.map(msg => msg._id === msgId || msg.response_id === msgId
        ? { ...msg, feedback_type: type } : msg))
      toast.success(type === 'like' ? 'Thanks for the feedback! 💜' : 'Noted, we\'ll improve.')
    } catch {}
  }

  return (
    <div className="chat-layout">
      {/* Sessions Sidebar */}
      <aside className="sessions-panel">
        <div className="sessions-header">
          <span>Sessions</span>
          <button className="btn btn-ghost" style={{padding:'6px 10px', fontSize:'0.8rem'}} onClick={newSession}>
            <Plus size={14}/> New
          </button>
        </div>
        <div className="sessions-list">
          {sessions.length === 0 && (
            <div className="empty-sessions">No sessions yet</div>
          )}
          {sessions.map(s => {
            const id = s.session_id || s._id
            return (
              <button
                key={id}
                className={`session-item ${activeId === id ? 'active' : ''}`}
                onClick={() => selectSession(id)}
              >
                <MessageCircle size={13} />
                <span>{s.session_title || 'Chat Session'}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="chat-area">
        {/* Top bar */}
        <div className="chat-topbar">
          <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={() => navigate('/')}>
            <ChevronLeft size={15}/> Home
          </button>
          <span className="chat-session-title">
            {activeId ? 'Active Session' : 'Select or create a session'}
          </span>
          <button className="btn btn-ghost" style={{padding:'6px 10px', fontSize:'0.8rem'}} onClick={newSession}>
            <Plus size={14}/> New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {!activeId && (
            <div className="chat-empty">
              <div className="chat-empty-orb"><MessageCircle size={28} /></div>
              <h3>Start a conversation</h3>
              <p>AIRA is here to listen, reflect, and support you.</p>
              <button className="btn btn-primary" onClick={newSession}>
                <Plus size={15}/> New Session
              </button>
            </div>
          )}

          {loadingHistory && (
            <div className="chat-loading">
              <div className="spinner" />
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const id = msg._id || msg.response_id || i
            return (
              <div key={id} className={`message-row ${isUser ? 'user-row' : 'aira-row'}`}>
                {!isUser && (
                  <div className="aira-avatar">A</div>
                )}
                <div className={`bubble ${isUser ? 'user-bubble' : 'aira-bubble'}`}>
                  {isUser
                    ? <p>{msg.content}</p>
                    : <ReactMarkdown>{msg.content}</ReactMarkdown>
                  }
                </div>
                {!isUser && (
                  <div className="feedback-row">
                    <button
                      className={`feedback-btn ${msg.feedback_type === 'like' ? 'liked' : ''}`}
                      onClick={() => submitFeedback(id, 'like')}
                    >
                      <ThumbsUp size={12}/>
                    </button>
                    <button
                      className={`feedback-btn ${msg.feedback_type === 'dislike' ? 'disliked' : ''}`}
                      onClick={() => submitFeedback(id, 'dislike')}
                    >
                      <ThumbsDown size={12}/>
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {sending && (
            <div className="message-row aira-row">
              <div className="aira-avatar">A</div>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Message AIRA..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}
