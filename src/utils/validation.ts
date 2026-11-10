import type { Attachment, ProfileInput } from '../api/types';
import { localDate } from './format';
export function profileError(p: ProfileInput) {
  if (!p.fullName.trim() || p.fullName.trim().length > 191) return 'Họ tên cần từ 1 đến 191 ký tự.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) || p.birthDate > localDate() || Number.isNaN(Date.parse(p.birthDate)) || new Date(p.birthDate).toISOString().slice(0, 10) !== p.birthDate) return 'Ngày sinh không hợp lệ.';
  if (!/^\+?[0-9\s()-]{7,32}$/.test(p.phone.trim())) return 'Số điện thoại chưa hợp lệ.';
  if (p.kind === 'RELATIVE' && (!p.relationship?.trim() || p.relationship.trim().length > 64)) return 'Vui lòng nhập quan hệ với người thân (tối đa 64 ký tự).';
  return '';
}
export function fileError(file: Pick<File, 'size' | 'type'>, count: number) {
  if (count >= 5) return 'Mỗi lịch khám tối đa 5 file.';
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) return 'Chỉ nhận JPEG, PNG hoặc PDF.';
  if (!file.size || file.size > 10 * 1024 * 1024) return 'File cần lớn hơn 0 và không quá 10 MiB.';
  return '';
}
export const filesReady = (files: Attachment[], pending: boolean, now = Date.now()) => !pending && files.every(f => !!f.expiresAt && new Date(f.expiresAt).getTime() > now);
