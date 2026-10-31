# Nghiệm thu trình duyệt trên máy chủ thực tế 1.0.0

## Môi trường

- **Máy chủ**: SillyTavern 1.16.0 (`e3b866b`), 1.17.0 (`e3f4166`), 1.18.0 (`51ad27f`), 1.19.0 (`7e8663c`), tất cả đều cài đặt mới hoàn toàn theo tag chính thức, thư mục dữ liệu cô lập.
- **Tavern Helper**: Bản 1.19.0 chạy hai lượt — một lượt cài JS-Slash-Runner 4.11.2 (tag chính thức, không chỉnh sửa) chạy toàn bộ các bộ kiểm thử; sau đó đưa nó ra khỏi `third-party` rồi chạy lại một lượt các bộ kiểm thử chính. Bản 1.16–1.18 không cài Tavern Helper.
- **Trình duyệt**: Playwright Chromium (headless). Điện thoại 390×844 / ngang 844×390, mô phỏng cảm ứng (UA Android 14 / Chrome), DPR 2.
- **Mô hình mô phỏng**: `tests/qa/mock_model.py`, cổng 5001 (thông thường) và cổng 5002 (không gửi tiêu đề CORS). **Không sử dụng mô hình thực tế** (theo quyết định của bạn).
- Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

## Tính năng mới (`tests/native_v100.py`, 28 hạng mục)

| Kịch bản | Kết quả |
| --- | --- |
| Lilith nổi: Cả 12 tấm ảnh tách nền đều tải xong, không có nền thẻ / viền khung | ✅ |
| Chạm đúp cảm ứng thực tế (chọc) vào đầu cô ấy: đổi mảnh vá biểu cảm (`face-pout.webp`) và nói chuyện | ✅ |
| Nói chuyện khi đang nấp ở mép: ló ra trước, bong bóng thoại nằm gọn hoàn toàn trong màn hình | ✅ |
| Cài đặt: Mục Thường dùng mở sẵn, Cài đặt nâng cao / Chẩn đoán & Bảo trì thu gọn | ✅ (Thường dùng 19 mục, Nâng cao 23 mục, Chẩn đoán 5 mục) |
| Tìm kiếm 「thời gian chờ」: chỉ còn lại các mục khớp, nhóm Nâng cao đang thu gọn tự động mở ra; không tìm thấy có thông báo; sau khi xóa trống tự động thu gọn lại | ✅ |
| Cài đặt → Xuất / Nhập bản lưu → Xuất: tải xuống thực tế `诸天存档-*.json`, bao gồm sổ cái (Điểm Hệ Thống 1200) và cài đặt | ✅ |
| Trong tệp xuất ra không có API Key (trước khi kiểm thử đã lưu `sk-qa1000…`) | ✅ |
| Dán để nhập: xem trước hiển thị “Điểm Hệ Thống 5 → 1,200, Túi đồ 0 → 1” | ✅ |
| Xác nhận nhập: ghi và đọc lại, hộp thoại hiển thị “Đã ghi sổ cái và đọc lại khớp nhau” | ✅ |
| Tự động sao lưu trước khi nhập (lý do “Trước khi nhập”, Điểm Hệ Thống 5) | ✅ |
| Sau khi nhập, API Key trên máy vẫn còn nguyên | ✅ |
| Trong hộp thoại 「Di chuyển bản lưu cũ / Quay lui sổ cái」, bấm quay lui về bản “Trước khi nhập”: Điểm Hệ Thống quay về 5 | ✅ |
| Trạng thái trước khi quay lui được sao lưu và giữ lại (lý do “Trước khi quay lui”, Điểm Hệ Thống 1200) | ✅ |
| Phiên bản cấu trúc 1 được ghi trong siêu dữ liệu trò chuyện, trong sổ cái không có trường này | ✅ |
| Đổi phiên bản cấu trúc thành 99: thao tác ghi bị từ chối (“Chỉ đọc, vui lòng cập nhật plugin”), sổ cái không đổi | ✅ |
| Xóa phiên bản cấu trúc và làm hỏng túi đồ: sao lưu trước (“Trước khi nâng cấp cấu trúc 0→1”), sửa lại thành `[]`, đánh dấu là 1 | ✅ |
| Nhóm chat chọn 「Chỉ định nhân vật」 nhưng không điền tên: thông báo “…vui lòng điền tên nhân vật. Sổ cái: Không có thay đổi. Bước tiếp theo: …” | ✅ |
| `/zt init` không còn làm bật cửa sổ Sách Thế Giới lên nữa | ✅ |
| Hiệu ứng động 「Rút gọn」: hoạt ảnh Lilith nổi dừng lại, thiết bị đầu cuối gắn nhãn rút gọn, trình diễn chỉ hiển thị thẻ kết quả | ✅ |
| Hiệu ứng động 「Tự động」: màn hình cảm ứng 24 fps → Rút gọn; 60 fps → Đầy đủ | ✅ (tốc độ khung hình do kịch bản tiêm vào, không phải máy cấu hình thấp thực tế) |
| Điều hướng màn hình ngang: chỉ hiển thị Tổng quan / Nhiệm vụ / Thương thành / Túi đồ / Nhóm chat / Cài đặt + Thêm | ✅ |
| Bấm 「Thêm」: hiển thị toàn bộ 21 lối vào; sau khi chọn 「Tu hành」 sẽ thu gọn lại, mục Tu hành vẫn hiển thị | ✅ |
| Màn hình dọc / ngang không có lỗi trang | ✅ |

