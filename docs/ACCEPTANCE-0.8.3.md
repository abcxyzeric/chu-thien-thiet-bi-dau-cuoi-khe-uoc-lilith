# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.3

## Môi trường

Môi trường kiểm thử giống với [0.8.2](ACCEPTANCE-0.8.2.md). Trước khi bắt đầu đợt này, sandbox đã được đặt lại và toàn bộ môi trường dùng một lần được dựng lại theo đúng các bước tương tự:

- SillyTavern 1.16.0 / 1.19.0 cài đặt mới hoàn toàn theo tag chính thức;
- Thực thể 1.19 có cài đặt Tavern Helper 4.11.2;
- Playwright Chromium;
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.19 |
| --- | --- | --- |
| `native_v083.py` (Mới thêm bản 0.8.3, 13 hạng mục) | 13/13 | 13/13 |
| `native_v082.py` | 20/20 (bỏ qua hai đoạn Tavern Helper và hook vô hiệu hóa, giống 0.8.2) | 25/25 |
| `native_v081.py` (20 hạng mục) | 20/20 | 20/20 |
| `native_v080.py` (33 hạng mục) | 33/33 | 33/33 |
| `native_group060.py` (44 hạng mục) | 44/44 | 44/44 |
| `native_world070.py` (40 hạng mục) | 40/40 | 40/40 |
| `native_terminal050.py` (58 hạng mục) | 58/58 | 58/58 |
| `native_guards.py` | ✅ | ✅ (`docs/evidence/guards.json`: không có lỗi trang, không có yêu cầu mô hình) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | **Không chạy** |
| `npm run check` | ✅ | ✅ |
| `node --test tests/*.test.js` | 120/120 | 120/120 |

Bản 1.17 / 1.18 đợt này không kiểm thử.

## Xác nhận sửa lỗi

- Khi tạm thời gỡ bỏ dòng mã bỏ qua Lilith nổi trong `src/hub.js` rồi chạy lại `native_v083.py`, kết quả là 11/13:
  - 「Bấm vào cô ấy để nói chuyện khi thiết bị đầu cuối đang mở」 thất bại;
  - 「Nhấn đúp chọc cô ấy, thiết bị đầu cuối vẫn mở」 thất bại, lúc thất bại thì thiết bị đầu cuối đã bị đóng mất.
- Sau khi khôi phục dòng mã này thì đạt 13/13. Điều này chứng tỏ vấn đề thực sự xuất phát từ cơ chế 「Đóng khi bấm ra ngoài thiết bị đầu cuối」, và bản sửa lỗi này là cần thiết.

Một vấn đề khác cũng đã được tái hiện ở lần chạy đầu tiên: 「Sau khi cô ấy bước ra lại tự nấpกลับ vào」. Đây là nguyên nhân thất bại của lần chạy `native_v083.py` đầu tiên — bài kiểm thử đặt vị trí cách mép 8px trước, nhưng ngay lập tức bị phán định lại thành 「đang nấp」, thế là bấm vào cô ấy biến thành 「bước ra」 chứ không phải 「mở thiết bị đầu cuối」. Sau khi sửa, hạng mục này và bài kiểm thử thuần logic (`keepOnScreen`) đều đạt.

## Các hạng mục bao phủ của `native_v083.py`

Môi trường: mô phỏng điện thoại, 390×844, `has_touch`, `is_mobile`. Thao tác chạm sử dụng **chạm cảm ứng thực sự** `touchscreen.tap` của Playwright, lần lượt sinh ra touchstart, pointerdown, pointerup, click giống hệt thao tác ngón tay.

| # | Hạng mục |
| --- | --- |
| 1 | Kích thước mặc định 59×78, bằng 75% của bản 0.8.2 |
| 2 | Cài đặt kích thước có hiệu lực ngay lập tức: Rất nhỏ 43×57, Nhỏ 51×68, Lớn 70×94, Rất lớn 78×104 |
| 3 | Khi đổi kích thước, vị trí không thay đổi |
| 4 | Trang Cài đặt có tùy chọn 「Kích thước Lilith nổi」 |
| 5 | Khi thiết bị đầu cuối đang đóng: bấm vào cô ấy sẽ mở thiết bị đầu cuối |
| 6 | Khi thiết bị đầu cuối đang mở: cô ấy lùi về mép, không che khuất thiết bị đầu cuối |
| 7 | Khi thiết bị đầu cuối đang mở, bấm vào góc lộ ra của cô ấy: **thiết bị đầu cuối không đóng** (mục 「Đóng khi bấm ra ngoài thiết bị đầu cuối」 đang ở mặc định 「Chỉ điện thoại」) |
| 8 | ……cô ấy ló ra nói một câu thoại |
| 9 | ……vài giây sau rụt về lại mép; vị trí đã lưu không bị thay đổi |
| 10 | Khi thiết bị đầu cuối đang mở, nhấn đúp: có phản hồi chọc cô ấy, thiết bị đầu cuối vẫn mở |
| 11 | Nhấn vào vùng trò chuyện (bên ngoài thiết bị đầu cuối thực sự): thiết bị đầu cuối đóng lại như bình thường |
| 12 | Sau khi thiết bị đầu cuối đóng lại, cô ấy quay về vị trí cũ (không bị thu về mép) |
| 13 | Không có lỗi trang |

Ảnh chụp màn hình nằm tại `/var/tmp/qa/shots083/`, đây là thư mục tạm trên máy kiểm thử, không nằm trong kho lưu trữ:

- `01-default-size`
- `02-size-xs`
- `03-terminal-open-tap-talks`

## Kiểm thử thuần logic (`tests/v083.test.js`, 8 hạng mục)

- Bậc kích thước: mặc định 75%, rất lớn bằng kích thước bản 0.8.2, tỷ lệ không đổi, góc lộ ra không nhỏ hơn 24px, giá trị lạ quay về mặc định.
- Phán định mép tính theo kích thước thực tế.
- Khi thiết bị đầu cuối đang mở, `tap()` chỉ nói chuyện, không di chuyển, không mở cũng không đóng thiết bị đầu cuối. Trường hợp người dùng tự giấu vào mép cũng áp dụng tương tự.
- Khi thiết bị đầu cuối đang đóng: bấm vào góc lộ ra cô ấy bước ra (và lưu vị trí), bấm thêm cái nữa sẽ mở thiết bị đầu cuối.
- Quy tắc bấm bên ngoài của `hub.js` bỏ qua Lilith nổi.
- Giá trị mặc định của `floatSize`, mục cài đặt, có hiệu lực tức thì.
- Vị trí 「ở bên ngoài」 đã lưu không bị thu về mép lại (`keepOnScreen`); khi kéo rồi thả tay ở sát mép thì vẫn nấp vào như bình thường.
- Phiên bản 0.8.3.

## Chưa xác minh

- **Trình duyệt điện thoại thực tế**: Cảm giác vuốt chạm thực tế trên iOS Safari, Android Chrome chưa được kiểm thử, mới chỉ kiểm thử bằng sự kiện cảm ứng thực trong trình mô phỏng điện thoại Chromium.
- **1.17 / 1.18**: Đợt này không chạy.
