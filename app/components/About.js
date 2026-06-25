'use client';
import Image from 'next/image';
import { useLang } from '../context/LanguageContext';
import styles from './About.module.css';

export default function About() {
  const { t } = useLang();

  const features = [
    { icon: '🌿', title: t('about_f1_title'), desc: t('about_f1_desc') },
    { icon: '👨‍🍳', title: t('about_f2_title'), desc: t('about_f2_desc') },
    { icon: '🍷', title: t('about_f3_title'), desc: t('about_f3_desc') },
    { icon: '✨', title: t('about_f4_title'), desc: t('about_f4_desc') },
  ];

  return (
    <section id="about" className={styles.about}>
      <div className={styles.grid}>
        <div className={styles.imgCol}>
          <div className={styles.imgMain}>
            <Image src="/interior.png" alt="Bella Vista restaurant interior" fill
              style={{ objectFit: 'cover' }} quality={85} />
          </div>
          <div className={styles.badge}>
            <strong>12+</strong>
            <span>{t('about_years')}</span>
          </div>
        </div>

        <div className={styles.textCol}>
          <span className="section-label">{t('about_label')}</span>
          <h2 className="section-title">
            {t('about_title1')}<br />{t('about_title2')}
          </h2>
          <div className="divider" />
          <p className={styles.para}>{t('about_p1')}</p>
          <p className={styles.para}>{t('about_p2')}</p>

          <div className={styles.features}>
            {features.map((f, i) => (
              <div className={styles.feature} key={i}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <div>
                  <h4 className={styles.featureTitle}>{f.title}</h4>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
