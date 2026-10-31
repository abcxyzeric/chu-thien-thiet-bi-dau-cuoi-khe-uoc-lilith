# Nghiệm thu trình duyệt trên máy chủ thực tế 0.5.0

## Môi trường

Giống với [0.4.0](ACCEPTANCE-0.4.0.md): bốn thực thể SillyTavern dùng một lần (cài đặt mới hoàn toàn theo tag từ kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng), Playwright Chromium headless + swiftshader, mô hình mô phỏng cục bộ `tests/qa/mock_model.py`, khóa `qa-key-not-real`. **Không gọi bất kỳ mô hình thực tế nào, không sử dụng bất kỳ khóa thực tế nào, không sử dụng bản lưu thực tế.**

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.17.0 | `e3f41666c69db032e17e079fcddcf40cf47e8593` |
| 1.18.0 | `51ad27fb86d39a3daca3adaa970375c9670c12df` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| `native_terminal050.py` (Thiết bị đầu cuối 0.5.0, 58 hạng mục) | 58/58 | 58/58 | 58/58 | 58/58 |
| `native_replace040.py` (Thay thế toàn diện v1.1, chế độ tương thích, 70 hạng mục) | 70/70 | 70/70 | 70/70 | 70/70 |
| `native_guards.py` (Bảo vệ gửi tin) | ✅ | ✅ | ✅ | ✅ |
| `node --test tests/*.test.js` (Thuần logic, không phụ thuộc phiên bản máy chủ) | 54/54 | 54/54 | 54/54 | 54/54 |

