import {
    ArrowRight,
    BarChart2,
    Bell,
    CalendarCheck,
    Check, ChevronRight,
    Globe,
    Headset,
    Menu,
    Phone,
    Play,
    Shield,
    X,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AudioWaveform } from '../components/AudioWaveform';
import { DemoCarousel } from '../components/landing/DemoCarousel';

// ─── Tokens (all hardcoded, no CSS vars — landing is always dark) ─────────────
const T = {
  bg:           '#0A0A0A',
  bgDeep:       '#0A0A0A',
  surface:      '#111111',
  surface2:     '#1A1A1A',
  border:       '#1A1A1A',
  borderMid:    '#2E2E2E',
  borderStrong: '#3E3E3E',
  accent:       '#3ECF8E',
  accentHover:  '#2EBF7E',
  accentDim:    'rgba(62,207,142,0.08)',
  accentBorder: 'rgba(62,207,142,0.20)',
  text:         '#FFFFFF',
  textSub:      '#A1A1A1',
  textMuted:    '#666666',
  textVeryMuted:'#444444',
};

// ─── Shared button styles ──────────────────────────────────────────────────────
function BtnPrimary({ children, onClick, to, size = 'md', style: sx, type = 'button' }: {
  children: React.ReactNode; to?: string; onClick?: () => void; size?: 'md' | 'lg';
  style?: React.CSSProperties; type?: 'button' | 'submit';
}) {
  const navigate = useNavigate();
  const pad = size === 'lg' ? '14px 36px' : '10px 22px';
  const fs  = size === 'lg' ? '16px' : '14px';
  const [hov, setHov] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: pad, borderRadius: '10px', fontSize: fs, fontWeight: 600,
        backgroundColor: hov ? T.accentHover : T.accent,
        color: '#000', border: 'none', cursor: 'pointer',
        transform: hov ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.18s ease',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick, to, size = 'md' }: {
  children: React.ReactNode; to?: string; onClick?: () => void; size?: 'md' | 'lg';
}) {
  const navigate = useNavigate();
  const pad = size === 'lg' ? '14px 36px' : '9px 20px';
  const fs  = size === 'lg' ? '16px' : '14px';
  const [hov, setHov] = useState(false);
  
  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: pad, borderRadius: '10px', fontSize: fs, fontWeight: 500,
        backgroundColor: 'transparent',
        color: T.text,
        border: `1px solid ${hov ? T.borderStrong : T.borderMid}`,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

const scrollToEl = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobile]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', action: () => scrollToEl('features') },
    { label: 'How it Works', action: () => scrollToEl('how-it-works') },
    { label: 'Benefits', action: () => scrollToEl('benefits') },
    { label: 'Docs', to: '/docs' }
  ];

  return (
    <>
      <nav
        className="nav-blur"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '64px',
          display: 'flex', alignItems: 'center',
          backgroundColor: scrolled ? 'rgba(10,10,10,0.90)' : 'rgba(10,10,10,0.70)',
          borderBottom: `1px solid ${scrolled ? T.surface : 'transparent'}`,
          transition: 'background-color 0.3s, border-color 0.3s',
        }}
      >
        <div
          style={{
            maxWidth: '1200px', margin: '0 auto', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          {/* Brand */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img 
                src="/assets/lifodial-logo.png"
                alt="Lifodial"
                className="logo-navbar"
                style={{
                  height: '36px',
                  width: 'auto',
                  filter: 'brightness(1.1) contrast(1.05)',
                  display: 'block',
                }}
              />
            </Link>
          </div>

          {/* Center nav (desktop) */}
          <div
            className="desktop-flex"
            style={{ gap: '32px', alignItems: 'center', justifyContent: 'center' }}
          >
            {navLinks.map(l => (
              <NavLinkItem key={l.label} label={l.label} onClick={l.action} to={l.to} />
            ))}
          </div>

          {/* Right buttons */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
            <div className="desktop-flex" style={{ gap: '10px', alignItems: 'center' }}>
              <BtnGhost to="/login">Sign in</BtnGhost>
              <BtnPrimary onClick={() => scrollToEl('contact')}>Contact Us</BtnPrimary>
            </div>
            {/* Mobile hamburger */}
            <button
              className="mobile-flex"
              onClick={() => setMobile(v => !v)}
              style={{
                padding: '6px', background: 'none', border: 'none',
                color: '#FFF', cursor: 'pointer',
              }}
            >
              {mobileOpen ? <X size={24} color="#FFF" /> : <Menu size={24} color="#FFF" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
          backgroundColor: '#111111', borderBottom: `1px solid #2E2E2E`,
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column'
        }}>
          {navLinks.map(l => (
            <div key={l.label} onClick={() => { setMobile(false); if(l.action) l.action(); }} style={{ padding: '12px 0', borderBottom: `1px solid #2E2E2E` }}>
              {l.to ? (
                <Link to={l.to} style={{ textDecoration: 'none', fontSize: '16px', color: T.text, display: 'block' }}>{l.label}</Link>
              ) : (
                <span style={{ fontSize: '16px', color: T.text, cursor: 'pointer', display: 'block' }}>{l.label}</span>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <BtnGhost to="/login" size="lg">Sign In</BtnGhost>
            <BtnPrimary onClick={() => { setMobile(false); scrollToEl('contact'); }} size="lg">Contact Us</BtnPrimary>
          </div>
        </div>
      )}
    </>
  );
}

function NavLinkItem({ label, onClick, to }: { label: string; onClick?: () => void; to?: string }) {
  const [hov, setHov] = useState(false);
  const style = {
    fontSize: '14px', color: hov ? T.text : T.textSub,
    cursor: 'pointer', transition: 'color 0.15s', userSelect: 'none' as const,
    textDecoration: 'none'
  };

  if (to) {
    return (
      <Link 
        to={to}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} 
        style={style}
      >
        {label}
      </Link>
    );
  }

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={style}
    >
      {label}
    </span>
  );
}

// ─── Hero section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero-section" style={{
      minHeight: '100vh', 
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div className="hero-glow" />

      {/* Badge */}
      <div className="fade-up" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        backgroundColor: T.surface2,
        border: `1px solid ${T.borderMid}`,
        borderRadius: '999px', padding: '6px 16px',
        marginBottom: '28px',
        zIndex: 1
      }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: T.textSub }}>
          ● Trusted by clinics across India & Middle East
        </span>
      </div>

      {/* Headline */}
      <h1 className="fade-up-delay-1" style={{
        fontSize: 'clamp(48px, 7vw, 80px)',
        fontWeight: 800, letterSpacing: '-0.03em',
        color: T.text, lineHeight: 1.05,
        margin: '0 0 24px',
        maxWidth: '820px',
        zIndex: 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        Your clinic{' '}
        <span className="gradient-text">never misses</span>
        <br />a call again
      </h1>

      {/* Subtitle */}
      <p className="fade-up-delay-2" style={{
        fontSize: '18px', color: T.textSub, lineHeight: 1.6,
        maxWidth: '520px', margin: '0 auto 36px',
        zIndex: 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        Lifodial is an AI voice receptionist that answers every patient call,
        books appointments, and speaks their language — 24 hours a day, 7 days a week.
      </p>

      {/* CTA buttons */}
      <div className="fade-up-delay-3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', zIndex: 1 }}>
        <BtnPrimary onClick={() => scrollToEl('contact')} size="lg">
          Contact Us <ArrowRight size={16} />
        </BtnPrimary>
        <BtnGhost onClick={() => scrollToEl('demo')} size="lg">
          <Play size={14} style={{ fill: T.text, stroke: 'none' }} />
          Watch demo
        </BtnGhost>
      </div>

      <p className="fade-up-delay-4" style={{ fontSize: '12px', color: T.textMuted, marginTop: '16px', zIndex: 1 }}>
        Onboarding handled by our team · Setup in under 24 hours
      </p>

      {/* Audio Waveform */}
      <div className="fade-up-delay-4" style={{ marginTop: '54px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <AudioWaveform />
         <p style={{ fontSize: '11px', color: T.accent, marginTop: '16px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
           Listening · Processing · Responding in &lt;800ms
         </p>
      </div>

      {/* Hero dashboard preview */}
      <div
        className="float-card fade-up-delay-4"
        style={{
          marginTop: '64px',
          width: '100%', maxWidth: '900px',
          borderRadius: '16px', overflow: 'hidden',
          border: `1px solid ${T.borderMid}`,
          boxShadow: `0 0 80px rgba(62,207,142,0.08), 0 0 200px rgba(62,207,142,0.04), 0 32px 80px rgba(0,0,0,0.4)`,
          zIndex: 1
        }}
      >
        {/* Mock browser chrome */}
        <div style={{
          backgroundColor: '#161616', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: `1px solid ${T.borderMid}`,
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, height: '22px', borderRadius: '6px',
            backgroundColor: T.surface2, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '11px', color: T.textMuted }}>app.lifodial.com/dashboard</span>
          </div>
        </div>

        {/* Mini dashboard preview */}
        <div style={{ backgroundColor: '#0B0B0B', padding: '24px', display: 'flex', gap: '16px' }}>
          {/* Sidebar */}
          <div style={{
            width: '140px', flexShrink: 0,
            backgroundColor: '#111111', borderRadius: '10px', padding: '12px 8px', border: `1px solid ${T.borderMid}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', paddingLeft: '8px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={9} color="#000" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: T.text }}>Lifodial</span>
            </div>
            {['Dashboard','Call Logs','Appointments','Doctors','Analytics'].map((item, i) => (
              <div key={item} style={{
                padding: '6px 8px', borderRadius: '6px', fontSize: '10px',
                color: i === 0 ? T.accent : T.textMuted,
                backgroundColor: i === 0 ? T.accentDim : 'transparent',
                marginBottom: '2px', fontWeight: i === 0 ? 500 : 400,
                display: 'flex', alignItems: 'center', gap: '5px',
                borderLeft: i === 0 ? `2px solid ${T.accent}` : '2px solid transparent',
              }}>
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* AI banner */}
            <div style={{
              padding: '6px 12px', borderRadius: '6px', marginBottom: '12px',
              backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: T.accent }} />
              <span style={{ fontSize: '10px', color: T.accent, fontWeight: 500 }}>
                AI Agent Online — Ready to receive calls on +91 90001 23456
              </span>
            </div>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'CALLS TODAY', val: '24' },
                { label: 'BOOKED', val: '11', green: true },
                { label: 'AVG DURATION', val: '2:14' },
                { label: 'RESOLUTION', val: '91%' },
              ].map(s => (
                <div key={s.label} style={{
                  backgroundColor: '#111111', borderRadius: '8px', padding: '10px',
                  border: `1px solid ${T.borderMid}`,
                }}>
                  <div style={{ fontSize: '8px', color: T.textMuted, marginBottom: '4px', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: s.green ? T.accent : T.text }}>{s.val}</div>
                </div>
              ))}
            </div>
            {/* Small table rows */}
            <div style={{ backgroundColor: '#111111', borderRadius: '8px', border: `1px solid ${T.borderMid}`, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${T.borderMid}`, fontSize: '10px', fontWeight: 600, color: T.text }}>
                Recent Call Activity
              </div>
              {[
                { phone: '+91 98XX XXXX34', intent: 'Appointment', lang: '🇮🇳 Hindi', status: 'Booked' },
                { phone: '+91 87XX XXXX21', intent: 'Emergency', lang: '🇬🇧 English', status: 'Transferred' },
                { phone: '+91 99XX XXXX09', intent: 'General Query', lang: '🇬🇧 English', status: 'Resolved' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '7px 12px',
                  borderBottom: i < 2 ? `1px solid ${T.borderMid}` : 'none',
                }}>
                  <span style={{ fontSize: '9px', color: T.text, fontFamily: 'monospace', width: '90px', flexShrink: 0 }}>{row.phone}</span>
                  <span style={{ fontSize: '9px', color: T.textSub, flex: 1 }}>{row.intent}</span>
                  <span style={{ fontSize: '9px', color: T.textMuted, width: '70px' }}>{row.lang}</span>
                  <span style={{
                    fontSize: '8px', fontWeight: 600, padding: '2px 6px', borderRadius: '999px',
                    color: row.status === 'Booked' ? T.accent : row.status === 'Transferred' ? '#A78BFA' : T.textMuted,
                    backgroundColor: row.status === 'Booked' ? T.accentDim : row.status === 'Transferred' ? 'rgba(167,139,250,0.1)' : T.surface2,
                  }}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social proof bar ──────────────────────────────────────────────────────────
function SocialProofBar() {
  const clinics = ['Apollo', 'Fortis', 'Aster', 'Medanta', 'Max Healthcare'];
  return (
    <section style={{
      borderTop: `1px solid ${T.borderMid}`,
      borderBottom: `1px solid ${T.borderMid}`,
      padding: '28px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', gap: '48px',
      }}>
        {clinics.map(c => (
          <ClinicLogo key={c} name={c} />
        ))}
      </div>
    </section>
  );
}

function ClinicLogo({ name }: { name: string }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em',
        color: hov ? T.textSub : '#4A4A4A',
        cursor: 'default', transition: 'color 0.2s', userSelect: 'none',
      }}
    >
      {name}
    </span>
  );
}

// ─── Features grid ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <Globe size={20} color={T.accent} />,
      title: 'Multilingual AI',
      body: 'Speaks Hindi, Tamil, Arabic, English and more. Detects language automatically from the first sentence.',
    },
    {
      icon: <CalendarCheck size={20} color={T.accent} />,
      title: 'Smart Booking',
      body: 'Books appointments directly into your HIS. No double entries, no manual work, no missed slots.',
    },
    {
      icon: <Zap size={20} color={T.accent} />,
      title: 'Instant Setup',
      body: 'Go live in under 24 hours. No hardware, no IT team, no complex integration required.',
    },
    {
      icon: <BarChart2 size={20} color={T.accent} />,
      title: 'Real-time Dashboard',
      body: 'Monitor every call, booking, and AI decision from one clean interface — from anywhere.',
    },
    {
      icon: <Shield size={20} color={T.accent} />,
      title: 'Patient Privacy',
      body: 'Phone numbers masked in logs. HIPAA-aligned data handling. Patients trust you.',
    },
    {
      icon: <Bell size={20} color={T.accent} />,
      title: 'Instant Alerts',
      body: 'Receive notifications for every booking the moment it happens. Never miss a new patient.',
    },
  ];

  return (
    <section id="features" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 600, color: T.text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Everything your clinic needs
          </h2>
          <p style={{ fontSize: '16px', color: T.textMuted }}>Built specifically for healthcare providers</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: '#111111', borderRadius: '12px', padding: '24px',
        border: `1px solid ${hov ? T.accentBorder : T.borderMid}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hov ? `0 0 24px rgba(62,207,142,0.06)` : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: T.text, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: T.textSub, lineHeight: 1.65, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

// ─── Benefits Section ──────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    {
      icon: <Phone size={24} color={T.accent} className="dot-pulse" />,
      title: '100% call answer rate',
      body: 'Every patient call is answered instantly, even at 2 AM. No hold music. No missed appointments. No lost revenue.',
      stat: 'Avg 847ms response time'
    },
    {
      icon: <Globe size={24} color={T.accent} />,
      title: 'Hindi, Tamil, Arabic & more',
      body: 'Patients speak in their native language and the AI responds naturally. No language barriers between patients and care.',
      stat: '8+ Indian & Middle Eastern languages'
    },
    {
      icon: <Shield size={24} color={T.accent} />,
      title: 'Reduce front desk load by 80%',
      body: 'Let your reception team focus on in-clinic patients. The AI handles all routine booking calls automatically.',
      stat: 'Based on clinic partner data'
    }
  ];

  return (
    <section id="benefits" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 600, color: T.text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Why clinics choose Lifodial
          </h2>
          <p style={{ fontSize: '16px', color: T.textMuted }}>Built specifically for healthcare in India and the Middle East</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {benefits.map(b => <BenefitCard key={b.title} {...b} />)}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, body, stat }: { icon: React.ReactNode; title: string; body: string; stat: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: '#111111', borderRadius: '16px', padding: '32px',
        border: `1px solid ${hov ? T.accent : T.borderMid}`,
        transition: 'border-color 0.2s',
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: T.text, margin: '0 0 12px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: T.textSub, lineHeight: 1.6, margin: '0 0 24px', flex: 1 }}>
        {body}
      </p>
      <div style={{ borderTop: `1px solid #1E1E1E`, paddingTop: '16px' }}>
        <span style={{ fontSize: '13px', color: T.accent, fontWeight: 500 }}>
          {stat}
        </span>
      </div>
    </div>
  );
}

// ─── Demo Section ─────────────────────────────────────────────────────────────
function DemoSection() {
  const [messages, setMessages] = useState<number>(0);
  
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const seq = [
       { delay: 1000, msgs: 1 }, 
       { delay: 4000, msgs: 2 },
       { delay: 6000, msgs: 3 },
       { delay: 12000, msgs: 4 },
       { delay: 14000, msgs: 5 }
    ];

    const runSeq = () => {
      setMessages(0);
      seq.forEach(s => {
        timers.push(setTimeout(() => setMessages(s.msgs), s.delay));
      });
    };

    runSeq();
    const loop = setInterval(runSeq, 20000);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section id="demo" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 600, color: T.text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            See Lifodial in action
          </h2>
          <p style={{ fontSize: '16px', color: T.textMuted }}>A real conversation between a patient and our AI</p>
        </div>

        <div style={{
          backgroundColor: '#111111', borderRadius: '24px',
          border: `1px solid ${T.borderMid}`, overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.borderMid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: T.accent }} className="dot-pulse" />
              <span style={{ fontSize: '13px', color: T.textMuted, fontWeight: 500 }}>Recording in progress · 0:47</span>
            </div>
            <div style={{ fontSize: '13px', color: T.textMuted }}>
              AI: Lifodial · Patient: +91 98XX XXXX34
            </div>
          </div>
          
          {/* Transcript Body */}
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px' }}>
            
            {messages >= 1 && (
              <div className="fade-up" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <span style={{ fontSize: '11px', color: T.textMuted, marginBottom: '4px', display: 'block' }}>Lifodial AI - 0:00</span>
                <div style={{ backgroundColor: T.surface2, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '15px', color: T.text, lineHeight: 1.5 }}>
                  "Namaste! Apollo Clinic mein aapka swagat hai. Main aapki kaise madad kar sakti hoon?"
                </div>
              </div>
            )}

            {messages >= 2 && (
              <div className="fade-up" style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <span style={{ fontSize: '11px', color: T.textMuted, marginBottom: '4px', display: 'block', textAlign: 'right' }}>Patient - 0:04</span>
                <div style={{ backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`, padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: '15px', color: T.accent, lineHeight: 1.5 }}>
                  "Mujhe cardiologist se milna hai"
                </div>
              </div>
            )}

            {messages >= 3 && (
              <div className="fade-up" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <span style={{ fontSize: '11px', color: T.textMuted, marginBottom: '4px', display: 'block' }}>Lifodial AI - 0:06</span>
                <div style={{ backgroundColor: T.surface2, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '15px', color: T.text, lineHeight: 1.5 }}>
                  "Dr. Suresh Menon available hain aaj. Kya aap 11:00 AM ka slot lenge?"
                </div>
              </div>
            )}

            {messages >= 4 && (
              <div className="fade-up" style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <span style={{ fontSize: '11px', color: T.textMuted, marginBottom: '4px', display: 'block', textAlign: 'right' }}>Patient - 0:12</span>
                <div style={{ backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`, padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: '15px', color: T.accent, lineHeight: 1.5 }}>
                  "Haan, theek hai"
                </div>
              </div>
            )}

            {messages >= 5 && (
              <div className="fade-up" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <span style={{ fontSize: '11px', color: T.textMuted, marginBottom: '4px', display: 'block' }}>Lifodial AI - 0:14</span>
                <div style={{ backgroundColor: T.surface2, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '15px', color: T.text, lineHeight: 1.5 }}>
                  "Perfect! Aapki appointment Dr. Suresh Menon ke saath aaj 11:00 AM ke liye confirm ho gayi. Appointment ID: APT-2847. Dhanyavaad!"
                  <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: T.bg, border: `1px solid ${T.borderMid}`, color: T.text, padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>
                    ✅ Appointment Booked
                  </div>
                </div>
              </div>
            )}
             
            {(messages === 0 || messages === 2 || messages === 4) && (
              <div className="fade-up" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                 <div style={{ display: 'flex', gap: '4px', padding: '16px 8px' }}>
                    <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: T.textSub, animationDelay: '0ms' }} />
                    <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: T.textSub, animationDelay: '200ms' }} />
                    <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: T.textSub, animationDelay: '400ms' }} />
                 </div>
              </div>
            )}

          </div>

          <div style={{ padding: '12px 24px', backgroundColor: '#0B0B0B', borderTop: `1px solid ${T.borderMid}`, textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: T.accent }}>⚡ Total call duration: 0:47 · Response time: 823ms avg</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: <Building2Icon />,
      title: 'Contact our team',
      body: 'Reach out to our onboarding specialists with your clinic details and requirements.',
    },
    {
      num: '02',
      icon: <Headset size={22} color={T.accent} />,
      title: 'Our team sets you up',
      body: 'After you contact us, our onboarding team handles the complete technical setup for your clinic. You focus on patients, we handle the rest.',
    },
    {
      num: '03',
      icon: <ZapIcon />,
      title: 'AI handles everything',
      body: 'Patients call your number, AI answers in their language, books appointments automatically — 24/7.',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 600, color: T.text, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            How Lifodial works
          </h2>
          <p style={{ fontSize: '16px', color: T.textMuted, maxWidth: '460px', margin: '0 auto' }}>
            Three steps from contact to your first AI-answered call
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', position: 'relative' }}>
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, isLast }: {
  step: { num: string; icon: React.ReactNode; title: string; body: string };
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: '#111111',
        border: `1px solid ${hov ? T.accentBorder : T.borderMid}`,
        borderRadius: '16px', padding: '32px',
        position: 'relative',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      {/* Step number */}
      <div style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
        color: T.accent, marginBottom: '20px',
      }}>
        {step.num}
      </div>
      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        {step.icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: T.text, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
        {step.title}
      </h3>
      <p style={{ fontSize: '14px', color: T.textSub, lineHeight: 1.65, margin: 0 }}>
        {step.body}
      </p>
      {/* Connector arrow (not on last) */}
      {!isLast && (
        <div style={{
          position: 'absolute', right: '-16px', top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2, display: 'none', // hidden on mobile typically, can enable with media queries
        }}>
          <ChevronRight size={20} style={{ color: T.textMuted }} />
        </div>
      )}
    </div>
  );
}

const Building2Icon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ZapIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26 6.91.01-5.52 4.73 2.09 6.91L12 16.27l-6.57 3.64 2.09-6.91L2 8.27l6.91-.01L12 2z"/></svg>;

// ─── Stats banner ──────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { num: '< 800ms',label: 'Average response time' },
    { num: '50+',    label: 'Concurrent calls supported' },
    { num: '99%',    label: 'Uptime SLA' },
    { num: '24hrs',  label: 'Time to go live' },
  ];

  return (
    <section style={{
      backgroundColor: `rgba(62,207,142,0.03)`,
      borderTop: `1px solid rgba(62,207,142,0.10)`,
      borderBottom: `1px solid rgba(62,207,142,0.10)`,
      padding: '72px 24px',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '48px', textAlign: 'center',
      }}>
        {stats.map(s => (
          <div key={s.num}>
            <div style={{
              fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 700,
              color: T.accent, letterSpacing: '-0.02em', lineHeight: 1,
              marginBottom: '8px',
            }}>
              {s.num}
            </div>
            <div style={{ fontSize: '14px', color: T.textMuted }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Contact Section ───────────────────────────────────────────────────────────
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Fixture mode: save to localstorage placeholder
    localStorage.setItem('lifodial_contact_submitted', 'true');
  };

  return (
    <section id="contact" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
        
        {/* Left Column */}
        <div>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 700, color: T.text,
            letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.1,
          }}>
            Ready to transform your clinic?
          </h2>
          <p style={{ fontSize: '18px', color: T.textSub, marginBottom: '32px', lineHeight: 1.6 }}>
            Our team will reach out within 24 hours to walk you through a live demo and handle your complete onboarding.
          </p>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Free demo call with our team', 'We handle all technical setup', 'Go live in under 24 hours', 'Dedicated onboarding support', 'No lock-in contracts'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: T.text }}>
                <Check size={18} color={T.accent} /> {item}
              </li>
            ))}
          </ul>

          <p style={{ fontSize: '13px', color: T.textMuted, lineHeight: 1.6 }}>
            We currently onboard clinics across India and the UAE. Reach out to check availability.
          </p>
        </div>

        {/* Right Column (Form) */}
        <div style={{ backgroundColor: '#111111', border: `1px solid ${T.borderMid}`, borderRadius: '16px', padding: '32px' }}>
          {submitted ? (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: T.accentDim, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                 <Check size={32} color={T.accent} />
               </div>
               <h3 style={{ fontSize: '24px', fontWeight: 600, color: T.text, marginBottom: '16px' }}>Request received!</h3>
               <p style={{ fontSize: '15px', color: T.textSub, marginBottom: '8px' }}>Our team will contact you within 24 hours.</p>
               <p style={{ fontSize: '15px', color: T.textSub }}>In the meantime, feel free to email us at <strong>hello@lifodial.com</strong></p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                 <div style={{ flex: '1 1 calc(50% - 8px)' }}>
                    <input required type="text" placeholder="Apollo Multispeciality Clinic" className="contact-input" />
                 </div>
                 <div style={{ flex: '1 1 calc(50% - 8px)' }}>
                    <input required type="text" placeholder="Dr. Rajesh Kumar, Admin" className="contact-input" />
                 </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                 <div style={{ flex: '1 1 calc(50% - 8px)', display: 'flex', gap: '8px' }}>
                    <select required className="contact-input" style={{ width: '100px', flexShrink: 0, paddingRight: '8px' }} defaultValue="+91">
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+974">🇶🇦 +974</option>
                    </select>
                    <input required type="tel" placeholder="98765 43210" className="contact-input" style={{ flex: 1 }} />
                 </div>
                 <div style={{ flex: '1 1 calc(50% - 8px)' }}>
                    <input required type="email" placeholder="admin@yourclinic.com" className="contact-input" />
                 </div>
              </div>
              
              <textarea placeholder="Number of doctors, daily call volume, languages needed..." className="contact-input" rows={3}></textarea>

              <BtnPrimary type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px' }}>
                Request a Demo <ArrowRight size={16} />
              </BtnPrimary>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666666', display: 'block' }}>Our team responds within 24 hours</span>
              </div>
            </form>
          )}

          <style dangerouslySetInnerHTML={{__html:`
            .contact-input {
              width: 100%;
              background-color: ${T.surface2};
              border: 1px solid ${T.borderMid};
              border-radius: 8px;
              padding: 12px 16px;
              color: ${T.text};
              font-size: 14px;
              transition: border-color 0.2s;
              outline: none;
            }
            .contact-input:focus {
              border-color: ${T.accent};
            }
            .contact-input::placeholder {
              color: ${T.textMuted};
            }
            select.contact-input option {
              color: #000;
              background-color: #FFF;
            }
          `}} />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Features', action: () => scrollToEl('features') }, 
        { label: 'Benefits', action: () => scrollToEl('benefits') }, 
        { label: 'How it Works', action: () => scrollToEl('how-it-works') }, 
        { label: 'Docs', to: '/docs' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', action: () => {} }, 
        { label: 'Contact Us', action: () => scrollToEl('contact') }, 
        { label: 'Careers', action: () => {} }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', action: () => {} }, 
        { label: 'Terms of Service', action: () => {} }, 
        { label: 'HIPAA Compliance', action: () => {} }
      ]
    },
  ];

  return (
    <footer style={{
      borderTop: `1px solid ${T.borderMid}`,
      padding: '64px 24px 32px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr repeat(3, 1fr)',
          gap: '48px',
          marginBottom: '48px',
        }}>
          {/* Brand column */}
          <div>
            <img 
              src="/assets/lifodial-logo.png"
              alt="Lifodial"
              className="logo"
              style={{
                height: '24px',
                width: 'auto', 
                mixBlendMode: 'lighten',
                marginBottom: '12px',
              }}
            />
            <p style={{ fontSize: '13px', color: '#666666', lineHeight: 1.6, maxWidth: '220px' }}>
              AI Voice Receptionist for Clinics
            </p>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: T.text, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.links.map(link => (
                  <FooterLink key={link.label} label={link.label} action={link.action} to={link.to} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${T.borderMid}`,
          paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: T.textVeryMuted }}>
            © 2026 Lifodial. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
             <span style={{ fontSize: '12px', color: T.textVeryMuted }}>
               Made for clinics in India 🇮🇳 and Middle East 🇦🇪
             </span>
             <Link to="/superadmin/login" style={{ fontSize: '11px', color: T.textVeryMuted, textDecoration: 'none' }}>
               Team login →
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ label, action, to }: { label: string; action: () => void; to?: string }) {
  const [hov, setHov] = useState(false);
  const style = {
    fontSize: '14px', color: hov ? T.textSub : T.textMuted,
    cursor: 'pointer', transition: 'color 0.15s', textDecoration: 'none'
  };

  return (
    <li>
      {to ? (
        <Link 
          to={to}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} 
          style={style}
        >
          {label}
        </Link>
      ) : (
        <span
          onClick={action}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={style}
        >
          {label}
        </span>
      )}
    </li>
  );
}

// ─── Landing Page (assembly) ───────────────────────────────────────────────────
export default function Landing() {
  return (
    <div
      className="landing-page"
      style={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}
    >
      {/* Fixed dot grid background */}
      <div className="dot-grid-bg" />

      {/* All content above the grid */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <HeroSection />
        <SocialProofBar />
        <FeaturesSection />
        <BenefitsSection />
        <DemoCarousel />
        <HowItWorks />
        <StatsBanner />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
