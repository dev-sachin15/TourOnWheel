import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, CreditCard, ChevronRight, XCircle, MoreVertical } from 'lucide-react'
import { bookingApi } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function MyBookingsPage() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    const loadBookings = async () => {
        try {
            const { data } = await bookingApi.myBookings()
            setBookings(data)
        } catch {
            toast.error('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadBookings() }, [])

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        try {
            await bookingApi.cancel(id)
            toast.success('Booking cancelled')
            loadBookings()
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Cancellation failed')
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending_payment: { class: 'badge-warning', label: 'Payment Pending' },
            confirmed: { class: 'badge-primary', label: 'Confirmed' },
            active: { class: 'badge-info', label: 'Active (Picked up)' },
            completed: { class: 'badge-success', label: 'Completed' },
            cancelled: { class: 'badge-danger', label: 'Cancelled' }
        }
        const b = badges[status] || { class: 'badge-muted', label: status.replace('_', ' ') }
        return <span className={`badge ${b.class}`}>{b.label}</span>
    }

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>My Bookings</h1>

                {loading ? (
                    <div className="grid-2">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <h3>No Bookings Yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't rented any vehicles yet.</p>
                        <Link to="/vehicles" className="btn btn-primary">Find a Vehicle</Link>
                    </div>
                ) : (
                    <div className="grid-2">
                        {bookings.map(book => (
                            <div key={book.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking #{book.id}</div>
                                    {getStatusBadge(book.status)}
                                </div>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>{book.vehicle_name}</h3>

                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Pickup Date</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{format(new Date(book.from_date), 'MMM dd, yyyy')}</div>
                                            </div>
                                            <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Return Date</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{format(new Date(book.to_date), 'MMM dd, yyyy')}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                                                <div style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>₹{book.total_price}</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {book.status === 'pending_payment' && (
                                                    <Link to={`/checkout/${book.id}`} className="btn btn-primary btn-sm">Pay Now</Link>
                                                )}
                                                {book.status === 'confirmed' && (
                                                    <>
                                                        <Link to={`/bookings/${book.id}/pickup`} className="btn btn-primary btn-sm">Pickup</Link>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(book.id)}>Cancel</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
