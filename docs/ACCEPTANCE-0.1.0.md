# Điểm kiểm tra phát triển 0.1.0: Báo cáo nghiệm thu thực tế

Ngày: 2026-09-29. Kết luận: **Lối vào tiện ích mở rộng gốc, Lilith nguyên bản, tương tác người chơi trong chính văn và một phần tính năng đọc dữ liệu gốc đã được kết nối; việc di chuyển toàn bộ tính năng nguyên bản vẫn chưa hoàn tất.**

## Môi trường

- SillyTavern độc lập **1.19.0**, commit `06bde939fb1e9c4c8d8641d810f0a916b5bce127`.
- Chỉ phục vụ xem trước nhúng trên nền tảng, trong máy chủ kiểm thử dùng một lần này đã tắt X-Frame-Options; bản xem trước HTTPS e2b sử dụng Cookie phiên Secure, SameSite=None, Partitioned và giữ nguyên bảo vệ CSRF. Không thay đổi API trò chuyện/gửi tin. Tinh chỉnh dành riêng cho xem trước này cùng cấu hình máy chủ không đi kèm gói tiện ích mở rộng và không nên áp dụng cho SillyTavern sản xuất thực tế.
- Thư mục dữ liệu kiểm thử hoàn toàn mới. Chỉ sử dụng nhân vật/cuộc trò chuyện kiểm thử mang tên “Nghiệm thu cô lập” và sổ cái kiểm thử được đánh dấu rõ ràng, không chạm tới bản lưu thực tế của người dùng.
- Chưa cài đặt Tavern Helper; không có thông tin xác thực mô hình; không phát sinh yêu cầu tạo phản hồi mô hình trả phí hay miễn phí.
- Playwright / Chromium; máy tính 1500×1000, khung nhìn di động 390×844.
- Nghiệm thu hoạt ảnh sử dụng kết xuất WebGL phần mềm; ngoài ra tắt WebGL để kiểm thử dự phòng tĩnh. Điều này không đại diện cho GPU điện thoại thực tế, tốc độ khung hình hay mức tiêu thụ pin.
- Tiện ích mở rộng được tải từ thư mục thực tế `public/scripts/extensions/third-party/zhutian-covenant-terminal`, gọi `getContext` và `sendMessageAsUser` thực sự; không mô phỏng API máy chủ.

## Các bài kiểm thử đã đạt

### Kiểm tra tĩnh và thuần logic

`npm run check` đạt; `npm test` **15/15** đạt: giới hạn đầu vào, trung hòa macro & HTML, định danh đơn nhân vật, bản chụp nhanh cuộc trò chuyện, chiếu chỉ đọc, ranh giới năng lực, tính hợp lệ của định dạng/bằng chứng/nhánh ký ức gốc, sự tồn tại của API hoạt ảnh gốc, cùng mã băm SHA256 của năm tệp gốc.

### Luồng chính trên máy chủ thực tế: 14 hạng mục

Kết quả gốc: [evidence/acceptance.json](evidence/acceptance.json).

1. Tiện ích mở rộng gốc tải thành công và xuất hiện lối vào.
2. Tranh đứng nguyên bản thực sự đi vào chế độ kết xuất phân lớp `layers`.
3. Chạm/bấm bàn phím vào tranh đứng tạo ra bản nháp chưa gửi, không tự thêm phản hồi trò chuyện mới.
4. Tùy chọn giảm chuyển động và đóng cửa sổ đều tạm dừng hoạt ảnh.
5. Đọc sổ cái biến số gốc của cuộc trò chuyện kiểm thử.
6. Gửi tin nhắn người chơi thực sự sau khi xác nhận.
7. Gửi hành động người chơi tới một nhân vật cốt truyện khác.
8. Giữ nguyên bản nháp đang có trong ô nhập liệu trò chuyện chính.
9. Sau khi tải lại trang, **2 mục** tương tác người chơi đã lưu bền vững trên máy chủ cùng nhãn đánh dấu của chúng vẫn còn nguyên.
10. Bật rõ ràng gợi ý hồi ức nguyên bản.
11. Chuyển cuộc trò chuyện sẽ xóa bản xem trước cũ và gợi ý cũ.
12. Khung nhìn điện thoại không bị tràn ngang.
13. Điện thoại mở rộng được bảng nhân vật Lilith nguyên bản.
14. Sau khi tắt rồi bật lại, lối vào vẫn là duy nhất và không xóa cuộc trò chuyện trên máy chủ.

### Bảo vệ gửi tin & Lỗi lưu trữ: 5 nhóm

Kết quả gốc: [evidence/guards.json](evidence/guards.json).

- Từ chối gửi khi có tệp trong đầu vào đính kèm gốc, số lượng tin nhắn trò chuyện không đổi.
- Sự kiện chỉnh sửa của máy chủ làm vô hiệu hóa bản nháp cũ, bao gồm cả thay đổi lịch sử ở tin nhắn không phải cuối cùng.
- Từ chối gửi trong suốt sự kiện vòng đời tạo phản hồi của máy chủ. **Đây là bài kiểm thử khóa sự kiện, không phải nghiệm thu tạo phản hồi mô hình thực tế.**
- Từ chối gửi đồng thời và chứng từ đã sử dụng, tối đa chỉ thêm mới một tin; macro/HTML kiểm thử được xử lý như văn bản trơ, không thực thi kịch bản.
- Chỉ tiêm lỗi HTTP 503 vào giao diện đọc lại cuộc trò chuyện: việc gửi/lưu thực tế vẫn đi qua máy chủ; tiện ích mở rộng báo cáo trạng thái không thể xác minh, không tự động thử lại, gửi lại chứng từ cũ cũng không gây gửi lặp.

