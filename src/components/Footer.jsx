import { Link } from 'react-router-dom'
import kbiteLogo from '../assets/images/kbite_logo.png'

export default function Footer() {
  return (
    <footer style={{
      background: '#2C1200',
      color: '#FFF5E1',
      padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 24px) clamp(16px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <img
                src={kbiteLogo}
                alt="Kbite — Protein In Every Bite"
                style={{
                  height: 60,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                }}
              />
            </div>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: 'rgba(255,245,225,0.6)', lineHeight: 1.7 }}>
              Handcrafted ladoos and finest dry fruits. Made with love, blessed with tradition.
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: '#C8960C', marginBottom: 14 }}>
              Quick Links
            </h4>
            {[['Home', '/'], ['Products', '/products'], ['Cart', '/cart'], ['Login', '/login']].map(([label, to]) => (
              <Link key={to} to={to} style={{
                display: 'block', color: 'rgba(255,245,225,0.6)',
                textDecoration: 'none', fontFamily: 'Poppins,sans-serif',
                fontSize: 13, marginBottom: 8,
              }}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: '#C8960C', marginBottom: 14 }}>
              Policies &amp; Legal
            </h4>
            {[
              ['About Us', '/about'],
              ['Contact Us', '/contact'],
              ['Pricing Policy', '/pricing'],
              ['Terms & Conditions', '/terms'],
              ['Privacy Policy', '/privacy'],
              ['Cancellation & Refund', '/refund-policy'],
            ].map(([label, to]) => (
              <Link key={to} to={to} style={{
                display: 'block', color: 'rgba(255,245,225,0.6)',
                textDecoration: 'none', fontFamily: 'Poppins,sans-serif',
                fontSize: 13, marginBottom: 8, transition: 'color 0.2s',
              }} className="hover:text-amber-300">
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: '#C8960C', marginBottom: 14 }}>
              Contact
            </h4>
            {['📞 +91 9121 838383', '📧 eatkrishna@gmail.com', '📍 KPHB 7th Phase, Hyderabad - 500082'].map(t => (
              <p key={t} style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: 'rgba(255,245,225,0.6)', marginBottom: 8 }}>
                {t}
              </p>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(200,150,12,0.2)', paddingTop: 20, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: 'rgba(255,245,225,0.35)' }}>
            © {new Date().getFullYear()} Kbite. All rights reserved. FSSAI Certified | Made in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
