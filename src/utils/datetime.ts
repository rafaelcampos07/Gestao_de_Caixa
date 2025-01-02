import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Sao_Paulo';

export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(parsedDate, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy HH:mm');
}

export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(parsedDate, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy');
}

export function formatTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(parsedDate, TIMEZONE);
  return format(zonedDate, 'HH:mm');
}

export function toUTC(date: Date): Date {
  return zonedTimeToUtc(date, TIMEZONE);
}