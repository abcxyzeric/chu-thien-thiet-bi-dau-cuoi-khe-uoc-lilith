# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.2

## Môi trường

Giống với [0.8.1](ACCEPTANCE-0.8.1.md):

- Các thực thể SillyTavern dùng một lần: cài đặt mới hoàn toàn theo tag kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng.
- Trình duyệt: Playwright Chromium headless + swiftshader.
- Mô hình: Mô hình mô phỏng cục bộ `tests/qa/mock_model.py`, cổng 5001 là nhà cung cấp thông thường, cổng 5002 là nhà cung cấp không gửi tiêu đề CORS (`--no-cors`).
- Tất cả các cuộc trò chuyện kiểm thử và thẻ nhân vật đều là dữ liệu kiểm thử cô lập.

Đợt này trên thực thể 1.19 có cài đặt thêm **Tavern Helper (JS-Slash-Runner) 4.11.2 thực tế**, dùng để tái hiện lỗi 「thanh trạng thái riêng của thẻ nhân vật không hiển thị」. Thực thể 1.16 không cài đặt Tavern Helper.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.19 |
| --- | --- | --- |
| `native_v082.py` (Mới thêm bản 0.8.2) | 20/20 (bỏ qua 2 đoạn, xem bên dưới) | 25/25 |
| `native_v081.py` (20 hạng mục) | 20/20 | 20/20 |
| `native_v080.py` (33 hạng mục) | 33/33 | 33/33 |
| `native_group060.py` (44 hạng mục, cập nhật 3 khẳng định theo quy tắc mới của 0.8.2) | 44/44 | 44/44 |
| `native_world070.py` (40 hạng mục) | 40/40 | 40/40 |
| `native_terminal050.py` (58 hạng mục) | 58/58 | 58/58 |
| `native_guards.py` | ✅ | ✅ (`docs/evidence/guards.json`: không có lỗi trang, không có yêu cầu mô hình) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | **Không chạy** |
| `npm run check` | ✅ | ✅ |
| `node --test tests/*.test.js` (Thuần logic) | 112/112 | 112/112 |

Bản 1.17 / 1.18 đợt này không kiểm thử.

Trên bản 1.16, `native_v082.py` bỏ qua hai đoạn:

- 「Thanh trạng thái Tavern Helper thực tế」: thực thể này không cài Tavern Helper. Hai hạng mục mô phỏng nút bao bọc vẫn đạt bình thường.
- 「Hook vô hiệu hóa tự động gỡ gắn kết」: bản 1.16 không có hook tiện ích mở rộng, đoạn bỏ qua này gồm 4 hạng mục.

### Vì sao cần cập nhật các bài kiểm thử cũ

| Bài kiểm thử | Khẳng định cũ | 0.8.2 |
| --- | --- | --- |
| `native_v080` Phát báo trên điện thoại | Phát báo chỉ chấp nhận thanh thông báo thiết bị đầu cuối hoặc bong bóng tranh đứng | Trên điện thoại chuyển sang do Lilith nổi nói ra, khẳng định chấp nhận bong bóng nổi (tính năng mới c) |
| `native_group060` Lì xì điểm số | Thành viên muốn phát 3.000 → lì xì 3.000 | Diệp Thanh Hàn (Võ đạo tông sư, phí vào nhóm 1.500) muốn phát 3.000 → chạm trần 1.500, đánh dấu `downgraded` (quy tắc mới e) |
| `native_group060` Nguồn gốc lì xì vật phẩm / quà tặng | `来源 == '白浅@青丘'` | `聊天群·白浅@青丘·红包` / `·赠礼` (quy tắc mới e) |
| `native_group060` Mở rộng nhóm, tán gẫu tự động (đã đổi từ đợt trước) | Mở rộng 10.000; mỗi lần phản hồi đều tán gẫu | Mở rộng 5.000; hai lần phản hồi không tán gẫu, lần thứ ba tán gẫu một lần |

Khi chạy `native_v081` lần đầu có 1 hạng mục thất bại: 「Nhà cung cấp không có CORS lấy mô hình」. Nguyên nhân là sau khi dựng lại môi trường, nhà cung cấp mô phỏng `--no-cors` ở cổng 5002 chưa được khởi động; sau khi khởi động thì đạt 20/20. **Mã nguồn plugin không thay đổi vì việc này.**

