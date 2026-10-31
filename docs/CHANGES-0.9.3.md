# Thay đổi 0.9.3 (Sửa lỗi từ phản hồi người dùng: Đọc Sách Thế Giới, Đính chính Bản đồ sao; Thêm mới Hướng dẫn tân thủ)

Phiên bản này sửa hai vấn đề do người dùng phản hồi, đồng thời bổ sung trình hướng dẫn chạy lần đầu nêu tại mục số 6 trong [ROADMAP-1.0](ROADMAP-1.0.md). Kết quả nghiệm thu xem tại [ACCEPTANCE-0.9.3](ACCEPTANCE-0.9.3.md).

- Các trường sổ cái, mục từ Sách Thế Giới và khóa lưu trữ đều không thay đổi, **không cần nhập lại Sách Thế Giới**. Thêm mới một mục cài đặt `guide` (bản ghi hoàn thành / bỏ qua hướng dẫn tân thủ).
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc.

## I. Quy tắc → Bối cảnh thế giới bổ sung không đọc được Sách Thế Giới

**Hiện tượng**: Bấm 「Đọc danh mục sách」 chỉ hiện thông báo “Trợ lý hiện tại thiếu giao diện đọc Sách Thế Giới, vẫn có thể dùng quy tắc tích hợp sẵn”. Bản Tavern Helper đọc được nhưng bản plugin lại không đọc được. Người dùng đang sử dụng TauriTavern, nhưng vấn đề này không phụ thuộc máy chủ mà trên SillyTavern cũng bị y hệt.

**Nguyên nhân**: Trang này của bản gốc gọi hai hàm của Tavern Helper: `getWorldbookNames()` (trả về đồng bộ mảng tên sách) và `getWorldbook(tên_sách)` (trả về các mục từ). Cầu nối gốc của plugin đã cung cấp các giao diện biến số, tầng tin nhắn, tiêm lời nhắc v.v. cho bản gốc nhưng lại bỏ sót đúng hai hàm này, khiến mã gốc phán đoán là “thiếu giao diện”.

**Cách sửa** (`src/th-bridge.js`, `src/assistant-host.js`):

- Cầu nối gốc bổ sung hai giao diện cùng tên này ở chế độ **chỉ đọc**, không lưu, không gắn kết, không gỡ gắn kết bất kỳ Sách Thế Giới nào.
- Tên sách được lấy lần lượt từ các nơi sau: `getContext().getWorldInfoNames()` (từ SillyTavern 1.19 trở đi) → danh sách thời gian thực của mô-đun `world-info.js` trong SillyTavern → `/api/settings/get`. Khi cửa sổ Lilith khởi động sẽ đọc trước một lần, nên khi bấm 「Đọc danh mục sách」 sẽ có kết quả ngay lập tức.
- Các mục từ được lấy lần lượt từ: `getContext().loadWorldInfo` → `loadWorldInfo` của `world-info.js` → `/api/worldinfo/get`. Các mục từ được chuyển đổi sang định dạng của Tavern Helper theo đúng thứ tự trong trình chỉnh sửa Sách Thế Giới rồi chuyển giao cho hàm `normalizeBook` nguyên bản, các mục từ đang tắt sẽ được bỏ qua theo đúng quy tắc gốc.
- Dữ liệu đọc về là bản sao độc lập, không đưa trực tiếp đối tượng trong bộ nhớ đệm của SillyTavern cho mã gốc.
- Khi không đọc được sẽ đưa ra thông báo rõ ràng (phân biệt sách đã bị xóa/đổi tên với sách trống thực sự).
- Cả SillyTavern và TauriTavern đều sử dụng chung bộ giao diện frontend SillyTavern này.

## II. Bản đồ sao tự động nhận diện sai nhưng không có chỗ sửa

**Hiện tượng**: Trong ảnh chụp màn hình, thế giới hiện tại là 「Linh Lung」, nhưng nút trên Bản đồ sao lại ghi là 「Tiên hiệp」, thanh đỉnh lại hiển thị 「Toàn ảnh」, và không có chỗ nào để sửa.

**Nguyên nhân**:

- Loại thế giới được đoán dựa theo từ khóa trong tên thế giới. Trong tên 「Linh Lung」 (`灵笼`) có chữ “Linh” (`灵`) nên bị đoán nhầm thành Tiên hiệp.
- Khi ghi dấu chân đã lưu lại chủ đề đoán được lúc đó. Sau này khi `世界类型` trong sổ cái thay đổi, nút trên đồ phổ vẫn hiển thị chủ đề cũ nên bị lệch với thanh đỉnh (vốn phán đoán theo `世界类型` hiện tại).
- Bản đồ sao trước đây chỉ có duy nhất một cách ghi là 「Ghi nhận xuyên không」. Nếu ghi nhận lại tên thế giới hiện tại sẽ báo lỗi “Đã ở trong thế giới này rồi”, nên vừa không đổi được loại thế giới, vừa không đổi được tên.

**Cách sửa** (`src/world.js`, `src/hub-atlas.js`, `src/fx.js`, `styles/atlas.css`):

