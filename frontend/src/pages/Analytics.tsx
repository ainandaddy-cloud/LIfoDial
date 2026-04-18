import { BarChart2, CalendarCheck, PhoneIncoming, TrendingUp } from 'lucide-react';
import React from 'react';
import { FIXTURE_APPOINTMENTS, FIXTURE_CALL_LOGS } from '../fixtures/data';

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color?: string;
}) {
  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div className="flex items-start justify-between mb-3">
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </p>
        <Icon size={16} style={{ color: color ?? 'var(--text-muted)' }} />
      </div>
      <p style={{ fontSize: '32px', fontWeight: 600, color: color ?? 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

// Simple bar chart using divs
function BarGroup({ day, value, max }: { day: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
      <div
        style={{
          width: '100%', maxWidth: '40px', height: '80px',
          position: 'relative', borderRadius: '4px',
          backgroundColor: 'var(--bg-surface-2)',
        }}
      >
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${pct}%`, borderRadius: '4px',
            backgroundColor: 'var(--accent)', minHeight: value > 0 ? '4px' : 0,
            transition: 'height 0.6s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{day}</span>
    </div>
  );
}

export default function Analytics() {
  // Derive stats from fixture data
  const totalCalls    = FIXTURE_CALL_LOGS.length;
  const booked        = FIXTURE_APPOINTMENTS.filter(a => a.status === 'CONFIRMED').length;
  const resolved      = FIXTURE_CALL_LOGS.filter(l => l.status === 'Booked' || l.status === 'Resolved').length;
  const resolutionPct = `${Math.round((resolved / totalCalls) * 100)}%`;
  const avgDuration   = '2:18';

  // Intent breakdown
  const intentCounts = FIXTURE_CALL_LOGS.reduce((acc, l) => {
    acc[l.intent] = (acc[l.intent] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Language breakdown
  const langCounts = FIXTURE_CALL_LOGS.reduce((acc, l) => {
    acc[l.language] = (acc[l.language] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mock 7-day call volume
  const days = [
    { day: 'Mon', value: 2 },
    { day: 'Tue', value: 4 },
    { day: 'Wed', value: 3 },
    { day: 'Thu', value: 6 },
    { day: 'Fri', value: 5 },
    { day: 'Sat', value: totalCalls },
    { day: 'Sun', value: 0 },
  ];
  const maxDay = Math.max(...days.map(d => d.value));

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: '12px',
  };

  return (
    <div data-testid="analytics-page" className="h-full flex flex-col">
      {/* Top bar */}
      <div
        className="px-8 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
          Analytics
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Call performance and outcome trends for Apollo Demo Clinic
        </p>
      </div>

      <div className="flex-1 p-8 space-y-5 overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Calls"       value={totalCalls}    icon={PhoneIncoming} />
          <StatCard label="Apts Booked"        value={booked}        icon={CalendarCheck} color="var(--accent)" />
          <StatCard label="Resolution Rate"   value={resolutionPct} icon={TrendingUp} />
          <StatCard label="Avg Handle Time"   value={avgDuration}   icon={BarChart2} />
        </div>

        {/* Bottom: 2-column grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Call volume chart */}
          <div style={cardStyle}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Call Volume — Last 7 Days
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-end gap-2" style={{ height: '120px', alignItems: 'flex-end' }}>
                {days.map(d => <BarGroup key={d.day} {...d} max={maxDay} />)}
              </div>
            </div>
          </div>

          {/* Intent breakdown */}
          <div style={cardStyle}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Intent Breakdown
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {Object.entries(intentCounts).map(([intent, count]) => {
                const pct = Math.round((count / totalCalls) * 100);
                const colors: Record<string, string> = {
                  Appointment:   'var(--accent)',
                  Emergency:     'var(--destructive)',
                  'General Query': 'var(--purple)',
                  Cancellation:  'var(--warning)',
                };
                const clr = colors[intent] ?? 'var(--text-muted)';
                return (
                  <div key={intent}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{intent}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', backgroundColor: clr, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language distribution */}
          <div style={cardStyle}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Language Distribution
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {Object.entries(langCounts).map(([lang, count]) => {
                const pct = Math.round((count / totalCalls) * 100);
                const flags: Record<string, string> = { Hindi: '🇮🇳', English: '🇬🇧', Tamil: '🇮🇳' };
                return (
                  <div key={lang}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {flags[lang] ?? ''} {lang}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI summary card */}
          <div style={{ ...cardStyle, backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--accent-border)' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>
                Receptionist Impact
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Calls fully resolved by AI',    value: `${resolutionPct}` },
                { label: 'Languages handled',              value: `${Object.keys(langCounts).length}` },
                { label: 'Appointments booked (no staff)', value: `${booked}` },
                { label: 'Avg response time',              value: '< 3 sec' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span style={{ fontSize: '13px', color: 'var(--accent)', opacity: 0.8 }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
