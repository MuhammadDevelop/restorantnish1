import styles from './Testimonials.module.css';

const reviews = [
  {
    id: 1,
    name: 'Sophia Laurent',
    role: 'Food Critic, Le Monde',
    stars: 5,
    text: 'An extraordinary experience from start to finish. The truffle carbonara is the best I\'ve had outside of Rome. The ambiance is simply magical — intimate yet grand.',
    avatar: 'SL',
  },
  {
    id: 2,
    name: 'James Hartwell',
    role: 'CEO, TechVentures',
    stars: 5,
    text: 'We hosted our annual gala at Bella Vista and it was flawless. Every detail was perfect — from the customized menu to the impeccable service. Truly world-class.',
    avatar: 'JH',
  },
  {
    id: 3,
    name: 'Amelia Chen',
    role: 'Travel Blogger',
    stars: 5,
    text: 'I\'ve dined at Michelin-starred restaurants across 30 countries, and Bella Vista ranks among my absolute favorites. The salmon is poetry on a plate.',
    avatar: 'AC',
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className={styles.section}>
      <div className={styles.bgAccent} />
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">What Our Guests Say</h2>
          <div className="divider" style={{ margin: '0 auto 0 auto' }} />
        </div>

        <div className={styles.grid}>
          {reviews.map(r => (
            <div className={styles.card} key={r.id} id={`review-${r.id}`}>
              <div className={styles.stars}>
                {'★'.repeat(r.stars)}
              </div>
              <p className={styles.text}>"{r.text}"</p>
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