### Màn hình đầu di động & Giao diện (UI): 9 nhóm

Kết quả gốc: [evidence/views.json](evidence/views.json).

- Cả sáu khung nhìn đều không bị tràn ngang.
- 35 quy tắc tích hợp sẵn và kết quả tìm kiếm chính xác.
- Bản ghi nhiệm vụ tạo ra bản nháp đặt câu hỏi chưa gửi.
- Mục túi đồ tạo ra bản nháp quan sát chưa gửi, nêu rõ không tiêu hao vật phẩm.
- Khi tắt WebGL vẫn nhìn thấy tranh đứng tĩnh nguyên bản.
- Chuyển cuộc trò chuyện khi ô nhập liệu vẫn đang có tiêu điểm (focus), bản nháp cũ cũng được xóa sạch.
- Khi tải SillyTavern trực tiếp ở kích thước điện thoại, lối vào nổi hiển thị rõ và bấm được.
- Từ chối gửi khi chưa tích chọn xác nhận.
- Tắt/bật nhanh liên tiếp vẫn chỉ để lại một lối vào và một thiết bị đầu cuối.

Toàn bộ kết quả trình duyệt nêu trên đều có **0 lỗi trang (pageerror)**. Số yêu cầu mô hình là **0**. Việc tiêm lỗi tạo ra lỗi mạng đúng như dự kiến, không tuyên bố bảng điều khiển hoàn toàn không có bất kỳ cảnh báo mạng nào.

## Phát hiện và sửa lỗi trong đợt này

- Bao đóng (closure) mô-đun gốc thiếu `atob` của trình duyệt khiến giải mã trọng số gốc đi nhầm vào nhánh Buffer: đổi sang gắn kết `atob` của nền tảng, không sửa đổi chính văn mô-đun gốc.
- Khởi tạo sớm hơn thời điểm máy chủ hoàn tất: đổi sang chờ `APP_READY`, và có thể hủy đăng ký đang chờ khởi động.
- Nút nhân vật trên điện thoại bị kiểu mặc định phía sau che khuất: sửa lại thứ tự CSS và quy tắc máy tính bảng/điện thoại.
- Thuộc tính `html transform` trong bố cục di động của SillyTavern làm lối vào `fixed-bottom` chạy ra ngoài màn hình: sử dụng định vị chiều cao khung nhìn động và kiểm thử lại từ màn hình đầu di động.
- Khi chuyển cuộc trò chuyện, tiêu điểm (focus) cản trở việc làm mới biểu mẫu: buộc cập nhật biểu mẫu khi định danh thay đổi.
- Promise lưu của máy chủ có thể nuốt mất lỗi thất bại: bổ sung kiểm tra đọc lại chứng từ từ máy chủ.
- Chỉnh sửa lịch sử và chuyển đổi vòng đời nhanh: bổ sung cơ chế vô hiệu hóa thế hệ bản nháp và dọn dẹp thực thể đang chờ khởi động.

## Chưa nghiệm thu / Không cam kết

- Cài đặt qua URL kho lưu trữ Git mới, cập nhật từ xa và phát hành chính thức.
- Thương thành gốc, rút thẻ, thu hồi, bàn làm việc đầy đủ, tự động chỉnh lý ký ức, API trò chuyện riêng và động cơ quyết toán duy nhất.
- Phản hồi mô hình thực tế, ngắt luồng (stream), tính phí khi thất bại và chiến lược kết nối độc lập.
- Bản lưu cũ thực tế của người dùng, giao dịch đồng thời trên nhiều thẻ trình duyệt/tiiện ích mở rộng khác, trò chuyện nhóm.
- Hiệu năng trên điện thoại cấu hình thấp thực tế, tốc độ khung hình GPU thật, các trình duyệt khác nhau, bàn phím ảo và kiểm toán khả năng truy cập đầy đủ.
- Bộ điều hợp này có bản chụp nhanh trước khi gửi và kiểm tra ngữ cảnh sau khi gửi, nhưng không thể biến thao tác gửi toàn cục của máy chủ thành giao dịch nguyên tử xuyên tiện ích mở rộng. Việc chuyển đổi đồng thời từ tiện ích mở rộng khác hoặc nhiều thẻ trình duyệt vẫn là ranh giới cần giải quyết tiếp.

**Không được diễn giải báo cáo này thành “toàn bộ tính năng nguyên bản đã di chuyển xong” hoặc “có thể thay thế trực tiếp phiên bản sản xuất”.**

## Ảnh chụp màn hình

Dưới đây là ảnh chụp màn hình từ SillyTavern cô lập thực tế, không phải ảnh ý tưởng ngoại tuyến:

- [Thiết bị đầu cuối máy tính](evidence/native-terminal.png)
- [Tương tác người chơi trong chính văn thực tế](evidence/native-story-message.png)
- [Chỉnh sửa tương tác trên điện thoại](evidence/native-mobile.png)
- [Lilith nguyên bản trên điện thoại](evidence/native-mobile-lilith.png)

Lời mở đầu, số dư, đạo cụ và tên nhân vật trong ảnh chụp màn hình đều thuộc mẫu nghiệm thu cô lập có gắn nhãn; lời mở đầu không phải do mô hình tạo ra.
