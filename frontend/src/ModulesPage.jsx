import React, { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { api } from './AuthContext';

const C = { bg: '#0f172a', surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', accent: '#f59e0b', green: '#22c55e', red: '#ef4444', blue: '#3b82f6' };
const TRADES = ['All', 'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Welding', 'Masonry', 'Automotive', 'Other'];
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];
const PAGE_SIZE = 8;
const cleanDate = (value) => (value ? String(value).slice(0, 10) : '');
const modulePayload = (data) => ({
  ...data,
  duration: Number(data.duration || 0),
  deadline: cleanDate(data.deadline),
});

function statusColor(s) {
  if (s === 'Completed') return C.green;
  if (s === 'In Progress') return C.blue;
  return C.muted;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModuleForm({ defaultValues, onSubmit, loading }) {
  const normalizedDefaults = {
    status: 'Not Started',
    difficulty: 'Beginner',
    tradeCategory: 'Plumbing',
    duration: 1,
    ...defaultValues,
    deadline: cleanDate(defaultValues?.deadline),
  };
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: normalizedDefaults });
  const S = {
    label: { display: 'block', color: C.muted, fontSize: 12, fontWeight: 500, marginBottom: 4, marginTop: 12 },
    input: { width: '100%', background: '#0f172a', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 14, outline: 'none' },
    err: { color: C.red, fontSize: 11, marginTop: 2 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    btn: { marginTop: 20, width: '100%', padding: 11, background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label style={S.label}>Title *</label>
      <input style={S.input} {...register('title', { required: 'Title is required' })} />
      {errors.title && <p style={S.err}>{errors.title.message}</p>}

      <div style={{ ...S.grid, marginTop: 0 }}>
        <div>
          <label style={S.label}>Trade Category *</label>
          <select style={S.input} {...register('tradeCategory', { required: true })}>
            {TRADES.filter((t) => t !== 'All').map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Difficulty</label>
          <select style={S.input} {...register('difficulty')}>
            {DIFFICULTY.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <label style={S.label}>Description</label>
      <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} {...register('description')} />

      <div style={S.grid}>
        <div>
          <label style={S.label}>Duration (hrs)</label>
          <input type="number" min="0.5" step="0.5" style={S.input} {...register('duration')} />
        </div>
        <div>
          <label style={S.label}>Deadline</label>
          <input type="date" style={S.input} {...register('deadline')} />
        </div>
      </div>

      <label style={S.label}>Completion Status</label>
      <select style={S.input} {...register('status')}>
        {STATUSES.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
      </select>

      <button type="submit" disabled={loading} style={S.btn}>{loading ? 'Saving…' : 'Save Module'}</button>
    </form>
  );
}

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [search, setSearch] = useState('');
  const [filterTrade, setFilterTrade] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | { mode:'edit', module }
  const [savingId, setSavingId] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      const { data } = await api.get('/modules');
      setModules(data);
    } catch {
      // Use empty array; user can still create modules
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const filtered = modules
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        (!q || m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)) &&
        (filterTrade === 'All' || m.tradeCategory === filterTrade) &&
        (filterStatus === 'All' || m.status === filterStatus)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'deadline') return cleanDate(a.deadline).localeCompare(cleanDate(b.deadline));
      if (sortBy === 'difficulty') return DIFFICULTY.indexOf(a.difficulty) - DIFFICULTY.indexOf(b.difficulty);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = STATUSES.filter((s) => s !== 'All').reduce((acc, status) => {
    acc[status] = modules.filter((m) => (m.status || 'Not Started') === status).length;
    return acc;
  }, {});
  const completionPct = modules.length ? Math.round(((counts.Completed || 0) / modules.length) * 100) : 0;

  const handleCreate = async (formData) => {
    setSavingId('new');
    try {
      const { data } = await api.post('/modules', modulePayload(formData));
      setModules((prev) => [data, ...prev]);
      toast.success('Module created');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create module');
    } finally {
      setSavingId(null);
    }
  };

  const handleEdit = async (formData) => {
    const id = modal.module._id;
    setSavingId(id);
    try {
      const { data } = await api.put(`/modules/${id}`, modulePayload(formData));
      setModules((prev) => prev.map((m) => (m._id === id ? data : m)));
      toast.success('Module updated');
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update module');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module?')) return;
    try {
      await api.delete(`/modules/${id}`);
      setModules((prev) => prev.filter((m) => m._id !== id));
      toast.success('Module deleted');
    } catch {
      toast.error('Failed to delete module');
    }
  };

  const handleStatusChange = async (module, status) => {
    try {
      const { data } = await api.put(`/modules/${module._id}`, { ...module, status });
      setModules((prev) => prev.map((m) => (m._id === module._id ? data : m)));
      toast.success(`Marked ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const S = {
    page: { minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 24, fontWeight: 700 },
    btn: (bg, fg = '#0f172a') => ({ padding: '8px 18px', background: bg, color: fg, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }),
    filters: { display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' },
    input: { background: '#1e293b', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none' },
    select: { background: '#1e293b', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
    card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.25rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: C.muted, fontSize: 12, fontWeight: 600, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, textTransform: 'uppercase' },
    td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13 },
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      {modal === 'create' && (
        <Modal title="Create Module" onClose={() => setModal(null)}>
          <ModuleForm defaultValues={{ status: 'Not Started', difficulty: 'Beginner', tradeCategory: 'Plumbing' }} onSubmit={handleCreate} loading={savingId === 'new'} />
        </Modal>
      )}
      {modal?.mode === 'edit' && (
        <Modal title="Edit Module" onClose={() => setModal(null)}>
          <ModuleForm defaultValues={modal.module} onSubmit={handleEdit} loading={!!savingId} />
        </Modal>
      )}

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📚 Training Modules</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{filtered.length} module{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn(viewMode === 'card' ? C.accent : C.surface, viewMode === 'card' ? '#0f172a' : C.text)} onClick={() => setViewMode('card')}>⊞ Cards</button>
          <button style={S.btn(viewMode === 'table' ? C.accent : C.surface, viewMode === 'table' ? '#0f172a' : C.text)} onClick={() => setViewMode('table')}>☰ Table</button>
          <button style={S.btn('linear-gradient(135deg, #f59e0b, #d97706)')} onClick={() => setModal('create')}>+ New Module</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.25rem' }}>
        <div style={S.card}>
          <div style={{ color: C.muted, fontSize: 12 }}>Total Modules</div>
          <div style={{ color: C.text, fontSize: 26, fontWeight: 800 }}>{modules.length}</div>
        </div>
        <div style={S.card}>
          <div style={{ color: C.muted, fontSize: 12 }}>In Progress</div>
          <div style={{ color: C.blue, fontSize: 26, fontWeight: 800 }}>{counts['In Progress'] || 0}</div>
        </div>
        <div style={S.card}>
          <div style={{ color: C.muted, fontSize: 12 }}>Completed</div>
          <div style={{ color: C.green, fontSize: 26, fontWeight: 800 }}>{counts.Completed || 0}</div>
        </div>
        <div style={S.card}>
          <div style={{ color: C.muted, fontSize: 12 }}>Progress</div>
          <div style={{ color: C.accent, fontSize: 26, fontWeight: 800 }}>{completionPct}%</div>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <input style={{ ...S.input, minWidth: 220 }} placeholder="🔍 Search modules…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select style={S.select} value={filterTrade} onChange={(e) => { setFilterTrade(e.target.value); setPage(1); }}>
          {TRADES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select style={S.select} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select style={S.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="difficulty">Sort: Difficulty</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ color: C.muted, textAlign: 'center', marginTop: 60 }}>Loading modules…</p>
      ) : paginated.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ color: C.muted }}>No modules found. Create your first one!</p>
        </div>
      ) : viewMode === 'card' ? (
        <div style={S.grid}>
          {paginated.map((m) => (
            <div key={m._id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ background: '#1a1000', color: C.accent, borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{m.tradeCategory || 'Other'}</span>
                <span style={{ color: statusColor(m.status), fontSize: 11, fontWeight: 600 }}>● {m.status || 'Not Started'}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{m.title}</h3>
              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description || 'No description'}</p>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: C.muted, marginBottom: 12 }}>
                <span>⏱ {m.duration || 0}h</span>
                <span>📅 {cleanDate(m.deadline) || 'No deadline'}</span>
                <span>🎯 {m.difficulty || 'Beginner'}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {STATUSES.filter((s) => s !== 'All').map((status) => (
                  <button key={status} onClick={() => handleStatusChange(m, status)} style={S.btn((m.status || 'Not Started') === status ? C.accent : C.surface, (m.status || 'Not Started') === status ? '#0f172a' : C.muted)}>{status}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setModal({ mode: 'edit', module: m })} style={S.btn(C.blue + '33', C.blue)}>Edit</button>
                <button onClick={() => handleDelete(m._id)} style={S.btn(C.red + '22', C.red)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Title', 'Category', 'Difficulty', 'Duration', 'Deadline', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((m) => (
                <tr key={m._id}>
                  <td style={S.td}>{m.title}</td>
                  <td style={S.td}>{m.tradeCategory}</td>
                  <td style={S.td}>{m.difficulty}</td>
                  <td style={S.td}>{m.duration || 0}h</td>
                  <td style={S.td}>{cleanDate(m.deadline) || '—'}</td>
                  <td style={S.td}><span style={{ color: statusColor(m.status) }}>● {m.status || 'Not Started'}</span></td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => handleStatusChange(m, m.status === 'Completed' ? 'In Progress' : 'Completed')} style={S.btn(C.green + '22', C.green)}>{m.status === 'Completed' ? 'Reopen' : 'Done'}</button>
                      <button onClick={() => setModal({ mode: 'edit', module: m })} style={S.btn(C.blue + '33', C.blue)}>Edit</button>
                      <button onClick={() => handleDelete(m._id)} style={S.btn(C.red + '22', C.red)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={S.btn(C.surface, C.text)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={S.btn(p === page ? C.accent : C.surface, p === page ? '#0f172a' : C.text)}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={S.btn(C.surface, C.text)}>Next ›</button>
        </div>
      )}
    </div>
  );
}
