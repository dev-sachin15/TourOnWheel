import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, IndianRupee, Search, ShieldCheck } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const loadUsers = (query = '') => {
        setLoading(true)
        adminApi.getUsers({ search: query })
            .then(({ data }) => setUsers(Array.isArray(data) ? data : data?.users || []))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadUsers() }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        loadUsers(search)
    }

    const getRoleBadge = (role) => {
        const badges = {
            admin: { class: 'badge-danger', icon: <ShieldAlert size={12} style={{ marginRight: 4 }} /> },
            owner: { class: 'badge-primary', icon: <Car size={12} style={{ marginRight: 4 }} /> },
            user: { class: 'badge-info', icon: <Users size={12} style={{ marginRight: 4 }} /> }
        }
        const b = badges[role] || { class: 'badge-muted', icon: null }
        return <span className={`badge ${b.class}`} style={{ display: 'inline-flex', alignItems: 'center' }}>{b.icon} {role.toUpperCase()}</span>
    }

    const getKYCBadge = (status) => {
        const badges = {
            approved: { class: 'badge-success', icon: <ShieldCheck size={12} style={{ marginRight: 4 }} /> },
            submitted: { class: 'badge-warning', icon: null },
            rejected: { class: 'badge-danger', icon: null },
            none: { class: 'badge-muted', icon: null }
        }
        const b = badges[status] || { class: 'badge-muted', icon: null }
        return <span className={`badge ${b.class}`} style={{ display: 'inline-flex', alignItems: 'center' }}>{b.icon} {status.toUpperCase()}</span>
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Admin Dashboard</div>
                    <Link to="/admin/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/admin/kyc" className="sidebar-link"><ShieldAlert size={18} /> KYC Approvals</Link>
                    <Link to="/admin/vehicles" className="sidebar-link"><Car size={18} /> Vehicle Approvals</Link>
                    <Link to="/admin/users" className="sidebar-link active"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Users</h1>
                        <p style={{ color: 'var(--text-muted)' }}>View and search all registered users.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="form-group" style={{ marginBottom: '2rem', maxWidth: 400 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: 36, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                            placeholder="Search by name, email, or role..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: '0.25rem 0.5rem', height: 'auto' }}>
                            Search
                        </button>
                    </div>
                </form>

                {loading ? (<div>Loading users...</div>) : (!users || users.length === 0) ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑‍🤝‍🧑</div>
                        <h3>No Users Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No users match your current search query.</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email / Phone</th>
                                        <th>Role</th>
                                        <th>KYC Status</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{u.id}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                        {u.first_name?.[0] || '?'}
                                                    </div>
                                                    {u.first_name} {u.last_name}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || '-'}</div>
                                            </td>
                                            <td>{getRoleBadge(u.role)}</td>
                                            <td>{getKYCBadge(u.kyc_status)}</td>
                                            <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
