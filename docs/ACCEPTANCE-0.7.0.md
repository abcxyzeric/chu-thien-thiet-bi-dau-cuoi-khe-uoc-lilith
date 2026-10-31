# Nghiệm thu trình duyệt trên máy chủ thực tế 0.7.0

## Môi trường

Giống với [0.6.0](ACCEPTANCE-0.6.0.md): các thực thể SillyTavern dùng một lần (cài đặt mới hoàn toàn theo tag từ kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng), Playwright Chromium headless + swiftshader, mô hình mô phỏng cục bộ `tests/qa/mock_model.py`. Tất cả các cuộc trò chuyện kiểm thử đều là cuộc trò chuyện kiểm thử cô lập được đánh dấu rõ ràng, không phải bản lưu thật.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.17.0 | `e3f41666c69db032e17e079fcddcf40cf47e8593` |
| 1.18.0 | `51ad27fb86d39a3daca3adaa970375c9670c12df` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| `native_world070.py` (Chủ đề / Lilith / Đồ phổ / Trình diễn 0.7.0, 40 hạng mục) | 40/40 | 40/40 | 40/40 | 40/40 |
| `native_terminal050.py` (Hồi quy thiết bị đầu cuối 0.5.0, 58 hạng mục) | 58/58 | 58/58 | 58/58 | 58/58 |
| `native_group060.py` (Hồi quy nhóm chat 0.6.0, 44 hạng mục) | 44/44 | 44/44 | 44/44 | 44/44 |
| `native_guards.py` (Bảo vệ gửi tin) | ✅ | ✅ | ✅ | ✅ |
| `native_replace040.py` (Thay thế toàn diện v1.1, chế độ tương thích, 70 hạng mục) | **Đợt này không chạy** | **Đợt này không chạy** | **Đợt này không chạy** | **Đợt này không chạy** |
| `node --test tests/*.test.js` (Thuần logic, không phụ thuộc phiên bản máy chủ) | 82/82 | 82/82 | 82/82 | 82/82 |

`native_replace040.py` cần các tệp nhập nguyên bản v1.1 (`--legacy-dir`), những tệp này theo quy ước không đưa vào kho lưu trữ và không tải lên, trên máy kiểm thử đợt này không có nên không chạy. Bản 0.7.0 không sửa đổi đường dẫn mã nguồn mà bài kiểm thử đó bao phủ (mã kết xuất của chế độ tương thích cũ vẫn được giữ nguyên, trong bài kiểm thử dùng `settings.set('statusbar','native')` để bật tường minh nên không bị ảnh hưởng bởi quá trình di chuyển một lần), nhưng **chưa kiểm thử thực tế trong đợt này**.

`docs/evidence/guards.json` là đầu ra của lần chạy `native_guards.py` cuối cùng trong đợt này.

## Các hạng mục bao phủ của `native_world070.py`

**Đồ phổ & Chủ đề**
- Nhóm điều hướng 「Đồ phổ」 có Dòng sự kiện / Đồ phổ gắn kết / Bản đồ sao / Cây năng lực.
- Thế giới hiện tại 「Thái Sơ Tiên Vực」 → thiết bị đầu cuối chuyển sang chủ đề Tiên hiệp; động cơ nguyên bản bên trong thiết bị đầu cuối đổi màu theo; thanh đỉnh hiển thị huy hiệu chủ đề.
- Góc máy: Trang hệ thống = Bán thân.

**Dòng sự kiện**
- Bấm vào nút nhiệm vụ, phần chi tiết hiển thị bản ghi gốc và đường dẫn sổ cái `诸天系统.任务库.T2`; liệt kê Nguyên nhân / Tiếp nhận / Phần thưởng.
- Lilith nói ra dữ liệu sổ cái của nhiệm vụ đang chọn (「Bái nhập Thanh Vân Môn」, đang tiến hành. Tiến độ 40%.).
- Bàn phím: Phím mũi tên + Enter chọn nút tiếp theo.
- 「Định vị ở trang Nhiệm vụ」 → nhảy tới trang Nhiệm vụ nguyên bản, dòng tương ứng được chọn; liên kết trên trang Nhiệm vụ có thể nhảy ngược về Dòng sự kiện.

**Hiệu ứng trình diễn (sau khi đọc lại sổ cái)**
- Ghi chứng từ quyết toán → bên trong thiết bị đầu cuối phát hiệu ứng 「Hoàn thành nhiệm vụ」; nhấn Esc để bỏ qua, thiết bị đầu cuối vẫn mở.
- Thẻ kết quả ghi rõ kết quả và 「✓ Sổ cái đã xác nhận」; trong sổ cái thực sự có chứng từ này.
- 「Xem bản ghi」 → nhảy tới Dòng sự kiện và chọn đúng nhiệm vụ đó.
- Lượt rút thẻ bị quay lui ngay sau khi ghi: không phát trình diễn, trong lịch sử đánh dấu 「Chưa ghi sổ」.
- Giảm chuyển động: không hiện trình diễn toàn màn hình, chỉ hiện thẻ kết quả.
- Tắt trình diễn: không hiển thị gì cả, nhưng vẫn ghi nhận là đã vào sổ.

