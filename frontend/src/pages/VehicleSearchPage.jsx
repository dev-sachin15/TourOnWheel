import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Filter, Car, Bike, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { vehicleApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function VehicleCard({ vehicle, onClick }) {
    const imageUrl = vehicle.images?.[0]
        ? `/uploads/${vehicle.images[0]}`
        : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80&auto=format&fit=crop'

    const isAvailable = ['available', 'approved'].includes(vehicle.status)

    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="vehicle-card"
            onClick={onClick}
        >
            <div className="vehicle-card-image">
                <img src={imageUrl} alt={vehicle.name} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80' }} />
                <div className="vehicle-card-type">
                    {vehicle.vehicle_type === 'two_wheeler' ? <Bike size={12} /> : <Car size={12} />}
                    {vehicle.vehicle_type === 'two_wheeler' ? '2 Wheeler' : '4 Wheeler'}
                </div>
                <div className="vehicle-card-badge">
                    <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
                        {isAvailable ? '✓ Available' : '✗ Booked'}
                    </span>
                </div>
            </div>
            <div className="vehicle-card-body">
                <h4 className="vehicle-card-name">{vehicle.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{vehicle.brand} {vehicle.model} • {vehicle.year}</p>
                <div className="vehicle-card-specs">
                    <span className="vehicle-spec">👥 {vehicle.seats} seats</span>
                    <span className="vehicle-spec">⛽ {vehicle.fuel_type}</span>
                    {vehicle.is_ac && <span className="vehicle-spec">❄️ AC</span>}
                    <span className="vehicle-spec">🛣️ {vehicle.max_km_per_day}km/day</span>
                    {vehicle.city && <span className="vehicle-spec"><MapPin size={10} /> {vehicle.city}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                            ₹{Math.round(vehicle.platform_price_per_day)}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/day</span>
                    </div>
                    <button className="btn btn-primary btn-sm">View Details</button>
                </div>
            </div>
        </motion.div>
    )
}

export default function VehicleSearchPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [filters, setFilters] = useState({
        lat: null, lng: null,
        vehicle_type: '',
        from_date: '', to_date: '',
        city: '',
        min_price: '', max_price: '',
        is_ac: ''
    })

    const loadVehicles = async (f = filters) => {
        setLoading(true)
        try {
            const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== null))
            const { data } = await vehicleApi.search(params)
            setVehicles(data)
        } catch {
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadVehicles() }, [])

    const getLocation = () => {
        setLocationLoading(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const updated = { ...filters, lat: pos.coords.latitude, lng: pos.coords.longitude }
                setFilters(updated)
                loadVehicles(updated)
                setLocationLoading(false)
            },
            () => {
                setLocationLoading(false)
                alert('Location access denied. Please enable location permissions.')
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleSearch = (e) => { e.preventDefault(); loadVehicles() }

    const handleReset = () => {
        const reset = { lat: null, lng: null, vehicle_type: '', from_date: '', to_date: '', city: '', min_price: '', max_price: '', is_ac: '' }
        setFilters(reset)
        loadVehicles(reset)
    }

    return (
        <div className="page-wrapper">
            <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Find Your Perfect Ride</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Search available vehicles near you</p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            {/* Location */}
                            <div style={{ flex: 1, minWidth: 180 }}>
                                <label className="form-label">City</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="form-control"
                                        style={{ paddingLeft: 32 }}
                                        placeholder="e.g. Mumbai"
                                        value={filters.city}
                                        onChange={e => setFilters({ ...filters, city: e.target.value })}
                                        id="search-city"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Type */}
                            <div style={{ minWidth: 150 }}>
                                <label className="form-label">Vehicle Type</label>
                                <select className="form-control" value={filters.vehicle_type} onChange={e => setFilters({ ...filters, vehicle_type: e.target.value })} id="search-type">
                                    <option value="">All Types</option>
                                    <option value="two_wheeler">2 Wheeler</option>
                                    <option value="four_wheeler">4 Wheeler</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div style={{ minWidth: 150 }}>
                                <label className="form-label">From Date</label>
                                <input type="date" className="form-control" value={filters.from_date} min={new Date().toISOString().split('T')[0]} onChange={e => setFilters({ ...filters, from_date: e.target.value })} id="search-from-date" />
                            </div>
                            <div style={{ minWidth: 150 }}>
                                <label className="form-label">To Date</label>
                                <input type="date" className="form-control" value={filters.to_date} min={filters.from_date || new Date().toISOString().split('T')[0]} onChange={e => setFilters({ ...filters, to_date: e.target.value })} id="search-to-date" />
                            </div>

                            {/* AC filter */}
                            <div style={{ minWidth: 120 }}>
                                <label className="form-label">AC</label>
                                <select className="form-control" value={filters.is_ac} onChange={e => setFilters({ ...filters, is_ac: e.target.value })} id="search-ac">
                                    <option value="">Any</option>
                                    <option value="true">With AC</option>
                                    <option value="false">Without AC</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={getLocation} disabled={locationLoading} style={{ whiteSpace: 'nowrap' }} id="use-location">
                                    <MapPin size={15} /> {locationLoading ? 'Getting...' : 'Use My Location'}
                                </button>
                                <button type="submit" className="btn btn-primary" id="search-submit">
                                    <Search size={16} /> Search
                                </button>
                                <button type="button" className="btn btn-ghost btn-icon" onClick={handleReset} title="Reset filters" id="reset-filters">
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Results header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontWeight: 700 }}>
                            {loading ? 'Searching...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`}
                        </h3>
                        {filters.lat && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 Sorted by distance from your location</p>}
                    </div>
                    {filters.lat && (
                        <span className="badge badge-info">
                            <MapPin size={10} /> Location Active
                        </span>
                    )}
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid-auto">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <div className="skeleton" style={{ height: 220 }} />
                                <div style={{ padding: '1.25rem' }}>
                                    <div className="skeleton" style={{ height: 20, marginBottom: 12, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 4 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results */}
                {!loading && vehicles.length === 0 && (
                    <div className="empty-state">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No vehicles found</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your filters or search in a different city.</p>
                        <button className="btn btn-ghost" onClick={handleReset}>Clear all filters</button>
                    </div>
                )}

                {/* Vehicle Grid */}
                {!loading && vehicles.length > 0 && (
                    <div className="grid-auto">
                        {vehicles.map(v => (
                            <VehicleCard
                                key={v.id}
                                vehicle={v}
                                onClick={() => navigate(`/vehicles/${v.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
