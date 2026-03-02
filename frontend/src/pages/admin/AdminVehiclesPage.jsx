import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, IndianRupee, Check, X, FileText, Download } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const loadVehicles = (status) => {
        setLoading(true)
        adminApi.getVehicles({ status })
            .then(({ data }) => setVehicles(Array.isArray(data) ? data : data?.vehicles || []))
            .catch(() => toast.error('Failed to load vehicles'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadVehicles(activeTab) }, [activeTab])

    const handleReview = async (id, status, reason = null) => {
        try {
            if (status === 'rejected' && (!reason || reason.trim() === '')) {
                toast.error('Rejection reason required')
                return
            }
            await adminApi.reviewVehicle(id, { status: status, rejection_reason: reason })
            toast.success(`Vehicle ${status} successfully`)
            setSelectedVehicle(null)
            loadVehicles(activeTab)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update vehicle')
        }
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Admin Dashboard</div>
                    <Link to="/admin/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/admin/kyc" className="sidebar-link"><ShieldAlert size={18} /> KYC Approvals</Link>
                    <Link to="/admin/vehicles" className="sidebar-link active"><Car size={18} /> Vehicle Approvals</Link>
                    <Link to="/admin/users" className="sidebar-link"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Vehicle Approvals</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Review newly listed vehicles and verify their documents.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('pending')}>Pending Review</button>
                        <button className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('approved')}>Approved</button>
                        <button className={`btn ${activeTab === 'rejected' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('rejected')}>Rejected</button>
                    </div>
                </div>

                {loading ? (<div>Loading vehicles...</div>) : (!vehicles || vehicles.length === 0) ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3>No Vehicles Found</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>No vehicles currently match the selected status filter.</p>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {vehicles.map(v => (
                            <div key={v.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                                        <img src={v.images?.[0] ? `/uploads/${v.images[0]}` : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&q=80'} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{v.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{v.brand} {v.model} • {v.year}</div>
                                        <div className="badge badge-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>{v.registration_number}</div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                                    <h5 style={{ marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Documents</h5>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <li>
                                            <a href={`/uploads/${v.rc_document_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                                <FileText size={14} /> View RC Document
                                            </a>
                                        </li>
                                        {v.pollution_cert_url && (
                                            <li>
                                                <a href={`/uploads/${v.pollution_cert_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                                    <FileText size={14} /> View Pollution Cert
                                                </a>
                                            </li>
                                        )}
                                        {v.insurance_url && (
                                            <li>
                                                <a href={`/uploads/${v.insurance_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                                    <FileText size={14} /> View Insurance
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {activeTab === 'pending' && (
                                    selectedVehicle === v.id ? (
                                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Rejection Reason *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Invalid RC document"
                                                value={rejectionReason}
                                                onChange={e => setRejectionReason(e.target.value)}
                                                style={{ marginBottom: 10, background: 'var(--bg-surface)' }}
                                            />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-sm btn-secondary btn-full" onClick={() => setSelectedVehicle(null)}>Cancel</button>
                                                <button className="btn btn-sm btn-danger btn-full" onClick={() => handleReview(v.id, 'rejected', rejectionReason)}>Confirm Reject</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                            <button className="btn btn-sm btn-danger btn-full" onClick={() => { setSelectedVehicle(v.id); setRejectionReason(''); }}>
                                                <X size={14} /> Reject
                                            </button>
                                            <button className="btn btn-sm btn-success btn-full" onClick={() => handleReview(v.id, 'approved')}>
                                                <Check size={14} /> Approve
                                            </button>
                                        </div>
                                    )
                                )}

                                {activeTab === 'rejected' && (
                                    <div style={{ marginTop: 'auto', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--danger)' }}>
                                        <strong>Rejected:</strong> {v.rejection_reason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