`native_acceptance.py`, `native_views.py`, `native_ledger.py`, `native_ledger_guards.py` điều khiển giao diện thiết bị đầu cuối cũ đã bị xóa nên ngừng sử dụng từ bản này, quan hệ bao phủ xem tại [CHANGES-0.5.0](CHANGES-0.5.0.md#文件).

## Các hạng mục bao phủ của `native_terminal050.py`

**Cửa sổ đơn**
- Tiêu đề cửa sổ Lilith là 「Thiết Bị Đầu Cuối Chư Thiên」, trên trang chỉ có duy nhất một `dialog`, cửa sổ thiết bị đầu cuối cũ và nút lối vào cũ đều không còn tồn tại.
- Thứ tự điều hướng cố định: Tổng quan Nhiệm vụ Gắn kết Tu hành · Thương thành Túi đồ · Ngoại quải Thần thông · Bàn làm việc Ký ức Quy tắc · Kết nối Trạng thái Cài đặt.
- Ngăn kéo cài đặt tiện ích mở rộng chỉ có hai nút 「Mở Thiết Bị Đầu Cuối Chư Thiên」 và 「Khôi phục khẩn cấp bản cũ」, 0 điều khiển nhập liệu; nút bấm mở được thiết bị đầu cuối.

**Tầng tin nhắn**
- Chế độ thiết bị đầu cuối: trong cuộc trò chuyện có 0 iframe (không còn thanh trạng thái), 3 tầng có khối dữ liệu mỗi tầng đều có một nhãn nhỏ 「✧ Hệ thống đã ghi nhận · Điểm Hệ Thống … · Xem ›」, trong văn bản tầng không còn khối dữ liệu thô; khung thoại vẫn có 3 cái như bình thường.
- Bấm vào nhãn nhỏ sẽ mở Tổng quan thiết bị đầu cuối; nhãn nhỏ có thể tắt đi.
- Sau khi chuyển sang chế độ tương thích, thanh trạng thái trong tầng xuất hiện trở lại, chuyển về lại thì biến mất.

**Động cơ**
- Động cơ gắn kết với tầng mới nhất có khối dữ liệu (5), và ghi vào khóa `5` của `面板账本` (cùng một sổ cái với thanh trạng thái trong tầng cũ).
- Cả 8 trang nguyên bản đều đi tới được từ thanh điều hướng thiết bị đầu cuối (nút radio tương ứng được chọn, trang hiển thị rõ và có nội dung); thanh tiêu đề nguyên bản và nhãn phân trang được ẩn đi.
- Thế giới và Điểm Hệ Thống trên thanh đỉnh khớp với sổ cái; động cơ lấp đầy vùng nội dung.

**Thao tác nguyên bản (mỗi hạng mục đều đọc lại từ sổ cái để đối chiếu)**
- Rút đơn: trừ 1 vạn điểm, trình tạo phần thưởng được gọi 1 lần; giữ lại toàn bộ bằng 1 chạm đi vào túi đồ.
- Rút 10: trừ 10 vạn điểm, kết quả đi vào phần thưởng chờ xử lý.
- Nhập hàng 1 chạm: trừ 500 điểm, hàng hóa kết xuất theo đầu ra mô hình.
- Mua sắm: trừ điểm, vật phẩm vào túi đồ (hoặc vào khu chờ quyết toán).
- Ước nguyện: hỏi giá 20.000, sau khi thanh toán trừ 20.000.
- Thu hồi vật phẩm: cộng điểm.
- AI sắp xếp túi đồ: phân loại lại từng vật phẩm.
- Túi Vô Hạn: sau khi cất vào thì lấy ra ×3 ghi vào túi đồ.
- Triệu hồi Đả Thủ Chư Thiên, Lò Nung Vạn Vật, AI đánh giá bậc thực lực: mỗi tính năng gọi mô hình 1 lần, kết quả ghi ngược về.
- Con Mắt Động Sát: trừ điểm → đi vào giỏ hàng → quyết toán ghi vào ô nhập liệu trò chuyện; thiết bị đầu cuối báo 「Đã ghi vào ô nhập trò chuyện」; sau khi bấm 「Đóng thiết bị đầu cuối để gửi」 thì thiết bị đầu cuối đóng lại, tiêu điểm nằm ở ô nhập liệu, văn bản được giữ nguyên.
- Trong tầng trò chuyện không có động cơ thứ hai (không bị trừ phí lặp).

**Ngoại quải**
- Tắt 「Đả Thủ Chư Thiên」: ngoại quải đó và nút chuyển nhanh của nó trong thiết bị đầu cuối ẩn đi; trong lời nhắc có câu “Ký chủ hiện đã tắt: Đả Thủ Chư Thiên … không được xuất hiện hoặc sử dụng”.
- Ngoại quải tự tạo 「Đồng Hồ Quả Quýt Ngưng Đọng Thời Gian」 (Tiên phẩm, mỗi ngày 2 lần, mỗi lần 5.000 điểm): lưu vào kho trên máy; trong lời nhắc xuất hiện “Ngoại quải tự tạo Ký chủ đã trang bị … Đồng Hồ Quả Quýt Ngưng Đọng Thời Gian”; phát động trừ 5.000 điểm và đọc lại xác nhận, văn bản hành động đi vào ô nhập liệu; phát động lần thứ ba bị giới hạn số lần mỗi ngày chặn lại (tổng cộng chỉ trừ 10.000).

**Đóng cửa sổ**
- ✕ đóng lại; mở lại quay về trang Túi đồ lần trước.
- Esc đóng lại.
- Bấm ra ngoài: khi đặt là “Luôn luôn” sẽ đóng lại, khi đặt là “Không bao giờ” sẽ không đóng.
- Nút quay lại của trình duyệt (cử chỉ vuốt quay lại trên điện thoại) đóng thiết bị đầu cuối, trang vẫn ở trong SillyTavern.
- Trong suốt các quá trình trên, vị trí cuộn của cuộc trò chuyện không đổi.
- Alt+X đóng lại.

**Trang cài đặt**
- Bao gồm toàn bộ công tắc của ngăn kéo cũ (chế độ tầng, nhãn nhỏ, hiển thị rút gọn, độ sâu hiển thị, khung thoại, HUD, phím tắt, bấm ra ngoài để đóng, cử chỉ quay lại, lọc lời nhắc, độ sâu giữ lại, macro biến số, tự động Sách Thế Giới, chạm tương tác, rung, chế độ tranh đứng) và toàn bộ công cụ (Sách Thế Giới, khởi tạo, di chuyển/quay lui, Trung tâm API, trang kết nối Lilith, Live2D, chẩn đoán, tiếp quản, khôi phục).
- Sau khi tắt công tắc khung thoại, giá trị cài đặt là false, khung thoại trong tầng biến mất.
- Mở hộp thoại chẩn đoán tương thích từ trang cài đặt; lúc này nhấn Esc chỉ đóng hộp thoại, không đóng thiết bị đầu cuối.

**Điện thoại (390×800)**
- Thanh điều hướng là một thanh cuộn ngang, thanh đỉnh nằm bên dưới, chiều cao động cơ vượt quá 450px, các trang hệ thống không hiển thị tranh đứng.
- Trang Bàn làm việc hiển thị tranh đứng Lilith.
- Cử chỉ quay lại đóng thiết bị đầu cuối; không có lỗi trang.

## Ảnh chụp màn hình

`docs/evidence/t050-terminal-shop.png` (trang Thương thành trên máy tính), `t050-mobile-shop.png`, `t050-mobile-work.png`, `t050-custom-plugin.png`.

## Ranh giới đã biết

- **Mô hình thực tế**: Vẫn chưa xác minh, toàn bộ chuỗi AI mới chỉ chạy qua mô hình mô phỏng.
- **Chưa bấm từng mục**: Phái Cử Phân Thân, Động Thiên Tùy Thân, Sao Chép Đồ Giám, Viết Lại Trạng Thái, Ngôn Linh Đổi Chữ, rút thẻ số lần tùy chỉnh, bế quan (cần có công pháp trước).
- **Hộp thoại nhập tệp ngoại quải tự tạo**: Chưa bấm trong trình duyệt; hàm `normalizePlugin` dùng khi nhập đã có bài kiểm thử thuần logic.
- **Nhãn chứng từ tầng bản cũ 0.4.0**: Tin nhắn chứng từ hệ thống do bản 0.2–0.4 ghi trong bản lưu cũ được hiển thị như tin nhắn hệ thống thông thường, không trang trí thêm nữa.
- **Phản hồi xúc giác**: Không xác minh được trong trình duyệt headless.
