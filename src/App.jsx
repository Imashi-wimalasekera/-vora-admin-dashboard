import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import PaymentsPage from './pages/PaymentsPage'
import CouponsPage from './pages/CouponsPage'
import InventoryPage from './pages/InventoryPage'
import ReportsPage from './pages/ReportsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

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
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="products"      element={<ProductsPage />} />
          <Route path="categories"    element={<CategoriesPage />} />
          <Route path="orders"        element={<OrdersPage />} />
          <Route path="users"         element={<UsersPage />} />
          <Route path="payments"      element={<PaymentsPage />} />
          <Route path="coupons"       element={<CouponsPage />} />
          <Route path="inventory"     element={<InventoryPage />} />
          <Route path="reports"       element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings"      element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}