import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, userApi } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchMe = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) { setLoading(false); return }
            const { data } = await authApi.me()
            setUser(data)
        } catch {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMe() }, [fetchMe])

    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        setUser(data.user)
        return data.user
    }

    const register = async (email, password, role) => {
        const { data } = await authApi.register({ email, password, role })
        return data
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        toast.success('Logged out successfully')
    }

    const refreshUser = async () => {
        try {
            const { data } = await authApi.me()
            setUser(data)
        } catch (e) { }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
