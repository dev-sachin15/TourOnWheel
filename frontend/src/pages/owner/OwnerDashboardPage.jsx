import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, AlertCircle, PlusCircle, LayoutDashboard, CalendarCheck } from 'lucide-react'
import { vehicleApi, bookingApi } from '../../services/api'

export default function OwnerDashboardPage() {
    const [vehicles, setVehicles] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([vehicleApi.myVehicles(), bookingApi.ownerBookings()])
            .then(([vRes, bRes]) => {
                setVehicles(vRes.data)
                setBookings(bRes.data)
            }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const pendingVehicles = vehicles.filter(v => v.status === 'pending')
    const activeBookings = bookings.filter(b => ['confirmed', 'active'].includes(b.status))

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Owner Dashboard</div>
                    <Link to="/owner/dashboard" className="sidebar-link active"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/owner/my-vehicles" className="sidebar-link"><Car size={18} /> My Vehicles</Link>
                    <Link to="/owner/add-vehicle" className="sidebar-link"><PlusCircle size={18} /> List New Vehicle</Link>
                    <Link to="/owner/bookings" className="sidebar-link"><CalendarCheck size={18} /> Vehicle Bookings</Link>
                    <Link to="/owner/earnings" className="sidebar-link"><span style={{ width: 18, height: 18, fontSize: '1.1rem', marginTop: -4 }}>₹</span> Earnings</Link>
                </div>
            </aside>

            {/* Content */}
            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dashboard Overview</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage your listed vehicles and track performance.</p>
                    </div>
                    <Link to="/owner/add-vehicle" className="btn btn-primary"><PlusCircle size={16} /> List Vehicle</Link>
                </div>

                {loading ? (
                    <div>Loading dashboard...</div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid-4" style={{ marginBottom: '2rem' }}>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>TOTAL VEHICLES</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>{vehicles.length}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>ACTIVE BOOKINGS</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{activeBookings.length}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>PENDING APPROVAL</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>{pendingVehicles.length}</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>TOTAL EARNINGS</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                                    ₹{vehicles.reduce((sum, v) => sum + (v.total_earnings || 0), 0).toFixed(0)}
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        {pendingVehicles.length > 0 && (
                            <div className="alert alert-warning">
                                <AlertCircle size={20} />
                                <div>
                                    <strong>{pendingVehicles.length} vehicle(s) pending approval</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Our team is reviewing the documents for your recently listed vehicles. This usually takes 24 hours.</p>
                                </div>
                            </div>
                        )}

                        {vehicles.length === 0 && (
                            <div className="empty-state glass-card mt-6">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚘</div>
                                <h3>No Vehicles Listed</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>Start earning money by listing your car or bike on TourOnWheel.</p>
                                <Link to="/owner/add-vehicle" className="btn btn-primary"><PlusCircle size={18} /> List Your First Vehicle</Link>
                            </div>
                        )}

                        {/* Recent Bookings */}
                        {bookings.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Recent Bookings on Your Vehicles</h3>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Dates</th>
                                                <th>Duration</th>
                                                <th>Your Share</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.slice(0, 5).map(b => (
                                                <tr key={b.id}>
                                                    <td>#{b.id}</td>
                                                    <td>{b.from_date} to {b.to_date}</td>
                                                    <td>{b.total_days} days</td>
                                                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{(b.base_price - b.platform_fee).toFixed(2)}</td>
                                                    <td><span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'active' ? 'badge-info' : 'badge-warning'}`}>{b.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
