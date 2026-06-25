import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.bg}>
        <Image
          src="/hero.png"
          alt="Bella Vista restaurant ambiance"
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={90}
        />
      </div>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <span className={styles.badge}>✦ Est. 2015 · Milano, Italy</span>
        <h1 className={styles.title}>
          Where Every Dish<br />
          <em>Tells a Story</em>
        </h1>
        <p className={styles.subtitle}>
          Indulge in the art of fine dining. Crafted with passion,<br />
          served with elegance — an experience for all the senses.
        </p>
        <div className={styles.actions}>
          <a href="#reservation" className="btn-primary">
            <span>Reserve a Table</span>
          </a>
          <a href="#menu" className="btn-outline">
            Explore Menu
          </a>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>12+</strong>
            <span>Years of Excellence</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>48</strong>
            <span>Signature Dishes</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>2</strong>
            <span>Michelin Stars</span>
          </div>
        </div>
      </div>

      <a href="#menu" className={styles.scrollDown} aria-label="Scroll down">
        <span className={styles.scrollDot} />
      </a>
    </section>
  );
}
