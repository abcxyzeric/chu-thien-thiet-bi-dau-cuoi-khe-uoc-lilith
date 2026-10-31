# Các tệp giai đoạn 0.1.0 và phạm vi bàn giao (Hồ sơ lịch sử)

## Các tệp tiện ích mở rộng nguyên bản thêm mới

- `manifest.json`: khai báo tiện ích mở rộng nguyên bản, ngưỡng phiên bản trình khách tối thiểu tương ứng với phạm vi tương thích chính xác, các hook vòng đời.
- `index.js`: khởi chạy bất đồng bộ chờ máy chủ, chống chạy trùng khi bật/tắt nhanh, dọn dẹp thực thể.
- `src/contracts.js`: danh tính, ảnh chụp nhanh, chuẩn hóa ý định, ma trận năng lực.
- `src/host-adapter.js`: tương thích máy chủ thật, chỉ đọc biến gốc, lời nhắc hồi tưởng gốc, gửi tin nhắn người chơi sau khi xác nhận rõ ràng và đọc lại từ máy chủ.
- `src/terminal.js`: 6 khung nhìn, gắn ảnh đứng nguyên bản, làm trơ thẻ đánh dấu trong chính văn, bảng di động, bản nháp tương tác.
- `styles/host.css`, `styles/shell.css`: kiểu dáng đầy đủ cho lối vào máy chủ, nhãn trò chuyện và thiết bị đầu cuối cô lập.
- `assets/original/lilith.webp`, `avatar.webp`: trích xuất từ bộ tư liệu gốc.
- `assets/star-sea.jpg`: kế thừa hình nền ý tưởng biển sao từ vòng trước.
- `vendor/original/runtime.js`: gói đóng gói riêng tư các mô-đun nguyên bản đã trích xuất.
- `vendor/original/provenance.json`: nguồn gốc, cơ sở và mã băm.
- `tests/contracts.test.js`: 15 bài kiểm tra logic thuần túy / nguồn gốc.
- `tests/native_acceptance.py`, `native_guards.py`, `native_views.py`: nghiệm thu máy chủ cô lập thực tế, yêu cầu tham số chạy cô lập rõ ràng.
- `tools/extract_original.py`: kịch bản trích xuất mô-đun gốc có thể tái lập.
- `package.json`, `.gitignore`, `README.md`, tài liệu trong thư mục này, JSON nghiệm thu gốc, 4 ảnh chụp màn hình máy chủ.
- `FILELIST.sha256`: danh sách kiểm tra mã băm các tệp trong gói, không bao gồm chính nó.

## 5 tệp gốc

`assistant-v1.1.js`, `statusbar-v3.1.css`, `statusbar-v3.1-part1.js`, `statusbar-v3.1-part2.js`, `statusbar-v3.1-part3.js`: giữ nguyên đầy đủ cùng tên trong `vendor/original/`, không coi các bản vá rời rạc là tệp gốc để bàn giao. Chúng là cơ sở đối chiếu di chuyển, không thực thi toàn bộ kịch bản máy chủ cũ tại điểm kiểm tra này.

## Những thao tác không xảy ra

- Chưa viết lại kho lưu trữ GitHub gốc, chưa đẩy lên bất kỳ kho lưu trữ mới nào, chưa phát hành.
- Chưa sửa đổi quy tắc khớp thanh trạng thái gốc / HTML tải qua regex, chưa sửa đổi hay tải lên hai tệp JSON nhập cục bộ đó.
- Chưa di chuyển hay đặt lại bản lưu cũ của người dùng, chưa kết nối khóa mô hình, chưa thực hiện yêu cầu gọi mô hình có tính phí.
- Không đóng gói bản thân quán rượu cô lập, cấu hình chạy của nó, thư mục tài khoản thử nghiệm, tệp kết nối MCP hay bất kỳ bộ nhớ đệm phụ thuộc nào vào gói tiện ích mở rộng.

## Một sản phẩm bàn giao cũ khác

Tài nguyên Lilith của bản mẫu ý tưởng HTML độc lập ở vòng trước cũng đã được khôi phục về ảnh gốc. Nó vẫn là bản mẫu mô phỏng độc lập, không tính vào nghiệm thu tính năng của tiện ích mở rộng nguyên bản này, và cũng không bị trộn lẫn vào tệp ZIP tiện ích mở rộng mới.
