# Kiểm tra giao diện

Chạy frontend bằng `npm run dev` tại `http://localhost:5173`, sau đó chạy `npm run check:ui` trong terminal thứ hai. Script dùng Chrome cài sẵn qua Playwright, không cần tải browser riêng.

Kiểm tra ở chiều rộng 375, 768 và 1440px:

- Nút đặt lịch có chiều cao tối thiểu 44px, khoảng đệm và chữ trắng trên nền xanh.
- Trang chủ và trang đặt lịch không tràn ngang; truy cập trực tiếp `/booking` hoạt động.
- Dialog đăng nhập nằm trong viewport; email được focus sau animation mở.
- Ô nhập có viền, trạng thái focus; hiện/ẩn mật khẩu và chuyển đăng ký hoạt động.
- Escape đóng dialog và các trang không phát sinh lỗi JavaScript.
- Widget chatbot ở góc phải dưới mở/thu gọn, focus ô nhập và Escape trả focus về nút mở. Gửi Enter hiển thị tin nhắn cục bộ, không gọi API chatbot; khung chat nằm gọn trong viewport ở cả 3 kích thước.

Ảnh kết quả được lưu trong `artifacts/ui/` và không đưa vào source control. Script không gửi thông tin đăng nhập hay tạo tài khoản/lịch hẹn.

## CSS layer

`index.html` khai báo thứ tự `theme, base, mui, components, utilities` **trước** meta `emotion-insertion-point`. MUI chèn global styles tại insertion point này, vì vậy Tailwind preflight ở layer base không ghi đè style component MUI.

Giữ các reset toàn cục cho thẻ HTML trong `@layer base`. Không thêm reset unlayered cho button/input/link vì chúng có thể ghi đè màu chữ và typography MUI. Kích thước nút, form và khoảng đệm dialog dùng theme chung tại `src/app/theme.ts`.

## Danh sách bác sĩ trong trang đặt khám

`DoctorPicker` có state Redux riêng với danh sách phân trang ở trang chủ. Gọi `GET /doctors?page=N&pageSize=5`, nối kết quả theo id khi cuộn gần cuối hoặc nhấn “Tải thêm bác sĩ”. Không gọi tiếp khi hết trang; giữ danh sách đã tải và bác sĩ được chọn khi lỗi. Footer có loading, số lượng và nút thử lại đúng trang lỗi. Bác sĩ từ `doctorId` được giữ riêng nếu trang chứa bác sĩ đó chưa được tải.

Chạy `npm run check:doctor-scroll` với frontend đang chạy để kiểm tra 375/1440px bằng fixture 13 bác sĩ: tải 3 trang, lỗi trang 2 rồi retry, chống request/option trùng, giữ bác sĩ từ URL và chọn được bác sĩ ở trang cuối. Fixture chỉ tồn tại trong Playwright, không ghi dữ liệu backend.

## Ngôn ngữ và thao tác input

Kiểm tra tương tác input: chạy `node scripts/check-input-focus.mjs` khi frontend đang chạy. Script xác nhận input không có outline vàng, chỉ ô tìm kiếm tắt autocomplete, thông tin đăng nhập vẫn dùng autofill đúng loại, tiêu đề không editable và nút/link còn focus xanh cho bàn phím. Không dùng `contenteditable` hoặc tắt lựa chọn văn bản toàn trang.

- Noto Sans được đóng gói qua `@fontsource/noto-sans`, gồm Latin và Vietnamese, trọng lượng 400/500/600/700; không cần Google Fonts hay kết nối font ngoài.
- Chọn VI/EN trên header. Chỉ lưu lựa chọn ngôn ngữ trong localStorage (`antam.language`), mặc định tiếng Việt; không lưu nội dung hồ sơ/chat vào localStorage.
- Nội dung UI tập trung trong `src/i18n/en.ts`, dùng `t()` và `useLanguage()` để cập nhật tại chỗ mà không remount form. Giữ nguyên tên bác sĩ, hồ sơ và nội dung người dùng. Thêm bản dịch vào dictionary khi thêm thông báo mới.
- Ngày giờ/tiền dùng locale theo ngôn ngữ; đơn vị tiền vẫn VND và timezone khám vẫn theo backend.
- `npm run check:languages` kiểm tra đổi ngôn ngữ, reload, font thực tế, dialog auth, chatbot, mobile/desktop và lưu draft. Phần kiểm tra booking dùng API fixture qua Playwright route interception, không ghi vào backend thật.

## Kết quả ngày 10/11/2026

- Chrome headless: pass cả 3 kích thước; không tràn ngang, không có pageerror.
- `npm run build`: pass; Vite còn cảnh báo bundle lớn hơn 500 kB.
- `npm run lint`: pass.
- Backend `/doctors` đang trả danh sách rỗng, nên lượt kiểm tra này xác nhận UI khách/empty state và dialog auth; chưa xác nhận luồng đặt lịch thật có bác sĩ.
