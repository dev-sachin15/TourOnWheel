import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Car, Shield, MapPin, Star, ArrowRight, ChevronLeft, ChevronRight,
    Bike, Users, TrendingUp, Clock, Lock, Zap, Award, CheckCircle, Search
} from 'lucide-react'
import { vehicleApi } from '../services/api'

const SLIDES = [
    {
        title: "Your Journey, Your Wheels",
        subtitle: "Discover thousands of vehicles available near you. Book in minutes, travel in style.",
        gradient: "linear-gradient(135deg, rgba(108,53,222,0.8) 0%, rgba(76,29,149,0.6) 100%)",
        accent: "#6C35DE",
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80&auto=format&fit=crop"
    },
    {
        title: "Earn With Your Vehicle",
        subtitle: "List your car or bike and start earning every day. Turn your idle vehicle into income.",
        gradient: "linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(217,119,6,0.6) 100%)",
        accent: "#F59E0B",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=80&auto=format&fit=crop"
    },
    {
        title: "Safe & Verified Trips",
        subtitle: "Every vehicle is verified. Every renter is KYC approved. Travel with total peace of mind.",
        gradient: "linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(8,145,178,0.6) 100%)",
        accent: "#06B6D4",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop"
    }
]

const FEATURES = [
    { icon: <MapPin size={24} />, title: "GPS-Based Search", desc: "Find vehicles near your exact location instantly using real-time GPS.", color: "#6C35DE" },
    { icon: <Shield size={24} />, title: "Fully Verified", desc: "All renters and owners go through KYC verification for safe transactions.", color: "#10B981" },
    { icon: <Zap size={24} />, title: "Instant Booking", desc: "Book your vehicle in under 2 minutes with our seamless checkout.", color: "#F59E0B" },
    { icon: <TrendingUp size={24} />, title: "Owner Earnings", desc: "List your vehicle and earn 80-85% of every booking made.", color: "#06B6D4" },
    { icon: <Lock size={24} />, title: "Secure Payments", desc: "Powered by Razorpay with end-to-end encrypted transactions.", color: "#EF4444" },
    { icon: <Award size={24} />, title: "Top Rated Rides", desc: "Only the best rated vehicles make it to our platform.", color: "#8B5CF6" },
]

const STATS = [
    { value: "10,000+", label: "Happy Travelers", icon: <Users size={20} /> },
    { value: "2,500+", label: "Listed Vehicles", icon: <Car size={20} /> },
    { value: "50+", label: "Cities Covered", icon: <MapPin size={20} /> },
    { value: "₹2Cr+", label: "Owner Earnings", icon: <TrendingUp size={20} /> },
]

const HOW_IT_WORKS_USER = [
    { step: 1, title: "Sign Up & KYC", desc: "Create account and upload your driving licence for verification." },
    { step: 2, title: "Find a Vehicle", desc: "Search by location, type, and dates to find the perfect ride." },
    { step: 3, title: "Book & Pay", desc: "Secure checkout with instant booking confirmation." },
    { step: 4, title: "Pick Up & Go", desc: "Navigate to the vehicle using in-app GPS and enjoy your trip." },
]

const HOW_IT_WORKS_OWNER = [
    { step: 1, title: "Register as Owner", desc: "Create your owner account and complete profile." },
    { step: 2, title: "List Your Vehicle", desc: "Add vehicle details, photos, documents, and set your price." },
    { step: 3, title: "Get Verified", desc: "Admin reviews your vehicle documents and approves your listing." },
    { step: 4, title: "Start Earning", desc: "Accept bookings and earn 80-85% of every rental." },
]

