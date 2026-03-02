import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, PlusCircle, LayoutDashboard, CalendarCheck, MapPin, Upload, IndianRupee } from 'lucide-react'
import { vehicleApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function AddVehiclePage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', brand: '', model: '', year: new Date().getFullYear(),
        color: '', vehicle_type: 'four_wheeler', seats: 4, registration_number: '',
        owner_expected_price_per_day: '', is_ac: false, max_km_per_day: 200,
        average_kmpl: '', fuel_type: 'petrol', transmission: 'manual',
        description: '', current_lat: '', current_lng: '', address: '', city: '', pincode: ''
    })
    const [rc, setRc] = useState(null)
    const [pollution, setPollution] = useState(null)
    const [insurance, setInsurance] = useState(null)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [locLoading, setLocLoading] = useState(false)

    const handleLocation = () => {
        setLocLoading(true)
        navigator.geolocation.getCurrentPosition(
            pos => {
                setForm({ ...form, current_lat: pos.coords.latitude, current_lng: pos.coords.longitude })
                toast.success('Location captured')
                setLocLoading(false)
            },
            () => { toast.error('Location denied'); setLocLoading(false) }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rc) { toast.error('RC Document required'); return }
        setLoading(true)

        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            fd.append('rc_document', rc)
            if (pollution) fd.append('pollution_cert', pollution)
            if (insurance) fd.append('insurance', insurance)

            const { data: vInfo } = await vehicleApi.create(fd)

            // Upload Images
            if (images.length > 0) {
                const imgFd = new FormData()
                images.forEach(img => imgFd.append('images', img))
                await vehicleApi.uploadImages(vInfo.id, imgFd)
            }

            toast.success('Vehicle listed successfully! Pending admin approval.')
            navigate('/owner/my-vehicles')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to list vehicle')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Owner Dashboard</div>
                    <Link to="/owner/dashboard" className="sidebar-link"><LayoutDashboard size={18} /> Overview</Link>
                    <Link to="/owner/my-vehicles" className="sidebar-link"><Car size={18} /> My Vehicles</Link>
                    <Link to="/owner/add-vehicle" className="sidebar-link active"><PlusCircle size={18} /> List New Vehicle</Link>
                    <Link to="/owner/bookings" className="sidebar-link"><CalendarCheck size={18} /> Vehicle Bookings</Link>
                    <Link to="/owner/earnings" className="sidebar-link"><span style={{ width: 18, height: 18, fontSize: '1.1rem', marginTop: -4 }}>₹</span> Earnings</Link>
                </div>
            </aside>

            <main className="dashboard-content">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>List a Vehicle</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Provide details, upload documents, and set your expected earning.</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>

                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Basic Details</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Display Name *</label>
                            <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maruti Swift Dzire" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Brand *</label>
                            <input className="form-control" required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Maruti Suzuki" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model *</label>
                            <input className="form-control" required value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Swift Dzire VXI" />
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Vehicle Type *</label>
                            <select className="form-control" value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
                                <option value="four_wheeler">4 Wheeler (Car)</option>
                                <option value="two_wheeler">2 Wheeler (Bike)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reg. Number *</label>
                            <input className="form-control" required value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} placeholder="MH-01-AB-1234" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year *</label>
                            <input type="number" className="form-control" required value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                        </div>
                    </div>

                    <h3 style={{ margin: '2rem 0 1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Specifications</h3>
                    <div className="grid-4">
                        <div className="form-group">
                            <label className="form-label">Seating Cap.</label>
                            <input type="number" className="form-control" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fuel Type</label>
                            <select className="form-control" value={form.fuel_type} onChange={e => setForm({ ...form, fuel_type: e.target.value })}>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="cng">CNG</option>
                                <option value="ev">Electric</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Transmission</label>
                            <select className="form-control" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Has AC?</label>
                            <select className="form-control" value={form.is_ac ? '1' : '0'} onChange={e => setForm({ ...form, is_ac: e.target.value === '1' })}>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <h3 style={{ margin: '2rem 0 1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Pricing & Limits</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <IndianRupee size={14} style={{ color: 'var(--success)' }} /> Your Expected Earning (/day) *
                            </label>
                            <input type="number" className="form-control" required value={form.owner_expected_price_per_day} onChange={e => setForm({ ...form, owner_expected_price_per_day: e.target.value })} placeholder="e.g. 1500" />
                            <div className="form-hint">Platform fee (15-20%) will be added on top of this.</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Driving Limit (km/day)</label>
                            <input type="number" className="form-control" value={form.max_km_per_day} onChange={e => setForm({ ...form, max_km_per_day: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Avg Mileage (km/L)</label>
                            <input type="number" step="0.1" className="form-control" value={form.average_kmpl} onChange={e => setForm({ ...form, average_kmpl: e.target.value })} />
                        </div>
                    </div>

                    <h3 style={{ margin: '2rem 0 1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Location & Storage</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Address</label>
                            <textarea className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Location where vehicle is parked" />
                        </div>
                        <div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input className="form-control" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input className="form-control" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                                </div>
                            </div>
                            <button type="button" className="btn btn-secondary btn-full btn-sm" onClick={handleLocation} disabled={locLoading}>
                                <MapPin size={14} /> {locLoading ? 'Getting...' : 'Capture GPS Coordinates'}
                            </button>
                        </div>
                    </div>

                    <h3 style={{ margin: '2rem 0 1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Documents & Photos</h3>
                    <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label">RC Document (Image/PDF) *</label>
                            <input type="file" required onChange={e => setRc(e.target.files[0])} className="form-control" style={{ padding: '0.5rem' }} />
                        </div>
                        <div>
                            <label className="form-label">Pollution Cert (Optional)</label>
                            <input type="file" onChange={e => setPollution(e.target.files[0])} className="form-control" style={{ padding: '0.5rem' }} />
                        </div>
                        <div>
                            <label className="form-label">Insurance (Optional)</label>
                            <input type="file" onChange={e => setInsurance(e.target.files[0])} className="form-control" style={{ padding: '0.5rem' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vehicle Photos (Up to 5)</label>
                        <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} className="form-control" style={{ padding: '0.5rem' }} />
                        <div className="form-hint">First image is used as main thumbnail.</div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                            {!loading && 'Submit Vehicle for Review'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
