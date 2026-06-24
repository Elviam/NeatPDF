import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = `${import.meta.env.VITE_API_URL}/api/auth`

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(() => localStorage.getItem('neatpdf_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    axios
      .get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('neatpdf_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const _saveSession = (newToken, userData) => {
    localStorage.setItem('neatpdf_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { email, password })
    const newToken = res.data.access_token
    const meRes = await axios.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    _saveSession(newToken, meRes.data)
  }

  const loginWithGoogle = async (credential) => {
    // credential es el JWT que devuelve el botón de Google
    const res = await axios.post(`${API}/google`, { credential })
    const newToken = res.data.access_token
    const meRes = await axios.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    _saveSession(newToken, meRes.data)
  }

  const register = async (email, password, full_name) => {
    await axios.post(`${API}/register`, { email, password, full_name })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('neatpdf_token')
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    return () => axios.interceptors.request.eject(interceptor)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}