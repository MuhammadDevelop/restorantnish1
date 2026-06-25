'use client';
import { useState } from 'react';
import styles from './page.module.css';

const ADMIN_CODE = 'ADMIN2025';

// ── Fake data ────────────────────────────────────────────────────────────────
const initialOrders = [
  { id: 5821, customer: 'Ali Karimov',    phone: '+998901234567', items: 'Truffle Carbonara ×2, Lobster Bisque ×1', total: 104, status: 'new',      time: '10:32', type: 'delivery', address: 'Chilonzor 14-uy' },
  { id: 5820, customer: 'Kamol Toshev',   phone: '+998911112233', items: 'Glazed Salmon ×1, Crème Brûlée ×2',       total:  76, status: 'cooking',  time: '10:18', type: 'dine-in',  address: 'Stol №4' },
  { id: 5819, customer: 'Nilufar Xasanova',phone:'+998931239876', items: 'Burrata & Prosciutto ×2',                 total:  44, status: 'ready',    time: '10:05', type: 'delivery', address: 'Yunusobod 22' },
  { id: 5818, customer: 'Jasur Mirzayev', phone: '+998907654321', items: 'Lava Chocolate Cake ×3',                  total:  54, status: 'delivered',time: '09:48', type: 'delivery', address: 'Mirzo Ulugbek 7' },
  { id: 5817, customer: 'Sarvinoz Raximova',phone:'+998951234567',items: 'Truffle Carbonara ×1, Glazed Salmon ×1',  total:  82, status: 'delivered',time: '09:30', type: 'dine-in',  address: 'Stol №2' },
  { id: 5816, customer: 'Bobur Usmonov',  phone: '+998901112233', items: 'Lobster Bisque ×2, Crème Brûlée ×1',      total:  72, status: 'cancelled',time: '09:10', type: 'delivery', address: 'Shayxontohur 5' },
];

const menuItems = [
  { id: 1, name: 'Truffle Carbonara',    category: 'Main',    price: 38, status: 'active',   sold: 142 },
  { id: 2, name: 'Glazed Salmon',        category: 'Main',    price: 44, status: 'active',   sold: 98  },
  { id: 3, name: 'Lava Chocolate Cake',  category: 'Dessert', price: 18, status: 'active',   sold: 210 },
  { id: 4, name: 'Burrata & Prosciutto', category: 'Starter', price: 22, status: 'active',   sold: 76  },
  { id: 5, name: 'Lobster Bisque',       category: 'Starter', price: 28, status: 'inactive', sold: 54  },
  { id: 6, name: 'Crème Brûlée',         category: 'Dessert', price: 16, status: 'active',   sold: 189 },
];

const staff = [
  { id: 1, name: 'Marco Rossi',     role: 'Bosh oshpaz',  status: 'online',  shifts: 'Du-Ju 09:00-18:00' },
  { id: 2, name: 'Aziz Toshmatov',  role: 'Ofitsant',     status: 'online',  shifts: 'Du-Sha 11:00-22:00' },
  { id: 3, name: 'Lola Yusupova',   role: 'Kassir',       status: 'online',  shifts: 'Du-Ju 10:00-20:00' },
  { id: 4, name: 'Bekzod Nazarov',  role: 'Kuryer',       status: 'offline', shifts: 'Sha-Ya 12:00-22:00' },
  { id: 5, name: 'Malika Hasanova', role: 'Administrator',status: 'online',  shifts: 'Du-Ju 09:00-18:00' },
];

