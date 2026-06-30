'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useLang } from '../context/LanguageContext';
import styles from './Menu.module.css';

const dishes = [
  { id: 1, name_key: 'Truffle Carbonara',    category: 'Main Course', price: '$38', desc_key: 'Hand-pulled spaghetti with aged pecorino, guanciale, and fresh black truffle shavings.', img: '/dish1.png', tag: "Chef's Pick" },
  { id: 2, name_key: 'Glazed Salmon',        category: 'Main Course', price: '$44', desc_key: 'Pan-seared Atlantic salmon, lemon butter sauce, asparagus, and heirloom tomatoes.',      img: '/dish2.png', tag: 'Popular'    },
  { id: 3, name_key: 'Lava Chocolate Cake',  category: 'Desserts',    price: '$18', desc_key: 'Warm dark chocolate fondant with vanilla bean ice cream and fresh raspberry coulis.',     img: '/dish3.png', tag: 'Signature'  },
  { id: 4, name_key: 'Burrata & Prosciutto', category: 'Starters',    price: '$22', desc_key: 'Creamy buffalo burrata, aged prosciutto di Parma, cherry tomatoes, and basil oil.',       img: '/dish1.png', tag: null         },
  { id: 5, name_key: 'Lobster Bisque',       category: 'Starters',    price: '$28', desc_key: 'Rich, velvety lobster bisque with brandy cream, fresh dill, and sourdough croutons.',    img: '/dish2.png', tag: 'New'        },
  { id: 6, name_key: 'Crème Brûlée',         category: 'Desserts',    price: '$16', desc_key: 'Classic Parisian vanilla custard with a perfectly caramelized sugar crust.',             img: '/dish3.png', tag: null         },
];

function OrderModal({ dish, onClose, t }) {
  const handleReserve = () => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById('reservation');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalImg}>
          <Image src={dish.img} alt={dish.name_key} fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.modalBody}>
          <span className={styles.modalCat}>{dish.category}</span>
          <h3 className={styles.modalName}>{dish.name_key}</h3>
          <p className={styles.modalDesc}>{dish.desc_key}</p>
          <div className={styles.modalFooter}>
            <span className={styles.modalPrice}>{dish.price}</span>
            <div className={styles.modalActions}>
              <a
                href="/delivery"
                className={styles.modalBtnGreen}
                id={`modal-delivery-${dish.id}`}
              >
                🛵 {t('nav_home') === 'Home' ? 'Order Delivery' : t('nav_home') === 'Bosh sahifa' ? 'Yetkazib olish' : 'Доставка'}
              </a>
              <button
                className={styles.modalBtn}
                onClick={handleReserve}
                id={`modal-order-${dish.id}`}
              >
                🍽️ {t('nav_home') === 'Home' ? 'Book a Table' : t('nav_home') === 'Bosh sahifa' ? 'Stol band qilish' : 'Забронировать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState(null);

  const categories = [
    { key: 'All',         label: t('menu_cat_all')      },
    { key: 'Starters',    label: t('menu_cat_starters') },
    { key: 'Main Course', label: t('menu_cat_main')     },
    { key: 'Desserts',    label: t('menu_cat_desserts') },
  ];

  const filtered = activeCategory === 'All'
    ? dishes
    : dishes.filter(d => d.category === activeCategory);

  return (
    <section id="menu" className={styles.menu}>
      {selectedDish && <OrderModal dish={selectedDish} onClose={() => setSelectedDish(null)} t={t} />}

      <div className="container">
        <div className={styles.header}>
          <span className="section-label">{t('menu_label')}</span>
          <h2 className="section-title">{t('menu_title')}</h2>
          <div className="divider" />
          <p className={styles.desc}>{t('menu_desc')}</p>
        </div>

        <div className={styles.categories}>
          {categories.map((c, i) => (
            <button
              key={i}
              className={`${styles.catBtn} ${activeCategory === c.key ? styles.catActive : ''}`}
              id={`menu-cat-${c.key.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((dish, idx) => (
            <div className={styles.card} key={dish.id} id={`dish-${dish.id}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
              onClick={() => setSelectedDish(dish)}>
              <div className={styles.imgWrap}>
                <Image src={dish.img} alt={dish.name_key} fill
                  style={{ objectFit: 'cover' }} />
                {dish.tag && <span className={styles.tag}>{dish.tag}</span>}
                <div className={styles.overlay} />
                <button className={styles.quickView} id={`quick-${dish.id}`}
                  onClick={e => { e.stopPropagation(); setSelectedDish(dish); }}>
                  {t('nav_home') === 'Home' ? 'Quick View' : t('nav_home') === 'Bosh sahifa' ? 'Ko\'rish' : 'Просмотр'} →
                </button>
              </div>
              <div className={styles.body}>
                <span className={styles.category}>{dish.category}</span>
                <h3 className={styles.name}>{dish.name_key}</h3>
                <p className={styles.cardDesc}>{dish.desc_key}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>{dish.price}</span>
                  <button className={styles.orderBtn} id={`order-${dish.id}`}
                    onClick={e => { e.stopPropagation(); setSelectedDish(dish); }}>
                    {t('menu_order')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAll}>
          <a href="#reservation" className="btn-outline">{t('menu_view_full')}</a>
        </div>
      </div>
    </section>
  );
}
