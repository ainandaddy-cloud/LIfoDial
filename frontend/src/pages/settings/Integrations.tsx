import React, { useState } from 'react';
import { Database, MessageSquare, Briefcase, Webhook, Calendar, Send, Settings, CheckCircle2, Zap } from 'lucide-react';

export default function Integrations() {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle'|'syncing'|'done'>('idle');

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('done');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  };

  const integrations = [
    { id: 'google_sheets', name: 'Google Sheets', icon: Database, connected: true, desc: 'Auto-export appointments to Google Sheet' },
    { id: 'telegram', name: 'Telegram', icon: Send, connected: true, desc: 'Instant booking notifications' },
    { id: 'oxzygen', name: 'Oxzygen HIS', icon: Briefcase, connected: true, desc: 'Sync appointments with HIS' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, connected: false, desc: 'Send events to any endpoint' },
    { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, connected: false, desc: 'Add bookings to clinic Calendar' },
    { id: 'slack', name: 'Slack', icon: MessageSquare, connected: false, desc: 'Team notifications' },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageSquare, connected: false, desc: 'Send confirmations to patients', comingSoon: true },
    { id: 'zapier', name: 'Zapier', icon: Zap, connected: false, desc: 'Connect to 5000+ apps', comingSoon: true },
    { id: 'smtp', name: 'Email SMTP', icon: Send, connected: false, desc: 'Send booking confirmation emails' }
  ];

  return (
    <div className="space-y-6" style={{ paddingBottom: '40px' }}>
      <div className="mb-6">
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Active Integrations</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Connect Lifodial to your favorite tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(int => (
          <div 
            key={int.id}
            className="p-5 rounded-xl flex flex-col justify-between"
            style={{ 
              backgroundColor: 'var(--bg-surface-2)', 
              border: int.connected ? '1px solid var(--accent)' : '1px solid var(--border)',
              position: 'relative'
            }}
          >
            {int.comingSoon && (
              <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                Coming Soon
              </span>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: int.connected ? 'var(--accent-dim)' : 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <int.icon size={20} color={int.connected ? 'var(--accent)' : 'var(--text-muted)'} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{int.name}</h3>
                {int.connected && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}><CheckCircle2 size={12} /> Connected</span>}
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>{int.desc}</p>
            
            <div className="flex gap-2">
              {int.connected ? (
                <>
                  <button 
                    onClick={() => int.id === 'google_sheets' ? setShowGoogleModal(true) : null}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-surface-3)', border: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Settings size={14} /> Configure
                  </button>
                  <button style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--destructive)', color: 'var(--destructive)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    Disconnect
                  </button>
                </>
              ) : (
                <button 
                  disabled={int.comingSoon}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: int.comingSoon ? 'var(--bg-surface-3)' : 'var(--accent)', border: 'none', color: int.comingSoon ? 'var(--text-muted)' : '#000', fontSize: '13px', fontWeight: 600, cursor: int.comingSoon ? 'not-allowed' : 'pointer', opacity: int.comingSoon ? 0.5 : 1 }}
                >
                  {int.comingSoon ? 'Unavailable' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Google Sheets Modal */}
      {showGoogleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Configure Google Sheets</h3>
            
            <div className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>STEP 1: SHEET URL</label>
                <input type="text" defaultValue="https://docs.google.com/spreadsheets/d/1BxiMvs..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>STEP 2: ACCOUNT LINK</label>
                <button style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--accent-border)', backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> Connected as clinic@example.com
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>PATIENT NAME COLUMN</label>
                  <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }}>
                    <option>Column A</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>SLOT TIME COLUMN</label>
                  <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }}>
                    <option>Column D</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>SYNC FREQUENCY</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }}>
                  <option>Real-time (Immediate)</option>
                  <option>Hourly</option>
                  <option>Manual Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button onClick={() => setShowGoogleModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSync} style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: syncStatus === 'done' ? 'var(--accent-dim)' : 'var(--accent)', color: syncStatus === 'done' ? 'var(--accent)' : '#000', border: syncStatus === 'done' ? '1px solid var(--accent)' : 'none', fontWeight: 600, cursor: 'pointer', minWidth: '120px' }}>
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'done' ? 'Sync Complete!' : 'Save & Sync'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
