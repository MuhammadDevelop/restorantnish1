'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const CODE = 'KASSIR2025';

function getOrders() {
  try { return JSON.parse(localStorage.getItem('bv_orders') || '[]'); } catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem('bv_orders', JSON.stringify(orders));
}

const STATUS_COLORS = {
  'Yangi':       '#f59e0b',
  'Tayyorlanmoqda': '#3b82f6',
  'Tayyor':      '#10b981',
  'Yetkazildi':  '#6b7280',
  'Bekor':       '#ef4444',
};

export default function KassirPage() {
  const [auth,       setAuth]       = useState(false);
  const [code,       setCode]       = useState('');
  const [error,      setError]      = useState('');
  const [orders,     setOrders]     = useState([]);
  const [filter,     setFilter]     = useState('Hammasi');
  const [activeTab,  setActiveTab]  = useState('orders');
  const [payModal,   setPayModal]   = useState(null);
  const [discount,   setDiscount]   = useState('');
  const [payMethod,  setPayMethod]  = useState('Naqd');
  const [receiptItem,setReceiptItem]= useState(null);
  const [stats,      setStats]      = useState({ today: 0, week: 0, total: 0, cash: 0, card: 0 });

  useEffect(() => {
    if (auth) loadOrders();
  }, [auth]);

  function loadOrders() {
    const all = getOrders();
    setOrders(all.reverse());
    // Calculate stats
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = new Date(now - 7 * 86400000);
    let today = 0, week = 0, total = 0, cash = 0, card = 0;
    all.forEach(o => {
      if (o.payStatus === 'To\'langan') {
        const amt = parseFloat(o.total || 0);
        total += amt;
        if (new Date(o.createdAt).toDateString() === todayStr) today += amt;
        if (new Date(o.createdAt) >= weekAgo) week += amt;
        if (o.payMethod === 'Naqd') cash += amt;
        else card += amt;
      }
    });
    setStats({ today, week, total, cash, card });
  }

  function handlePay(order) {
    setPayModal(order);
    setDiscount('');
    setPayMethod('Naqd');
  }

  function confirmPay() {
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, parseFloat(payModal.total || 0) - disc);
    const updated = getOrders().map(o => o.id === payModal.id
      ? { ...o, payStatus: "To'langan", payMethod, discount: disc, finalTotal: total, paidAt: new Date().toISOString() }
      : o
    );
    saveOrders(updated);
    setReceiptItem({ ...payModal, payMethod, discount: disc, finalTotal: total });
    setPayModal(null);
    loadOrders();
  }

  function cancelOrder(id) {
    const updated = getOrders().map(o => o.id === id ? { ...o, status: 'Bekor' } : o);
    saveOrders(updated);
    loadOrders();
  }

  const filtered = filter === 'Hammasi' ? orders : orders.filter(o => o.status === filter);
  const unpaid   = orders.filter(o => o.payStatus !== "To'langan" && o.status !== 'Bekor');

  if (!auth) return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>💰</div>
        <h2>Kassir Kabineti</h2>
        <p>Maxsus kodni kiriting</p>
        <form onSubmit={e => { e.preventDefault(); if (code === CODE) { setAuth(true); } else setError("Noto'g'ri kod"); }}>
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
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideRole}>
            <span className={styles.sideRoleIcon}>💰</span>
            <div>
              <strong>Kassir</strong>
              <span>Kabinet</span>
            </div>
          </div>
          <nav className={styles.sideNav}>
            {[
              { id: 'orders',  icon: '📋', label: "Buyurtmalar", badge: unpaid.length },
              { id: 'history', icon: '📜', label: "To'lov tarixi" },
              { id: 'stats',   icon: '📊', label: 'Statistika' },
            ].map(t => (
              <button key={t.id} className={`${styles.navItem} ${activeTab === t.id ? styles.navActive : ''}`}
                onClick={() => setActiveTab(t.id)} id={`tab-${t.id}`}>
                <span className={styles.navIcon}>{t.icon}</span>
                <span className={styles.navLabel}>{t.label}</span>
                {t.badge > 0 && <span className={styles.navBadge}>{t.badge}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.sideBottom}>
          <button className={styles.logoutBtn} onClick={() => { setAuth(false); setCode(''); }}>
            ⏏ Chiqish
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>

        {/* ── ORDERS tab ── */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>📋 Buyurtmalar</h1>
                <p className={styles.pageSubtitle}>To'lov kutayotgan buyurtmalar</p>
              </div>
              <div className={styles.filterRow}>
                {['Hammasi', 'Yangi', 'Tayyorlanmoqda', 'Tayyor'].map(f => (
                  <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                    onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div className={styles.orderList}>
              {filtered.length === 0 && (
                <div className={styles.empty}>
                  <span>📭</span>
                  <p>Buyurtma yo'q</p>
                </div>
              )}
              {filtered.map(o => (
                <div key={o.id} className={`${styles.orderCard} ${o.payStatus === "To'langan" ? styles.paid : ''}`}>
                  <div className={styles.orderHeader}>
                    <div>
                      <strong className={styles.orderId}>#{o.id?.slice(-5)}</strong>
                      <span className={styles.orderName}>{o.name}</span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span className={styles.statusBadge} style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                        {o.status}
                      </span>
                      {o.payStatus === "To'langan"
                        ? <span className={styles.paidBadge}>✅ To'langan</span>
                        : <span className={styles.unpaidBadge}>⏳ Kutmoqda</span>}
                    </div>
                  </div>
                  <div className={styles.orderItems}>
                    {(o.items || []).map((item, i) => (
                      <span key={i} className={styles.orderItem}>{item.name} ×{item.qty}</span>
                    ))}
                  </div>
                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span>Jami:</span>
                      <strong>${o.total || '0'}</strong>
                    </div>
                    <div className={styles.orderActions}>
                      {o.payStatus !== "To'langan" && o.status !== 'Bekor' && (
                        <>
                          <button className={styles.payBtn} onClick={() => handlePay(o)} id={`pay-${o.id}`}>
                            💳 To'lov
                          </button>
                          <button className={styles.cancelBtn} onClick={() => cancelOrder(o.id)}>
                            ✕ Bekor
                          </button>
                        </>
                      )}
                      {o.payStatus === "To'langan" && (
                        <button className={styles.receiptBtn} onClick={() => setReceiptItem(o)}>
                          🧾 Chek
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── HISTORY tab ── */}
        {activeTab === 'history' && (
          <>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>📜 To'lov tarixi</h1>
                <p className={styles.pageSubtitle}>Barcha to'langan buyurtmalar</p>
              </div>
            </div>
            <div className={styles.historyTable}>
              <div className={styles.tableHead}>
                <span>ID</span><span>Mijoz</span><span>Usul</span><span>Chegirma</span><span>Summa</span><span>Vaqt</span>
              </div>
              {orders.filter(o => o.payStatus === "To'langan").map(o => (
                <div key={o.id} className={styles.tableRow}>
                  <span className={styles.tableId}>#{o.id?.slice(-5)}</span>
                  <span>{o.name}</span>
                  <span className={styles.methodBadge}>{o.payMethod || 'Naqd'}</span>
                  <span className={styles.discountCell}>{o.discount ? `-$${o.discount}` : '—'}</span>
                  <span className={styles.totalCell}>${o.finalTotal ?? o.total}</span>
                  <span className={styles.timeCell}>{o.paidAt ? new Date(o.paidAt).toLocaleString('uz') : '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STATS tab ── */}
        {activeTab === 'stats' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>📊 Statistika</h1>
            </div>
            <div className={styles.statsGrid}>
              {[
                { label: 'Bugungi tushum', value: `$${stats.today.toFixed(2)}`, icon: '📅', color: '#c9a84c' },
                { label: 'Haftalik tushum', value: `$${stats.week.toFixed(2)}`, icon: '📆', color: '#3b82f6' },
                { label: "Jami to'lov",    value: `$${stats.total.toFixed(2)}`, icon: '💰', color: '#10b981' },
                { label: 'Naqd',           value: `$${stats.cash.toFixed(2)}`,  icon: '💵', color: '#f59e0b' },
                { label: 'Karta',          value: `$${stats.card.toFixed(2)}`,  icon: '💳', color: '#a855f7' },
                { label: "To'langan",      value: orders.filter(o => o.payStatus === "To'langan").length, icon: '✅', color: '#10b981' },
              ].map((s, i) => (
                <div key={i} className={styles.statCard} style={{ '--sc': s.color }}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Pay Modal ── */}
      {payModal && (
        <div className={styles.modalBackdrop} onClick={() => setPayModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>💳 To'lovni tasdiqlash</h3>
              <button className={styles.modalClose} onClick={() => setPayModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalInfo}>
                <span>Buyurtma:</span><strong>#{payModal.id?.slice(-5)} — {payModal.name}</strong>
                <span>Jami:</span><strong>${payModal.total}</strong>
              </div>
              <div className={styles.modalField}>
                <label>Chegirma ($)</label>
                <input type="number" min="0" placeholder="0"
                  value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
              <div className={styles.modalField}>
                <label>To'lov usuli</label>
                <div className={styles.payMethods}>
                  {['Naqd', 'Karta', 'Click', 'Payme'].map(m => (
                    <button key={m} className={`${styles.payMethod} ${payMethod === m ? styles.payMethodActive : ''}`}
                      onClick={() => setPayMethod(m)}>{m}</button>
                  ))}
                </div>
              </div>
              <div className={styles.modalTotal}>
                Yakuniy: <strong>${Math.max(0, parseFloat(payModal.total || 0) - (parseFloat(discount) || 0)).toFixed(2)}</strong>
              </div>
              <button className={styles.confirmBtn} onClick={confirmPay} id="confirm-pay">
                ✅ To'lovni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {receiptItem && (
        <div className={styles.modalBackdrop} onClick={() => setReceiptItem(null)}>
          <div className={styles.receipt} onClick={e => e.stopPropagation()}>
            <div className={styles.receiptHeader}>
              <h3>🧾 BELLA VISTA</h3>
              <p>Fine Dining Restaurant</p>
              <div className={styles.receiptDivider} />
            </div>
            <div className={styles.receiptRows}>
              <div className={styles.receiptRow}><span>Buyurtma:</span><span>#{receiptItem.id?.slice(-5)}</span></div>
              <div className={styles.receiptRow}><span>Mijoz:</span><span>{receiptItem.name}</span></div>
              <div className={styles.receiptRow}><span>Telefon:</span><span>{receiptItem.phone}</span></div>
              <div className={styles.receiptDivider} />
              {(receiptItem.items || []).map((item, i) => (
                <div key={i} className={styles.receiptRow}>
                  <span>{item.name} ×{item.qty}</span>
                  <span>${(parseFloat(item.price || 0) * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className={styles.receiptDivider} />
              {receiptItem.discount > 0 && <div className={styles.receiptRow}><span>Chegirma:</span><span>-${receiptItem.discount}</span></div>}
              <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
                <span>JAMI:</span><span>${receiptItem.finalTotal ?? receiptItem.total}</span>
              </div>
              <div className={styles.receiptRow}><span>To'lov usuli:</span><span>{receiptItem.payMethod || 'Naqd'}</span></div>
            </div>
            <div className={styles.receiptFooter}>
              <p>Tashrifingiz uchun rahmat! ✦</p>
              <button className={styles.receiptClose} onClick={() => setReceiptItem(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
