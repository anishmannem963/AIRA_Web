// VisionBoard.jsx
import { useState, useEffect } from 'react'
import { visionAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Star, Plus, Loader } from 'lucide-react'
import './Pages.css'

export function VisionBoard() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newGoal, setNewGoal] = useState('')

  const load = () => visionAPI.getGoals()
    .then(r => setGoals(Array.isArray(r.data) ? r.data : []))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!newGoal.trim()) return
    setAdding(true)
    try {
      await visionAPI.addGoal(newGoal.trim())
      setNewGoal('')
      await load()
      toast.success('Goal added! 🌟')
    } catch { toast.error('Failed to add goal') }
    finally { setAdding(false) }
  }

  const COLORS = ['#9b7fe8','#6ec6a0','#e8c47f','#e87f9b','#7fc4e8','#c4a87f','#a8e87f']

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="generic-page page">
      <div className="page-header">
        <h1>Vision Board</h1>
        <p>A space for your dreams, hopes, and future plans — waiting to bloom.</p>
      </div>

      <div className="add-row">
        <input
          placeholder="Add a new goal or dream..."
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{flex:1}}
        />
        <button className="btn btn-primary" onClick={add} disabled={adding || !newGoal.trim()}>
          {adding ? <Loader size={15} className="spin-icon"/> : <><Plus size={15}/> Add</>}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state card" style={{marginTop:20}}>
          <Star size={32} color="var(--text-muted)"/>
          <p>No goals yet. Add a few and let your vision take root!</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((g, i) => (
            <div key={g._id || i} className="goal-tile" style={{'--gc': COLORS[i % COLORS.length]}}>
              <Star size={16} className="goal-star"/>
              <p>{g.goal}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VisionBoard
