# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.4

## Môi trường

Giống với [0.8.3](ACCEPTANCE-0.8.3.md):

- SillyTavern 1.16.0 / 1.19.0, cài đặt mới hoàn toàn theo tag chính thức, thư mục dữ liệu cô lập;
- Thực thể 1.19 có cài đặt Tavern Helper 4.11.2;
- Playwright Chromium;
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS (mô phỏng nhà cung cấp chặn trình duyệt).

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

**Mô hình mô phỏng thêm chế độ chậm**: Khi trong tin nhắn có chứa 「慢速测试」, cứ mỗi 9 giây sẽ truyền ra một đoạn nhỏ, tổng cộng khoảng 72 giây; yêu cầu không phân luồng (non-streaming) sẽ đợi 66 giây rồi mới trả về. Cả hai đều dài hơn mức 60 giây cứng của bản gốc.

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.19 |
| --- | --- | --- |
| `native_v084.py` (Mới thêm bản 0.8.4, 29 hạng mục) | 29/29 | 29/29 |
| `native_v083.py` | 13/13 | 13/13 |
| `native_v082.py` | 20/20 (bỏ qua hai đoạn Tavern Helper và hook vô hiệu hóa, giống 0.8.2) | 25/25 |
| `native_v081.py` | 20/20 | 20/20 |
| `native_v080.py` | 33/33 | 33/33 (xem mục 「Cập nhật khẳng định cũ」 bên dưới) |
| `native_group060.py` | 44/44 | 44/44 |
| `native_world070.py` | 40/40 | 40/40 |
| `native_terminal050.py` | 58/58 | 58/58 |
| `native_guards.py` | ✅ Không có lỗi trang, không có yêu cầu mô hình | ✅ (`docs/evidence/guards.json`) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | **Không chạy** |
| `npm run check` | ✅ | ✅ |
| `node --test tests/*.test.js` | 144/144 | 144/144 |

Bản 1.17 / 1.18 đợt này không kiểm thử.

## Xác nhận sửa lỗi (Tạm gỡ bản sửa lỗi rồi chạy lại)

| Đoạn mã tạm gỡ | Kết quả `native_v084.py` | Biểu hiện thất bại |
| --- | --- | --- |
| `collapseWorkbench: () => {}` trong lớp bọc trò chuyện riêng của `src/assistant-host.js` (khôi phục hành vi nguyên bản 「mở trò chuyện riêng thì đóng bàn làm việc trước」) | 26/28 | Trên điện thoại cả 5 lần bấm vào trò chuyện riêng đều thất bại: trò chuyện riêng mở ra, nhưng **thiết bị đầu cuối bị đóng mất** (`hub:false`), tái hiện đúng vấn đề người dùng mô tả |
| `keepEdited` (giữ nguyên sửa đổi tại chỗ) trong `src/statusbar-host.js` | Cùng lượt đạt 26/28 | Sau khi plugin dựng lại tầng, các sửa đổi của kịch bản JS làm đẹp trên đoạn văn bị mất (`beauty: 0`) |

Sau khi khôi phục cả hai mục đều đạt.

## Các vấn đề phát hiện và sửa chữa trong quá trình kiểm thử

1. **Thứ tự làm đẹp**: Bản đầu tiên của `keepEdited` đã di chuyển đoạn văn được sửa đổi đi trước khi đọc danh sách nút cũ, dẫn tới thẻ iframe bên ngoài bị mất định vị và bị xếp lên trước đoạn văn (`order: [1,0,2,3]`). Sau khi đổi thành đọc danh sách nút cũ trước rồi mới di chuyển, thứ tự đã chính xác, đồng thời bổ sung khẳng định 「thứ tự không đổi sau khi dựng lại」.
2. **Lỗi mô hình mô phỏng**: Chế độ chậm ở bản đầu tiên viết sai lát cắt (slice), truyền ra các đoạn chồng lấp khiến phản hồi nhìn thấy trong trò chuyện riêng bị lặp chữ. Sau khi sửa, khẳng định được nâng lên thành 「phản hồi khớp từng chữ, chỉ xuất hiện một lần」; hạng mục kết nối trực tiếp phân luồng cũng được bổ sung kiểm tra từng chữ. Mã ghép luồng của plugin không có vấn đề gì.

## Cập nhật khẳng định cũ

Sau khi đổi chủ đề Tiên hiệp sang màu Vàng Mặc Ngọc, hai khẳng định gán cứng giá trị màu xanh lá cũ trong `native_v080.py` bị thất bại trên bản 1.19 (31/33):

