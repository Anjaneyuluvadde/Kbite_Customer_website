import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, ShieldCheck, Truck, Leaf, Award, Gem, Gift, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import CustomizeLaddu from '../components/CustomizeLaddu'
import { fetchProducts } from '../services/productService'
import { supabase } from '../services/supabase'
import { CATEGORY_DATA, TESTIMONIALS, festiveBanner, familyMoment, shopInterior } from '../utils/data'
import heroAssortedLaddu from '../assets/images/hero_assorted_laddu.jpg'
import heroBesanMotichoorLaddu from '../assets/images/hero_besan_motichoor_laddu.jpg'
import heroDryFruitCoconutLaddu from '../assets/images/hero_dryfruit_coconut_laddu.jpg'
import motichoorThumb from '../assets/images/motichoor_laddu_product.png'
import besanThumb from '../assets/images/besan_laddu_product.png'
import coconutThumb from '../assets/images/coconut_laddu_product.png'
import dryFruitThumb from '../assets/images/dry_fruit_laddu_product.png'
import kajuThumb from '../assets/images/kaju_laddu_product.png'
import logoEk from '../assets/images/logo_ek.png'

/* ── Particles ── */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({ id: i, size: Math.random() * 5 + 3, left: Math.random() * 100, dur: Math.random() * 8 + 6, delay: Math.random() * 6 }))

const HERO_SHOWCASE_SLIDES = [
  { image: heroAssortedLaddu, alt: 'Kbite assorted handcrafted laddus in decorative brass bowl', pos: '92% 45%' },
  { image: heroBesanMotichoorLaddu, alt: 'Kbite golden Besan and Motichoor laddus in decorative brass bowl', pos: '92% 45%' },
  { image: heroDryFruitCoconutLaddu, alt: 'Kbite rich Dry Fruit and Coconut laddus in decorative brass bowl', pos: '92% 45%' },
]

const VARIETY_THUMBS = [
  { image: motichoorThumb, objPos: '46% 48%' },
  { image: besanThumb, objPos: '52% 52%' },
  { image: coconutThumb, objPos: '68% 58%' },
  { image: dryFruitThumb, objPos: '42% 56%' },
  { image: kajuThumb, objPos: '50% 50%' },
]

const HERO_LADDU_FALLBACKS = [
  { id: 'fallback-1', name: 'Motichoor Laddu' },
  { id: 'fallback-2', name: 'Besan Laddu' },
  { id: 'fallback-3', name: 'Coconut Laddu' },
  { id: 'fallback-4', name: 'Dry Fruit Laddu' },
]

function getVarietyVisual(variety, index) {
  if (variety?.image_url || variety?.image) {
    return { image: variety.image_url || variety.image, objPos: 'center' }
  }
  const name = (variety?.name || '').toLowerCase()
  if (name.includes('motichoor') || name.includes('boondi')) return VARIETY_THUMBS[0]
  if (name.includes('besan')) return VARIETY_THUMBS[1]
  if (name.includes('coconut')) return VARIETY_THUMBS[2]
  if (name.includes('choc')) return VARIETY_THUMBS[3]
  if (name.includes('bite')) return VARIETY_THUMBS[4]
  if (name.includes('dry') || name.includes('nut')) return VARIETY_THUMBS[3]
  if (name.includes('kaju')) return VARIETY_THUMBS[4]
  return VARIETY_THUMBS[index % VARIETY_THUMBS.length]
}

