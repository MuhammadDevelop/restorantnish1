'use client';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import styles from './login.module.css';

const ADMIN_CODE = 'ADMIN2025';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [form, setForm]         = useState({ name: '', phone: '', code: '' });
  const [error, setError]       = useState('');
  const [mode, setMode]         = useState('user'); // 'user' | 'admin'

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

  if (!loggedIn) return (
    <div className={styles.loginPage}>
      {/* Background glow */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.loginWrap}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <div>
            <strong>Bella Vista</strong>
            <span>FINE DINING</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'user' ? styles.tabActive : ''}`}
            onClick={() => { setMode('user'); setError(''); }}
            id="tab-user"
          >
            👤 Mehmon kirishi
          </button>
          <button
            className={`${styles.tab} ${mode === 'admin' ? styles.tabActive : ''}`}
            onClick={() => { setMode('admin'); setError(''); }}
            id="tab-admin"
          >
            ⚙️ Admin kirishi
          </button>
        </div>

        <div className={styles.card}>
          {mode === 'user' ? (
            <>
              <div className={styles.cardTop}>
                <h1>Xush kelibsiz!</h1>
                <p>Davom etish uchun ismingiz va raqamingizni kiriting</p>
              </div>
              <form
                className={styles.form}
                onSubmit={e => {
                  e.preventDefault();
                  if (!form.name.trim() || !form.phone.trim()) {
                    setError("Iltimos, ism va telefon raqamingizni kiriting.");
                    return;
                  }
                  localStorage.setItem('bv_user', JSON.stringify({ name: form.name, phone: form.phone }));
                  setLoggedIn(true);
                }}
              >
                <div className={styles.field}>
                  <label>Ism Familiya</label>
                  <input
                    id="login-name"
                    type="text"
                    placeholder="Ali Karimov"
                    value={form.name}
                    onChange={e => { setForm({ ...form, name: e.target.value }); setError(''); }}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Telefon raqam</label>
                  <input
                    id="login-phone"
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={form.phone}
                    onChange={e => { setForm({ ...form, phone: e.target.value }); setError(''); }}
                    required
                  />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitBtn} id="login-submit">
                  Kirish →
                </button>
              </form>
            </>
          ) : (
            <>
              <div className={styles.cardTop}>
                <h1>Admin Panel</h1>
                <p>Faqat vakolatli xodimlar uchun</p>
              </div>
              <form
                className={styles.form}
                onSubmit={e => {
                  e.preventDefault();
                  if (form.code.trim() === ADMIN_CODE) {
                    window.location.href = '/admin';
                  } else {
                    setError("Noto'g'ri kod. Qayta urinib ko'ring.");
                  }
                }}
              >
                <div className={styles.field}>
                  <label>Maxsus kirish kodi</label>
                  <input
                    id="admin-code"
                    type="password"
                    placeholder="••••••••••"
                    value={form.code}
                    onChange={e => { setForm({ ...form, code: e.target.value }); setError(''); }}
                    required
                  />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitBtn} id="admin-submit">
                  Admin sifatida kirish →
                </button>
              </form>
            </>
          )}
        </div>

        <p className={styles.hint}>
          ✦ &nbsp;Bella Vista — Milano, Italy &nbsp;·&nbsp; Est. 2015
        </p>
      </div>
    </div>
  );

  // ── Logged in — show main site ────────────────────────
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
