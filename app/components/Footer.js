'use client';
import { useLang } from '../context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLang();

  const links = [
    { href: '#home',        label: t('nav_home')    },
    { href: '#menu',        label: t('nav_menu')    },
    { href: '#about',       label: t('nav_about')   },
    { href: '#reservation', label: t('nav_reserve') },
    { href: '#reviews',     label: t('nav_reviews') },
  ];

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <span className={styles.logoIcon}>✦</span>
                <div>
                  <span className={styles.logoMain}>Bella Vista</span>
                  <span className={styles.logoSub}>Fine Dining</span>
                </div>
              </div>
              <p className={styles.tagline}>{t('footer_tagline')}</p>
              <div className={styles.socials}>
                <a href="#" className={styles.social} aria-label="Instagram" id="social-instagram">📷</a>
                <a href="#" className={styles.social} aria-label="Facebook"  id="social-facebook">📘</a>
                <a href="#" className={styles.social} aria-label="Twitter"   id="social-twitter">🐦</a>
                <a href="#" className={styles.social} aria-label="TikTok"    id="social-tiktok">🎵</a>
              </div>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t('footer_links')}</h4>
              <ul className={styles.links}>
                {links.map((l, i) => (
                  <li key={i}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t('footer_contact')}</h4>
              <ul className={styles.contacts}>
                <li>📍 24 Via Bella, Milano, Italy 20121</li>
                <li>📞 +39 02 1234 5678</li>
                <li>✉️ info@bellavista.com</li>
                <li>🕐 Mon–Sun: 12pm – 11:30pm</li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t('footer_newsletter')}</h4>
              <p className={styles.newsletterDesc}>{t('footer_newsletter_desc')}</p>
              <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()} id="newsletter-form">
                <input type="email" id="newsletter-email" placeholder="your@email.com" aria-label="Email" />
                <button type="submit" id="newsletter-submit">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copy}>{t('footer_copy')}</p>
          <div className={styles.bottomLinks}>
            <a href="#">{t('footer_privacy')}</a>
            <a href="#">{t('footer_terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
