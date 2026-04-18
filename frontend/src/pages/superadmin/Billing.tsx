import React, { useState } from 'react';
import { useSAStore, BillingPlan, PlanTier } from '../../store/saStore';
import { PlanBadge, StatusBadge, StatCard } from '../../components/superadmin/SAShared';
import { IndianRupee, TrendingUp, Receipt, ToggleLeft, ToggleRight, Edit2, Check } from 'lucide-react';

function PlanCard({ plan }: { plan: BillingPlan }) {
  const { updatePlanPrice, togglePlanAvailability, addToast } = useSAStore();
  const [editing, setEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(plan.price.toString());

  const tierColors: Record<PlanTier, string> = {
    Free: '#888', Pro: '#60a5fa', Enterprise: '#3ECF8E',
  };
  const color = tierColors[plan.tier];

  const savePrice = () => {
    const n = parseInt(draftPrice, 10);
    if (isNaN(n) || n < 0) { addToast('Invalid price value', 'error'); return; }
    updatePlanPrice(plan.id, n);
    setEditing(false);
  };

  return (
    <div style={{
      backgroundColor: '#1A1A1A', border: `1px solid ${color}30`,
      borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px',
      opacity: plan.available ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <PlanBadge plan={plan.tier} />
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color, fontSize: '22px', fontWeight: 800 }}>₹</span>
                <input
                  type="number" value={draftPrice} onChange={e => setDraftPrice(e.target.value)}
                  style={{ backgroundColor: '#0F0F0F', border: '1px solid #3ECF8E', borderRadius: '6px', padding: '4px 8px', color: '#fff', fontSize: '24px', fontWeight: 800, width: '120px', outline: 'none' }}
                  autoFocus
                />
                <button onClick={savePrice} style={{ backgroundColor: '#3ECF8E', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#000' }}>
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <>
                <span style={{ color, fontSize: '32px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹{plan.price.toLocaleString('en-IN')}
                </span>
                <span style={{ color: '#888', fontSize: '13px' }}>/mo</span>
                <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', marginLeft: '4px' }}>
                  <Edit2 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => togglePlanAvailability(plan.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: plan.available ? '#3ECF8E' : '#555', fontSize: '12px', fontWeight: 600 }}
        >
          {plan.available ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          {plan.available ? 'Available' : 'Disabled'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {[
          { label: 'Call Minutes', value: plan.call_minutes.toLocaleString() },
          { label: 'Max Concurrent', value: `${plan.max_concurrent} sessions` },
          { label: 'Model Tier', value: plan.model_tier.charAt(0).toUpperCase() + plan.model_tier.slice(1) },
          { label: 'Overage Rate', value: `₹${plan.overage_rate}/min` },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2E2E2E' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>{row.label}</span>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MRR_HISTORY = [
  { month: 'Nov', Free: 0, Pro: 15000, Enterprise: 40000 },
  { month: 'Dec', Free: 0, Pro: 20000, Enterprise: 60000 },
  { month: 'Jan', Free: 0, Pro: 30000, Enterprise: 80000 },
  { month: 'Feb', Free: 0, Pro: 35000, Enterprise: 100000 },
  { month: 'Mar', Free: 0, Pro: 40000, Enterprise: 119000 },
  { month: 'Apr', Free: 0, Pro: 45000, Enterprise: 140000 },
];

export default function Billing() {
  const { billingPlans, invoices, clinics, getMRR, getActiveCount } = useSAStore();

  const mrr = getMRR();
  const paidSum = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const overdueSum = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const maxBar = Math.max(...MRR_HISTORY.map(d => d.Pro + d.Enterprise));

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Billing</h1>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Manage plans, pricing, and revenue</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="MRR" value={`₹${(mrr / 1000).toFixed(0)}k`} icon={IndianRupee} />
        <StatCard label="Total Collected" value={`₹${(paidSum / 1000).toFixed(0)}k`} icon={TrendingUp} />
        <StatCard label="Overdue" value={`₹${(overdueSum / 1000).toFixed(0)}k`} icon={Receipt} />
        <StatCard label="Active Clinics" value={getActiveCount()} icon={IndianRupee} />
      </div>

      {/* Plan Cards */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Plan Configuration
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {billingPlans.map(p => <PlanCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '20px' }}>
          Revenue by Plan (6 Months)
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '120px' }}>
          {MRR_HISTORY.map(d => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', height: `${(d.Enterprise / maxBar) * 100}%`, backgroundColor: '#3ECF8E', borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                <div style={{ width: '100%', height: `${(d.Pro / maxBar) * 100}%`, backgroundColor: '#60a5fa', borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
              </div>
              <span style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{d.month}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3ECF8E' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>Enterprise</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#60a5fa' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>Pro</span>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E2E2E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Invoice History</h2>
        </div>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#0F0F0F' }}>
            <tr>
              {['Invoice', 'Clinic', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const clinic = clinics.find(c => c.id === inv.clinic_id);
              return (
                <tr key={inv.id} style={{ borderTop: '1px solid #2E2E2E' }}>
                  <td style={{ padding: '14px 24px', color: '#888', fontFamily: 'monospace', fontSize: '12px' }}>{inv.id}</td>
                  <td style={{ padding: '14px 24px', color: '#fff', fontWeight: 600 }}>{clinic?.name ?? 'Unknown'}</td>
                  <td style={{ padding: '14px 24px', color: '#888' }}>{inv.date}</td>
                  <td style={{ padding: '14px 24px', color: '#fff', fontFamily: 'monospace' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 24px' }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding: '14px 24px' }}>
                    <button
                      onClick={() => useSAStore.getState().addToast(`Invoice ${inv.id} download started`, 'info')}
                      style={{ fontSize: '12px', backgroundColor: '#2E2E2E', color: '#888', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      ↓ PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
