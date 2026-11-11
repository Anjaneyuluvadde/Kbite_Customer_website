import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus,
  Minus,
  Check,
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Scale,
  ShoppingBag,
  Layers,
  Leaf,
} from 'lucide-react'
import customCardBanner from '../assets/images/custom_laddu_banner.png'

import { supabase } from '../services/supabase'
import { useStoreSettings } from '../services/settingsService'
import { calculateCustomizedLadduPrice } from '../utils/pricingLogic'

const STEPS = [
  { id: 1, title: 'Ingredients', subtitle: 'Pick 3–11 superfoods', Icon: Leaf },
  { id: 2, title: 'Variety', subtitle: 'Choose style', Icon: Layers },
  { id: 3, title: 'Sizes & Qty', subtitle: 'Select pack weights', Icon: Scale },
  { id: 4, title: 'Summary', subtitle: 'Review & order', Icon: ShoppingBag },
]

const stepVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? -24 : 24,
    transition: { duration: 0.18, ease: 'easeIn' },
  }),
}

export default function CustomizeLaddu({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [selectedVarietyIds, setSelectedVarietyIds] = useState([])
  const [selectedSizes, setSelectedSizes] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [ingredients, setIngredients] = useState([])
  const [varieties, setVarieties] = useState([])
  const [sizes, setSizes] = useState([])

  const storeSettings = useStoreSettings()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchVarieties = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('varieties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (!error) {
      setVarieties(data || [])
    }
  }, [])

  const fetchIngredients = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setIngredients((data || []).filter((item) => item.is_active !== false))
    }
  }, [])

  const fetchSizes = useCallback(async () => {
    if (!supabase || selectedVarietyIds.length === 0) return
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .in('variety_id', selectedVarietyIds)
      .eq('is_active', true)
      .order('price', { ascending: false })

    if (!error) {
      setSizes(data || [])
    }
  }, [selectedVarietyIds])

  useEffect(() => {
    const channelVarieties = supabase
      ?.channel('varieties-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'varieties' }, fetchVarieties)
      .subscribe()

    const channelIngredients = supabase
      ?.channel('ingredients-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, fetchIngredients)
      .subscribe()

    Promise.resolve().then(() => {
      fetchIngredients()
      fetchVarieties()
    })

    return () => {
      if (channelVarieties) supabase?.removeChannel(channelVarieties)
      if (channelIngredients) supabase?.removeChannel(channelIngredients)
    }
  }, [fetchIngredients, fetchVarieties])

  useEffect(() => {
    if (!supabase || selectedVarietyIds.length === 0) return undefined

    Promise.resolve().then(() => fetchSizes())

    const channelSizes = supabase
      .channel('sizes-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sizes' }, fetchSizes)
      .subscribe()

    return () => {
      supabase?.removeChannel(channelSizes)
    }
  }, [fetchSizes, selectedVarietyIds.length])

  // Body scroll lock while modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollBarWidth}px`
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const resetForm = useCallback(() => {
    setStep(1)
    setDirection(1)
    setSelectedIngredients([])
    setSelectedVarietyIds([])
    setSelectedSizes({})
    setQuantity(1)
  }, [])

  const handleClose = useCallback(() => {
    onClose()
    resetForm()
  }, [onClose, resetForm])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  const handleIngredientToggle = (ingredientName) => {
    if (selectedIngredients.includes(ingredientName)) {
      setSelectedIngredients((prev) => prev.filter((i) => i !== ingredientName))
    } else if (selectedIngredients.length < 11) {
      setSelectedIngredients((prev) => [...prev, ingredientName])
    } else {
      toast.error('Maximum 11 ingredients allowed')
    }
  }

  const handleVarietySelect = (varietyId) => {
    setSelectedVarietyIds((prev) =>
      prev.includes(varietyId) ? prev.filter((id) => id !== varietyId) : [...prev, varietyId]
    )
    setSelectedSizes({})
  }

  const handleSizeQty = (sizeId, delta) => {
    setSelectedSizes((prev) => {
      const currentQty = prev[sizeId] || 0
      const newQty = Math.max(0, currentQty + delta)
      const next = { ...prev }
      if (newQty === 0) {
        delete next[sizeId]
      } else {
        next[sizeId] = newQty
      }
      return next
    })
  }

  const canProceed = () => {
    if (step === 1) return selectedIngredients.length >= 3
    if (step === 2) return selectedVarietyIds.length > 0
    if (step === 3) return Object.keys(selectedSizes).length > 0
    return true
  }

  const goToStep = (targetStep) => {
    if (targetStep === step) return
    setDirection(targetStep > step ? 1 : -1)
    setStep(targetStep)
  }

  const pricingDetails = useMemo(() => {
    const selectedIngObjs = ingredients.filter((i) => selectedIngredients.includes(i.name))
    const selectedVarObjs = varieties.filter((v) => selectedVarietyIds.includes(v.id))
    const selectedSizeObjs = Object.entries(selectedSizes)
      .map(([sizeId, qty]) => {
        const sizeObj = sizes.find((s) => s.id === sizeId)
        return { ...sizeObj, qty }
      })
      .filter((s) => s.id)

    return calculateCustomizedLadduPrice({
      selectedIngredients: selectedIngObjs,
      selectedVarieties: selectedVarObjs,
      selectedSizes: selectedSizeObjs,
      baseItemPricePerKg: storeSettings.baseItemPricePerKg,
      ingredientWeightPercent: storeSettings.ingredientWeightPercent,
    })
  }, [
    ingredients,
    selectedIngredients,
    varieties,
    selectedVarietyIds,
    sizes,
    selectedSizes,
    storeSettings.baseItemPricePerKg,
    storeSettings.ingredientWeightPercent,
  ])

  const getVarietyName = () =>
    varieties
      .filter((v) => selectedVarietyIds.includes(v.id))
      .map((v) => v.name)
      .join(', ')

  const getSizeName = () =>
    Object.entries(selectedSizes)
      .map(([sizeId, qty]) => {
        const sizeObj = sizes.find((s) => s.id === sizeId)
        return sizeObj ? `${sizeObj.size} x${qty}` : ''
      })
      .filter(Boolean)
      .join(', ')

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to order your custom laddu')
      handleClose()
      navigate('/login')
      return
    }
    if (pricingDetails.finalPrice === 0) {
      toast.error('Invalid configuration or missing selections')
      return
    }

    const structuredSizes = Object.entries(selectedSizes)
      .map(([sizeId, qty]) => {
        const sizeObj = sizes.find((s) => s.id === sizeId)
        return {
          id: sizeId,
          size: sizeObj?.size,
          weight_grams: Number(sizeObj?.weight_grams) || 0,
          quantity: qty,
          price: sizeObj?.price,
          variety_id: sizeObj?.variety_id,
        }
      })
      .filter((s) => s.id)

    const structuredData = selectedVarietyIds.map((varietyId) => {
      const variety = varieties.find((v) => v.id === varietyId)
      const varietySizes = Object.entries(selectedSizes)
        .map(([sizeId, qty]) => {
          const sizeObj = sizes.find((s) => s.id === sizeId)
          if (sizeObj && sizeObj.variety_id === varietyId) {
            return { label: sizeObj.size, quantity: qty, price: sizeObj.price }
          }
          return null
        })
        .filter(Boolean)
      return { id: varietyId, name: variety?.name, sizes: varietySizes }
    })

    addToCart({
      id: `custom-${Date.now()}`,
      type: 'customized',
      name: 'Customized Laddu',
      qty: Number(quantity) || 1,
      price: pricingDetails.finalPrice,
      selected_size: getSizeName(),
      ingredients: ingredients.filter((i) => selectedIngredients.includes(i.name)),
      customizations: {
        size: getSizeName(),
        selectedSizes: structuredSizes,
        varieties: getVarietyName(),
        selectedVarieties: varieties.filter((v) => selectedVarietyIds.includes(v.id)),
        pricingBreakdown: pricingDetails,
        structuredData,
      },
    })

    toast.success('Your custom masterpiece was added to cart!')
    handleClose()
  }

  if (!isOpen) return null

  const ingCount = selectedIngredients.length
  const ingProgress = Math.min(100, Math.round((ingCount / 11) * 100))
  const ingPct = Math.min(100, Math.max(0, Number(storeSettings.ingredientWeightPercent) || 80))
  const basePct = 100 - ingPct

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 7, 3, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 3vw, 20px)',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-laddu-heading"
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        style={{
          background: '#FFFBF4',
          borderRadius: 26,
          maxWidth: 820,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 32px 80px -16px rgba(20, 6, 0, 0.55), 0 0 0 1px rgba(200,150,12,0.28)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Royal Compact Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2D0C06 0%, #44130A 52%, #240904 100%)',
            padding: 'clamp(16px, 3vw, 22px) clamp(18px, 4vw, 32px) clamp(16px, 3vw, 20px)',
            color: '#FFF5E1',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            borderBottom: '1px solid rgba(240, 208, 96, 0.22)',
          }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(240,208,96,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
              marginBottom: 18,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <motion.div
                whileHover={{ rotate: 4, scale: 1.04 }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '2px solid rgba(240,208,96,0.55)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={customCardBanner}
                  alt="Kbite Special Laddu"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </motion.div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: '#F0D060',
                    marginBottom: 3,
                  }}
                >
                  <Sparkles size={11} />
                  Bespoke Craft Studio
                </div>
                <h1
                  id="customize-laddu-heading"
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(20px, 3vw, 26px)',
                    fontWeight: 800,
                    color: '#FFF9EC',
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  Create Your Masterpiece
                </h1>
              </div>
            </div>

            <motion.button
              type="button"
              aria-label="Close customize modal"
              whileHover={{ rotate: 90, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleClose}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '1px solid rgba(240,208,96,0.28)',
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* 4-Step Animated Progress Rail */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}
            >
              {STEPS.map((s) => {
                const isActive = s.id === step
                const isDone = s.id < step
                const canJump = s.id < step
                const StepIcon = s.Icon
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!canJump}
                    onClick={() => canJump && goToStep(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 12,
                      border: isActive
                        ? '1px solid rgba(240,208,96,0.8)'
                        : isDone
                          ? '1px solid rgba(240,208,96,0.35)'
                          : '1px solid rgba(255,255,255,0.1)',
                      background: isActive
                        ? 'rgba(200,150,12,0.28)'
                        : isDone
                          ? 'rgba(200,150,12,0.12)'
                          : 'rgba(255,255,255,0.04)',
                      cursor: canJump ? 'pointer' : 'default',
                      textAlign: 'left',
                      transition: 'all 0.25s ease',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive || isDone ? '#C8960C' : 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : <StepIcon size={13} />}
                    </div>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? '#F0D060' : isDone ? '#FFF5E1' : 'rgba(255,245,225,0.55)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.id}. {s.title}
                      </div>
                      <div
                        className="customize-step-sub"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 10,
                          color: isActive ? 'rgba(255,245,225,0.85)' : 'rgba(255,245,225,0.45)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Builder Body */}
        <div
          className="custom-scrollbar"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 'clamp(18px, 3vw, 28px) clamp(18px, 4vw, 32px)',
            flex: 1,
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Header & Ingredient Meter */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 'clamp(20px, 3vw, 24px)',
                        fontWeight: 800,
                        color: '#2C1200',
                        margin: '0 0 4px 0',
                      }}
                    >
                      Select Your Superfood Ingredients
                    </h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#78624D', margin: 0 }}>
                      Choose <strong>3 to 11</strong> pure nuts, seeds & artisanal ingredients
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 14px',
                      borderRadius: 20,
                      background: ingCount >= 3 ? '#ECFDF5' : '#FFF4E0',
                      border: `1px solid ${ingCount >= 3 ? 'rgba(16,185,129,0.28)' : 'rgba(200,150,12,0.28)'}`,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                      color: ingCount >= 3 ? '#047857' : '#B45309',
                    }}
                  >
                    <span>{ingCount} / 11 Selected</span>
                    {ingCount < 3 && <span style={{ fontWeight: 500 }}>({3 - ingCount} more needed)</span>}
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    background: 'rgba(200,150,12,0.14)',
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ingProgress}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    style={{
                      height: '100%',
                      borderRadius: 99,
                      background:
                        ingCount >= 3
                          ? 'linear-gradient(90deg, #C8960C, #10B981)'
                          : 'linear-gradient(90deg, #C8960C, #F0D060)',
                    }}
                  />
                </div>

                {/* Selected Quick Chips */}
                <AnimatePresence>
                  {selectedIngredients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginBottom: 18,
                      }}
                    >
                      {selectedIngredients.map((name) => (
                        <motion.button
                          key={name}
                          type="button"
                          layout
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleIngredientToggle(name)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 12px',
                            borderRadius: 99,
                            background: '#2D0C06',
                            color: '#F0D060',
                            border: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <span>{name}</span>
                          <X size={12} />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ingredient Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                    gap: 12,
                  }}
                >
                  {ingredients.map((ing, idx) => {
                    const isSelected = selectedIngredients.includes(ing.name)
                    return (
                      <motion.button
                        key={ing.id}
                        type="button"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.025, 0.25) }}
                        whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(200,150,12,0.14)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleIngredientToggle(ing.name)}
                        style={{
                          textAlign: 'left',
                          padding: '14px 15px',
                          borderRadius: 16,
                          border: isSelected
                            ? '2px solid #C8960C'
                            : '1.5px solid rgba(200,150,12,0.18)',
                          background: isSelected
                            ? 'linear-gradient(135deg, #FFF7E0 0%, #FFFDF8 100%)'
                            : '#fff',
                          boxShadow: isSelected
                            ? '0 8px 20px rgba(200,150,12,0.15)'
                            : '0 2px 8px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 8,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span
                            style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#2C1200',
                              textTransform: 'capitalize',
                              lineHeight: 1.3,
                            }}
                          >
                            {ing.name}
                          </span>
                          <motion.div
                            animate={{
                              scale: isSelected ? 1 : 0.9,
                              backgroundColor: isSelected ? '#C8960C' : '#F4EFE6',
                            }}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? '#fff' : '#B5A897',
                              flexShrink: 0,
                            }}
                          >
                            {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={12} />}
                          </motion.div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                          {ing.category && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: isSelected ? 'rgba(200,150,12,0.18)' : '#F8F3EA',
                                color: isSelected ? '#9A6F00' : '#8C7A64',
                                fontFamily: 'Poppins, sans-serif',
                              }}
                            >
                              {ing.category}
                            </span>
                          )}
                          {ing.description && (
                            <span
                              style={{
                                fontSize: 11,
                                color: '#8C7A64',
                                fontFamily: 'Poppins, sans-serif',
                                fontStyle: 'italic',
                              }}
                            >
                              {ing.description}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 'clamp(20px, 3vw, 24px)',
                      fontWeight: 800,
                      color: '#2C1200',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Choose Your Format & Variety
                  </h2>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#78624D', margin: 0 }}>
                    Select one or more artisanal preparation styles
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 14,
                  }}
                >
                  {varieties.map((v, idx) => {
                    const isSelected = selectedVarietyIds.includes(v.id)
                    return (
                      <motion.button
                        key={v.id}
                        type="button"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                        whileHover={{ y: -3, boxShadow: '0 12px 26px rgba(200,150,12,0.16)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVarietySelect(v.id)}
                        style={{
                          textAlign: 'left',
                          padding: '18px 18px',
                          borderRadius: 18,
                          border: isSelected ? '2px solid #C8960C' : '1.5px solid rgba(200,150,12,0.18)',
                          background: isSelected
                            ? 'linear-gradient(135deg, #2D0C06 0%, #4A170C 100%)'
                            : '#fff',
                          color: isSelected ? '#FFF5E1' : '#2C1200',
                          boxShadow: isSelected
                            ? '0 14px 28px rgba(45,12,6,0.22)'
                            : '0 3px 10px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 10,
                          transition: 'background 0.25s ease, border-color 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 11,
                              background: isSelected ? 'rgba(240,208,96,0.18)' : '#FFF5E1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? '#F0D060' : '#C8960C',
                              flexShrink: 0,
                            }}
                          >
                            <Layers size={18} />
                          </div>

                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isSelected ? '#C8960C' : '#F4EFE6',
                              color: isSelected ? '#fff' : '#B5A897',
                            }}
                          >
                            {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={13} />}
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              fontFamily: '"Playfair Display", serif',
                              fontSize: 17,
                              fontWeight: 700,
                              color: isSelected ? '#FFF9EC' : '#2C1200',
                              marginBottom: 4,
                            }}
                          >
                            {v.name}
                          </div>
                          {v.description && (
                            <div
                              style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 12,
                                color: isSelected ? 'rgba(255,245,225,0.72)' : '#8C7A64',
                                lineHeight: 1.4,
                              }}
                            >
                              {v.description}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 'clamp(20px, 3vw, 24px)',
                      fontWeight: 800,
                      color: '#2C1200',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Select Pack Weights & Quantity
                  </h2>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#78624D', margin: 0 }}>
                    Tap a pack size to add it, then adjust pack counts with + / -
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {selectedVarietyIds.map((varietyId) => {
                    const variety = varieties.find((v) => v.id === varietyId)
                    const varietySizes = sizes.filter((s) => s.variety_id === varietyId)
                    if (varietySizes.length === 0) return null

                    return (
                      <div
                        key={varietyId}
                        style={{
                          background: '#fff',
                          borderRadius: 18,
                          padding: '18px 20px',
                          border: '1px solid rgba(200,150,12,0.16)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#C8960C',
                              display: 'inline-block',
                            }}
                          />
                          <h3
                            style={{
                              fontFamily: '"Playfair Display", serif',
                              fontSize: 17,
                              fontWeight: 700,
                              color: '#2C1200',
                              margin: 0,
                            }}
                          >
                            {variety?.name}
                          </h3>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
                            gap: 12,
                          }}
                        >
                          {varietySizes.map((s) => {
                            const qty = selectedSizes[s.id] || 0
                            const isSelected = qty > 0
                            return (
                              <motion.div
                                key={s.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: isSelected ? 1 : 0.97 }}
                                onClick={() => !isSelected && handleSizeQty(s.id, 1)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '16px 12px',
                                  border: isSelected ? '2px solid #C8960C' : '1.5px solid rgba(200,150,12,0.18)',
                                  borderRadius: 16,
                                  background: isSelected
                                    ? 'linear-gradient(135deg, #FFF7E0 0%, #FFFDF8 100%)'
                                    : '#FFFDF9',
                                  cursor: isSelected ? 'default' : 'pointer',
                                  boxShadow: isSelected
                                    ? '0 8px 20px rgba(200,150,12,0.14)'
                                    : '0 2px 6px rgba(0,0,0,0.02)',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: isSelected ? '#9A6F00' : '#2C1200',
                                    marginBottom: 4,
                                  }}
                                >
                                  {s.size}
                                </span>
                                {s.weight_grams ? (
                                  <span style={{ fontSize: 11, color: '#8C7A64', marginBottom: 10 }}>
                                    {s.weight_grams}g net wt
                                  </span>
                                ) : null}

                                {isSelected ? (
                                  <>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        background: '#fff',
                                        padding: '5px 10px',
                                        borderRadius: 10,
                                        border: '1px solid rgba(200,150,12,0.35)',
                                        marginBottom: 8,
                                        width: '100%',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        aria-label={`Decrease ${s.size} quantity`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleSizeQty(s.id, -1)
                                        }}
                                        style={{
                                          background: '#FFF5E1',
                                          border: 'none',
                                          borderRadius: 6,
                                          width: 26,
                                          height: 26,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#9A6F00',
                                        }}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span
                                        style={{
                                          fontFamily: 'Poppins, sans-serif',
                                          fontSize: 15,
                                          fontWeight: 700,
                                          color: '#2C1200',
                                        }}
                                      >
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        aria-label={`Increase ${s.size} quantity`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleSizeQty(s.id, 1)
                                        }}
                                        style={{
                                          background: '#C8960C',
                                          border: 'none',
                                          borderRadius: 6,
                                          width: 26,
                                          height: 26,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#fff',
                                        }}
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                    <p
                                      style={{
                                        fontFamily: '"Playfair Display", serif',
                                        fontSize: 17,
                                        fontWeight: 800,
                                        color: '#2C1200',
                                        margin: 0,
                                      }}
                                    >
                                      ₹{Number(s.price) * qty}
                                    </p>
                                  </>
                                ) : (
                                  <span
                                    style={{
                                      fontFamily: '"Playfair Display", serif',
                                      fontSize: 16,
                                      fontWeight: 700,
                                      color: '#C8960C',
                                    }}
                                  >
                                    ₹{s.price}
                                  </span>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 'clamp(20px, 3vw, 24px)',
                      fontWeight: 800,
                      color: '#2C1200',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Your Custom Laddu Recipe
                  </h2>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#78624D', margin: 0 }}>
                    Review your blend proportions, packs, and live pricing before adding to cart
                  </p>
                </div>

                {/* Variety & Size Header Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #2D0C06 0%, #44130A 100%)',
                    borderRadius: 18,
                    padding: '18px 20px',
                    color: '#FFF5E1',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: '#F0D060', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 4 }}>
                      Crafted Blend
                    </div>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, fontWeight: 700 }}>
                      {getVarietyName() || 'Custom Creation'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,245,225,0.75)', marginTop: 2 }}>
                      Packs: {getSizeName()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,245,225,0.7)' }}>Base Weight</div>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 800, color: '#F0D060' }}>
                      {pricingDetails.totalWeightGrams}g
                    </div>
                  </div>
                </div>

                {/* Weight Ratio Bar & Ingredients */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: '18px 20px',
                    border: '1px solid rgba(200,150,12,0.16)',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#2C1200', marginBottom: 8 }}>
                    <span>Selected Ingredients ({ingPct}% — {Math.round(pricingDetails.ingredientTotalWeightGrams)}g)</span>
                    <span style={{ color: '#8C7A64' }}>Pure Base ({basePct}% — {Math.round(pricingDetails.baseItemsWeightGrams)}g)</span>
                  </div>

                  <div style={{ height: 10, borderRadius: 99, background: '#F3EBDD', overflow: 'hidden', display: 'flex', marginBottom: 16 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ingPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ background: 'linear-gradient(90deg, #C8960C, #F0D060)', height: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {pricingDetails.ingredientBreakdown.map((ing, idx) => (
                      <span
                        key={ing.id || idx}
                        style={{
                          padding: '6px 12px',
                          background: '#FFF7E0',
                          border: '1px solid rgba(200,150,12,0.22)',
                          borderRadius: 99,
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#5B3A00',
                          textTransform: 'capitalize',
                        }}
                      >
                        {ing.name} ({Math.round(ing.weightGrams)}g)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: '18px 20px',
                    border: '1px solid rgba(200,150,12,0.16)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#555' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Artisanal Base Cost</span>
                      <span style={{ fontWeight: 600 }}>₹{Math.round(pricingDetails.baseItemsCost)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Pack Sizes Cost</span>
                      <span style={{ fontWeight: 600 }}>₹{pricingDetails.sizesCost}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Preparation Variety Cost</span>
                      <span style={{ fontWeight: 600 }}>₹{pricingDetails.varietiesCost}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#2C1200',
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: '1px dashed rgba(200,150,12,0.28)',
                    }}
                  >
                    <span>Total Price</span>
                    <span style={{ fontSize: 24, color: '#C8960C' }}>₹{Math.round(pricingDetails.finalPrice)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Dock Footer */}
        <div
          style={{
            padding: '14px clamp(18px, 4vw, 32px)',
            borderTop: '1px solid rgba(200,150,12,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            background: '#fff',
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: '#78624D' }}>
            {pricingDetails.finalPrice > 0 ? (
              <div>
                <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999' }}>
                  Current Estimate
                </span>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 800, color: '#C8960C' }}>
                  ₹{Math.round(pricingDetails.finalPrice)}
                </span>
              </div>
            ) : (
              <span>
                Step {step} of 4 ·{' '}
                {step === 1 && 'Select at least 3 ingredients'}
                {step === 2 && 'Select at least 1 variety'}
                {step === 3 && 'Pick a pack size'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            {step > 1 && (
              <motion.button
                type="button"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => goToStep(step - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 20px',
                  border: '1.5px solid rgba(200,150,12,0.25)',
                  borderRadius: 12,
                  background: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#2C1200',
                }}
              >
                <ArrowLeft size={15} />
                Back
              </motion.button>
            )}

            {step < 4 ? (
              <motion.button
                type="button"
                whileHover={canProceed() ? { scale: 1.02 } : undefined}
                whileTap={canProceed() ? { scale: 0.97 } : undefined}
                onClick={() => canProceed() && goToStep(step + 1)}
                disabled={!canProceed()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 26px',
                  background: canProceed()
                    ? 'linear-gradient(135deg, #C8960C 0%, #A97B06 100%)'
                    : '#E5E0D5',
                  color: canProceed() ? '#fff' : '#9E9484',
                  border: 'none',
                  borderRadius: 12,
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: canProceed() ? '0 8px 20px rgba(200,150,12,0.3)' : 'none',
                }}
              >
                Continue
                <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #C8960C 0%, #A97B06 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 10px 24px rgba(200,150,12,0.35)',
                }}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </motion.button>
            )}
          </div>
        </div>

        {/* Custom scrollbar & responsive helper */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 7px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(200,150,12,0.06);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(200,150,12,0.28);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(200,150,12,0.48);
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(200,150,12,0.28) rgba(200,150,12,0.06);
            }
            @media (max-width: 600px) {
              .customize-step-sub {
                display: none;
              }
            }
          `,
          }}
        />
      </motion.div>
    </motion.div>
  )
}