Ảnh chụp màn hình: `v100-float.png`, `v100-float-tap.png`, `v100-settings.png`, `v100-settings-search.png`, `v100-import-preview.png`, `v100-rollback.png`, `v100-land.png`, `v100-land-more.png` (nằm trong thư mục ảnh chụp bên ngoài gói bàn giao, không đưa vào kho lưu trữ).

## Bổ sung theo phản hồi người chơi (Số phiên bản giữ nguyên, `tests/native_v100_feedback.py`, 44 hạng mục, SillyTavern 1.19.0)

| Kịch bản | Kết quả |
| --- | --- |
| Trang Kết nối 「Lưu làm cấu hình sẵn」: khi chưa nhập tên thì mờ xám; chỉ nhập khoảng trắng vẫn mờ xám; cố bấm cũng không lưu | ✅ |
| Sau khi nhập tên thì bấm được, cấu hình sẵn đã lưu có tên, địa chỉ, mô hình; khi trùng tên nút đổi thành 「Ghi đè cấu hình sẵn」; xóa trống tên lại mờ xám | ✅ |
| Khóa bảo mật của cấu hình sẵn không nằm trong tệp trò chuyện (lưu trong biến toàn cục `诸天系统_API路由`) | ✅ |
| API phân nhánh tính năng: liệt kê 11 nơi; mỗi mục chọn được Theo mặc định / API chính của SillyTavern / Cấu hình sẵn; sau khi chọn sẽ lưu lại và hiển thị “Đang dùng ở đâu” (không hiển thị khóa bảo mật) | ✅ |
| Nhập hàng thương thành đặt thành cấu hình riêng: yêu cầu mang theo khóa bảo mật và mô hình riêng của nó (đối chiếu qua nhật ký mô hình mô phỏng) | ✅ |
| Rút thẻ chưa cài đặt riêng vẫn đi qua cổng mặc định | ✅ |
| Trò chuyện riêng Lilith đặt thành cấu hình sẵn: đi qua fetch của Lilith đổi sang khóa bảo mật và mô hình của cấu hình sẵn; tự động chỉnh lý ký ức vẫn đi qua mặc định; nút 「Kiểm tra kết nối」 ở trang Kết nối vẫn kiểm tra cổng mặc định | ✅ |
| Trang Giám định phẩm giai: liệt kê công pháp và vật phẩm đến từ cốt truyện / khối dữ liệu, hàng mua từ thương thành không liệt kê | ✅ |
| Bấm 「AI Giám định」: Thái Hư Kiếm Ý Phàm phẩm → Tiên phẩm, giới hạn trần 2000, xóa trạng thái viên mãn, ghi lại phương thức và lý do; yêu cầu đi qua cấu hình sẵn đặt cho 「Giám định phẩm giai」; ghi vào bản ghi công pháp; trên trang hiển thị kết quả và lý do | ✅ |
| Sửa thủ công: Cổ Kiếm Phàm phẩm → Linh phẩm, giá thu hồi giữ nguyên 100; sau đó hộp chọn thả xuống chỉ còn các phẩm giai cao hơn | ✅ |
| Thanh công cụ trang Tu hành và trang Túi đồ đều có lối vào 「Giám định phẩm giai」 | ✅ |
| Khối dữ liệu tầng mới `功法修炼: 收录:Tàn Nguyệt Đao Pháp[灵品]`: Tàn Nguyệt Đao Pháp Phàm phẩm → Linh phẩm (trần 500, phương thức “Đính chính thu lục”) | ✅ |
| Lời nhắc phẩm giai được tiêm mỗi lượt (sau khi tải lại cuộc trò chuyện vẫn còn) | ✅ |
| Kéo Lilith nổi: dưới đáy xuất hiện 「Kéo vào đây để đóng cửa sổ nổi」; kéo vào rồi thả tay sẽ bật hộp thoại xác nhận, ghi rõ cách vào lại bảng điều khiển từ bảng 「Tiện ích mở rộng」 của SillyTavern → 「Mở Thiết Bị Đầu Cuối Chư Thiên」 | ✅ |
| Chọn 「Giữ cô ấy lại」 sẽ không đóng; menu chuột phải có Mở Thiết Bị Đầu Cuối Chư Thiên / Giấu vào mép màn hình / Đóng cửa sổ nổi; sau khi xác nhận sẽ đóng lại (đặt thành off, ẩn đi), thông báo cũng ghi rõ lối vào | ✅ |
| Nút 「Hiển thị Lilith nổi」 trên bảng tiện ích mở rộng đưa cô ấy quay trở lại | ✅ |
| Cài đặt → Thường dùng → 「Công tắc plugin」 → 「Tắt plugin 1 chạm」: hỏi xác nhận trước (ghi rõ cách bật lại); hủy thì không tắt | ✅ |
| Sau khi xác nhận, SillyTavern ghi nhận là đã tắt, trang làm mới, plugin không tải nữa; sau đó dùng giao diện bật của chính SillyTavern để mở lại, plugin khởi động bình thường | ✅ |
| Suốt quá trình không có lỗi trang | ✅ |
| Điện thoại (390×844, cảm ứng, UA Android): ngón tay nhấn giữ chưa tới 0.4 giây sẽ không nhấc lên; sau khi nhấn giữ đủ lâu sẽ nhấc lên và hiển thị 「Kéo vào đây để đóng cửa sổ nổi」 ở dưới đáy (sự kiện cảm ứng thực, CDP `Input.dispatchTouchEvent`) | ✅ |
| Điện thoại: mục tiêu đóng nằm ở đáy màn hình (y≈802) và sáng lên dưới ngón tay; thả tay bật hộp thoại xác nhận, ghi rõ 「Tiện ích mở rộng」 → 「Mở Thiết Bị Đầu Cuối Chư Thiên」; xác nhận xong sẽ đóng lại, thông báo cũng ghi rõ tương tự | ✅ |
| Điện thoại: thẻ trình diễn trên trang trò chuyện và nút lối vào dự phòng nằm gọn trong màn hình, sát phía dưới đáy (trước khi sửa lần lượt nằm ở y=−164 và y=−148, ngoài màn hình) | ✅ |
| Phần điện thoại không có lỗi trang | ✅ |

