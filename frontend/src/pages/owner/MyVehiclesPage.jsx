import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, PlusCircle, LayoutDashboard, CalendarCheck, MapPin, Upload } from 'lucide-react'
import { vehicleApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function MyVehiclesPage() {
    const navigate = useNavigate()
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    const loadVehicles = async () => {
        try {
            const { data } = await vehicleApi.myVehicles()
            setVehicles(data)
        } catch {
            toast.error('Failed to load vehicles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadVehicles() }, [])

    const handleToggleAvail = async (id, currentStatus) => {
        if (['pending', 'rejected', 'booked'].includes(currentStatus)) {
            toast.error(`Cannot change availability when status is ${currentStatus}`)
            return
        }
        try {
            await vehicleApi.toggleAvail(id)
            toast.success('Availability updated')
            loadVehicles()
        } catch {
            toast.error('Status update failed')
        }
    }

    const getStatusBadge = (s) => {
        const b = { pending: 'warning', approved: 'primary', rejected: 'danger', available: 'success', booked: 'danger' }
        return <span className={`badge badge-${b[s] || 'muted'}`}>{s.toUpperCase()}</span>
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Owner Dashboard</div>
                    <Link to="/owner/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/owner/my-vehicles" className="sidebar-link active"><Car size={18} /> My Vehicles</Link>
                    <Link to="/owner/add-vehicle" className="sidebar-link"><PlusCircle size={18} /> List New Vehicle</Link>
                    <Link to="/owner/bookings" className="sidebar-link"><CalendarCheck size={18} /> Vehicle Bookings</Link>
                    <Link to="/owner/earnings" className="sidebar-link"><span style={{ width: 18, height: 18, fontSize: '1.1rem', marginTop: -4 }}>₹</span> Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div><h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Vehicles</h1></div>
                    <Link to="/owner/add-vehicle" className="btn btn-primary"><PlusCircle size={16} /> Add Vehicle</Link>
                </div>

                {loading ? (<div>Loading vehicles...</div>) : vehicles.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚘</div>
                        <h3>No Vehicles Listed</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't added any vehicles. List one to start earning.</p>
                        <Link to="/owner/add-vehicle" className="btn btn-primary">List Your First Vehicle</Link>
                    </div>
                ) : (
                    <div className="grid-3">
                        {vehicles.map(v => (
                            <div key={v.id} className="vehicle-card" style={{ cursor: 'default' }}>
                                <div className="vehicle-card-image">
                                    <img src={v.images?.[0] ? `/uploads/${v.images[0]}` : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80'} alt={v.name} onError={e => { e.target.style.display = 'none' }} />
                                    <div className="vehicle-card-badge">{getStatusBadge(v.status)}</div>
                                </div>
                                <div className="vehicle-card-body">
                                    <h4 style={{ marginBottom: 4, fontWeight: 700 }}>{v.name}</h4>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>{v.registration_number}</div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Earnging</div>
                                            <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{v.owner_expected_price_per_day}/day</div>
                                        </div>
                                        {v.status === 'rejected' && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', maxWidth: 100 }}>{v.rejection_reason}</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={`btn btn-sm btn-full ${v.status === 'available' ? 'btn-ghost' : 'btn-success'}`}
                                            onClick={() => handleToggleAvail(v.id, v.status)}
                                            disabled={['pending', 'rejected', 'booked'].includes(v.status)}
                                        >
                                            {v.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                                        </button>
                                        {!v.images?.length && (
                                            <button className="btn btn-primary btn-sm btn-icon" title="Upload Photos" onClick={() => navigate(`/owner/vehicles/${v.id}/photos`)}><Upload size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
