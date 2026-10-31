# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.0

## Môi trường

Giống với [0.7.0](ACCEPTANCE-0.7.0.md): các thực thể SillyTavern dùng một lần (cài đặt mới hoàn toàn theo tag từ kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng), Playwright Chromium headless + swiftshader, mô hình mô phỏng cục bộ `tests/qa/mock_model.py`. Tất cả các cuộc trò chuyện kiểm thử đều là cuộc trò chuyện kiểm thử cô lập được đánh dấu rõ ràng, không phải bản lưu thật.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| `native_v080.py` (Mới thêm bản 0.8.0, 33 hạng mục) | 33/33 | Đợt này không chạy | Đợt này không chạy | 33/33 |
| `native_world070.py` (Hồi quy 0.7.0, 40 hạng mục) | 40/40 | Đợt này không chạy | Đợt này không chạy | 40/40 |
| `native_terminal050.py` (Hồi quy thiết bị đầu cuối 0.5.0, 58 hạng mục) | Đợt này không chạy | Đợt này không chạy | Đợt này không chạy | 58/58 |
| `native_group060.py` (Hồi quy nhóm chat 0.6.0, 44 hạng mục) | Đợt này không chạy | Đợt này không chạy | Đợt này không chạy | 44/44 |
| `native_guards.py` (Bảo vệ gửi tin) | Đợt này không chạy | Đợt này không chạy | Đợt này không chạy | ✅ |
| `native_replace040.py` (Thay thế toàn diện v1.1, 70 hạng mục) | **Đợt này không chạy** | **Đợt này không chạy** | **Đợt này không chạy** | **Đợt này không chạy** |
| `node --test tests/*.test.js` (Thuần logic, không phụ thuộc phiên bản máy chủ) | 92/92 | 92/92 | 92/92 | 92/92 |

- Đợt này chỉ chạy nghiệm thu trình duyệt ở hai đầu phạm vi hỗ trợ (1.16, 1.19). Bản 1.17 / 1.18 chưa kiểm thử thực tế; bản 0.8.0 không sử dụng giao diện máy chủ mới (vẫn chỉ dùng các giao diện của bản 0.7.0 đã được nghiệm thu trên cả bốn phiên bản), nhưng đây là suy luận, **không phải kiểm thử thực tế**.
- `native_replace040.py` cần các tệp nhập nguyên bản v1.1 (`--legacy-dir`), những tệp này theo quy ước không đưa vào kho lưu trữ và không tải lên, nên đợt này không chạy.
- `docs/evidence/guards.json` là đầu ra của lần chạy `native_guards.py` cuối cùng trên bản 1.19 trong đợt này.

## Các hạng mục bao phủ của `native_v080.py`

