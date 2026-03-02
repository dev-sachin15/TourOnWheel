import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, PlusCircle, LayoutDashboard, CalendarCheck, CheckCircle } from 'lucide-react'
import { bookingApi } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function OwnerBookingsPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    const loadBookings = async () => {
        try {
            const { data } = await bookingApi.ownerBookings()
            setBookings(data)
        } catch {
            toast.error('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadBookings() }, [])

    const handleReturn = async (id) => {
        try {
            await bookingApi.markReturn(id)
            toast.success('Vehicle return verified')
            loadBookings()
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Return verification failed')
        }
    }

    const getBadgeClass = (s) => {
        const b = { pending_payment: 'warning', confirmed: 'primary', active: 'info', completed: 'success', cancelled: 'danger' }
        return b[s] || 'muted'
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Owner Dashboard</div>
                    <Link to="/owner/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/owner/my-vehicles" className="sidebar-link"><Car size={18} /> My Vehicles</Link>
                    <Link to="/owner/add-vehicle" className="sidebar-link"><PlusCircle size={18} /> List New Vehicle</Link>
                    <Link to="/owner/bookings" className="sidebar-link active"><CalendarCheck size={18} /> Vehicle Bookings</Link>
                    <Link to="/owner/earnings" className="sidebar-link"><span style={{ width: 18, height: 18, fontSize: '1.1rem', marginTop: -4 }}>₹</span> Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Vehicle Bookings</h1>

                {loading ? (<div>Loading bookings...</div>) : bookings.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <h3>No Bookings Yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You will receive notifications when someone books your vehicle.</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Vehicle</th>
                                        <th>Traveler</th>
                                        <th>Dates</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td><span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{b.id}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{b.vehicle_name}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{b.user_name}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{format(new Date(b.from_date), 'dd MMM yyyy')}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>to {format(new Date(b.to_date), 'dd MMM yyyy')} ({b.total_days}d)</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getBadgeClass(b.status)}`}>{b.status.replace('_', ' ').toUpperCase()}</span>
                                            </td>
                                            <td>
                                                {b.status === 'active' && (
                                                    <button className="btn btn-success btn-sm" onClick={() => handleReturn(b.id)}>
                                                        <CheckCircle size={14} /> Verify Return
                                                    </button>
                                                )}
                                                {b.status !== 'active' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>}
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
