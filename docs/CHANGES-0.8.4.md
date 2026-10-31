# Thay đổi 0.8.4 (Sửa lỗi API · Trò chuyện riêng · Phối màu · Mô-đun mạnh · Tương thích làm đẹp)

Bản 0.8.4 xử lý sáu vấn đề mà người dùng phản hồi sau bản 0.8.3. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.4](ACCEPTANCE-0.8.4.md).

- Các trường sổ cái không thay đổi.
- Nội dung mục từ Sách Thế Giới không thay đổi, **không cần nhập lại**.
- Thay đổi duy nhất liên quan tới Sách Thế Giới: Sách Thế Giới **cài đặt mới** sẽ mặc định tắt hai mục 「Thần Hào Tiêu Xài」 và 「Đả Thủ Chư Thiên」. Sách Thế Giới đã có sẵn sẽ không bị tự động sửa đổi, xem tại Mục V.

## I. Sau khi điền xong API, lấy mô hình vẫn báo 「cắt cụt」, trò chuyện báo lỗi 502, trò chuyện riêng dễ bị quá hạn (Lỗi, đã sửa)

### Triệu chứng

1. Sau khi điền xong địa chỉ cổng kết nối và khóa bảo mật, bấm 「Lấy mô hình」 thì trình duyệt báo cắt cụt / Failed to fetch;
2. Khi trò chuyện trả về lỗi 502;
3. Tích chọn 「Đính kèm cốt truyện hiện tại」 rồi trò chuyện riêng với Lilith rất dễ bị hết thời gian chờ (timeout).

### Nguyên nhân

1. **Yêu cầu không phải dạng phân luồng (streaming).**
   - Yêu cầu không phân luồng sẽ không truyền về bất kỳ byte nào cho tới khi mô hình viết xong toàn bộ câu trả lời.
   - Lời nhắc trò chuyện riêng có đính kèm cốt truyện rất dài, mô hình cần nhiều thời gian mới viết xong. Trong khoảng thời gian đó, reverse proxy ở giữa, đường hầm (tunnel) hoặc điểm phát sóng di động sẽ ngắt kết nối bị coi là 「nhàn rỗi」, thường ở mốc 60–100 giây.
   - Bộ chuyển tiếp của chính SillyTavern khi yêu cầu thượng nguồn bị ngắt sẽ trả về lỗi 502.
2. **Trò chuyện riêng nguyên bản gán cứng mức hủy sau 60 giây.** Các mô hình suy luận (thinking models) hoặc ngữ cảnh dài thường xuyên vượt quá thời gian này.
3. **Khi thất bại chỉ có một mã trạng thái.** Khi lấy mô hình, kết nối trực tiếp từ trình duyệt bị nhà cung cấp chặn (CORS) chỉ báo lỗi mạng chung chung, không nhìn ra nguyên nhân.

### Cách sửa

- **Toàn bộ yêu cầu hội thoại nhất loạt truyền dưới dạng luồng (stream)**, bao gồm cả các tính năng AI của thanh trạng thái và Trò chuyện riêng / Ký ức / Bàn làm việc của Lilith, trên cả hai đường kết nối trực tiếp từ trình duyệt và chuyển tiếp qua máy chủ SillyTavern.
  - Trong quá trình truyền luồng, dữ liệu liên tục gửi về nên proxy không coi kết nối là nhàn rỗi mà ngắt ngang.
  - Phản hồi được ghép lại thành JSON thông thường ngay bên trong plugin, mã nguồn Lilith nguyên bản không cần sửa đổi.
  - Với số ít nhà cung cấp không hỗ trợ phân luồng: tự động chuyển về không phân luồng để thử lại một lần.
  - Mã nguồn xem tại `src/api-stream.js`, `src/assistant-host.js`, `src/th-bridge.js`.
- **Có thể cài đặt thời gian chờ**: Trang 「Cài đặt」 của thiết bị đầu cuối → 「Thời gian chờ API độc lập (Trò chuyện riêng / Ký ức / Bàn làm việc)」.
  - Có thể chọn 60 (nguyên bản), 120, **180 (mặc định)**, 300, 600 giây; với mô hình suy luận khuyên dùng 300 hoặc 600.
  - Thông báo 「quá 60 giây」 nguyên bản sẽ hiển thị theo số giây thực tế đã chọn.
- **Lấy mô hình**: Khi trình duyệt bị chặn sẽ tự động chuyển tiếp qua máy chủ SillyTavern (đã có từ bản 0.8.1).
  - Khi chuyển tiếp cũng thất bại, hiện tại sẽ trả về nguyên nhân dễ đọc và bật thông báo thay vì lỗi mạng trình duyệt.
  - Trên điện thoại, danh sách gợi ý `datalist` hoạt động không ổn định, nên sau khi lấy mô hình xong sẽ hiển thị thêm một hộp chọn thả xuống thông thường.

