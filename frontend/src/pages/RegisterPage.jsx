import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Car, Eye, EyeOff, User, ArrowRight, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const initialRole = searchParams.get('role') || 'user'

    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: initialRole })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [step, setStep] = useState(1)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setLoading(true)
        try {
            await register(form.email, form.password, form.role)
            toast.success('Account created successfully! Please log in.')
            navigate('/login')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { value: 'user', label: 'Traveler', icon: <User size={20} />, desc: 'Rent vehicles for your trips' },
        { value: 'owner', label: 'Vehicle Owner', icon: <Car size={20} />, desc: 'List and earn from your vehicles' },
    ]

    return (
        <div className="page-wrapper" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '2rem'
        }}>
            <div className="hero-bg-orb" style={{ width: 400, height: 400, background: 'var(--primary)', top: -100, right: -100, opacity: 0.15, filter: 'blur(80px)', position: 'fixed', borderRadius: '50%' }} />
            <div className="hero-bg-orb" style={{ width: 300, height: 300, background: 'var(--secondary)', bottom: -50, left: 100, opacity: 0.12, filter: 'blur(80px)', position: 'fixed', borderRadius: '50%' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', maxWidth: 480 }}
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
                        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join TourOnWheel and start your journey</p>
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">I want to...</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {roles.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r.value })}
                                    style={{
                                        padding: '1rem', border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)', background: form.role === r.value ? 'rgba(108,53,222,0.12)' : 'rgba(255,255,255,0.03)',
                                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                    }}
                                >
                                    <div style={{ color: form.role === r.value ? 'var(--primary-light)' : 'var(--text-muted)', marginBottom: '0.4rem' }}>{r.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: form.role === r.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
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
                                    id="register-email"
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
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    id="register-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    className="form-control"
                                    style={{ paddingLeft: 38 }}
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                    id="register-confirm-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="register-submit"
                            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                            disabled={loading}
                        >
                            {!loading && <><ArrowRight size={18} /> Create Account</>}
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
