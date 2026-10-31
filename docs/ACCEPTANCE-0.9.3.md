# Nghiệm thu trình duyệt trên máy chủ thực tế 0.9.3

## Môi trường

- **Máy chủ**: SillyTavern 1.19.0 (cài đặt mới hoàn toàn theo tag chính thức, commit `7e8663c`), sử dụng thư mục dữ liệu cô lập.
- **Hai lượt kiểm thử**:
  - **Có cài đặt Tavern Helper** (JS-Slash-Runner 4.11.2, tag GitHub chính thức, không chỉnh sửa): chạy toàn bộ các bộ kiểm thử.
  - **Không cài đặt Tavern Helper**: chạy `native_v093`, `native_v092`, `native_v084`, `native_v082`, `native_terminal050`.
- **Trình duyệt**: Playwright Chromium (headless), mô phỏng cảm ứng điện thoại 390×844 (UA Android 14 / Chrome); đoạn Sách Thế Giới dùng máy tính 1280×860.
- **Mô hình mô phỏng**: cổng 5001 trả về bình thường, cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

## Người dùng kiểm thử lại

**Chờ bổ sung.**

- **TauriTavern**: Vui lòng cập nhật lên bản 0.9.3, sau đó vào Lilith → Quy tắc → Bối cảnh thế giới bổ sung bấm 「Đọc danh mục sách」, xác nhận nhìn thấy được Sách Thế Giới của mình, chọn một quyển rồi bấm 「Đọc quyển sách này」. Trên TauriTavern, plugin đi theo cùng giao diện frontend như SillyTavern, nhưng đợt này không có máy TauriTavern thực tế.
- **Bản đồ sao**: Trong cuộc trò chuyện mà thế giới hiện tại bị nhận diện sai, hãy mở Bản đồ sao → bấm vào thế giới hiện tại → 「Nhận diện sai? Đính chính thế giới này」, đổi loại hoặc tên rồi lưu lại.

## Tái hiện: So sánh 0.9.2 và 0.9.3 (`native_v093.py`)

| Kịch bản | 0.9.2 | 0.9.3 |
| --- | --- | --- |
| Quy tắc → Bối cảnh thế giới bổ sung → 「Đọc danh mục sách」 | ❌ Báo “Trợ lý hiện tại thiếu giao diện đọc Sách Thế Giới, vẫn có thể dùng quy tắc tích hợp sẵn” (khớp với ảnh chụp màn hình của người dùng), danh sách trống | ✅ Liệt kê toàn bộ Sách Thế Giới |
| 「Đọc quyển sách này」 | ❌ Giống trên | ✅ Trong bản chụp nhanh có 2 mục từ đang bật, mục từ bị tắt được bỏ qua; tìm kiếm quy tắc tìm thấy được; Sách Thế Giới gốc không bị sửa đổi |
| Máy chủ không có `getWorldInfoNames` / `getContext().loadWorldInfo` | — | ✅ Chuyển sang dùng mô-đun world-info và `/api/worldinfo/get`; sách không tồn tại đưa ra thông báo rõ ràng |
| Bản đồ sao: 「Linh Lung」 bị đoán nhầm thành Tiên hiệp | ❌ Nút hiển thị 「Tiên hiệp」, không có lối vào đính chính | ✅ Nút hiển thị 「Tiên hiệp?」; khung đính chính mặc định mở rộng và điền sẵn tên hiện tại |
| Đính chính loại (Tận thế) | — | ✅ Ghi vào `世界类型`, dấu chân không cộng thêm số lần, không phát trình diễn; nút hiển thị 「Tận thế」, khớp với chủ đề trên thanh đỉnh |
| Đính chính tên | — | ✅ `当前世界` và dấu chân cùng đổi tên, không phát trình diễn |
| Xóa khỏi dấu chân / Ghi nhận xuyên không điền tên thế giới hiện tại | ❌ Trường hợp sau báo lỗi “Đã ở trong thế giới này rồi” | ✅ Xóa thành công; trường hợp sau chuyển thành đính chính loại |
| Hướng dẫn tân thủ | ❌ Không có tính năng này | ✅ Xem bên dưới |

Bản 0.9.2 chỉ đạt 1 trên 10 hạng mục (“Sách Thế Giới gốc không bị sửa đổi”), 3 đoạn sau đó đều dừng giữa chừng vì thiếu giao diện hoặc phần tử. Bản 0.9.3 đạt toàn bộ 29/29 hạng mục.

Các hạng mục nghiệm thu của Hướng dẫn tân thủ (đều dưới mô phỏng điện thoại):

