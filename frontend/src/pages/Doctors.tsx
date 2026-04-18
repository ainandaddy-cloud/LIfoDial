import { Edit2, Plus, Trash2, UserCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { FIXTURE_DOCTORS, SPECIALIZATIONS, type Doctor } from '../fixtures/data';

// ── Initials helper ───────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  doctor?: Doctor | null;
  onSave: (d: Omit<Doctor, 'id'>) => void;
  onClose: () => void;
}

function DoctorModal({ doctor, onSave, onClose }: ModalProps) {
  const [name, setName]           = useState(doctor?.name ?? '');
  const [spec, setSpec]           = useState(doctor?.specialization ?? 'General Physician');
  const [hisId, setHisId]         = useState(doctor?.his_doctor_id ?? '');
  const [available, setAvailable] = useState(doctor?.available ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), specialization: spec, his_doctor_id: hisId.trim(), available });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-xl p-6 relative"
        style={{
          maxWidth: '460px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          margin: '0 16px',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {doctor ? 'Edit Doctor' : 'Add Doctor'}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Doctor Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Suresh Menon"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Specialization */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Specialization *
            </label>
            <select
              value={spec}
              onChange={e => setSpec(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {SPECIALIZATIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* HIS Doctor ID */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              HIS Doctor ID <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={hisId}
              onChange={e => setHisId(e.target.value)}
              placeholder="e.g. HIS-D007"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Available by default</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>This doctor will be offered to callers</p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(v => !v)}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: available ? 'var(--accent)' : 'var(--bg-surface-3)',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: available ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: 'var(--accent)',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent)'; }}
            >
              {doctor ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Doctor Card ───────────────────────────────────────────────────────────────
interface DoctorCardProps {
  doctor: Doctor;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function DoctorCard({ doctor, onEdit, onDelete, onToggle }: DoctorCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{
              backgroundColor: 'var(--accent-dim)',
              color: 'var(--accent)',
              fontSize: '15px',
              border: '1px solid var(--accent-border)',
            }}
          >
            {initials(doctor.name)}
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {doctor.name}
            </p>
            {doctor.his_doctor_id && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
                {doctor.his_doctor_id}
              </p>
            )}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            title="Edit"
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--destructive-dim)'; (e.currentTarget as HTMLElement).style.color = 'var(--destructive)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Specialization badge */}
      <div>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--accent)',
            backgroundColor: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
          }}
        >
          {doctor.specialization}
        </span>
      </div>

      {/* Availability toggle */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: doctor.available ? 'var(--accent)' : 'var(--text-muted)' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: doctor.available ? 'var(--accent)' : 'var(--text-muted)' }}>
            {doctor.available ? 'Online' : 'Offline'}
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            position: 'relative',
            width: '40px',
            height: '22px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: doctor.available ? 'var(--accent)' : 'var(--bg-surface-3)',
            transition: 'background-color 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: doctor.available ? '20px' : '2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>
    </div>
  );
}

// ── Doctors Page ──────────────────────────────────────────────────────────────
export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(FIXTURE_DOCTORS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Doctor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = (data: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = { ...data, id: `d-${Date.now()}` };
    setDoctors(prev => [...prev, newDoc]);
    setModalOpen(false);
  };

  const handleEdit = (data: Omit<Doctor, 'id'>) => {
    setDoctors(prev => prev.map(d => d.id === editTarget?.id ? { ...data, id: d.id } : d));
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggle = (id: string) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, available: !d.available } : d));
  };

  const onlineCount = doctors.filter(d => d.available).length;

  return (
    <div data-testid="doctors-page" className="h-full flex flex-col">
      {/* Top bar */}
      <div
        className="px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
            Doctors
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {doctors.length} registered · {onlineCount} online
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#000',
            backgroundColor: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent)'; }}
        >
          <Plus size={16} />
          Add Doctor
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-surface-2)' }}
            >
              <UserCheck size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>No doctors yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Add doctors so the system knows who to book appointments with.
              </p>
            </div>
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000',
                backgroundColor: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add First Doctor
            </button>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {doctors.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onEdit={() => { setEditTarget(doc); setModalOpen(true); }}
                onDelete={() => setDeleteConfirm(doc.id)}
                onToggle={() => handleToggle(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {(modalOpen || editTarget) && (
        <DoctorModal
          doctor={editTarget}
          onSave={editTarget ? handleEdit : handleAdd}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              width: '360px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              margin: '0 16px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Remove doctor?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {doctors.find(d => d.id === deleteConfirm)?.name} will be removed from the AI's knowledge.
              Existing appointments are not affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, backgroundColor: 'var(--destructive-dim)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--destructive)', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