## II. Trên điện thoại sau khi mở thiết bị đầu cuối, bấm 「Trò chuyện riêng」 đôi khi làm đóng luôn cả thiết bị đầu cuối (Lỗi, đã sửa)

Trên điện thoại, nút Lilith neo ở góc trên bên trái thanh tiêu đề của thiết bị đầu cuối với dòng chữ 「Lilith · Bấm để vào trò chuyện riêng」.

**Nguyên nhân**: Khi mở trò chuyện riêng nguyên bản, nó sẽ đóng cửa sổ 「Bàn làm việc」 trước. Trong bản 0.8.x, cửa sổ này chính là Thiết Bị Đầu Cuối Chư Thiên, nên vừa bấm vào trò chuyện riêng là cả thiết bị đầu cuối bị đóng lại.

**Cách sửa**: Bảng trò chuyện riêng mở phủ trực tiếp lên phía trên thiết bị đầu cuối, thiết bị đầu cuối vẫn giữ nguyên trạng thái mở. Trong trò chuyện riêng bấm 「Quay lại」 sẽ trở về thiết bị đầu cuối (`src/assistant-host.js`).

## III. Cài đặt API ở hai nơi (Đã hợp nhất thành một nơi)

**Hai nơi trước đây**:

1. Biểu mẫu ở trang 「Kết nối」 của Lilith v1.1 nguyên bản, chỉ ghi bản cấu hình của riêng Lilith;
2. 「Trung tâm API」 của plugin, có thể ghi đồng thời cả hai bản của thanh trạng thái và Lilith.

Hai nơi lưu riêng rẽ khiến sửa một nơi thì nơi kia không đổi, dễ xảy ra tình trạng 「thanh trạng thái dùng được nhưng trò chuyện riêng không dùng được」.

**Hiện tại**:

- Trang 「Kết nối」 của thiết bị đầu cuối hiển thị chính biểu mẫu Trung tâm API (tiêu đề 「Kết nối · Trung tâm API」), lưu một lần sẽ ghi đồng thời vào cả hai bản của thanh trạng thái và Lilith.
- Biểu mẫu nguyên bản được ẩn đi, giữ nguyên DOM chứ không xóa.
- Khi hai bản cấu hình không đồng nhất, đầu biểu mẫu sẽ nhắc 「Cấu hình hai nơi không đồng nhất: lưu một lần để thống nhất」.
- Nút 「API」 trong biểu tượng bánh răng của thanh trạng thái: khi thiết bị đầu cuối đang mở sẽ nhảy tới trang 「Kết nối」; khi thiết bị đầu cuối đang đóng sẽ bật lên cùng một biểu mẫu đó.
- Cấu hình vẫn được lưu tại vị trí nguyên bản (biến toàn cục `诸天系统_API` và biến kịch bản `诸天记忆助手_v1_API`), nên phiên bản cũ và kịch bản cũ vẫn đọc được.

## IV. Phương án phối màu (Mới)

Trang 「Cài đặt」 của thiết bị đầu cuối → 「Phương án phối màu」:

| Tùy chọn | Thuyết minh |
|---|---|
| Theo chủ đề thế giới (Mặc định) | Giống như trước đây, tự động đổi màu theo thế giới hiện tại |
| Đêm Tím · Lilith | Màu tím nguyên bản |
| Đen Vàng · Huyền Mặc Lưu Kim | Nền đen chữ vàng kim |
| Men Ngọc · Vũ Quá Thiên Thanh | Xanh xám men ngọc |
| Anh Đào Đỏ · Dạ Anh | Hồng sẫm |
| Xanh Sương · Đêm Sao | Xanh lạnh |
| Ráng Đỏ · Đỏ Thẫm Hổ Phách | Đỏ sẫm + hổ phách |
| Than Chì · Xám Độ Bão Hòa Thấp | Xám trung tính, thích hợp nhìn lâu |

- Phối màu cố định chỉ đổi màu sắc, bao phủ thiết bị đầu cuối, các trang thanh trạng thái nguyên bản (trang động cơ) và thẻ trình diễn. Họa tiết trang trí thế giới vẫn được giữ nguyên (ví dụ vân mây của Tiên hiệp, đường quét của Cyber).
- **Phối màu mặc định của thế giới Tiên hiệp được đổi từ xanh lá sang 「Vàng Mặc Ngọc」**: nền màu mực, nhấn màu vàng kim, điểm xuyết xanh ngọc, nút đồ phổ và thẻ trình diễn cũng đổi màu đồng bộ.

