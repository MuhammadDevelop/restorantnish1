'use client';
import { useLang } from '../context/LanguageContext';
import styles from './Testimonials.module.css';

const reviews = [
  { id: 1, name: 'Sophia Laurent', role: 'Food Critic, Le Monde',   stars: 5, avatar: 'SL',
    text: { en: "An extraordinary experience from start to finish. The truffle carbonara is the best I've had outside of Rome. The ambiance is simply magical.", ru: "Экстраординарный опыт от начала до конца. Трюфельная карбонара — лучшая, которую я пробовала за пределами Рима.", uz: "Boshidan oxirigacha ajoyib tajriba. Truffle karbonara — Rimdan tashqarida yegan eng yaxshi taom." } },
  { id: 2, name: 'James Hartwell',  role: 'CEO, TechVentures',       stars: 5, avatar: 'JH',
    text: { en: "We hosted our annual gala at Bella Vista and it was flawless. Every detail was perfect — from the customized menu to the impeccable service.", ru: "Мы провели наш ежегодный гала в Bella Vista, и это было безупречно. Каждая деталь была идеальной.", uz: "Bella Vista da yillik gala-kechkimiz o'tkazdik va u mukammal bo'ldi. Har bir detal ideal edi." } },
  { id: 3, name: 'Amelia Chen',     role: 'Travel Blogger',          stars: 5, avatar: 'AC',
    text: { en: "I've dined at Michelin-starred restaurants across 30 countries, and Bella Vista ranks among my absolute favorites. The salmon is poetry on a plate.", ru: "Я обедала в ресторанах со звёздами Мишлен в 30 странах, и Bella Vista входит в мои абсолютные фавориты.", uz: "30 mamlakatda Mishlen yulduzli restoranlarda ovqatlandim va Bella Vista eng sevimlilari orasida." } },
];

export default function Testimonials() {
  const { lang, t } = useLang();

  return (
    <section id="reviews" className={styles.section}>
      <div className={styles.bgAccent} />
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">{t('test_label')}</span>
          <h2 className="section-title">{t('test_title')}</h2>
          <div className="divider" style={{ margin: '0 auto' }} />
        </div>

        <div className={styles.grid}>
          {reviews.map(r => (
            <div className={styles.card} key={r.id} id={`review-${r.id}`}>
              <div className={styles.stars}>{'★'.repeat(r.stars)}</div>
              <p className={styles.text}>"{r.text[lang] || r.text.en}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{r.avatar}</div>
                <div>
                  <strong className={styles.name}>{r.name}</strong>
                  <span className={styles.role}>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
