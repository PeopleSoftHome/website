import { escapeHtml } from '@/utils/markdown';

export { escapeHtml };

export const formatMessage = (text: string): string => {
  if (!text) return '';
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part: string) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      return escapeHtml(part).replace(/\n/g, '<br>');
    })
    .join('');
};

export const nowTime = (locale: string): string => {
  const loc = locale === 'en' ? 'en-US' : locale === 'zh-TW' ? 'zh-TW' : 'zh-CN';
  return new Date().toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
};
