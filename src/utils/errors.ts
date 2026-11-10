import axios from 'axios';
import type { ApiError } from '../api/types';
const messages: Record<string, string> = {
  VALIDATION_ERROR: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.', EMAIL_ALREADY_EXISTS: 'Email này đã được đăng ký.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.', AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  AUTH_REFRESH_RACE: 'Phiên đang được cập nhật ở cửa sổ khác. Vui lòng khôi phục phiên hoặc đăng nhập lại.',
  CSRF_INVALID: 'Phiên xác thực biểu mẫu đã thay đổi. Vui lòng thử lại.', ORIGIN_NOT_ALLOWED: 'Địa chỉ website chưa được backend cho phép.',
  SELF_PROFILE_EXISTS: 'Bạn đã có hồ sơ bản thân. Hãy sửa hồ sơ hiện có.', SLOT_UNAVAILABLE: 'Giờ khám vừa hết chỗ. Vui lòng chọn giờ khác.',
  BOOKING_DETAILS_CHANGED: 'Phí hoặc địa chỉ đã thay đổi. Vui lòng xác nhận lại.', IDEMPOTENCY_CONFLICT: 'Yêu cầu đã thay đổi. Vui lòng kiểm tra lịch hẹn trước khi đặt lại.',
  VERSION_CONFLICT: 'Lịch hẹn đã được cập nhật. Vui lòng xem thông tin mới.', DOCTOR_INACTIVE: 'Bác sĩ hiện không nhận lịch mới.',
  ATTACHMENT_NOT_FOUND: 'File không còn khả dụng hoặc đã hết hạn.', BOOKING_UNAVAILABLE: 'Chưa thể xác định kết quả đặt lịch. Hãy thử lại cùng yêu cầu.',
};
export function apiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error && !axios.isAxiosError(error)) return error as ApiError;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const code = data?.code || (error.response ? 'API_ERROR' : 'NETWORK_ERROR');
    const status = error.response?.status;
    return { code, status, suggestions: data?.suggestions, message: messages[code] || (status === 401 ? 'Vui lòng đăng nhập để tiếp tục.' : status === 409 ? 'Thông tin đã thay đổi hoặc thao tác không còn được phép. Vui lòng tải lại.' : status === 403 ? 'Bạn không thể thực hiện thao tác này.' : status === 404 ? 'Không tìm thấy dữ liệu.' : error.response ? 'Không thể thực hiện yêu cầu. Vui lòng thử lại.' : 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.') };
  }
  return { code: 'UNKNOWN', message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
}
