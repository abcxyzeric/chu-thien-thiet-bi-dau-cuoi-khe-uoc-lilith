# Nghiệm thu trình duyệt trên máy chủ thực tế 0.4.0

## Môi trường

- Bốn thực thể SillyTavern **dùng một lần**, đều được cài đặt mới hoàn toàn từ kho lưu trữ chính thức theo tag.
  - Kịch bản cấu hình: `tests/qa/setup_isolated_st.py`.
  - Tiện ích mở rộng được tải qua liên kết tượng trưng (symlink), kiểm thử trực tiếp không gian làm việc của kho lưu trữ.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.17.0 | `e3f41666c69db032e17e079fcddcf40cf47e8593` |
| 1.18.0 | `51ad27fb86d39a3daca3adaa970375c9670c12df` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

- Trình duyệt: Playwright Chromium, headless, swiftshader, **không có GPU thật**.
- **Mô hình**: Mô hình mô phỏng cục bộ `tests/qa/mock_model.py`.
  - Trả về câu trả lời đúng định dạng theo cụm từ lời nhắc của bản gốc v1.1, đồng thời ghi lại mọi yêu cầu (đường dẫn, tiêu đề Authorization, phần thân yêu cầu) để bài kiểm thử đối chiếu nội dung thực sự gửi tới “mô hình”.
  - API chính của ST được đặt thành Custom (OpenAI-compatible) và trỏ tới nó; API độc lập cũng trỏ tới nó, khóa là `qa-key-not-real`.
  - **Không gọi bất kỳ mô hình thực tế nào, cũng không sử dụng bất kỳ khóa thực tế nào.**
- Dữ liệu: Chỉ sử dụng thẻ nhân vật kiểm thử và tầng kiểm thử ghi rõ “Nghiệm thu Chư Thiên”, “Nghiệm thu cô lập”, “QA quyết toán”, **không phải bản lưu thật**.
- Không cài đặt Tavern Helper. Bài kiểm thử tiếp quản một chạm sẽ tạm thời ghi biểu thức chính quy cũ và mục kịch bản Tavern Helper cũ giả lập, kiểm thử xong sẽ dọn sạch.
- Biểu thức chính quy cũ lấy từ gói ngoại tuyến v1.1 nguyên bản (`--legacy-dir`), gói ngoại tuyến không phân phối kèm theo kho lưu trữ.

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| `native_replace040.py` (Thay thế toàn diện v1.1, 70 hạng mục) | 70/70 | 70/70 | 70/70 | 70/70 |
| `native_acceptance.py` (Thiết bị đầu cuối 0.1/0.2, hành động người chơi trong chính văn, tải lại) | ✅ | ✅ | ✅ | ✅ |
| `native_views.py` (7 khung nhìn điện thoại, 390×844) | ✅ | ✅ | ✅ | ✅ |
| `native_ledger.py` (Quyết toán gốc: bảng, phần thưởng, mua sắm, sử dụng, thu hồi) | ✅ | ✅ | ✅ | ✅ (xem thuyết minh bên dưới) |
| `native_ledger_guards.py` (Khóa đa thẻ trình duyệt, xem trước quá hạn, chuyển cuộc trò chuyện giữa chừng) | ✅ | ✅ | ✅ | ✅ (xem thuyết minh bên dưới) |
| `native_guards.py` (Đính kèm, chỉnh sửa lịch sử, khóa tạo phản hồi, trùng lặp & nhãn) | ✅ | ✅ | ✅ | ✅ |
| `npm run check`, `npm test` (46 bài kiểm thử đơn vị) | ✅ (không phụ thuộc máy chủ) | | | |

**Thuyết minh về `native_ledger` trên bản 1.19**:
- **Vấn đề**: Trong lượt ma trận đầu tiên, nó và `native_ledger_guards` phụ thuộc vào nó đã thất bại trên bản 1.19. Thư mục dữ liệu của 1.19 không phải mới hoàn toàn, trong khi 1.16–1.18 là cài đặt mới.
- **Nguyên nhân**: Tranh chấp thời gian trong bài kiểm thử. Tầng dữ liệu mẫu do kịch bản ghi vào có mang `<ZhuTianPanel>`; từ bản 0.3.0 trở đi, thanh trạng thái gốc là động cơ quyết toán cốt truyện, nên nó đã nhanh tay quyết toán bảng này trước khi bài kiểm thử kịp chuyển sang chế độ “Chỉ thiết bị đầu cuối”.
- **Cách sửa**: Sửa bài kiểm thử để ngay khi trang vừa sẵn sàng, trước khi ghi dữ liệu mẫu thì đi vào chế độ “Chỉ thiết bị đầu cuối” trước; sau mỗi lần tải lại trang cũng đi vào ngay lập tức. Mã nguồn plugin không thay đổi.
- **Kiểm tra lại**: Sau khi sửa, chạy liên tiếp hai lượt toàn bộ các bộ kiểm thử trên bản 1.19 mới hoàn toàn, lượt thứ hai chính là trường hợp thư mục dữ liệu không còn mới. Kết quả xem tại mục “Kiểm tra lại cuối cùng” ở cuối bài.

