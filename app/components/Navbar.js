'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLang } from '../context/LanguageContext';
import styles from './Navbar.module.css';

const LANGS = [
  { code: 'uz', label: "O'Z", flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function Navbar({ onLogout }) {
  const { lang, setLang, t } = useLang();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [langOpen,  setLangOpen]  = useState(false);
  const [userName,  setUserName]  = useState('');
  const [theme,     setTheme]     = useState('dark');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);

    // Get logged-in user name — skip if it looks like admin code
    const saved = localStorage.getItem('bv_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const name = parsed.name || '';
        // Don't show if it's an admin code (all caps + digits pattern)
        if (!/^[A-Z0-9]+$/.test(name.trim())) {
          setUserName(name.split(' ')[0]);
        } else {
          // Clear bad entry
          localStorage.removeItem('bv_user');
        }
      } catch {}
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('bv_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bv_theme', next);
  };

  const links = [
    { href: '#home',    label: t('nav_home')    },
    { href: '#menu',    label: t('nav_menu')    },
    { href: '#about',   label: t('nav_about')   },
    { href: '#reviews', label: t('nav_reviews') },
    { href: '#contact', label: t('nav_contact') },
  ];

  const currentLang = LANGS.find(l => l.code === lang);

  const handleLogout = () => {
    localStorage.removeItem('bv_user');
    if (onLogout) onLogout();
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Bella Vista Restaurant"
            width={44}
            height={44}
            className={styles.logoImg}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
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
            <a href="/delivery" className={styles.deliveryBtn} id="nav-delivery">
              🛵 {t('nav_home') === 'Home' ? 'Delivery' : t('nav_home') === 'Bosh sahifa' ? 'Yetkazib berish' : 'Доставка'}
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

          {/* Theme toggle */}
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            id="theme-toggle"
            title={theme === 'dark' ? 'Kun rejimi' : 'Tun rejimi'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* User + logout */}
          {userName && (
            <div className={styles.userArea}>
              <span className={styles.userName}>👤 {userName}</span>
              <button className={styles.logoutBtn} onClick={handleLogout} id="logout-btn" title="Chiqish">
                ⏏
              </button>
            </div>
          )}

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
