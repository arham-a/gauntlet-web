/*
  Every derived fact about a competition is computed here, from real fields.
  Screens import these instead of hardcoding badges — which is how the old UI
  ended up showing a difficulty level and a countdown that no field backed.
*/

const MS_HOUR = 3600 * 1000;
const MS_DAY = 24 * MS_HOUR;

/** Entry fee. Never render a bare number — it reads as "500 what?". */
export function formatPrice(price) {
  const n = Number(price);
  if (!n || Number.isNaN(n)) return 'Free';
  return `PKR ${n.toLocaleString('en-PK')}`;
}

/** Short absolute date, e.g. "12 Sep". Adds the year when it isn't this one. */
export function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * Relative time that degrades honestly: returns null for a missing or
 * unparseable date so callers render "—" instead of "NaN years ago".
 */
export function formatRelative(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const past = diff >= 0;

  if (abs < 60 * 1000) return 'just now';
  const units = [
    ['minute', 60 * 1000],
    ['hour', MS_HOUR],
    ['day', MS_DAY],
    ['month', 30 * MS_DAY],
    ['year', 365 * MS_DAY],
  ];
  let out = 'just now';
  for (const [name, ms] of units) {
    if (abs >= ms) {
      const n = Math.floor(abs / ms);
      out = `${n} ${name}${n === 1 ? '' : 's'}`;
    }
  }
  return past ? `${out} ago` : `in ${out}`;
}

/**
 * Status derived purely from the deadline.
 *   none    - organiser set no deadline
 *   open    - more than 48h remaining
 *   closing - inside 48h
 *   closed  - past
 */
export function deadlineState(deadline) {
  if (!deadline) {
    return { status: 'none', label: 'No deadline', remaining: null, isClosed: false };
  }
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) {
    return { status: 'none', label: 'No deadline', remaining: null, isClosed: false };
  }

  const left = d.getTime() - Date.now();
  if (left <= 0) {
    return { status: 'closed', label: 'Closed', remaining: null, isClosed: true, date: d };
  }

  const days = Math.floor(left / MS_DAY);
  const hours = Math.floor((left % MS_DAY) / MS_HOUR);
  const mins = Math.floor((left % MS_HOUR) / (60 * 1000));

  let remaining;
  if (days >= 1) remaining = `${days}d ${hours}h`;
  else if (hours >= 1) remaining = `${hours}h ${mins}m`;
  else remaining = `${mins}m`;

  return {
    status: left <= 2 * MS_DAY ? 'closing' : 'open',
    label: left <= 2 * MS_DAY ? 'Closing soon' : 'Open for entry',
    remaining,
    isClosed: false,
    date: d,
  };
}

/** Tailwind classes for a status chip, keyed by deadlineState().status. */
export const statusClasses = {
  open: 'bg-live-soft text-live',
  closing: 'bg-warn-soft text-warn',
  closed: 'bg-closed-soft text-closed',
  none: 'bg-closed-soft text-closed',
};

/** Convert a Date to the value an <input type="datetime-local"> expects. */
export function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
