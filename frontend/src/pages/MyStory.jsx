import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'
import { BookMarked, RefreshCw } from 'lucide-react'
import './Pages.css'

export default function MyStory() {
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)

  const generate = async () => {
    setLoading(true)
    try {
      const { data } = await userAPI.generateStory()
      setStory(data.story || data.content || '')
    } catch { toast.error('Could not generate story') }
    finally { setLoading(false) }
  }

  useEffect(() => { generate() }, [])

  return (
    <div className="generic-page page">
      <div className="page-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div>
          <h1>My Story</h1>
          <p>Written by You, Guided by Dreams</p>
        </div>
        <button className="btn btn-ghost" onClick={generate} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''}/> Regenerate
        </button>
      </div>

      {loading ? (
        <div className="page-loading" style={{height:'40vh'}}><div className="spinner"/></div>
      ) : (
        <div className="story-card card">
          <div className="story-badge"><BookMarked size={13}/> This story will evolve as you do</div>
          <p className="story-text">{story || 'Your story is being written one conversation at a time...'}</p>
        </div>
      )}
    </div>
  )
}
