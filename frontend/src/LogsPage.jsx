import React, { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { api } from './AuthContext';

const C = { bg: '#0f172a', surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', accent: '#f59e0b', green: '#22c55e', red: '#ef4444', blue: '#3b82f6' };
const TRADES = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Welding', 'Masonry', 'Automotive', 'Other'];
const SUPERVISOR_STATUSES = ['Pending', 'Approved', 'Rejected'];

const today = () => new Date().toISOString().slice(0, 10);
const cleanDate = (value) => (value ? String(value).slice(0, 10) : '');
const toNumber = (value) => Number(value || 0);
const computeSummary = (items) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return items.reduce((acc, log) => {
    const hours = toNumber(log.hoursWorked);
    const date = new Date(log.date || log.createdAt || Date.now());
    acc.total += hours;
    if (date >= startOfWeek) acc.weekly += hours;
    if (date >= startOfMonth) acc.monthly += hours;
    return acc;
  }, { total: 0, weekly: 0, monthly: 0 });
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LogForm({ defaultValues, onSubmit, loading }) {
  const normalizedDefaults = { date: today(), supervisorStatus: 'Pending', ...defaultValues };
  normalizedDefaults.date = cleanDate(defaultValues?.date) || today();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: normalizedDefaults });
  const inp = { width: '100%', background: '#0f172a', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 14, outline: 'none' };
  const lbl = { display: 'block', color: C.muted, fontSize: 12, fontWeight: 500, marginBottom: 4, marginTop: 12 };
  const err = { color: C.red, fontSize: 11, marginTop: 2 };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Project Name *</label>
          <input style={inp} {...register('projectName', { required: 'Required' })} />
          {errors.projectName && <p style={err}>{errors.projectName.message}</p>}
        </div>
        <div>
          <label style={lbl}>Site Location *</label>
          <input style={inp} {...register('siteLocation', { required: 'Required' })} />
          {errors.siteLocation && <p style={err}>{errors.siteLocation.message}</p>}
        </div>
        <div>
          <label style={lbl}>Trade Type *</label>
          <select style={inp} {...register('tradeType', { required: 'Required' })}>
            <option value="">Select…</option>
            {TRADES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.tradeType && <p style={err}>{errors.tradeType.message}</p>}
        </div>
        <div>
          <label style={lbl}>Hours Worked *</label>
          <input type="number" min="0.5" max="24" step="0.5" style={inp} {...register('hoursWorked', { required: 'Required', min: { value: 0.5, message: 'Min 0.5h' } })} />
          {errors.hoursWorked && <p style={err}>{errors.hoursWorked.message}</p>}
        </div>
        <div>
          <label style={lbl}>Date *</label>
          <input type="date" style={inp} {...register('date', { required: 'Required' })} />
          {errors.date && <p style={err}>{errors.date.message}</p>}
        </div>
        <div>
          <label style={lbl}>Supervisor Status</label>
          <select style={inp} {...register('supervisorStatus')}>
            {SUPERVISOR_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <label style={lbl}>Work Description *</label>
      <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} {...register('workDescription', { required: 'Description is required' })} />
      {errors.workDescription && <p style={err}>{errors.workDescription.message}</p>}
      <label style={lbl}>Tools Used</label>
      <input style={inp} placeholder="Pipe wrench, multimeter, level..." {...register('toolsText')} />
      <label style={lbl}>Issues / Learnings</label>
      <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Mention blockers, fixes, measurements, or what you learned." {...register('issues')} />
      <button type="submit" disabled={loading} style={{ marginTop: 20, width: '100%', padding: 11, background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
        {loading ? 'Saving…' : 'Save Log'}
      </button>
    </form>
  );
}

function DetailModal({ log, onClose }) {
  const statusColor = { Approved: C.green, Rejected: C.red, Pending: C.accent };
  return (
    <Modal title="Log Details" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          ['Project', log.projectName], ['Location', log.siteLocation],
          ['Trade', log.tradeType], ['Hours', `${log.hoursWorked}h`],
          ['Date', cleanDate(log.date)], ['Status', log.supervisorStatus],
        ].map(([k, v]) => (
          <div key={k}>
            <p style={{ color: C.muted, fontSize: 11, marginBottom: 2 }}>{k}</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: k === 'Status' ? statusColor[v] : C.text }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Work Description</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{log.workDescription}</p>
      </div>
      {!!log.toolsUsed?.length && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Tools Used</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{log.toolsUsed.join(', ')}</p>
        </div>
      )}
      {log.issues && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Issues / Learnings</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{log.issues}</p>
        </div>
      )}
    </Modal>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailLog, setDetailLog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTrade, setFilterTrade] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 720);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const [{ data: logsData }, { data: summaryData }] = await Promise.all([api.get('/logs'), api.get('/logs/summary').catch(() => ({ data: {} }))]);
      const normalized = logsData.map((log) => ({ ...log, date: cleanDate(log.date), toolsText: log.toolsUsed?.join(', ') || '' }));
      setLogs(normalized);
      setSummary({ total: summaryData.totalHours || 0, weekly: summaryData.weeklyHours || 0, monthly: summaryData.monthlyHours || 0 });
    } catch {
      // no-op; show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      (!q || l.projectName?.toLowerCase().includes(q) || l.siteLocation?.toLowerCase().includes(q)) &&
      (filterTrade === 'All' || l.tradeType === filterTrade) &&
      (filterStatus === 'All' || l.supervisorStatus === filterStatus) &&
      (!dateFrom || cleanDate(l.date) >= dateFrom) &&
      (!dateTo || cleanDate(l.date) <= dateTo)
    );
  });

  const saveSummary = (nextLogs) => setSummary(computeSummary(nextLogs));
  const prepareLogPayload = (formData) => ({
    ...formData,
    date: cleanDate(formData.date),
    hoursWorked: toNumber(formData.hoursWorked),
    toolsUsed: String(formData.toolsText || '')
      .split(',')
      .map((tool) => tool.trim())
      .filter(Boolean),
  });

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      const { data: created } = await api.post('/logs', prepareLogPayload(data));
      const nextLogs = [{ ...created, date: cleanDate(created.date), toolsText: created.toolsUsed?.join(', ') || '' }, ...logs];
      setLogs(nextLogs);
      saveSummary(nextLogs);
      toast.success('Log added!');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add log');
    } finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    const id = modal.log._id;
    try {
      const { data: updated } = await api.put(`/logs/${id}`, prepareLogPayload(data));
      const nextLogs = logs.map((l) => (l._id === id ? { ...updated, date: cleanDate(updated.date), toolsText: updated.toolsUsed?.join(', ') || '' } : l));
      setLogs(nextLogs);
      saveSummary(nextLogs);
      toast.success('Log updated');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update log');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field log?')) return;
    try {
      await api.delete(`/logs/${id}`);
      const nextLogs = logs.filter((l) => l._id !== id);
      setLogs(nextLogs);
      saveSummary(nextLogs);
      toast.success('Log deleted');
    } catch { toast.error('Failed to delete log'); }
  };

  const S = {
    page: { minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' },
    btn: (bg, fg = '#0f172a') => ({ padding: '7px 16px', background: bg, color: fg, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }),
    inp: { background: '#1e293b', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none' },
    summaryCard: (bg) => ({ background: bg, borderRadius: 12, padding: '1rem 1.25rem', flex: 1, minWidth: 140 }),
    statVal: { fontSize: 26, fontWeight: 700 },
    statLbl: { color: C.muted, fontSize: 12 },
    statusColors: { Approved: C.green, Rejected: C.red, Pending: C.accent },
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      {detailLog && <DetailModal log={detailLog} onClose={() => setDetailLog(null)} />}
      {modal === 'create' && <Modal title="Add Field Log" onClose={() => setModal(null)}><LogForm defaultValues={{ supervisorStatus: 'Pending', date: today() }} onSubmit={handleCreate} loading={saving} /></Modal>}
      {modal?.mode === 'edit' && <Modal title="Edit Log" onClose={() => setModal(null)}><LogForm defaultValues={modal.log} onSubmit={handleEdit} loading={saving} /></Modal>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>📋 Field Logs</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{filtered.length} log{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button style={S.btn('linear-gradient(135deg, #f59e0b, #d97706)')} onClick={() => setModal('create')}>+ Add Log</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={S.summaryCard('#1e2a1a')}>
          <div style={{ ...S.statVal, color: C.green }}>{summary.total}h</div>
          <div style={S.statLbl}>Total Hours</div>
        </div>
        <div style={S.summaryCard('#1e2a40')}>
          <div style={{ ...S.statVal, color: C.blue }}>{summary.weekly}h</div>
          <div style={S.statLbl}>This Week</div>
        </div>
        <div style={S.summaryCard('#1a1000')}>
          <div style={{ ...S.statVal, color: C.accent }}>{summary.monthly}h</div>
          <div style={S.statLbl}>This Month</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input style={{ ...S.inp, minWidth: 200 }} placeholder="🔍 Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={S.inp} value={filterTrade} onChange={(e) => setFilterTrade(e.target.value)}>
          <option value="All">All Trades</option>
          {TRADES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select style={S.inp} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {SUPERVISOR_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" style={S.inp} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date" />
        <input type="date" style={S.inp} value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date" />
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      {loading ? (
        <p style={{ color: C.muted, textAlign: 'center', marginTop: 60 }}>Loading logs…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ color: C.muted }}>No logs found. Start by adding your first field log.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          {!isMobile && <div style={{ overflowX: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Project', 'Location', 'Trade', 'Hours', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', color: C.muted, fontSize: 12, fontWeight: 600, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, textTransform: 'uppercase' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l._id}>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500 }}>{l.projectName}</td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>{l.siteLocation}</td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>{l.tradeType}</td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>{l.hoursWorked}h</td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>{cleanDate(l.date)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: S.statusColors[l.supervisorStatus] || C.muted }}>● {l.supervisorStatus}</span>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setDetailLog(l)} style={S.btn(C.muted + '22', C.muted)}>View</button>
                        <button onClick={() => setModal({ mode: 'edit', log: l })} style={S.btn(C.blue + '33', C.blue)}>Edit</button>
                        <button onClick={() => handleDelete(l._id)} style={S.btn(C.red + '22', C.red)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

          {/* Mobile cards */}
          {isMobile && <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {filtered.map((l) => (
              <div key={l._id + 'm'} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{l.projectName}</h3>
                  <span style={{ color: S.statusColors[l.supervisorStatus] || C.muted, fontSize: 12 }}>● {l.supervisorStatus}</span>
                </div>
                <p style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>📍 {l.siteLocation} · 🔧 {l.tradeType} · ⏱ {l.hoursWorked}h · 📅 {cleanDate(l.date)}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button onClick={() => setDetailLog(l)} style={S.btn(C.muted + '22', C.muted)}>View</button>
                  <button onClick={() => setModal({ mode: 'edit', log: l })} style={S.btn(C.blue + '33', C.blue)}>Edit</button>
                  <button onClick={() => handleDelete(l._id)} style={S.btn(C.red + '22', C.red)}>Delete</button>
                </div>
              </div>
            ))}
          </div>}
        </>
      )}
    </div>
  );
}