## Các hạng mục bao phủ của `native_replace040.py` (70 hạng mục, cả bốn phiên bản đều đạt)

1. **Kết xuất**:
   - Tầng mới nhất (độ sâu 0) hiển thị iframe thanh trạng thái đầy đủ; tầng ở độ sâu 2 và 4 hiển thị thẻ rút gọn.
   - Mỗi tầng AI đều có thẻ giọng nói, không hiển thị từ chỉ cảm xúc, hỗ trợ Markdown nội dòng, chuyển đổi ảnh đại diện theo ngữ khí.
   - Trên giao diện không để lộ bảng thô hay văn bản vị trí chờ (slot).
   - Macro ở phía hiển thị đã được thay thế.
   - Công tắc làm đẹp giọng nói bật/tắt khứ hồi bình thường: khi tắt sẽ hiển thị văn bản thuần.
   - Thẻ rút gọn có thể mở rộng thành thanh trạng thái đầy đủ; khi tắt hiển thị rút gọn sẽ đổi thành nút “Lịch sử”.
2. **Sách Thế Giới**:
   - Khi mở cuộc trò chuyện Chư Thiên sẽ tự động cài đặt (35 mục) và gắn kết.
   - Dưới ngữ cảnh 64k, ngân sách đủ sức chứa các quy tắc thường trực.
   - Trong lời nhắc có chứa nguyên văn quy tắc thường trực, các macro bên trong đã được thay bằng giá trị sổ cái.
3. **Tạo phản hồi**:
   - Yêu cầu trò chuyện chính đi qua ST tới mô hình mô phỏng.
   - Trong lời nhắc không còn sót lại `{{get_chat_variable}}` thô.
   - Bảng của các tầng cũ được bóc tách, chỉ giữ lại tầng ở độ sâu 1.
   - Sau phản hồi dạng luồng (stream) hiển thị thanh trạng thái và 2 thẻ giọng nói.
   - Trong bản lưu vẫn giữ nguyên bảng: việc bóc tách chỉ ảnh hưởng tới lời nhắc.
4. **Trung tâm API**:
   - Danh sách mô hình và kiểm tra kết nối hoạt động tốt, bao gồm cả hai chế độ API độc lập và API chính của SillyTavern.
   - Cấu hình được ghi ngược về ba nơi lưu trữ nguyên bản (biến toàn cục, localStorage, biến kịch bản).
5. **AI Thanh trạng thái**:
   - AI nhập hàng đi qua API độc lập, max_tokens 1500, temperature 0.7; lọc hàng hóa theo cấp độ cửa hàng; trừ 500 điểm.
   - Báo giá ước nguyện đi qua API chính, phân tích báo giá chính xác.
6. **AI Thanh trạng thái (giai đoạn `sbai`, toàn bộ đi qua API chính của SillyTavern)**:
   - ⚙ Kiểm tra kết nối thành công.
   - Rút đơn trừ 10.000 điểm → Trình tạo phần thưởng → Nhận phần thưởng → Giữ lại toàn bộ → Đi vào túi đồ.
   - AI sắp xếp túi đồ: mỗi vật phẩm đều được phân loại lại và bổ sung hiệu quả.
   - Triệu hồi đả thủ: tạo thẻ đả thủ (Diệp Thanh Hàn / B+).
   - Lò Nung Vạn Vật: sau khi cố định số ngẫu nhiên (bản gốc có 10% nổ lò không gọi mô hình), kiếm sắt và linh thảo dung luyện thành “Cửu Chuyển Ngưng Nguyên Đan”.
   - AI đánh giá bậc thực lực: bậc 5 được ghi vào hộp chọn thả xuống.
   - Tất cả các yêu cầu trên đều không gửi tới địa chỉ lính canh (sentinel).
7. **Lilith**:
   - Khởi động đầy đủ, trang cài đặt kết nối hiển thị cấu hình của Trung tâm API.
   - Kiểm tra kết nối đi qua API chính, địa chỉ lính canh chưa bao giờ bị gọi thực sự.
   - Tự động chỉnh lý ký ức sử dụng lời nhắc nhân viên ghi chép nguyên bản, kết quả ghi vào biến trò chuyện.
   - Trò chuyện riêng đi qua API độc lập, phản hồi hiển thị bình thường.
8. **Tiếp quản**:
   - Khi biểu thức chính quy cũ đang bật và không có Tavern Helper, plugin vẫn kết xuất gốc, không xuất hiện khung thoại kép.
   - Bảng chẩn đoán liệt kê các phần còn sót lại của bản cũ.
   - Tiếp quản một chạm vô hiệu hóa 2 biểu thức chính quy và 1 kịch bản Tavern Helper, đồng thời **đọc lại từ máy chủ để xác nhận đã lưu xuống đĩa trước khi làm mới trang**.
   - Bảng chẩn đoán sau đó hiển thị “Đã tiếp quản hoàn toàn”.
   - Khôi phục bản cũ chỉ bật lại đúng 3 mục này.
