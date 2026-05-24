import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '../../../i18n/index';
import styles from './DemoModal.module.css';

const PHONE_REG = /^1[3-9]\d{9}$/;

export default function ModalStep1({ onNext }) {
  const { t } = useI18n();
  const [fields, setFields]     = useState({ name: '', company: '', phone: '', code: '' });
  const [errors, setErrors]     = useState({});
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  // 组件卸载时清理倒计时 interval
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const sendCode = useCallback(() => {
    if (!PHONE_REG.test(fields.phone)) {
      setErrors(prev => ({ ...prev, phone: t('modal.errPhone') }));
      return;
    }
    if (countdown > 0) return;
    let sec = 60;
    setCountdown(sec);
    timerRef.current = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) { clearInterval(timerRef.current); setCountdown(0); }
    }, 1000);
  }, [fields.phone, countdown, t]);

  const handleNext = useCallback(() => {
    const newErrors = {};
    if (fields.name.trim().length < 2)   newErrors.name    = t('modal.errName');
    if (fields.company.trim().length < 2) newErrors.company = t('modal.errName');
    if (!PHONE_REG.test(fields.phone))   newErrors.phone   = t('modal.errPhone');
    if (fields.code.trim().length !== 6) newErrors.code    = t('modal.errCode');
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onNext();
  }, [fields, onNext, t]);

  return (
    <div>
      <div className={styles.stepTitle}>{t('modal.step1Title')}</div>
      <div className={styles.stepSub}>{t('modal.step1Sub')}</div>

      <div className={styles.formRow}>
        <Field label={t('modal.labelName')} required error={errors.name}>
          <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            name="name" placeholder={t('modal.phName')}
            value={fields.name} onChange={handleChange} autoComplete="name" />
        </Field>
        <Field label={t('modal.labelCompany')} required error={errors.company}>
          <input className={`${styles.input} ${errors.company ? styles.inputError : ''}`}
            name="company" placeholder={t('modal.phCompany')}
            value={fields.company} onChange={handleChange} autoComplete="organization" />
        </Field>
      </div>

      <Field label={t('modal.labelPhone')} required error={errors.phone}>
        <input className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          name="phone" placeholder={t('modal.phPhone')} type="tel" maxLength={11}
          value={fields.phone} onChange={handleChange} autoComplete="tel" />
      </Field>

      <Field label={t('modal.labelCode')} required error={errors.code}>
        <div className={styles.verifyRow}>
          <input className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
            name="code" placeholder={t('modal.phCode')} type="number" maxLength={6}
            value={fields.code} onChange={handleChange} />
          <button className={styles.verifyBtn} onClick={sendCode} disabled={countdown > 0}>
            {countdown > 0 ? t('modal.resend', { n: countdown }) : t('modal.sendCode')}
          </button>
        </div>
      </Field>

      <button className={styles.submitBtn} onClick={handleNext}>{t('modal.next')}</button>
    </div>
  );
}

function Field({ label, required, error, children }) {
  const { t } = useI18n();
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}{required && <span className={styles.required}>{t('modal.required')}</span>}
      </label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
