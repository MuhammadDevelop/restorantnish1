'use client';
import Image from 'next/image';
import { useLang } from '../context/LanguageContext';
import styles from './Hero.module.css';

export default function HeroClient() {
  const { t } = useLang();

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
        <span className={styles.badge}>{t('hero_badge')}</span>
        <h1 className={styles.title}>
          {t('hero_title1')}<br />
          <em>{t('hero_title2')}</em>
        </h1>
        <p className={styles.subtitle}>{t('hero_subtitle')}</p>
        <div className={styles.actions}>
          <a href="#reservation" className="btn-primary">
            <span>{t('hero_reserve')}</span>
          </a>
          <a href="#menu" className="btn-outline">
            {t('hero_menu')}
          </a>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{t('hero_stat1_num')}</strong>
            <span>{t('hero_stat1_label')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>{t('hero_stat2_num')}</strong>
            <span>{t('hero_stat2_label')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>{t('hero_stat3_num')}</strong>
            <span>{t('hero_stat3_label')}</span>
          </div>
        </div>
      </div>

      <a href="#menu" className={styles.scrollDown} aria-label="Scroll down">
        <span className={styles.scrollDot} />
      </a>
    </section>
  );
}
