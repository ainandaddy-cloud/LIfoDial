import React, { useState, useEffect, useRef } from 'react';

// ─── Design tokens (always dark, landing page only) ──────────────────────────
const T = {
  bg:           '#0A0A0A',
  surface:      '#111111',
  surface2:     '#161616',
  borderMid:    '#2E2E2E',
  accent:       '#3ECF8E',
  accentDim:    'rgba(62,207,142,0.08)',
  accentBorder: 'rgba(62,207,142,0.20)',
  text:         '#FFFFFF',
  textSub:      '#A1A1A1',
  textMuted:    '#666666',
};

// ─── Conversation Data ──────────────────────────────────────────────────────
interface Message { role: 'ai' | 'patient'; text: string; time: string; }
interface Conversation {
  id: number;
  language: string;
  flag: string;
  patient_number: string;
  clinic: string;
  specialization: string;
  outcome: string;
  messages: Message[];
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 1, language: 'Hindi', flag: '🇮🇳',
    patient_number: '+91 98XX XXXX34', clinic: 'Apollo Multispeciality Clinic', specialization: 'Cardiology', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'Namaste! Apollo Clinic mein aapka swagat hai. Main aapki kaise madad kar sakti hoon?', time: '0:00' },
      { role: 'patient', text: 'Mujhe cardiologist se milna hai', time: '0:04' },
      { role: 'ai', text: 'Dr. Suresh Menon available hain aaj. Kya aap 11:00 AM ka slot lenge?', time: '0:06' },
      { role: 'patient', text: 'Haan, theek hai', time: '0:12' },
      { role: 'ai', text: 'Perfect! Appointment confirm ho gayi. ID: APT-2847. Dhanyavaad!', time: '0:14' },
    ],
  },
  {
    id: 2, language: 'English', flag: '🇬🇧',
    patient_number: '+91 87XX XXXX21', clinic: 'Fortis Healthcare', specialization: 'Dermatology', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'Good morning! Thank you for calling Fortis Healthcare. How may I assist you?', time: '0:00' },
      { role: 'patient', text: 'I need an appointment with a skin specialist', time: '0:03' },
      { role: 'ai', text: 'Dr. Priya Nair is available tomorrow at 10:30 AM. Shall I book that for you?', time: '0:05' },
      { role: 'patient', text: 'Yes please', time: '0:10' },
      { role: 'ai', text: 'Confirmed! Appointment with Dr. Priya Nair tomorrow 10:30 AM. ID: APT-2848.', time: '0:12' },
    ],
  },
  {
    id: 3, language: 'Arabic', flag: '🇦🇪',
    patient_number: '+971 55XX XXXX44', clinic: 'Al Zahra Hospital Dubai', specialization: 'General', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'مرحباً! أهلاً وسهلاً بك في مستشفى الزهراء. كيف يمكنني مساعدتك؟', time: '0:00' },
      { role: 'patient', text: 'أريد حجز موعد مع طبيب عام', time: '0:05' },
      { role: 'ai', text: 'الدكتور أحمد الرشيدي متاح اليوم الساعة 2:00 مساءً. هل تريد الحجز؟', time: '0:08' },
      { role: 'patient', text: 'نعم، من فضلك', time: '0:13' },
      { role: 'ai', text: 'تم تأكيد موعدك مع الدكتور أحمد الساعة 2:00 مساءً. رقم الحجز: APT-2849', time: '0:15' },
    ],
  },
  {
    id: 4, language: 'Tamil', flag: '🇮🇳',
    patient_number: '+91 99XX XXXX09', clinic: 'Aster Medicity Kochi', specialization: 'Orthopaedic', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'வணக்கம்! Aster Medicity-ல் உங்களை வரவேற்கிறோம். நான் உங்களுக்கு எப்படி உதவலாம்?', time: '0:00' },
      { role: 'patient', text: 'எனக்கு எலும்பு மருத்துவர் தேவை', time: '0:04' },
      { role: 'ai', text: 'Dr. Vikram Shah இன்று கிடைக்கிறார். மாலை 4:30 மணிக்கு appointment வேண்டுமா?', time: '0:07' },
      { role: 'patient', text: 'சரி, book பண்ணுங்க', time: '0:13' },
      { role: 'ai', text: 'உங்கள் appointment confirm ஆகிவிட்டது! ID: APT-2850. நன்றி!', time: '0:15' },
    ],
  },
  {
    id: 5, language: 'Malayalam', flag: '🇮🇳',
    patient_number: '+91 77XX XXXX87', clinic: 'Aster Medicity', specialization: 'Gynaecology', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'നമസ്കാരം! Aster Medicity-ലേക്ക് സ്വാഗതം. ഞാൻ എങ്ങനെ സഹായിക്കാം?', time: '0:00' },
      { role: 'patient', text: 'എനിക്ക് ഒരു lady doctor-നെ കാണണം', time: '0:04' },
      { role: 'ai', text: 'Dr. Meena Iyer ഇന്ന് available ആണ്. ഉച്ചയ്ക്ക് 2:00 മണിക്ക് slot ഉണ്ട്. book ചെയ്യട്ടെ?', time: '0:07' },
      { role: 'patient', text: 'ശരി, book ചെയ്യൂ', time: '0:13' },
      { role: 'ai', text: 'Appointment confirm ആയി! Dr. Meena Iyer, 2:00 PM. ID: APT-2851.', time: '0:15' },
    ],
  },
  {
    id: 6, language: 'Kannada', flag: '🇮🇳',
    patient_number: '+91 91XX XXXX55', clinic: 'Manipal Hospital', specialization: 'Neurology', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'ನಮಸ್ಕಾರ! Manipal Hospital ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?', time: '0:00' },
      { role: 'patient', text: 'ನನಗೆ ನರ ವೈದ್ಯರನ್ನು ನೋಡಬೇಕು', time: '0:05' },
      { role: 'ai', text: 'Dr. Rajan Shetty ಇಂದು ಲಭ್ಯರಿದ್ದಾರೆ. ಮಧ್ಯಾಹ್ನ 3:00 ಗಂಟೆಗೆ slot ಇದೆ. Book ಮಾಡಲಾ?', time: '0:08' },
      { role: 'patient', text: 'ಹೌದು, ಮಾಡಿ', time: '0:13' },
      { role: 'ai', text: 'Appointment confirm ಆಗಿದೆ! ID: APT-2852. ಧನ್ಯವಾದಗಳು!', time: '0:15' },
    ],
  },
  {
    id: 7, language: 'Telugu', flag: '🇮🇳',
    patient_number: '+91 82XX XXXX11', clinic: 'KIMS Hospital', specialization: 'Cardiology', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'నమస్కారం! KIMS Hospital కి స్వాగతం. నేను మీకు ఎలా సహాయం చేయగలను?', time: '0:00' },
      { role: 'patient', text: 'నాకు గుండె వైద్యుడు కావాలి', time: '0:04' },
      { role: 'ai', text: 'Dr. Venkat Rao ఈరోజు available గా ఉన్నారు. ఉదయం 11:30 కి slot ఉంది. Book చేయమా?', time: '0:07' },
      { role: 'patient', text: 'అవును, చేయండి', time: '0:12' },
      { role: 'ai', text: 'Appointment confirm అయింది! ID: APT-2853. ధన్యవాదాలు!', time: '0:14' },
    ],
  },
  {
    id: 8, language: 'Bengali', flag: '🇮🇳',
    patient_number: '+91 93XX XXXX22', clinic: 'AMRI Hospital', specialization: 'Paediatrics', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'নমস্কার! AMRI Hospital-এ আপনাকে স্বাগতম। আমি কীভাবে সাহায্য করতে পারি?', time: '0:00' },
      { role: 'patient', text: 'আমার বাচ্চার জন্য শিশু ডাক্তার দরকার', time: '0:05' },
      { role: 'ai', text: 'Dr. Sanjay Gupta আজ পাওয়া যাচ্ছেন। বিকেল ৪টায় স্লট আছে। বুক করব?', time: '0:08' },
      { role: 'patient', text: 'হ্যাঁ, করুন', time: '0:13' },
      { role: 'ai', text: 'Appointment নিশ্চিত হয়েছে! ID: APT-2854. ধন্যবাদ!', time: '0:15' },
    ],
  },
  {
    id: 9, language: 'Marathi', flag: '🇮🇳',
    patient_number: '+91 96XX XXXX33', clinic: 'Ruby Hall Clinic', specialization: 'Orthopaedic', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'नमस्कार! Ruby Hall Clinic मध्ये आपले स्वागत आहे. मी आपली कशी मदद करू?', time: '0:00' },
      { role: 'patient', text: 'मला हाडांच्या डॉक्टरांकडे जायचे आहे', time: '0:05' },
      { role: 'ai', text: 'Dr. Amol Patil आज उपलब्ध आहेत. दुपारी 2:30 वाजता slot आहे. Book करू का?', time: '0:08' },
      { role: 'patient', text: 'हो, करा', time: '0:13' },
      { role: 'ai', text: 'Appointment confirm झाली! ID: APT-2855. धन्यवाद!', time: '0:15' },
    ],
  },
  {
    id: 10, language: 'Punjabi', flag: '🇮🇳',
    patient_number: '+91 98XX XXXX77', clinic: 'Fortis Mohali', specialization: 'General', outcome: 'BOOKED',
    messages: [
      { role: 'ai', text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! Fortis Hospital ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?', time: '0:00' },
      { role: 'patient', text: 'ਮੈਨੂੰ ਡਾਕਟਰ ਨੂੰ ਮਿਲਣਾ ਹੈ', time: '0:04' },
      { role: 'ai', text: 'Dr. Harpreet Singh ਅੱਜ ਉਪਲਬਧ ਹਨ। ਸਵੇਰੇ 10 ਵਜੇ ਸਲਾਟ ਹੈ। Book ਕਰਾਂ?', time: '0:07' },
      { role: 'patient', text: 'ਹਾਂ, ਕਰੋ', time: '0:12' },
      { role: 'ai', text: 'Appointment confirm ਹੋ ਗਈ! ID: APT-2856. ਧੰਨਵਾਦ!', time: '0:14' },
    ],
  },
];