const STATUS_CONFIG = {
  new:       { label: "Yangi",         color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  cooking:   { label: "Tayyorlanmoqda",color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ready:     { label: "Tayyor",        color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  delivered: { label: "Yetkazildi",   color: '#6b7280', bg: 'rgba(107,114,128,0.1)'  },
  cancelled: { label: "Bekor",         color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

const NEXT_STATUS = { new: 'cooking', cooking: 'ready', ready: 'delivered' };

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={styles.statCard} style={{ '--sc': color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [err,  setErr]  = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (code === ADMIN_CODE) onLogin();
    else setErr(true);
  };
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>⚙️</div>
        <h2>Admin Panel</h2>
        <p>Kirish uchun maxsus kodni kiriting</p>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="Admin kodi..."
            value={code}
            onChange={e => { setCode(e.target.value); setErr(false); }}
            className={err ? styles.inputErr : ''}
            id="admin-code-input"
            autoFocus
          />
          {err && <span className={styles.errMsg}>❌ Noto'g'ri kod</span>}
          <button type="submit" id="admin-login-btn">Kirish →</button>
        </form>
        <a href="/" className={styles.loginBack}>← Saytga qaytish</a>
      </div>
    </div>
  );
}

// ── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab]           = useState('dashboard');
  const [orders, setOrders]     = useState(initialOrders);
  const [filterStatus, setFilter] = useState('all');

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const stats = {
    today: orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + o.total, 0),
    newOrders: orders.filter(o => o.status === 'new').length,
    cooking: orders.filter(o => o.status === 'cooking').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const advanceOrder = (id) => {
    setOrders(prev => prev.map(o =>
      o.id === id && NEXT_STATUS[o.status] ? { ...o, status: NEXT_STATUS[o.status] } : o
    ));
  };

  const cancelOrder = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  };

  const TABS = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard'      },
    { key: 'orders',    icon: '🧾', label: 'Buyurtmalar'    },
    { key: 'menu',      icon: '🍽️', label: 'Menyu'          },
    { key: 'staff',     icon: '👥', label: 'Xodimlar'       },
    { key: 'analytics', icon: '📈', label: 'Analitika'      },
  ];

  return (
    <div className={styles.admin}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>✦</span>
          <div>
            <strong>Bella Vista</strong>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.navItem} ${tab === t.key ? styles.navActive : ''}`}
              onClick={() => setTab(t.key)}
              id={`admin-tab-${t.key}`}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <a href="/delivery" className={styles.sideLink}>🛵 Yetkazib berish</a>
          <a href="/" className={styles.sideLink}>🏠 Saytga qaytish</a>
          <button className={styles.logoutSide} onClick={() => setLoggedIn(false)}>Chiqish</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>📊 Dashboard</h1>
            <div className={styles.statsGrid}>
              <StatCard icon="💰" label="Bugungi daromad"   value={`$${stats.today}`}     sub="+12% o'tgan haftadan" color="#c9a84c" />
              <StatCard icon="🆕" label="Yangi buyurtmalar" value={stats.newOrders}        sub="Kutilmoqda"            color="#3b82f6" />
              <StatCard icon="👨‍🍳" label="Tayyorlanmoqda"   value={stats.cooking}          sub="Oshxonada"            color="#f59e0b" />
              <StatCard icon="✅" label="Yetkazildi"         value={stats.delivered}        sub="Bugun"                color="#10b981" />
            </div>

            <div className={styles.dashRow}>
              <div className={styles.dashCard}>
                <h3>🔥 So'nggi buyurtmalar</h3>
                {orders.slice(0, 4).map(o => {
                  const s = STATUS_CONFIG[o.status];
                  return (
                    <div key={o.id} className={styles.recentOrder}>
                      <div>
                        <strong>#{o.id}</strong> — {o.customer}
                        <span className={styles.orderType}>{o.type === 'delivery' ? '🛵' : '🍽️'}</span>
                      </div>
                      <div style={{ display:'flex', gap: 12, alignItems: 'center' }}>
                        <span className={styles.badge} style={{ color: s.color, background: s.bg }}>{s.label}</span>
                        <span className={styles.orderAmt}>${o.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.dashCard}>
                <h3>🏆 Eng ko'p sotilgan</h3>
                {menuItems.sort((a,b) => b.sold - a.sold).slice(0,5).map(m => (
                  <div key={m.id} className={styles.topItem}>
                    <span>{m.name}</span>
                    <div className={styles.topBar}>
                      <div className={styles.topFill} style={{ width: `${Math.round(m.sold/210*100)}%` }} />
                    </div>
                    <span className={styles.topSold}>{m.sold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>🧾 Buyurtmalar</h1>
            <div className={styles.filterRow}>
              {['all','new','cooking','ready','delivered','cancelled'].map(s => (
                <button key={s}
                  className={`${styles.filterBtn} ${filterStatus === s ? styles.filterActive : ''}`}
                  onClick={() => setFilter(s)} id={`filter-${s}`}>
                  {s === 'all' ? 'Barchasi' : STATUS_CONFIG[s]?.label}
                  <span className={styles.filterCount}>
                    {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.ordersTable}>
              <div className={styles.tableHead}>
                <span>№</span><span>Mijoz</span><span>Buyurtma</span><span>Tur</span><span>Jami</span><span>Holat</span><span>Amal</span>
              </div>
              {filteredOrders.map(o => {
                const s = STATUS_CONFIG[o.status];
                return (
                  <div key={o.id} className={styles.tableRow} id={`order-row-${o.id}`}>
                    <span className={styles.orderId}>#{o.id}</span>
                    <div>
                      <strong>{o.customer}</strong>
                      <span className={styles.orderPhone}>{o.phone}</span>
                      <span className={styles.orderAddr}>📍 {o.address}</span>
                    </div>
                    <span className={styles.orderItems}>{o.items}</span>
                    <span className={styles.orderTypeBadge}>{o.type === 'delivery' ? '🛵 Yetkazish' : '🍽️ Zal'}</span>
                    <span className={styles.orderTotal}>${o.total}</span>
                    <span className={styles.badge} style={{ color: s.color, background: s.bg }}>{s.label}</span>
                    <div className={styles.actionBtns}>
                      {NEXT_STATUS[o.status] && (
                        <button className={styles.advBtn} onClick={() => advanceOrder(o.id)} id={`advance-${o.id}`}>
                          {o.status === 'new' ? '👨‍🍳 Tayyorlash' : o.status === 'cooking' ? '📦 Tayyor' : '✅ Yetkazildi'}
                        </button>
                      )}
                      {['new','cooking'].includes(o.status) && (
                        <button className={styles.cancelBtn} onClick={() => cancelOrder(o.id)} id={`cancel-${o.id}`}>✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {tab === 'menu' && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h1 className={styles.pageTitle}>🍽️ Menyu boshqaruv</h1>
              <button className={styles.addItemBtn} id="add-menu-item">+ Yangi taom</button>
            </div>
            <div className={styles.menuTable}>
              <div className={styles.menuHead}>
                <span>Taom</span><span>Kategoriya</span><span>Narx</span><span>Sotilgan</span><span>Holat</span>
              </div>
              {menuItems.map(m => (
                <div key={m.id} className={styles.menuRow} id={`menu-row-${m.id}`}>
                  <strong>{m.name}</strong>
                  <span className={styles.menuCatBadge}>{m.category}</span>
                  <span className={styles.menuPriceTd}>${m.price}</span>
                  <span className={styles.menuSold}>{m.sold} ta</span>
                  <span className={`${styles.menuStatus} ${m.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {m.status === 'active' ? '✅ Faol' : '⏸ Faol emas'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STAFF ── */}
        {tab === 'staff' && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h1 className={styles.pageTitle}>👥 Xodimlar</h1>
              <button className={styles.addItemBtn} id="add-staff">+ Xodim qo'shish</button>
            </div>
            <div className={styles.staffGrid}>
              {staff.map(s => (
                <div key={s.id} className={styles.staffCard} id={`staff-${s.id}`}>
                  <div className={styles.staffAvatar}>
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.staffInfo}>
                    <strong>{s.name}</strong>
                    <span className={styles.staffRole}>{s.role}</span>
                    <span className={styles.staffShift}>🕐 {s.shifts}</span>
                  </div>
                  <span className={`${styles.onlineDot} ${s.status === 'online' ? styles.dotOnline : styles.dotOffline}`}>
                    {s.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>📈 Analitika</h1>
            <div className={styles.analyticsGrid}>
              {[
                { label: 'Oy davomida daromad',    value: '$12,480', change: '+18%', up: true  },
                { label: 'Jami buyurtmalar',        value: '342',     change: '+24%', up: true  },
                { label: "O'rtacha chek",            value: '$36.5',   change: '+5%',  up: true  },
                { label: 'Bekor qilingan',          value: '12',      change: '-3%',  up: false },
                { label: 'Yetkazib berish buyurtma',value: '198',     change: '+31%', up: true  },
                { label: 'Zal buyurtmalari',        value: '144',     change: '+11%', up: true  },
              ].map((a, i) => (
                <div key={i} className={styles.analyticsCard}>
                  <span className={styles.analyticsLabel}>{a.label}</span>
                  <span className={styles.analyticsValue}>{a.value}</span>
                  <span className={`${styles.analyticsChange} ${a.up ? styles.changeUp : styles.changeDown}`}>
                    {a.up ? '↑' : '↓'} {a.change}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.chartCard}>
              <h3>Haftalik sotuv grafigi</h3>
              <div className={styles.barChart}>
                {[
                  { day: 'Du',  val: 65 },
                  { day: 'Se',  val: 82 },
                  { day: 'Ch',  val: 74 },
                  { day: 'Pa',  val: 91 },
                  { day: 'Ju',  val: 100},
                  { day: 'Sha', val: 88 },
                  { day: 'Ya',  val: 70 },
                ].map((b, i) => (
                  <div key={i} className={styles.barWrap}>
                    <div className={styles.barFill} style={{ height: `${b.val}%` }}>
                      <span className={styles.barVal}>${Math.round(b.val * 18)}</span>
                    </div>
                    <span className={styles.barDay}>{b.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