function VehicleCard({ vehicle }) {
    const navigate = useNavigate()
    const imageUrl = vehicle.images?.[0]
        ? `/uploads/${vehicle.images[0]}`
        : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80&auto=format&fit=crop'

    return (
        <div className="vehicle-card" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
            <div className="vehicle-card-image">
                <img src={imageUrl} alt={vehicle.name} />
                <div className="vehicle-card-type">
                    {vehicle.vehicle_type === 'two_wheeler' ? <Bike size={12} /> : <Car size={12} />}
                    {vehicle.vehicle_type === 'two_wheeler' ? '2 Wheeler' : '4 Wheeler'}
                </div>
                <div className="vehicle-card-badge">
                    <span className={`badge ${vehicle.status === 'available' || vehicle.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                        {vehicle.status === 'available' || vehicle.status === 'approved' ? 'Available' : 'Booked'}
                    </span>
                </div>
            </div>
            <div className="vehicle-card-body">
                <h4 className="vehicle-card-name">{vehicle.name}</h4>
                <div className="vehicle-card-specs">
                    <span className="vehicle-spec"><Users size={11} /> {vehicle.seats} Seats</span>
                    <span className="vehicle-spec"><Zap size={11} /> {vehicle.fuel_type}</span>
                    {vehicle.is_ac && <span className="vehicle-spec">❄️ AC</span>}
                    <span className="vehicle-spec"><MapPin size={11} /> {vehicle.city || 'Nearby'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div className="vehicle-card-price">
                        <span className="price-amount">₹{Math.round(vehicle.platform_price_per_day)}</span>
                        <span className="price-unit">/day</span>
                    </div>
                    <button className="btn btn-primary btn-sm">Book Now</button>
                </div>
            </div>
        </div>
    )
}

export default function HomePage() {
    const navigate = useNavigate()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [featuredVehicles, setFeaturedVehicles] = useState([])
    const [activeTab, setActiveTab] = useState('user')
    const intervalRef = useRef(null)

    useEffect(() => {
        vehicleApi.search({}).then(({ data }) => {
            setFeaturedVehicles(data.slice(0, 6))
        }).catch(() => { })
    }, [])

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentSlide(s => (s + 1) % SLIDES.length)
        }, 5000)
        return () => clearInterval(intervalRef.current)
    }, [])

    const prevSlide = () => {
        clearInterval(intervalRef.current)
        setCurrentSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)
    }

    const nextSlide = () => {
        clearInterval(intervalRef.current)
        setCurrentSlide(s => (s + 1) % SLIDES.length)
    }

    const slide = SLIDES[currentSlide]

    return (
        <div>
            {/* ===== HERO CAROUSEL ===== */}
            <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    transition: 'all 0.8s ease',
                    filter: 'brightness(0.4)'
                }} />

                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(10,10,15,0.9) 100%)'
                }} />

                {/* Animated Orbs */}
                <div className="hero-bg-orb hero-bg-orb-1" style={{ background: slide.accent }} />
                <div className="hero-bg-orb hero-bg-orb-2" />

                {/* Hero Content */}
                <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ maxWidth: 700 }}
                    >
                        <div className="hero-badge">
                            <Zap size={14} />
                            Book Verified Vehicles Instantly
                        </div>
                        <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                            <span className="gradient-text">{slide.title}</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 560, lineHeight: 1.7 }}>
                            {slide.subtitle}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link to="/vehicles" className="btn btn-primary btn-xl">
                                <Search size={18} /> Find a Vehicle
                            </Link>
                            <Link to="/register?role=owner" className="btn btn-ghost btn-xl">
                                List Your Vehicle <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                            {[['10K+', 'Travelers'], ['2.5K+', 'Vehicles'], ['50+', 'Cities']].map(([val, lbl]) => (
                                <div key={lbl}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{val}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lbl}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Carousel Controls */}
                <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}><ChevronLeft size={20} /></button>
                <button className="carousel-btn carousel-btn-next" onClick={nextSlide}><ChevronRight size={20} /></button>

                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)} style={{
                            width: i === currentSlide ? 24 : 8, height: 8,
                            borderRadius: 4, background: i === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
            </div>

            {/* ===== STATS BAR ===== */}
            <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
                <div className="container">
                    <div className="grid-4" style={{ textAlign: 'center' }}>
                        {STATS.map((s) => (
                            <motion.div key={s.label} whileHover={{ scale: 1.05 }} style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, color: 'var(--primary-light)' }}>
                                    {s.icon}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                            <Star size={14} /> Why TourOnWheel
                        </div>
                        <h2>Everything You Need for the <span className="gradient-text">Perfect Trip</span></h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '1rem auto' }}>
                            We've built every feature you need to rent or list vehicles with confidence.
                        </p>
                    </div>

                    <div className="grid-3 stagger-children">
                        {FEATURES.map((f) => (
                            <motion.div key={f.title} whileHover={{ y: -8 }} className="card card-body" style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: `${f.color}22`, color: f.color, margin: '0 auto 1rem'
                                }}>
                                    {f.icon}
                                </div>
                                <h4 style={{ marginBottom: '0.75rem' }}>{f.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED VEHICLES ===== */}
            {featuredVehicles.length > 0 && (
                <section style={{ padding: '4rem 0 6rem', background: 'var(--bg-surface)' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                            <div>
                                <h2>Featured <span className="gradient-text">Vehicles</span></h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Top-rated vehicles available near you</p>
                            </div>
                            <Link to="/vehicles" className="btn btn-ghost">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid-auto stagger-children">
                            {featuredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== HOW IT WORKS ===== */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2>How It <span className="gradient-text">Works</span></h2>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                        <button
                            className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab('user')}
                        >
                            <Users size={16} /> For Travelers
                        </button>
                        <button
                            className={`btn ${activeTab === 'owner' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab('owner')}
                        >
                            <Car size={16} /> For Vehicle Owners
                        </button>
                    </div>

                    <div className="grid-4">
                        {(activeTab === 'user' ? HOW_IT_WORKS_USER : HOW_IT_WORKS_OWNER).map((item) => (
                            <motion.div key={item.step} whileHover={{ y: -4 }} style={{ textAlign: 'center', padding: '1.5rem' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 800, margin: '0 auto 1rem',
                                    boxShadow: 'var(--shadow-glow)'
                                }}>
                                    {item.step}
                                </div>
                                <h4 style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section style={{ padding: '6rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} viewport={{ once: true }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1.25rem', borderRadius: '999px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1.5rem'
                        }}>
                            <CheckCircle size={14} /> Trusted by 10,000+ travelers
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Ready to Start Your <span className="gradient-text">Adventure?</span></h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                            Join thousands of travelers who trust TourOnWheel for their journeys. Sign up free today.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary btn-xl animate-pulse-glow">
                                Start for Free <ArrowRight size={18} />
                            </Link>
                            <Link to="/vehicles" className="btn btn-ghost btn-xl">
                                <Search size={18} /> Browse Vehicles
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '3rem 0 2rem' }}>
                <div className="container">
                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                                <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Car size={18} color="white" />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>TourOnWheel</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>Your trusted platform for vehicle rentals across India.</p>
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link to="/vehicles" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Find Vehicles</Link>
                                <Link to="/register?role=owner" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>List Vehicle</Link>
                            </div>
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Login</Link>
                                <Link to="/register" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Register</Link>
                            </div>
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</h5>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>support@touronwheel.in</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>© 2024 TourOnWheel. All rights reserved.</p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Privacy Policy</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
