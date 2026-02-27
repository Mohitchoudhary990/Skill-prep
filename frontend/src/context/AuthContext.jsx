import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('sp_token'))
    const [loading, setLoading] = useState(true)

    // Attach token to every axios request automatically
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            localStorage.setItem('sp_token', token)
        } else {
            delete axios.defaults.headers.common['Authorization']
            localStorage.removeItem('sp_token')
        }
    }, [token])

    // On first load, fetch the logged-in user profile if token exists
    useEffect(() => {
        const bootstrap = async () => {
            if (!token) { setLoading(false); return }
            try {
                const { data } = await axios.get(`${API}/auth/me`)
                setUser(data.data.user)
            } catch {
                // Token expired or invalid – clear it
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        bootstrap()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const register = async (name, email, password) => {
        const { data } = await axios.post(`${API}/auth/register`, { name, email, password })
        setToken(data.data.token)
        setUser(data.data.user)
        return data
    }

    const login = async (email, password) => {
        const { data } = await axios.post(`${API}/auth/login`, { email, password })
        setToken(data.data.token)
        setUser(data.data.user)
        return data
    }

    const logout = () => {
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
