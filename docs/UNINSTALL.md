# Gỡ cài đặt và quay lại phiên bản cũ (1.0.0)

Việc gỡ cài đặt sẽ không xóa cuộc trò chuyện, sổ cái hay ký ức của bạn——chúng được lưu trong tệp trò chuyện và không phụ thuộc vào tiện ích mở rộng. Hãy làm theo thứ tự dưới đây để sau này cài đặt lại hoặc quay về bản v1.1 đều có thể tiếp tục sử dụng.

## 1. Sao lưu trước (Khuyên dùng)

1. Mở cuộc trò chuyện Chư Thiên muốn giữ lại → Thiết bị đầu cuối → Cài đặt → Sổ cái & Bản lưu → 「Xuất / Nhập bản lưu」 → 「Xuất tệp bản lưu」.
   Xuất mỗi cuộc trò chuyện một lần; tệp không chứa API Key.
2. Nếu đang dùng API độc lập, hãy ghi lại địa chỉ cổng và mô hình ở trang 「Kết nối」 (khóa API sẽ không được xuất ra, sau khi cài đặt lại cần điền lại).

## 2. Gỡ liên kết Sách Thế Giới

- Cài đặt → Lời nhắc & Sách Thế Giới → 「Gỡ liên kết Sách Thế Giới một chạm」 (hoặc 「Gỡ liên kết toàn bộ một chạm」 trong 「Cài đặt / Liên kết / Gỡ liên kết Sách Thế Giới…」): gỡ liên kết Sách Thế Giới “诸天万界最强系统” khỏi thẻ nhân vật, Sách Thế Giới toàn cục và cuộc trò chuyện hiện tại (không xóa Sách Thế Giới).
- SillyTavern 1.17 trở lên sẽ tự động gỡ liên kết một lần khi 「Tắt」 tiện ích mở rộng; bản 1.16 không có hook này nên cần gỡ liên kết thủ công.
- Khi không muốn giữ lại Sách Thế Giới nữa, hãy xóa `诸天万界最强系统` (cùng các bản sao lưu `诸天万界最强系统-备份-*`) trong mục 「Thông tin thế giới」 của quán rượu.

## 3. Quay về v1.1 (Tùy chọn)

Nếu trước đó đã dùng 「Tiếp quản bản cũ một chạm」: vào Cài đặt → Chẩn đoán & Bảo trì → Tương thích & Bảo trì → 「Khôi phục bản cũ」, hệ thống sẽ bật lại 4 biểu thức chính quy (regex) và kịch bản Tavern Helper đã tắt lúc đó
(chỉ xử lý các mục đã được ghi nhận khi tiếp quản). Khi không mở được thiết bị đầu cuối, hãy bấm 「Khôi phục khẩn cấp bản cũ」 trong ngăn kéo cài đặt 「Tiện ích mở rộng」.

## 4. Xóa tiện ích mở rộng

「Tiện ích mở rộng → Quản lý tiện ích mở rộng」 → tìm 「Chư Thiên · Thiết Bị Đầu Cuối Khế Ước Lilith」 → Xóa, sau đó làm mới trang web.

Các dữ liệu vẫn còn lưu lại sau khi xóa (đều không ảnh hưởng đến hoạt động của quán rượu):

| Dữ liệu | Vị trí | Cách dọn dẹp |
|---|---|---|
| Sổ cái Chư Thiên, ký ức, lịch sử trò chuyện riêng | `chatMetadata.variables` của từng cuộc trò chuyện | Giữ lại để bất cứ lúc nào cài lại đều dùng tiếp được; khi không cần nữa thì xóa cuộc trò chuyện tương ứng |
| Bản sao lưu sổ cái, phiên bản cấu trúc, chứng từ | `chatMetadata.zhutianCovenantTerminal` của từng cuộc trò chuyện | Như trên |
| Cài đặt tiện ích, cấu hình API của Lilith (gồm khóa API) | `extension_settings.zhutian-covenant-terminal` trong `settings.json` của quán rượu | Khi không sử dụng nữa, xóa mục này trong tệp `settings.json` ở thư mục dữ liệu quán rượu (đóng quán rượu trước); hoặc vào trang 「Kết nối」 xóa trống khóa API trước khi gỡ tiện ích |
| Cấu hình API thanh trạng thái | Biến toàn cục `诸天系统_API`, `localStorage.sys_api_config` của trình duyệt | Xóa trong bảng biến của quán rượu; xóa dữ liệu trang web trên trình duyệt |

## 5. Cài đặt lại

Cài đặt lại tiện ích này → mở cuộc trò chuyện cũ, sổ cái sẽ tự động kết nối lại. Trên thiết bị mới: mở (hoặc tạo mới) cuộc trò chuyện tương ứng trước, sau đó dùng 「Xuất / Nhập bản lưu」 để nhập tệp đã xuất trước đó,
cuối cùng điền lại API Key ở trang 「Kết nối」.

> Từ bản 1.0 trở đi sổ cái có mang phiên bản cấu trúc: sổ cái đã được ghi bởi tiện ích phiên bản mới hơn sẽ chuyển sang chế độ chỉ đọc khi mở trong tiện ích phiên bản cũ hơn (không bị ghi hỏng), chỉ cần cập nhật tiện ích là sẽ khôi phục quyền ghi.
