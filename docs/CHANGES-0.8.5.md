# Thay đổi 0.8.5 (Tầng trên điện thoại không kết xuất · Dàn trang cài đặt cổng AI · Thuyết minh kiểm nghiệm sổ cái)

Bản 0.8.5 xử lý ba vấn đề mà người dùng phản hồi sau bản 0.8.4. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.5](ACCEPTANCE-0.8.5.md).

- Các trường sổ cái và mục từ Sách Thế Giới đều không thay đổi, **không cần nhập lại Sách Thế Giới**.
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc.

## I. Tầng mới nhất trên điện thoại không kết xuất mà hiển thị thành cả một đoạn dữ liệu thô (Lỗi, đã sửa)

### Triệu chứng

- Trên điện thoại, khối dữ liệu Chư Thiên ở cuối tầng mới nhất hiển thị thành văn bản thô (`<ZhuTianPanel>`, `系统点: …` liệt kê ra từng dòng), không biến thành nhãn dữ liệu Chư Thiên.
- Cùng cuộc trò chuyện đó khi mở trên máy tính lại hiển thị bình thường.
- Sau khi bấm 「Chỉnh sửa」 rồi lưu lại, tầng đó vẫn hiển thị văn bản thô.

### Nguyên nhân

Plugin sẽ không kết xuất tầng **đang được tạo phản hồi** (khi xuất dạng luồng, mỗi giây nội dung thay đổi hàng chục lần, việc dựng lại liên tục sẽ gây nhấp nháy và làm gián đoạn các kịch bản làm đẹp). Plugin phán đoán trạng thái 「đang tạo phản hồi」 dựa vào hai sự kiện của SillyTavern: bắt đầu tạo phản hồi và kết thúc tạo phản hồi.

Vấn đề nằm ở trên điện thoại:

- Khi trình duyệt điện thoại chuyển sang chạy ngầm hoặc khóa màn hình, trang web sẽ bị tạm dừng;
- Cách kết thúc của một số mô hình suy luận / trạm trung chuyển cũng khá đặc biệt.

Trong hai trường hợp này, SillyTavern có thể bỏ sót sự kiện 「Kết thúc tạo phản hồi」, khiến plugin cứ tưởng vẫn đang tạo phản hồi nên tầng mới nhất vĩnh viễn bị bỏ qua và hiển thị thành văn bản thô. Sau đó khi chỉnh sửa rồi lưu lại cũng vẫn là tầng này nên tiếp tục bị bỏ qua. Trên máy tính rất hiếm khi bị sót sự kiện này nên máy tính hiển thị bình thường.

### Cách sửa

- **Lấy nút dừng của SillyTavern làm chuẩn.** Trong suốt quá trình tạo phản hồi, SillyTavern sẽ hiển thị nút dừng (`#mes_stop`) và ẩn đi khi kết thúc, ngay cả khi sự kiện 「Kết thúc tạo phản hồi」 bị thất lạc thì nút này vẫn sẽ ẩn đi. Hiện tại plugin sẽ:
  - Ghi nhận rằng trong lần tạo phản hồi này nút dừng đã từng xuất hiện;
  - Khi nút dừng ẩn đi trở lại, phán định quá trình tạo phản hồi đã kết thúc, xóa trạng thái 「Đang tạo phản hồi」 quá hạn và kết xuất tầng cuối cùng như bình thường (trong vòng khoảng 0.2 giây).

  Mã nguồn xem tại `src/host-adapter.js`, `src/statusbar-host.js`.
- **Khóa gửi tin giữ nguyên.** SillyTavern phát sự kiện 「Bắt đầu tạo phản hồi」 trước rồi mới hiển thị nút dừng; còn tạo phản hồi tĩnh chạy ngầm thì hoàn toàn không hiển thị nút dừng. Do đó chỉ khi nút dừng **đã từng xuất hiện rồi sau đó biến mất** mới tính là kết thúc, nếu chưa từng xuất hiện thì không mở khóa.
- **Hành vi trong lúc xuất dạng luồng không đổi.** Khi nút dừng đang hiển thị, vẫn bỏ qua tầng cuối cùng để không bị nhấp nháy.
- **Chẩn đoán tương thích thêm mới dòng 「Tầng mới nhất」**, giải thích rõ tầng gần nhất có dữ liệu Chư Thiên đã được kết xuất hay chưa. Khi chưa kết xuất sẽ nêu rõ nguyên nhân, bên cạnh có nút 「Kết xuất lại tầng」.
  Lối vào: Thiết bị đầu cuối → Cài đặt → Chẩn đoán tương thích.

