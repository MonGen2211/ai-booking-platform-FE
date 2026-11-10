import { TIMEZONE } from '../constants';
import { getLocale } from '../i18n';
export const money = (value: string) => new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value));
export const dateTime = (value: string, timezone = TIMEZONE) => new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value));
export const time = (value: string, timezone = TIMEZONE) => new Intl.DateTimeFormat(getLocale(), { hour: '2-digit', minute: '2-digit', timeZone: timezone }).format(new Date(value));
export function localDate(value = new Date(), timezone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone }).formatToParts(value);
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)!.value).join('-');
}
export function addDays(value: string, count: number) { const d = new Date(`${value}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0, 10); }
export function saveBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
