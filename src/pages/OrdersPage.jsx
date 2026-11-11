import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import {
  Package,
  Clock,
  CheckCircle,
  PackageOpen,
  LayoutGrid,
  ShoppingBag,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cancelOrder } from '../services/orderService'

const sortNewestFirst = (list = []) =>
  [...list].sort((a, b) => {
    const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0
    return timeB - timeA
  })

const getOrderStatusInfo = (status) => {
  const s = (status || '').toLowerCase()

  if (s.includes('cancel')) {
    return {
      key: 'cancelled',
      badge: 'Cancelled',
      title: 'Order Cancelled',
      message: 'This order has been cancelled.',
      bg: '#FEF2F2',
      border: 'rgba(239, 68, 68, 0.2)',
      text: '#DC2626',
      dot: '#EF4444',
      Icon: AlertCircle,
    }
  }

  if (s.includes('complete') || s.includes('deliver')) {
    return {
      key: 'completed',
      badge: 'Preparing Completed',
      title: 'Preparing Completed',
      message: 'Your order is freshly packed — within a short period, we will reach you!',
      bg: '#ECFDF5',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#047857',
      dot: '#10B981',
      Icon: CheckCircle,
    }
  }

  if (s.includes('making') || s.includes('prepar') || s.includes('process')) {
    return {
      key: 'preparing',
      badge: 'Preparing Mode',
      title: 'Preparing Mode',
      message: 'Our kitchen is freshly preparing your order right now.',
      bg: '#EFF6FF',
      border: 'rgba(59, 130, 246, 0.25)',
      text: '#1D4ED8',
      dot: '#3B82F6',
      Icon: Sparkles,
    }
  }

  return {
    key: 'pending',
    badge: 'Pending',
    title: 'Pending',
    message: 'Order booked! Waiting for our team to start preparing it.',
    bg: '#FFF8E6',
    border: 'rgba(200, 150, 12, 0.28)',
    text: '#B45309',
    dot: '#F59E0B',
    Icon: Clock,
  }
}

const OrderStatusBanner = ({ status }) => {
  const info = getOrderStatusInfo(status)
  const StatusIcon = info.Icon

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        background: info.bg,
        border: `1px solid ${info.border}`,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        <StatusIcon size={18} color={info.text} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: info.text,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: info.dot,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          {info.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#555',
            marginTop: 2,
            fontFamily: 'Poppins, sans-serif',
            lineHeight: 1.45,
          }}
        >
          {info.message}
        </div>
      </div>
    </div>
  )
}

