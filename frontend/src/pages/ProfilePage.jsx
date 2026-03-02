import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { userApi } from '../services/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [form, setForm] = useState({
        first_name: '', last_name: '', phone: '', date_of_birth: '',
        address: '', city: '', state: '', pincode: '',
        bank_account_number: '', bank_ifsc_code: '', bank_account_holder_name: ''
    })
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0 })

    useEffect(() => {
        if (user) {
            setForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                date_of_birth: user.date_of_birth || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                bank_account_number: user.bank_account_number || '',
                bank_ifsc_code: user.bank_ifsc_code || '',
                bank_account_holder_name: user.bank_account_holder_name || '',
            })
            if (user.profile_photo) setPhotoPreview(`/uploads/${user.profile_photo}`)
            userApi.getEarnings().then(({ data }) => setEarnings(data)).catch(() => { })
        }
    }, [user])

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setPhoto(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
            if (photo) fd.append('profile_photo', photo)
            await userApi.updateProfile(fd)
            await refreshUser()
            toast.success('Profile updated successfully!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    const getKYCBadge = () => {
        const status = user?.kyc_status
        if (status === 'approved') return { label: '✅ KYC Verified', class: 'badge-success' }
        if (status === 'submitted') return { label: '⏳ KYC Under Review', class: 'badge-warning' }
        if (status === 'rejected') return { label: '❌ KYC Rejected', class: 'badge-danger' }
        return { label: '⚠️ KYC Not Submitted', class: 'badge-muted' }
    }

    const kycBadge = getKYCBadge()

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        {/* Profile Header */}
                        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {photoPreview
                                            ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}</span>
                                        }
                                    </div>
                                    <label style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                                        <Camera size={14} color="white" />
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} id="profile-photo-input" />
                                    </label>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        <h2 style={{ fontWeight: 800 }}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}</h2>
                                        <span className={`badge ${kycBadge.class}`}>{kycBadge.label}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        {user?.email} • {user?.role === 'owner' ? 'Vehicle Owner' : user?.role === 'admin' ? 'Administrator' : 'Traveler'}
                                    </div>

                                    {user?.kyc_status !== 'approved' && (
                                        <Link to="/kyc" className="btn btn-primary btn-sm">
                                            <AlertCircle size={14} />
                                            {user?.kyc_status === 'rejected' ? 'Resubmit KYC' : 'Complete KYC Verification'}
                                        </Link>
                                    )}
                                </div>

                                {/* Earnings (for owner) */}
                                {user?.role === 'owner' && (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="stat-card" style={{ minWidth: 130 }}>
                                            <div style={{ color: 'var(--success)', fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>TOTAL EARNED</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{earnings.total_earnings.toFixed(0)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Profile Form */}
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Personal Information</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">First Name *</label>
                                        <input className="form-control" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="John" required id="first-name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name *</label>
                                        <input className="form-control" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" id="last-name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" required id="phone" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date of Birth</label>
                                        <input type="date" className="form-control" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} id="dob" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your full address" rows={2} id="address" />
                                </div>

                                <div className="grid-3">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" id="city" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input className="form-control" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" id="state" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input className="form-control" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="400001" id="pincode" />
                                    </div>
                                </div>

                                {/* Bank Details (for owner) */}
                                {user?.role === 'owner' && (
                                    <>
                                        <div className="divider" />
                                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CreditCard size={18} style={{ color: 'var(--primary-light)' }} />
                                            Bank Account Details
                                        </h4>
                                        <div className="grid-3">
                                            <div className="form-group">
                                                <label className="form-label">Account Holder Name</label>
                                                <input className="form-control" value={form.bank_account_holder_name} onChange={e => setForm({ ...form, bank_account_holder_name: e.target.value })} placeholder="Account holder name" id="bank-holder" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Account Number</label>
                                                <input className="form-control" value={form.bank_account_number} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} placeholder="Account number" id="bank-account" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">IFSC Code</label>
                                                <input className="form-control" value={form.bank_ifsc_code} onChange={e => setForm({ ...form, bank_ifsc_code: e.target.value })} placeholder="SBIN0001234" id="ifsc" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="submit" id="save-profile" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                                        {!loading && 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