9. **Chẩn đoán**:
   - Khi ngữ cảnh 16k cộng với ngân sách 25%, cảnh báo ngân sách Sách Thế Giới không đủ và hiện nút “Điều chỉnh 1 chạm”.
   - Sau khi điều chỉnh 1 chạm, ngân sách đổi thành 90%, kiểm tra trở lại bình thường.
   - Hiển thị bảng đối chiếu thay thế v1.1.
10. **Chạm tương tác (khung nhìn di động)**:
    - Vuốt ve kích hoạt lời thoại cấp 1, tiếp tục vuốt ve sẽ nâng cấp.
    - Sau khi thả tay không kích hoạt thêm lời thoại chạm đơn.
    - Nhấn giữ vào sừng kích hoạt lời thoại nhấn giữ.
    - Phản ứng chạm đơn nguyên bản vẫn hoạt động bình thường.
11. Cả máy tính và thiết bị di động đều không có lỗi trang.

## Các kiểm tra thực máy khác (1.19)

- **Tư thế AI**: Ba tư thế thả tim, khoanh tay, ngồi nghiêng đều hiển thị trong cửa sổ Lilith.
  - Phông nền là `plate` nguyên bản tĩnh, hoạt ảnh là `none`.
  - Phía trên và dưới nhân vật không có khoảng trắng.
- **Nút lối vào thiết bị đầu cuối tùy chọn**: Ở khung nhìn 1500×1000, trước đây bị chồng lấp với lối vào Lilith (chặn thao tác bấm). Hiện tại neo ngay phía trên lối vào 10px, khi kéo lối vào hoặc thu phóng cửa sổ cũng tự động đi theo (1.18, 1.19).

## Ranh giới đã biết (Chưa xác minh hoặc thứ yếu)

- **Mô hình thực tế**: Chưa xác minh. Các chuỗi AI nêu trên mới chỉ chạy với mô hình mô phỏng; mức độ tuân thủ định dạng đầu ra của mô hình sẽ ảnh hưởng trực tiếp tới kết quả của bộ phân tích nguyên bản.
- **Nhiệt độ (temperature) ở chế độ API chính**: Yêu cầu nhân viên ghi chép của Lilith dùng nhiệt độ trong preset hiện tại của ST (khi nghiệm thu là 1), không phải giá trị cố định.
- **Chưa bấm từng mục**:
  - Rút thẻ 10 lần và rút số lần tùy chỉnh;
  - Các hành động thanh toán không gọi mô hình trong Ngoại quải và Thần thông;
  - Phản hồi xúc giác (không thể xác minh trong trình duyệt headless).
- **Live2D**: Bản 0.4.0 không thay đổi, tiếp tục dùng kết quả nghiệm thu của bản 0.3.0.

## Kiểm tra lại cuối cùng (Sau khi sửa thời gian kiểm thử, bản 1.19 mới hoàn toàn, chạy liên tiếp hai lượt)

Xem bảng dưới; bản ghi chạy được lưu tại `/var/tmp/qa/round1|2/` trên máy nghiệm thu.

| Lượt | `native_replace040` | acceptance | views | ledger | ledger_guards | guards |
| --- | --- | --- | --- | --- | --- | --- |
| Lượt 1 (Thư mục dữ liệu mới hoàn toàn) | 70/70 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lượt 2 (Dùng tiếp thư mục dữ liệu của Lượt 1) | 70/70 | ✅ | ✅ | ✅ | ✅ | ✅ |

Ghi chú: Dòng “Macro biến số” trên bảng chẩn đoán sau đó được sửa để hiển thị trung thực nguyên nhân chưa khởi động hoặc thiếu sự kiện, thay đổi này chỉ sửa một đoạn văn bản chẩn đoán trong `src/features.js`. Ma trận 1.17–1.19 và hai lượt trên đều được chạy sau khi sửa; lượt 1.16 chạy trước thay đổi này.

Ảnh chụp màn hình (`docs/evidence/r040-*.png`) lấy từ Lượt 2, trong đó:
- Tầng mới nhất: `r040-live-floor.png`
- Thẻ rút gọn và thẻ giọng nói: `r040-compact-voice.png`
- Phản hồi dạng luồng: `r040-streamed.png`
- Trung tâm API: `r040-api-center.png`
- Thương thành: `r040-shop.png`
- Rút thẻ: `r040-gacha.png`
- Ngoại quải: `r040-plugins.png`
- Trò chuyện riêng: `r040-private-chat.png`
- Chẩn đoán: `r040-diagnostics.png`
- Chạm tương tác: `r040-touch-stroke.png`
