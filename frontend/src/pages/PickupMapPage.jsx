import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Navigation, CheckCircle, Crosshair } from 'lucide-react'
import { bookingApi, vehicleApi } from '../services/api'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to dynamically set map bounds
function MapBounds({ userLoc, vehicleLoc }) {
    const map = useMap()
    useEffect(() => {
        if (userLoc && vehicleLoc) {
            const bounds = L.latLngBounds([userLoc, vehicleLoc])
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        } else if (vehicleLoc) {
            map.setView(vehicleLoc, 15)
        }
    }, [userLoc, vehicleLoc, map])
    return null
}

export default function PickupMapPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [vehicle, setVehicle] = useState(null)
    const [userLoc, setUserLoc] = useState(null)
    const [vehLoc, setVehLoc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [pickupLoading, setPickupLoading] = useState(false)

    useEffect(() => {
        bookingApi.getById(id).then(async ({ data }) => {
            setBooking(data)
            const { data: v } = await vehicleApi.getById(data.vehicle_id)
            setVehicle(v)
            if (v.current_lat && v.current_lng) {
                setVehLoc([v.current_lat, v.current_lng])
            }
        }).catch(() => navigate('/bookings')).finally(() => setLoading(false))

        // Get user GPS
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.log('Location error:', err),
            { enableHighAccuracy: true }
        )
    }, [id])

    const handlePickup = async () => {
        setPickupLoading(true)
        try {
            await bookingApi.pickup(id)
            toast.success('Vehicle Picked Up! Safe travels.')
            navigate('/bookings')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to mark pickup')
        } finally {
            setPickupLoading(false)
        }
    }

    const openGoogleMaps = () => {
        if (!vehLoc) return
        const url = `https://www.google.com/maps/dir/?api=1&destination=${vehLoc[0]},${vehLoc[1]}`
        window.open(url, '_blank')
    }

    if (loading) return <div className="page-wrapper"><div className="container" style={{ padding: '2rem' }}>Loading map...</div></div>

    return (
        <div className="page-wrapper">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Vehicle Pickup Location</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Navigate to the vehicle and click Pick Up when you take possession.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                    {/* Map */}
                    <div className="glass-card" style={{ overflow: 'hidden', padding: 4 }}>
                        <div style={{ position: 'relative', height: 500, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                            {vehLoc ? (
                                <MapContainer center={vehLoc} zoom={13} style={{ width: '100%', height: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                    <Marker position={vehLoc}>
                                        <Popup><strong>{vehicle?.name}</strong><br />{vehicle?.address}</Popup>
                                    </Marker>
                                    {userLoc && (
                                        <Marker position={userLoc} icon={userIcon}>
                                            <Popup>Your Location</Popup>
                                        </Marker>
                                    )}
                                    <MapBounds userLoc={userLoc} vehicleLoc={vehLoc} />
                                </MapContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                                    <p style={{ color: 'var(--text-muted)' }}><Crosshair size={24} style={{ display: 'block', margin: '0 auto 10px' }} /> GPS location not provided by owner</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Sidebar */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', margin: '0 auto 1rem', overflow: 'hidden' }}>
                                <img src={vehicle?.images?.[0] ? `/uploads/${vehicle.images[0]}` : '#'} alt={vehicle?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                            </div>
                            <h3 style={{ fontWeight: 700 }}>{vehicle?.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vehicle?.registration_number}</p>
                        </div>

                        <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <MapPin size={16} style={{ color: 'var(--primary-light)', marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{vehicle?.address || 'Address not provided'}</span>
                            </div>
                        </div>

                        {vehLoc && (
                            <button className="btn btn-secondary btn-full" style={{ marginBottom: '1rem' }} onClick={openGoogleMaps}>
                                <Navigation size={16} /> Get Directions (GMap)
                            </button>
                        )}

                        <button className={`btn btn-primary btn-full btn-lg ${pickupLoading ? 'btn-loading' : ''}`} onClick={handlePickup} disabled={pickupLoading}>
                            {!pickupLoading && <><CheckCircle size={18} /> Confirm Pick Up</>}
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                            Only click this once you have keys and inspected the vehicle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
