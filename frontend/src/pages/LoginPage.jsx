import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Car, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const user = await login(form.email, form.password)
            toast.success(`Welcome back, ${user.first_name || user.email.split('@')[0]}!`)
            if (user.role === 'admin') navigate('/admin/dashboard')
            else if (user.role === 'owner') navigate('/owner/dashboard')
            else if (!user.is_profile_complete) navigate('/profile')
            else navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-wrapper" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '2rem'
        }}>
            {/* Background Orbs */}
            <div className="hero-bg-orb" style={{ width: 400, height: 400, background: 'var(--primary)', top: -100, right: -100, opacity: 0.15, filter: 'blur(80px)', position: 'fixed', borderRadius: '50%' }} />
            <div className="hero-bg-orb" style={{ width: 300, height: 300, background: 'var(--accent)', bottom: -50, left: -50, opacity: 0.15, filter: 'blur(80px)', position: 'fixed', borderRadius: '50%' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', maxWidth: 440 }}
            >
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 60, height: 60, background: 'var(--gradient-primary)',
                            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)'
                        }}>
                            <Car size={28} color="white" />
                        </div>
                        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your TourOnWheel account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="form-control"
                                    style={{ paddingLeft: 38 }}
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    id="login-email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-control"
                                    style={{ paddingLeft: 38, paddingRight: 42 }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    id="login-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                            disabled={loading}
                            id="login-submit"
                            style={{ marginTop: '0.5rem' }}
                        >
                            {!loading && <><ArrowRight size={18} /> Sign In</>}
                        </button>
                    </form>

                    <div className="divider" />

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                            Create Account
                        </Link>
                    </p>

                    {/* Demo credentials */}
                    <div style={{
                        marginTop: '1.5rem', padding: '1rem', background: 'rgba(108,53,222,0.08)',
                        border: '1px solid rgba(108,53,222,0.2)', borderRadius: 'var(--radius-md)'
                    }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>DEMO ACCOUNTS</p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            
                            {/* <span>Admin: admin@touronwheel.in / admin123</span>
                            <span>Owner: owner@test.com / owner123</span>
                            <span>User: user@test.com / user123</span> */}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
