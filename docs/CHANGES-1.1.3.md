# 1.1.3 · Tách bạch 「Chuyển đổi / Đóng」 cửa sổ nổi, Kích thước tối thiểu 20%, Gộp cổ điển gọi API 1 lần

Sửa đổi tăng thêm trên nền bản 1.1.2 (xem [CHANGES-1.1.1](CHANGES-1.1.1.md), [CHANGES-1.1.2](CHANGES-1.1.2.md)). Phiên bản plugin 1.1.3. Phiên bản cấu trúc sổ cái 2 giữ nguyên, phiên bản quy tắc Sách Thế Giới 1.1.1 giữ nguyên (không cần cập nhật Sách Thế Giới). ID plugin và toàn bộ khóa lưu trữ không đổi.

## 1. Cửa sổ nổi: 「Đóng là đóng, chuyển đổi là chuyển đổi」

Phản hồi từ người chơi: Khi đóng cửa sổ nổi trên điện thoại, nó lại biến thành cửa sổ nổi hình ảnh đại diện; tùy chọn 「Đóng」 trong cài đặt thực chất lại là đổi sang nút đánh thức nguyên bản.

Nguyên nhân: Trước đây thao tác 「Đóng cửa sổ nổi」 chỉ đặt `floatLilith` thành `off`, trong khi `off` có nghĩa là 「không dùng Lilith nổi mà chuyển sang dùng nút đánh thức nguyên bản」. Trên điện thoại, nút đánh thức nguyên bản chính là ảnh đại diện hình tròn có thể kéo đi, nên nhìn giống như 「đóng xong lại biến thành ảnh đại diện」.

Hiện tại `floatLilith` có bốn giá trị:

| Giá trị | Hiển thị trên trang | Tên trong Cài đặt |
|---|---|---|
| `auto` (Mặc định) | Điện thoại / màn hình cảm ứng: Lilith nổi; Máy tính: Nút đánh thức nguyên bản | Tự động |
| `on` | Lilith nổi | Lilith nổi |
| `off` | Ảnh đại diện (nút đánh thức nguyên bản; trên điện thoại là ảnh đại diện tròn) | Ảnh đại diện (Nút đánh thức nguyên bản) |
| `none` (Mới) | **Không hiển thị gì cả** | Đã đóng |

Giá trị `off` trong cài đặt cũ vẫn tiếp tục biểu thị 「Ảnh đại diện」, nên sau khi nâng cấp những gì người dùng nhìn thấy không bị thay đổi đột ngột.

### Chuyển đổi (Lilith ⇄ Ảnh đại diện)

- Khi kéo Lilith nổi, dưới đáy màn hình sẽ có hai mục tiêu: **「Kéo vào đây để đổi thành ảnh đại diện」** và **「Kéo vào đây để đóng cửa sổ nổi」**.
- Khi kéo ảnh đại diện (ảnh đại diện tròn trên điện thoại, nút đánh thức trên máy tính) cũng có hai mục tiêu: **「Kéo vào đây để đổi thành Lilith」** và **「Kéo vào đây để đóng cửa sổ nổi」**.
- Trên máy tính khi nhấp chuột phải vào Lilith, trong menu có hai mục 「Đổi thành ảnh đại diện」 và 「Đóng cửa sổ nổi…」.
- Cài đặt → Lilith → hộp chọn thả xuống 「Cửa sổ nổi (Chuyển đổi kiểu dáng)」.
- Việc chuyển đổi không cần hỏi xác nhận; thả vào mục tiêu không tính là di chuyển vị trí nên ảnh đại diện / Lilith sẽ quay về vị trí cũ.

### Đóng (Ẩn cả hai)

- Lối vào: mục tiêu 「Đóng cửa sổ nổi」 ở trên, hoặc nút **「Đóng cửa sổ nổi…」** riêng biệt trong Cài đặt → Lilith.
- Trước khi đóng sẽ hỏi xác nhận trước, trong thông báo ghi rõ: sau khi đóng cả Lilith lẫn ảnh đại diện đều không hiển thị, có thể vào lại bảng điều khiển từ bảng 「Tiện ích mở rộng」 của SillyTavern → 「Thiết Bị Đầu Cuối Chư Thiên」 → 「Mở Thiết Bị Đầu Cuối Chư Thiên」.
- Cách khôi phục:
  - Trong bảng tiện ích mở rộng, bấm 「Hiển thị Lilith nổi」 hoặc nút mới 「Hiển thị ảnh đại diện」;
  - Hoặc chọn lại trong hộp chọn thả xuống ở trang Cài đặt.
- Sau khi đóng mà mở thiết bị đầu cuối, ảnh đại diện ở góc trên bên trái thiết bị đầu cuối vẫn neo trong thanh tiêu đề như bình thường, không bị ảnh hưởng.
- Trên máy tính, tổ hợp phím Alt+Z vẫn mở thiết bị đầu cuối bình thường.

### Nút × của thiết bị đầu cuối

