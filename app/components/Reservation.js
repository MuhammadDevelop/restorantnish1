'use client';
import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import styles from './Reservation.module.css';

export default function Reservation() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: '2', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section id="reservation" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className="section-label">{t('res_label')}</span>
          <h2 className="section-title">
            {t('res_title1')}<br />{t('res_title2')}
          </h2>
          <div className="divider" />
          <p className={styles.desc}>{t('res_desc')}</p>

          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>🕐</span>
              <div>
                <strong>{t('res_hours_title')}</strong>
                <span>{t('res_hours1')}</span>
                <span>{t('res_hours2')}</span>
              </div>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>📍</span>
              <div>
                <strong>{t('res_location_title')}</strong>
                <span>24 Via Bella, Milano</span>
                <span>Italy, 20121</span>
              </div>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>📞</span>
              <div>
                <strong>{t('res_phone_title')}</strong>
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
              <h3>{t('res_success_title')}</h3>
              <p>{t('res_success_text')}, <strong>{form.name}</strong>! {t('res_success_text2')} {form.date} {t('res_success_at')} {form.time}.</p>
              <button className={styles.resetBtn} onClick={() => setSubmitted(false)}>
                {t('res_another')}
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} id="reservation-form">
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-name">{t('res_field_name')}</label>
                  <input id="res-name" type="text" name="name" placeholder={t('res_placeholder_name')} value={form.name} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-email">{t('res_field_email')}</label>
                  <input id="res-email" type="email" name="email" placeholder={t('res_placeholder_email')} value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-date">{t('res_field_date')}</label>
                  <input id="res-date" type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-time">{t('res_field_time')}</label>
                  <select id="res-time" name="time" value={form.time} onChange={handleChange} required>
                    <option value="">{t('res_select_time')}</option>
                    {['12:00','13:00','14:00','18:00','19:00','20:00','21:00'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="res-phone">{t('res_field_phone')}</label>
                  <input id="res-phone" type="tel" name="phone" placeholder={t('res_placeholder_phone')} value={form.phone} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="res-guests">{t('res_field_guests')}</label>
                  <select id="res-guests" name="guests" value={form.guests} onChange={handleChange}>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? t('res_person') : t('res_people')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="res-message">{t('res_field_message')}</label>
                <textarea id="res-message" name="message" rows={4} placeholder={t('res_placeholder_message')} value={form.message} onChange={handleChange} />
              </div>
              <button type="submit" className={styles.submitBtn} id="submit-reservation">
                <span>{t('res_submit')}</span>
                <span>→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
