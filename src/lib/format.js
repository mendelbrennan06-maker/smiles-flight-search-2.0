export function ordinalDay(dateValue) {
  const date = parseLocalDate(dateValue);
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  return `${date.toLocaleString('en-US', { month: 'long' })} ${day}${suffix}`;
}

export function parseLocalDate(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatTimeToAmPm(value) {
  const clean = value.trim().toLowerCase().replace(/\s+/g, '');
  const amPmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (amPmMatch) return `${Number(amPmMatch[1])}:${amPmMatch[2] ?? '00'}${amPmMatch[3]}`;
  const twentyFourHour = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!twentyFourHour) return value;
  let hour = Number(twentyFourHour[1]);
  const minutes = twentyFourHour[2];
  const period = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12 || 12;
  return `${hour}:${minutes}${period}`;
}

export function timeToMinutes(value) {
  const formatted = formatTimeToAmPm(value);
  const match = formatted.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return 9999;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toLowerCase();
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatPoints(points) {
  return new Intl.NumberFormat('en-US').format(points);
}

export function calculatePointValue(points) {
  if (points <= 20_000) return 0.005;
  if (points <= 40_000) return 0.0045;
  if (points <= 60_000) return 0.0043;
  return 0.004;
}

export function formatUsd(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function brlToUsd(brl, enteredRate) {
  const adjustedRate = Math.max(enteredRate - 0.1, 0.01);
  return brl / adjustedRate;
}
