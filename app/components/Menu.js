'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './Menu.module.css';

const categories = ['All', 'Starters', 'Main Course', 'Desserts'];

const dishes = [
  { id: 1, name: 'Truffle Carbonara',    category: 'Main Course', price: '$38', desc: 'Hand-pulled spaghetti with aged pecorino, guanciale, and fresh black truffle shavings.', img: '/dish1.png', tag: "Chef's Pick" },
  { id: 2, name: 'Glazed Salmon',        category: 'Main Course', price: '$44', desc: 'Pan-seared Atlantic salmon, lemon butter sauce, asparagus, and heirloom tomatoes.',      img: '/dish2.png', tag: 'Popular'    },
  { id: 3, name: 'Lava Chocolate Cake',  category: 'Desserts',    price: '$18', desc: 'Warm dark chocolate fondant with vanilla bean ice cream and fresh raspberry coulis.',     img: '/dish3.png', tag: 'Signature'  },
  { id: 4, name: 'Burrata & Prosciutto', category: 'Starters',    price: '$22', desc: 'Creamy buffalo burrata, aged prosciutto di Parma, cherry tomatoes, and basil oil.',       img: '/dish1.png', tag: null         },
  { id: 5, name: 'Lobster Bisque',       category: 'Starters',    price: '$28', desc: 'Rich, velvety lobster bisque with brandy cream, fresh dill, and sourdough croutons.',    img: '/dish2.png', tag: 'New'        },
  { id: 6, name: 'Crème Brûlée',         category: 'Desserts',    price: '$16', desc: 'Classic Parisian vanilla custard with a perfectly caramelized sugar crust.',             img: '/dish3.png', tag: null         },
];

function OrderModal({ dish, onClose }) {
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
          <Image src={dish.img} alt={dish.name} fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.modalBody}>
          <span className={styles.modalCat}>{dish.category}</span>
          <h3 className={styles.modalName}>{dish.name}</h3>
          <p className={styles.modalDesc}>{dish.desc}</p>
          <div className={styles.modalFooter}>
            <span className={styles.modalPrice}>{dish.price}</span>
            <button className={styles.modalBtn} onClick={handleReserve} id={`modal-order-${dish.id}`}>
              Stol band qilish →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState(null);

  const filtered = activeCategory === 'All'
    ? dishes
    : dishes.filter(d => d.category === activeCategory);

  return (
    <section id="menu" className={styles.menu}>
      {selectedDish && <OrderModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}

      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Our Menu</span>
          <h2 className="section-title">Culinary Masterpieces</h2>
          <div className="divider" />
          <p className={styles.desc}>
            Every dish is a canvas where tradition meets innovation,<br />
            crafted from the finest seasonal ingredients.
          </p>
        </div>

        <div className={styles.categories}>
          {categories.map((c, i) => (
            <button
              key={i}
              className={`${styles.catBtn} ${activeCategory === c ? styles.active : ''}`}
              id={`menu-cat-${c.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map(dish => (
            <div className={styles.card} key={dish.id} id={`dish-${dish.id}`}>
              <div className={styles.imgWrap}>
                <Image
                  src={dish.img}
                  alt={dish.name}
                  width={400}
                  height={280}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                {dish.tag && <span className={styles.tag}>{dish.tag}</span>}
                <div className={styles.imgOverlay} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCat}>{dish.category}</span>
                  <span className={styles.cardPrice}>{dish.price}</span>
                </div>
                <h3 className={styles.cardName}>{dish.name}</h3>
                <p className={styles.cardDesc}>{dish.desc}</p>
                <button
                  className={styles.orderBtn}
                  id={`order-${dish.id}`}
                  onClick={() => setSelectedDish(dish)}
                >
                  Order Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAll}>
          <a href="#reservation" className="btn-outline">View Full Menu</a>
        </div>
      </div>
    </section>
  );
}
