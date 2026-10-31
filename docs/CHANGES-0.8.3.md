# Thay đổi 0.8.3 (Chỉnh sửa Lilith nổi)

Bản 0.8.3 chỉ chỉnh sửa Lilith nổi trên điện thoại, khắc phục hai vấn đề mà người dùng gặp phải ở bản 0.8.2:

1. Biểu tượng quá lớn;
2. Sau khi mở thiết bị đầu cuối, bấm vào cô ấy thì thiết bị đầu cuối lại bị đóng mất.

Các tính năng khác, trường sổ cái và Sách Thế Giới đều không thay đổi, **không cần nhập lại Sách Thế Giới**. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.3](ACCEPTANCE-0.8.3.md).

## I. Có thể điều chỉnh kích thước, mặc định thu nhỏ

Vị trí: Thiết bị đầu cuối → Cài đặt → Lilith → 「Kích thước Lilith nổi」. Chỉnh xong có hiệu lực ngay lập tức, vị trí được giữ nguyên.

| Tùy chọn | Tỷ lệ | Kích thước (Rộng × Cao, px) |
|---|---|---|
| Rất nhỏ | 55% | 43 × 57 |
| Nhỏ | 65% | 51 × 68 |
| **Tiêu chuẩn (Mặc định)** | 75% | 59 × 78 |
| Lớn | 90% | 70 × 94 |
| Rất lớn | 100% | 78 × 104 (tức kích thước của bản 0.8.2) |

- Thu phóng đồng tỷ lệ: tranh đứng, góc bo và dấu hiệu đá quý cùng thu nhỏ theo.
- Khi nấp ở mép màn hình, phần góc lộ ra luôn giữ lại ít nhất 24px để ngón tay vẫn chạm tới dễ dàng.

## II. Khi thiết bị đầu cuối đang mở, bấm vào cô ấy làm thiết bị đầu cuối bị đóng mất (Lỗi, đã sửa)

Triệu chứng:

1. Sau khi mở thiết bị đầu cuối, Lilith tự động rụt về mép màn hình;
2. Muốn bấm vào cô ấy để nghe nói chuyện, nhưng vừa chạm vào là thiết bị đầu cuối đóng sập lại;
3. Khi thiết bị đầu cuối đang mở thì hoàn toàn không thể tương tác với cô ấy được.

Có hai nguyên nhân chồng lên nhau:

1. **Cơ chế 「Đóng khi bấm ra ngoài thiết bị đầu cuối」 tính luôn cả thao tác bấm vào cô ấy là bấm ra ngoài.** Trên điện thoại tùy chọn này mặc định bật. Trước đây nó chỉ bỏ qua bản thân thiết bị đầu cuối, hộp thoại SillyTavern và thanh thông báo, còn Lilith nổi không nằm trong danh sách miễn trừ, nên ngay khoảnh khắc đặt ngón tay xuống là thiết bị đầu cuối đã đóng lại trước khi logic bấm của chính cô ấy kịp chạy.
2. **Sau khi cô ấy bước ra lại nhanh chóng tự nấp ngược vào trong.** Thao tác 「bấm một cái để bước ra」 đặt cô ấy ở vị trí cách mép 8px, nhưng mỗi lần đọc lại vị trí (đóng thiết bị đầu cuối, xoay màn hình, làm mới trang), vị trí này lại bị áp dụng quy tắc 「gần mép thì nấp vào」 thêm một lần nữa, khiến cô ấy lại rụt vào trong.

Cách sửa:

- Lilith nổi không còn bị tính là 「bên ngoài thiết bị đầu cuối」 nữa (`src/hub.js`). Bấm thực sự ra bên ngoài thiết bị đầu cuối (ví dụ vùng trò chuyện) vẫn đóng thiết bị đầu cuối như bình thường.
- **Khi thiết bị đầu cuối đang mở, bấm vào cô ấy chỉ nói chuyện**: cô ấy ló ra nói một câu thông báo hệ thống hiện tại hoặc lời thoại cốt truyện, vài giây sau lại rụt về mép. Cô ấy không di chuyển đè lên thiết bị đầu cuối, cũng không đóng thiết bị đầu cuối.
  - Nhấn đúp vẫn chọc cô ấy, nhấn giữ vẫn kéo đi được như bình thường.
  - Để đóng thiết bị đầu cuối vui lòng dùng nút ✕ của chính thiết bị đầu cuối hoặc cử chỉ vuốt quay lại.
- Quy tắc 「gần mép thì nấp vào」 chỉ phán đoán khi **kéo xong rồi thả tay**. Vị trí 「ở bên ngoài」 đã lưu chỉ đảm bảo không tràn khỏi màn hình chứ không tự động thu về mép nữa.

## Toàn bộ thao tác hiện tại

| Tình huống | Thao tác | Hiệu quả |
|---|---|---|
| Thiết bị đầu cuối đang đóng | Bấm vào góc lộ ra | Cô ấy bước ra và nói 「Bị ngài phát hiện rồi~」 |
| Thiết bị đầu cuối đang đóng | Bấm vào cô ấy | Mở thiết bị đầu cuối (cô ấy tự động lùi về mép, không che khuất thiết bị đầu cuối) |
| Thiết bị đầu cuối đang mở | Bấm vào cô ấy | Ló ra nói một câu thông báo hệ thống hiện tại hoặc lời thoại cốt truyện, sau đó rụt về mép; **thiết bị đầu cuối vẫn mở** |
| Bất cứ lúc nào | Nhấn đúp | Chọc cô ấy: đổi biểu cảm để đáp lại |
| Bất cứ lúc nào | Nhấn giữ khoảng 0.4 giây rồi kéo | Di chuyển cô ấy; kéo tới mép trái / phải rồi thả tay sẽ nấp vào mép và ghi nhớ vị trí |

## Cài đặt mới thêm

| Tên | Thuyết minh |
|---|---|
| Cài đặt tiện ích mở rộng `floatSize` | `xs` / `s` / `m` (mặc định) / `l` / `xl` |
