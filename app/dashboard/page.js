'use client';
import { useState } from 'react';
import styles from './page.module.css';


const ADMIN_CODE = 'ADMIN2025';

// ─── Data ────────────────────────────────────────────────────────────────────
const roles = [
  {
    id: 'xaridor',
    icon: '🛒',
    title: 'Xaridor',
    subtitle: 'Mijoz kabineti',
    color: '#e74c8b',
    gradient: 'linear-gradient(135deg,#e74c8b,#c0396f)',
    features: ["Menyu ko'rish", 'Buyurtma berish', 'Yetkazib berish', "To'lov (Click/Payme)", 'Buyurtma kuzatish', 'Baho / Sharh'],
  },
  {
    id: 'admin',
    icon: '🧑‍💼',
    title: 'Administrator',
    subtitle: 'Qabul va boshqaruv',
    color: '#f0882a',
    gradient: 'linear-gradient(135deg,#f0882a,#c96a10)',
    features: ['Buyurtma qabul', 'Stol boshqaruv', 'Kuryer tayinlash', 'SMS / Xabar yuborish', 'Mijoz CRUD', "Shikoyat ko'rish"],
  },
  {
    id: 'ofitsant',
    icon: '🍽️',
    title: 'Ofitsant',
    subtitle: 'Zal xizmati',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    features: ['Stol qabul', 'Buyurtma olish', 'Oshxonaga uzatish', 'Hisob chiqarish', "Mijozga xizmat ko'rsatish", 'Zal holati'],
  },
  {
    id: 'kassir',
    icon: '💰',
    title: 'Kassir',
    subtitle: "To'lov va hisobot",
    color: '#10b8a0',
    gradient: 'linear-gradient(135deg,#10b8a0,#0d9080)',
    features: ["To'lov qabul qilish", 'Chek chiqarish', 'Qaytarish / Bekor', 'Kunlik hisobot', "Chegirma qo'llash", "To'lov tarixi"],
  },
  {
    id: 'oshpaz',
    icon: '👨‍🍳',
    title: 'Oshpaz',
    subtitle: 'Oshxona kabineti',
    color: '#27ae60',
    gradient: 'linear-gradient(135deg,#27ae60,#1e8449)',
    features: ["Buyurtma ko'rish", 'Holat yangilash', 'Tayyorlanish belgisi', 'Mahsulot qoldiq', "Vazifa ro'yxati", 'Ish jadvali'],
  },
];