## V. Có thể bật/tắt các ngoại quải mạnh (Mới)

Vị trí: Thiết bị đầu cuối → Ngoại quải → Quản lý ngoại quải → thẻ 「Mô-đun mạnh」.

| Mô-đun | Mục từ Sách Thế Giới | Mặc định khi cài mới | Thuyết minh |
|---|---|---|---|
| Thần Hào Tiêu Xài | `08｜Cốt lõi｜Thần Hào Tiêu Xài` | **Tắt** | Tiêm thường trực: tài phú vô hạn, hoàn trả tiêu dùng, dễ làm Điểm Hệ Thống / vật giá mất đi ý nghĩa |
| Đả Thủ Chư Thiên | `13｜Phụ trợ｜Tay Đấm Chư Thiên` | **Tắt** | Tiêm thường trực: triệu hồi tay đấm mạnh mẽ đánh thay bất cứ lúc nào |
| Cải Biên Trạng Thái Thực Tại | `20｜Trưởng thành｜Cải Biên Trạng Thái Thực Tại` | Bật | Kích hoạt theo từ khóa |
| Ngôn Linh Cải Tự | `21｜Trưởng thành｜Ngôn Linh Cải Tự` | Bật | Kích hoạt theo từ khóa |
| Điểm Hệ Thống Vạn Dụng | `10｜Thương thành｜Điểm Hệ Thống Vạn Dụng` | Bật | Kích hoạt theo từ khóa: ước nguyện dự phòng (có phụ phí) |
| Sao Chép Bản Nguyên · Sao Chép Đồ Giám | `19｜Trưởng thành｜Sao Chép Bản Nguyên · Sao Chép Đồ Giám` | Bật | Kích hoạt theo từ khóa |

- Công tắc sửa trực tiếp trạng thái bật của mục từ Sách Thế Giới, **có hiệu lực với mọi cuộc trò chuyện**, và lưu Sách Thế Giới ngay lập tức.
- Mô-đun đã tắt:
  - Không còn gửi cho AI nữa;
  - Lối vào tương ứng trong thiết bị đầu cuối được ẩn đi (ví dụ thẻ Thần Hào trên trang Tổng quan cơ bản);
  - Trong lời nhắc ngoại quải báo thêm cho AI biết: 「Ký chủ hiện đã tắt: ……, không được xuất hiện hoặc sử dụng các ngoại quải này trong cốt truyện」.
- **Sách Thế Giới đã có sẵn sẽ không bị tự động sửa đổi** (trong Sách Thế Giới cài từ bản v1.1 và ≤0.8.3 thì hai mục này đều đang bật). Trang Quản lý ngoại quải sẽ hiện gợi ý và cung cấp nút 「Cân bằng 1 chạm」, chỉ khi người dùng bấm vào mới sửa đổi.

## VI. Một số tiện ích làm đẹp giao diện SillyTavern hiển thị bất thường (Đã tương thích)

**Nguyên nhân**: Để hiển thị thẻ lời thoại Lilith và khối dữ liệu Chư Thiên, plugin dựng lại nội dung tầng dựa theo kết xuất gốc của SillyTavern, khiến các thay đổi do tiện ích mở rộng khác thực hiện trên tầng sau khi SillyTavern kết xuất bị xóa mất hoặc bị nhân đôi. Bản 0.8.2 mới chỉ bảo vệ `div.TH-render` của Tavern Helper.

**Hiện tại** (`swapContent` trong `src/statusbar-host.js`): Plugin lấy bản kết xuất của chính SillyTavern cho cùng tin nhắn đó làm đối chiếu và so sánh từng nút DOM:

| Trường hợp | Ví dụ | Xử lý |
|---|---|---|
| Nút do tiện ích mở rộng khác thêm mới / thay thế | Bộ kết xuất đổi khối mã thành thẻ iframe (Tiểu Bạch X, thẻ frontend, v.v.); Tavern Helper | Giữ nguyên tại chỗ: cùng một nút DOM, iframe không tải lại; khối mã gốc đã được nó thay thế không bị hiển thị lặp lại |
| Nút được sửa đổi tại chỗ (văn bản không đổi, thẻ đánh dấu thay đổi) | Kịch bản JS làm đẹp bọc `span` vào đoạn văn, thêm tên lớp / kiểu dáng, đổi `<p>` thành `<div>` | Giữ nguyên phiên bản đã sửa đổi |
| Làm đẹp bằng biểu thức chính quy của SillyTavern (chỉ hiển thị) | Tô màu dấu ngoặc kép `「」`, v.v. | Khi dựng lại, plugin sử dụng chính `messageFormatting` của SillyTavern nên biểu thức chính quy vẫn có hiệu lực bình thường |
