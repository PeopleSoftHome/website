import styles from './ProductScreenshot.module.css';

/**
 * ProductScreenshot — 行业方案右侧产品截图卡
 * 根据 screenshot.type 渲染不同的模拟 UI 内容：
 *   table    - 考勤表格（制造业）
 *   metrics  - 数字卡片网格（零售）
 *   tasks    - 待办任务列表（互联网）
 *   timeline - 竞聘流程时间轴（央国企）
 *   grid9    - 九宫格人才盘点（金融）
 */
export default function ProductScreenshot({ screenshot }) {
  const { title, type } = screenshot;

  return (
    <div className={styles.card}>
      {/* 蓝色顶部标题栏 */}
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div>

      {/* 内容区 */}
      <div className={styles.body}>
        {type === 'table'    && <TableView    data={screenshot} />}
        {type === 'metrics'  && <MetricsView  data={screenshot} />}
        {type === 'tasks'    && <TasksView    data={screenshot} />}
        {type === 'timeline' && <TimelineView data={screenshot} />}
        {type === 'grid9'    && <Grid9View    data={screenshot} />}
      </div>
    </div>
  );
}

/* ── 制造业：考勤表格 ── */
function TableView({ data }) {
  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr><th>员工</th><th>班次</th><th>打卡</th><th>状态</th></tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.shift}</td>
              <td>{row.time}</td>
              <td>
                <span className={`${styles.dot} ${styles['dot_' + row.status]}`} />
                {row.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.tip && (
        <div className={styles.tip}>
          <div className={styles.tipLabel}>AI 智能提醒</div>
          <div className={styles.tipText}>{data.tip}</div>
        </div>
      )}
    </div>
  );
}

/* ── 零售：数字卡片 ── */
function MetricsView({ data }) {
  return (
    <div className={styles.metricsGrid}>
      {data.metrics.map((m) => (
        <div key={m.label} className={styles.metricCard}>
          <div className={styles.metricValue} style={{ color: m.color }}>{m.value}</div>
          <div className={styles.metricLabel}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── 互联网：待办任务 ── */
function TasksView({ data }) {
  return (
    <div className={styles.taskList}>
      <div className={styles.taskHeader}>待处理事项</div>
      {data.tasks.map((t, i) => (
        <div key={i} className={styles.taskItem}>
          <span className={styles.taskText}>{t.text}</span>
          <span className={styles.taskStatus} style={{ color: t.statusColor }}>{t.status}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 央国企：竞聘时间轴 ── */
function TimelineView({ data }) {
  return (
    <div className={styles.timeline}>
      {data.steps.map((step, i) => (
        <div key={i} className={styles.timelineStep}>
          <div className={styles.timelineIcon}>{step.icon}</div>
          <div className={styles.timelineConnector} aria-hidden="true" />
          <div className={styles.timelineLabel}>{step.label}</div>
          <div className={styles.timelineDesc}>{step.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ── 金融：九宫格人才盘点 ── */
function Grid9View({ data }) {
  return (
    <div>
      <div className={styles.grid9Label}>
        <span>绩效表现 →</span>
        <span style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '10px' }}>潜力</span>
      </div>
      <div className={styles.grid9}>
        {data.cells.map((cell, i) => (
          <div
            key={i}
            className={styles.grid9Cell}
            style={{ background: cell.bg }}
          >
            <div className={styles.grid9Name} style={{ color: cell.color }}>{cell.label}</div>
            <div className={styles.grid9Count} style={{ color: cell.color }}>{cell.count}人</div>
          </div>
        ))}
      </div>
    </div>
  );
}
