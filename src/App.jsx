import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminCategories from './pages/AdminCategories'
import AdminOrders from './pages/AdminOrders'
import AdminUsers from './pages/AdminUsers'
import AdminPayments from './pages/AdminPayments'
import AdminCoupons from './pages/AdminCoupons'
import AdminInventory from './pages/AdminInventory'
import AdminReports from './pages/AdminReports'
import AdminNotifications from './pages/AdminNotifications'
import AdminSettings from './pages/AdminSettings'

const isAuthenticated = () => !!sessionStorage.getItem('token')

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#fff', color: '#1c2f2f', border: '1px solid #dde8e8', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#2a9d6b', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e05a5a', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="products"      element={<AdminProducts />} />
          <Route path="categories"    element={<AdminCategories />} />
          <Route path="orders"        element={<AdminOrders />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="payments"      element={<AdminPayments />} />
          <Route path="coupons"       element={<AdminCoupons />} />
          <Route path="inventory"     element={<AdminInventory />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}