// ─── Message reveal timings (ms) ─────────────────────────────────────────────
const MSG_DELAYS = [0, 1500, 3000, 4500, 6000];
const TOTAL_DURATION = 8000; // before auto-advance

// ─── Arabic detector (RTL) ───────────────────────────────────────────────────
const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);

// ─── Individual message bubble ───────────────────────────────────────────────
function MessageBubble({ msg, visible }: { msg: Message; visible: boolean }) {
  const isAI = msg.role === 'ai';
  const rtl = isRTL(msg.text);

  return (
    <div
      className={visible ? 'msg-appear' : ''}
      style={{
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        maxWidth: '82%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        direction: rtl ? 'rtl' : 'ltr',
      }}
    >
      <div style={{
        fontSize: '10px',
        color: isAI ? T.accent : T.textMuted,
        marginBottom: '4px',
        fontWeight: 500,
        textAlign: isAI ? 'left' : 'right',
        letterSpacing: '0.01em',
      }}>
        {isAI ? `Lifodial AI · ${msg.time}` : `Patient · ${msg.time}`}
      </div>
      <div style={{
        backgroundColor: isAI ? '#1A1A1A' : 'rgba(62,207,142,0.08)',
        border: `1px solid ${isAI ? '#2E2E2E' : 'rgba(62,207,142,0.20)'}`,
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding: '12px 16px',
        fontSize: '14px',
        color: isAI ? '#E5E5E5' : '#FFFFFF',
        lineHeight: 1.55,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {msg.text}
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ height: '2px', backgroundColor: '#1E1E1E', position: 'relative' }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        backgroundColor: T.accent,
        transition: 'width 0.1s linear',
        boxShadow: `0 0 8px rgba(62,207,142,0.4)`,
      }} />
    </div>
  );
}

