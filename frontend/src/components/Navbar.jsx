import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Car, Menu, X, Bell, User, LogOut, ChevronDown,
    Shield, Settings, PlusCircle, LayoutDashboard, Search
} from 'lucide-react'
import { userApi } from '../services/api'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropOpen, setDropOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [notifOpen, setNotifOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropRef = useRef(null)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (user) {
            userApi.getNotifications().then(({ data }) => {
                setNotifications(data.slice(0, 8))
                setUnreadCount(data.filter(n => !n.is_read).length)
            }).catch(() => { })
        }
    }, [user])

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setDropOpen(false)
                setNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => { logout(); navigate('/') }

    const getRoleLabel = () => {
        if (user?.role === 'admin') return 'Admin'
        if (user?.role === 'owner') return 'Vehicle Owner'
        return 'Traveler'
    }

    const getDashboardLink = () => {
        if (user?.role === 'admin') return '/admin/dashboard'
        if (user?.role === 'owner') return '/owner/dashboard'
        return '/bookings'
    }

    const getInitials = () => {
        if (!user) return '?'
        if (user.first_name) return `${user.first_name[0]}${user.last_name?.[0] || ''}`
        return user.email[0].toUpperCase()
    }

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">
                        <Car size={22} color="white" />
                    </div>
                    <span className="navbar-logo-text">TourOnWheel</span>
                </Link>

                {/* Nav Links */}
                <div className="navbar-nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/vehicles" className={`nav-link ${location.pathname.startsWith('/vehicles') ? 'active' : ''}`}>Find Vehicles</Link>
                    {user?.role === 'owner' && (
                        <Link to="/owner/my-vehicles" className="nav-link">My Vehicles</Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="navbar-actions" ref={dropRef}>
                    {user ? (
                        <>
                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false) }}
                                    style={{ position: 'relative' }}
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: 4, right: 4,
                                            width: 16, height: 16, borderRadius: '50%',
                                            background: 'var(--danger)', fontSize: '0.65rem',
                                            fontWeight: 700, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color: 'white'
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '110%',
                                        width: 340, background: 'var(--bg-card)',
                                        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                                        boxShadow: 'var(--shadow-xl)', zIndex: 200, overflow: 'hidden'
                                    }}>
                                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700 }}>Notifications</span>
                                            {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} new</span>}
                                        </div>
                                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications</div>
                                            ) : notifications.map(n => (
                                                <div key={n.id} style={{
                                                    padding: '0.85rem 1.25rem',
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                    background: n.is_read ? 'transparent' : 'rgba(108,53,222,0.05)'
                                                }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="navbar-avatar"
                                    onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false) }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', height: 40 }}
                                >
                                    <div className="avatar-placeholder" style={{ width: 26, height: 26, fontSize: '0.7rem', borderRadius: '50%', background: 'var(--gradient-primary)' }}>
                                        {getInitials()}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.first_name || user.email.split('@')[0]}</span>
                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                </button>

                                {dropOpen && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '110%',
                                        width: 220, background: 'var(--bg-card)',
                                        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                                        boxShadow: 'var(--shadow-xl)', zIndex: 200, overflow: 'hidden', padding: '0.5rem'
                                    }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.first_name || 'User'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getRoleLabel()}</div>
                                        </div>
                                        <Link to={getDashboardLink()} className="sidebar-link" style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem' }} onClick={() => setDropOpen(false)}>
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>
                                        <Link to="/profile" className="sidebar-link" style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem' }} onClick={() => setDropOpen(false)}>
                                            <User size={16} /> Profile
                                        </Link>
                                        {user.role === 'owner' && (
                                            <Link to="/owner/add-vehicle" className="sidebar-link" style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem' }} onClick={() => setDropOpen(false)}>
                                                <PlusCircle size={16} /> Add Vehicle
                                            </Link>
                                        )}
                                        <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0' }} />
                                        <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem' }}>
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
