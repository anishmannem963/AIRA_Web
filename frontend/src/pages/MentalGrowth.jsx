import { useState, useEffect } from 'react'
import { sentimentAPI } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { TrendingUp, Brain, Zap, AlertCircle } from 'lucide-react'
import './MentalGrowth.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      <p className="tooltip-score">Score: <strong>{payload[0].value?.toFixed(1)}</strong></p>
    </div>
  )
}

function scoreLabel(s) {
  if (s >= 7) return { label: 'Good', color: '#6ec6a0' }
  if (s >= 4) return { label: 'Moderate', color: '#e8c47f' }
  return { label: 'Low', color: '#e87f9b' }
}

export default function MentalGrowth() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sentimentAPI.getAll()
      .then(r => setData(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = data.map(d => ({
    date: d.date ? d.date.slice(0, 10) : '',
    score: typeof d.mental_score === 'number' ? d.mental_score : parseFloat(d.mental_score) || 0,
  }))

  const latest = data[data.length - 1]
  const avg = data.length
    ? (data.reduce((a, b) => a + (b.mental_score || 0), 0) / data.length).toFixed(1)
    : null
  const trend = data.length >= 2
    ? data[data.length-1].mental_score > data[data.length-2].mental_score ? 'improving' : 'declining'
    : null

  if (loading) return (
    <div className="page-loading"><div className="spinner" /></div>
  )

  return (
    <div className="mental-page page">
      <div className="page-header">
        <div>
          <h1>Mental Growth</h1>
          <p>Track your emotional wellness journey over time</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {avg && (
          <div className="stat-card">
            <Brain size={18} className="stat-icon" style={{color:'#9b7fe8'}} />
            <div>
              <p className="stat-val">{avg}</p>
              <p className="stat-label">Average Score</p>
            </div>
          </div>
        )}
        {latest && (
          <div className="stat-card">
            <Zap size={18} className="stat-icon" style={{color: scoreLabel(latest.mental_score).color}} />
            <div>
              <p className="stat-val" style={{color: scoreLabel(latest.mental_score).color}}>
                {scoreLabel(latest.mental_score).label}
              </p>
              <p className="stat-label">Current State</p>
            </div>
          </div>
        )}
        {trend && (
          <div className="stat-card">
            <TrendingUp size={18} className="stat-icon"
              style={{color: trend==='improving' ? '#6ec6a0' : '#e87f9b'}} />
            <div>
              <p className="stat-val" style={{color: trend==='improving' ? '#6ec6a0' : '#e87f9b'}}>
                {trend === 'improving' ? '↑ Improving' : '↓ Declining'}
              </p>
              <p className="stat-label">Recent Trend</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="chart-card card">
          <h3 className="chart-title">Wellness Score Timeline</h3>
          <div style={{height: 240}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{top:10, right:10, left:-20, bottom:0}}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#9b7fe8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9b7fe8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{fill:'#5c5878', fontSize:11}} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{fill:'#5c5878', fontSize:11}} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#9b7fe8"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  dot={{ fill: '#9b7fe8', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#9b7fe8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="empty-state card">
          <AlertCircle size={32} color="var(--text-muted)" />
          <p>No sentiment data yet. Chat with AIRA to start tracking.</p>
        </div>
      )}

      {/* History list */}
      {data.length > 0 && (
        <div>
          <h3 className="section-title" style={{marginTop:28}}>Recent Entries</h3>
          <div className="sentiment-list">
            {[...data].reverse().slice(0, 8).map((s, i) => {
              const sl = scoreLabel(s.mental_score)
              return (
                <div key={i} className="sentiment-entry card">
                  <div className="entry-top">
                    <span className="entry-date">{s.date?.slice(0,10)}</span>
                    <span className="entry-score-badge" style={{background: sl.color+'22', color: sl.color}}>
                      {s.mental_score?.toFixed?.(1) ?? s.mental_score} · {sl.label}
                    </span>
                  </div>
                  {s.stress_type && s.stress_type !== 'None' && (
                    <p className="entry-stress">Stress type: {s.stress_type}</p>
                  )}
                  {s.suggestions?.length > 0 && (
                    <ul className="entry-suggestions">
                      {s.suggestions.slice(0,2).map((sg, j) => (
                        <li key={j}>{sg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
