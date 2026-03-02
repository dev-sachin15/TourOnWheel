import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle, Car, Calendar, Clock, X, Lock } from 'lucide-react'
import { bookingApi, vehicleApi, paymentApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
    const { bookingId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [booking, setBooking] = useState(null)
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [payLoading, setPayLoading] = useState(false)
    const [showDummyPayment, setShowDummyPayment] = useState(false)

    useEffect(() => {
        bookingApi.getById(bookingId).then(async ({ data }) => {
            setBooking(data)
            const { data: v } = await vehicleApi.getById(data.vehicle_id)
            setVehicle(v)
        }).catch(() => navigate('/bookings')).finally(() => setLoading(false))
    }, [bookingId])

    const handleMockPayment = async () => {
        setPayLoading(true)
        try {
            await paymentApi.verify({
                razorpay_order_id: `mock_order_${booking.id}`,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature',
                booking_id: booking.id
            })
            toast.success('Payment successful! Booking confirmed.')
            navigate('/bookings')
        } catch (err) {
            toast.error('Payment verification failed')
        } finally {
            setPayLoading(false)
            setShowDummyPayment(false)
        }
    }

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid rgba(108,53,222,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    )

    if (!booking || !vehicle) return null

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>
                            <CreditCard size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--primary-light)' }} />
                            Checkout Summary
                        </h1>

                        {/* Booking Summary */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Booking Details</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ width: 120, height: 90, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                                    <img
                                        src={vehicle.images?.[0] ? `/uploads/${vehicle.images[0]}` : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&q=80'}
                                        alt={vehicle.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&q=80' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{vehicle.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{vehicle.brand} {vehicle.model} • {vehicle.year}</p>
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.from_date}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Return</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.to_date}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.total_days} days</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Price Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                    <span>₹{Math.round(vehicle.platform_price_per_day)} × {booking.total_days} days</span>
                                    <span>₹{booking.base_price.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                    <span>Platform service fee</span>
                                    <span>₹{booking.platform_fee.toFixed(2)}</span>
                                </div>
                                <div style={{ height: 1, background: 'var(--border)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                                    <span>Total Amount</span>
                                    <span style={{ color: 'var(--primary-light)' }}>₹{booking.total_price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            className={`btn btn-primary btn-full btn-xl`}
                            onClick={() => setShowDummyPayment(true)}
                        >
                            <CreditCard size={20} /> Proceed to Dummy Payment
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Dummy Payment Modal */}
            {showDummyPayment && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '1rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden' }}
                    >
                        <div style={{ background: 'var(--bg-elevated)', padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Lock size={20} style={{ color: 'var(--success)' }} />
                                <h3 style={{ fontWeight: 700, margin: 0 }}>Secure Demo Checkout</h3>
                            </div>
                            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setShowDummyPayment(false)}><X size={18} /></button>
                        </div>

                        <div style={{ padding: '2rem 1.5rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Amount to Pay</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>₹{booking.total_price.toFixed(2)}</div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleMockPayment(); }}>
                                <div className="form-group">
                                    <label className="form-label">Cardholder Name</label>
                                    <input type="text" className="form-control" readOnly value={`${user?.first_name || 'Demo'} ${user?.last_name || 'User'}`} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Card Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" className="form-control" readOnly value="4111 1111 1111 1111" style={{ paddingLeft: 40, letterSpacing: '2px', fontFamily: 'monospace' }} />
                                        <CreditCard size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Expiry Date</label>
                                        <input type="text" className="form-control" readOnly value="12 / 28" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CVV</label>
                                        <input type="password" className="form-control" readOnly value="123" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-success btn-full btn-xl`}
                                    style={{ marginTop: '1rem' }}
                                    disabled={payLoading}
                                >
                                    {payLoading ? 'Processing...' : `Confirm Payment of ₹${booking.total_price.toFixed(2)}`}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Shield size={12} /> This is a simulated checkout page for testing purposes.
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
