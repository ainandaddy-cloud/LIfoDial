import { ChevronDown, ChevronUp, Download, PhoneMissed } from 'lucide-react';
import React, { useState } from 'react';
import { FIXTURE_CALL_LOGS, type CallLog } from '../fixtures/data';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { color: string; bg: string; border?: string }> = {
  Booked:      { color: 'var(--accent)',      bg: 'var(--accent-dim)',      border: 'var(--accent-border)' },
  Transferred: { color: 'var(--purple)',      bg: 'var(--purple-dim)' },
  Resolved:    { color: 'var(--text-muted)',  bg: 'var(--bg-surface-2)' },
  Failed:      { color: 'var(--destructive)', bg: 'var(--destructive-dim)' },
  Pending:     { color: 'var(--warning)',     bg: 'var(--warning-dim)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { color: 'var(--text-muted)', bg: 'var(--bg-surface-2)' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '9999px',
      fontSize: '11px', fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
      border: s.border ? `1px solid ${s.border}` : undefined,
    }}>
      {status}
    </span>
  );
}

// ── Intent badge ──────────────────────────────────────────────────────────────
const INTENT_STYLES: Record<string, { color: string; bg: string }> = {
  Appointment:    { color: 'var(--accent)',   bg: 'var(--accent-dim)' },
  Emergency:      { color: 'var(--destructive)', bg: 'var(--destructive-dim)' },
  'General Query':{ color: 'var(--purple)',   bg: 'var(--purple-dim)' },
  Cancellation:   { color: 'var(--warning)',  bg: 'var(--warning-dim)' },
};

function IntentBadge({ intent }: { intent: CallLog['intent'] }) {
  const s = INTENT_STYLES[intent] ?? { color: 'var(--text-muted)', bg: 'var(--bg-surface-2)' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '9999px',
      fontSize: '11px', fontWeight: 600, color: s.color, backgroundColor: s.bg,
    }}>
      {intent}
    </span>
  );
}

// ── Transcript drawer ─────────────────────────────────────────────────────────
function TranscriptDrawer({ transcript }: { transcript: CallLog['transcript'] }) {
  return (
    <tr>
      <td colSpan={8} style={{ padding: 0 }}>
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-surface-2)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <p style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px',
          }}>
            Call Transcript
          </p>
          <div className="space-y-2" style={{ maxWidth: '640px' }}>
            {transcript.map((msg, i) => (
              <div
                key={i}
                className="flex"
                style={{ justifyContent: msg.role === 'ai' ? 'flex-end' : 'flex-start' }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: msg.role === 'ai'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                  backgroundColor: msg.role === 'ai'
                    ? 'var(--accent-dim)'
                    : 'var(--bg-surface)',
                  border: msg.role === 'ai'
                    ? '1px solid var(--accent-border)'
                    : '1px solid var(--border)',
                }}>
                  <p style={{
                    fontSize: '13px', margin: 0,
                    color: msg.role === 'ai' ? 'var(--accent)' : 'var(--text-primary)',
                  }}>
                    {msg.text}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.role === 'ai' ? 'right' : 'left' }}>
                    {msg.role === 'ai' ? 'Agent' : 'Patient'} · {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── CallLogs page ─────────────────────────────────────────────────────────────
export default function CallLogs() {
  const [logs] = useState<CallLog[]>(FIXTURE_CALL_LOGS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterIntent, setFilterIntent] = useState('ALL');

  const filtered = logs.filter(l =>
    (filterStatus === 'ALL' || l.status === filterStatus) &&
    (filterIntent === 'ALL' || l.intent === filterIntent)
  );

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  // CSV export (client-side)
  const handleExport = () => {
    const headers = ['ID', 'Phone', 'Date', 'Duration', 'Intent', 'Language', 'Status'];
    const rows = logs.map(l =>
      [l.id, l.phone, l.date, l.duration, l.intent, l.language, l.status].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'call_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const selectStyle: React.CSSProperties = {
    padding: '7px 11px', borderRadius: '8px', fontSize: '13px',
    backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer',
  };

  return (
    <div data-testid="call-logs-page" className="h-full flex flex-col">
      {/* Top bar */}
      <div
        className="px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
            Call Logs
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Every call handled by the receptionist
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2"
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
            color: 'var(--text-secondary)', backgroundColor: 'transparent',
            border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div
        className="px-8 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="ALL">All Statuses</option>
          {['Booked', 'Resolved', 'Transferred', 'Failed', 'Pending'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>

        <select value={filterIntent} onChange={e => setFilterIntent(e.target.value)} style={selectStyle}>
          <option value="ALL">All Intents</option>
          {['Appointment', 'Emergency', 'General Query', 'Cancellation'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>

        {(filterStatus !== 'ALL' || filterIntent !== 'ALL') && (
          <button
            onClick={() => { setFilterStatus('ALL'); setFilterIntent('ALL'); }}
            style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          {filtered.length} call{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 py-4" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                <PhoneMissed size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>No calls match filters</p>
            </div>
          ) : (
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                  {['Caller', 'Date & Time', 'Duration', 'Intent', 'Language', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{
                      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontWeight: 500,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((call, i) => {
                  const isOpen = expandedId === call.id;
                  return (
                    <React.Fragment key={call.id}>
                      <tr
                        data-testid={`call-row-${call.id}`}
                        style={{
                          borderBottom: (!isOpen && i < filtered.length - 1) ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer',
                          backgroundColor: isOpen ? 'var(--bg-surface-2)' : 'transparent',
                        }}
                        onClick={() => toggle(call.id)}
                        onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-2)'; }}
                        onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      >
                        {/* Caller */}
                        <td className="px-5 py-3.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {call.phone}
                        </td>
                        {/* Date */}
                        <td className="px-5 py-3.5" style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {call.date}
                        </td>
                        {/* Duration */}
                        <td className="px-5 py-3.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {call.duration}
                        </td>
                        {/* Intent */}
                        <td className="px-5 py-3.5">
                          <IntentBadge intent={call.intent} />
                        </td>
                        {/* Language */}
                        <td className="px-5 py-3.5">
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {call.flag} {call.language}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={call.status} />
                        </td>
                        {/* Expand */}
                        <td className="px-5 py-3.5">
                          <button
                            style={{
                              padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                              backgroundColor: isOpen ? 'var(--accent-dim)' : 'transparent',
                              border: isOpen ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                              color: isOpen ? 'var(--accent)' : 'var(--text-muted)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                            onClick={e => { e.stopPropagation(); toggle(call.id); }}
                          >
                            {isOpen ? <><ChevronUp size={12} />Hide</> : <><ChevronDown size={12} />Transcript</>}
                          </button>
                        </td>
                      </tr>
                      {isOpen && <TranscriptDrawer transcript={call.transcript} />}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
