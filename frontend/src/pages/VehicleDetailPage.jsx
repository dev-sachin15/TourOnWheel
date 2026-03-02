import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, MapPin, Users, Zap, Shield, Calendar, ChevronLeft, ChevronRight, AlertCircle, Bike } from 'lucide-react'
import { vehicleApi, bookingApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function VehicleDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [imgIdx, setImgIdx] = useState(0)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [bookingLoading, setBookingLoading] = useState(false)

    useEffect(() => {
        vehicleApi.getById(id).then(({ data }) => {
            setVehicle(data)
        }).catch(() => navigate('/vehicles')).finally(() => setLoading(false))
    }, [id])

    const images = vehicle?.images?.length > 0
        ? vehicle.images.map(i => `/uploads/${i}`)
        : ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80']

    const totalDays = fromDate && toDate ? Math.max(0, (new Date(toDate) - new Date(fromDate)) / 86400000) : 0
    const totalPrice = vehicle ? Math.round(vehicle.platform_price_per_day * totalDays) : 0

    const handleBooking = async () => {
        if (!user) { navigate('/login'); return }
        if (!fromDate || !toDate) { toast.error('Please select dates'); return }
        if (totalDays <= 0) { toast.error('End date must be after start date'); return }
        if (user.kyc_status !== 'approved') {
            toast.error('KYC verification required to book. Please upload your documents.')
            navigate('/kyc')
            return
        }
        setBookingLoading(true)
        try {
            const { data } = await bookingApi.create({ vehicle_id: vehicle.id, from_date: fromDate, to_date: toDate })
            toast.success('Booking created! Proceed to payment.')
            navigate(`/checkout/${data.id}`)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Booking failed')
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ width: 48, height: 48, border: '4px solid rgba(108,53,222,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    )

    if (!vehicle) return null

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
                    <ChevronLeft size={16} /> Back to Search
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                    {/* Left: Vehicle Info */}
                    <div>
                        {/* Image Gallery */}
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '1.5rem', background: 'var(--bg-elevated)', height: 420 }}>
                            <img
                                src={images[imgIdx]}
                                alt={vehicle.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80' }}
                            />
                            {images.length > 1 && (
                                <>
                                    <button className="carousel-btn carousel-btn-prev" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}><ChevronLeft size={18} /></button>
                                    <button className="carousel-btn carousel-btn-next" onClick={() => setImgIdx(i => (i + 1) % images.length)}><ChevronRight size={18} /></button>
                                    <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                                        {images.map((_, i) => (
                                            <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 4, background: i === imgIdx ? 'var(--primary)' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Badges */}
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: 8 }}>
                                <span className="badge badge-primary">
                                    {vehicle.vehicle_type === 'two_wheeler' ? <Bike size={10} /> : <Car size={10} />}
                                    {vehicle.vehicle_type === 'two_wheeler' ? '2 Wheeler' : '4 Wheeler'}
                                </span>
                                {vehicle.status === 'booked' && <span className="badge badge-danger">Currently Booked</span>}
                            </div>
                        </div>

                        {/* Title & Owner */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{vehicle.name}</h1>
                                    <p style={{ color: 'var(--text-muted)' }}>{vehicle.brand} {vehicle.model} • {vehicle.year} • {vehicle.color}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary-light)' }}>₹{Math.round(vehicle.platform_price_per_day)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per day</div>
                                </div>
                            </div>

                            {vehicle.address && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <MapPin size={15} /> {vehicle.address}, {vehicle.city}
                                </div>
                            )}
                        </div>

                        {/* Specs Grid */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Vehicle Specifications</h3>
                            <div className="grid-3" style={{ gap: '1rem' }}>
                                {[
                                    { icon: '👥', label: 'Seating', value: `${vehicle.seats} Seats` },
                                    { icon: '⛽', label: 'Fuel Type', value: vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1) },
                                    { icon: '⚙️', label: 'Transmission', value: vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1) },
                                    { icon: '❄️', label: 'AC', value: vehicle.is_ac ? 'Yes' : 'No' },
                                    { icon: '🛣️', label: 'Max km/day', value: `${vehicle.max_km_per_day} km` },
                                    { icon: '⚡', label: 'Mileage', value: vehicle.average_kmpl ? `${vehicle.average_kmpl} kmpl` : 'N/A' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.label}</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {vehicle.description && (
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>About This Vehicle</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{vehicle.description}</p>
                            </div>
                        )}

                        {/* Owner Info */}
                        {vehicle.owner && (
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Vehicle Owner</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                                        {vehicle.owner.first_name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{vehicle.owner.first_name} {vehicle.owner.last_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vehicle.owner.city}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✅ Verified Owner</span>
                                        </div>
                                    </div>
                                </div>
                                {vehicle.owner.address && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                                        {vehicle.owner.address}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Booking Panel */}
                    <div style={{ position: 'sticky', top: 100 }}>
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Book This Vehicle</h3>

                            {vehicle.status === 'booked' ? (
                                <div className="alert alert-danger">
                                    <AlertCircle size={18} />
                                    <span>This vehicle is currently booked. Please check back later or search for alternatives.</span>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Pickup Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="booking-from"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={fromDate}
                                            onChange={e => setFromDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Return Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="booking-to"
                                            min={fromDate || new Date().toISOString().split('T')[0]}
                                            value={toDate}
                                            onChange={e => setToDate(e.target.value)}
                                        />
                                    </div>

                                    {totalDays > 0 && (
                                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 6 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>₹{Math.round(vehicle.platform_price_per_day)} × {totalDays} days</span>
                                                <span>₹{totalPrice}</span>
                                            </div>
                                            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--primary-light)', fontSize: '1.1rem' }}>₹{totalPrice}</span>
                                            </div>
                                        </div>
                                    )}

                                    {user?.kyc_status !== 'approved' && user && (
                                        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                                            <AlertCircle size={16} />
                                            <span>KYC required to book. <a href="/kyc" style={{ color: 'var(--warning)', fontWeight: 600 }}>Verify now →</a></span>
                                        </div>
                                    )}

                                    <button
                                        className={`btn btn-primary btn-full btn-lg ${bookingLoading ? 'btn-loading' : ''}`}
                                        onClick={handleBooking}
                                        disabled={bookingLoading || !fromDate || !toDate || totalDays <= 0}
                                        id="booking-submit"
                                    >
                                        {!bookingLoading && <><Calendar size={18} /> Book Now</>}
                                    </button>

                                    {!user && (
                                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <a href="/login" style={{ color: 'var(--primary-light)' }}>Sign in</a> to book this vehicle
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Trust signals */}
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {['Free cancellation before pickup', 'Verified vehicle documents', 'Secure Razorpay payment'].map(s => (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Shield size={13} style={{ color: 'var(--success)', flexShrink: 0 }} /> {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
