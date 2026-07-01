'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CODE = 'OSHPAZ2025';

function getOrders() {
  try { return JSON.parse(localStorage.getItem('bv_orders') || '[]'); } catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem('bv_orders', JSON.stringify(orders));
}

const STATUSES = ['Yangi', 'Tayyorlanmoqda', 'Tayyor'];
const STATUS_COLORS = {
  'Yangi':          { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'Tayyorlanmoqda': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  'Tayyor':         { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'Bekor':          { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
};

export default function OshpazPage() {
  const [auth,      setAuth]      = useState(false);
  const [code,      setCode]      = useState('');
  const [error,     setError]     = useState('');
  const [orders,    setOrders]    = useState([]);
  const [activeTab, setActiveTab] = useState('kitchen');
  const [filter,    setFilter]    = useState('Hammasi');
  const [timer,     setTimer]     = useState({});

  useEffect(() => {
    if (!auth) return;
    loadOrders();
    const iv = setInterval(loadOrders, 8000); // auto-refresh every 8s
    return () => clearInterval(iv);
  }, [auth]);

  // Live timers for each order
  useEffect(() => {
    const iv = setInterval(() => {
      setTimer(t => ({ ...t, _tick: Date.now() }));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  function loadOrders() {
    const all = getOrders().filter(o => o.status !== 'Yetkazildi' && o.status !== 'Bekor');
    setOrders(all.reverse());
  }

  function setStatus(id, status) {
    const updated = getOrders().map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o);
    saveOrders(updated);
    window.dispatchEvent(new Event('bv_new_order'));
    loadOrders();
  }

  function elapsed(createdAt) {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
    const m = Math.floor(diff / 60), s = diff % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const activeOrders = orders.filter(o => filter === 'Hammasi' || o.status === filter);

  if (!auth) return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>👨‍🍳</div>
        <h2>Oshxona Kabineti</h2>
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

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideRole}>
            <span className={styles.sideRoleIcon}>👨‍🍳</span>
            <div><strong>Oshpaz</strong><span>Oshxona</span></div>
          </div>
          <nav className={styles.sideNav}>
            {[
              { id: 'kitchen', icon: '🔥', label: 'Oshxona', badge: orders.filter(o => o.status === 'Yangi').length },
              { id: 'all',     icon: '📋', label: 'Barcha buyurtmalar' },
            ].map(t => (
              <button key={t.id} className={`${styles.navItem} ${activeTab === t.id ? styles.navActive : ''}`}
                onClick={() => setActiveTab(t.id)}>
                <span className={styles.navIcon}>{t.icon}</span>
                <span className={styles.navLabel}>{t.label}</span>
                {t.badge > 0 && <span className={styles.navBadge}>{t.badge}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.sideBottom}>
          <button className={styles.logoutBtn} onClick={() => { setAuth(false); setCode(''); }}>⏏ Chiqish</button>
        </div>
      </aside>

      <main className={styles.main}>
        {activeTab === 'kitchen' && (
          <>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>🔥 Oshxona</h1>
                <p className={styles.pageSubtitle}>Tayyorlanishi kerak bo'lgan buyurtmalar</p>
              </div>
              <div className={styles.filterRow}>
                {['Hammasi', ...STATUSES].map(f => (
                  <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                    onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            {activeOrders.length === 0 && (
              <div className={styles.empty}><span>🎉</span><p>Barcha buyurtmalar tayyor!</p></div>
            )}

            <div className={styles.kitchenGrid}>
              {activeOrders.map(o => {
                const sc = STATUS_COLORS[o.status] || {};
                const sec = Math.floor((Date.now() - new Date(o.createdAt)) / 1000);
                const urgent = sec > 600; // > 10 min
                return (
                  <div key={o.id} className={`${styles.kitchenCard} ${urgent ? styles.urgent : ''}`}
                    style={{ '--kc': sc.color || '#c9a84c' }}>
                    <div className={styles.kitchenTop}>
                      <span className={styles.kitchenId}>#{o.id?.slice(-5)}</span>
                      <span className={styles.kitchenTimer} style={{ color: urgent ? '#ef4444' : '#10b981' }}>
                        ⏱ {elapsed(o.createdAt)}
                      </span>
                    </div>
                    <div className={styles.kitchenMeta}>
                      <span className={styles.orderName}>{o.name}</span>
                      {o.table && <span className={styles.tableTag}>🪑 Stol {o.table}</span>}
                      {o.type === 'delivery' && <span className={styles.deliveryTag}>🛵 Yetkazish</span>}
                    </div>
                    <div className={styles.kitchenItems}>
                      {(o.items || []).map((item, i) => (
                        <div key={i} className={styles.kitchenItem}>
                          <span className={styles.kitchenItemQty}>×{item.qty}</span>
                          <span className={styles.kitchenItemName}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    {o.notes && <div className={styles.kitchenNotes}>📝 {o.notes}</div>}
                    <div className={styles.kitchenStatus}
                      style={{ background: sc.bg, color: sc.color }}>
                      {o.status}
                    </div>
                    <div className={styles.kitchenActions}>
                      {o.status === 'Yangi' && (
                        <button className={styles.kitchenBtn} style={{ background: '#3b82f6' }}
                          onClick={() => setStatus(o.id, 'Tayyorlanmoqda')}>
                          🔥 Boshlash
                        </button>
                      )}
                      {o.status === 'Tayyorlanmoqda' && (
                        <button className={styles.kitchenBtn} style={{ background: '#10b981' }}
                          onClick={() => setStatus(o.id, 'Tayyor')}>
                          ✅ Tayyor!
                        </button>
                      )}
                      {o.status === 'Tayyor' && (
                        <button className={styles.kitchenBtn} style={{ background: '#6b7280' }}
                          onClick={() => setStatus(o.id, 'Yetkazildi')}>
                          🚀 Berildi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'all' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>📋 Barcha buyurtmalar</h1>
            </div>
            <div className={styles.orderList}>
              {getOrders().slice().reverse().map(o => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <strong className={styles.orderId}>#{o.id?.slice(-5)}</strong>
                    <span className={styles.orderName}>{o.name}</span>
                    <span className={styles.statusBadge}
                      style={{ background: (STATUS_COLORS[o.status] || {}).bg, color: (STATUS_COLORS[o.status] || {}).color }}>
                      {o.status}
                    </span>
                  </div>
                  <div className={styles.orderItems}>
                    {(o.items || []).map((item, i) => (
                      <span key={i} className={styles.orderItem}>{item.name} ×{item.qty}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
