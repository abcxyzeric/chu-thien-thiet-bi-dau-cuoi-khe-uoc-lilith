# Thay đổi 0.9.1 (Tự kiểm tra trên máy thật, Sao chép thông tin chẩn đoán, Chuẩn hóa kỹ thuật)

Bản 0.9.1 là phiên bản tiếp nối ngay sau bản 0.9.0 trong [ROADMAP-1.0](ROADMAP-1.0.md). Kết quả nghiệm thu xem tại [ACCEPTANCE-0.9.1](ACCEPTANCE-0.9.1.md).

- Các trường sổ cái, mục từ Sách Thế Giới và khóa lưu trữ đều không thay đổi, **không cần nhập lại Sách Thế Giới**. Cài đặt mới duy nhất được thêm vào là `deviceCheck`, dùng để lưu kết quả tự kiểm tra trên máy thật lần trước.
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc.

## I. Tự kiểm tra trên điện thoại thật

Lối vào: Cài đặt → Tương thích & Bảo trì → 「Tự kiểm tra trên điện thoại thật…」, hoặc nút 「Tự kiểm tra trên điện thoại thật」 trong hộp thoại Chẩn đoán tương thích, hoặc lệnh gạch chéo `/zt selftest`.

Trên đầu màn hình sẽ xuất hiện một thẻ nhỏ hướng dẫn từng bước một, mất khoảng 2 phút. Quá trình tự kiểm tra **không ghi sổ cái, không gửi tin nhắn trò chuyện, không gọi mô hình**.

| Bước | Tự động / Cần thao tác | Kiểm tra những gì |
| --- | --- | --- |
| 1 Môi trường | Tự động | Màn hình cảm ứng, cửa sổ & vùng nhìn thấy, tỷ lệ điểm ảnh, vùng an toàn tai thỏ / thanh cử chỉ |
| 2 Toàn màn hình | Tự động | Thiết bị đầu cuối có phủ kín vùng nhìn thấy hay không; chiều cao vùng nội dung |
| 3 Các trang | Tự động | Mở lần lượt toàn bộ các trang của thiết bị đầu cuối để đo: có phần tử nào tràn khỏi màn hình không, trang có bị cuộn ngang không, nút điều hướng / nhãn / gửi có ≥ 36 px không, ô nhập liệu có ≥ 16 px không (gồm cả trang động cơ) |
| 4 Nhóm chat + Bàn phím | **Bấm một cái vào ô nhập liệu** | Sau khi bàn phím bật lên, thiết bị đầu cuối có thu thấp lại không, thanh sổ cái có nhường chỗ không, ô nhập liệu có lộ ra phía trên bàn phím không |
| 5 Trò chuyện riêng | Tự động mở + **Bấm một cái vào ô nhập liệu** | Trò chuyện riêng có toàn màn hình không; sau khi bàn phím bật lên ô nhập liệu có nhìn thấy rõ không |
| 6 Lilith nổi | Tự động | Khi thiết bị đầu cuối đang mở có đứng ở góc dưới mà không che nội dung không |
| 7 Màn hình ngang | **Xoay ngang điện thoại, rồi xoay dọc trở lại** | Chiều rộng thanh điều hướng bên trái, chiều cao vùng nội dung |
| 8 Phím quay lại | **Nhấn phím quay lại / vuốt cạnh quay lại một lần** | Phím quay lại có chỉ đóng thiết bị đầu cuối mà vẫn giữ nguyên trang SillyTavern hay không |

- Các bước cần thao tác đợi tối đa 25 giây, nếu hết thời gian sẽ ghi là 「⚠ Chưa đợi được」; mỗi bước đều có thể 「Bỏ qua bước này」, hoặc 「Kết thúc tự kiểm tra」 bất cứ lúc nào.
- Sau khi kết thúc sẽ liệt kê ✅ / ⚠ / ❌, bên dưới là văn bản kèm các con số đo đạc gốc, bấm 「Sao chép kết quả」 để sao chép bằng một chạm. Kết quả được lưu trong cài đặt và sau đó khi bấm 「Sao chép thông tin chẩn đoán」 cũng sẽ tự động đính kèm theo.
- Thẻ bước kiểm tra nằm ở tầng trên cùng, bấm vào nó sẽ không bị tính là “bấm ra bên ngoài thiết bị đầu cuối” nên không làm đóng thiết bị đầu cuối (`data-zt-keep-hub`).

Triển khai: `src/device-check.js` (`DeviceCheck`; các hàm thuần `measurePage`, `fillsView`, `summarize`).

## II. Sao chép thông tin chẩn đoán

Lối vào: Cài đặt → Tương thích & Bảo trì → 「Sao chép thông tin chẩn đoán」, hoặc nút trong hộp thoại Chẩn đoán tương thích, hoặc lệnh `/zt copydiag`.

Nội dung sao chép là một đoạn văn bản thuần để bạn dán trực tiếp khi gửi phản hồi báo lỗi:

