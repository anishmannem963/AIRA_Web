import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh })
        localStorage.setItem('access_token', data.access_token)
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout', {}),
  refresh: (refresh_token) =>
    api.post('/auth/refresh', { refresh_token }),
  resetPassword: (email) =>
    api.post('/auth/reset-password', { email }),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/update', data),
  getMotivation: () => api.post('/user/send_motivation', {}),
  generateStory: () => api.post('/user/generate_story', {}),
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  startIntro: () => api.post('/chat/start_intro', {}),
  newSession: () => api.post('/chat/new_session', {}),
  send: (session_id, message, intro = false) =>
    api.post('/chat/send', { session_id, message, intro }),
  getSessions: () => api.get('/chat/sessions'),
  getHistory: (session_id) =>
    api.get(`/chat/history?session_id=${session_id}`),
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (session_id, message_id, feedback_type, comment) =>
    api.post('/feedback/submitL', { session_id, message_id, feedback_type, comment }),
}

// ── Sentiment ─────────────────────────────────────────────────────────────────
export const sentimentAPI = {
  getAll: () => api.get('/sentiment/get_sentiments'),
  analyze: () => api.post('/sentiment/analyze', {}),
}

// ── Reminders ─────────────────────────────────────────────────────────────────
export const remindersAPI = {
  getAll: () => api.get('/reminder/get_all_reminders'),
  add: (generated_reminder, scheduled_time) =>
    api.post('/reminder/add_reminder', { generated_reminder, scheduled_time }),
  update: (id, generated_reminder, scheduled_time) =>
    api.put('/reminder/update_reminder', { id, generated_reminder, scheduled_time }),
  delete: (id) =>
    api.delete('/reminder/delete_reminder', { data: { id } }),
}

// ── Vision Board ─────────────────────────────────────────────────────────────
export const visionAPI = {
  getGoals: () => api.get('/visionboard/get_goals'),
  addGoal: (goal) => api.post('/visionboard/add_custom_goal', { goal }),
}

export default api
