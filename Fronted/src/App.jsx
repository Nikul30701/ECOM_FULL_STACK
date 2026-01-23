import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useCart } from './context/CartContext'
import LoginPage from './components/LoginPage'
import Header from './components/Header'
import ShopPage from './components/ShopPage'
import CartPage from './components/CartPage'
import AdminDashboard from './components/AdminDashboard'
import { authAPI } from './services/api'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const { addToCart, cartCount } = useCart()

  // 🔑 reload pe auth restore
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      try {
        const user = await authAPI.getProfile()
        setCurrentUser(user)
      } catch {
        localStorage.clear()
        setCurrentUser(null)
      }
    }

    initAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser && (
        <Header
          currentUser={currentUser}
          onLogout={() => {
            localStorage.clear()
            setCurrentUser(null)
          }}
          cartCount={cartCount}
        />
      )}

      <Routes>
        <Route
          path="/login"
          element={
            currentUser
              ? <Navigate to="/" />
              : <LoginPage onLogin={setCurrentUser} />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ShopPage onAddToCart={addToCart} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {currentUser?.role === 'admin'
                ? <AdminDashboard />
                : <Navigate to="/" />}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
