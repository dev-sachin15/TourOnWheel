import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, IndianRupee, TrendingUp, Download, CheckCircle, Activity } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminEarningsPage() {
    const [data, setData] = useState({ total_platform_revenue: 0, breakdown: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        adminApi.getEarnings()
            .then(({ data: res }) => setData(res))
            .catch(() => toast.error('Failed to load earnings data'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Admin Dashboard</div>
                    <Link to="/admin/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/admin/kyc" className="sidebar-link"><ShieldAlert size={18} /> KYC Approvals</Link>
                    <Link to="/admin/vehicles" className="sidebar-link"><Car size={18} /> Vehicle Approvals</Link>
                    <Link to="/admin/users" className="sidebar-link"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link active"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Earnings</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Financial overview and revenue split for all completed bookings.</p>
                    </div>
                    <button className="btn btn-secondary btn-icon"><Download size={18} /></button>
                </div>

                {loading ? (<div>Loading earnings...</div>) : (
                    <>
                        <div className="grid-2" style={{ marginBottom: '2rem' }}>
                            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(108,53,222,0.1) 0%, rgba(76,29,149,0.05) 100%)', border: '1px solid rgba(108,53,222,0.3)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={28} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--primary-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Platform Revenue</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>₹{(data.total_platform_revenue || 0).toFixed(0)}</div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={28} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Transaction Count</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{data.breakdown.length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Earning History</h3>
                            {(!data.breakdown || data.breakdown.length === 0) ? (
                                <div className="empty-state">
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📉</div>
                                    <p style={{ color: 'var(--text-muted)' }}>No earnings recorded yet.</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Booking ID</th>
                                                <th>Vehicle</th>
                                                <th>Gross Booking</th>
                                                <th>Platform Fee (15%)</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.breakdown.map((e, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 500 }}>{format(new Date(), 'dd MMM yyyy')}</td>
                                                    <td><span className="badge badge-info">#{e.booking_id}</span></td>
                                                    <td><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{e.vehicle_name}</div></td>
                                                    <td style={{ fontWeight: 600 }}>₹{e.payment_amount.toFixed(2)}</td>
                                                    <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>+ ₹{e.platform_fee.toFixed(2)}</td>
                                                    <td><span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: 4 }} /> PAID</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
