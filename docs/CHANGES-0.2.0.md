# Thay đổi tệp đầy đủ 0.2.0

Các tệp tính năng mới:
- `src/ledger-plan.js`: Tính thử trên bản sao theo quy tắc gốc, mã băm nguồn mạnh, kiểm tra lịch sử.
- `src/ledger-service.js`: Xem trước tường minh, Web Locks, đối chiếu máy chủ trước khi thực thi, lưu vào mục tiêu cố định, đọc lại và đóng băng khi mơ hồ.
- `vendor/original/ledger-kernel.js`, `reward-kernel.js`, `ledger-provenance.json`: Sản phẩm trích xuất hạt nhân gốc có thể truy xuất nguồn gốc.
- `tools/extract-ledger.mjs`: Chọn hàm dựa trên Acorn AST, không chạy bộ gắn kết DOM cũ.
- `tests/ledger.test.js`, `native_ledger.py`, `native_ledger_guards.py`: Kiểm thử thuần logic, sổ cái thực tế, tiêm lỗi, đồng thời cùng nguồn và chuyển cuộc trò chuyện.

Cập nhật đầy đủ:
- `manifest.json`, `package.json`, thêm mới `package-lock.json`: 0.2.0, URL kho lưu trữ thực tế, các phụ thuộc công cụ phát triển.
- `src/host-adapter.js`, `src/terminal.js`, `src/contracts.js`: Bảy khung nhìn, công tắc thực tế, xác nhận thao tác, chứng từ hệ thống trong chính văn, ma trận năng lực chính xác.
- `styles/host.css`, `styles/shell.css`: Giao dịch Vạn Giới, thẻ kho hàng gốc, xem trước quyết toán và chứng từ chính văn.
- Ba kịch bản hồi quy gốc: hỗ trợ tên thư mục sau khi cài đặt từ kho lưu trữ Git thực tế; thiết bị di động bao phủ bảy khung nhìn.
- README, ma trận tính năng, bản ghi nghiệm thu, thuyết minh nguồn gốc và ảnh chụp màn hình.

Năm tệp gốc giữ nguyên cấu trúc, hai tệp JSON nhập cục bộ cũ không đưa vào gói và không tải lên. Kho lưu trữ Git của dự án gốc không bị ghi đè. Kho lưu trữ mới tách biệt với dự án cũ.