- Màu nền thẻ Bàn làm việc, giá trị cũ `rgb(24, 48, 42)`;
- Dòng trạng thái dưới cùng, giá trị cũ `rgb(18, 33, 27)`.

Đã cập nhật sang giá trị của biến chủ đề mới `--zt-surface:#1f2222` và `--zt-bar:#151718`, ý nghĩa của khẳng định (「đi theo chủ đề, không phải màu tím」) không đổi. Kết quả chạy lại: 1.19 đạt 33/33, 1.16 đạt 33/33.

## Các hạng mục bao phủ của `native_v084.py`

### API (Máy tính)

| # | Hạng mục |
| --- | --- |
| 1 | Trang 「Kết nối」 của thiết bị đầu cuối hiển thị biểu mẫu Trung tâm API (Thanh trạng thái + Lilith) |
| 2 | Biểu mẫu kết nối v1.1 nguyên bản không còn hiển thị nữa |
| 3 | Nhà cung cấp không gửi tiêu đề CORS: 「Lấy mô hình」 thành công (chuyển tiếp qua máy chủ SillyTavern, tổng cộng 2 mô hình) |
| 4 | 「Kiểm tra kết nối」 thành công, hiển thị 「chuyển tiếp qua máy chủ SillyTavern」 |
| 5 | Sau khi bấm 「Lưu」, hai bản cấu hình đồng nhất, không có thông báo 「không đồng nhất」 |
| 6 | Kênh yêu cầu do mã nguồn Lilith nguyên bản sử dụng: nhà cung cấp không gửi tiêu đề CORS đi qua chuyển tiếp nhận được phản hồi JSON thông thường |
| 7 | ……mô hình mô phỏng nhận được `stream: true` |
| 8 | Nhà cung cấp kết nối trực tiếp: cũng gửi dạng luồng (stream); phản hồi ghép lại đầy đủ từng chữ, không bị lặp |
| 9 | Địa chỉ không kết nối được: trả về 502 và nguyên nhân dễ đọc, thay vì ném lỗi mạng trình duyệt |
| 10 | Bánh răng thanh trạng thái → API: đi vào cùng một biểu mẫu |

### Thời gian chờ trò chuyện riêng (Máy tính, giao diện trò chuyện riêng thực tế)

| # | Hạng mục |
| --- | --- |
| 11 | Đặt thời gian chờ là 180 giây, gửi 「慢速测试」: sau 75 giây phản hồi tới nơi đầy đủ, khớp từng chữ (bản gốc sẽ hủy ở giây thứ 60) |

Khi kiểm thử không tích chọn 「Đính kèm cốt truyện hiện tại」. Tốc độ phản hồi chậm của mô hình mô phỏng không phụ thuộc độ dài lời nhắc, nên đi qua cùng một nhánh thời gian chờ.

### Mô-đun mạnh

| # | Hạng mục |
| --- | --- |
| 12 | Xóa rồi cài đặt lại Sách Thế Giới: Thần Hào Tiêu Xài và Đả Thủ Chư Thiên ở trạng thái tắt, bốn mô-đun còn lại ở trạng thái bật |
| 13 | Mô phỏng sách cũ (bật toàn bộ): quản lý ngoại quải hiển thị công tắc mô-đun mạnh và nút 「Cân bằng 1 chạm: Tắt Thần Hào Tiêu Xài, Đả Thủ Chư Thiên」 |
| 14 | Sau khi bấm cân bằng 1 chạm, hai mục từ trong Sách Thế Giới chuyển sang tắt (đọc lại từ máy chủ để xác nhận) |
| 15 | Bật Thần Hào Tiêu Xài trong quản lý ngoại quải → mục từ Sách Thế Giới có `disable=false` |
| 16 | Khi mô-đun đang tắt, thẻ Thần Hào trên trang động cơ được ẩn đi |
| 17 | Trong lời nhắc ngoại quải báo cho AI biết: 「Ký chủ hiện đã tắt: Thần Hào Tiêu Xài, Đả Thủ Chư Thiên」 |

### Phương án phối màu

| # | Hạng mục |
| --- | --- |
| 18 | Trang Cài đặt có mục 「Phương án phối màu」 với 8 tùy chọn (Theo thế giới + 7 bộ) |
| 19 | Màu nhấn mặc định của thế giới Tiên hiệp là màu vàng kim `#d4b46c`, không còn là màu xanh lá |
| 20 | Anh Đào Đỏ / Men Ngọc / Xanh Sương / Đen Vàng: các biến màu của thiết bị đầu cuối và trang động cơ đều chuyển đổi theo, họa tiết trang trí thế giới vẫn giữ nguyên Tiên hiệp |
| 21 | Trên thế giới mặc định cũng có hiệu lực tương tự |

