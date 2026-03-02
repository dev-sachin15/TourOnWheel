import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import KYCPage from './pages/KYCPage'
import VehicleSearchPage from './pages/VehicleSearchPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import MyBookingsPage from './pages/MyBookingsPage'
import PickupMapPage from './pages/PickupMapPage'

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import MyVehiclesPage from './pages/owner/MyVehiclesPage'
import AddVehiclePage from './pages/owner/AddVehiclePage'
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage'
import OwnerEarningsPage from './pages/owner/OwnerEarningsPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminKYCPage from './pages/admin/AdminKYCPage'
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminEarningsPage from './pages/admin/AdminEarningsPage'

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth()
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><LoadingSpinner /></div>
    if (!user) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
    return children
}

function LoadingSpinner() {
    return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{
                width: 48, height: 48, border: '4px solid rgba(108,53,222,0.2)',
                borderTopColor: 'var(--primary)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto'
            }} />
        </div>
    )
}

function AppRoutes() {
    const { user } = useAuth()
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
                <Route path="/vehicles" element={<VehicleSearchPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

                {/* Auth required */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
                <Route path="/checkout/:bookingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                <Route path="/bookings/:id/pickup" element={<ProtectedRoute><PickupMapPage /></ProtectedRoute>} />

                {/* Owner Routes */}
                <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerDashboardPage /></ProtectedRoute>} />
                <Route path="/owner/my-vehicles" element={<ProtectedRoute roles={['owner', 'admin']}><MyVehiclesPage /></ProtectedRoute>} />
                <Route path="/owner/add-vehicle" element={<ProtectedRoute roles={['owner', 'admin']}><AddVehiclePage /></ProtectedRoute>} />
                <Route path="/owner/bookings" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerBookingsPage /></ProtectedRoute>} />
                <Route path="/owner/earnings" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerEarningsPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/kyc" element={<ProtectedRoute roles={['admin']}><AdminKYCPage /></ProtectedRoute>} />
                <Route path="/admin/vehicles" element={<ProtectedRoute roles={['admin']}><AdminVehiclesPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookingsPage /></ProtectedRoute>} />
                <Route path="/admin/earnings" element={<ProtectedRoute roles={['admin']}><AdminEarningsPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
