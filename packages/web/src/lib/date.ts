export const APP_TIME_ZONE = 'Asia/Taipei';

const dateTimeFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const shortDateHourFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: APP_TIME_ZONE,
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatTaipeiDateTime(value: string | number | Date | null | undefined) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function formatTaipeiShortHour(value: string | number | Date | null | undefined) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : shortDateHourFormatter.format(date);
}