## Thanh trạng thái riêng của thẻ nhân vật: Kiểm thử thực tế trước và sau khi sửa

Dữ liệu kiểm thử:

- 1.19 + Tavern Helper 4.11.2;
- Thẻ nhân vật kiểm thử `Thẻ kiểm thử thanh trạng thái`, 13 tầng AI, trong đó 12 tầng có mang một đoạn thanh trạng thái giao diện HTML (do Tavern Helper phụ trách kết xuất thành iframe);
- Trong cùng tầng đó còn có lời thoại của Lilith và khối dữ liệu `<ZhuTianPanel>` mà plugin Chư Thiên cần xử lý.

Kịch bản là kịch bản tái hiện dùng một lần (không nằm trong kho lưu trữ), so sánh hai trường hợp 「Tắt plugin」 và 「Bật plugin」.

| | Thanh trạng thái thẻ nhân vật được kết xuất | Thuyết minh |
| --- | --- | --- |
| Tắt plugin | 12/12 | |
| Bật plugin (0.8.1) | **0/12** | Trong tầng chỉ còn lại khối dữ liệu Chư Thiên, iframe của Tavern Helper bị xóa mất khi plugin dựng lại tầng và không xuất hiện lại nữa |
| Bật plugin (0.8.2) | **12/12** | Toàn bộ xuất hiện trong vòng 0.8 giây; 12 khối dữ liệu Chư Thiên hiển thị bình thường; sau khi xuất dạng luồng (stream) vẫn là 12 cái; không có lỗi trang |

## Các hạng mục bao phủ của `native_v082.py`

### Thanh trạng thái thẻ nhân vật

| # | Hạng mục |
| --- | --- |
| 1 | Khối bao bọc `div.TH-render` trong tầng và iframe bên trong nó sau khi plugin dựng lại tầng vẫn là **cùng một nút DOM**: iframe không bị tải lại, trạng thái kịch bản bên trong iframe được giữ nguyên |
| 2 | Cùng tầng đó vẫn có khung thoại Lilith và nhãn tầng Chư Thiên theo đúng thứ tự |
| 3 | (Khi đã cài Tavern Helper) Thanh trạng thái thẻ nhân vật do Tavern Helper thực tế kết xuất hiển thị bình thường khi bật plugin |

### Gỡ gắn kết Sách Thế Giới

| # | Hạng mục |
| --- | --- |
| 4 | Trên máy tính (chế độ Tự động) không hiển thị Lilith nổi, nút đánh thức cũ được giữ nguyên |
| 5 | Tìm thấy toàn bộ gắn kết: Sách Thế Giới chính của 2 thẻ nhân vật, Sách Thế Giới phụ của 1 thẻ nhân vật, toàn cục, cuộc trò chuyện hiện tại |
| 6 | Sau khi bấm Cài đặt → 「Gỡ gắn kết Sách Thế Giới 1 chạm」, không còn nơi nào gắn kết nữa, tự động gắn kết được tắt đi |
| 7 | Bản ghi gỡ gắn kết bao gồm thẻ nhân vật, Sách Thế Giới phụ, toàn cục và cuộc trò chuyện hiện tại |
| 8 | Đọc lại tệp thẻ nhân vật từ máy chủ, `extensions.world` đã trống, chứng tỏ thay đổi thực sự đã được ghi về thẻ nhân vật |
| 9 | Bản thân Sách Thế Giới không bị xóa |
| 10 | Sau khi bấm 「Khôi phục gắn kết」, cả 5 nơi đều quay trở lại |

### Hook vô hiệu hóa (1.17+)

| # | Hạng mục |
| --- | --- |
| 11 | Sau khi dùng `disableExtension` của chính SillyTavern để tắt plugin, plugin đã được gỡ tải, thẻ nhân vật, toàn cục và cuộc trò chuyện hiện tại đều không còn gắn kết nữa |
| 12 | Bản ghi gỡ gắn kết được ghi vào cài đặt tiện ích mở rộng (`auto: true`, `noticed: false`, 5 nơi) |
| 13 | Sau khi bật lại và làm mới trang, hiện thông báo một lần 「Lần trước khi tắt plugin…… đã gỡ gắn kết」, bản ghi được đánh dấu là đã thông báo |
| 14 | Sau khi chạy hook vô hiệu hóa vẫn có thể khôi phục lại như bình thường |
| 15 | Phía máy tính không có lỗi trang |

