import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, IndianRupee, Search } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')

    const loadBookings = (status) => {
        setLoading(true)
        adminApi.getBookings({ status })
            .then(({ data }) => setBookings(data || []))
            .catch(() => toast.error('Failed to load bookings'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadBookings(statusFilter) }, [statusFilter])

    const getBadgeClass = (s) => {
        const b = { pending_payment: 'warning', confirmed: 'primary', active: 'info', completed: 'success', cancelled: 'danger' }
        return b[s] || 'muted'
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
                    <Link to="/admin/users" className="sidebar-link"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link active"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Bookings</h1>
                        <p style={{ color: 'var(--text-muted)' }}>View and monitor all vehicle rentals.</p>
                    </div>
                    <div>
                        <select className="form-control" style={{ minWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active (Picked Up)</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (<div>Loading bookings...</div>) : bookings.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <h3>No Bookings Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No bookings match the selected status.</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Vehicle</th>
                                        <th>Traveler</th>
                                        <th>Owner</th>
                                        <th>Dates</th>
                                        <th>Revenue</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{b.id}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{b.vehicle_name}</div>
                                            </td>
                                            <td><div style={{ fontWeight: 500 }}>{b.user_name}</div></td>
                                            <td><div style={{ fontWeight: 500 }}>{b.owner_name}</div></td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{format(new Date(b.from_date), 'dd MMM yyyy')}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>to {format(new Date(b.to_date), 'dd MMM yyyy')} ({b.total_days}d)</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>₹{b.total_price.toFixed(2)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fee: ₹{b.platform_fee.toFixed(2)}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getBadgeClass(b.status)}`}>{b.status.replace('_', ' ').toUpperCase()}</span>
                                            </td>
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