> **Về việc 「Giao diện chỉnh sửa cũng là văn bản thô」**: Khi bấm nút 「Chỉnh sửa」 của SillyTavern, khung hiện ra là ô chỉnh sửa nguyên văn của chính SillyTavern nên bên trong vốn dĩ là văn bản thô, mọi plugin và tiện ích làm đẹp đều như vậy, đây là hiện tượng bình thường. Sau khi sửa lỗi, bấm ✔ để lưu thì tầng sẽ hiển thị lại thành nhãn dữ liệu Chư Thiên.

## II. Cài đặt cổng AI khó hiểu, nút chọn đơn bị lệch bố cục (Đã làm lại)

### Vấn đề trước đây

- Những cách gọi như 「Trạng thái gắn kết」, 「Áp dụng cho thanh trạng thái」, 「Áp dụng cho trợ lý Lilith」 khiến người dùng mới khó hiểu.
- Hai nút chọn đơn (radio) bị kiểu dáng nguyên bản kéo giãn thành nửa dòng, chấm tròn và chữ tách sang hai bên.
- Khi có nhiều tùy chọn, người dùng không nhìn ra cần điền gì trước, bấm gì sau.

### Hiện tại

Tiêu đề đổi thành 「Kết nối · Cài đặt cổng AI」 (bản hộp thoại bật lên là 「Chư Thiên · Cài đặt cổng AI」). Từ trên xuống dưới lần lượt là:

1. **Một câu tóm tắt trạng thái**, một trong ba trạng thái:
   - 「✓ Đã cài đặt」, hiển thị địa chỉ và mô hình đang dùng;
   - 「⚠ Chưa cài đặt API」, giải thích những tính năng nào cần dùng tới nó;
   - 「⚠ API dùng ở hai nơi không đồng nhất」, liệt kê riêng 「Tính năng AI thanh trạng thái」 và 「Trò chuyện riêng / Ký ức Lilith」 đang dùng gì.
2. **Bước 1: Chọn dùng AI nào**, hai thẻ tùy chọn:
   - 「API riêng (Khuyên dùng)」;
   - 「Dùng trực tiếp mô hình SillyTavern đang dùng」.

   Bên dưới mỗi thẻ có một dòng giải thích ưu nhược điểm dễ hiểu. Nút chọn đơn khôi phục kích thước bình thường, nằm sát chữ.
3. **Bước 2: Điền cổng kết nối**, điền địa chỉ cổng, khóa bảo mật, mô hình, cùng nút 「Lấy mô hình」. Khi chọn 「Dùng trực tiếp mô hình SillyTavern đang dùng」, bước này tự động ẩn đi và số thứ tự các bước phía sau tự động cập nhật theo.
4. **Bước 3: Kiểm tra và Lưu**.
5. **Cài đặt nâng cao (Thường không cần sửa)**, mặc định thu gọn, bên trong có:
   - Đầu ra tối đa (`max_tokens`);
   - Hai ô tích 「Lưu vào: Tính năng AI thanh trạng thái / Trò chuyện riêng & Ký ức Lilith」 (mặc định tích cả hai, tức dùng chung cho cả hai nơi).

## III. Thông báo 「Vui lòng bật cuộc trò chuyện hiện tại và kiểm nghiệm sổ cái trước; chưa ghi dữ liệu.」 là gì và ở đâu (Đã thêm thuyết minh và dẫn đường)

### Đây là gì

Câu thông báo này đến từ nút 「Kiểm nghiệm ngay chính văn mới nhất (Không gọi mô hình)」 ở trang **Ký ức** của Lilith nguyên bản.