### Lilith nổi (Điện thoại 390×844, cảm ứng, `is_mobile`)

| # | Hạng mục |
| --- | --- |
| 16 | Lilith nổi hiển thị (tranh đứng biểu cảm), nút đánh thức cũ ẩn đi |
| 17 | Mặc định nấp ở mép trái; bấm vào góc lộ ra cô ấy sẽ bước ra và nói 「Bị ngài phát hiện rồi~」 |
| 18 | Bấm một cái sẽ mở thiết bị đầu cuối |
| 19 | Khi thiết bị đầu cuối đang mở (trên điện thoại không nhìn thấy tranh đứng), phản ứng của cô ấy (「Định Hải Châu đã cất vào túi đồ」) bật lên trong bong bóng nổi |
| 20 | Khi thiết bị đầu cuối đang đóng, thông báo hệ thống mới lập tức bật lên trong bong bóng của cô ấy |
| 21 | Chạm nhấn giữ (PointerEvent `pointerType: 'touch'`) rồi kéo sang mép phải: nấp vào mép phải, chỉ lộ một góc, vị trí được lưu thành `{edge: 'right', tucked: true}` |
| 22 | Vuốt nhanh không nhấn giữ sẽ không làm di chuyển cô ấy |
| 23 | Sau khi làm mới trang, vị trí vẫn được giữ nguyên (mép phải, đang nấp) |
| 24 | Nhấn đúp (chọc) có lời thoại phản hồi |
| 25 | Phía điện thoại không có lỗi trang |

Ảnh chụp màn hình nằm tại `/var/tmp/qa/shots082/`, đây là thư mục tạm trên máy kiểm thử, không nằm trong kho lưu trữ:

- `01-floor-with-card-statusbar`
- `10-phone-float-default`
- `11-phone-terminal-open-bubble`
- `12-phone-broadcast`
- `13-phone-tucked-right`

## Kiểm thử thuần logic (`tests/v082.test.js`, 11 hạng mục)

- `findBindings` / `unbindAll` / `restoreBindings`:
  - Chỉ tác động tới Sách Thế Giới Chư Thiên, không chạm tới các sách khác;
  - Không gây hại khi không có gắn kết nào.
- `deactivate` trả về Promise gỡ gắn kết; `manifest.hooks.disable` trỏ tới nó; cài đặt mặc định bật.
- `settle()`: nấp sát mép, các vị trí khác được kẹp trong khung; `wantFloat()`: tự động, bật, tắt.
- `packetCap`: lì xì không vượt quá phí vào nhóm; phí mở rộng bằng sức chứa × 1.000.
- Lời nhắc cốt truyện đọc vật phẩm nhóm chat và nguồn gốc của chúng từ túi đồ (bất kể nhận được từ bao lâu trước đó).
- Khoảng cách tán gẫu: mặc định là 3, chỉ chấp nhận các giá trị trong danh sách.
- `swapContent`: giữ nguyên khối bao bọc `div.TH-render`, kể cả trường hợp lồng bên trong các khối khác.
- Số phiên bản và bảng năng lực.

## Chưa xác minh

- **Trình duyệt điện thoại thực tế**: Nhấn giữ, rung và xung đột cử chỉ với cuộn trang trên iOS Safari, Android Chrome mới chỉ được kiểm thử trong trình mô phỏng điện thoại Chromium.
- **1.17 / 1.18**: Hook vô hiệu hóa có tồn tại trên hai phiên bản này, nhưng đợt này không chạy.
- **Các bộ kết xuất thanh trạng thái khác**: Chỉ bảo vệ khối bao bọc `div.TH-render` của Tavern Helper. Các iframe do tiện ích mở rộng khác tự gắn vào vẫn có thể bị thay thế nếu plugin dựng lại tầng.
- **Mô hình thực tế**: Toàn bộ chuỗi AI vẫn chỉ được xác minh bằng mô hình mô phỏng.
