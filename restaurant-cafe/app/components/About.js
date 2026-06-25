import Image from 'next/image';
import styles from './About.module.css';

const features = [
  { icon: '🌿', title: 'Farm to Table', desc: 'Fresh ingredients sourced daily from local farms and trusted suppliers.' },
  { icon: '👨‍🍳', title: 'Master Chefs', desc: 'Award-winning culinary team with decades of international experience.' },
  { icon: '🍷', title: 'Premium Wine', desc: 'An extensive selection of over 200 fine wines from around the world.' },
  { icon: '✨', title: 'Private Events', desc: 'Bespoke dining experiences for weddings, anniversaries, and corporate events.' },
];

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.grid}>
        <div className={styles.imgCol}>
          <div className={styles.imgMain}>
            <Image
              src="/interior.png"
              alt="Bella Vista restaurant interior"
              fill
              style={{ objectFit: 'cover' }}
              quality={85}
            />
          </div>
          <div className={styles.badge}>
            <strong>12+</strong>
            <span>Years of Culinary Excellence</span>
          </div>
        </div>

        <div className={styles.textCol}>
          <span className="section-label">Our Story</span>
          <h2 className="section-title">
            A Passion for<br />Exceptional Cuisine
          </h2>
          <div className="divider" />
          <p className={styles.para}>
            Founded in 2015 by Chef Marco Rossi, Bella Vista was born from a dream — 
            to create a place where extraordinary food meets warm hospitality. 
            Nestled in the heart of the city, our restaurant blends Italian tradition 
            with modern culinary techniques.
          </p>
          <p className={styles.para}>
            Every dish reflects our unwavering commitment to quality. We partner with 
            local farmers and artisan producers to bring you the freshest ingredients, 
            transformed into culinary masterpieces by our passionate team.
          </p>

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
