import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    padding: '1rem',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 16,
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 42, height: 42,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  logoText: { color: '#f8fafc', fontSize: 22, fontWeight: 700 },
  subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  heading: { color: '#f1f5f9', fontSize: 26, fontWeight: 700, marginBottom: 6 },
  subheading: { color: '#64748b', fontSize: 14, marginBottom: 20 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 },
  roleBtn: (active, color) => ({
    padding: '11px 8px', borderRadius: 10,
    border: active ? `2px solid ${color}` : '2px solid #334155',
    background: active ? color + '18' : '#0f172a',
    color: active ? color : '#94a3b8',
    cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', textAlign: 'center',
  }),
  fieldWrap: { marginBottom: 18 },
  label: { display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginBottom: 6 },
  input: {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 15, outline: 'none',
  },
  inputError: { borderColor: '#ef4444' },
  errorMsg: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: 0,
  },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer' },
  checkbox: { accentColor: '#f59e0b', width: 14, height: 14 },
  forgotLink: { color: '#f59e0b', fontSize: 13, textDecoration: 'none' },
  btn: (color = '#f59e0b') => ({
    width: '100%', padding: '12px',
    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
    color: '#0f172a', fontWeight: 700, fontSize: 15,
    border: 'none', borderRadius: 8, cursor: 'pointer',
  }),
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
  dividerLine: { flex: 1, height: 1, background: '#334155' },
  dividerText: { color: '#64748b', fontSize: 12 },
  registerLink: { textAlign: 'center', color: '#64748b', fontSize: 14 },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 600 },
  serverError: {
    background: '#450a0a', border: '1px solid #991b1b',
    borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 18,
  },
};

const ROLES = [
  { id: 'provider', label: '🔧 Service Provider', color: '#f59e0b' },
  { id: 'client',   label: '🧑‍💼 Client',          color: '#a855f7' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('provider');
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', remember: false } });

  const onSubmit = async ({ email, password, remember }) => {
    setServerError('');
    try {
      const userData = await login(email, password, remember);
      // Validate role matches what was selected
      const actualRole = userData?.role;
      if (actualRole && actualRole !== role) {
        setServerError(
          `This account is registered as a "${actualRole === 'provider' ? 'Service Provider' : 'Client'}". Please select the correct role.`
        );
        return;
      }
      toast.success('Welcome back!');
      navigate(role === 'client' ? '/client' : '/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  const activeColor = role === 'client' ? '#a855f7' : '#f59e0b';

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>⚙️</div>
          <div>
            <div style={S.logoText}>VocaTrade</div>
            <div style={S.subtitle}>Vocational Mastery Platform</div>
          </div>
        </div>

        <h1 style={S.heading}>Sign In</h1>
        <p style={S.subheading}>Select your role to continue</p>

        {/* Role selector */}
        <div style={S.roleGrid}>
          {ROLES.map(({ id, label, color }) => (
            <button key={id} type="button" style={S.roleBtn(role === id, color)} onClick={() => setRole(id)}>
              {label}
            </button>
          ))}
        </div>

        {serverError && <div style={S.serverError}>⚠ {serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div style={S.fieldWrap}>
            <label style={S.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              style={{ ...S.input, ...(errors.email ? S.inputError : {}) }}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
              onFocus={(e) => (e.target.style.borderColor = activeColor)}
              onBlur={(e) => (e.target.style.borderColor = errors.email ? '#ef4444' : '#334155')}
            />
            {errors.email && <p style={S.errorMsg}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div style={S.fieldWrap}>
            <label style={S.label}>Password</label>
            <div style={S.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ ...S.input, paddingRight: 42, ...(errors.password ? S.inputError : {}) }}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                onFocus={(e) => (e.target.style.borderColor = activeColor)}
                onBlur={(e) => (e.target.style.borderColor = errors.password ? '#ef4444' : '#334155')}
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={S.errorMsg}>{errors.password.message}</p>}
          </div>

          {/* Remember + forgot */}
          <div style={S.row}>
            <label style={S.checkLabel}>
              <input type="checkbox" style={S.checkbox} {...register('remember')} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ ...S.forgotLink, color: activeColor }}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...S.btn(activeColor), ...(isSubmitting ? S.btnDisabled : {}) }}
          >
            {isSubmitting ? 'Signing in…' : `Sign In as ${role === 'client' ? 'Client' : 'Service Provider'}`}
          </button>
        </form>

        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>NEW HERE?</span>
          <div style={S.dividerLine} />
        </div>

        <p style={S.registerLink}>
          Don't have an account?{' '}
          <Link to="/register" style={{ ...S.link, color: activeColor }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
