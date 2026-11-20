import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { toRichHtml } from '@/utils/richText';

// for display: second sanitize pass
const PURIFY = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
};

export default function RichText({ value, className }) {
  const html = useMemo(() => DOMPurify.sanitize(toRichHtml(value), PURIFY), [value]);
  return <div className={cn('rich-text whitespace-normal', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
