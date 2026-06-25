'use client';
import styles from './Footer.module.css';

export default function Footer() {
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
              <p className={styles.tagline}>
                Where every moment becomes a cherished memory. Experience the finest Italian cuisine in an unforgettable setting.
              </p>
              <div className={styles.socials}>
                <a href="#" className={styles.social} aria-label="Instagram" id="social-instagram">📷</a>
                <a href="#" className={styles.social} aria-label="Facebook" id="social-facebook">📘</a>
                <a href="#" className={styles.social} aria-label="Twitter" id="social-twitter">🐦</a>
                <a href="#" className={styles.social} aria-label="TikTok" id="social-tiktok">🎵</a>
              </div>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>Quick Links</h4>
              <ul className={styles.links}>
                <li><a href="#home">Home</a></li>
                <li><a href="#menu">Our Menu</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#reservation">Reservations</a></li>
                <li><a href="#reviews">Reviews</a></li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>Contact</h4>
              <ul className={styles.contacts}>
                <li>📍 24 Via Bella, Milano, Italy 20121</li>
                <li>📞 +39 02 1234 5678</li>
                <li>✉️ info@bellavista.com</li>
                <li>🕐 Mon–Sun: 12pm – 11:30pm</li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>Newsletter</h4>
              <p className={styles.newsletterDesc}>
                Get exclusive offers and seasonal menu updates.
              </p>
              <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()} id="newsletter-form">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="your@email.com"
                  aria-label="Email for newsletter"
                />
                <button type="submit" id="newsletter-submit">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copy}>© 2026 Bella Vista Fine Dining. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
