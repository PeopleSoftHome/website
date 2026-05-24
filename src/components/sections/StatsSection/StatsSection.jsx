import { STATS_DATA } from '../../../data/stats';
import { useCountUp } from '../../../hooks/useCountUp';
import { useI18n }    from '../../../i18n/index';
import RevealWrapper  from '../../ui/RevealWrapper/RevealWrapper';
import styles         from './StatsSection.module.css';

export default function StatsSection() {
  const { t } = useI18n();
  return (
    <RevealWrapper>
      <div className={styles.section}>
        <div className="container">
          <div className={styles.grid}>
            {STATS_DATA.map((item, i) => (
              <StatItem
                key={item.id}
                target={item.target}
                suffix={item.suffix}
                label={t(`stats.${item.id}`)}
                isLast={i === STATS_DATA.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </RevealWrapper>
  );
}

function StatItem({ target, suffix, label, isLast }) {
  const { ref } = useCountUp(target, { suffix });
  return (
    <div className={[styles.item, isLast ? styles.last : ''].join(' ')}>
      <div className={styles.num}>
        <span ref={ref}>0</span>
        {/* suffix 已由 useCountUp 写入 textContent，此处不再重复渲染 */}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