Ngoài ra: `tests/v100-feedback.test.js` gồm 19 hạng mục thuần logic (lưu / phân tích / dự phòng của cấu hình sẵn và phân nhánh tính năng, phân loại toàn bộ lời nhắc nguyên bản của thanh trạng thái, ứng viên / lời nhắc / phân tích / chỉ tăng không giảm / giá thu hồi / hợp nhất của giám định phẩm giai, đính chính thu lục, tắt plugin, văn bản đóng cửa sổ nổi, lớp nổi cố định dưới bố cục điện thoại không dùng định vị `bottom`).

Hồi quy (cùng máy 1.19.0, không cài Tavern Helper): native_v100 28/28, v080 33/33, v081 20/20, v083 13/13, v084 29/29, v085 20/20, v090 24/24, v091 35/35, v093 29/29, v094 9/9, group060 44/44, terminal050 58/58, world070 40/40, v082 24/24 (bỏ qua mục Tavern Helper), guards đạt.

## Ma trận máy chủ

| Bộ kiểm thử | 1.16.0 | 1.17.0 | 1.18.0 | 1.19.0 + Tavern Helper | 1.19.0 Không Tavern Helper |
| --- | --- | --- | --- | --- | --- |
| native_v100 | 28/28 | 28/28 | 28/28 | 28/28 | 28/28 |
| native_world070 | 40/40 | 40/40 | 40/40 | 40/40 | — |
| native_terminal050 | 58/58 ¹ | 58/58 | 58/58 | 58/58 | 58/58 |
| native_group060 | 44/44 ⁴ | 44/44 | 44/44 ⁴ | 44/44 ² ⁴ | 44/44 ⁴ |
| native_guards | Đạt | Đạt | Đạt | Đạt | — |
| native_v090 (Bố cục điện thoại) | 24/24 | 24/24 | 24/24 | 24/24 | — |
| native_v082 (Lilith nổi, gỡ gắn kết, thanh trạng thái thẻ nhân vật) | — | — | — | 25/25 ² ⁴ | 24/24 (bỏ qua 1 mục cần Tavern Helper) |
| native_v094 | — | — | — | 9/9 | 9/9 |
| Còn lại (v080, v081, v083, v084, v085, v091, v092, v093) | — | — | — | Đạt toàn bộ ³ | — |

