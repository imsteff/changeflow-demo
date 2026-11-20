export const RICH_FIELDS = ['businessObjective', 'businessJustification', 'benefits', 'detailedRequirements',
  'proposedProcess', 'processFlow', 'expectedBehavior'];

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const isRichHtml = (value) => /^\s*<(p|ul|ol)[\s>]/i.test(value || '');

// for CRs saved before the editor
export const toRichHtml = (value) => {
  const text = value || '';
  if (!text.trim() || isRichHtml(text)) return text;
  return text.split(/\r?\n/).map((line) => `<p>${escapeHtml(line)}</p>`).join('');
};

export const richTextToPlain = (html) => (html || '')
  .replace(/<\/(p|li)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
  .replace(/\n{3,}/g, '\n\n')
  .trim();

export const hasRichText = (html) => richTextToPlain(html) !== '';

// for the link button: http(s) only
export const safeLinkUrl = (raw) => {
  const value = (raw || '').trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};
