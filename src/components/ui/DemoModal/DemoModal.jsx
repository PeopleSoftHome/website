import { useI18n } from '../../../i18n/index';
import { useModalContext } from '../../../context/ModalContext';
import BaseModal from '../BaseModal/BaseModal';
import ModalStep1 from './ModalStep1';
import ModalStep2 from './ModalStep2';
import ModalStep3 from './ModalStep3';
import ModalSuccess from './ModalSuccess';
import styles from './DemoModal.module.css';

/**
 * DemoModal — SEC-15 预约演示弹窗
 * 状态机：Step0（联系信息）→ Step1（产品选择）→ Step2（企业规模）→ 成功态
 * 关闭：X 按钮 / 点击遮罩 / ESC（由 BaseModal 统一管理）
 */
export default function DemoModal() {
  const { isOpen, step, isSuccess, closeModal, nextStep, submitForm } = useModalContext();
  const { t } = useI18n();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      ariaLabel={t('modal.step1Title')}
      overlayClassName={[styles.overlay, isOpen ? styles.overlayOpen : ''].join(' ')}
    >
      <div className={styles.modal}>
        {/* 关闭按钮 */}
        <button className={styles.closeBtn} onClick={closeModal} aria-label={t('modal.close')}>✕</button>

        {/* 步骤进度条（成功态时全绿）*/}
        {!isSuccess && (
          <div className={styles.steps}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={[
                  styles.stepDot,
                  i < step ? styles.stepDone
                    : i === step ? styles.stepActive
                    : '',
                ].join(' ')}
              />
            ))}
          </div>
        )}

        {/* 页面内容 */}
        {isSuccess ? (
          <ModalSuccess />
        ) : step === 0 ? (
          <ModalStep1 onNext={nextStep} />
        ) : step === 1 ? (
          <ModalStep2 onNext={nextStep} />
        ) : (
          <ModalStep3 onSubmit={submitForm} />
        )}
      </div>
    </BaseModal>
  );
}