- Nút × vốn dĩ chỉ đóng thiết bị đầu cuối. Trước đây ảnh đại diện xuất hiện trên trang sau khi bấm × là do cài đặt cửa sổ nổi lúc đó đang là 「Ảnh đại diện」. Giờ đây khi đã đóng hẳn cửa sổ nổi (`none`), sau khi bấm × trên trang sẽ không xuất hiện bất cứ thứ gì.

## 2. Kích thước tối thiểu 20%

- Mục 「Kích thước Lilith nổi」 thêm mới các mức 20% / 30% / 40%. Ở mức 20% kích thước khoảng 30×33 px, khi nấp ở mép màn hình vẫn lộ ra 24 px.
- Thêm mới mục 「Kích thước cửa sổ nổi ảnh đại diện」 (20%–100%, mặc định 100% = 64 px, giống như trước đây).
  - Nút đánh thức trên máy tính cũng thu phóng theo tỷ lệ này.
  - Sau khi thu nhỏ vẫn bấm được, kéo được, giấu vào mép màn hình được và ghi nhớ vị trí như bình thường.

## 3. Gộp cổ điển: Gọi API 1 lần duy nhất

Phản hồi từ người chơi: Chế độ Gộp cổ điển chỉ nên gọi API đúng một lần, còn Phàm phẩm / Linh phẩm bị gộp chỉ cần đếm số lượng.

- Trong cả lượt rút thẻ, toàn bộ những vật phẩm không bị gộp sẽ được đưa vào **cùng một yêu cầu duy nhất** để tạo cùng lúc (ở bản 1.1.2 là cứ mỗi 20 món gửi một yêu cầu).
- Giới hạn đầu ra (`max_tokens`) tự động tăng theo số lượng món: tối thiểu 8192, mỗi món khoảng 240 tokens, tối đa 32768. Nếu trong Cài đặt cổng AI có điền đầu ra tối đa (mặc định / cấu hình sẵn, hoặc mục Rút thẻ trong 「API phân nhánh tính năng」) thì sẽ lấy theo con số đã điền; nếu điền quá nhỏ khiến một lần không chứa hết thì phần bị cắt cụt sẽ tự động thử lại, khi đó số lần yêu cầu sẽ nhiều hơn một lần (khuyến nghị để trống hoặc điền từ 16000 trở lên).
- Phàm phẩm (khi rút ≥50 lượt) và Linh phẩm (khi rút ≥100 lượt) bị gộp chỉ đếm số lượng:
  - Không gửi cho mô hình, không tạo tên và hiệu quả riêng, gộp thành một dòng 「Tạp vật Phàm phẩm ×N」 / 「Tạp vật Linh phẩm ×N」;
  - Bảo hiểm, tổng số lượt rút tích lũy, giá trị thu hồi / phân giải hoàn toàn không đổi.
- Chỉ khi câu trả lời của mô hình bị cắt cụt hoặc không đạt chuẩn mới thử lại (khi bị cắt cụt sẽ giảm một nửa số món còn thiếu rồi gửi tiếp). Khi thất bại không trừ Điểm Hệ Thống, bảo hiểm không đổi.
- Ngưỡng gộp giữ nguyên như bản 1.1.2: từ 50 lượt trở lên gộp Phàm phẩm (tính cả mốc 50 lượt), từ 100 lượt trở lên gộp thêm Linh phẩm (tính cả mốc 100 lượt).
- Chế độ 10 lượt 1 lần quyết toán không đổi.

## Các tệp thay đổi

- `src/lilith-float.js`: bổ sung `none` cho `floatEntry` / `wantFloat`; hai mục tiêu kéo thả (`binHtml` / `showBinAt` / `binHit` / `binHot`); `closeFloats` (đóng) và `swapFloat` (chuyển đổi); menu chuột phải thêm 「Đổi thành ảnh đại diện」; `FLOAT_SIZES` thêm p20 / p30 / p40.
- `src/window-controls.js`: hai mục tiêu khi kéo ảnh đại diện, kích thước ảnh đại diện (`avatarSize`), quy đổi tọa độ thả sau khi thu phóng.
- `src/hub-settings.js`: bốn tùy chọn cho 「Cửa sổ nổi (Chuyển đổi kiểu dáng)」, nút 「Đóng cửa sổ nổi…」, hai tùy chọn kích thước.
- `src/settings.js`: cài đặt mới `avatarSize: 'xl'`; bảng tiện ích mở rộng thêm nút 「Hiển thị ảnh đại diện」.
- `index.js`: hành động của nút 「Hiển thị ảnh đại diện」.
- `src/commerce.js`: Gộp cổ điển gửi 1 yêu cầu (`classicTokens`), bỏ `CLASSIC_BATCH`, cập nhật thuyết minh chế độ.
- `src/contracts.js`: phiên bản 1.1.3, danh sách tính năng.
- Kiểm thử: thêm mới `tests/v113.test.js`, `tests/native_v113.py`; cập nhật các bài kiểm thử liên quan và tạo lại `FILELIST.sha256`.