- Khi mở thiết bị đầu cuối bằng trang chỉ định (Bản đồ sao), hướng dẫn sẽ không làm gián đoạn.
- Lần đầu tiên mở trực tiếp thiết bị đầu cuối, hướng dẫn tự động xuất hiện, cả ba bước đều hiển thị chưa hoàn thành.
- Trang không có nội dung tràn ra ngoài màn hình, không cuộn ngang, không có mục tiêu chạm quá nhỏ.
- Bước 1 cài đặt xong Sách Thế Giới và gắn kết vào cuộc trò chuyện hiện tại.
- Bước 2 「Dùng mô hình chính hiện tại của SillyTavern」 lưu thành công. Bấm 「Sửa đổi」 sẽ nhảy tới trang Kết nối, nút 「Quay lại hướng dẫn tân thủ」 ở đầu trang có thể quay về lại.
- Bước 3 thông qua nút lưu nguyên bản bật ký ức Lilith, cả ba bước đều được đánh dấu tích.
- Sau khi bấm 「Hoàn tất」 sẽ được ghi nhớ, nút 「Hướng dẫn」 trên thanh điều hướng ẩn đi. Sau đó mở trực tiếp thiết bị đầu cuối sẽ không còn tự hiện hướng dẫn nữa.
- Cài đặt → Làm quen → Hướng dẫn tân thủ có thể mở lại, cả ba bước vẫn hiển thị đã hoàn thành.

Ảnh chụp màn hình (không đưa vào `docs/evidence/`):

- 0.9.3: `/var/tmp/qa/shots093/v093-W-rules.png`, `v093-S-fix-open.png`, `v093-S-after.png`, `v093-G-start.png`, `v093-G-done.png`
- Đối chiếu 0.9.2: `/var/tmp/qa/shots093-base/`

Kiểm tra ảnh thủ công: khung đính chính hiển thị đầy đủ trên điện thoại, cỡ chữ ô nhập liệu 16 px; thẻ ba bước hướng dẫn dàn trang bình thường trên điện thoại.

## Tổng quan kết quả (1.19)

| Bộ kiểm thử | Có cài Tavern Helper | Không cài Tavern Helper |
| --- | --- | --- |
| `native_v093.py` (Mới thêm bản 0.9.3) | 29/29 | 29/29 |
| `native_v092.py` | 17/17 | 14/14 (bỏ qua D) |
| `native_v091.py` | 35/35 | — |
| `native_v090.py` | 24/24 | — |
| `native_v085.py` | 20/20 | — |
| `native_v084.py` | 29/29 (Ghi chú 1) | 29/29 |
| `native_v083.py` | 13/13 | — |
| `native_v082.py` | 25/25 (gồm đoạn Tavern Helper thực tế) | 24/24 (bỏ qua đoạn đó) |
| `native_v081.py` | 20/20 | — |
| `native_v080.py` | 33/33 | — |
| `native_group060.py` | 44/44 | — |
| `native_world070.py` | 40/40 | — |
| `native_terminal050.py` | 58/58 | 58/58 |
| `native_guards.py` | ✅ (`docs/evidence/guards.json` tạo lại cho bản 0.9.3) | — |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | |
| `npm run check` | ✅ | |
| `npm test` | 203/203 (bản 0.9.2 là 186; thêm mới `v093.test.js` 17 hạng mục) | |
| `npm run filelist:check` | ✅ | |

Ghi chú 1: Lần chạy đầu tiên có 1 hạng mục thất bại (“yêu cầu được gửi đi dưới dạng luồng”). Nguyên nhân là nhật ký của mô hình mô phỏng cổng 5002 trong môi trường kiểm thử ghi sang tệp khác nên bài kiểm thử không đọc được bản ghi yêu cầu. Sau khi sửa lại đường dẫn nhật ký rồi chạy lại thì đạt 29/29. Mã nguồn plugin không thay đổi.

## Chưa xác minh

- Máy thật TauriTavern (xem ở trên).
- SillyTavern 1.16 / 1.17 / 1.18 đợt này không chạy. Việc đọc Sách Thế Giới trên các bản dưới 1.19 sẽ đi theo nhánh mô-đun world-info hoặc giao diện HTTP, nhánh này mới chỉ được kiểm thử trên bản 1.19 bằng cách mô phỏng thiếu giao diện.
- Bước 2 「Điền API độc lập」 của Hướng dẫn tân thủ mới chỉ xác minh chuyển trang và quay lại, còn bản thân biểu mẫu sử dụng kết quả nghiệm thu của bản 0.8.5.
- Nếu sau đó AI lại viết sai `当前世界` / `世界类型`, người dùng sẽ cần đính chính lại lần nữa. Plugin không khóa cứng kết quả đính chính của người dùng.