- **Kiểm nghiệm**: Đọc khối dữ liệu Chư Thiên ở cuối tin nhắn chính văn mới nhất, đối chiếu với sổ cái và quyết toán phần thưởng bên trong. Không gọi mô hình, không tốn chi phí API.
- **Tiền đề**: Cuộc trò chuyện hiện tại phải tích chọn hai công tắc **và đã bấm lưu**:
  1. 「Bật trợ lý và tiêm ký ức trong cuộc trò chuyện hiện tại」;
  2. 「Lilith giám sát sổ cái và phần thưởng (Tiếp tục dùng động cơ quyết toán duy nhất của thanh trạng thái 3.1 gốc)」.

### Vị trí

Thiết bị đầu cuối → Nhóm 「Lilith」 bên trái → Trang 「Ký ức」 → Thẻ 「Khế ước ký ức」.

Hai công tắc và nút 「Kiểm nghiệm ngay chính văn mới nhất」 đều nằm trên thẻ này; nút 「Lưu cài đặt trò chuyện hiện tại」 nằm ở dưới đáy thẻ.

### Hiện tại

- Phía dưới nút 「Kiểm nghiệm ngay chính văn mới nhất」 có thêm một dòng thuyết minh: kiểm nghiệm dùng để làm gì, trước khi dùng cần tích hai công tắc nào và bấm nút nào.
- Khi chưa tích chọn mà bấm nút:
  - Hai công tắc và nút 「Lưu cài đặt trò chuyện hiện tại」 sẽ sáng nổi bật trong khoảng 4.5 giây và tự động cuộn tới vị trí công tắc;
  - Bật thông báo và hiển thị hướng dẫn dễ hiểu ở dòng trạng thái dưới cùng.
- Khi đã tích chọn nhưng chưa lưu mà bấm nút: dòng trạng thái hiển thị nhắc nhở hai công tắc đã được tích nhưng vẫn chưa lưu, vui lòng bấm nút 『Lưu cài đặt trò chuyện hiện tại』 trên trang này.
- Sau khi lưu, chức năng kiểm nghiệm nguyên bản thực thi bình thường (`src/assistant-host.js`).

> Khi không cần kiểm nghiệm thủ công, bạn có thể không bật hai công tắc này. Việc hiển thị và tính phí của thanh trạng thái không bị ảnh hưởng.

## Các tệp thay đổi

| Tệp | Thay đổi |
| --- | --- |
| `src/host-adapter.js` | `stopButtonShown()`, `checkStop()`; lắng nghe nút dừng; xóa trạng thái 「Đang tạo phản hồi」 quá hạn khi nút dừng từng xuất hiện rồi ẩn đi |
| `src/statusbar-host.js` | Khi phán đoán tầng cuối cùng có đang tạo phản hồi hay không sẽ kiểm tra đồng thời nút dừng; quét lại sau khi nút dừng thay đổi; `diagnoseLast()` |
| `src/features.js` | Chẩn đoán tương thích: dòng 「Tầng mới nhất」, nút 「Kết xuất lại tầng」; đổi tên lối vào thành 「Cài đặt cổng AI」 |
| `src/api-center.js` | Làm lại biểu mẫu Cài đặt cổng AI (dòng trạng thái, 3 bước, cài đặt nâng cao, kiểu dáng nút chọn đơn) |
| `src/assistant-host.js` | Thuyết minh kiểm nghiệm sổ cái, tô sáng dẫn đường, viết lại câu thông báo |
| `src/hub-settings.js` | Đổi tên lối vào trên trang Cài đặt |
| `src/contracts.js` | Số phiên bản 0.8.5; bảng năng lực thêm mới 3 dòng |
| `manifest.json`, `package.json`, `package-lock.json` | Số phiên bản 0.8.5 |
| `tests/v085.test.js`, `tests/native_v085.py` | Thêm bài kiểm thử mới |
| `tests/v080.test.js`, `tests/v084.test.js` | Cập nhật khẳng định số phiên bản |
| `tests/native_v084.py` | Xóa bộ nhớ đệm SillyTavern sau khi xóa Sách Thế Giới |
| `docs/evidence/guards.json` | Kết quả guards bản 0.8.5 trên 1.19 |
| `README.md`, `docs/FEATURE_MATRIX.md`, `docs/CHANGES-0.8.5.md`, `docs/ACCEPTANCE-0.8.5.md` | Tài liệu |