**Xuyên không & Chuyển đổi chủ đề**
- Bản đồ sao 「Ghi nhận xuyên không」 ghi và đọc lại thành công (Thế giới hiện tại, Dấu chân Vạn Giới); `世界类型` (Loại thế giới) cũ không bị mang sang thế giới mới; phát trình diễn xuyên không; chủ đề chuyển sang Cyber.
- Tọa độ các điều khiển dưới từng chủ đề hoàn toàn đồng nhất.
- Mô phỏng AI đổi thế giới trong 「Cập nhật biến số」: loại cũ được xóa đi, 「Trấn Vụ Ẩn」 → Quỷ dị; dấu chân ghi nhận thay đổi này.
- Trong cài đặt có thể cố định chủ đề.

**Lilith**
- Bấm vào một vật phẩm ở trang Túi đồ nguyên bản, trong lời thoại của Lilith có nhắc tới tên vật phẩm đó.
- Góc máy: Bàn làm việc = Toàn thân; Trò chuyện riêng = Dải cận cảnh khuôn mặt.
- Khi đóng thiết bị đầu cuối sẽ xuất hiện thẻ gợi ý cốt truyện có ảnh bán thân của Lilith; khi mở thiết bị đầu cuối thì thu gọn lại.

**Cài đặt & Dọn dẹp**
- Trong cài đặt không còn cung cấp thanh trạng thái trong tầng (chế độ tương thích cũ), cũng không còn hai mục chỉ có hiệu lực với chế độ đó; các mục cài đặt mới đều có mặt đầy đủ.

**Điện thoại (390×800)**
- Mở Dòng sự kiện, Đồ phổ gắn kết, Bản đồ sao, Cây năng lực và chụp ảnh màn hình (bố cục được kiểm tra thủ công qua ảnh chụp, kịch bản không đặt khẳng định tự động: đồ phổ kéo ngang được, chữ không bị thu nhỏ).
- Suốt quá trình không có lỗi trang.

## Kiểm tra ảnh chụp thủ công

Mọi bức ảnh trong thư mục ảnh chụp đều đã được xem xét thủ công: Tổng quan của ba bộ chủ đề Tiên hiệp / Cyber / Quỷ dị, Dòng sự kiện, Cây năng lực, đang trình diễn và thẻ kết quả, cận cảnh khuôn mặt khi trò chuyện riêng, thẻ gợi ý cốt truyện bên ngoài thiết bị đầu cuối, và bốn trang đồ phổ trên điện thoại. Các vấn đề đã sửa: đường nối đồ phổ bị kiểu svg toàn cục của trợ lý nguyên bản tô đặc, chữ trên nút bị chồng lấp, vị trí cắt ảnh bán thân bị lệch, huy hiệu chủ đề trên thanh đỉnh điện thoại đè lên chữ 「Điểm Hệ Thống」, chữ đồ phổ trên điện thoại quá nhỏ, lời thoại gợi ý trang chặn mất phản ứng bấm ngay sau đó.

Ảnh chụp màn hình trong kho lưu trữ: `docs/evidence/w070-fx-task.png` (trình diễn hoàn thành nhiệm vụ), `w070-task-focus.png` (Dòng sự kiện → định vị trang Nhiệm vụ nguyên bản), `w070-cyber.png`, `w070-eerie.png`, `w070-mobile-stars.png`.

## Ranh giới đã biết

- **Mô hình thực tế**: Vẫn chưa xác minh. Đặc biệt là việc 「AI ghi Thế giới hiện tại / Loại thế giới khi xuyên không」 mới chỉ dùng mô hình mô phỏng để xác minh việc tiêm lời nhắc và chuyển chủ đề sau khi ghi; khi mô hình thực tế quên ghi, người chơi có thể bấm 「Ghi nhận xuyên không」 thủ công ở Bản đồ sao.
- **Trình diễn đột phá, khế ước**: Logic phát hiện đã có kiểm thử thuần logic, trên trình duyệt mới kiểm thử thực tế hoàn thành nhiệm vụ, xuyên không và rút thẻ bị quay lui.
- **Đồ phổ → Định vị tầng trò chuyện**: Đã triển khai, chưa nghiệm thu trên trình duyệt.
- **`native_replace040.py`**: Xem ở trên, đợt này không chạy.
- **Trò chuyện nhóm của SillyTavern (ST group chat)**, **Phản hồi xúc giác**: Giống bản 0.6.0.
