# Thay đổi 0.9.0 (Thích ứng thiết bị di động)

Bản 0.9.0 tập trung vào một mục tiêu duy nhất: giúp Thiết Bị Đầu Cuối Chư Thiên sử dụng mượt mà và thuận tiện trên điện thoại. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.9.0](ACCEPTANCE-0.9.0.md), các công việc tiếp theo hướng tới bản 1.0 xem tại [ROADMAP-1.0](ROADMAP-1.0.md).

- Các trường sổ cái, mục từ Sách Thế Giới và khóa lưu trữ đều không thay đổi, **không cần nhập lại Sách Thế Giới**.
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc. Chế độ toàn màn hình hoạt động bằng lớp phủ CSS (`dialog[data-zt-mobile]`), trình quản lý cửa sổ nguyên bản vẫn chạy bình thường.
- Mới nghiệm thu trong trình mô phỏng cảm ứng điện thoại của Playwright Chromium, **chưa kiểm thử trên điện thoại iOS / Android thực tế**.

## I. Các vấn đề của bản 0.8.5 trên điện thoại (Kiểm thử thực tế)

Bản 0.8.5 trên điện thoại vẫn dùng chung cửa sổ nổi của bản máy tính: chừa lề 8 px bốn phía và ghi nhớ kích thước cửa sổ. Khi kiểm thử thực tế trong môi trường cô lập 1.19 với các kích thước 390×844 (dọc), 844×390 (ngang), 360×640 (màn hình nhỏ):

| Hiện tượng | Đo thực tế trên bản 0.8.5 |
| --- | --- |
| Màn hình dọc 390×844, chiều cao vùng nội dung | 548 px (thanh đỉnh + điều hướng + thanh sổ cái + dòng trạng thái chiếm mất 1/3) |
| Màn hình ngang 844×390, chiều cao vùng nội dung | **122 px**, chỉ nhìn thấy được khoảng hai dòng chữ |
| Sau khi dùng ở màn hình ngang rồi xoay về dọc | Cửa sổ vẫn giữ kích thước 380×354 đã nhớ lúc xoay ngang, vùng nội dung chỉ còn 148 px |
| Sau phiên làm việc trên điện thoại quay lại máy tính | Thiết bị đầu cuối trên máy tính bị biến thành kích thước điện thoại (kích thước cửa sổ nhớ trên điện thoại ghi đè mất của máy tính) |
| Khi bàn phím bộ gõ bật lên | Bàn phím che khuất ô nhập liệu của nhóm chat; thiết bị đầu cuối không tự thu thấp lại |
| Mục tiêu chạm | Nút cửa sổ 28 px, nút nhỏ 28 px, nhãn nhóm chat 30 px (khuyến nghị ≥ 44 px) |
| Cỡ chữ ô nhập liệu | Nhỏ hơn 16 px, trên iOS vừa chạm vào ô nhập liệu là toàn bộ trang bị phóng to và không tự thu nhỏ lại |
| Trò chuyện riêng | Bảng nhỏ 374×426 nổi trên thiết bị đầu cuối, vùng lịch sử trò chuyện chỉ còn lại một khe hẹp |
| Lilith nổi | Khi thiết bị đầu cuối đang mở lại đứng ở giữa vùng nội dung, bong bóng thoại che mất nội dung đang xem |

## II. Giải pháp của bản 0.9.0

Mô-đun mới `src/mobile.js` (`MobileLayout`), chỉ điều chỉnh bố cục, không chạm tới dữ liệu trò chuyện hay sổ cái.

### 1. Thiết bị đầu cuối toàn màn hình

- Trên điện thoại, thiết bị đầu cuối trải kín vùng nhìn thấy, bốn phía không chừa lề, ẩn viền thay đổi kích thước và nút 「Đặt lại cửa sổ」; ẩn gợi ý 「Kéo cửa sổ」 ở trên cùng, màn hình dọc ẩn luôn nhãn nhỏ số phiên bản.
- Tôn trọng vùng an toàn của tai thỏ / thanh cử chỉ đáy màn hình (`env(safe-area-inset-*)`).
- Phán đoán 「Điện thoại」: chiều rộng cửa sổ ≤ 720 px, hoặc màn hình cảm ứng có cạnh ngắn ≤ 600 px. Máy tính bảng (như màn hình cảm ứng 1024×768) vẫn giữ cửa sổ nổi.

### 2. Đi theo bàn phím bộ gõ

