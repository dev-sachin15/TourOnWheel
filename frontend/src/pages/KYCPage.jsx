import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Upload, CheckCircle, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { userApi } from '../services/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

function FileUploadZone({ label, accept, onChange, preview, id }) {
    return (
        <div>
            <label className="form-label">{label} *</label>
            <label className="file-upload" htmlFor={id} style={{ cursor: 'pointer' }}>
                <input id={id} type="file" accept={accept || "image/*,.pdf"} onChange={onChange} style={{ display: 'none' }} />
                {preview ? (
                    <div>
                        {preview.type === 'application/pdf' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--success)' }}>
                                <FileText size={32} /> <span>PDF uploaded: {preview.name}</span>
                            </div>
                        ) : (
                            <img src={preview.url} alt="Preview" style={{ maxHeight: 150, borderRadius: 8, maxWidth: '100%' }} />
                        )}
                        <p style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.85rem' }}>✅ File selected. Click to change.</p>
                    </div>
                ) : (
                    <div>
                        <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Click to upload or drag & drop</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>JPG, PNG or PDF (max 10MB)</p>
                    </div>
                )}
            </label>
        </div>
    )
}

export default function KYCPage() {
    const { user, refreshUser } = useAuth()
    const [dl, setDl] = useState(null)
    const [dlPreview, setDlPreview] = useState(null)
    const [id, setId] = useState(null)
    const [idPreview, setIdPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleFile = (setter, previewSetter) => (e) => {
        const file = e.target.files[0]
        if (file) {
            setter(file)
            if (file.type === 'application/pdf') {
                previewSetter({ type: 'application/pdf', name: file.name })
            } else {
                previewSetter({ url: URL.createObjectURL(file) })
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!dl || !id) { toast.error('Please upload both documents'); return }
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('driving_license', dl)
            fd.append('id_card', id)
            await userApi.submitKYC(fd)
            await refreshUser()
            toast.success('KYC documents submitted! Admin will review within 24 hours.')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Submission failed')
        } finally {
            setLoading(false)
        }
    }

    const isApproved = user?.kyc_status === 'approved'
    const isSubmitted = user?.kyc_status === 'submitted'

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        {/* Header */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: 44, height: 44, background: 'rgba(108,53,222,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={22} style={{ color: 'var(--primary-light)' }} />
                                </div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>KYC Verification</h1>
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>Upload your documents to get verified and unlock full access to TourOnWheel.</p>
                        </div>

                        {/* Status Cards */}
                        {isApproved && (
                            <div className="alert alert-success" style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                                <CheckCircle size={20} />
                                <div>
                                    <strong>KYC Approved!</strong> Your identity has been verified. You can now book any vehicle.
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <Link to="/vehicles" className="btn btn-success btn-sm">Browse Vehicles <ChevronRight size={14} /></Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isSubmitted && (
                            <div className="alert alert-warning" style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                                <AlertCircle size={20} />
                                <div>
                                    <strong>Documents Under Review</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Your KYC documents are being reviewed by our team. This usually takes 24 hours.</p>
                                </div>
                            </div>
                        )}

                        {user?.kyc_status === 'rejected' && (
                            <div className="alert alert-danger" style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                                <AlertCircle size={20} />
                                <div>
                                    <strong>KYC Rejected</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        Reason: {user.kyc_rejection_reason || 'Please resubmit clear documents.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* What you need */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Documents Required</h4>
                            <div className="grid-2">
                                {[
                                    { title: 'Driving Licence', desc: 'Front and back of valid DL', icon: '🪪' },
                                    { title: 'Government ID', desc: 'Aadhaar, PAN, or Passport', icon: '📄' }
                                ].map(d => (
                                    <div key={d.title} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{d.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isApproved && !isSubmitted && (
                            <form onSubmit={handleSubmit}>
                                <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                    <div className="grid-2">
                                        <FileUploadZone
                                            label="Driving Licence"
                                            onChange={handleFile(setDl, setDlPreview)}
                                            preview={dlPreview}
                                            id="kyc-dl"
                                        />
                                        <FileUploadZone
                                            label="Government ID (Aadhaar / PAN)"
                                            onChange={handleFile(setId, setIdPreview)}
                                            preview={idPreview}
                                            id="kyc-id"
                                        />
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <Shield size={18} />
                                    <span>Your documents are encrypted and stored securely. They are only used for identity verification.</span>
                                </div>

                                <button
                                    type="submit"
                                    id="submit-kyc"
                                    className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                                    disabled={loading || !dl || !id}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {!loading && <><Shield size={18} /> Submit KYC Documents</>}
                                </button>
                            </form>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    )
}
