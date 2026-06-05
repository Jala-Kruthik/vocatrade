import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const TRADE_CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Welding', 'Masonry', 'Pipefitting', 'Ironwork', 'Automotive', 'Other'];

function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score] : '#334155', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a)', padding: '2rem 1rem' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '2.5rem 2rem', width: '100%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: { width: 42, height: 42, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  logoText: { color: '#f8fafc', fontSize: 22, fontWeight: 700 },
  heading: { color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 4 },
  subheading: { color: '#64748b', fontSize: 14, marginBottom: 20 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 },
  roleBtn: (active, color = '#f59e0b') => ({
    padding: '12px 8px', borderRadius: 10, border: active ? `2px solid ${color}` : '2px solid #334155',
    background: active ? color + '18' : '#0f172a', color: active ? color : '#94a3b8',
    cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', textAlign: 'center',
  }),
  fieldWrap: { marginBottom: 16 },
  label: { display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginBottom: 5 },
  input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 15, outline: 'none' },
  select: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 15, outline: 'none' },
  inputError: { borderColor: '#ef4444' },
  errorMsg: { color: '#ef4444', fontSize: 12, marginTop: 3 },
  pwWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  sectionLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },
  btn: { width: '100%', padding: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  loginLink: { textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 20 },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 600 },
  serverError: { background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 },
  divider: { height: 1, background: '#334155', margin: '16px 0' },
  infoBox: (bg, border, color) => ({ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', marginTop: 4, fontSize: 12, color }),
};

const ROLES = [
  { id: 'provider', label: '🔧 Service Provider', desc: 'Complete courses & get certified', color: '#f59e0b' },
  { id: 'client',   label: '🧑‍💼 Client',          desc: 'Hire certified providers',       color: '#a855f7' },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('provider');
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser({ ...data, role });
      toast.success('Account created! Welcome aboard 🎉');
      navigate(role === 'client' ? '/client' : '/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>⚙️</div>
          <div>
            <div style={S.logoText}>VocaTrade</div>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Create your account</span>
          </div>
        </div>

        <h1 style={S.heading}>Join the Platform</h1>
        <p style={S.subheading}>Choose your role to get started</p>

        {/* Role selector */}
        <div style={S.roleGrid}>
          {ROLES.map(({ id, label, desc, color }) => (
            <button key={id} type="button" style={S.roleBtn(role === id, color)} onClick={() => setRole(id)}>
              <div style={{ fontSize: 15, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 400 }}>{desc}</div>
            </button>
          ))}
        </div>

        {serverError && <div style={S.serverError}>⚠ {serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <p style={S.sectionLabel}>Account Details</p>

          <div style={S.fieldWrap}>
            <label style={S.label}>Full Name</label>
            <input style={{ ...S.input, ...(errors.name ? S.inputError : {}) }} placeholder="John Smith"
              {...register('name', { required: 'Full name is required' })} />
            {errors.name && <p style={S.errorMsg}>{errors.name.message}</p>}
          </div>

          <div style={S.fieldWrap}>
            <label style={S.label}>Email Address</label>
            <input type="email" style={{ ...S.input, ...(errors.email ? S.inputError : {}) }} placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
            {errors.email && <p style={S.errorMsg}>{errors.email.message}</p>}
          </div>

          <div style={S.grid2}>
            <div style={S.fieldWrap}>
              <label style={S.label}>Password</label>
              <div style={S.pwWrap}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  style={{ ...S.input, paddingRight: 42, ...(errors.password ? S.inputError : {}) }}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Include uppercase & number' } })} />
                <button type="button" style={S.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? '🙈' : '👁'}</button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p style={S.errorMsg}>{errors.password.message}</p>}
            </div>
            <div style={S.fieldWrap}>
              <label style={S.label}>Confirm Password</label>
              <input type="password" placeholder="••••••••"
                style={{ ...S.input, ...(errors.confirmPassword ? S.inputError : {}) }}
                {...register('confirmPassword', { required: 'Please confirm', validate: (v) => v === password || 'Passwords do not match' })} />
              {errors.confirmPassword && <p style={S.errorMsg}>{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div style={S.divider} />

          {/* Role-specific fields */}
          {role === 'provider' ? (
            <>
              <p style={S.sectionLabel}>Service Provider Details</p>
              <div style={S.grid2}>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Trade Category</label>
                  <select style={S.select} {...register('tradeCategory', { required: 'Select a trade' })}>
                    <option value="">Select trade…</option>
                    {TRADE_CATEGORIES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  {errors.tradeCategory && <p style={S.errorMsg}>{errors.tradeCategory.message}</p>}
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Phone Number</label>
                  <input type="tel" style={S.input} placeholder="+91 98765 43210"
                    {...register('phone', { pattern: { value: /^[+\d\s()-]{7,20}$/, message: 'Invalid phone' } })} />
                  {errors.phone && <p style={S.errorMsg}>{errors.phone.message}</p>}
                </div>
              </div>
              <div style={S.infoBox('#0d1f1a', '#14532d', '#86efac')}>
                📋 Complete trade courses and pass the final test to earn your certificate. Only certified providers appear in the client hiring directory.
              </div>
            </>
          ) : (
            <>
              <p style={S.sectionLabel}>Client Details</p>
              <div style={S.grid2}>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Location</label>
                  <input style={S.input} placeholder="e.g. Mumbai, Chennai" {...register('location')} />
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Phone Number</label>
                  <input type="tel" style={S.input} placeholder="+91 98765 43210"
                    {...register('phone', { pattern: { value: /^[+\d\s()-]{7,20}$/, message: 'Invalid phone' } })} />
                  {errors.phone && <p style={S.errorMsg}>{errors.phone.message}</p>}
                </div>
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Trade service needed (optional)</label>
                <select style={S.select} {...register('tradeCategory')}>
                  <option value="">Select primary trade…</option>
                  {TRADE_CATEGORIES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.infoBox('#120d1f', '#4c1d95', '#c4b5fd')}>
                🔍 Browse and request only <strong>certified</strong> Service Providers. Certification is verified through our course + test system.
              </div>
            </>
          )}

          <button type="submit" disabled={isSubmitting} style={{ ...S.btn, ...(isSubmitting ? S.btnDisabled : {}) }}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={S.loginLink}>
          Already have an account? <Link to="/login" style={S.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
