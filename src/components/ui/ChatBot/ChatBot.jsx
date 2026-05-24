import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useI18n } from '../../../i18n/index';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { BOT_AVATAR, FAQ_RULES_META, FALLBACK_REPLY_KEYS } from './chatData';
import styles from './ChatBot.module.css';

/**
 * ChatBot — TalentPro 智能客服（v2.3.2 Phase 2 国际化）
 *
 * 功能：
 *  - 关键词匹配自动回复（基于 FAQ_RULES_META + i18n）
 *  - 快捷回复按钮（引导式对话）
 *  - 打字机效果（bot 消息逐字显示）
 *  - 人工接入申请
 *  - 支持 openModal 操作（跳转预约演示）
 *
 * @param {boolean} isOpen      - 是否显示
 * @param {function} onClose    - 关闭回调
 * @param {function} onOpenDemo - 打开预约演示弹窗
 */
export default function ChatBot({ isOpen, onClose, onOpenDemo }) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandoff, setIsHandoff] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const windowRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const timersRef = useRef([]);

  useFocusTrap(isOpen, windowRef);

  /* ── 当前语言的动态数据 ── */
  const faqRules = useMemo(() => {
    return FAQ_RULES_META.map(meta => ({
      ...meta,
      reply: t(`chatBot.faq.${meta.id}.reply`),
      quickReplies: t(`chatBot.faq.${meta.id}.quickReplies`) || [],
    }));
  }, [t]);

  const fallbackReplies = useMemo(() => {
    return FALLBACK_REPLY_KEYS.map(k => t(`chatBot.${k}`)).filter(Boolean);
  }, [t]);

  const welcomeMessages = useMemo(() => [
    { text: t('chatBot.welcome1'), quickReplies: [] },
    { text: t('chatBot.welcome2'), quickReplies: t('chatBot.welcomeQuickReplies') || [] },
  ], [t]);

  const quickRepliesDefault = useMemo(() => t('chatBot.quickRepliesDefault') || [], [t]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const matchRule = useCallback((text) => {
    const lower = text.toLowerCase();
    for (const rule of faqRules) {
      if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        return rule;
      }
    }
    return {
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)] || '',
      quickReplies: [],
    };
  }, [faqRules, fallbackReplies]);

  /* ── 初始化欢迎语（仅首次打开）── */
  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true);
      let delay = 300;
      welcomeMessages.forEach((msg, i) => {
        const id = setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + i,
            from: 'bot',
            text: msg.text,
            quickReplies: msg.quickReplies,
            time: now(locale),
          }]);
        }, delay);
        timersRef.current.push(id);
        delay += 800;
      });
    }
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      timersRef.current.push(id);
    }
    return clearAllTimers;
  }, [isOpen, initialized, welcomeMessages, locale, clearAllTimers]);

  /* ── 消息更新时滚动到底部 ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── 发送用户消息 ── */
  const sendMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'user',
      text: trimmed,
      time: now(locale),
    }]);
    setInput('');

    setIsTyping(true);
    const matched = matchRule(trimmed);
    const delay = 800 + Math.random() * 600;

    const id = setTimeout(() => {
      setIsTyping(false);

      if (matched.action === 'openModal') {
        onOpenDemo?.();
      }
      if (matched.isHandoff) {
        setIsHandoff(true);
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'bot',
        text: matched.reply,
        quickReplies: matched.quickReplies,
        time: now(locale),
      }]);
    }, delay);
    timersRef.current.push(id);
  }, [matchRule, locale, onOpenDemo]);

  /* ── 点击快捷回复 ── */
  const handleQuickReply = useCallback((text) => {
    const lower = text.toLowerCase();
    // 语义检测：包含"演示/demo/预约"关键词 → 打开预约弹窗
    if (lower.includes('演示') || lower.includes('demo') || lower.includes('预约') || lower.includes('book')) {
      onOpenDemo?.();
      sendMessage(text);
      return;
    }
    // 语义检测：包含"人工/agent/客服"关键词 → 转人工
    if (lower.includes('人工') || lower.includes('agent') || lower.includes('human') || lower.includes('客服') || lower.includes('service')) {
      sendMessage(t('chatBot.handoffBtn'));
      return;
    }
    sendMessage(text);
  }, [sendMessage, onOpenDemo, t]);

  /* ── 键盘发送 ── */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  /* ── Escape 关闭 ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t('chatBot.title')}>
      <div className={styles.window} ref={windowRef}>

        {/* ── 顶部标题栏 ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{BOT_AVATAR}</div>
            <div>
              <div className={styles.botName}>{t('chatBot.botName')}</div>
              <div className={styles.status}>
                <span className={styles.statusDot} />
                {isHandoff ? t('chatBot.statusHandoff') : t('chatBot.statusOnline')}
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.handoffBtn}
              onClick={() => sendMessage(t('chatBot.handoffBtn'))}
              title={t('chatBot.handoffBtn')}
              aria-label={t('chatBot.handoffBtn')}
            >
              👤
            </button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t('chatBot.closeAria')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── 消息列表 ── */}
        <div className={styles.messages} aria-live="polite" aria-atomic="false">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onQuickReply={handleQuickReply}
            />
          ))}

          {/* 打字指示器 */}
          {isTyping && (
            <div className={styles.typingRow} aria-hidden="true">
              <span className={styles.typingAvatar}>{BOT_AVATAR}</span>
              <div className={styles.typingBubble}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          {/* 人工接入提示条 */}
          {isHandoff && (
            <div className={styles.handoffBar}>
              <span>👤</span>
              <span>{t('chatBot.handoffMsg')}</span>
              <a href="tel:4008888888" className={styles.handoffCall}>
                {t('chatBot.handoffCall')}
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── 输入区 ── */}
        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatBot.placeholder')}
            aria-label={t('chatBot.placeholder')}
            rows={1}
          />
          <button
            className={[styles.sendBtn, input.trim() ? styles.sendActive : ''].join(' ')}
            onClick={() => sendMessage(input)}
            aria-label={t('chatBot.sendAria')}
          >
            ➤
          </button>
        </div>

        {/* ── 底部快捷入口 ── */}
        {messages.length <= 2 && !isTyping && (
          <div className={styles.quickArea}>
            {quickRepliesDefault.map(q => (
              <button
                key={q}
                className={styles.quickChip}
                onClick={() => handleQuickReply(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 单条消息气泡 ── */
function MessageItem({ msg, onQuickReply }) {
  const isBot = msg.from === 'bot';

  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className={[styles.msgRow, isBot ? styles.botRow : styles.userRow].join(' ')}>
      {isBot && <span className={styles.msgAvatar}>{BOT_AVATAR}</span>}

      <div className={styles.msgGroup}>
        <div className={[styles.bubble, isBot ? styles.botBubble : styles.userBubble].join(' ')}>
          {renderText(msg.text)}
        </div>

        <div className={styles.msgTime}>{msg.time}</div>

        {/* 快捷回复按钮 */}
        {isBot && msg.quickReplies?.length > 0 && (
          <div className={styles.quickReplies}>
            {msg.quickReplies.map((q) => (
              <button
                key={q}
                className={styles.quickReply}
                onClick={() => onQuickReply(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 工具函数 ── */
function now(locale) {
  const loc = locale === 'en' ? 'en-US' : locale === 'zh-TW' ? 'zh-TW' : 'zh-CN';
  return new Date().toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
}
