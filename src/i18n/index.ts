import { useSyncExternalStore } from 'react';
import { en } from './en';
export type Language = 'vi' | 'en';
const key = 'antam.language';
let language: Language = 'vi';
try { if (localStorage.getItem(key) === 'en') language = 'en'; } catch { /* Storage is optional. */ }
const subscribers = new Set<() => void>();
const originalCopy = Object.fromEntries(Object.entries(en).map(([vi, english]) => [english, vi]));
export const getLanguage = () => language;
export const getLocale = () => language === 'en' ? 'en-GB' : 'vi-VN';
export function setLanguage(next: Language) {
  if (next === language) return;
  language = next;
  try { localStorage.setItem(key, next); } catch { /* Continue when storage is blocked. */ }
  updateDocument();
  subscribers.forEach(listener => listener());
}
export function useLanguage() {
  return useSyncExternalStore(listener => { subscribers.add(listener); return () => { subscribers.delete(listener); }; }, getLanguage, () => 'vi' as Language);
}
export function t(source: string, ...values: (string | number)[]) {
  const original = originalCopy[source] || source;
  const template = language === 'en' ? en[original] || source : original;
  return template.replace(/\{(\d+)\}/g, (match, index) => String(values[Number(index)] ?? match));
}
function updateDocument() {
  document.documentElement.lang = language;
  document.title = language === 'en' ? 'An Tâm — Book an appointment' : 'An Tâm — Đặt lịch khám';
  document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'en' ? 'An Tâm — Find doctors, book a visit and manage appointments for you and your family.' : 'An Tâm — Tìm bác sĩ, chọn giờ khám và quản lý lịch hẹn cho bạn và gia đình.');
}
updateDocument();
window.addEventListener('storage', event => { if(event.key === key) setLanguage(event.newValue === 'en' ? 'en' : 'vi'); });