- Khi chọn một thế giới trên Bản đồ sao, phía dưới phần chi tiết sẽ có khối 「Nhận diện sai? Đính chính thế giới này」:
  - Có thể sửa tên thế giới và loại thế giới (Tiên hiệp / Cyber / Quỷ dị / Đô thị / Kỳ ảo phương Tây / Tận thế / Khác / Tự động phán đoán; các loại tùy chỉnh có sẵn trong sổ cái cũng sẽ được liệt kê).
  - Khi loại của thế giới hiện tại là do đoán ra, khối này sẽ mặc định mở sẵn.
- Nút 「Lưu đính chính」 sẽ sửa đồng thời `当前世界` / `世界类型` (nếu đang sửa thế giới hiện tại) và dấu chân tương ứng trong cùng một lần ghi có khóa, sau đó đọc lại để xác nhận:
  - Không tính là một lần xuyên không, không cộng thêm số lần, không phát trình diễn xuyên không.
  - Nếu cái tên sửa thành đã có sẵn trong dấu chân, hai mục sẽ được hợp nhất: cộng gộp số lần, giữ lại lần đầu đặt chân sớm nhất và lần gần nhất muộn nhất.
- Những dấu chân không phải là thế giới hiện tại có thể 「Xóa khỏi dấu chân」 (sẽ hỏi xác nhận trước). Thế giới hiện tại không thể xóa, chỉ có thể đính chính.
- Điền tên thế giới hiện tại vào ô 「Ghi nhận xuyên không」 giờ đây sẽ chuyển thành đính chính loại thế giới chứ không còn báo lỗi nữa.
- Hiển thị nút trên Bản đồ sao:
  - Loại thế giới đoán theo tên sẽ có dấu 「?」 (ví dụ 「Tiên hiệp?」).
  - Loại thế giới đã được xác định rõ sẽ hiển thị nguyên văn (ví dụ 「Tận thế」).
  - Thế giới hiện tại phán đoán theo `世界类型` trong sổ cái, đồng nhất với chủ đề trên thanh đỉnh.
  - Các thế giới khác nếu đã ghi rõ loại thì lấy theo loại đó làm chuẩn, không còn dùng chủ đề cũ lưu lúc mới ghi nhận nữa.

## III. Hướng dẫn tân thủ (Tính năng mới)

**Lối vào** (`src/onboarding.js`, khởi động trong `index.js`):

- Lần đầu tiên mở **trực tiếp** thiết bị đầu cuối (bấm ảnh đại diện, Lilith nổi, phím tắt) mà trong ba bước vẫn còn bước chưa hoàn thành, hệ thống sẽ tự động mở trang 「Hướng dẫn tân thủ」. Toàn bộ quá trình chỉ tự động bật lên đúng một lần.
- Khi mở từ các lối vào chỉ định sẵn trang như nhãn nhỏ trên tầng hay nút 「Xem Bản đồ sao」, hướng dẫn sẽ không làm gián đoạn.
- Trong nhóm điều hướng 「Thiết bị đầu cuối」 có nút 「Hướng dẫn」, sau khi hoàn thành hoặc bỏ qua sẽ ẩn đi.
- Bất cứ lúc nào cũng có thể mở lại từ 「Cài đặt → Làm quen → Hướng dẫn tân thủ」.

**Ba bước** (trạng thái đánh dấu tích mỗi lần đều được đọc lại từ trạng thái thực tế):

1. **Nhập hoặc cập nhật Sách Thế Giới**:
   - Chưa từng cài đặt: 「Cài đặt và gắn kết vào cuộc trò chuyện hiện tại」. Khi chưa mở cuộc trò chuyện thì chỉ cài đặt. Khi đã có Sách Thế Giới cùng tên sẽ không ghi đè.
   - Đã cài nhưng chưa phải bản mới nhất: 「Cập nhật lên bản mới nhất」, sẽ lưu một bản sao lưu trước, các mục từ bạn tự thêm và trạng thái công tắc đều được giữ nguyên.
2. **Cài đặt cổng AI**:
   - 「Dùng mô hình chính hiện tại của SillyTavern」 hoàn tất chỉ bằng một chạm.
   - Hoặc chọn 「Điền API độc lập」 để nhảy tới trang Kết nối (biểu mẫu 3 bước của bản 0.8.5). Lúc này trên đầu trang sẽ có nút 「‹ Quay lại hướng dẫn tân thủ」 để điền xong quay về ngay.
3. **Bật trong cuộc trò chuyện hiện tại**:
   - Khi cuộc trò chuyện hiện tại chưa có sổ cái, tạo sổ cái theo quy tắc nguyên bản.
   - Bật ký ức Lilith: đi qua nút 「Lưu cài đặt trò chuyện hiện tại」 của trang Ký ức nguyên bản.
   - Nếu chưa cài đặt cổng AI thì sẽ không bật “Tự động chỉnh lý” (vì bản gốc sẽ từ chối lưu khi chưa có mô hình).

**Nút dưới cùng**: 「Bỏ qua hướng dẫn」, 「Để vậy đã, tính sau」; sau khi hoàn thành cả ba bước sẽ hiển thị 「Hoàn tất」.

## IV. Khác

- Số phiên bản 0.9.3: contracts, manifest, package.json, package-lock (hai nơi), README, ma trận tính năng, `tests/version.test.js`.
- Thêm bài kiểm thử mới: `tests/v093.test.js` (17 hạng mục), `tests/native_v093.py` (29 hạng mục).
