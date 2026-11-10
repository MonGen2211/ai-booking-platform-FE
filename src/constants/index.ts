import type { AppointmentStatus } from '../api/types';
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const STATUS_LABELS: Record<AppointmentStatus, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Đã khám', CANCELLED: 'Đã hủy' };
export const CANCEL_REASONS = { CHANGE_PLANS: 'Thay đổi kế hoạch', HEALTH_CHANGED: 'Tình trạng sức khỏe thay đổi', BOOKED_WRONG: 'Đặt nhầm lịch', OTHER: 'Lý do khác' };
