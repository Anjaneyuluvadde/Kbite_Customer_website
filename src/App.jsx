import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

import SplashScreen from './components/SplashScreen'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import FloatingCart from './components/FloatingCart'
import ScrollToTop from './components/ScrollToTop'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import LoginPage from './pages/LoginPage'
import WishlistPage from './pages/WishlistPage'
import SchoolAndIT from './pages/SchoolAndIT'
import OrdersPage from './pages/OrdersPage'
import PoliciesPage from './pages/PoliciesPage'

function PageWrap({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap><HomePage /></PageWrap>} />
          <Route path="/products" element={<PageWrap><ProductsPage /></PageWrap>} />
          <Route path="/product/:id" element={<PageWrap><ProductDetailPage /></PageWrap>} />
          <Route path="/cart" element={<PageWrap><CartPage /></PageWrap>} />
          <Route path="/checkout" element={<PageWrap><CheckoutPage /></PageWrap>} />
          <Route path="/order-success" element={<PageWrap><OrderSuccessPage /></PageWrap>} />
          <Route path="/login" element={<PageWrap><LoginPage /></PageWrap>} />
          <Route path="/wishlist" element={<PageWrap><WishlistPage /></PageWrap>} />
          <Route path="/school-it" element={<PageWrap><SchoolAndIT /></PageWrap>} />
          <Route path="/orders" element={<PageWrap><OrdersPage /></PageWrap>} />
          <Route path="/policies" element={<PageWrap><PoliciesPage /></PageWrap>} />
          <Route path="/about" element={<PageWrap><PoliciesPage initialTab="about" /></PageWrap>} />
          <Route path="/contact" element={<PageWrap><PoliciesPage initialTab="contact" /></PageWrap>} />
          <Route path="/pricing" element={<PageWrap><PoliciesPage initialTab="pricing" /></PageWrap>} />
          <Route path="/terms" element={<PageWrap><PoliciesPage initialTab="terms" /></PageWrap>} />
          <Route path="/privacy" element={<PageWrap><PoliciesPage initialTab="privacy" /></PageWrap>} />
          <Route path="/refund-policy" element={<PageWrap><PoliciesPage initialTab="refund" /></PageWrap>} />
          <Route path="*" element={
            <PageWrap>
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF5E1', textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: 72, marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🪈</div>
                <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 56, fontWeight: 900, color: '#C8960C', marginBottom: 12 }}>404</h1>
                <p style={{ fontFamily: 'Poppins,sans-serif', color: '#aaa', fontSize: 16, marginBottom: 28 }}>This page was lost in the divine leela.</p>
                <a href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Return Home</a>
              </div>
            </PageWrap>
          } />
        </Routes>
      </AnimatePresence>
      <Footer />
      <FloatingCart />
    </>
  )
}

export default function App() {
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2100)
    return () => clearTimeout(t)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2200,
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid rgba(200,150,12,0.22)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(200,150,12,0.1)',
              },
            }}
          />
          <AnimatePresence>
            {splash && <SplashScreen onDone={() => setSplash(false)} />}
          </AnimatePresence>
          {!splash && <AppRoutes />}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
