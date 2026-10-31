# Thay đổi 0.9.2 (Sửa lỗi từ phản hồi máy thật: Khung thoại Lilith bị lặp, lộ nguyên văn thanh trạng thái)

Phiên bản này khắc phục hai vấn đề mà người dùng phát hiện khi sử dụng bản 0.9.1 trên điện thoại Android. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.9.2](ACCEPTANCE-0.9.2.md).

- Các trường sổ cái, mục từ Sách Thế Giới, khóa lưu trữ và mục cài đặt đều không thay đổi, **không cần nhập lại Sách Thế Giới**.
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc.
- Cả hai vấn đề đều đã được tái hiện trong SillyTavern cô lập theo đúng tình huống trên điện thoại, xác nhận bản 0.9.1 bị lỗi và bản 0.9.2 đã khắc phục hoàn toàn.

## I. Hiện tượng (Ảnh chụp màn hình máy thật)

1. **Lời thoại 【Lilith】 xuất hiện hai lần và sai vị trí**: Đầu tiên là nguyên văn `【Lilith】: "Chủ nhân, ……"` (kèm đường gạch chân nét đứt do tiện ích mở rộng khác thêm vào), ngay theo sau là một khung thoại Lilith có nội dung y hệt; ở những tầng có thanh trạng thái thẻ nhân vật, nguyên văn nằm phía trên thanh trạng thái, còn khung thoại lại chạy xuống phía dưới thanh trạng thái.
2. **Lộ nguyên văn thanh trạng thái**: Trong tầng hiển thị các dòng thô như `系统点: 6600 / 子系统: 0 / 子嗣: 0 / 绑定目标: Chưa có / 好感度: 0 / 黑化值: 0 / 悔意值: 0 …`, đồng thời bên dưới vẫn có nhãn nhỏ 「✧ Hệ thống đã ghi nhận」.

## 二. Nguyên nhân

Khi xử lý từng tầng, plugin sẽ thay thế nội dung do SillyTavern vẽ ra bằng kết quả kết xuất của chính mình: đổi lời thoại thành khung thoại, đổi khối dữ liệu `<ZhuTianPanel>` thành nhãn nhỏ.

Từ bản 0.8.4 trở đi, để không làm mất hiệu ứng làm đẹp của các tiện ích mở rộng khác, plugin sẽ đối chiếu với 「những gì SillyTavern vốn sẽ vẽ ra」: những nút DOM trong tầng **không khớp** sẽ được coi là do tiện ích mở rộng khác thêm vào và giữ nguyên. Vấn đề nằm ở chỗ hai trường hợp dưới đây cũng làm cho nội dung do chính SillyTavern vẽ ra bị lệch đối chiếu:

- **Tiện ích mở rộng khác đã sửa đoạn văn tại chỗ**: Ví dụ tiện ích tô sáng từ khóa thêm gạch chân nét đứt cho các từ như 「Thiếu chủ」, 「Linh căn」, 「Nguyên Anh kỳ」 trong ảnh chụp màn hình; nếu tiện ích đó can thiệp trước khi plugin xử lý thì đoạn văn chứa lời thoại sẽ không còn khớp nữa. Kết quả là nguyên văn được giữ lại, đồng thời plugin lại chèn thêm một khung thoại nữa, làm xuất hiện hai bản.
- **Tin nhắn bị sửa đổi sau khi SillyTavern đã vẽ xong**: Ví dụ tiện ích mở rộng dạng biến số nối thêm khối cập nhật vào sau tin nhắn nhưng không vẽ lại tầng. Đoạn cũ trên màn hình (chứa nguyên văn khối dữ liệu) không khớp với tin nhắn mới nên được giữ lại, làm lộ nguyên văn thanh trạng thái ra ngoài.

## III. Cách sửa

