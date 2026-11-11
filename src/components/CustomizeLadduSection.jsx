import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import customBanner from '../assets/images/custom_laddu_banner.png'

const HIGHLIGHTS = [
  '1. Pick 3–11 Superfoods',
  '2. Choose Style',
  '3. Select Pack Weight',
  '4. Handcrafted Fresh',
]

export default function CustomizeLadduSection({ onOpen }) {
  return (
    <section style={{ padding: '0 clamp(16px, 4vw, 20px)', background: '#FFF5E1' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            minHeight: 360,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 24px 56px rgba(45, 12, 6, 0.22)',
            border: '1px solid rgba(240, 208, 96, 0.28)',
          }}
        >
          {/* Subtle animated background image */}
          <motion.img
            src={customBanner}
            alt="Customize Your Laddu"
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
            }}
          />

          {/* Royal gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, rgba(35, 9, 4, 0.86) 0%, rgba(45, 12, 6, 0.68) 50%, rgba(25, 7, 3, 0.88) 100%)',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: 'clamp(36px, 7vw, 56px) clamp(20px, 5vw, 48px)',
              maxWidth: 760,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 99,
                background: 'rgba(200, 150, 12, 0.22)',
                border: '1px solid rgba(240, 208, 96, 0.45)',
                color: '#F0D060',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              <Sparkles size={13} />
              Craft Studio
            </motion.div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(30px, 5vw, 50px)',
                fontWeight: 900,
                color: '#FFF9EC',
                marginBottom: 14,
                lineHeight: 1.12,
                textShadow: '0 4px 18px rgba(0,0,0,0.45)',
              }}
            >
              Customize Your <span style={{ color: '#F0D060' }}>Special Laddu</span>
            </h2>

            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 'clamp(14px, 2vw, 15.5px)',
                color: 'rgba(255, 245, 225, 0.86)',
                maxWidth: 560,
                margin: '0 auto 24px',
                lineHeight: 1.65,
              }}
            >
              Blend your favourite dry fruits, nuts, seeds, and varieties into bespoke handcrafted nutrition made fresh for you.
            </p>

            {/* Step Pill Highlights */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 28,
              }}
            >
              {HIGHLIGHTS.map((label, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.09)',
                    border: '1px solid rgba(240, 208, 96, 0.22)',
                    color: '#FFF5E1',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </motion.span>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={onOpen}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 14,
                boxShadow: '0 12px 28px rgba(200, 150, 12, 0.42)',
              }}
            >
              Start Customizing
              <ArrowRight size={17} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
