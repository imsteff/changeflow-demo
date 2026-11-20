import { format, formatDistanceToNowStrict, isValid } from 'date-fns';

export const getInitials = (name = '') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0].toUpperCase())
  .join('');

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

// for server dates: zoneless means Manila
export const parseServerDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const str = String(value).trim();
  const dateOnly = DATE_ONLY.exec(str);
  const iso = str.replace(' ', 'T');
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(HAS_ZONE.test(iso) ? iso : `${iso}+08:00`);
  return isValid(date) ? date : null;
};

const formatWith = (pattern) => (value) => {
  const date = parseServerDate(value);
  return date ? format(date, pattern) : '';
};

export const formatDate = formatWith('MMM d, yyyy');
export const formatDateTime = formatWith('MMM d, yyyy h:mm a');

export const timeAgo = (value) => {
  const date = parseServerDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : '';
};

const STATUS_MESSAGES = {
  pending_ao: (no) => `${no} sent to the approving officer for approval`,
  pending_sapm: (no) => `${no} sent to SA/PM for review`,
  pending_final: (no) => `${no} sent to the general manager for final approval`,
  returned: (no) => `${no} returned to the requestor for changes`,
  pending_req: (no) => `${no} fully approved, REQ creation is next`,
  req_processing: (no) => `${no} is with you, enter its REQ to complete it`,
  completed: (no) => `${no} is completed`,
  rejected: (no) => `${no} is closed and will not proceed`,
};

// for action toasts
export const statusMessage = ({ crNo, status, statusLabel }) => (
  STATUS_MESSAGES[status] ? STATUS_MESSAGES[status](crNo) : `${crNo} is now ${statusLabel}`
);
