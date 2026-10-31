# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.5

## Môi trường

Giống với [0.8.4](ACCEPTANCE-0.8.4.md):

- SillyTavern 1.16.0 / 1.19.0, cài đặt mới hoàn toàn theo tag chính thức, thư mục dữ liệu cô lập;
- Thực thể 1.19 có cài đặt Tavern Helper 4.11.2;
- Playwright Chromium, điện thoại dùng mô phỏng cảm ứng 390×844;
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.19 |
| --- | --- | --- |
| `native_v085.py` (Mới thêm bản 0.8.5, 20 hạng mục) | 20/20 | 20/20 |
| `native_v084.py` | 29/29 | 29/29 (xem mục số 2 trong phần 「Các vấn đề phát hiện và sửa chữa trong quá trình kiểm thử」 bên dưới) |
| `native_v083.py` | 13/13 | 13/13 |
| `native_v082.py` | 20/20 (bỏ qua hai đoạn Tavern Helper và hook vô hiệu hóa, giống 0.8.2) | 25/25 |
| `native_v081.py` | 20/20 | 20/20 |
| `native_v080.py` | 33/33 | 33/33 |
| `native_group060.py` | 44/44 | 44/44 |
| `native_world070.py` | 40/40 | 40/40 |
| `native_terminal050.py` | 58/58 | 58/58 |
| `native_guards.py` | ✅ Không có lỗi trang, không có yêu cầu mô hình, từ chối gửi trong khi đang tạo phản hồi | ✅ Không có lỗi trang, không có yêu cầu mô hình, từ chối gửi trong khi đang tạo phản hồi (`docs/evidence/guards.json`) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | **Không chạy** |
| `npm run check` | ✅ | ✅ |
| `node --test tests/*.test.js` | 152/152 | 152/152 |

Bản 1.17 / 1.18 đợt này không kiểm thử.

## Xác nhận sửa lỗi (Tạm gỡ bản sửa lỗi rồi chạy lại)

Sau khi đổi `src/host-adapter.js` và `src/statusbar-host.js` về lại phiên bản 0.8.4 rồi chạy `native_v085.py` trên bản 1.19, kết quả là 16/20. Bốn hạng mục thất bại trùng khớp hoàn toàn với hiện tượng người dùng báo cáo:

| Hạng mục | Mã 0.8.4 | Mã 0.8.5 |
| --- | --- | --- |
| Điện thoại: Sau khi sự kiện 「Kết thúc tạo phản hồi」 bị thất lạc, tầng mới nhất | **Văn bản thô** (`raw:true`), plugin vẫn tưởng đang tạo phản hồi (`gen:true`) | Hiển thị bình thường thành nhãn dữ liệu Chư Thiên |
| Điện thoại: Sau khi bấm 「Chỉnh sửa → ✔」 | **Vẫn là văn bản thô** | Kết xuất lại bình thường |
| Trạng thái 「Đang tạo phản hồi」 quá hạn | Giữ nguyên mãi | Tự động xóa sau khi nút dừng biến mất |
| Chẩn đoán tương thích mục 「Tầng mới nhất」 | Không có | ✅ Tầng thứ 6 đã hiển thị bình thường |

Sau khi khôi phục đạt 20/20.

Cách mô phỏng nhất quán với SillyTavern: phát sự kiện 「Bắt đầu tạo phản hồi」, đặt `#mes_stop` thành `display:flex` (cách làm của `deactivateSendButtons()` trong SillyTavern), thêm tầng có chứa `<ZhuTianPanel>`, sau đó đặt lại thành `display:none`, **không phát** sự kiện 「Kết thúc tạo phản hồi」.

## Các vấn đề phát hiện và sửa chữa trong quá trình kiểm thử

1. **Khóa gửi tin (Vấn đề mã nguồn plugin, đã sửa).**
   - Phán đoán ở bản đầu tiên là 「nút dừng đang ẩn = không tạo phản hồi」, khiến hạng mục 「từ chối gửi trong khi đang tạo phản hồi」 của `native_guards.py` thất bại ngay lập tức.
   - Nguyên nhân: SillyTavern phát sự kiện 「Bắt đầu tạo phản hồi」 trước, sau đó mới đặt `is_send_press` và hiển thị nút dừng; còn tạo phản hồi tĩnh chạy ngầm thì hoàn toàn không hiển thị nút dừng. Theo phán đoán của bản đầu tiên, trong khoảng thời gian này plugin sẽ tưởng nhầm là có thể gửi tin.
   - Đổi thành: Chỉ khi trong lần tạo phản hồi này nút dừng **đã từng xuất hiện rồi sau đó mới ẩn đi**, mới tính là kết thúc tạo phản hồi; nếu chưa từng xuất hiện thì không mở khóa.
   - `native_v085.py` thêm mới hạng mục 「sau khi bắt đầu tạo phản hồi và trước khi nút dừng xuất hiện vẫn tính là đang tạo phản hồi」, kiểm thử đơn vị bao phủ cả ba trường hợp. Sau khi sửa, `guards` đạt trên cả hai phiên bản.
