'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getOrders, updateOrderStatus, deleteOrder, formatTime, formatDate, STATUS_CONFIG } from '../lib/orderStore';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailable, CATEGORIES, TAGS, IMAGES } from '../lib/menuStore';
import styles from './page.module.css';

const ADMIN_CODE = 'ADMIN2025';

// ── Empty form template ───────────────────────────────────────────────────
const EMPTY_FORM = { name: '', category: 'Asosiy taom', price: '', desc: '', img: '/dish1.png', tag: '', time: '20 daq' };

// ── MenuTab ───────────────────────────────────────────────────────────────
function MenuTab() {
  const [items,      setItems]      = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saved,      setSaved]      = useState(false);
  const [filterCat,  setFilterCat]  = useState('Barchasi');

  useEffect(() => {
    setItems(getMenu());
    const refresh = () => setItems(getMenu());
    window.addEventListener('bv_menu_updated', refresh);
    return () => window.removeEventListener('bv_menu_updated', refresh);
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, desc: item.desc, img: item.img, tag: item.tag||'', time: item.time||'20 daq' });
    setEditId(item.id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); };

  const handleSave = (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price) || 0, tag: form.tag || null };
    if (editId) {
      setItems(updateMenuItem(editId, data));
    } else {
      setItems(addMenuItem(data));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    closeForm();
  };

  const handleDelete = (id) => {
    if (confirm('Bu taomni o\'chirishni tasdiqlaysizmi?')) {
      setItems(deleteMenuItem(id));
    }
  };

  const handleToggle = (id) => setItems(toggleAvailable(id));

  const cats = ['Barchasi', ...CATEGORIES];
  const filtered = filterCat === 'Barchasi' ? items : items.filter(i => i.category === filterCat);

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🍽️ Menyu boshqaruvi</h1>
        <button className={styles.addBtn} onClick={openAdd} id="add-menu-item">
          + Yangi taom qo'shish
        </button>
      </div>

      {saved && <div className={styles.savedMsg}>✅ Saqlandi!</div>}

      {/* Category filter */}
      <div className={styles.filterRow}>
        {cats.map(c => (
          <button key={c}
            className={`${styles.filterBtn} ${filterCat === c ? styles.filterActive : ''}`}
            onClick={() => setFilterCat(c)}>
            {c}
            <span className={styles.filterCount}>
              {c === 'Barchasi' ? items.length : items.filter(i => i.category === c).length}
            </span>
          </button>
        ))}
      </div>

      {/* Add / Edit form modal */}
      {showForm && (
        <div className={styles.modalBackdrop} onClick={closeForm}>
          <div className={styles.menuModal} onClick={e => e.stopPropagation()}>
            <div className={styles.menuModalHeader}>
              <h3>{editId ? '✏️ Taomni tahrirlash' : '+ Yangi taom qo\'shish'}</h3>
              <button onClick={closeForm} className={styles.menuModalClose}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.menuForm}>
              <div className={styles.menuFormRow}>
                <div className={styles.menuField}>
                  <label>Nomi *</label>
                  <input required placeholder="Masalan: Caesar Salad"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className={styles.menuField}>
                  <label>Narxi ($) *</label>
                  <input required type="number" min="1" placeholder="24"
                    value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
              </div>
              <div className={styles.menuFormRow}>
                <div className={styles.menuField}>
                  <label>Kategoriya</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.menuField}>
                  <label>Tayyorlanish vaqti</label>
                  <input placeholder="20 daq" value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>
              <div className={styles.menuField}>
                <label>Tavsif</label>
                <textarea rows={3} placeholder="Taom haqida qisqacha..."
                  value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
              </div>
              <div className={styles.menuFormRow}>
                <div className={styles.menuField}>
                  <label>Belgi (tag)</label>
                  <select value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}>
                    {TAGS.map(t => <option key={t} value={t}>{t || '— Belgi yo\'q —'}</option>)}
                  </select>
                </div>
                <div className={styles.menuField}>
                  <label>Rasm</label>
                  <select value={form.img} onChange={e => setForm({...form, img: e.target.value})}>
                    {IMAGES.map(img => <option key={img} value={img}>{img}</option>)}
                  </select>
                </div>
              </div>
              {/* Image preview */}
              <div className={styles.imgPreview}>
                <Image src={form.img} alt="preview" fill style={{ objectFit:'cover', borderRadius:'8px' }} />
              </div>
              <div className={styles.menuFormActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>Bekor qilish</button>
                <button type="submit" className={styles.advBtn} id="save-menu-item">
                  {editId ? '💾 Saqlash' : '+ Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu items grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🍽️</span>
          <p>Hali taomlar yo'q</p>
          <span className={styles.emptyHint}>Yuqoridagi "Yangi taom qo'shish" tugmasini bosing</span>
        </div>
      ) : (
        <div className={styles.menuGrid}>
          {filtered.map((item, idx) => (
            <div key={item.id} className={`${styles.menuItemCard} ${!item.available ? styles.unavailable : ''}`}
              style={{ animationDelay: `${idx * 0.05}s` }} id={`menu-item-${item.id}`}>
              <div className={styles.menuItemImg}>
                <Image src={item.img} alt={item.name} fill style={{ objectFit:'cover' }} />
                {item.tag && <span className={styles.menuTag}>{item.tag}</span>}
                <button
                  className={`${styles.availBtn} ${item.available ? styles.availOn : styles.availOff}`}
                  onClick={() => handleToggle(item.id)}
                  title={item.available ? 'Mavjud — o\'chirish uchun bosing' : 'Mavjud emas — yoqish uchun bosing'}
                >
                  {item.available ? '✅' : '❌'}
                </button>
              </div>
              <div className={styles.menuItemBody}>
                <div className={styles.menuItemTop}>
                  <span className={styles.menuItemCat}>{item.category}</span>
                  <span className={styles.menuItemPrice}>${item.price}</span>
                </div>
                <h4 className={styles.menuItemName}>{item.name}</h4>
                <p className={styles.menuItemDesc}>{item.desc}</p>
                <div className={styles.menuItemMeta}>
                  <span>⏱ {item.time}</span>
                  <span className={item.available ? styles.available : styles.notAvailable}>
                    {item.available ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                </div>
                <div className={styles.menuItemActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(item)} id={`edit-${item.id}`}>
                    ✏️ Tahrirlash
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)} id={`delete-menu-${item.id}`}>
                    🗑 O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [err,  setErr]  = useState(false);
  const [shake, setShake] = useState(false);

  const submit = e => {
    e.preventDefault();
    if (code === ADMIN_CODE) { onLogin(); }
    else {
      setErr(true); setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.glow} />
      <div className={`${styles.loginCard} ${shake ? styles.shake : ''}`}>
        <div className={styles.loginLogo}>
          <Image src="/logo.png" alt="Bella Vista" width={80} height={80}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 32px rgba(201,168,76,0.2)' }} />
          <div>
            <strong>Bella Vista</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>
        <p className={styles.loginHint}>Kirish uchun maxsus kodni kiriting</p>
        <form onSubmit={submit} className={styles.loginForm}>
          <input
            type="password"
            placeholder="••••••••••"
            value={code}
            onChange={e => { setCode(e.target.value); setErr(false); }}
            className={err ? styles.inputErr : ''}
            autoFocus
            id="admin-code-input"
          />
          {err && <div className={styles.errMsg}>❌ Noto'g'ri kod. Qayta urinib ko'ring.</div>}
          <button type="submit" id="admin-login-btn">Kirish →</button>
        </form>
        <a href="/" className={styles.loginBack}>← Asosiy saytga qaytish</a>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={styles.badge} style={{ color: s.color, background: s.bg, borderColor: s.color + '44' }}>
      {s.label}
    </span>
  );
}

// ── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, onAdvance, onCancel, onDelete, isNew }) {
  const s   = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const isDelivery = order.type === 'delivery';
  return (
    <div className={`${styles.orderCard} ${isNew ? styles.orderNew : ''}`} id={`order-${order.id}`}>
      <div className={styles.orderTop}>
        <div className={styles.orderLeft}>
          <span className={styles.orderType}>{isDelivery ? '🛵 Yetkazib berish' : '🍽️ Stol bron'}</span>
          <span className={styles.orderId}>#{String(order.id).slice(-5)}</span>
        </div>
        <div className={styles.orderRight}>
          <StatusBadge status={order.status} />
          <span className={styles.orderTime}>{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</span>
        </div>
      </div>

      <div className={styles.orderMid}>
        <div className={styles.orderCustomer}>
          <strong>👤 {order.customer}</strong>
          <span>📞 {order.phone}</span>
          <span>📍 {order.address}</span>
        </div>
        <div className={styles.orderItems}>
          <span className={styles.itemsLabel}>Buyurtma:</span>
          <span>{order.items}</span>
          {order.note && <span className={styles.orderNote}>💬 {order.note}</span>}
        </div>
      </div>

      {order.total > 0 && (
        <div className={styles.orderTotal}>
          Jami: <strong>${order.total}</strong>
        </div>
      )}

      <div className={styles.orderActions}>
        {s.next && (
          <button
            className={styles.advBtn}
            onClick={() => onAdvance(order.id, s.next)}
            id={`advance-${order.id}`}
          >
            {s.nextLabel}
          </button>
        )}
        {['new','cooking','table'].includes(order.status) && (
          <button className={styles.cancelBtn} onClick={() => onCancel(order.id)} id={`cancel-${order.id}`}>
            ✕ Bekor qilish
          </button>
        )}
        {['delivered','cancelled'].includes(order.status) && (
          <button className={styles.deleteBtn} onClick={() => onDelete(order.id)} id={`delete-${order.id}`}>
            🗑 O'chirish
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Panel ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [orders,    setOrders]    = useState([]);
  const [tab,       setTab]       = useState('orders');  // orders | stats
  const [filter,    setFilter]    = useState('all');
  const [newIds,    setNewIds]    = useState(new Set());
  const [notify,    setNotify]    = useState(false);

  const loadOrders = useCallback(() => {
    const fresh = getOrders();
    setOrders(prev => {
      // detect newly added orders
      const prevIds = new Set(prev.map(o => o.id));
      const added   = fresh.filter(o => !prevIds.has(o.id)).map(o => o.id);
      if (added.length > 0) {
        setNewIds(ids => new Set([...ids, ...added]));
        setNotify(true);
        setTimeout(() => setNotify(false), 3000);
        // Auto clear new highlight after 5s
        setTimeout(() => setNewIds(ids => {
          const copy = new Set(ids);
          added.forEach(id => copy.delete(id));
          return copy;
        }), 5000);
      }
      return fresh;
    });
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    loadOrders();
    // Poll every 5 seconds for new orders
    const interval = setInterval(loadOrders, 5000);
    // Also listen for same-tab events
    window.addEventListener('bv_new_order', loadOrders);
    window.addEventListener('storage', loadOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('bv_new_order', loadOrders);
      window.removeEventListener('storage', loadOrders);
    };
  }, [loggedIn, loadOrders]);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const advance = (id, nextStatus) => {
    const updated = updateOrderStatus(id, nextStatus);
    setOrders(updated);
  };

  const cancel = (id) => {
    const updated = updateOrderStatus(id, 'cancelled');
    setOrders(updated);
  };

  const remove = (id) => {
    const updated = deleteOrder(id);
    setOrders(updated);
  };

  // Stats
  const todayStr = new Date().toDateString();
  const todayOrders   = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const pendingCount  = orders.filter(o => ['new','cooking','table'].includes(o.status)).length;
  const todayRevenue  = todayOrders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + (o.total||0), 0);
  const delivCount    = orders.filter(o => o.type === 'delivery').length;
  const tableCount    = orders.filter(o => o.type === 'table').length;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter || o.type === filter);

  const TABS = [
    { key: 'orders', icon: '🧾', label: 'Buyurtmalar', count: pendingCount },
    { key: 'menu',   icon: '🍽️', label: 'Menyu',       count: null },
    { key: 'stats',  icon: '📊', label: 'Statistika',  count: null },
  ];

  const FILTERS = [
    { key: 'all',       label: 'Barchasi'        },
    { key: 'new',       label: '🆕 Yangi'         },
    { key: 'cooking',   label: '👨‍🍳 Tayyorlanmoqda' },
    { key: 'ready',     label: '📦 Tayyor'        },
    { key: 'delivery',  label: '🛵 Yetkazib berish'},
    { key: 'table',     label: '🍽️ Stol bron'     },
    { key: 'delivered', label: '✅ Yakunlangan'   },
    { key: 'cancelled', label: '✕ Bekor'          },
  ];

  return (
    <div className={styles.admin}>
      {/* ── New order notification ── */}
      {notify && (
        <div className={styles.notification}>
          🔔 Yangi buyurtma keldi!
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="Bella Vista" width={40} height={40}
            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <strong>Bella Vista</strong>
            <span>ADMIN</span>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.navItem} ${tab === t.key ? styles.navActive : ''}`}
              onClick={() => setTab(t.key)}
              id={`tab-${t.key}`}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
              {t.count > 0 && <span className={styles.navBadge}>{t.count}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sideBottom}>
          <a href="/delivery" className={styles.sideLink}>🛵 Yetkazib berish sahifasi</a>
          <a href="/"         className={styles.sideLink}>🏠 Asosiy saytga qaytish</a>
          <button className={styles.logoutSide} onClick={() => setLoggedIn(false)}>⏏ Chiqish</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className={styles.section}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>🧾 Buyurtmalar</h1>
              <button className={styles.refreshBtn} onClick={loadOrders} title="Yangilash">🔄 Yangilash</button>
            </div>

            {/* Filter pills */}
            <div className={styles.filterRow}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f.key)}
                  id={`filter-${f.key}`}
                >
                  {f.label}
                  <span className={styles.filterCount}>
                    {f.key === 'all' ? orders.length
                      : f.key === 'delivery' ? orders.filter(o=>o.type==='delivery').length
                      : f.key === 'table'    ? orders.filter(o=>o.type==='table').length
                      : orders.filter(o=>o.status===f.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders */}
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <span>📭</span>
                <p>Hozircha buyurtmalar yo'q</p>
                <span className={styles.emptyHint}>Mehmonlar buyurtma berganida bu yerda ko'rinadi</span>
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {filtered.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isNew={newIds.has(order.id)}
                    onAdvance={advance}
                    onCancel={cancel}
                    onDelete={remove}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {tab === 'menu' && <MenuTab />}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>📊 Statistika</h1>

            <div className={styles.statsGrid}>
              {[
                { icon:'💰', label:'Bugungi daromad',      value:`$${todayRevenue}`,   color:'#c9a84c' },
                { icon:'⏳', label:'Kutilayotgan buyurtma', value:pendingCount,          color:'#60a5fa' },
                { icon:'🛵', label:'Jami yetkazib berish',  value:delivCount,            color:'#34d399' },
                { icon:'🍽️', label:'Jami stol bron',       value:tableCount,            color:'#fbbf24' },
                { icon:'📋', label:'Jami buyurtmalar',     value:orders.length,         color:'#a78bfa' },
                { icon:'✅', label:'Yakunlangan',          value:orders.filter(o=>o.status==='delivered').length, color:'#34d399' },
              ].map((s, i) => (
                <div key={i} className={styles.statCard} style={{ '--sc': s.color, animationDelay: `${i*0.08}s` }}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className={styles.breakdown}>
              <h3>Buyurtmalar holati bo'yicha</h3>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = orders.filter(o => o.status === key).length;
                const max   = Math.max(...Object.keys(STATUS_CONFIG).map(k => orders.filter(o=>o.status===k).length), 1);
                return (
                  <div key={key} className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel} style={{ color: cfg.color }}>{cfg.label}</span>
                    <div className={styles.breakdownBar}>
                      <div className={styles.breakdownFill}
                        style={{ width: `${(count/max)*100}%`, background: cfg.color }} />
                    </div>
                    <span className={styles.breakdownCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