### Tương thích làm đẹp giao diện

Trên bản 1.19 đã có `native_v082.py` dùng Tavern Helper thực tế để kết xuất thanh trạng thái thẻ nhân vật. Bộ kiểm thử này dùng ba kiểu làm đẹp mô phỏng, kiểm thử theo luồng tin nhắn mới của SillyTavern (`addOneMessage` → `CHARACTER_MESSAGE_RENDERED`):

- Một bộ kết xuất thay thế khối mã bằng thẻ iframe;
- Một kịch bản JS làm đẹp đợi sau 300 mili-giây mới bọc `span` vào đoạn văn (muộn hơn thời điểm kết xuất tầng của plugin);
- Một biểu thức chính quy SillyTavern chỉ tác động tới hiển thị (đổi dấu `「」` thành thẻ `span` có tên lớp).

| # | Hạng mục |
| --- | --- |
| 22 | Plugin kết xuất lần đầu: 1 thẻ iframe, khối mã gốc không bị lặp |
| 23 | Đoạn văn sau khi JS làm đẹp được giữ nguyên, chỉ có 1 đoạn |
| 24 | Làm đẹp bằng biểu thức chính quy có hiệu lực (SillyTavern làm sạch tên lớp thành `custom-qa-quote`) |
| 25 | Thứ tự khớp với nguyên văn, thẻ lời thoại của Lilith nằm đúng vị trí |
| 26 | Plugin dựng lại lần nữa: thẻ iframe vẫn là cùng một nút DOM, không bị tải lại (`loads=0`, dấu hiệu bên trong trang vẫn còn); làm đẹp JS, biểu thức chính quy và thẻ lời thoại mỗi thứ 1 cái; thứ tự không đổi |

### Lỗi trang & Điện thoại

| # | Hạng mục |
| --- | --- |
| 27 | Máy tính: Không có lỗi trang |
| 28 | Điện thoại 390×844, chạm cảm ứng thực: khi thiết bị đầu cuối đang mở, bấm vào 「Lilith · Bấm để vào trò chuyện riêng」 ở góc trên bên trái thanh tiêu đề, khung trò chuyện riêng phủ lên phía trên thiết bị đầu cuối (tâm điểm trúng bảng trò chuyện riêng), thiết bị đầu cuối vẫn mở; bấm vào ô nhập liệu không bị đóng; bấm 「Quay lại」 sẽ trở về thiết bị đầu cuối. Thực hiện liên tiếp 5 lần |
| 29 | Điện thoại: Không có lỗi trang |

## Ảnh chụp màn hình

Lưu cục bộ tại `/var/tmp/qa/run-80xx/shots-native_v084/`, không tải lên.

| Ảnh chụp | Nội dung |
| --- | --- |
| 01 | Lấy mô hình |
| 02 | Sau khi lưu |
| 03 | Phản hồi chậm 75 giây |
| 04 / 05 | Mô-đun mạnh |
| 06 | Tiên hiệp Vàng Mặc Ngọc |
| 07 / 08 / 09 | Anh Đào Đỏ / Men Ngọc / Thế giới mặc định + Đen Vàng |
| 10 | Tầng có làm đẹp giao diện |
| 11 | Trò chuyện riêng trên điện thoại |

## Chưa xác minh

- Lỗi 502 / hết thời gian chờ dưới nhà cung cấp thực tế và chuỗi proxy thực tế (cloudflare, nginx, v.v.). Đợt này chỉ dùng mô hình mô phỏng để chứng minh: yêu cầu được gửi đi dưới dạng luồng (stream), và phản hồi dài quá 60 giây vẫn tới nơi trọn vẹn.
- Các tiện ích mở rộng làm đẹp bên thứ ba cụ thể (như Tiểu Bạch X, v.v.) chưa được cài đặt kiểm thử từng cái một, mà dùng bộ kết xuất mô phỏng có hành vi tương đương.
- Trình duyệt điện thoại thực tế (chỉ kiểm thử mô phỏng điện thoại Chromium + sự kiện cảm ứng thực).
- SillyTavern 1.17 / 1.18.
- `native_replace040.py` (thiếu tệp nguyên bản v1.1, theo quy ước không tải lên).
