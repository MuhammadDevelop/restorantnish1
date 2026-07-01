'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CODE = 'BOSS2025';

function getOrders() { try { return JSON.parse(localStorage.getItem('bv_orders') || '[]'); } catch { return []; } }
function getUsers()  { try { return JSON.parse(localStorage.getItem('bv_users')  || '[]'); } catch { return []; } }
function getMenu()   { try { return JSON.parse(localStorage.getItem('bv_menu')   || '[]'); } catch { return []; } }

export default function BossPage() {
  const [auth,      setAuth]      = useState(false);
  const [code,      setCode]      = useState('');
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders,    setOrders]    = useState([]);
  const [users,     setUsers]     = useState([]);
  const [menu,      setMenu]      = useState([]);
  const [period,    setPeriod]    = useState('today');

  useEffect(() => {
    if (auth) { setOrders(getOrders()); setUsers(getUsers()); setMenu(getMenu()); }
  }, [auth]);

  if (!auth) return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>👑</div>
        <h2>Boss Kabineti</h2>
        <p>Maxsus kodni kiriting</p>
        <form onSubmit={e => { e.preventDefault(); if (code === CODE) setAuth(true); else setError("Noto'g'ri kod"); }}>
          <input type="password" placeholder="••••••••••" value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            className={styles.loginInput} required />
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginBtn}>Kirish →</button>
        </form>
        <a href="/" className={styles.backLink}>← Bosh sahifaga</a>
      </div>
    </div>
  );

  // ── Analytics ──────────────────────────────────
  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo  = new Date(now - 7  * 86400000);
  const monthAgo = new Date(now - 30 * 86400000);

  function inPeriod(dateStr) {
    const d = new Date(dateStr);
    if (period === 'today') return d.toDateString() === todayStr;
    if (period === 'week')  return d >= weekAgo;
    if (period === 'month') return d >= monthAgo;
    return true; // 'all'
  }

  const filteredOrders = orders.filter(o => o.createdAt && inPeriod(o.createdAt));
  const paidOrders     = filteredOrders.filter(o => o.payStatus === "To'langan");
  const revenue        = paidOrders.reduce((s, o) => s + parseFloat(o.finalTotal ?? o.total ?? 0), 0);
  const avgOrder       = paidOrders.length ? revenue / paidOrders.length : 0;
  const cancelledPct   = filteredOrders.length
    ? ((filteredOrders.filter(o => o.status === 'Bekor').length / filteredOrders.length) * 100).toFixed(1)
    : 0;

  // Top dishes
  const dishCount = {};
  paidOrders.forEach(o => (o.items || []).forEach(it => {
    dishCount[it.name] = (dishCount[it.name] || 0) + (it.qty || 1);
  }));
  const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Revenue by day (last 7 days)
  const dayRevenue = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toLocaleDateString('uz', { weekday: 'short' });
    dayRevenue[key] = 0;
  }
  paidOrders.forEach(o => {
    const d = new Date(o.createdAt || o.paidAt);
    if (d >= weekAgo) {
      const key = d.toLocaleDateString('uz', { weekday: 'short' });
      if (key in dayRevenue) dayRevenue[key] += parseFloat(o.finalTotal ?? o.total ?? 0);
    }
  });
  const maxRev = Math.max(...Object.values(dayRevenue), 1);

  const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'revenue',   icon: '💰', label: 'Daromad'   },
    { id: 'orders',    icon: '📋', label: 'Buyurtmalar'},
    { id: 'staff',     icon: '👥', label: 'Xodimlar'  },
    { id: 'menu',      icon: '🍽️', label: 'Menyu'     },
  ];

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideRole}>
            <span className={styles.sideRoleIcon}>👑</span>
            <div><strong>Boss</strong><span>Bosh boshqaruvchi</span></div>
          </div>
          <nav className={styles.sideNav}>
            {TABS.map(t => (
              <button key={t.id} className={`${styles.navItem} ${activeTab === t.id ? styles.navActive : ''}`}
                onClick={() => setActiveTab(t.id)} id={`boss-tab-${t.id}`}>
                <span className={styles.navIcon}>{t.icon}</span>
                <span className={styles.navLabel}>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.sideBottom}>
          <button className={styles.logoutBtn} onClick={() => { setAuth(false); setCode(''); }}>⏏ Chiqish</button>
        </div>
      </aside>

      <main className={styles.main}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>📊 Dashboard</h1>
                <p className={styles.pageSubtitle}>Umumiy ko'rinish</p>
              </div>
              <div className={styles.periodRow}>
                {[['today','Bugun'],['week','Hafta'],['month','Oy'],['all','Barchasi']].map(([v,l]) => (
                  <button key={v} className={`${styles.filterBtn} ${period === v ? styles.filterActive : ''}`}
                    onClick={() => setPeriod(v)}>{l}</button>
                ))}
              </div>
            </div>

            <div className={styles.bossStats}>
              {[
                { icon: '💰', label: 'Daromad',       value: `$${revenue.toFixed(2)}`,         color: '#c9a84c' },
                { icon: '📋', label: 'Buyurtmalar',   value: filteredOrders.length,             color: '#3b82f6' },
                { icon: '✅', label: "To'langan",     value: paidOrders.length,                 color: '#10b981' },
                { icon: '📈', label: "O'rtacha chek", value: `$${avgOrder.toFixed(2)}`,         color: '#a855f7' },
                { icon: '❌', label: 'Bekor %',       value: `${cancelledPct}%`,                color: '#ef4444' },
                { icon: '👤', label: 'Mijozlar',      value: users.length,                      color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className={styles.bossStatCard} style={{ '--bc': s.color }}>
                  <span className={styles.bossStatIcon}>{s.icon}</span>
                  <div className={styles.bossStatValue}>{s.value}</div>
                  <div className={styles.bossStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className={styles.chartCard}>
              <h3>📅 Haftalik daromad</h3>
              <div className={styles.barChart}>
                {Object.entries(dayRevenue).map(([day, val]) => (
                  <div key={day} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <div className={styles.bar} style={{ height: `${(val / maxRev) * 100}%` }}>
                        {val > 0 && <span className={styles.barVal}>${val.toFixed(0)}</span>}
                      </div>
                    </div>
                    <span className={styles.barLabel}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top dishes */}
            <div className={styles.topCard}>
              <h3>🏆 Top taomlar</h3>
              {topDishes.length === 0 && <p className={styles.empty2}>Ma'lumot yo'q</p>}
              {topDishes.map(([name, cnt], i) => (
                <div key={name} className={styles.topRow}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <span className={styles.topName}>{name}</span>
                  <div className={styles.topBar}>
                    <div className={styles.topBarFill} style={{ width: `${(cnt / (topDishes[0]?.[1] || 1)) * 100}%` }} />
                  </div>
                  <span className={styles.topCount}>{cnt} ta</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── REVENUE ── */}
        {activeTab === 'revenue' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>💰 Daromad / Xarajat</h1>
            </div>
            <div className={styles.revenueTable}>
              <div className={styles.tableHead}>
                <span>ID</span><span>Mijoz</span><span>Summa</span><span>Usul</span><span>Vaqt</span>
              </div>
              {orders.filter(o => o.payStatus === "To'langan").slice().reverse().map(o => (
                <div key={o.id} className={styles.tableRow}>
                  <span className={styles.tableId}>#{o.id?.slice(-5)}</span>
                  <span>{o.name}</span>
                  <span className={styles.totalCell}>${o.finalTotal ?? o.total}</span>
                  <span className={styles.methodBadge}>{o.payMethod || 'Naqd'}</span>
                  <span className={styles.timeCell}>{o.paidAt ? new Date(o.paidAt).toLocaleString('uz') : '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>📋 Barcha buyurtmalar</h1>
            </div>
            <div className={styles.orderList}>
              {orders.slice().reverse().map(o => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <strong className={styles.orderId}>#{o.id?.slice(-5)}</strong>
                    <span className={styles.orderName}>{o.name}</span>
                    <span className={styles.orderPhone}>{o.phone}</span>
                    <span className={styles.statusBadge}>{o.status}</span>
                    <span className={`${styles.statusBadge} ${o.payStatus === "To'langan" ? styles.paidBadge : styles.unpaidBadge}`}>
                      {o.payStatus || 'Kutmoqda'}
                    </span>
                    <span className={styles.totalCell}>${o.total}</span>
                  </div>
                  <div className={styles.orderItems}>
                    {(o.items || []).map((it, i) => <span key={i} className={styles.orderItem}>{it.name} ×{it.qty}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STAFF ── */}
        {activeTab === 'staff' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>👥 Xodimlar</h1>
            </div>
            <div className={styles.staffGrid}>
              {[
                { role: 'Administrator', icon: '👨‍💼', code: 'ADMIN2025',  route: '/admin',  color: '#c9a84c', desc: 'Buyurtma qabul, Stol, Kuryer' },
                { role: 'Kassir',        icon: '💰',  code: 'KASSIR2025', route: '/kassir', color: '#3b82f6', desc: "To'lov, Chek, Hisobot" },
                { role: 'Oshpaz',        icon: '👨‍🍳', code: 'OSHPAZ2025', route: '/oshpaz', color: '#10b981', desc: 'Oshxona, Holat yangilash' },
                { role: 'Boss',          icon: '👑',  code: 'BOSS2025',   route: '/boss',   color: '#a855f7', desc: 'Statistika, Boshqaruv' },
              ].map(s => (
                <div key={s.role} className={styles.staffCard} style={{ '--sc': s.color }}>
                  <span className={styles.staffIcon}>{s.icon}</span>
                  <h4>{s.role}</h4>
                  <p>{s.desc}</p>
                  <div className={styles.staffCode}>Kirish kodi: <strong>{s.code}</strong></div>
                  <a href={s.route} className={styles.staffLink}>Panalga o'tish →</a>
                </div>
              ))}
            </div>
            <div className={styles.usersSection}>
              <h3>👤 Ro'yxatdagi mijozlar ({users.length})</h3>
              <div className={styles.historyTable}>
                <div className={styles.tableHead}>
                  <span>Ism</span><span>Telefon</span><span>Ro'yxat sanasi</span>
                </div>
                {users.map((u, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span>{u.name}</span>
                    <span>{u.phone}</span>
                    <span className={styles.timeCell}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz') : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── MENU ── */}
        {activeTab === 'menu' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>🍽️ Menyu CRUD</h1>
              <a href="/admin" className={styles.adminLink}>⚙️ Admin panelda tahrirlash →</a>
            </div>
            <div className={styles.menuGrid}>
              {menu.map((item, i) => (
                <div key={i} className={styles.menuCard}>
                  <div className={styles.menuInfo}>
                    <h4>{item.name}</h4>
                    <span className={styles.menuCat}>{item.category}</span>
                  </div>
                  <div className={styles.menuPrice}>${item.price}</div>
                  <span className={item.available !== false ? styles.availOn : styles.availOff}>
                    {item.available !== false ? '✅ Mavjud' : '❌ Mavjud emas'}
                  </span>
                </div>
              ))}
              {menu.length === 0 && <p className={styles.empty2}>Menyu bo'sh. Admin paneldan qo'shing.</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