- **Phán đoán “nút do tiện ích mở rộng khác thêm vào” chặt chẽ hơn** (`src/statusbar-host.js`: `stText`, `consumedSnippets`). Một nút cũ không khớp nếu thỏa mãn bất kỳ điều kiện nào dưới đây sẽ được xác định là văn bản của chính SillyTavern và không giữ lại nữa (vì trong bản kết xuất của plugin đã có phiên bản đúng):
  - Văn bản của nó giống hệt một đoạn nào đó trong bản kết xuất của SillyTavern (chỉ có thẻ đánh dấu bị sửa đổi);
  - Văn bản của nó xuất hiện trong phần chính văn kết xuất của SillyTavern (không tính khối mã, nên các thẻ được kết xuất từ khối mã vẫn được tính là của tiện ích mở rộng khác);
  - Nó có chứa nội dung được plugin thay thế trong lần này: một câu thoại Lilith, hoặc ít nhất hai dòng `Trường: Giá trị` trong khối dữ liệu.
  - Các nút có chứa iframe bên trong (thẻ giao diện của Tavern Helper / Tiểu Bạch X, thanh trạng thái thẻ nhân vật) **nhất loạt được giữ nguyên**, không bị tải lại giống như trước đây.
- **Đưa thẻ giao diện về đúng vị trí ban đầu** (sắp xếp vị trí trong `swapContent`): Sau khi Tavern Helper / Tiểu Bạch X đổi khối mã thành thẻ iframe, trước đây plugin xếp thẻ này vào sau “nút khớp gần nhất phía trước”. Khi lời thoại nằm ngay trước khối mã, thẻ iframe sẽ nhảy lên trên lời thoại, nhìn giống như “khung thoại bị tụt xuống dưới thanh trạng thái”. Hiện tại thẻ được đặt vào đúng vị trí của khối mã mà nó thay thế, thứ tự trước sau trong tin nhắn được giữ nguyên.
- **Câu `Lilith: …` nằm trong mã nguồn không còn bị biến thành khung thoại** (`src/voice-box.js`: `splitCode`): Nội dung bên trong khối mã có rào chắn (```` ``` ```` / `~~~`) và các thẻ `<script>`, `<style>`, `<textarea>`, `<pre>` được giữ nguyên trạng. Nếu trong mã thanh trạng thái giao diện của thẻ nhân vật có viết lời của Lilith thì cũng sẽ không bị sửa hỏng, và khung thoại cũng không bị nhảy sang chỗ khác.

Các hiệu ứng làm đẹp vẫn được bảo toàn (các hạng mục nghiệm thu của bản 0.8.4 vẫn đạt bình thường):

- Làm đẹp tại chỗ thực thi sau khi plugin xử lý (gắn kiểu dáng cho đoạn văn, bọc từ) vẫn được giữ nguyên;
- Thẻ iframe vẫn được giữ nguyên và không bị tải lại;
- Làm đẹp hiển thị bằng biểu thức chính quy của SillyTavern vẫn hiển thị bình thường.

**Thay đổi sẽ có**: Nếu một tiện ích mở rộng làm đẹp sửa đổi đoạn văn “có chứa lời thoại Lilith hoặc khối dữ liệu” **trước khi** plugin xử lý, đoạn văn đó sẽ hiển thị phiên bản của plugin (khung thoại / nhãn nhỏ), và phần làm đẹp trên riêng đoạn đó (ví dụ gạch chân nét đứt) sẽ mất đi. Phần làm đẹp trên tất cả các đoạn văn khác không bị ảnh hưởng.

## IV. Khác

- Số phiên bản 0.9.2: contracts, manifest, package.json, package-lock (hai nơi), README, ma trận tính năng.
- Thêm bài kiểm thử mới: `tests/v092.test.js` (6 hạng mục), `tests/native_v092.py` (17 hạng mục khi cài Tavern Helper, 14 hạng mục khi không cài; tái hiện đúng các tình huống trên, bản 0.9.1 thất bại 10 hạng mục còn bản 0.9.2 đạt toàn bộ).