¹ Lượt đầu do thiếu bộ nhớ sandbox (2 GB, lúc đó mở cùng lúc hai SillyTavern) nên xuất hiện một lần quá hạn chụp ảnh và một lần quá hạn chờ cố định “Nhập hàng 1 chạm”; sau khi tắt bớt SillyTavern thừa rồi chạy lại riêng thì đạt 58/58.
² Lượt đầu thất bại do các bài kiểm thử ảnh hưởng lẫn nhau: `native_v100` đặt Lilith nổi thành “Luôn hiển thị” mà chưa đổi về lại, che mất nút trên máy tính. Đã khôi phục mặc định ở cuối `native_v100` và lưu xuống đĩa ngay, chạy lại đạt.
³ v080 33/33, v081 20/20, v083 13/13, v084 29/29, v085 20/20, v091 35/35, v092 17/17, v093 29/29.
⁴ Đã đổi `page.reload()` + `goto` liên tiếp trong `native_group060` và `native_v082` thành `Z.reboot()` (đợi 1.5 giây rồi chỉ điều hướng một lần, nới thời gian chờ tải lên 90 giây). Mã nguồn plugin không thay đổi.

## Kiểm tra tĩnh

- `npm run check`: Kiểm tra cú pháp toàn bộ tệp nguồn + kiểm tra trích xuất nguyên bản đều đạt (đã thêm `src/data-io.js`, `src/errors.js`, `src/perf.js`, `src/lilith-float-art.js` vào danh sách kiểm tra).
- `npm test`: Toàn bộ kiểm thử đơn vị đều đạt (thêm mới `tests/v100.test.js` 23 hạng mục).
- `npm run filelist:check`: `FILELIST.sha256` đồng nhất với kho lưu trữ.
- Số phiên bản: `src/contracts.js`, `manifest.json`, `package.json`, `package-lock.json` (hai nơi) đều là 1.0.0.

## Chưa nghiệm thu

- **Mô hình thực tế**: Toàn bộ tính năng AI chỉ dùng mô hình mô phỏng; trong bảng năng lực được đánh dấu là `experimental` (Thử nghiệm), đầu trang Cài đặt và README đều ghi rõ.
- **Máy thật**: iPhone, Android, màn hình nhỏ rộng 360, TauriTavern đều chưa kiểm thử. Cảm giác vuốt chạm Lilith nổi, điều hướng màn hình ngang, tự động hạ cấp tốc độ khung hình mới chỉ xác minh trong Chromium headless.
- **Nút 「Chọn tệp bản lưu…」**: Chưa thao tác hộp thoại tệp hệ thống trong trình duyệt; nó và 「Dán văn bản bản lưu」 đi qua cùng một hàm phân tích.
- **Tiếp quản 1 chạm v1.1 (`native_replace040`)**: Cần gói ngoại tuyến v1.1 không tải lên nên đợt này không chạy.
- **Nhóm thanh toán Thần thông, Phái Cử Phân Thân, Động Thiên Tùy Thân, rút thẻ số lần tùy chỉnh**: Vẫn chưa bấm từng mục.
- **Bổ sung phản hồi người chơi**: Mới nghiệm thu trên bản 1.19.0; phán đoán AI của giám định phẩm giai và API phân nhánh tính năng chỉ dùng mô hình mô phỏng.
