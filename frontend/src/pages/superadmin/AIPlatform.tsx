/**
 * AIPlatform.tsx — Phase 4
 * Super-admin AI Platform configuration hub.
 * Configure LLM, STT, TTS, Telephony, HIS providers and their API keys.
 * If a team member selects a model with no configured key → "Add API Key" warning.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain, Mic, Volume2, Phone, Database, Key, CheckCircle,
  AlertCircle, Eye, EyeOff, Trash2, ExternalLink, Star, RefreshCw,
  ChevronRight, Settings, Zap, Download, CloudDownload,
} from 'lucide-react';

import { API_URL } from '../../api/client';

const API = API_URL;

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'llm',       label: 'Language Models',  icon: Brain,    color: '#a78bfa', desc: 'AI reasoning and conversation — powers the agent brain' },
  { id: 'stt',       label: 'Speech-to-Text',   icon: Mic,      color: '#60a5fa', desc: 'Converts patient voice to text for the agent to understand' },
  { id: 'tts',       label: 'Text-to-Speech',   icon: Volume2,  color: '#f59e0b', desc: 'Converts agent responses to natural voice audio' },
  { id: 'telephony', label: 'Telephony',         icon: Phone,    color: '#3ECF8E', desc: 'Phone number routing, SIP trunking, call handling' },
  { id: 'his',       label: 'HIS Integration',  icon: Database, color: '#f87171', desc: 'Hospital Information System — bookings, EMR, patient data' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Provider {
  id: string; name: string; models: string[];
  key_label: string; key_url: string; icon: string;
}
interface SavedKey {
  id: string; provider: string; category: string;
  display_name: string; key_masked: string; has_key: boolean;
  is_active: boolean; extra_config?: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '16px' }: { w?: string; h?: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: '6px', background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider, catId, saved, catColor,
  onSave, onDelete, onActivate,
}: {
  provider: Provider; catId: string; saved?: SavedKey; catColor: string;
  onSave: (provider: string, category: string, key: string, extraConfig?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onActivate: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extraModel, setExtraModel] = useState(saved?.extra_config || '');
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);

  const hasKey = saved?.has_key ?? false;
  const isActive = saved?.is_active ?? false;

  // Load cached models from extra_config on mount
  useEffect(() => {
    try {
      const ec = JSON.parse(saved?.extra_config || '{}');
      if (ec.models?.length) setFetchedModels(ec.models);
    } catch {}
  }, [saved?.extra_config]);

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    try {
      await onSave(provider.id, catId, inputKey, extraModel || undefined);
      setInputKey('');
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    try {
      const res = await fetch(`${API}/platform/providers/${provider.id}/fetch-models`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFetchedModels(data.models || []);
      }
    } catch {}
    finally { setFetchingModels(false); }
  };

  return (
    <div style={{
      background: '#131313', border: `1px solid ${isActive ? catColor + '40' : '#2E2E2E'}`,
      borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s',
      boxShadow: isActive ? `0 0 20px ${catColor}15` : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Icon */}
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${catColor}15`, border: `1px solid ${catColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: catColor, flexShrink: 0, fontFamily: 'monospace' }}>
          {provider.icon.length > 2 ? provider.icon[0] : provider.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{provider.name}</span>
            {isActive && (
              <span style={{ background: `${catColor}20`, color: catColor, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.04em' }}>
                ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasKey ? (
              <>
                <span style={{ background: '#3ECF8E15', border: '1px solid #3ECF8E40', color: '#3ECF8E', fontSize: '10px', fontWeight: 700, padding: '1px 8px', borderRadius: '20px', letterSpacing: '0.04em' }}>CONFIGURED</span>
                <span style={{ color: '#555', fontFamily: 'monospace', fontSize: '11px' }}>{saved!.key_masked}</span>
              </>
            ) : (
              <span style={{ background: '#55555515', border: '1px solid #55555540', color: '#777', fontSize: '10px', fontWeight: 700, padding: '1px 8px', borderRadius: '20px', letterSpacing: '0.04em' }}>NOT CONFIGURED</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {hasKey && !isActive && (
            <button
              onClick={() => saved && onActivate(saved.id)}
              style={{ padding: '5px 12px', borderRadius: '7px', border: `1px solid ${catColor}40`, background: `${catColor}10`, color: catColor, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              title="Set as active provider"
            >
              <Star size={11} style={{ display: 'inline', marginRight: '4px' }} />
              Set Active
            </button>
          )}
          {provider.key_url && (
            <a href={provider.key_url} target="_blank" rel="noreferrer" style={{ color: '#555', display: 'flex', alignItems: 'center' }}>
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: '1px solid #2E2E2E', borderRadius: '7px', color: '#888', cursor: 'pointer', padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            <Key size={11} /> {hasKey ? 'Update Key' : 'Add Key'}
          </button>
          {saved && (
            <button onClick={() => onDelete(saved.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '5px', display: 'flex' }} title="Remove key">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Expand: key input */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1A1A1A', padding: '16px 20px', background: '#0D0D0D', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              {provider.key_label}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder={`Enter ${provider.key_label}...`}
                style={{ width: '100%', padding: '10px 40px 10px 12px', background: '#111', border: '1px solid #2E2E2E', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {(provider.models.length > 0 || fetchedModels.length > 0) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Default Model</label>
                {hasKey && (
                  <button
                    onClick={handleFetchModels}
                    disabled={fetchingModels}
                    style={{ fontSize: '11px', color: catColor, background: 'none', border: `1px solid ${catColor}40`, borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, opacity: fetchingModels ? 0.6 : 1 }}
                  >
                    <CloudDownload size={11} />
                    {fetchingModels ? 'Fetching…' : 'Fetch Live Models'}
                  </button>
                )}
              </div>
              <select
                value={extraModel}
                onChange={e => setExtraModel(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: '#111', border: '1px solid #2E2E2E', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
              >
                <option value="">— Select model —</option>
                {(fetchedModels.length > 0 ? fetchedModels : provider.models).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving || !inputKey.trim()}
              style={{ padding: '9px 20px', background: catColor, border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: saving || !inputKey.trim() ? 0.5 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Key'}
            </button>
            <button onClick={() => { setExpanded(false); setInputKey(''); }} style={{ padding: '9px 16px', background: 'none', border: '1px solid #2E2E2E', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPlatform() {
  const [activeCategory, setActiveCategory] = useState('llm');
  const [providers, setProviders] = useState<Record<string, Provider[]>>({});
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [provRes, keyRes] = await Promise.all([
        fetch(`${API}/platform/providers`),
        fetch(`${API}/platform/keys`),
      ]);
      if (provRes.ok) setProviders(await provRes.json());
      if (keyRes.ok) setSavedKeys(await keyRes.json());
    } catch {
      // backend offline — use empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSave = async (provider: string, category: string, key: string, extraConfig?: string) => {
    const res = await fetch(`${API}/platform/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, category, api_key: key, extra_config: extraConfig }),
    });
    if (res.ok) { showToast(`✓ Key saved for ${provider}`); await loadAll(); }
    else showToast('Failed to save key', 'err');
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/platform/keys/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Key removed'); await loadAll(); }
    else showToast('Failed to remove key', 'err');
  };

  const handleActivate = async (id: string) => {
    const res = await fetch(`${API}/platform/keys/${id}/activate`, { method: 'PATCH' });
    if (res.ok) { showToast('✓ Active provider updated'); await loadAll(); }
    else showToast('Failed to set active', 'err');
  };

  const handleSyncEnv = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/platform/sync-from-env`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`✓ Synced ${data.synced} key(s) from .env`);
        await loadAll();
      } else {
        showToast('Sync failed — check backend logs', 'err');
      }
    } catch {
      showToast('Backend not reachable', 'err');
    } finally {
      setSyncing(false);
    }
  };

  const cat = CATEGORIES.find(c => c.id === activeCategory)!;
  const catProviders = (providers[activeCategory] || []) as Provider[];
  const catKeys = savedKeys.filter(k => k.category === activeCategory);
  const activeKey = catKeys.find(k => k.is_active);
  const configuredCount = catKeys.filter(k => k.has_key).length;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0A0A0A' }}>

      {/* ── Left panel: category nav ── */}
      <aside style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #1A1A1A', padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div style={{ padding: '0 10px 16px', borderBottom: '1px solid #1A1A1A', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>AI Platform</h1>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>Provider & API key management</p>
        </div>

        {CATEGORIES.map(c => {
          const Icon = c.icon;
          const keys = savedKeys.filter(k => k.category === c.id);
          const configured = keys.filter(k => k.has_key).length;
          const hasActive = keys.some(k => k.is_active && k.has_key);
          const isActive = activeCategory === c.id;
          return (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: 'none', background: isActive ? `${c.color}12` : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', transition: 'all 0.15s' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: isActive ? `1px solid ${c.color}40` : '1px solid transparent' }}>
                <Icon size={15} color={c.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#fff' : '#A1A1A1', marginBottom: '1px' }}>{c.label}</div>
                <div style={{ fontSize: '11px', color: hasActive ? '#3ECF8E' : configured > 0 ? '#f59e0b' : '#555' }}>
                  {hasActive ? '● Active' : configured > 0 ? `${configured} configured` : 'No keys set'}
                </div>
              </div>
              <ChevronRight size={13} color={isActive ? c.color : '#333'} />
            </button>
          );
        })}

        {/* Model registry summary */}
        <div style={{ marginTop: 'auto', padding: '12px', background: '#111', borderRadius: '10px', border: '1px solid #1A1A1A' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Platform Status
          </div>
          {CATEGORIES.map(c => {
            const keys = savedKeys.filter(k => k.category === c.id);
            const hasActive = keys.some(k => k.is_active && k.has_key);
            const Icon = c.icon;
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <Icon size={11} color={hasActive ? '#3ECF8E' : '#444'} />
                <span style={{ fontSize: '11px', color: hasActive ? '#ccc' : '#444', flex: 1 }}>{c.label}</span>
                {hasActive ? <CheckCircle size={11} color="#3ECF8E" /> : <AlertCircle size={11} color="#444" />}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Right panel: provider cards ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

        {/* Category header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${cat.color}15`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <cat.icon size={22} color={cat.color} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{cat.label}</h2>
              <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>{cat.desc}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeKey && (
              <div style={{ padding: '8px 14px', background: '#3ECF8E15', border: '1px solid #3ECF8E30', borderRadius: '10px', fontSize: '12px', color: '#3ECF8E', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Zap size={12} /> Active: {activeKey.display_name}
              </div>
            )}
            <button
              onClick={handleSyncEnv}
              disabled={syncing}
              style={{ padding: '8px 14px', background: syncing ? '#1A1A1A' : '#3ECF8E15', border: '1px solid #3ECF8E40', borderRadius: '8px', color: '#3ECF8E', cursor: syncing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, opacity: syncing ? 0.6 : 1 }}
              title="Import keys defined in your .env file"
            >
              <Download size={13} />
              {syncing ? 'Syncing…' : 'Sync from .env'}
            </button>
            <button onClick={loadAll} style={{ padding: '8px', background: 'none', border: '1px solid #2E2E2E', borderRadius: '8px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Warning if no key in active category */}
        {!loading && configuredCount === 0 && (
          <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', marginBottom: '4px' }}>No API key configured for {cat.label}</div>
              <div style={{ color: '#888', fontSize: '13px' }}>Any agent using a {cat.label.toLowerCase()} provider will fail without a valid key. Add a key below to enable this capability.</div>
            </div>
          </div>
        )}

        {/* Provider cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#131313', border: '1px solid #2E2E2E', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <Skeleton w="40px" h="40px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton w="140px" h="14px" />
                  <Skeleton w="220px" h="11px" />
                </div>
              </div>
            ))}
          </div>
        ) : catProviders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px', color: '#555' }}>
            <Settings size={32} color="#333" style={{ marginBottom: '12px' }} />
            <p>Backend offline — start the backend to manage providers</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {catProviders.map(p => (
              <ProviderCard
                key={p.id}
                provider={p}
                catId={activeCategory}
                catColor={cat.color}
                saved={catKeys.find(k => k.provider === p.id)}
                onSave={handleSave}
                onDelete={handleDelete}
                onActivate={handleActivate}
              />
            ))}
          </div>
        )}

        {/* Info callout */}
        <div style={{ marginTop: '28px', padding: '16px 20px', background: '#111', border: '1px solid #1A1A1A', borderRadius: '12px', fontSize: '12px', color: '#555', lineHeight: 1.7 }}>
          <strong style={{ color: '#888', display: 'block', marginBottom: '6px' }}>🔑 Key Security</strong>
          Keys are stored obfuscated in the local database. In production, use a secrets manager (e.g. AWS Secrets Manager, HashiCorp Vault) and set keys via environment variables. Keys are never returned in plain text — only masked previews are shown.
          <br /><br />
          <strong style={{ color: '#888' }}>⚠️ No Active Provider Warning</strong> — If an agent is configured to use a provider with no API key set, it will display "Add API key in Settings → AI Platform" and fall back to a demo response.
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: '#1A1A1A', border: `1px solid ${toast.type === 'ok' ? '#3ECF8E40' : '#ef444440'}`, color: toast.type === 'ok' ? '#3ECF8E' : '#ef4444', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
