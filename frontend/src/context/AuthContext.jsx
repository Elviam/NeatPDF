import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = 'http://localhost:8000/api/auth'

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)   // { id, email, full_name }
  const [token, setToken] = useState(() => localStorage.getItem('neatpdf_token'))
  const [loading, setLoading] = useState(true)

  // Al cargar la app, si hay token guardado, verificar que sigue válido
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    axios
      .get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token expirado o inválido — limpiar
        localStorage.removeItem('neatpdf_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { email, password })
    const newToken = res.data.access_token

    localStorage.setItem('neatpdf_token', newToken)
    setToken(newToken)

    const meRes = await axios.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    setUser(meRes.data)
  }

  const register = async (email, password, full_name) => {
    await axios.post(`${API}/register`, { email, password, full_name })
    await login(email, password) // login automático tras registro
  }

  const logout = () => {
    localStorage.removeItem('neatpdf_token')
    setToken(null)
    setUser(null)
  }

  // Agrega el token a todos los requests de axios si existe
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    return () => axios.interceptors.request.eject(interceptor)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}