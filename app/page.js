'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import styles from './login.module.css';

// ── Role codes ───────────────────────────────────
const STAFF_ROLES = [
  { code: 'ADMIN2025',  label: 'Administrator', route: '/admin',  icon: '👨‍💼', color: '#c9a84c' },
  { code: 'KASSIR2025', label: 'Kassir',         route: '/kassir', icon: '💰',  color: '#3b82f6' },
  { code: 'OSHPAZ2025', label: 'Oshpaz',         route: '/oshpaz', icon: '👨‍🍳', color: '#10b981' },
  { code: 'BOSS2025',   label: 'Boss',            route: '/boss',   icon: '👑',  color: '#a855f7' },
];

// ── Helpers ──────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('bv_users') || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('bv_users', JSON.stringify(users));
}

// ── Main Page ─────────────────────────────────────
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [mode,     setMode]     = useState('login'); // login | register | staff
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  // Register form
  const [regForm,   setRegForm]   = useState({ name: '', phone: '', password: '', confirm: '' });
  // Staff (all roles) form
  const [staffCode, setStaffCode] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bv_user');
    if (saved) setLoggedIn(true);
    setLoading(false);
  }, []);

  if (loading) return (
    <div className={styles.loader}>
      <span className={styles.loaderIcon}>✦</span>
    </div>
  );

  // ── Login submit ──────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.phone.trim() || !loginForm.password.trim()) {
      setError('Telefon raqam va parolni kiriting.');
      return;
    }
    const users = getUsers();
    const user  = users.find(u => u.phone === loginForm.phone.trim() && u.password === loginForm.password);
    if (!user) {
      setError("Telefon raqam yoki parol noto'g'ri.");
      return;
    }
    localStorage.setItem('bv_user', JSON.stringify({ name: user.name, phone: user.phone }));
    setLoggedIn(true);
  };

  // ── Register submit ───────────────────────────
  const handleRegister = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!regForm.name.trim() || !regForm.phone.trim() || !regForm.password) {
      setError("Barcha maydonlarni to'ldiring.");
      return;
    }
    if (regForm.password.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (regForm.password !== regForm.confirm) {
      setError("Parollar mos kelmaydi.");
      return;
    }
    const users = getUsers();
    if (users.find(u => u.phone === regForm.phone.trim())) {
      setError("Bu telefon raqam allaqachon ro'yxatdan o'tgan.");
      return;
    }
    const newUser = { name: regForm.name.trim(), phone: regForm.phone.trim(), password: regForm.password, createdAt: new Date().toISOString() };
    saveUsers([...users, newUser]);
    setSuccess("✅ Ro'yxatdan o'tdingiz! Endi kirish mumkin.");
    setRegForm({ name: '', phone: '', password: '', confirm: '' });
    setTimeout(() => { setMode('login'); setSuccess(''); }, 1800);
  };

  // ── Staff submit ──────────────────────────────
  const handleStaff = (e) => {
    e.preventDefault();
    setError('');
    const role = STAFF_ROLES.find(r => r.code === staffCode.trim());
    if (role) {
      window.location.href = role.route;
    } else {
      setError("Noto'g'ri kod. Qayta urinib ko'ring.");
    }
  };

  if (!loggedIn) return (
    <div className={styles.loginPage}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.loginWrap}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Bella Vista" width={90} height={90}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 32px rgba(201,168,76,0.15)' }} />
          <div>
            <strong>Bella Vista</strong>
            <span>FINE DINING</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login'    ? styles.tabActive : ''}`} onClick={() => { setMode('login');    setError(''); setSuccess(''); }} id="tab-login">
            🔐 Kirish
          </button>
          <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }} id="tab-register">
            📝 Ro'yxat
          </button>
          <button className={`${styles.tab} ${mode === 'staff'    ? styles.tabActive : ''}`} onClick={() => { setMode('staff');    setError(''); setSuccess(''); }} id="tab-staff">
            🏢 Xodimlar
          </button>
        </div>

        <div className={styles.card}>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div className={styles.cardTop}>
                <h1>Xush kelibsiz!</h1>
                <p>Kirish uchun telefon raqam va parolingizni kiriting</p>
              </div>
              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.field}>
                  <label>Telefon raqam</label>
                  <input id="login-phone" type="tel" placeholder="+998 90 123 45 67"
                    value={loginForm.phone}
                    onChange={e => { setLoginForm({ ...loginForm, phone: e.target.value }); setError(''); }}
                    required />
                </div>
                <div className={styles.field}>
                  <label>Parol</label>
                  <input id="login-password" type="password" placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setError(''); }}
                    required />
                </div>
                {error   && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.successMsg}>{success}</p>}
                <button type="submit" className={styles.submitBtn} id="login-submit">Kirish →</button>
                <p className={styles.switchHint}>
                  Hisob yo'qmi?{' '}
                  <button type="button" className={styles.switchLink} onClick={() => { setMode('register'); setError(''); }}>
                    Ro'yxatdan o'ting
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <>
              <div className={styles.cardTop}>
                <h1>Ro'yxatdan o'tish</h1>
                <p>Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
              </div>
              <form className={styles.form} onSubmit={handleRegister}>
                <div className={styles.field}>
                  <label>Ism Familiya</label>
                  <input id="reg-name" type="text" placeholder="Ali Karimov"
                    value={regForm.name}
                    onChange={e => { setRegForm({ ...regForm, name: e.target.value }); setError(''); }}
                    required />
                </div>
                <div className={styles.field}>
                  <label>Telefon raqam</label>
                  <input id="reg-phone" type="tel" placeholder="+998 90 123 45 67"
                    value={regForm.phone}
                    onChange={e => { setRegForm({ ...regForm, phone: e.target.value }); setError(''); }}
                    required />
                </div>
                <div className={styles.field}>
                  <label>Parol (kamida 4 ta belgi)</label>
                  <input id="reg-password" type="password" placeholder="••••••••"
                    value={regForm.password}
                    onChange={e => { setRegForm({ ...regForm, password: e.target.value }); setError(''); }}
                    required />
                </div>
                <div className={styles.field}>
                  <label>Parolni tasdiqlang</label>
                  <input id="reg-confirm" type="password" placeholder="••••••••"
                    value={regForm.confirm}
                    onChange={e => { setRegForm({ ...regForm, confirm: e.target.value }); setError(''); }}
                    required />
                </div>
                {error   && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.successMsg}>{success}</p>}
                <button type="submit" className={styles.submitBtn} id="register-submit">
                  Ro'yxatdan o'tish →
                </button>
                <p className={styles.switchHint}>
                  Hisob bormi?{' '}
                  <button type="button" className={styles.switchLink} onClick={() => { setMode('login'); setError(''); }}>
                    Kirish
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── STAFF ── */}
          {mode === 'staff' && (
            <>
              <div className={styles.cardTop}>
                <h1>🏢 Xodimlar kirishi</h1>
                <p>Roluingizga mos maxsus kodni kiriting</p>
              </div>

              {/* Role cards */}
              <div className={styles.roleGrid}>
                {STAFF_ROLES.map(r => (
                  <button key={r.code} type="button"
                    className={styles.roleCard}
                    style={{ '--rc': r.color }}
                    onClick={() => { setStaffCode(r.code); setError(''); }}
                    id={`role-${r.label.toLowerCase()}`}
                  >
                    <span className={styles.roleIcon}>{r.icon}</span>
                    <span className={styles.roleLabel}>{r.label}</span>
                  </button>
                ))}
              </div>

              <form className={styles.form} onSubmit={handleStaff} style={{ marginTop: 0 }}>
                <div className={styles.field}>
                  <label>Maxsus kirish kodi</label>
                  <input id="staff-code" type="password" placeholder="••••••••••"
                    value={staffCode}
                    onChange={e => { setStaffCode(e.target.value); setError(''); }}
                    required />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitBtn} id="staff-submit">
                  Kirish →
                </button>
              </form>
            </>
          )}
        </div>

        <p className={styles.hint}>✦ &nbsp;Bella Vista — Milano, Italy &nbsp;·&nbsp; Est. 2015</p>
      </div>
    </div>
  );

  return (
    <>
      <Navbar onLogout={() => { localStorage.removeItem('bv_user'); setLoggedIn(false); }} />
      <main>
        <Hero />
        <Menu />
        <About />
        <Testimonials />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
