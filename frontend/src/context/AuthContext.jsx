import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, userAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await userAPI.getProfile()
      setUser(data)
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token || '')
    const profile = data.user || data
    setUser(profile)
    return profile
  }

  const register = async (username, email, password) => {
    const { data } = await authAPI.register(username, email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token || '')
    const profile = data.user || data
    setUser(profile)
    return profile
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await userAPI.getProfile()
      setUser(data)
    } catch {}
  }

  const introCompleted = user?.intro_completed === 1 || user?.intro_completed === true || user?.assessment_flag === 1

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, introCompleted }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