| # | Hạng mục |
| --- | --- |
| 1 | Sau khi mở thiết bị đầu cuối, Tổng quan cơ bản hiển thị Điểm Hệ Thống trong sổ cái (không phải giá trị cũ trong bảng của tầng) |
| 2–3 | 「Điểm danh」 trong nhóm chat ghi vào sổ cái và đọc lại; thanh đỉnh và Tổng quan cơ bản hiển thị giá trị mới cùng lúc (sửa lỗi ở ảnh chụp 4) |
| 4 | Khi chưa có bất kỳ khối dữ liệu AI nào, Tổng quan cơ bản hiển thị Điểm Hệ Thống trong sổ cái (100), không phải số 0 của bảng trống |
| 5 | Trong thiết bị đầu cuối không còn hiển thị dòng 「Lilith」 ở đáy thanh trạng thái gốc |
| 6 | 「Thông báo hệ thống」 trong khối dữ liệu được nói ra trong bong bóng thoại của tranh đứng |
| 7 | Bấm vào khoảng trống trên tranh đứng xuất hiện lời thoại theo cốt truyện, bấm liên tiếp nội dung khác nhau |
| 8–10 | Dưới chủ đề Tiên hiệp, thẻ Bàn làm việc sử dụng màu nền thẻ ngọc (không còn là màu tím), dòng trạng thái dưới cùng sử dụng màu thanh chủ đề; chủ đề mặc định giữ nguyên màu tím nguyên bản |
| 11–14 | Cài đặt → Bảng điều khiển Quản trị viên mở bảng quản trị viên nguyên bản; khi bảng đang mở thì động cơ không tải lại; sau khi lưu, Điểm Hệ Thống được ghi vào sổ cái, thanh đỉnh và động cơ hiển thị giá trị mới cùng lúc |
| 15–19 | Trong điều hướng 「Năng lực」 có mục 「Tự tạo」; 「＋ Ngoại quải tự tạo」 mở trình chỉnh sửa và đặt tiêu điểm vào ô tên; khi phát động trừ 777 Điểm Hệ Thống qua sổ cái và đóng dấu `界面记账时间`; văn bản hành động đi vào ô nhập liệu |
| 20–29 | Lời nhắc hiệu quả thực tế của công pháp được tiêm kèm hiệu quả giai đoạn; công pháp được dùng trong cốt truyện nhưng bị quên ghi ở dòng 「功法修炼」 được +2 tích lũy thực chiến (chịu ràng buộc trần phẩm giai); việc thăng giai đoạn được xếp hàng chờ mô hình phát báo; chứng từ ghi vào bản ghi công pháp; công pháp không dùng tới giữ nguyên; cùng một tầng kết xuất lại không cộng lặp; thanh tu hành và trang công pháp hiển thị giai đoạn, khoảng cách tới giai đoạn tiếp theo và nguồn gốc |
| 30–36 | Nhập công pháp từ thẻ nhân vật / biến trò chuyện: thêm mới Độc Cô Cửu Kiếm (Tiên phẩm 600/2000); công pháp đã có chỉ tăng không giảm (Thanh Vân Quyết giữ nguyên 200); ghi vào `角色卡功法同步` và `功法记录`; biến của chính thẻ nhân vật không bị sửa đổi |
| 37 | Bố cục điện thoại (390×800): khi sân khấu tranh đứng thu gọn, phát báo chuyển sang hiển thị bằng thanh thông báo (toast) |
| 38 | Không có lỗi trang |

(Số thứ tự trong bảng được nhóm theo thứ tự nhật ký kiểm thử, tổng cộng 33 khẳng định.)

## Kiểm tra ảnh chụp thủ công

- Vị trí, ngắt dòng, độ che khuất của bong bóng thoại tranh đứng và lời thoại cốt truyện: đã xem thủ công trên ảnh chụp bản 1.19.
- Cảm quan đồng nhất giữa Bàn làm việc Lilith và thanh trạng thái thiết bị đầu cuối dưới bốn bộ chủ đề Tiên hiệp / Cyber / Quỷ dị / Mặc định: đã xem ảnh thủ công. Khẳng định tự động chỉ bao phủ các màu sắc then chốt của hai bộ Tiên hiệp và Mặc định.
- Bố cục điện thoại: sân khấu tranh đứng thu gọn, phát báo đi qua toast; đây là cơ chế rút gọn có chủ đích, không phải bong bóng thoại.

## Chưa xác minh

- **Mô hình thực tế**: Toàn bộ chuỗi AI chỉ dùng mô hình mô phỏng cục bộ. Việc mô hình thực tế có tuân thủ lời nhắc 「Hiệu quả thực tế của công pháp」 và có phát báo thăng giai đoạn hay không vẫn chưa được xác minh.
- Nghiệm thu trình duyệt 0.8.0 trên **1.17 / 1.18**.
- **Đọc công pháp thẻ nhân vật**: Mới chỉ xác minh bằng cấu trúc biến thẻ nhân vật và biến trò chuyện tạo sẵn trong bài kiểm thử; cách đặt tên trường thẻ nhân vật của các tác giả khác nhau muôn hình vạn trạng, những cấu trúc chưa nhận diện sẽ không được nhập vào (không báo lỗi, cũng không sửa thẻ nhân vật).
- Các mục chưa xác minh đã liệt kê ở bản 0.7.0 không đổi: mô hình Live2D Lilith, một số nút Thần thông / Ngoại quải, Đồ phổ → định vị tầng trò chuyện, `native_replace040.py`.
