'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

const MENU = [
  { id: 1, name: 'Truffle Carbonara',    price: 38, img: '/dish1.png', category: 'Main',    time: '25 min' },
  { id: 2, name: 'Glazed Salmon',        price: 44, img: '/dish2.png', category: 'Main',    time: '20 min' },
  { id: 3, name: 'Lava Chocolate Cake',  price: 18, img: '/dish3.png', category: 'Dessert', time: '15 min' },
  { id: 4, name: 'Burrata & Prosciutto', price: 22, img: '/dish1.png', category: 'Starter', time: '10 min' },
  { id: 5, name: 'Lobster Bisque',       price: 28, img: '/dish2.png', category: 'Starter', time: '15 min' },
  { id: 6, name: 'Crème Brûlée',         price: 16, img: '/dish3.png', category: 'Dessert', time: '12 min' },
];

const CATS = ['Barchasi', 'Main', 'Starter', 'Dessert'];

export default function DeliveryPage() {
  const [cat, setCat]         = useState('Barchasi');
  const [cart, setCart]       = useState({});
  const [step, setStep]       = useState('menu'); // menu | form | tracking
  const [address, setAddress] = useState({ name: '', phone: '', street: '', note: '' });
  const [orderId]             = useState(() => Math.floor(Math.random() * 90000) + 10000);

  const filtered = cat === 'Barchasi' ? MENU : MENU.filter(m => m.category === cat);
  const cartItems = MENU.filter(m => cart[m.id] > 0);
  const total = cartItems.reduce((s, m) => s + m.price * cart[m.id], 0);
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  const add  = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub  = (id) => setCart(c => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));

  const handleOrder = (e) => {
    e.preventDefault();
    setStep('tracking');
  };

  // ── Tracking screen ─────────────────────────────────
  if (step === 'tracking') {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <a href="/" className={styles.back}>← Saytga qaytish</a>
          <span className={styles.brand}>✦ Bella Vista Yetkazib berish</span>
          <span />
        </header>
        <div className={styles.tracking}>
          <div className={styles.trackCard}>
            <div className={styles.trackIcon}>🛵</div>
            <h2>Buyurtmangiz qabul qilindi!</h2>
            <p>Buyurtma №: <strong>#{orderId}</strong></p>
            <p className={styles.trackAddr}>📍 {address.street}</p>

            <div className={styles.trackSteps}>
              {[
                { icon: '✅', label: 'Qabul qilindi',     done: true  },
                { icon: '👨‍🍳', label: 'Tayyorlanmoqda',   done: true  },
                { icon: '📦', label: 'Yetkazilmoqda',     done: false },
                { icon: '🏠', label: 'Yetkazib berildi',  done: false },
              ].map((s, i) => (
                <div key={i} className={`${styles.trackStep} ${s.done ? styles.trackDone : ''}`}>
                  <span className={styles.trackStepIcon}>{s.icon}</span>
                  <span>{s.label}</span>
                  {i < 3 && <div className={`${styles.trackLine} ${s.done ? styles.trackLineDone : ''}`} />}
                </div>
              ))}
            </div>

            <div className={styles.trackSummary}>
              <h4>Buyurtma tarkibi:</h4>
              {cartItems.map(m => (
                <div key={m.id} className={styles.trackItem}>
                  <span>{m.name} ×{cart[m.id]}</span>
                  <span>${m.price * cart[m.id]}</span>
                </div>
              ))}
              <div className={styles.trackTotal}>
                <strong>Jami</strong>
                <strong>${total + 5}</strong>
              </div>
            </div>

            <p className={styles.trackEta}>⏱ Taxminiy vaqt: <strong>35–45 daqiqa</strong></p>
            <button className={styles.newOrderBtn} onClick={() => { setCart({}); setStep('menu'); }}>
              Yangi buyurtma
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Order form ───────────────────────────────────────
  if (step === 'form') {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.back} onClick={() => setStep('menu')}>← Orqaga</button>
          <span className={styles.brand}>✦ Bella Vista Yetkazib berish</span>
          <span />
        </header>
        <div className={styles.formPage}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Manzilni kiriting</h2>
            <form onSubmit={handleOrder} className={styles.addrForm}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>Ism Familiya</label>
                  <input required placeholder="Abdullayev Ali" value={address.name}
                    onChange={e => setAddress({ ...address, name: e.target.value })} />
                </div>
                <div className={styles.formField}>
                  <label>Telefon</label>
                  <input required placeholder="+998 90 123 45 67" value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })} />
                </div>
              </div>
              <div className={styles.formField}>
                <label>Manzil</label>
                <input required placeholder="Ko'cha, uy raqami, xonadon" value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })} />
              </div>
              <div className={styles.formField}>
                <label>Izoh (ixtiyoriy)</label>
                <textarea placeholder="Qo'ng'iroq qilmang, eshikka qo'ying..." value={address.note}
                  onChange={e => setAddress({ ...address, note: e.target.value })} rows={3} />
              </div>

              <div className={styles.orderSummary}>
                <h4>Buyurtma xulosasi</h4>
                {cartItems.map(m => (
                  <div key={m.id} className={styles.summaryRow}>
                    <span>{m.name} ×{cart[m.id]}</span>
                    <span>${m.price * cart[m.id]}</span>
                  </div>
                ))}
                <div className={styles.summaryRow}>
                  <span>Yetkazib berish</span>
                  <span className={styles.deliveryFee}>$5</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <strong>Jami</strong>
                  <strong>${total + 5}</strong>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                🛵 Buyurtma berish — ${total + 5}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Menu screen ──────────────────────────────────────
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← Saytga qaytish</a>
        <span className={styles.brand}>✦ Bella Vista Yetkazib berish</span>
        <button className={styles.cartBtn} onClick={() => cartCount > 0 && setStep('form')}
          disabled={cartCount === 0} id="open-cart">
          🛒 Savatcha {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </header>

      <div className={styles.hero2}>
        <div className={styles.heroText}>
          <h1>Uyingizga yetkazamiz</h1>
          <p>Bella Vista taomlarini 35–45 daqiqada eshigingizgacha</p>
          <div className={styles.heroBadges}>
            <button onClick={() => document.querySelector('.'+styles.menuSection)?.scrollIntoView({behavior:'smooth'})} className={styles.heroBadgeBtn}>⏱ 35–45 daqiqa</button>
            <button onClick={() => document.querySelector('.'+styles.menuSection)?.scrollIntoView({behavior:'smooth'})} className={styles.heroBadgeBtn}>🚚 $5 yetkazib berish</button>
            <button onClick={() => document.querySelector('.'+styles.menuSection)?.scrollIntoView({behavior:'smooth'})} className={styles.heroBadgeBtn}>💳 Online to'lov</button>
          </div>
        </div>
      </div>

      <div className={styles.menuSection}>
        <div className={styles.catRow}>
          {CATS.map(c => (
            <button key={c} className={`${styles.catBtn2} ${cat === c ? styles.catActive : ''}`}
              onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className={styles.menuGrid}>
          {filtered.map(item => (
            <div key={item.id} className={styles.menuCard} id={`delivery-item-${item.id}`}>
              <div className={styles.menuImg}>
                <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} />
                <span className={styles.menuTime}>⏱ {item.time}</span>
              </div>
              <div className={styles.menuInfo}>
                <div>
                  <span className={styles.menuCat}>{item.category}</span>
                  <h3 className={styles.menuName}>{item.name}</h3>
                  <span className={styles.menuPrice}>${item.price}</span>
                </div>
                <div className={styles.qtyRow}>
                  {cart[item.id] > 0 ? (
                    <>
                      <button className={styles.qtyBtn} onClick={() => sub(item.id)}>−</button>
                      <span className={styles.qtyNum}>{cart[item.id]}</span>
                      <button className={styles.qtyBtn} onClick={() => add(item.id)}>+</button>
                    </>
                  ) : (
                    <button className={styles.addBtn} onClick={() => add(item.id)} id={`add-${item.id}`}>
                      + Qo'shish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className={styles.floatingCart}>
          <div className={styles.floatingInfo}>
            <span>{cartCount} ta mahsulot</span>
            <span>${total}</span>
          </div>
          <button className={styles.floatingBtn} onClick={() => setStep('form')} id="checkout-btn">
            Buyurtma berish →
          </button>
        </div>
      )}
    </div>
  );
}
