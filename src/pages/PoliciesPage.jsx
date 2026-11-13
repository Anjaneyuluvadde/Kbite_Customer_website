import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Info, 
  PhoneCall, 
  Tag, 
  FileText, 
  ShieldCheck, 
  RotateCcw, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Shield,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'about', label: 'About Us', path: '/about', Icon: Info },
  { id: 'contact', label: 'Contact Us', path: '/contact', Icon: PhoneCall },
  { id: 'pricing', label: 'Pricing Policy', path: '/pricing', Icon: Tag },
  { id: 'terms', label: 'Terms & Conditions', path: '/terms', Icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy', Icon: ShieldCheck },
  { id: 'refund', label: 'Cancellation & Refund', path: '/refund-policy', Icon: RotateCcw },
]

export default function PoliciesPage({ initialTab }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Directly derive active tab from URL path / props
  const getTabFromPath = () => {
    if (initialTab) return initialTab
    const path = location.pathname.toLowerCase()
    if (path.includes('/about')) return 'about'
    if (path.includes('/contact')) return 'contact'
    if (path.includes('/pricing')) return 'pricing'
    if (path.includes('/terms')) return 'terms'
    if (path.includes('/privacy')) return 'privacy'
    if (path.includes('/refund-policy') || path.includes('/refund')) return 'refund'
    
    // Check search params e.g. /policies?tab=contact
    const searchParams = new URLSearchParams(location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam && TABS.some(t => t.id === tabParam)) return tabParam

    return 'about'
  }

  const activeTab = getTabFromPath()

  const handleTabSelect = (tab) => {
    navigate(tab.path)
  }

  // Contact form submission state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      toast.success('Thank you! Your message has been received.')
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 800)
  }

  return (
    <div style={{ background: '#FFF5E1', minHeight: '100vh', paddingTop: 110, paddingBottom: 90 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
        
        {/* Page Header */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="section-label" style={{ letterSpacing: '0.28em' }}>
              Transparency &amp; Legal Compliance
            </span>
            <h1 className="section-title" style={{ fontSize: 'clamp(30px, 4vw, 44px)', marginBottom: 12 }}>
              Policies &amp; <span className="gold">Information</span>
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: 14, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              Review our verified company details, terms of service, customer privacy protections, and order policies for a transparent shopping experience.
            </p>
          </motion.div>
        </header>

        {/* Tab Navigation Pill Bar */}
        <div
          role="tablist"
          aria-label="Policies and Information Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 36,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.Icon
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabSelect(tab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 20px',
                  borderRadius: 14,
                  border: isActive ? '1.5px solid #C8960C' : '1.5px solid rgba(200, 150, 12, 0.22)',
                  background: isActive ? '#C8960C' : '#fff',
                  color: isActive ? '#fff' : '#2C1200',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 8px 22px rgba(200, 150, 12, 0.28)' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.22s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Policy Content Card */}
        <main
          style={{
            background: '#fff',
            borderRadius: 24,
            border: '1px solid rgba(200, 150, 12, 0.16)',
            boxShadow: '0 20px 50px rgba(44, 18, 0, 0.05)',
            padding: 'clamp(24px, 5vw, 48px)',
            minHeight: 520,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* TAB 1: ABOUT US */}
              {activeTab === 'about' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <Info size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        About Kbite
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        Handcrafted Devotion &bull; Protein in Every Bite
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#2C1200', marginBottom: 12 }}>
                    Our Heritage &amp; Philosophy
                  </h3>
                  <p style={{ marginBottom: 20, color: '#555' }}>
                    Welcome to <strong>Kbite</strong>. Inspired by traditional culinary roots and handcrafted with reverence, Kbite brings together the timeless purity of Indian confectionery with modern nutritional vitality. Every laddu and dry fruit delicacy we prepare is a celebration of authentic taste, clean ingredients, and dedicated craftsmanship.
                  </p>
                  <p style={{ marginBottom: 24, color: '#555' }}>
                    We believe true luxury lies in honest ingredients. We use 100% pure desi cow ghee, premium nuts (almonds, cashews, pistachios, dates, walnuts), organic besan, and natural sweeteners. We strictly avoid artificial preservatives, synthetic food colors, and refined palm oils.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, margin: '28px 0' }}>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.15)', borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>🌿</div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>100% Pure &amp; Wholesome</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        Crafted with premium slow-roasted pulses, finest grade dry fruits, and unadulterated cow ghee.
                      </p>
                    </div>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.15)', borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>💪</div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>Protein In Every Bite</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        Nourishing formulations tailored for health-conscious families, growing school children, and active working professionals.
                      </p>
                    </div>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.15)', borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>Custom Crafting</h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        Pioneering interactive customization, allowing customers to curate bespoke laddu formulations per their dietary preferences.
                      </p>
                    </div>
                  </div>

                  {/* Registered Business & Regulatory Information Box */}
                  <div style={{ background: '#FDFBF7', border: '1px solid rgba(200, 150, 12, 0.25)', borderRadius: 18, padding: 24, marginTop: 32 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#C8960C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={18} /> Official Business Identity &amp; Registrations
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 13.5 }}>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Legal Entity Name</span>
                        <strong style={{ color: '#2C1200' }}>[Insert Registered Legal Entity / Company Name]</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Brand / Trade Name</span>
                        <strong style={{ color: '#2C1200' }}>Kbite</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>FSSAI Registration / License No.</span>
                        <strong style={{ color: '#2C1200' }}>[Insert FSSAI License Number]</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>GST Identification Number (GSTIN)</span>
                        <strong style={{ color: '#2C1200' }}>[Insert GSTIN, if applicable]</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Operating Location</span>
                        <strong style={{ color: '#2C1200' }}>Vrindavan, Uttar Pradesh 281121, India</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Support Contact</span>
                        <strong style={{ color: '#2C1200' }}>hello@kbite.in | +91 98765 43210</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT US */}
              {activeTab === 'contact' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <PhoneCall size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        Contact Us
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        Customer Support, Order Queries &amp; Corporate Inquiries
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 36 }}>
                    {/* Left: Contact Channels */}
                    <div>
                      <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#2C1200', marginBottom: 16 }}>
                        Get in Touch
                      </h3>
                      <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>
                        Have a question regarding your order, customized gift boxes, or bulk corporate requirements? Our support team is here to assist you.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ background: '#FFF5E1', padding: 10, borderRadius: 10, color: '#C8960C' }}>
                            <Mail size={20} />
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Support Email</span>
                            <div style={{ fontWeight: 600, color: '#2C1200', fontSize: 14 }}>hello@kbite.in</div>
                            <span style={{ fontSize: 12, color: '#777' }}>Response turnaround: within 24 hours</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ background: '#FFF5E1', padding: 10, borderRadius: 10, color: '#C8960C' }}>
                            <Phone size={20} />
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Care Phone</span>
                            <div style={{ fontWeight: 600, color: '#2C1200', fontSize: 14 }}>+91 98765 43210</div>
                            <span style={{ fontSize: 12, color: '#777' }}>Direct line &amp; WhatsApp Support</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ background: '#FFF5E1', padding: 10, borderRadius: 10, color: '#C8960C' }}>
                            <MapPin size={20} />
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered &amp; Operating Address</span>
                            <div style={{ fontWeight: 600, color: '#2C1200', fontSize: 14 }}>Vrindavan, Uttar Pradesh 281121, India</div>
                            <span style={{ fontSize: 12, color: '#777' }}>[Insert Complete Official Registered Street Address]</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ background: '#FFF5E1', padding: 10, borderRadius: 10, color: '#C8960C' }}>
                            <Clock size={20} />
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Hours</span>
                            <div style={{ fontWeight: 600, color: '#2C1200', fontSize: 14 }}>Monday – Saturday: 9:00 AM – 7:00 PM IST</div>
                            <span style={{ fontSize: 12, color: '#777' }}>Closed on Sundays &amp; National Holidays</span>
                          </div>
                        </div>
                      </div>

                      {/* Grievance Officer details for compliance */}
                      <div style={{ marginTop: 28, padding: 16, background: '#FFFBF4', borderRadius: 14, border: '1px solid rgba(200,150,12,0.18)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#C8960C', textTransform: 'uppercase', marginBottom: 4 }}>
                          Grievance Officer
                        </div>
                        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
                          Name: <strong>[Insert Grievance Officer Name]</strong><br />
                          Email: <strong>grievance@kbite.in</strong> (or <strong>hello@kbite.in</strong>)<br />
                          Contact: <strong>+91 98765 43210</strong>
                        </p>
                      </div>
                    </div>

                    {/* Right: Interactive Message Form */}
                    <div style={{ background: '#FFFBF4', padding: '24px 28px', borderRadius: 20, border: '1px solid rgba(200,150,12,0.2)' }}>
                      <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, color: '#2C1200', marginBottom: 6 }}>
                        Send us a Message
                      </h4>
                      <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                        Leave your query below and our team will get back to you promptly.
                      </p>

                      {submitted ? (
                        <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                          <CheckCircle2 size={48} color="#C8960C" style={{ margin: '0 auto 12px' }} />
                          <h5 style={{ fontSize: 18, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>Message Received!</h5>
                          <p style={{ fontSize: 13, color: '#666', marginBottom: 18 }}>We will reply to your registered email shortly.</p>
                          <button type="button" onClick={() => setSubmitted(false)} className="btn-outline" style={{ fontSize: 13, padding: '8px 20px' }}>
                            Send Another Message
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Full Name *</label>
                            <input
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="Enter your name"
                              className="input-field"
                              style={{ padding: '10px 14px', fontSize: 13 }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Email Address *</label>
                              <input
                                type="email"
                                required
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="name@example.com"
                                className="input-field"
                                style={{ padding: '10px 14px', fontSize: 13 }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Phone Number</label>
                              <input
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                placeholder="+91 98765..."
                                className="input-field"
                                style={{ padding: '10px 14px', fontSize: 13 }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Subject</label>
                            <input
                              type="text"
                              value={contactForm.subject}
                              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                              placeholder="Order Inquiry / Bulk Order / Feedback"
                              className="input-field"
                              style={{ padding: '10px 14px', fontSize: 13 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Your Message *</label>
                            <textarea
                              required
                              rows={4}
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="How can we assist you today?"
                              className="input-field"
                              style={{ padding: '10px 14px', fontSize: 13, resize: 'vertical' }}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{ justifyContent: 'center', width: '100%', padding: '12px 24px', fontSize: 14 }}
                          >
                            <Send size={16} />
                            {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING POLICY */}
              {activeTab === 'pricing' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <Tag size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        Pricing Policy
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        Transparent Product Pricing &amp; Order Value Breakdown
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#2C1200', marginBottom: 12 }}>
                    Transparent &amp; Fair Pricing
                  </h3>
                  <p style={{ marginBottom: 20, color: '#555' }}>
                    At <strong>Kbite</strong>, we are committed to complete pricing transparency. Every product offered across our storefront displays its exact price in Indian Rupees (₹ / INR). Customers are fully informed of all costs prior to confirming their orders or initiating payment through Razorpay.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, margin: '24px 0' }}>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.18)', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#C8960C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={18} /> Indian Rupees (₹ INR)
                      </h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        All prices listed on product cards, category catalogs, and checkout breakdowns are exclusively stated in Indian National Rupees (INR).
                      </p>
                    </div>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.18)', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#C8960C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={18} /> Tax Transparency (GST)
                      </h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        Product prices are inclusive of all applicable Goods and Services Tax (GST). No hidden surcharge or unexpected tax is appended at checkout.
                      </p>
                    </div>
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200,150,12,0.18)', borderRadius: 16, padding: 20 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#C8960C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={18} /> Delivery &amp; Shipping Charges
                      </h4>
                      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                        Standard shipping is currently provided with <strong>FREE Shipping</strong> across all service areas in India as displayed on the Checkout Summary.
                      </p>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, color: '#2C1200', marginTop: 32, marginBottom: 14 }}>
                    Standard Product Pricing Reference
                  </h3>
                  <div style={{ overflowX: 'auto', marginBottom: 28 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                      <thead>
                        <tr style={{ background: '#FFF5E1', borderBottom: '2px solid rgba(200,150,12,0.3)', color: '#2C1200' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category / Product Type</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pack Weights</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Typical Price Range (INR)</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Shipping Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>Traditional Ladoos (Besan, Boondi, Motichoor)</td>
                          <td style={{ padding: '12px 16px', color: '#666' }}>250g / 500g / 1kg</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#C8960C' }}>₹320 – ₹1,100</td>
                          <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 600 }}>FREE</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>Dry Fruit &amp; Kaju Delicacies</td>
                          <td style={{ padding: '12px 16px', color: '#666' }}>250g / 500g / 1kg</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#C8960C' }}>₹450 – ₹1,650</td>
                          <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 600 }}>FREE</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>Bespoke Customized Laddu Gift Box</td>
                          <td style={{ padding: '12px 16px', color: '#666' }}>Standard 1kg Curated Box</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#C8960C' }}>₹900</td>
                          <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 600 }}>FREE</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                    * Prices are subject to revision based on seasonal market prices of raw dry fruits and pure desi ghee, but once an order is placed, the price confirmed at checkout is final and binding.
                  </p>
                </div>
              )}

              {/* TAB 4: TERMS & CONDITIONS */}
              {activeTab === 'terms' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <FileText size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        Terms &amp; Conditions
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        User Agreement, Platform Usage &amp; Commercial Terms
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13.5, color: '#555' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>1. Agreement to Terms</h4>
                      <p>
                        By accessing, browsing, creating an account, or placing an order on <strong>Kbite</strong> (operated by <strong>[Insert Registered Legal Entity / Company Name]</strong>), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>2. Eligibility &amp; Account Responsibility</h4>
                      <p>
                        To purchase products, you must be at least 18 years of age or be accessing the website under the supervision of a parent or legal guardian. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>3. Product Representation &amp; Handcrafted Variations</h4>
                      <p>
                        Our ladoos and dry fruit treats are individually handcrafted using authentic, artisanal methods. While we endeavor to ensure high consistency, minor variations in visual appearance, color nuance, weight, or individual garnishing may occur naturally. Product packaging imagery is for representative purposes.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>4. Electronic Payments via Razorpay</h4>
                      <p>
                        Online payments made on Kbite are securely facilitated through our authorized payment partner, <strong>Razorpay</strong>. By initiating a transaction, you authorize Razorpay and its banking partners to debit the designated amount from your selected payment mode (UPI, Credit/Debit Card, Net Banking, or Wallet). Kbite does not store confidential card details or CVVs on our servers.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>5. Order Acceptance &amp; Fulfillment</h4>
                      <p>
                        We reserve the right to refuse or cancel any order for reasons including non-availability of raw ingredients, inaccuracies in product pricing or inventory, issues identified by our fraud prevention team, or courier non-serviceability in the delivery area. If your order is cancelled after payment deduction, the full amount will be credited back per our Refund Policy.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>6. Intellectual Property Rights</h4>
                      <p>
                        All trademarks, brand logos, brand names, visual illustrations, textual descriptions, product formulations, and proprietary software elements displayed on this website are the intellectual property of <strong>[Insert Registered Legal Entity / Company Name]</strong> and are protected by applicable intellectual property and copyright laws.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>7. Governing Law &amp; Dispute Resolution</h4>
                      <p>
                        These Terms and Conditions and any separate agreements shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of or related to this platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>[Insert City / Jurisdiction, e.g., Mathura / Uttar Pradesh, India]</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRIVACY POLICY */}
              {activeTab === 'privacy' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <ShieldCheck size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        Privacy Policy
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        Customer Data Protection, Security &amp; Information Handling
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13.5, color: '#555' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>1. Information We Collect</h4>
                      <p>
                        When you visit, browse, or purchase from Kbite, we collect only information necessary to fulfill your orders and enhance your experience:
                      </p>
                      <ul style={{ paddingLeft: 22, marginTop: 6 }}>
                        <li><strong>Contact &amp; Identity Details:</strong> Full name, delivery address, postal pincode, phone number, and email address.</li>
                        <li><strong>Order Information:</strong> Products selected, custom box specifications, delivery instructions, and past order history.</li>
                        <li><strong>Technical Device Telemetry:</strong> Anonymized browser type, IP address, device viewport, and basic session cookies essential for shopping cart continuity.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>2. Payment Card Data Security</h4>
                      <p>
                        We take payment security with the utmost seriousness. All payment processing on Kbite is powered through <strong>Razorpay</strong>, which is certified compliant with the highest global payment industry standard (<strong>PCI-DSS Level 1</strong>). Kbite <strong>does not</strong> store, capture, or log your credit card numbers, CVVs, net banking credentials, or UPI MPINs.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>3. Purpose of Data Collection</h4>
                      <p>
                        Your personal information is utilized strictly for lawful business purposes:
                      </p>
                      <ul style={{ paddingLeft: 22, marginTop: 6 }}>
                        <li>Processing and fulfilling your orders and shipping packages to your doorstep.</li>
                        <li>Transmitting transactional notifications, order confirmations, and dispatch tracking links.</li>
                        <li>Providing proactive customer assistance and resolving delivery queries.</li>
                        <li>Fraud prevention and regulatory compliance with applicable Indian commercial laws.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>4. Data Sharing with Third Parties</h4>
                      <p>
                        Kbite <strong>never sells, rents, or commercializes</strong> customer personal records. Information is shared only with vetted operational service providers under strict non-disclosure obligations:
                      </p>
                      <ul style={{ paddingLeft: 22, marginTop: 6 }}>
                        <li><strong>Courier &amp; Logistics Partners:</strong> For actual doorstep delivery of your order (Name, Delivery Address, Phone).</li>
                        <li><strong>Razorpay Software Pvt. Ltd.:</strong> For electronic payment authorization and settlement.</li>
                        <li><strong>Legal &amp; Regulatory Authorities:</strong> If mandated by official government subpoena, statutory audit, or legal process.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>5. Your Rights &amp; Data Rectification</h4>
                      <p>
                        You have the right to access, review, correct, or request deletion of your account profile at any time by contacting our customer care team at <strong>hello@kbite.in</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CANCELLATION & REFUND POLICY */}
              {activeTab === 'refund' && (
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#333', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#FFF5E1', padding: 12, borderRadius: 14 }}>
                      <RotateCcw size={26} color="#C8960C" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#2C1200', marginBottom: 2 }}>
                        Cancellation &amp; Refund Policy
                      </h2>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                        Perishable Goods Guidelines, Cancellation Cutoffs &amp; Refund Timelines
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,150,12,0.15)', margin: '20px 0 28px' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13.5, color: '#555' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>1. Perishable Food Products Notice</h4>
                      <p>
                        Because our ladoos, dry fruit snacks, and customized sweets are perishable food products prepared fresh with pure ghee and natural ingredients, <strong>returns of unsealed or delivered food items cannot be accepted</strong> due to strict health, hygiene, and food safety standards.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>2. Order Cancellation Cutoff</h4>
                      <p>
                        Customers may cancel an order directly from their account dashboard (<Link to="/orders" style={{ color: '#C8960C', textDecoration: 'underline' }}>My Orders</Link>) or by notifying us via email/phone, <strong>subject to the following conditions</strong>:
                      </p>
                      <ul style={{ paddingLeft: 22, marginTop: 6 }}>
                        <li><strong>Standard Products:</strong> Cancellations are accepted if requested <strong>prior to order dispatch / handover to the courier partner</strong>.</li>
                        <li><strong>Customized Ladoos:</strong> Because custom orders are specifically blended and hand-rolled to individual specifications, cancellations must be initiated <strong>before kitchen batch preparation commences</strong>.</li>
                        <li>Once an order status changes to <em>"Dispatched"</em> or <em>"Out for Delivery"</em>, the order cannot be cancelled.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1200', marginBottom: 6 }}>3. Damaged, Defective or Incorrect Deliveries</h4>
                      <p>
                        If your package arrives with damaged external packaging, broken security seals, or contains items different from what was ordered:
                      </p>
                      <ul style={{ paddingLeft: 22, marginTop: 6 }}>
                        <li>Please notify our support team at <strong>hello@kbite.in</strong> or <strong>+91 98765 43210</strong> within <strong>[Insert Damage Reporting Window, e.g., 24 to 48 hours]</strong> of delivery.</li>
                        <li>Please share your Order ID, clear photographs of the outer package, shipping label, and the condition of the inner contents.</li>
                        <li>Upon review and verification, we will promptly dispatch a fresh replacement free of charge or initiate a full refund.</li>
                      </ul>
                    </div>

                    {/* Crucial refund timeline box */}
                    <div style={{ background: '#FFFBF4', border: '1px solid rgba(200, 150, 12, 0.28)', borderRadius: 16, padding: 22, marginTop: 8 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#C8960C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={18} /> Refund Method &amp; Processing Timelines
                      </h4>
                      <p style={{ margin: 0, fontSize: 13.5 }}>
                        Once a cancellation or eligible refund request is approved by our team:
                      </p>
                      <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 0 }}>
                        <li>The refund will be issued directly back to the <strong>original payment method</strong> (Credit Card, Debit Card, Net Banking, or UPI) via our payment gateway partner Razorpay.</li>
                        <li>The credited amount typically reflects in the customer's bank account within <strong>[Insert Refund Processing Days, e.g., X business days as confirmed by merchant]</strong> from the date of approval, depending on the issuing bank&apos;s processing cycles.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

