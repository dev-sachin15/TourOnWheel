import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, PlusCircle, LayoutDashboard, CalendarCheck, TrendingUp, Download, IndianRupee } from 'lucide-react'
import { userApi } from '../../services/api'
import { format } from 'date-fns'

export default function OwnerEarningsPage() {
    const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, breakdown: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        userApi.getEarnings().then(({ data }) => setEarnings(data)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Owner Dashboard</div>
                    <Link to="/owner/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/owner/my-vehicles" className="sidebar-link"><Car size={18} /> My Vehicles</Link>
                    <Link to="/owner/add-vehicle" className="sidebar-link"><PlusCircle size={18} /> List New Vehicle</Link>
                    <Link to="/owner/bookings" className="sidebar-link"><CalendarCheck size={18} /> Vehicle Bookings</Link>
                    <Link to="/owner/earnings" className="sidebar-link active"><span style={{ width: 18, height: 18, fontSize: '1.1rem', marginTop: -4 }}>₹</span> Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Earnings</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Track your revenue from vehicle rentals.</p>
                    </div>
                    <button className="btn btn-secondary btn-icon"><Download size={18} /></button>
                </div>

                {loading ? (<div>Loading earnings...</div>) : (
                    <>
                        <div className="grid-2" style={{ marginBottom: '2rem' }}>
                            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={28} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Available to Withdraw</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>₹{(earnings.total_earnings || 0).toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px dashed var(--border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IndianRupee size={28} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Pending Clearance</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₹{(earnings.pending_earnings || 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Earning History</h3>
                            {(!earnings.breakdown || earnings.breakdown.length === 0) ? (
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
                                                <th>Vehicle</th>
                                                <th>Booking ID</th>
                                                <th>Amount Earned</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {earnings.breakdown.map((e, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 500 }}>{format(new Date(), 'dd MMM yyyy')}</td>
                                                    <td>Vehicle <span className="badge badge-muted">#{e.vehicle_id}</span></td>
                                                    <td><span className="badge badge-info">#{e.booking_id}</span></td>
                                                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{e.owner_share.toFixed(2)}</td>
                                                    <td><span className="badge badge-success">CREDITED</span></td>
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