- Dùng `visualViewport` để đọc vùng nhìn thấy phía trên bàn phím, chiều cao thiết bị đầu cuối tự động co giãn theo; khi chiều cao bàn phím > 120 px sẽ coi là bàn phím đang bật lên.
- Khi bàn phím bật lên, thanh sổ cái (`.zt-hub-top`) và dòng trạng thái dưới cùng sẽ nhường chỗ để dành không gian cho ô nhập liệu và lịch sử trò chuyện; khi ở màn hình ngang thì cả thanh đỉnh cũng nhường chỗ. Sau khi thu bàn phím xuống sẽ khôi phục lại như cũ.
- Khoảng 0.4 giây sau khi ô nhập liệu nhận tiêu điểm (đợi hoạt ảnh bàn phím kết thúc) sẽ tự cuộn tới vị trí nhìn thấy, chỉ cuộn bên trong vùng cuộn riêng của thiết bị đầu cuối.

### 3. Màn hình ngang: Thanh điều hướng dọc bên trái

- Khi xoay ngang (rộng > cao và cao ≤ 520 px), thanh điều hướng phía trên chuyển thành cột dọc rộng 78 px ở bên trái, giúp chiều cao vùng nội dung tăng từ 122 px lên 250 px (ở 844×390).
- Nút của trang hiện tại trên thanh điều hướng sẽ tự động cuộn tới vùng nhìn thấy.

### 4. Trò chuyện riêng toàn màn hình

- Trên điện thoại, bảng trò chuyện riêng (`#lc-panel`) cũng hiển thị toàn màn hình và co giãn theo bàn phím; thanh kéo và viền thay đổi kích thước được ẩn đi.
- Khi xoay ngang hoặc khi bàn phím bật lên, dải cận cảnh khuôn mặt Lilith ở đầu khung trò chuyện riêng sẽ tự động nhường chỗ.

### 5. Mục tiêu chạm & Ô nhập liệu

- Nút cửa sổ 42 px, nút điều hướng cao 46 px, nút nhỏ 36 px, nhãn nhóm chat 40 px, nút gửi nhóm chat 44 px, nút thanh đỉnh trò chuyện riêng 42 px.
- Trên màn hình cảm ứng (bao gồm cả khi chọn 「Cửa sổ nổi」), toàn bộ ô nhập liệu, hộp chọn thả xuống và ô văn bản nhiều dòng đều sử dụng cỡ chữ 16 px, kể cả các trang động cơ bên trong thiết bị đầu cuối (`ENGINE_CSS` trong `src/hub.js`).

### 6. Lilith nổi

- Khi thiết bị đầu cuối ở chế độ toàn màn hình, cô ấy sẽ lùi về góc dưới ở phía tương ứng để chờ (`parkSpot()`); khi ở màn hình ngang sẽ cố định ở bên phải để không che thanh điều hướng bên trái. Sau khi đóng thiết bị đầu cuối, cô ấy sẽ quay về đúng vị trí bạn đã đặt.
- Bấm vào bong bóng thoại của cô ấy sẽ thu gọn ngay; khi cuộn trang bên trong thiết bị đầu cuối, bong bóng thoại cũng tự thu gọn.

### 7. Kích thước cửa sổ ghi nhớ trên máy tính không còn bị điện thoại ghi đè

- Trình quản lý cửa sổ nguyên bản lưu kích thước cửa sổ mỗi lần đặt vị trí. Bản 0.9.0 đã thêm bộ lọc ở tầng cầu nối (`Bridge.addScriptFilter`): khi phiên toàn màn hình ghi tùy chọn `*_UI` sẽ giữ nguyên kích thước `window` đã lưu trước đó, các trường khác vẫn lưu bình thường.
- Khi chuyển sang chế độ 「Cửa sổ nổi」 trên điện thoại thì vẫn lưu kích thước như bình thường.

### 8. Cài đặt

Cài đặt → 「Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại」:

| Tùy chọn | Hiệu quả |
| --- | --- |
| Tự động: Toàn màn hình trên điện thoại (Khuyên dùng, Mặc định) | Phán đoán theo điều kiện nêu trên |
| Luôn toàn màn hình | Trên máy tính cũng toàn màn hình (khi cửa sổ thấp sẽ dùng bố cục màn hình ngang) |
| Cửa sổ nổi (Kiểu của bản 0.8.5 trở về trước) | Tắt toàn màn hình; cỡ chữ 16 px cho ô nhập liệu vẫn có hiệu lực |

## III. Các chỉnh sửa đi kèm

- `manifest.json`: đổi `homepage` thành tên trường `homePage` mà SillyTavern đọc.
- `npm run check`: bổ sung `src/lilith-float.js`, `src/wb-unbind.js`, `src/worldbook.js` và thêm `src/mobile.js`.
- Kiểm thử phiên bản: cập nhật khẳng định phiên bản trong `tests/v083.test.js`, `v084.test.js`, `v085.test.js` thành 「≥ phiên bản đó và đồng nhất ở mọi nơi」.
- `FILELIST.sha256`: tạo lại theo đúng số byte thực tế của các tệp trong kho lưu trữ (180 mục).