- Phiên bản plugin, phiên bản SillyTavern và kết luận tương thích;
- UA trình duyệt, ngôn ngữ, cửa sổ / màn hình / vùng nhìn thấy, tỷ lệ điểm ảnh, màn hình cảm ứng, vùng an toàn, có phải HTTPS không, có đang chạy dưới dạng “Thêm vào màn hình chính” không, bố cục điện thoại và chế độ bàn phím hiện tại;
- Từng hạng mục giao diện máy chủ ✅ / ❌; chế độ thanh trạng thái, trạng thái kết xuất tầng mới nhất, thiết bị đầu cuối / trợ lý Lilith / Lilith nổi có đang chạy hay không;
- Cổng AI: **chỉ ghi tên máy chủ và tên mô hình** (như `api.example.com · gpt-x`), hoặc 「API chính của SillyTavern」, 「Chưa cài đặt」;
- Cài đặt plugin (theo cơ chế danh sách trắng: biến kịch bản, bản ghi tiếp quản, vị trí cửa sổ nổi v.v. không xuất ra, các danh sách chỉ ghi số lượng mục);
- Kết quả tự kiểm tra trên máy thật lần trước;
- 30 thông báo lỗi gần nhất của plugin: `console.error / console.warn` bắt đầu bằng `[诸天…]` / `[Chư Thiên…]`, cùng lỗi trang và lỗi Promise chưa xử lý xuất phát từ tệp của plugin (`ErrorLog`, bắt đầu ghi ngay từ trước khi tải cài đặt nên bắt được cả lỗi ở giai đoạn khởi động).

**Sẽ không bao giờ xuất hiện**: API Key, biến kịch bản, nội dung trò chuyện, con số sổ cái, tên nhân vật. Toàn bộ văn bản trước khi xuất ra còn đi qua hàm lọc `redact()` thêm một lần nữa: `sk-… / AIza… / Bearer … / key=… / token=…`, tài khoản/mật khẩu và tham số truy vấn trong URL, cùng các chuỗi dài từ 40 ký tự trở lên đều bị che đi (kể cả trong thông báo lỗi).

Bộ nhớ tạm (Clipboard):

- HTTPS hoặc địa chỉ máy cục bộ (`localhost`): dùng `navigator.clipboard`;
- Khi điện thoại mở SillyTavern qua địa chỉ mạng nội bộ (`http://192.168.x.x:8000`) không có ngữ cảnh bảo mật nên `navigator.clipboard` không khả dụng, hệ thống sẽ chuyển sang dùng `document.execCommand('copy')`;
- Khi cả hai cách đều thất bại sẽ bật lên một ô văn bản, tự động bôi đen toàn bộ để bạn sao chép thủ công.

Triển khai: `src/diag-report.js` (`redact`, `settingsSnapshot`, `endpointText`, `ErrorLog`, `environment`, `buildReport`, `copyText`).

## III. Chỉnh sửa cho thiết bị di động

- **Bàn phím làm lùn cả trang**: Một số Android WebView / trình duyệt bọc vỏ khi bật bàn phím ảo không làm thu nhỏ `visualViewport` mà trực tiếp làm lùn toàn bộ trang (`innerHeight`). Bản 0.9.0 chỉ nhận diện kiểu thứ nhất. Bản 0.9.1 khi thấy ô nhập liệu đang có tiêu điểm và chiều cao trang thấp hơn ban đầu từ 120 px trở lên cũng sẽ xử lý như “bàn phím đã bật lên” (`keyboardState()`, `kbMode = 'resize'`). Xoay màn hình không bị phán đoán nhầm: khi không có ô nhập liệu nào đang nhận tiêu điểm thì không tính là bàn phím.

## IV. Chuẩn hóa kỹ thuật

- **Ký tự ngắt dòng**: Toàn bộ 25 tệp văn bản CRLF cũ trong kho lưu trữ đều được chuyển thành LF; thêm mới `.gitattributes` (`* text=auto eol=lf`, `vendor/**` không chuyển đổi ngắt dòng để giữ nguyên byte, hình ảnh / phông chữ / tệp nén được đánh dấu là nhị phân).
- **CI**: Thêm mới `.github/workflows/ci.yml` (GitHub Actions). Mỗi lần push / PR sẽ tự động chạy `npm ci`, `npm run check`, `npm test`, kiểm tra `FILELIST.sha256` đã mới nhất chưa, có ký tự CRLF hay không, và có chuỗi nào giống khóa bảo mật hay không (không tính thư mục kiểm thử).
- **`FILELIST.sha256` được tạo bằng kịch bản**: `npm run filelist` tạo lại danh sách, `npm run filelist:check` kiểm tra (chạy trong CI). `tools/filelist.py` duyệt thư mục kho lưu trữ, bỏ qua `.git`, `node_modules` và chính `FILELIST.sha256`.
- **Quy tụ khẳng định phiên bản**: `tests/version.test.js` kiểm tra thống nhất tính đồng nhất phiên bản giữa manifest / package.json / package-lock / contracts / README / FEATURE_MATRIX / CHANGES / ACCEPTANCE.