// ─── Main DemoCarousel ────────────────────────────────────────────────────────
export function DemoCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [showBooked, setShowBooked] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [fading, setFading]       = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const startConversation = (idx: number) => {
    clearAll();
    setActiveIdx(idx);
    setVisibleMsgs(0);
    setShowBooked(false);
    setProgress(0);
    setFading(false);

    const conv = DEMO_CONVERSATIONS[idx];

    // Reveal messages one by one
    MSG_DELAYS.forEach((delay, i) => {
      if (i < conv.messages.length) {
        const t = setTimeout(() => setVisibleMsgs(i + 1), delay);
        timersRef.current.push(t);
      }
    });

    // Show booked badge
    const bookedT = setTimeout(() => setShowBooked(true), 6200);
    timersRef.current.push(bookedT);

    // Progress bar
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100 && progressRef.current) clearInterval(progressRef.current);
    }, 50);

    // Auto-advance
    const advanceT = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        startConversation((idx + 1) % DEMO_CONVERSATIONS.length);
      }, 400);
    }, TOTAL_DURATION);
    timersRef.current.push(advanceT);
  };

  useEffect(() => {
    startConversation(0);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTab = (idx: number) => {
    clearAll();
    startConversation(idx);
  };

  const conv = DEMO_CONVERSATIONS[activeIdx];
  const tabLangs = DEMO_CONVERSATIONS.slice(0, 6);

  return (
    <section id="demo" style={{ padding: '100px 24px', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            See Lifodial speak <span style={{ color: T.accent }}>every language</span>
          </h2>
          <p style={{ fontSize: '16px', color: T.textMuted, margin: 0 }}>
            10 languages. One AI. Zero missed appointments.
          </p>
        </div>

        {/* Language tabs */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center', marginBottom: '24px',
        }}>
          {tabLangs.map((c, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={c.id}
                onClick={() => handleTab(i)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${active ? T.accent : '#2E2E2E'}`,
                  backgroundColor: active ? T.accent : 'transparent',
                  color: active ? '#000' : '#666',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {c.flag} {c.language}
              </button>
            );
          })}
          {/* +4 more pill */}
          <button
            onClick={() => handleTab(6)}
            style={{
              padding: '6px 14px', borderRadius: '999px',
              border: '1px solid #2E2E2E', backgroundColor: activeIdx >= 6 ? T.accent : 'transparent',
              color: activeIdx >= 6 ? '#000' : '#666',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            +{DEMO_CONVERSATIONS.length - 6} more
          </button>
        </div>

        {/* Demo card */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '20px',
          border: `1px solid ${T.borderMid}`,
          overflow: 'hidden',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          boxShadow: '0 0 60px rgba(62,207,142,0.06), 0 24px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Card header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${T.borderMid}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="dot-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: T.accent }} />
              <span style={{ fontSize: '12px', color: T.textMuted, fontWeight: 500 }}>Recording · 0:47</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: T.textMuted }}>{conv.flag} {conv.language}</span>
              <span style={{
                fontSize: '11px', fontWeight: 500, padding: '2px 10px',
                borderRadius: '999px', backgroundColor: T.accentDim,
                color: T.accent, border: `1px solid ${T.accentBorder}`,
              }}>
                {conv.specialization}
              </span>
              <span style={{ fontSize: '11px', color: '#555', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.clinic}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '360px',
          }}>
            {conv.messages.map((msg, i) => (
              <MessageBubble key={`${activeIdx}-${i}`} msg={msg} visible={i < visibleMsgs} />
            ))}

            {/* Booked badge */}
            {showBooked && (
              <div className="booked-appear" style={{
                alignSelf: 'center',
                marginTop: '8px',
                backgroundColor: 'rgba(62,207,142,0.1)',
                border: '1px solid rgba(62,207,142,0.3)',
                color: T.accent,
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 20px',
                borderRadius: '999px',
              }}>
                ✅ Appointment Booked Successfully
              </div>
            )}

            {/* Typing indicator */}
            {visibleMsgs > 0 && visibleMsgs < conv.messages.length && !showBooked && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '8px 0' }}>
                {[0, 200, 400].map((d) => (
                  <div key={d} className="dot-pulse" style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    backgroundColor: T.textMuted, animationDelay: `${d}ms`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar progress={progress} />

          {/* Footer */}
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#0B0B0B',
            borderTop: `1px solid #1A1A1A`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', color: T.accent }}>
              ⚡ Total: 0:47 · Avg response: 823ms
            </span>
            <span style={{ fontSize: '11px', color: T.textMuted }}>
              {conv.patient_number}
            </span>
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {DEMO_CONVERSATIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleTab(i)}
              style={{
                width: i === activeIdx ? '20px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: i === activeIdx ? T.accent : '#333',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