const modules = [
  { id: 'delivery', icon: '🚴', title: 'Yetkazib berish', gradient: 'linear-gradient(135deg,#7dab3c,#5e8a28)', features: ['Kuryer ilovasi', 'Xarita (manzil)', 'Vaqt hisoblash'] },
  { id: 'notify',   icon: '📢', title: 'Bildirishnoma',   gradient: 'linear-gradient(135deg,#c0392b,#96281b)', features: ['SMS / Push', 'Buyurtma holati', 'Aksiya xabarlari'] },
  { id: 'analytics',icon: '📊', title: 'Analitika',       gradient: 'linear-gradient(135deg,#3d566e,#2c3e50)', features: ['Sotuv grafigi', "Eng ko'p buyurtma", 'Mijoz statistika'] },
  { id: 'bonus',    icon: '🎁', title: 'Bonus tizimi',    gradient: 'linear-gradient(135deg,#c0392b,#922b21)', features: ["Ball to'plash", 'Chegirma kartasi', 'Promokod'] },
  { id: 'qrmenu',   icon: '📱', title: 'QR Menyu',        gradient: 'linear-gradient(135deg,#2c3e50,#1a252f)', features: ['QR-kod menyu', 'Foto / Narx', 'Kategoriya'] },
  { id: 'superadmin',icon:'🔐', title: 'Super Admin',     gradient: 'linear-gradient(135deg,#2e4057,#1c2833)', features: ["Ko'p restoran", 'Tarif rejalari', 'Platforma sozlama'] },
];

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, active, onClick }) {
  return (
    <div
      className={`${styles.roleCard} ${active ? styles.roleActive : ''}`}
      style={{ '--role-color': role.color, '--role-gradient': role.gradient }}
      onClick={onClick}
      id={`role-${role.id}`}
    >
      <div className={styles.roleHeader}>
        <span className={styles.roleIcon}>{role.icon}</span>
        <strong>{role.title}</strong>
        <span className={styles.roleSub}>{role.subtitle}</span>
      </div>
      <ul className={styles.roleFeatures}>
        {role.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod }) {
  return (
    <div className={styles.modCard} style={{ '--mod-gradient': mod.gradient }} id={`module-${mod.id}`}>
      <div className={styles.modHeader}>
        <span>{mod.icon}</span>
        <strong>{mod.title}</strong>
      </div>
      <ul className={styles.modFeatures}>
        {mod.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [activeRole, setActiveRole] = useState(null);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <a href="/" className={styles.backBtn}>← Saytga qaytish</a>
        <div className={styles.headerCenter}>
          <span className={styles.headerIcon}>✦</span>
          <div>
            <span className={styles.headerTitle}>Markaz Platformasi (SaaS)</span>
            <span className={styles.headerSub}>Bella Vista · Admin Panel</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout} id="logout-btn">Chiqish</button>
      </header>

      <main className={styles.main}>
        {/* Platform box */}
        <div className={styles.platformBox}>
          <span className={styles.platformIcon}>⚙️</span>
          <div>
            <strong>Markaz Platformasi (SaaS)</strong>
            <span>Barcha rollarni quyidan boshqaring</span>
          </div>
        </div>

        {/* Arrow */}
        <div className={styles.arrow}>↓</div>

        {/* Roles */}
        <div className={styles.rolesGrid}>
          {roles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              active={activeRole === role.id}
              onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span>Qo'shimcha modullar <em>(tavsiya etiladi)</em></span>
          <div className={styles.dividerLine} />
        </div>

        {/* Modules */}
        <div className={styles.modsGrid}>
          {modules.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
        </div>
      </main>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [form, setForm]       = useState({ name: '', phone: '', code: '' });
  const [error, setError]     = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.code.trim() === ADMIN_CODE) {
      setIsAdmin(true);
      setLoggedIn(true);
    } else if (form.name.trim() && form.phone.trim()) {
      window.location.href = '/';
    } else {
      setError('Ism va telefon raqamingizni kiriting yoki maxsus kod bilan kiring.');
    }
  };

  if (loggedIn && isAdmin) {
    return <AdminDashboard onLogout={() => { setLoggedIn(false); setIsAdmin(false); }} />;
  }

  return (
    <div className={styles.loginPage}>
      {/* Background decoration */}
      <div className={styles.loginBg}>
        <div className={styles.loginGlow1} />
        <div className={styles.loginGlow2} />
      </div>

      <div className={styles.loginWrap}>
        {/* Logo */}
        <div className={styles.loginLogo}>
          <span>✦</span>
          <div>
            <strong>Bella Vista</strong>
            <span>Fine Dining Platform</span>
          </div>
        </div>

        {/* Card */}
        <div className={styles.loginCard}>
          <div className={styles.loginCardTop}>
            <h1>Ro'yxatdan o'tish</h1>
            <p>Restoran nomi · Parol · Tel. raqam</p>
          </div>

          <form onSubmit={submit} className={styles.loginForm} id="dashboard-login-form">
            <div className={styles.field}>
              <label htmlFor="login-name">Restoran / Ism</label>
              <input
                id="login-name"
                name="name"
                type="text"
                placeholder="Bella Vista"
                value={form.name}
                onChange={handle}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-phone">Telefon raqam</label>
              <input
                id="login-phone"
                name="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={handle}
              />
            </div>

            <div className={styles.orRow}>
              <div className={styles.orLine} /><span>yoki admin kodi</span><div className={styles.orLine} />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-code">Maxsus kod <span className={styles.optional}>(admin uchun)</span></label>
              <input
                id="login-code"
                name="code"
                type="password"
                placeholder="••••••••"
                value={form.code}
                onChange={handle}
                autoComplete="off"
              />
            </div>

            {error && <div className={styles.errorMsg}>⚠️ {error}</div>}

            <button type="submit" id="login-submit" className={styles.loginBtn}>
              Kirish →
            </button>
          </form>

          <div className={styles.loginHint}>
            <span>💡</span>
            <p>Ism + telefon kiritsangiz — saytga, maxsus kod kiritsangiz — admin paneliga o'tasiz</p>
          </div>
        </div>

        <a href="/" className={styles.backLink}>← Asosiy saytga qaytish</a>
      </div>
    </div>
  );
}
