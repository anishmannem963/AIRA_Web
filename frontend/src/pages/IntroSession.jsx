import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Send, Sparkles } from 'lucide-react'
import './Intro.css'

export default function IntroSession() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [started, setStarted] = useState(false)
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!started) {
      setStarted(true)
      chatAPI.startIntro()
        .then(r => {
          const msg = r.data?.message || r.data?.content || ''
          if (msg) setMessages([{ role: 'assistant', content: msg }])
        })
        .catch(() => toast.error('Could not start introduction'))
    }
  }, [started])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setSending(true)
    try {
      const { data } = await chatAPI.send(null, text, true)
      const reply = data?.message || data?.content || ''
      if (reply) setMessages(m => [...m, { role: 'assistant', content: reply }])
      if (data?.intro_completed === true || data?.intro_completed === 1) {
        toast.success('Introduction complete! Welcome to AIRA 💜')
        await refreshUser()
        setTimeout(() => navigate('/'), 1200)
      }
    } catch { toast.error('Something went wrong') }
    finally { setSending(false) }
  }

  return (
    <div className="intro-page">
      <div className="intro-ambient" />
      <div className="intro-container">
        <div className="intro-header">
          <div className="intro-orb"><Sparkles size={18}/></div>
          <div>
            <h2>Getting to know you</h2>
            <p>AIRA would love to understand you better before we begin.</p>
          </div>
        </div>

        <div className="intro-messages">
          {messages.map((m, i) => (
            <div key={i} className={`intro-msg ${m.role === 'user' ? 'user' : 'aira'}`}>
              {m.role === 'assistant' && <div className="intro-avatar">A</div>}
              <div className="intro-bubble">{m.content}</div>
            </div>
          ))}
          {sending && (
            <div className="intro-msg aira">
              <div className="intro-avatar">A</div>
              <div className="intro-bubble typing">
                <span/><span/><span/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="intro-input-bar">
          <input
            placeholder="Tell AIRA about yourself..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            style={{flex:1}}
          />
          <button className="send-btn" onClick={send} disabled={!input.trim() || sending}>
            <Send size={15}/>
          </button>
        </div>
      </div>
    </div>
  )
}
