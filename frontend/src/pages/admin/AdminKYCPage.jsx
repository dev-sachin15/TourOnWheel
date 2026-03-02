import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldAlert, Car, CalendarClock, IndianRupee, Check, X, FileText } from 'lucide-react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminKYCPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [rejectionReason, setRejectionReason] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)

    const loadKYC = () => {
        setLoading(true)
        adminApi.getUsers({ kyc_status: 'submitted' })
            .then(({ data }) => setUsers(Array.isArray(data) ? data : data?.users || []))
            .catch(() => toast.error('Failed to load KYC requests'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadKYC() }, [])

    const handleReview = async (id, status, reason = null) => {
        try {
            if (status === 'rejected' && !reason) {
                toast.error('Rejection reason required')
                return
            }
            await adminApi.reviewKYC(id, { status: status, rejection_reason: reason })
            toast.success(`KYC ${status} successfully`)
            setSelectedUser(null)
            loadKYC()
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update KYC')
        }
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Admin Dashboard</div>
                    <Link to="/admin/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/admin/kyc" className="sidebar-link active"><ShieldAlert size={18} /> KYC Approvals</Link>
                    <Link to="/admin/vehicles" className="sidebar-link"><Car size={18} /> Vehicle Approvals</Link>
                    <Link to="/admin/users" className="sidebar-link"><Users size={18} /> Manage Users</Link>
                    <Link to="/admin/bookings" className="sidebar-link"><CalendarClock size={18} /> All Bookings</Link>
                    <Link to="/admin/earnings" className="sidebar-link"><IndianRupee size={18} /> Platform Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>KYC Approvals</h1>

                {loading ? (<div>Loading pending KYC...</div>) : (!users || users.length === 0) ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3>All Caught Up!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No pending KYC verifications in the queue.</p>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {users.map(u => (
                            <div key={u.id} className="glass-card" style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 700 }}>{u.first_name} {u.last_name || ''}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</p>
                                        </div>
                                        <span className="badge badge-warning">Pending Review</span>
                                    </div>

                                    {/* Documents */}
                                    <div className="grid-2" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Driving Licence</div>
                                            {u.driving_license_url?.endsWith('.pdf') ? (
                                                <a href={`/uploads/${u.driving_license_url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 8, color: 'var(--primary-light)' }}>
                                                    <FileText size={16} /> View DL (PDF)
                                                </a>
                                            ) : (
                                                <a href={`/uploads/${u.driving_license_url}`} target="_blank" rel="noreferrer" style={{ display: 'block', height: 100, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                    <img src={`/uploads/${u.driving_license_url}`} alt="DL" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </a>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Govt ID</div>
                                            {u.id_card_url?.endsWith('.pdf') ? (
                                                <a href={`/uploads/${u.id_card_url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 8, color: 'var(--primary-light)' }}>
                                                    <FileText size={16} /> View ID (PDF)
                                                </a>
                                            ) : (
                                                <a href={`/uploads/${u.id_card_url}`} target="_blank" rel="noreferrer" style={{ display: 'block', height: 100, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                    <img src={`/uploads/${u.id_card_url}`} alt="Govt ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedUser === u.id ? (
                                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: 4, display: 'block', fontWeight: 600 }}>Reason for Rejection *</label>
                                        <input
                                            className="form-control"
                                            style={{ marginBottom: 8 }}
                                            placeholder="e.g. Blurry driving licence"
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                        />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm btn-full" onClick={() => setSelectedUser(null)}>Cancel</button>
                                            <button className="btn btn-danger btn-sm btn-full" onClick={() => handleReview(u.id, 'rejected', rejectionReason)}>Confirm Reject</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                        <button
                                            style={{ padding: '1rem', background: 'none', border: 'none', borderRight: '1px solid var(--border)', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                            onClick={() => { setSelectedUser(u.id); setRejectionReason(''); }}
                                        >
                                            <X size={16} /> Reject Unclear Docs
                                        </button>
                                        <button
                                            style={{ padding: '1rem', background: 'none', border: 'none', color: 'var(--success)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                            onClick={() => handleReview(u.id, 'approved')}
                                        >
                                            <Check size={16} /> Approve
                                        </button>
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
