import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, Activity, MapPin, IndianRupee } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        adminApi.getStats()
            .then(({ data }) => setStats(data))
            .catch(() => toast.error('Failed to load admin stats'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Admin Dashboard</div>
                    <Link to="/admin/dashboard" className="sidebar-link active"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/admin/kyc" className="sidebar-link"><ShieldAlert size={18} /> KYC Approvals</Link>
                    <Link to="/admin/vehicles" className="sidebar-link"><Car size={18} /> Vehicle Approvals</Link>
                    <Link to="/admin/users" className="sidebar-link"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Platform Overview</h1>

                {loading || !stats ? (<div>Loading statistics...</div>) : (
                    <>
                        {/* Top Stat Cards */}
                        <div className="grid-4" style={{ marginBottom: '2rem' }}>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Users size={14} /> TOTAL USERS
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>{stats.total_users}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Car size={14} /> ACTIVE VEHICLES
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{stats.total_vehicles}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Activity size={14} /> TOTAL BOOKINGS
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{stats.total_bookings}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <IndianRupee size={14} /> PLATFORM REVENUE
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>₹{(stats.total_revenue || 0).toFixed(0)}</div>
                            </div>
                        </div>

                        {/* Action Required Section */}
                        <div className="grid-2">
                            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--danger)' }}>
                                    <ShieldAlert size={20} /> Action Required: KYC Pending
                                </h3>
                                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{stats.pending_kyc}</div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Users are waiting for identity verification.</p>
                                <Link to="/admin/kyc" className="btn btn-secondary btn-full">Review KYC Documents</Link>
                            </div>

                            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(245,158,11,0.3)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', color: 'var(--warning)' }}>
                                    <Car size={20} /> Action Required: Vehicles Pending
                                </h3>
                                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{stats.pending_vehicles}</div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>New listings need document verification.</p>
                                <Link to="/admin/vehicles" className="btn btn-secondary btn-full">Review Vehicle Listings</Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