const OrderCardFrame = ({
  order,
  orderType,
  onNavigate,
  onCancelClick,
  onDeleteClick,
  children,
  footerTotal,
  footerRightExtra,
}) => {
  const statusInfo = getOrderStatusInfo(order.order_status)

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onNavigate}
      style={{
        background: '#fff',
        borderRadius: 24,
        border: '1px solid rgba(200,150,12,0.12)',
        padding: '26px 28px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <button
        type="button"
        aria-label="Remove order from history"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteClick(order.id, orderType)
        }}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.04)',
          border: 'none',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#999',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
      >
        <X size={16} />
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 18,
          paddingRight: 44,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Order ID
          </div>
          <div style={{ fontWeight: 700, color: '#2C1200', fontSize: 15 }}>
            #{order.order_number}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: statusInfo.bg,
              color: statusInfo.text,
              border: `1px solid ${statusInfo.border}`,
            }}
          >
            {statusInfo.badge}
          </span>

          {statusInfo.key === 'pending' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCancelClick(order.id, orderType)
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                background: '#FEF2F2',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                cursor: 'pointer',
              }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <OrderStatusBanner status={order.order_status} />

      {statusInfo.key === 'cancelled' && order.cancel_reason && (
        <div
          style={{
            fontSize: 12,
            color: '#DC2626',
            background: '#FEF2F2',
            padding: '8px 12px',
            borderRadius: 10,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          Cancel Reason: {order.cancel_reason}
        </div>
      )}

      {children}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, color: '#666' }}>
          <Clock size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: '-2px' }} />
          {order.created_at
            ? new Date(order.created_at).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>

        <div style={{ textAlign: 'right' }}>
          {footerRightExtra}
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Total Amount</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#C8960C' }}>
            ₹{Number(footerTotal || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [customOrders, setCustomOrders] = useState([])
  const [activeTab, setActiveTab] = useState('product')
  const [hasChosenTab, setHasChosenTab] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, type: null })
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchOrders = useCallback(async ({ showSpinner = true } = {}) => {
    if (!user?.email) return
    try {
      if (showSpinner) setLoading(true)

      const [{ data: pOrders, error: pError }, { data: cOrders, error: cError }] = await Promise.all([
        supabase
          .from('product_orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('customized_orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false }),
      ])

      if (pError) throw pError
      if (cError) throw cError

      const sortedNormal = sortNewestFirst(pOrders || [])
      const sortedCustom = sortNewestFirst(cOrders || [])
      setOrders(sortedNormal)
      setCustomOrders(sortedCustom)

      if (!hasChosenTab) {
        if (sortedNormal.length === 0 && sortedCustom.length > 0) {
          setActiveTab('custom')
        } else if (sortedNormal.length > 0 && sortedCustom.length > 0) {
          const latestNormalTime = new Date(sortedNormal[0].created_at || 0).getTime()
          const latestCustomTime = new Date(sortedCustom[0].created_at || 0).getTime()
          setActiveTab(latestCustomTime > latestNormalTime ? 'custom' : 'product')
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email, hasChosenTab])

  useEffect(() => {
    if (user?.email) {
      fetchOrders()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user?.email, authLoading, fetchOrders])

  // Auto-refresh order status on window focus / visibility change and periodic polling
  useEffect(() => {
    if (!user?.email) return

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders({ showSpinner: false })
      }
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    const interval = setInterval(refresh, 25000)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
      clearInterval(interval)
    }
  }, [user?.email, fetchOrders])

  const handleTabChange = (tab) => {
    setHasChosenTab(true)
    setActiveTab(tab)
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return
    setIsCancelling(true)
    try {
      const { error } = await cancelOrder(cancelModal.orderId, cancelModal.type, cancelReason.trim())
      if (error) throw error

      await fetchOrders({ showSpinner: false })
      setCancelModal({ isOpen: false, orderId: null, type: null })
      setCancelReason('')
      alert('Order cancelled successfully.')
    } catch (err) {
      console.error('Error cancelling order:', err)
      alert('Failed to cancel order. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleDeleteOrder = async (orderId, type) => {
    if (!window.confirm('Are you sure you want to remove this order from your history? This action cannot be undone.')) return

    try {
      const table = type === 'normal' ? 'product_orders' : 'customized_orders'
      const { error } = await supabase.from(table).delete().eq('id', orderId)
      if (error) throw error

      await fetchOrders({ showSpinner: false })
    } catch (err) {
      console.error('Error deleting order:', err)
      alert('Failed to remove order. Please try again.')
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF5E1' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '4px solid rgba(200,150,12,0.1)', borderTopColor: '#C8960C', borderRadius: '50%' }}
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF5E1', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, color: '#2C1200', marginBottom: 16 }}>Please Login to view orders</h2>
        <p style={{ color: '#666', marginBottom: 32 }}>Unlock your order history and track your healthy treats.</p>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Login Now</Link>
      </div>
    )
  }

  const hasNoOrders = orders.length === 0 && customOrders.length === 0

  return (
    <div style={{ background: '#FFF5E1', minHeight: '100vh', paddingTop: 112, paddingBottom: 80 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
        <header style={{ marginBottom: 32, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label">Order History</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
              My <span className="gold">Orders</span>
            </h1>
          </motion.div>
        </header>

        {hasNoOrders ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 32, border: '1px solid rgba(200,150,12,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'inline-flex', background: '#FFF5E1', padding: 24, borderRadius: '50%', marginBottom: 24 }}>
              <PackageOpen size={48} color="#C8960C" />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#2C1200', marginBottom: 12 }}>No orders yet</h3>
            <p style={{ color: '#666', marginBottom: 32 }}>Your journey with Kbite starts with your first order.</p>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>Start Shopping</Link>
          </motion.div>
        ) : (
          <div>
            {/* Top Order Type Tabs */}
            <div
              role="tablist"
              aria-label="Order categories"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 32,
              }}
            >
              {[
                { id: 'product', label: 'Product Orders', count: orders.length, Icon: ShoppingBag },
                { id: 'custom', label: 'Customized Orders', count: customOrders.length, Icon: LayoutGrid },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 22px',
                      borderRadius: 14,
                      border: isActive ? '1.5px solid #C8960C' : '1.5px solid rgba(200,150,12,0.2)',
                      background: isActive ? '#C8960C' : '#fff',
                      color: isActive ? '#fff' : '#2C1200',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 8px 20px rgba(200,150,12,0.25)' : '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {React.createElement(tab.Icon, { size: 17 })}
                    <span>{tab.label}</span>
                    <span
                      style={{
                        padding: '2px 9px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.22)' : '#FFF5E1',
                        color: isActive ? '#fff' : '#C8960C',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {activeTab === 'product' && (
              orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 24, border: '1px solid rgba(200,150,12,0.1)' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 8 }}>No Product Orders yet</p>
                  <p style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>Browse our handcrafted ladoos and dry fruits to place a product order.</p>
                  <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Products</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {orders.map((order) => (
                    <OrderCardFrame
                      key={order.id}
                      order={order}
                      orderType="normal"
                      footerTotal={order.total}
                      onNavigate={() => {
                        const firstItem = order.items?.[0]
                        const productId = firstItem?.product_id || firstItem?.id
                        navigate(productId ? `/product/${productId}` : '/products')
                      }}
                      onCancelClick={(id, type) => setCancelModal({ isOpen: true, orderId: id, type })}
                      onDeleteClick={handleDeleteOrder}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', padding: '18px 0', marginBottom: 18 }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 42, height: 42, background: '#FFF5E1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Package size={19} color="#C8960C" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#2C1200', fontSize: 14 }}>
                                  {item.name}
                                  {item.selected_size ? <span style={{ color: '#888', fontWeight: 500 }}> ({item.selected_size})</span> : null}
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>Qty: {item.quantity || item.qty} | ₹{item.price}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 600, color: '#2C1200', whiteSpace: 'nowrap' }}>
                              ₹{(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </OrderCardFrame>
                  ))}
                </div>
              )
            )}

            {activeTab === 'custom' && (
              customOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 24, border: '1px solid rgba(200,150,12,0.1)' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 8 }}>No Customized Orders yet</p>
                  <p style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>Build your own custom laddu with your favourite nuts and ingredients.</p>
                  <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Customize a Laddu</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {customOrders.map((order) => (
                    <OrderCardFrame
                      key={order.id}
                      order={order}
                      orderType="custom"
                      footerTotal={order.total_price}
                      footerRightExtra={
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>
                          Qty: {order.quantity}
                        </div>
                      }
                      onNavigate={() => navigate('/products')}
                      onCancelClick={(id, type) => setCancelModal({ isOpen: true, orderId: id, type })}
                      onDeleteClick={handleDeleteOrder}
                    >
                      <div style={{ background: '#FFFBF4', borderRadius: 16, padding: 20, marginBottom: 18, border: '1px dashed rgba(200,150,12,0.22)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <h3 style={{ fontWeight: 700, color: '#2C1200', fontSize: 16 }}>{order.customized_product_name}</h3>
                          {order.customizations?.size && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#C8960C' }}>
                              {order.customizations.size}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {order.ingredients?.map((ing, idx) => (
                            <span key={idx} style={{ background: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: '#666', border: '1px solid #f0f0f0' }}>
                              {typeof ing === 'object' ? ing.name : ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    </OrderCardFrame>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Cancel Reason Modal */}
      <AnimatePresence>
        {cancelModal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ position: 'relative', width: '100%', maxWidth: 450, background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <button
                type="button"
                onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                <X size={24} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#FEF2F2', padding: 12, borderRadius: '50%' }}>
                  <AlertCircle color="#EF4444" size={24} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#2C1200' }}>Cancel Order</h3>
              </div>

              <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
                Please let us know the reason for cancellation. This helps us improve our service.
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2C1200', marginBottom: 8 }}>
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Changed my mind, Ordered by mistake..."
                  style={{ width: '100%', height: 120, padding: 16, borderRadius: 12, border: '1.5px solid #eee', background: '#f9f9f9', outline: 'none', fontSize: 14, fontFamily: 'inherit', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
                  style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #eee', background: '#fff', color: '#666', fontWeight: 600, cursor: 'pointer' }}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={isCancelling || !cancelReason.trim()}
                  onClick={handleCancelOrder}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 12,
                    border: 'none',
                    background: cancelReason.trim() ? '#EF4444' : '#fee2e2',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: cancelReason.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrdersPage
