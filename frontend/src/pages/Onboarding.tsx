import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Building2, Phone, Mic } from 'lucide-react';

const steps = [
  { num: 1, label: 'Welcome', icon: Building2 },
  { num: 2, label: 'Ready',   icon: Phone },
  { num: 3, label: 'Voice',   icon: Mic },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="w-full z-10 space-y-8" style={{ maxWidth: '640px' }}>
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center mb-6">
            <img 
              src="/assets/lifodial-logo.png"
              alt="Lifodial"
              className="logo"
              style={{
                height: '48px',
                width: 'auto',
                display: 'block',
              }}
            />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Your account has been set up by the Lifodial team
          </h1>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center space-x-3">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300"
                  style={{
                    backgroundColor: step >= s.num ? 'var(--accent-dim)' : 'var(--bg-surface-2)',
                    border: step >= s.num ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                    color: step >= s.num ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '14px',
                  }}
                >
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span style={{ fontSize: '12px', color: step >= s.num ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="w-16 h-px mb-5"
                  style={{ backgroundColor: step > s.num ? 'var(--accent-border)' : 'var(--border)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Panel */}
        <div
          className="rounded-xl p-8 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            minHeight: '320px',
          }}
        >
          <div className="flex-1 space-y-5">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="flex items-center gap-3" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    <Building2 size={20} style={{ color: 'var(--accent)' }} />
                    Welcome to Lifodial
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: '20px' }}>
                    Our team has configured your AI voice receptionist. Here are your clinic details.
                  </p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '12px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Clinic Name:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Apollo Health Partners</span>
                    
                    <span style={{ color: 'var(--text-muted)' }}>AI Number:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>+91 90001 23456</span>

                    <span style={{ color: 'var(--text-muted)' }}>Languages:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Hindi, English, Tamil</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Ready */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="flex items-center gap-3" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    <Phone size={20} style={{ color: 'var(--accent)' }} />
                    Your AI is ready
                  </h2>
                </div>
                <div
                  className="rounded-xl p-6"
                  style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--accent-border)' }}
                >
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Your dedicated AI number:</p>
                  <p style={{ fontSize: '28px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', fontWeight: 500 }}>
                    +91 90001 23456
                  </p>
                  <div
                    className="mt-5 p-3 rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
                  >
                    <Check size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}>
                      All technical setup has been completed by our team.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Voice recording (Placeholder just to keep step 3 as requested) */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="flex items-center gap-3" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    <Mic size={20} style={{ color: 'var(--accent)' }} />
                    Voice Configuration
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: '20px' }}>
                    Your custom AI voice profile has been activated successfully.
                  </p>
                </div>
                <div style={{ backgroundColor: 'var(--accent-dim)', padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} color="var(--accent)" />
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Voice cloning profile applied</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div
            className="mt-8 flex justify-between items-center pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                visibility: step === 1 ? 'hidden' : 'visible',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2"
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000000',
                backgroundColor: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent)'; }}
            >
              {step === 1 ? 'Confirm details' : step === 2 ? 'Got it' : 'Go to Dashboard'}
              {step !== 3 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
