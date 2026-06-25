'use client';
import { useState } from 'react';
import styles from './Reservation.module.css';

export default function Reservation() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', date: '', time: '', guests: '2', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="reservation" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className="section-label">Book a Table</span>
          <h2 className="section-title">Reserve Your<br />Experience</h2>
          <div className="divider" />
          <p className={styles.desc}>
            Join us for an unforgettable evening. We welcome reservations 
            for all occasions — from intimate dinners to large celebrations.
          </p>

          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>🕐</span>
              <div>
                <strong>Opening Hours</strong>
                <span>Mon–Thu: 12pm – 10pm</span>
                <span>Fri–Sun: 12pm – 11:30pm</span>
              </div>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>📍</span>
              <div>
                <strong>Location</strong>
                <span>24 Via Bella, Milano</span>
                <span>Italy, 20121</span>
              </div>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>📞</span>
              <div>
                <strong>Reservations</strong>
                <span>+39 02 1234 5678</span>
                <span>info@bellavista.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formWrap}>
          {submitted ? (
            <div className={styles.success}>
              <span className={styles.successIcon}>✦</span>
              <h3>Reservation Confirmed!</h3>
              <p>Thank you, <strong>{form.name}</strong>! We look forward to welcoming you on {form.date} at {form.time}.</p>
              <button className={styles.resetBtn} onClick={() => setSubmitted(false)}>
                Make Another Reservation
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} id="reservation-form">
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-name">Full Name</label>
                  <input
                    id="res-name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-email">Email</label>
                  <input
                    id="res-email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-date">Date</label>
                  <input
                    id="res-date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-time">Time</label>
                  <select id="res-time" name="time" value={form.time} onChange={handleChange} required>
                    <option value="">Select time</option>
                    <option>12:00 PM</option>
                    <option>1:00 PM</option>
                    <option>2:00 PM</option>
                    <option>6:00 PM</option>
                    <option>7:00 PM</option>
                    <option>8:00 PM</option>
                    <option>9:00 PM</option>
                  </select>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-phone">Phone</label>
                  <input
                    id="res-phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 890"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-guests">Guests</label>
                  <select id="res-guests" name="guests" value={form.guests} onChange={handleChange}>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="res-message">Special Requests</label>
                <textarea
                  id="res-message"
                  name="message"
                  rows={4}
                  placeholder="Any dietary requirements, allergies, or special occasions..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className={styles.submitBtn} id="submit-reservation">
                <span>Confirm Reservation</span>
                <span>→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
