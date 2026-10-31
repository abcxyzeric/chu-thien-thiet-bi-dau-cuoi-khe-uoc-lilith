# Nghiệm thu điểm kiểm tra phát triển 0.2.0

2026-09-29. Tiện ích mở rộng nguyên bản tiếp tục di chuyển chức năng, **chưa phải bản chính thức đầy đủ tính năng**.

## Môi trường

SillyTavern 1.19.0 độc lập, giao diện mã nguồn cố định tại commit `06bde939fb1e9c4c8d8641d810f0a916b5bce127`. Không có bản lưu thật của người dùng, không có Tavern Helper, không có khóa mô hình. Chỉ sử dụng nhân vật thử nghiệm, số dư và phản hồi dựng bằng chương trình được đánh dấu là “Nghiệm thu cô lập / QA kết toán”; chúng không phải đầu ra của mô hình.

Máy chủ dùng một lần này đã điều chỉnh tiêu đề phản hồi iframe và Cookie phiên phân vùng HTTPS e2b cho bản xem trước Arena, giữ nguyên CSRF; không làm thay đổi API lưu trò chuyện. Những điều chỉnh xem trước máy chủ này không nằm trong gói tiện ích mở rộng và không thể dùng làm cấu hình bảo mật môi trường sản xuất.

## Kết quả tự động hóa

- `npm run check`: Đạt.
- `npm test`: **27/27** đạt.
- Mã băm SHA256 của 5 tệp gốc không đổi; hai nhân kết toán gốc được tạo từ tệp nguồn gốc thông qua kịch bản trích xuất.
- Kết quả hồi quy luồng chính nguyên bản, bảo vệ gửi tin và giao diện điện thoại được lưu tại `docs/evidence/`. Kết quả kiểm tra lại trên đường dẫn cài đặt Git xem riêng tại báo cáo cài đặt.

### Quy trình kết toán mới: 17 nhóm, vượt qua trên máy chủ thật

Bản ghi gốc `native-ledger.json`:

Mặc định tắt, xác nhận sao lưu/dừng engine cũ, phát hiện thực thể cũ, xác nhận trước khi thực thi, điểm nhiệm vụ gốc & phần thưởng hiện vật, chiết khấu Danh vọng gốc, chống bán trùng lặp hàng hóa, tiêu hao từng món, không phát bù sau khi đã tiêu hao, giá thu hồi gốc, thẻ hệ thống trong chính văn, biến của hệ thống khác không bị ảnh hưởng, lưu bền vững sau khi tải lại, đóng băng khi sửa lịch sử, đóng băng khi đọc lại thất bại, xác nhận tải lại chỉ cam kết một lần, khung nhìn giao dịch trên điện thoại không bị tràn ngang.

Sổ cái thử nghiệm: 1000 điểm thử nghiệm ban đầu → Nhiệm vụ +100 → Mua sau chiết khấu -98 → Hai lần sử dụng mỗi lần tiêu hao 1 món phần thưởng → Thu hồi +9 → Giao dịch mua thứ hai -194. Cuối cùng còn **817 điểm, 6 chứng từ máy chủ**.

Tiêm lỗi chỉ trả về mã 503 ở lần gọi `/api/chats/get` thứ hai sau khi lưu thật đã thành công. Tiện ích không báo khống thành công hay tự động thử lại; sau khi tải lại trang đọc được đúng bản ghi duy nhất đã cam kết.

### Đồng thời và chuyển đổi: 3 nhóm, vượt qua trên máy chủ thật

Bản ghi gốc `native-ledger-guards.json`:

1. Hai thẻ trong cùng một trình duyệt: khi một thẻ đang giữ Web Lock thì thẻ kia bị từ chối, không ghi dữ liệu.
2. Hai thẻ cùng xem trước một ảnh chụp nhanh: sau khi thẻ thứ nhất cam kết, thẻ thứ hai bị từ chối do ảnh chụp nhanh trên máy chủ đã khác đi, không thể ghi đè lên chứng từ trước đó.
3. Khi yêu cầu lưu đã thực thi nhưng phản hồi chưa kịp trả về cho tiện ích mà chuyển thật sang cuộc trò chuyện của nhân vật khác: mục tiêu lưu vẫn là cuộc trò chuyện gốc đã bắt cố định, cuộc trò chuyện mới không nhận sổ cái cũ hay tin nhắn kết toán cũ. Khi quay lại cuộc trò chuyện gốc vẫn đọc lại được chứng từ.

Bài kiểm tra này thực thi lưu thật thông qua `route.fetch`, chỉ làm trễ phản hồi để tạo điều kiện thời gian chứ không giả lập `getContext`, sổ cái hay mô hình.

Tất cả các bài kiểm tra kết toán và đồng thời mới đều đạt **0 pageerror, không gọi mô hình**.

## Bảo vệ rõ ràng và những mục không hướng tới

- Logic giao dịch gốc được tính toán trước trên bản sao biến, bất kỳ lỗi bằng chứng phần thưởng nào cũng sẽ không ghi điểm vào máy chủ trước.
- Chứng từ hiện vật nhiệm vụ ổn định không dựa vào việc trong túi đồ hiện tại còn vật phẩm hay không để phán đoán phát thưởng.
- Mã băm nguồn nguyên bản và chứng từ được lưu giữ trong siêu dữ liệu trò chuyện; khi lịch sử thay đổi sẽ đóng băng chứ không đoán mò cách hoàn tiền hay hoàn tác.
- Tin nhắn hệ thống sử dụng cờ `isSmallSys` của máy chủ để tránh việc trình kết xuất tự động bổ sung dữ liệu swipe gây lệch giữa trình khách và ảnh chụp nhanh trên đĩa.
- Một lần lưu tường minh mang theo đồng thời biến, chứng từ và tin nhắn hệ thống trong chính văn; không dùng `force:true` để ghi đè kiểm tra tính toàn vẹn của bản lưu.
- **Không phải giao dịch phân tán hay CAS phía máy chủ**. Khóa cùng nguồn không thể ràng buộc trình duyệt khác, thiết bị khác hoặc tiện ích mở rộng không hợp tác. Kiểm tra ảnh chụp nhanh sau khi lưu cũng không loại bỏ được mọi điều kiện tranh chấp (race conditions), nghiêm cấm ghi đồng thời vào cùng một cuộc trò chuyện.
- Khi trạng thái không rõ ràng, vui lòng dừng thao tác trò chuyện, tải lại trang và kiểm tra thủ công, không được hiểu là “báo thất bại nghĩa là chắc chắn chưa trừ tiền”.

## Chưa nghiệm thu

GPU/tốc độ khung hình/mức tiêu thụ pin trên điện thoại thật, các phiên bản quán rượu khác, mô hình thật và yêu cầu trả phí, AI nhập hàng/rút thẻ/ước nguyện, toàn bộ Bàn làm việc/tự động chỉnh lý ký ức, toàn bộ bản lưu cũ trong thực tế, đồng thời xuyên thiết bị, trò chuyện nhóm của quán rượu.

Kiểm tra hồi quy hoạt ảnh luồng chính sử dụng WebGL phần mềm; vòng kiểm tra kinh tế này tắt WebGL để cô lập nghiệm thu logic. Không được lấy tốc độ khung hình của trình kết xuất phần mềm giả làm hiệu năng trên thiết bị vật lý.

Ảnh chụp màn hình: `commerce-desktop.png`, `commerce-mobile.png`, `ledger-body.png`, đều lấy từ quán rượu cô lập thực tế. Hồ sơ nghiệm thu bản cũ được lưu giữ tại `ACCEPTANCE-0.1.0.md`.