function LotusOrnament() {
  return (
    <svg width="34" height="22" viewBox="0 0 36 24" fill="none" aria-hidden="true" style={{ margin: '0 auto 8px', opacity: 0.92 }}>
      <path d="M18 3C16.2 7.5 15.6 12.2 18 17.5C20.4 12.2 19.8 7.5 18 3Z" stroke="#E6B84A" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M18 17.5C13.5 15 11.2 10.6 11.6 6.2C14.7 8.4 16.8 12.3 18 17.5Z" stroke="#E6B84A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 17.5C22.5 15 24.8 10.6 24.4 6.2C21.3 8.4 19.2 12.3 18 17.5Z" stroke="#E6B84A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 17.8C12.2 17.4 7.8 14.5 5.6 10.4C9.5 10.8 13.7 13.4 18 17.8Z" stroke="#E6B84A" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M18 17.8C23.8 17.4 28.2 14.5 30.4 10.4C26.5 10.8 22.3 13.4 18 17.8Z" stroke="#E6B84A" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M11 20.2C14.5 19.4 21.5 19.4 25 20.2" stroke="#E6B84A" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function CornerMandala({ flip = false }) {
  const gradId = `goldCornerGrad-${flip ? 'r' : 'l'}`
  const fillId = `goldCornerFill-${flip ? 'r' : 'l'}`
  return (
    <svg
      width="170"
      height="170"
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
      className="kbite-hero-corner"
      style={{
        position: 'absolute',
        bottom: 0,
        [flip ? 'right' : 'left']: 0,
        transform: flip ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.55,
      }}
    >
      <path d="M0 44C26 44 48 56 64 76C80 96 92 122 104 152C110 166 122 176 138 180H0V44Z" stroke={`url(#${gradId})`} strokeWidth="1.1" fill={`url(#${fillId})`} />
      <path d="M0 72C22 72 40 84 52 102C64 120 74 142 86 164C92 173 102 178 112 180" stroke="#D4A438" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M0 100C18 100 34 112 42 128C50 144 58 162 72 180" stroke="#D4A438" strokeWidth="1.1" />
      <path d="M10 180C12 146 28 122 52 108C40 132 38 156 44 180" stroke="#E5BA54" strokeWidth="1" />
      <path d="M0 138C24 134 44 146 58 168" stroke="#E5BA54" strokeWidth="1" />
      <circle cx="24" cy="154" r="10" stroke="#E5BA54" strokeWidth="1" />
      <circle cx="24" cy="154" r="4" stroke="#E5BA54" strokeWidth="0.9" />
      <circle cx="48" cy="134" r="6" stroke="#D4A438" strokeWidth="0.9" />
      <circle cx="68" cy="158" r="5" stroke="#D4A438" strokeWidth="0.9" />
      <circle cx="14" cy="112" r="4" stroke="#D4A438" strokeWidth="0.9" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="44" x2="138" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9BE58" stopOpacity="0.9" />
          <stop offset="1" stopColor="#9E6E14" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="60" x2="110" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8960C" stopOpacity="0.12" />
          <stop offset="1" stopColor="#C8960C" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Hero ── */
function Hero({ onOpen }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = HERO_SHOWCASE_SLIDES.length

  const [varieties, setVarieties] = useState([])
  const [loadingVarieties, setLoadingVarieties] = useState(true)
  const [sliderPaused, setSliderPaused] = useState(false)
  const [scrollState, setScrollState] = useState({ left: false, right: false, scrollable: false })

  const sliderRef = useRef(null)
  const dragStateRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % total), 6500)
    return () => clearInterval(t)
  }, [paused, total])

  // Fetch Step 2 Variety Types from Supabase (same source & real-time updates as CustomizeLaddu)
  useEffect(() => {
    let active = true

    const fetchHeroVarieties = async () => {
      if (!supabase) {
        if (active) setLoadingVarieties(false)
        return
      }
      const { data, error } = await supabase
        .from('varieties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (active) {
        if (!error && Array.isArray(data)) {
          setVarieties(data)
        }
        setLoadingVarieties(false)
      }
    }

    fetchHeroVarieties()

    const channelVarieties = supabase
      ?.channel('hero-varieties-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'varieties' }, fetchHeroVarieties)
      .subscribe()

    return () => {
      active = false
      if (channelVarieties) supabase?.removeChannel(channelVarieties)
    }
  }, [])

  const displayVarieties = varieties.length > 0 ? varieties : (loadingVarieties ? [] : HERO_LADDU_FALLBACKS)

  const updateScrollState = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    const scrollable = el.scrollWidth > el.clientWidth + 4
    const left = el.scrollLeft > 4
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setScrollState({ left, right, scrollable })
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = sliderRef.current
    if (!el) return
    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateScrollState)
      ro.observe(el)
    }
    window.addEventListener('resize', updateScrollState)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [displayVarieties.length, updateScrollState])

  // Gentle auto-scroll when the slider overflows horizontally
  useEffect(() => {
    if (sliderPaused || !scrollState.scrollable) return
    const timer = setInterval(() => {
      const el = sliderRef.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 260, behavior: 'smooth' })
      }
    }, 3800)
    return () => clearInterval(timer)
  }, [sliderPaused, scrollState.scrollable])

  const scrollVarieties = (dir) => {
    const el = sliderRef.current
    if (!el) return
    el.scrollBy({ left: dir * 270, behavior: 'smooth' })
  }

  const handleMouseDown = (e) => {
    const el = sliderRef.current
    if (!el) return
    dragStateRef.current = {
      active: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    }
  }

  const handleMouseMove = (e) => {
    const el = sliderRef.current
    if (!el || !dragStateRef.current.active) return
    const x = e.pageX - el.offsetLeft
    const walk = x - dragStateRef.current.startX
    if (Math.abs(walk) > 6) {
      dragStateRef.current.moved = true
      e.preventDefault()
      el.scrollLeft = dragStateRef.current.scrollLeft - walk
    }
  }

  const endDrag = () => {
    dragStateRef.current.active = false
  }

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="kbite-hero-section"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: '#2E0204',
      }}
    >
      {/* Hero-scoped responsive styles */}
      <style>{`
        .kbite-hero-inner {
          position: relative;
          z-index: 4;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 96px clamp(16px, 4vw, 40px) 34px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
        }
        .kbite-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 28px;
          align-items: center;
          flex: 1;
        }
        .kbite-hero-left {
          width: 100%;
          max-width: 530px;
          margin: 0 auto;
          text-align: center;
        }
        .kbite-hero-mobile-visual {
          display: block;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(218, 165, 50, 0.35);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
          position: relative;
          aspect-ratio: 16 / 10;
          background: #230103;
        }
        .kbite-hero-bg-desktop {
          opacity: 0.22;
        }
        .kbite-hero-features {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px 18px;
          margin-top: 26px;
        }
        .kbite-hero-divider {
          display: none;
          width: 1px;
          height: 30px;
          background: rgba(230, 185, 90, 0.28);
        }
        .kbite-hero-slider-wrap {
          position: relative;
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }
        .kbite-hero-slider-track {
          display: flex;
          align-items: stretch;
          gap: 14px;
          width: 100%;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 4px 2px;
          cursor: grab;
        }
        .kbite-hero-slider-track:active {
          cursor: grabbing;
        }
        .kbite-hero-slider-track::-webkit-scrollbar {
          display: none;
        }
        .kbite-hero-card-item {
          flex: 0 0 auto;
          width: clamp(205px, 64vw, 248px);
          scroll-snap-align: start;
        }
        .kbite-hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 6;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(218, 165, 50, 0.55);
          background: rgba(42, 3, 5, 0.92);
          color: #E6B84A;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .kbite-hero-nav-btn:hover {
          background: rgba(88, 12, 15, 0.96);
          border-color: rgba(235, 185, 65, 0.9);
          transform: translateY(-50%) scale(1.06);
        }
        .kbite-hero-cta {
          width: 100%;
          justify-content: center;
        }
        .kbite-hero-corner {
          width: 110px;
          height: 110px;
        }
        @media (min-width: 520px) {
          .kbite-hero-cta {
            width: auto;
          }
          .kbite-hero-divider {
            display: block;
          }
          .kbite-hero-features {
            flex-wrap: nowrap;
            gap: 16px;
          }
          .kbite-hero-card-item {
            width: clamp(220px, 38vw, 250px);
          }
        }
        @media (min-width: 768px) {
          .kbite-hero-card-item {
            width: clamp(225px, 23.5%, 252px);
          }
          .kbite-hero-corner {
            width: 145px;
            height: 145px;
          }
        }
        @media (min-width: 960px) {
          .kbite-hero-inner {
            padding: 102px clamp(24px, 4vw, 48px) 32px;
          }
          .kbite-hero-grid {
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            gap: 32px;
          }
          .kbite-hero-left {
            margin: 0;
            justify-self: start;
            max-width: 470px;
          }
          .kbite-hero-mobile-visual {
            display: none;
          }
          .kbite-hero-bg-desktop {
            opacity: 1;
          }
          .kbite-hero-corner {
            width: 170px;
            height: 170px;
          }
        }
        @media (min-width: 1200px) {
          .kbite-hero-left {
            max-width: 530px;
          }
        }
      `}</style>

      {/* Background Photography Showcase */}
      <div className="kbite-hero-bg-desktop" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <img
              src={HERO_SHOWCASE_SLIDES[idx].image}
              alt={HERO_SHOWCASE_SLIDES[idx].alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: HERO_SHOWCASE_SLIDES[idx].pos,
                display: 'block',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Seamless Royal Maroon Left-to-Right & Edge Lighting Gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #370306 0%, #370306 34%, rgba(50, 3, 6, 0.88) 45%, rgba(45, 3, 5, 0.38) 58%, rgba(30, 1, 3, 0.08) 76%, rgba(25, 1, 3, 0.18) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(28, 1, 3, 0.62) 0%, transparent 18%, transparent 72%, rgba(26, 1, 3, 0.88) 100%)',
          }}
        />
      </div>

      {/* Subtle Ambient Gold Particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: -20,
            background: 'rgba(226, 178, 74, 0.35)',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            zIndex: 1,
          }}
        />
      ))}

      {/* Bottom Corner Ornamental Mandala Motifs */}
      <CornerMandala />
      <CornerMandala flip />

      {/* Main Content Container */}
      <div className="kbite-hero-inner">
        <div className="kbite-hero-grid">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="kbite-hero-left"
          >
            {/* Ornamental Lotus + Eyebrow */}
            <LotusOrnament />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
              <span style={{ height: 1, width: 'clamp(28px, 5vw, 56px)', background: 'linear-gradient(90deg, transparent, #D4A438)' }} />
              <span
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 'clamp(10px, 1vw, 12px)',
                  fontWeight: 500,
                  letterSpacing: '0.26em',
                  color: '#F3DFB8',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                CRAFTED IN TRADITION
              </span>
              <span style={{ height: 1, width: 'clamp(28px, 5vw, 56px)', background: 'linear-gradient(90deg, #D4A438, transparent)' }} />
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: 'clamp(40px, 4.9vw, 64px)',
                lineHeight: 1.07,
                letterSpacing: '-0.01em',
                marginBottom: 16,
                textShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span style={{ display: 'block', color: '#FAF0DC' }}>Your Laddu.</span>
              <span style={{ display: 'block', color: '#E6B23D' }}>Your Choice.</span>
            </h1>

            {/* Description */}
            <p
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 400,
                fontSize: 'clamp(15px, 1.3vw, 18px)',
                lineHeight: 1.55,
                color: 'rgba(255, 245, 225, 0.9)',
                maxWidth: 420,
                margin: '0 auto 26px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
              }}
            >
              Choose your favorite flavor and create a Gift box made just for you.
            </p>

            {/* Primary CTA Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpen}
              className="kbite-hero-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 34px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 232, 163, 0.65)',
                background: 'linear-gradient(135deg, #F6D56C 0%, #E7B23B 52%, #D4961C 100%)',
                color: '#1A0800',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 'clamp(12px, 1vw, 13.5px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45), 0 0 22px rgba(231, 178, 59, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              <span>CUSTOMIZE YOUR LADDU</span>
              <ArrowRight size={17} strokeWidth={2.2} />
            </motion.button>

            {/* Feature Highlights */}
            <div className="kbite-hero-features">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Leaf size={22} color="#E2B24A" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: 12, lineHeight: 1.3, color: 'rgba(255, 245, 225, 0.88)' }}>
                  Freshly<br />Handcrafted
                </div>
              </div>

              <span className="kbite-hero-divider" aria-hidden="true" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Gem size={22} color="#E2B24A" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: 12, lineHeight: 1.3, color: 'rgba(255, 245, 225, 0.88)' }}>
                  Premium<br />Ingredients
                </div>
              </div>

              <span className="kbite-hero-divider" aria-hidden="true" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Gift size={22} color="#E2B24A" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: 12, lineHeight: 1.3, color: 'rgba(255, 245, 225, 0.88)' }}>
                  Perfect for<br />Celebrations
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Dedicated Mobile/Tablet Visual Showcase; Desktop lets full-bleed background shine unobstructed) */}
          <div className="kbite-hero-right">
            <div className="kbite-hero-mobile-visual">
              <AnimatePresence mode="wait">
                <motion.img
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  src={HERO_SHOWCASE_SLIDES[idx].image}
                  alt={HERO_SHOWCASE_SLIDES[idx].alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: '82% 45%',
                    display: 'block',
                  }}
                />
              </AnimatePresence>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at center, transparent 55%, rgba(30, 1, 3, 0.45) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Step-2 Variety Type Scroll Slider + Slide Dots */}
        <div style={{ position: 'relative', zIndex: 4, width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => {
              setSliderPaused(false)
              endDrag()
            }}
            onTouchStart={() => setSliderPaused(true)}
            onTouchEnd={() => setSliderPaused(false)}
            className="kbite-hero-slider-wrap"
          >
            {/* Left Scroll Button */}
            {scrollState.scrollable && (
              <button
                type="button"
                aria-label="Scroll varieties left"
                onClick={() => scrollVarieties(-1)}
                disabled={!scrollState.left}
                className="kbite-hero-nav-btn"
                style={{
                  left: -14,
                  opacity: scrollState.left ? 1 : 0.35,
                  pointerEvents: scrollState.left ? 'auto' : 'none',
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Horizontal Scroll Slider Track */}
            <div
              ref={sliderRef}
              onScroll={updateScrollState}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={endDrag}
              className="kbite-hero-slider-track"
              style={{
                justifyContent: scrollState.scrollable ? 'flex-start' : 'center',
              }}
            >
              {loadingVarieties && varieties.length === 0 ? (
                [0, 1, 2].map((skeletonIdx) => (
                  <div
                    key={`skeleton-${skeletonIdx}`}
                    className="kbite-hero-card-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 14,
                      border: '1px solid rgba(218, 165, 50, 0.28)',
                      background: 'linear-gradient(135deg, rgba(70, 9, 11, 0.65) 0%, rgba(38, 3, 5, 0.72) 100%)',
                      height: 68,
                    }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(226, 178, 74, 0.16)', flexShrink: 0 }} />
                    <div style={{ height: 14, width: '65%', borderRadius: 6, background: 'rgba(255, 245, 225, 0.14)' }} />
                  </div>
                ))
              ) : (
                displayVarieties.map((item, i) => {
                  const visual = getVarietyVisual(item, i)
                  return (
                    <motion.button
                      key={item.id || `${item.name}-${i}`}
                      type="button"
                      whileHover={{ y: -3, borderColor: 'rgba(235, 185, 65, 0.85)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (dragStateRef.current.moved) {
                          dragStateRef.current.moved = false
                          return
                        }
                        onOpen()
                      }}
                      className="kbite-hero-card-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: '1px solid rgba(218, 165, 50, 0.48)',
                        background: 'linear-gradient(135deg, rgba(70, 9, 11, 0.86) 0%, rgba(38, 3, 5, 0.92) 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 220, 140, 0.14)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'box-shadow 0.25s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1.5px solid rgba(226, 178, 74, 0.55)',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.45)',
                          background: '#2C0204',
                        }}
                      >
                        <img
                          src={visual.image}
                          alt={item.name}
                          draggable={false}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: visual.objPos,
                            transform: 'scale(1.22)',
                            display: 'block',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 'clamp(12.5px, 1.05vw, 14.5px)',
                          fontWeight: 600,
                          color: '#FAF0DC',
                          lineHeight: 1.25,
                          letterSpacing: '0.01em',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.name}
                      </span>
                    </motion.button>
                  )
                })
              )}
            </div>

            {/* Right Scroll Button */}
            {scrollState.scrollable && (
              <button
                type="button"
                aria-label="Scroll varieties right"
                onClick={() => scrollVarieties(1)}
                disabled={!scrollState.right}
                className="kbite-hero-nav-btn"
                style={{
                  right: -14,
                  opacity: scrollState.right ? 1 : 0.35,
                  pointerEvents: scrollState.right ? 'auto' : 'none',
                }}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </motion.div>

          {/* Slide Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 18 }}>
            {HERO_SHOWCASE_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Hero slide ${i + 1}`}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 26 : 7,
                  height: 7,
                  borderRadius: 9999,
                  background: i === idx ? '#E5B43B' : 'rgba(255, 245, 225, 0.32)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Blend to Next Section */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 18,
          background: 'linear-gradient(to bottom, transparent, rgba(255, 245, 225, 0.85), #FFF5E1)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />
    </section>
  )
}

/* ── Section Header ── */
function SH({ label, title, gold, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 40 }}>
      {label && <p className="section-label" style={{ marginBottom: 8 }}>{label}</p>}
      <h2 className="section-title" style={{ fontSize: 'clamp(26px,4.5vw,38px)', marginBottom: sub ? 10 : 0 }}>
        {title} {gold && <span className="gold">{gold}</span>}
      </h2>
      {sub && <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#999', maxWidth: 400, margin: '0 auto' }}>{sub}</p>}
    </motion.div>
  )
}

