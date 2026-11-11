import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  ShoppingBag,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import customCardBanner from '../assets/images/custom_laddu_banner.png'

const HIDDEN_ROUTES = ['/cart', '/checkout', '/login']

const formatRupees = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function FloatingCart() {
  const { items, count, total, isOpen: isCartDrawerOpen, setIsOpen, updateQty, removeFromCart } = useCart()
  const [collapsedCount, setCollapsedCount] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null
  }

  const hasItems = items.length > 0 && count > 0
  const isPanelOpen = hasItems && !isCartDrawerOpen && collapsedCount !== count

  const handleFloatingButtonClick = () => {
    if (!hasItems) {
      setIsOpen(true)
      return
    }
    setCollapsedCount(isPanelOpen ? count : null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {/* Selected Item Details Card above the Floating Shopping Cart Logo */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              width: 'min(340px, calc(100vw - 32px))',
              background: '#FFFBF4',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1.5px solid rgba(200, 150, 12, 0.35)',
              boxShadow: '0 22px 50px rgba(26, 8, 2, 0.25)',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2D0C06 0%, #44130A 100%)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                color: '#FFF5E1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <ShoppingBag size={16} color="#F0D060" />
                <span
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Selected in Cart ({count})
                </span>
              </div>

              <button
                type="button"
                aria-label="Minimize selected items preview"
                onClick={() => setCollapsedCount(count)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF5E1',
                  cursor: 'pointer',
                }}
              >
                <ChevronDown size={15} />
              </button>
            </div>

            {/* Selected Items List */}
            <div
              style={{
                maxHeight: 'min(260px, 42vh)',
                overflowY: 'auto',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {items.map((item) => {
                const isCustom = item.type === 'customized'
                const imgSrc = isCustom
                  ? customCardBanner
                  : (item.image || '').replace('http://', 'https://')

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      background: '#fff',
                      padding: '10px 10px',
                      borderRadius: 12,
                      border: '1px solid rgba(200, 150, 12, 0.14)',
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name || 'Selected item'}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: '#FFF5E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Package size={18} color="#C8960C" />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#2C1200',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#B8A896',
                            cursor: 'pointer',
                            padding: 2,
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {item.selected_size && (
                        <div
                          style={{
                            display: 'inline-block',
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: '#9A6F00',
                            background: '#FFF4DA',
                            padding: '1px 7px',
                            borderRadius: 99,
                            marginTop: 2,
                          }}
                        >
                          {item.selected_size}
                        </div>
                      )}

                      {isCustom && item.customizations?.varieties && (
                        <div
                          style={{
                            fontSize: 10.5,
                            color: '#78624D',
                            marginTop: 3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.customizations.varieties}
                          {Array.isArray(item.ingredients) && item.ingredients.length > 0
                            ? ` · ${item.ingredients.length} ingredients`
                            : ''}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 6,
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            border: '1px solid rgba(200,150,12,0.28)',
                            borderRadius: 8,
                            padding: '2px 6px',
                            background: '#FFFDF9',
                          }}
                        >
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.id, Number(item.qty) - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              color: '#C8960C',
                              padding: 2,
                            }}
                          >
                            <Minus size={11} />
                          </button>
                          <span
                            style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#2C1200',
                              minWidth: 16,
                              textAlign: 'center',
                            }}
                          >
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, Number(item.qty) + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              color: '#C8960C',
                              padding: 2,
                            }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span
                          style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#C8960C',
                          }}
                        >
                          ₹{formatRupees(Number(item.price || 0) * Number(item.qty || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: '11px 14px',
                background: '#fff',
                borderTop: '1px solid rgba(200, 150, 12, 0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: '#78624D' }}>
                  Subtotal
                </span>
                <span
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#2C1200',
                  }}
                >
                  ₹{formatRupees(total)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(200, 150, 12, 0.35)',
                    background: '#FFFDF8',
                    color: '#2C1200',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View Cart
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #C8960C 0%, #A97B06 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  Checkout
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Shopping Cart Button (Replaces WhatsApp Logo) */}
      <motion.button
        type="button"
        aria-label={hasItems ? `View ${count} selected cart items` : 'Open shopping cart'}
        onClick={handleFloatingButtonClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'relative',
          height: 54,
          minWidth: 54,
          padding: hasItems && !isPanelOpen ? '0 16px' : 0,
          borderRadius: 99,
          border: '2px solid rgba(240, 208, 96, 0.6)',
          background: 'linear-gradient(135deg, #C8960C 0%, #9E7204 100%)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 8px 26px rgba(200, 150, 12, 0.45)',
        }}
      >
        <ShoppingCart size={23} color="#fff" />
        {hasItems && !isPanelOpen && (
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 12.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {count} {count === 1 ? 'Item' : 'Items'} · ₹{formatRupees(total)}
          </span>
        )}
        {hasItems && (
          <span
            style={{
              position: 'absolute',
              top: -5,
              right: -4,
              minWidth: 21,
              height: 21,
              padding: '0 5px',
              borderRadius: '50%',
              background: '#2D0C06',
              color: '#F0D060',
              border: '1.5px solid #F0D060',
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {count}
          </span>
        )}
      </motion.button>
    </div>
  )
}
