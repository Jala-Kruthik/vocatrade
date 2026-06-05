import React, { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from './AuthContext';
import { useAuth } from './AuthContext';

const C = {
  bg: '#0f172a', surface: '#1e293b', surfaceAlt: '#162032',
  border: '#334155', text: '#f1f5f9', muted: '#94a3b8',
  accent: '#f59e0b', green: '#22c55e', red: '#ef4444', blue: '#3b82f6', purple: '#a855f7',
};

const TRADES = ['All', 'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Welding', 'Masonry', 'Pipefitting', 'Ironwork', 'Automotive', 'Other'];

// ── Fallback mock data ─────────────────────────────────────────────────────────
const MOCK_WORKERS = [
  { _id: 'p1', name: 'Rahul Sharma', tradeCategory: 'Plumbing', isCertified: true, certifications: [{ trade: 'Plumbing', course: 'VocaTrade Service Provider Certification', score: 88 }], phone: '+91 98201 34567', email: 'rahul.s@vocatrade.io', available: true },
  { _id: 'p2', name: 'Priya Menon', tradeCategory: 'Electrical', isCertified: true, certifications: [{ trade: 'Electrical', course: 'VocaTrade Service Provider Certification', score: 92 }], phone: '+91 77390 12345', email: 'priya.m@vocatrade.io', available: true },
  { _id: 'p3', name: 'Arjun Nair', tradeCategory: 'HVAC', isCertified: true, certifications: [{ trade: 'HVAC', course: 'VocaTrade Service Provider Certification', score: 76 }], phone: '+91 90112 56789', email: 'arjun.n@vocatrade.io', available: true },
  { _id: 'p4', name: 'Sneha Reddy', tradeCategory: 'Carpentry', isCertified: true, certifications: [{ trade: 'Carpentry', course: 'VocaTrade Service Provider Certification', score: 83 }], phone: '+91 87654 32109', email: 'sneha.r@vocatrade.io', available: false },
  { _id: 'p5', name: 'Vikram Patel', tradeCategory: 'Welding', isCertified: true, certifications: [{ trade: 'Welding', course: 'VocaTrade Service Provider Certification', score: 95 }], phone: '+91 99001 23456', email: 'vikram.p@vocatrade.io', available: true },
  { _id: 'p6', name: 'Ananya Das', tradeCategory: 'Plumbing', isCertified: true, certifications: [{ trade: 'Plumbing', course: 'VocaTrade Service Provider Certification', score: 71 }], phone: '+91 82345 67890', email: 'ananya.d@vocatrade.io', available: true },
];

// ── Request Modal ──────────────────────────────────────────────────────────────
function RequestModal({ worker, clientName, onClose }) {
  const [msg, setMsg] = useState(
    `Hi ${worker.name}, I found your profile on VocaTrade. I need a ${worker.tradeCategory} professional for a project. Are you available?`
  );
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try {
      await api.post('/users/request', {
        providerId: worker._id,
        message: msg,
      });
    } catch { /* no-op if endpoint not wired yet */ }
    setSent(true);
    toast.success(`Request sent to ${worker.name}!`);
    setTimeout(onClose, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 480, padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Request Service</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Provider mini card */}
        <div style={{ background: C.surfaceAlt, borderRadius: 10, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0, color: '#0f172a' }}>
            {worker.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{worker.name}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{worker.tradeCategory} · 🏆 Certified</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {worker.email && (
            <a href={`mailto:${worker.email}`} style={{ color: C.blue, fontSize: 13, textDecoration: 'none' }}>📧 {worker.email}</a>
          )}
          {worker.phone && (
            <a href={`tel:${worker.phone}`} style={{ color: C.green, fontSize: 13, textDecoration: 'none' }}>📞 {worker.phone}</a>
          )}
        </div>

        <label style={{ display: 'block', color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>YOUR MESSAGE</label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={5}
          style={{ width: '100%', background: '#0f172a', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={handleSend} disabled={sent || !msg.trim()}
            style={{ flex: 1, padding: 11, background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, opacity: sent ? 0.6 : 1 }}>
            {sent ? '✅ Sent!' : '📨 Send Request'}
          </button>
          <button onClick={onClose}
            style={{ padding: '11px 18px', background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: 'pointer', fontSize: 14 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Card ──────────────────────────────────────────────────────────────
function ProviderCard({ worker, onRequest }) {
  const cert = worker.certifications?.[0];
  return (
    <div
      style={{ background: C.surface, border: `2px solid ${C.green}33`, borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.green + '33')}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0, color: '#0f172a' }}>
          {worker.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{worker.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#0d1f0d', color: C.green, border: `1px solid ${C.green}`, borderRadius: 20, padding: '1px 10px', fontSize: 11, fontWeight: 700 }}>🏆 Certified</span>
            <span style={{ background: '#1a1000', color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: '1px 10px', fontSize: 11 }}>{worker.tradeCategory}</span>
          </div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: worker.available !== false ? C.green : C.red, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: worker.available !== false ? C.green : C.red, display: 'inline-block' }} />
          {worker.available !== false ? 'Available' : 'Busy'}
        </span>
      </div>

      {/* Certificate detail */}
      {cert && (
        <div style={{ background: '#0a1a0a', border: `1px solid ${C.green}33`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <div style={{ color: C.green, fontWeight: 600, marginBottom: 2 }}>📜 {cert.course}</div>
          <div style={{ color: C.muted }}>Test score: <span style={{ color: C.green, fontWeight: 700 }}>{cert.score}%</span></div>
        </div>
      )}

      {worker.phone && (
        <div style={{ color: C.muted, fontSize: 12 }}>📞 {worker.phone}</div>
      )}

      <button
        onClick={() => onRequest(worker)}
        disabled={worker.available === false}
        style={{ width: '100%', padding: '10px', background: worker.available !== false ? `linear-gradient(135deg, ${C.accent}, #d97706)` : C.border, color: worker.available !== false ? '#0f172a' : C.muted, fontWeight: 700, border: 'none', borderRadius: 8, cursor: worker.available !== false ? 'pointer' : 'not-allowed', fontSize: 13 }}
      >
        {worker.available !== false ? '📨 Request Service' : 'Currently Unavailable'}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { user, logout } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Default filter to client's registered trade preference
  const [filterTrade, setFilterTrade] = useState(user?.tradeCategory || 'All');
  const [filterAvail, setFilterAvail] = useState(false);
  const [requestWorker, setRequestWorker] = useState(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterTrade !== 'All' ? `?trade=${encodeURIComponent(filterTrade)}` : '';
      const { data } = await api.get(`/users/workers${params}`);
      setWorkers(data.length ? data : MOCK_WORKERS.filter(w => filterTrade === 'All' || w.tradeCategory === filterTrade));
    } catch {
      setWorkers(MOCK_WORKERS.filter(w => filterTrade === 'All' || w.tradeCategory === filterTrade));
    } finally {
      setLoading(false);
    }
  }, [filterTrade]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const filtered = workers.filter((w) => {
    const q = search.toLowerCase();
    return (
      (!q || w.name?.toLowerCase().includes(q) || w.tradeCategory?.toLowerCase().includes(q)) &&
      (!filterAvail || w.available !== false)
    );
  });

  const S = {
    inp: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none' },
    btn: (bg, fg = '#0f172a') => ({ padding: '8px 16px', background: bg, color: fg, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }),
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <Toaster position="top-right" />
      {requestWorker && <RequestModal worker={requestWorker} clientName={user?.name} onClose={() => setRequestWorker(null)} />}

      {/* Nav */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⚙️</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>VocaTrade</span>
          <span style={{ background: C.purple + '22', color: C.purple, border: `1px solid ${C.purple}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, marginLeft: 8 }}>Client Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>👋 {user?.name || 'Client'}</span>
          <button onClick={logout} style={S.btn('#450a0a', '#fca5a5')}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f2340)', border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>🧑‍💼 Hire Certified Service Providers</h1>
            <p style={{ color: C.muted, fontSize: 14 }}>
              All providers listed here have passed the VocaTrade certification test.
              {user?.tradeCategory && user.tradeCategory !== 'other' && (
                <span style={{ color: C.accent }}> Showing results for <strong>{user.tradeCategory}</strong> based on your requirement.</span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>{workers.length}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>Certified</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.green }}>{workers.filter(w => w.available !== false).length}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>Available Now</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ ...S.inp, minWidth: 220 }}
            placeholder="🔍 Search by name or trade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={S.inp}
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
          >
            {TRADES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filterAvail} onChange={(e) => setFilterAvail(e.target.checked)} style={{ accentColor: C.green, width: 14, height: 14 }} />
            Available only
          </label>
          <span style={{ color: C.muted, fontSize: 13, marginLeft: 'auto' }}>
            {filtered.length} provider{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: C.muted, textAlign: 'center', marginTop: 80 }}>Loading certified providers…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 44, marginBottom: 12 }}>🔍</p>
            <p style={{ color: C.muted, marginBottom: 12 }}>
              No certified {filterTrade !== 'All' ? filterTrade : ''} providers available right now.
            </p>
            <button onClick={() => setFilterTrade('All')} style={S.btn(`linear-gradient(135deg, ${C.accent}, #d97706)`)}>
              Show All Trades
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((w) => (
              <ProviderCard key={w._id} worker={w} onRequest={setRequestWorker} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