/* ── Featured Products ── */
function FeaturedProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await fetchProducts()
      // Normalize data to match ProductCard props
      const normalized = (data || []).map(p => ({
        ...p,
        name: p.title || p.name,
        image: p.image_url || p.image,
        rating: p.rating || 4.5,
        reviews: p.reviews || 0,
        category: p.category || 'ladoos',
        originalPrice: p.old_price,
        discount: p.discount
      }))
      setProducts(normalized.slice(0, 8))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section id="featured-section" style={{ padding: 'clamp(44px, 6vw, 60px) clamp(16px, 4vw, 20px) clamp(48px, 8vw, 72px)', background: '#FFF5E1' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SH label="Curated for you" title="Featured" gold="Products" sub="Handpicked delicacies just for you" />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #EAEAEA', borderTopColor: '#C8960C', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div className="responsive-grid responsive-grid-1 responsive-grid-2 responsive-grid-3 responsive-grid-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn-outline" onClick={() => navigate('/products')}>View All Products <ArrowRight size={15} /></button>
        </div>
      </div>
    </section>
  )
}

/* ── Categories ── */
function Categories() {
  const navigate = useNavigate()
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 64px) clamp(16px, 4vw, 20px)', background: '#F5E6C8' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SH label="Collections" title="Shop by" gold="Category" sub="Discover our exquisite range" />
        <div className="responsive-grid-2" style={{ maxWidth: 920, margin: '0 auto' }}>
          {Object.entries(CATEGORY_DATA).map(([id, cat], i) => (
            <motion.div key={id} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }} onClick={() => navigate(`/products?category=${id}`)}
              style={{ cursor: 'pointer', borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '4/3' }}>
              <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.68) 0%,transparent 55%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 0 22px' }}>
                <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>{cat.label}</span>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: 'rgba(255,245,225,0.75)', marginTop: 4 }}>{cat.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Festival Banner ── */
function FestivalBanner() {
  const navigate = useNavigate()
  return (
    <section style={{ padding: '0 clamp(16px, 4vw, 20px) clamp(48px, 8vw, 64px)', background: '#FFF5E1' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 240 }}>
          <img src={festiveBanner} alt="Festival"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(44,18,0,0.8) 0%,rgba(20,10,0,0.6) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(32px, 8vw, 56px) clamp(24px, 6vw, 48px)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, color: '#F0D060', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>✦ Limited Edition ✦</p>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 900, color: '#fff', fontSize: 'clamp(26px,5vw,42px)', marginBottom: 12 }}>
              Festival Special
            </h2>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: 'rgba(255,245,225,0.72)', marginBottom: 26 }}>
              Exclusive handcrafted gift boxes for your loved ones
            </p>
            <button className="btn-primary" onClick={() => navigate('/products')} style={{ padding: '12px 32px', fontSize: 14 }}>
              Explore Festival Gifts
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Why Us ── */
function WhyUs() {
  const features = [
    { icon: Leaf, title: 'Pure & Natural', desc: 'No preservatives or artificial colours. 100% natural ingredients sourced ethically.' },
    { icon: Award, title: 'Handcrafted Daily', desc: 'Made fresh every morning by expert artisans using traditional recipes.' },
    { icon: ShieldCheck, title: 'FSSAI Certified', desc: 'All our products meet the highest food safety and quality standards.' },
    { icon: Truck, title: 'Pan-India Delivery', desc: 'Carefully packed and delivered fresh to your doorstep across India.' },
  ]
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 64px) clamp(16px, 4vw, 20px)', background: '#F5E6C8' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SH label="Our Promise" title="Why Choose" gold="Us" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-hover"
              style={{ background: '#fff', borderRadius: 14, padding: '28px 22px', textAlign: 'center', border: '1px solid rgba(200,150,12,0.1)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(200,150,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <f.icon size={24} color="#C8960C" />
              </div>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 17, fontWeight: 700, color: '#333', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#888', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ── */
function Testimonials() {
  return (
    <section style={{ padding: '64px 20px', background: '#FFF5E1' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SH label="Customer Love" title="What Our" gold="Customers Say" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-hover"
              style={{ background: '#fff', borderRadius: 14, padding: '22px 20px', border: '1px solid rgba(200,150,12,0.1)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#C8960C" color="#C8960C" />)}
              </div>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }} className="line-clamp-3">"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C8960C,#F0D060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, color: '#333' }}>{t.name}</div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, color: '#C8960C' }}>{t.city}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Newsletter ── */
function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <section style={{ padding: '64px 20px', background: '#2C1200' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <img src={logoEk} alt="EK Logo" style={{ height: 56, width: 'auto', objectFit: 'contain', filter: 'brightness(1.2)' }} />
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 36, fontWeight: 700, color: '#FFF5E1', marginBottom: 0 }}>
            K<span style={{ color: '#C8960C' }}>bite</span>
          </h2>
        </div>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: 'rgba(255,245,225,0.55)', marginBottom: 28 }}>
          Exclusive offers, festival deals and new arrivals in your inbox.
        </p>
        {done ? (
          <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ color: '#C8960C', fontFamily: 'Poppins,sans-serif', fontSize: 16 }}>
            🙏 Thank you! Divine blessings on the way.
          </motion.p>
        ) : (
          <form onSubmit={e => { e.preventDefault(); if (email) setDone(true) }} style={{ display: 'flex', gap: 10 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 9, border: '1.5px solid rgba(200,150,12,0.3)', background: 'rgba(255,245,225,0.07)', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#FFF5E1', outline: 'none' }} />
            <button type="submit" className="btn-primary" style={{ padding: '12px 22px', whiteSpace: 'nowrap' }}>Subscribe</button>
          </form>
        )}
      </motion.div>
    </section>
  )
}

/* ── Customize Laddu Section ── */


export default function HomePage() {
  const [customizeLadduOpen, setCustomizeLadduOpen] = useState(false)

  return (
    <div>
      <Hero onOpen={() => setCustomizeLadduOpen(true)} />
      <FeaturedProducts />
      <Categories />
      <section style={{ padding: '64px 20px', background: '#FFF5E1' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 40, alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SH label="Our Legacy" title="Handcrafted with" gold="Devotion" sub="Since generations, we've been crafting authentic ladoos and nourishing treats; we're preserving a legacy of pure ingredients and divine taste." />
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: 24 }}>
                Every laddu is shaped by hand, every ingredient is chosen with care. From the pure desi ghee to the finest saffron, our process is a labor of love and a tribute to traditional Indian craftsmanship.
              </p>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🍯</div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins,sans-serif' }}>Pure Ghee</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🌿</div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins,sans-serif' }}>Organic Besan</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>✨</div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins,sans-serif' }}>No Preservatives</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={familyMoment} alt="Our Tradition" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          </div>
        </div>
      </section>
      <FestivalBanner />
      <section style={{ padding: '64px 20px', background: '#F5E6C8' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 40, alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={shopInterior} alt="Our Luxury Shop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SH label="Visit Us" title="Experience" gold="Luxury" sub="Step into the world of Kbite, where tradition meets modern luxury. Visit our boutique outlets for a sensory journey through India's finest delicacies." />
              <button className="btn-primary" style={{ padding: '12px 32px' }}>Find a Store near you</button>
            </motion.div>
          </div>
        </div>
      </section>
      <WhyUs />
      <Testimonials />
      <Newsletter />
      <AnimatePresence>
        <CustomizeLaddu isOpen={customizeLadduOpen} onClose={() => setCustomizeLadduOpen(false)} />
      </AnimatePresence>
    </div>
  )
}