2. **Vấn đề cô lập kiểm thử của `native_v084.py` (Vấn đề mã kiểm thử, mã plugin không đổi).**
   - Khi chạy lần thứ hai trở đi trên cùng một thực thể 1.19, hạng mục 「Sách Thế Giới mới cài đặt mặc định tắt Thần Hào Tiêu Xài / Đả Thủ Chư Thiên」 bị thất bại.
   - Nguyên nhân: Bài kiểm thử dùng yêu cầu thô để xóa Sách Thế Giới, đi vòng qua bộ nhớ đệm Sách Thế Giới của SillyTavern nên đọc phải dữ liệu cũ lúc kết thúc lượt trước (đang bật toàn bộ). Lần chạy đầu tiên đạt chỉ vì Sách Thế Giới còn sót lại lúc đó tình cờ khớp với kỳ vọng.
   - Kiểm tra thủ công trên trang mới: sau khi xóa rồi cài đặt lại, tệp Sách Thế Giới và trạng thái plugin đọc lại đều chính xác (hai mục tắt).
   - Cách sửa: Sau khi bài kiểm thử xóa Sách Thế Giới sẽ xóa luôn bộ nhớ đệm `worldInfoCache` của SillyTavern, chạy lại với cùng trạng thái còn sót lại thì đạt 29/29. Khi người dùng xóa Sách Thế Giới trên giao diện SillyTavern, SillyTavern sẽ tự xóa bộ nhớ đệm nên không bị ảnh hưởng.

## Các hạng mục bao phủ của `native_v085.py`

### Cài đặt cổng AI

| # | Hạng mục | Máy tính | Điện thoại |
| --- | --- | --- | --- |
| 1 | Nút chọn đơn (radio) có kích thước bình thường (≤24px), nằm sát chữ trên cùng một dòng; khoảng cách giữa hai thẻ tùy chọn ≤16px | ✅ | ✅ |
| 2 | Tiêu đề 「Kết nối · Cài đặt cổng AI」, đánh số 1, 2, 3, cài đặt nâng cao mặc định thu gọn, mục 「Lưu vào…」 nằm trong cài đặt nâng cao | ✅ | ✅ |
| 3 | Cấu hình hai nơi khác nhau → 「⚠ API dùng ở hai nơi không đồng nhất」, ghi rõ từng nơi (tính năng AI thanh trạng thái / trò chuyện riêng Lilith) đang dùng gì | ✅ | |
| 4 | Sau khi lưu → 「✓ Đã cài đặt」 + địa chỉ + mô hình | ✅ | |
| 5 | Chọn 「Dùng trực tiếp mô hình SillyTavern đang dùng」 → ẩn bước điền cổng kết nối, đánh số đổi thành 1, 2 | ✅ | |

### Kiểm nghiệm sổ cái

| # | Hạng mục |
| --- | --- |
| 6 | Phía dưới nút 「Kiểm nghiệm ngay chính văn mới nhất」 có thuyết minh (cần tích hai công tắc nào, cần bấm nút nào) |
| 7 | Khi chưa tích chọn mà bấm nút: hai công tắc và nút 「Lưu cài đặt trò chuyện hiện tại」 sẽ sáng nổi bật |
| 8 | Đồng thời, dòng trạng thái và thông báo bật lên đưa ra hướng dẫn dễ hiểu, không còn hiện câu cứng nhắc cũ |
| 9 | Đã tích chọn nhưng chưa lưu: dòng trạng thái nhắc 「Vẫn chưa lưu」 |
| 10 | Sau khi lưu: việc kiểm nghiệm nguyên bản thực thi bình thường |

### Kết xuất tầng trên điện thoại

| # | Hạng mục |
| --- | --- |
| 11 | Sau khi sự kiện 「Kết thúc tạo phản hồi」 bị thất lạc, tầng mới nhất vẫn kết xuất thành nhãn dữ liệu Chư Thiên (không còn là văn bản thô) |
| 12 | Trạng thái 「Đang tạo phản hồi」 quá hạn tự động được xóa sau khi nút dừng biến mất |
| 13 | Khi nút dừng đang hiển thị (đang xuất dạng luồng), tầng cuối cùng giữ nguyên không chạm tới |
| 14 | Khóa gửi tin: sau khi bắt đầu tạo phản hồi và trước khi nút dừng xuất hiện, vẫn tính là đang tạo phản hồi |
| 15 | Bấm thực tế vào nút 「Chỉnh sửa」 của SillyTavern: trong ô chỉnh sửa là nguyên văn (hành vi bình thường của SillyTavern); sau khi bấm ✔ sẽ kết xuất lại |
| 16 | Chẩn đoán tương thích: 「Tầng mới nhất: ✅」, và có nút 「Kết xuất lại tầng」 |

Ngoài ra còn có 「Không có lỗi trang」 trên máy tính / điện thoại, tổng cộng 20 hạng mục. Ảnh chụp màn hình: `01-api-inconsistent`, `02-api-main-mode`, `03-ledger-guide`, `04-phone-api`, `05-phone-floor-rendered`, `06-phone-diagnostics`.

## Chưa xác minh

- Trình duyệt điện thoại thực tế (chỉ dùng mô phỏng điện thoại Chromium).
- Các dòng máy, trình duyệt, mô hình cụ thể bị 「bỏ sót sự kiện kết thúc tạo phản hồi」 trong thực tế chưa được tái hiện từng cái một. Mới chỉ mô phỏng sự kiện và nút dừng của SillyTavern, việc phân tích nguyên nhân dựa trên mã nguồn SillyTavern và ảnh chụp màn hình của người dùng.
- Trang kết nối với nhà cung cấp API thực tế (chỉ kiểm thử với mô hình mô phỏng).
- Bản 1.17 / 1.18.
