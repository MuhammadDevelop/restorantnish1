'use client';
import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import styles from './Navbar.module.css';

const LANGS = [
  { code: 'uz', label: "O'Z", flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#home',    label: t('nav_home')    },
    { href: '#menu',    label: t('nav_menu')    },
    { href: '#about',   label: t('nav_about')   },
    { href: '#reviews', label: t('nav_reviews') },
    { href: '#contact', label: t('nav_contact') },
  ];

  const currentLang = LANGS.find(l => l.code === lang);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <div>
            <span className={styles.logoMain}>Bella Vista</span>
            <span className={styles.logoSub}>Fine Dining</span>
          </div>
        </a>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={styles.link} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/dashboard" className={styles.dashBtn} id="nav-dashboard">
              {t('nav_dashboard')}
            </a>
          </li>
          <li>
            <a href="#reservation" className={styles.reserveBtn} onClick={() => setMenuOpen(false)}>
              {t('nav_reserve')}
            </a>
          </li>
        </ul>

        <div className={styles.right}>
          {/* Language switcher */}
          <div className={styles.langSwitch}>
            <button
              className={styles.langCurrent}
              onClick={() => setLangOpen(!langOpen)}
              id="lang-switcher"
              aria-label="Change language"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <span className={`${styles.langArrow} ${langOpen ? styles.langArrowOpen : ''}`}>▾</span>
            </button>
            {langOpen && (
              <div className={styles.langDropdown}>
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    className={`${styles.langOption} ${lang === l.code ? styles.langActive : ''}`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    id={`lang-${l.code}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
