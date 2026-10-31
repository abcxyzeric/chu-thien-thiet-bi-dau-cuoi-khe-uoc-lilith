# 1.1.4 · Xóa tin nhắn / Roll lại / Cắt cụt / Cài đặt tạo phản hồi Nhóm chat, Sửa lỗi đóng băng giả, Làm sạch khóa ký ức, Bảo vệ chuỗi tư duy, Sách hướng dẫn

Đây là phiên bản nhỏ sửa lỗi và hoàn thiện tính năng, cập nhật tăng thêm trên nền bản 1.1.3.

- Phiên bản plugin 1.1.4.
- Phiên bản cấu trúc sổ cái 2 giữ nguyên; phiên bản quy tắc Sách Thế Giới 1.1.1 giữ nguyên, không cần cập nhật Sách Thế Giới.
- ID plugin, không gian tên cài đặt và các khóa lưu trữ đều không đổi, bản lưu cũ sử dụng tiếp được ngay.
- Dữ liệu mới thêm chỉ có trường `轮次` (bản ghi 5 lượt gần nhất để phục vụ roll lại) và 5 mục mới trong `设置` của nhóm chat, đều được ghi bên trong `诸天系统.聊天群`.

## 1. Nhóm chat

### Xóa từng tin nhắn đơn lẻ

Phản hồi từ người chơi: Tin nhắn trong nhóm chat không xóa được.

- Thanh công cụ trang Trò chuyện thêm mới nút 「🗑 Quản lý」. Sau khi bật, bên cạnh mỗi tin nhắn đều hiện biểu tượng 🗑, bấm 「✓ Hoàn tất」 để thoát chế độ quản lý.
- Tin nhắn thông thường, thông báo hệ thống, phát biểu của chính bạn: xóa trực tiếp.
- Những thứ đã được ghi vào sổ cái sẽ không thể xóa, khi bấm vào sẽ hiện thông báo nêu rõ lý do:
  - Lì xì mà bạn **đã giật**;
  - Lì xì do **chính bạn phát** (đã trừ sổ cái và thành viên nhóm cũng đã nhận);
  - Quà tặng mà bạn **đã nhận**.
- Lì xì chưa giật, quà tặng chưa nhận: hỏi xác nhận trước, sau đó hủy bỏ cùng với tin nhắn. Số lì xì đã nhận trong ngày sẽ được trừ trả lại.
- Việc xóa tin nhắn chỉ ảnh hưởng tới danh sách tin nhắn nhóm, không làm thay đổi Điểm Hệ Thống hay túi đồ trong sổ cái.

### Tạo lại phản hồi (Roll lại / Reroll)

Phản hồi từ người chơi: Cần tính năng roll lại cho nhóm chat; nếu đã nhận lì xì hoặc nhận quà tặng thì không cho roll lại, còn chưa nhận thì có thể roll lại.

- Thanh công cụ thêm mới nút 「↻ Roll lại」, tác động lên **lượt phát biểu gần nhất** của thành viên nhóm. Một lượt có thể là phản hồi sau khi bạn gửi tin nhắn, hoặc một lượt tán gẫu tự động.
- Đầu vào giữ nguyên: câu nói đó của bạn, hoặc đoạn cốt truyện nhìn thấy lúc tán gẫu tự động. Phát biểu của bạn được giữ nguyên.
- Các trường hợp dưới đây không thể roll lại và sẽ hiện thông báo nêu rõ lý do:
  - Lì xì của lượt này bạn đã giật rồi;
  - Quà tặng của lượt này bạn đã nhận rồi.
- Khi có thể roll lại, những thứ sau đây của lượt đó sẽ được thu hồi cùng lúc:
  - Tin nhắn của thành viên nhóm, thông báo cắt cụt;
  - Lì xì chưa giật, quà tặng chưa nhận;
  - Số lì xì đã nhận trong ngày;
  - Nhịp độ lì xì (khoảng cách từ lần trước / giãn cách);
  - Số lượt cấm chat đã tiêu hao trong lượt này (với điều kiện sau đó chưa bị ai sửa đổi).
- Chỉ sau khi phản hồi mới tới nơi, hệ thống mới thu hồi lượt cũ và ghi lượt mới **trong cùng một lần ghi có khóa duy nhất**. Nếu yêu cầu thất bại hoặc hết thời gian chờ, lượt cũ vẫn được giữ nguyên vẹn.
- Chỉ có thể roll lại lượt gần nhất. Các tin nhắn được tạo từ bản 1.1.3 trở về trước chưa có bản ghi lượt nên không thể roll lại, nhưng vẫn có thể xóa từng tin nhắn.

### Cắt cụt (Truncation)

Phản hồi từ người chơi: Phản hồi trò chuyện nhóm hay bị đứt ngang giữa chừng.

- Nguyên nhân: Giới hạn đầu ra mỗi yêu cầu của nhóm chat trước đây cố định ở mức 1200 tokens (hoặc lấy theo đầu ra tối đa mặc định trong Cài đặt cổng AI). Khi có 6 người cùng phát biểu, kèm định dạng lì xì hoặc dùng mô hình suy luận thì rất dễ bị thiếu token.
- Hiện tại khi mô hình báo cáo 「đầu ra chạm giới hạn trần」 (`finish_reason = length`):
  - Dòng cuối cùng thường là câu bị đứt nửa chừng nên sẽ được loại bỏ;
  - Trong nhóm sẽ xuất hiện một dòng thông báo khuyên bạn bấm 「↻ Roll lại」, hoặc tăng giới hạn đầu ra / giảm số chữ mỗi tin.
- Giới hạn: Chỉ khi đi qua API độc lập (địa chỉ tùy chỉnh) mới nhận diện được nguyên nhân cắt cụt. Khi đi qua 「API chính của SillyTavern」, SillyTavern chỉ trả về văn bản chứ không trả về `finish_reason` nên không tự nhận diện được; trong trường hợp này bạn chỉ cần tăng giới hạn đầu ra ở bảng cài đặt bên dưới là được.

### Công việc nhóm → Tạo phản hồi nhóm chat (Cài đặt mới)

| Cài đặt | Tùy chọn | Mặc định |
|---|---|---|
| Số người phát biểu tối thiểu mỗi lượt | 1–6, 8, 10 người | 1 |
| Số người phát biểu tối đa mỗi lượt | 1–6, 8, 10 người | 6 |
| Giới hạn số chữ mỗi tin nhắn | 120 / 200 / 300 / 400 / 600 / 800 | 300 |
| Số tin nhắn gần đây gửi kèm cho mô hình | 8 / 16 / 30 / 50 | 16 |
| Giới hạn đầu ra (`max_tokens`) | Tự động / 1200 / 2000 / 3000 / 4000 / 6000 / 8000 | Tự động |

- Giá trị mặc định giống hệt hành vi của bản 1.1.3 (1–6 người, 300 chữ, 16 tin).
- Khi giới hạn dưới lớn hơn giới hạn trên, mục còn lại sẽ tự động điều chỉnh theo.
- Tán gẫu tự động tối đa 3 người; nếu giới hạn dưới cao hơn 3 thì lấy theo giới hạn dưới.
- Cách tính của chế độ 「Tự động」: `600 + số_người_tối_đa × (số_chữ_mỗi_tin + 20)`, giới hạn trong khoảng 1200–6000.
- Thứ tự ưu tiên của giới hạn đầu ra:
  1. Giới hạn trần đặt riêng cho Nhóm chat trong 「API phân nhánh tính năng」 (ưu tiên cao nhất);
  2. Con số cụ thể được chọn tại đây;
  3. Giới hạn trần mặc định trong Cài đặt cổng AI;
  4. Ước tính tự động.

## 2. 「Trạng thái ghi quyết toán gốc trước đó chưa rõ… đã đóng băng」 (Sửa lỗi đóng băng giả)

Phản hồi từ người chơi: Sổ cái báo bị đóng băng nhưng thực chất dữ liệu đã được ghi vào xong xuôi rồi.

Nguyên nhân: Sau khi ghi sổ cái, hệ thống đọc lại từ máy chủ để đối chiếu. Trước đây nó so sánh **toàn bộ** `chat_metadata.variables` từng chữ một, nên những tình huống dưới đây đều bị coi nhầm là 「trạng thái ghi chưa rõ」 và kích hoạt đóng băng:

- Biến của thẻ nhân vật khác hoặc kịch bản khác (như MVU, v.v.) tình cờ thay đổi đúng lúc đó;
- Một giá trị nào đó máy chủ không lưu nguyên dạng được (như `undefined` hoặc `NaN`);
- Một lệnh lưu do chính SillyTavern phát đi từ trước đó đến muộn và ghi đè lên lần ghi này.

Cách sửa:

- Khi đọc lại **chỉ so sánh những khóa biến số được thay đổi trong lần ghi này**, đồng thời chuẩn hóa qua JSON trước rồi mới so sánh, nên biến của các thẻ khác không còn ảnh hưởng nữa.
- Khi đọc lại thấy không khớp, hệ thống sẽ đợi 0.7 giây trước, lưu lại sổ cái trên trang thêm một lần nữa rồi đọc lại lần thứ hai. Nếu vẫn không khớp mới phán định là 「trạng thái ghi chưa rõ」.
- Khi quyết toán gốc (`ledger-service`) đọc lại không khớp cũng sẽ đọc lại thêm một lần nữa (nhưng không tự động ghi lại).
- Thông báo đóng băng được cập nhật trỏ tới nút mới bên dưới.

Nút mới: **Cài đặt → Chẩn đoán & Bảo trì → 「Đối chiếu & Mở khóa sổ cái」**

- Chỉ đọc, không ghi bất cứ thứ gì. So sánh bản lưu trên máy chủ với sổ cái trên trang hiện tại:
  - **Khớp nhau**: Không có thao tác ghi nào đang treo, mở khóa băng ngay lập tức mà không cần làm mới trang.
  - **Không khớp**: Liệt kê các mục khác biệt và hỏi bạn có muốn tải lại trang hay không. Sau khi tải lại sẽ lấy bản lưu trên máy chủ làm chuẩn và tự động gỡ bỏ trạng thái đóng băng.

## 3. 「Chỉnh lý ký ức thất bại: Khóa ký ức bị trùng lặp hoặc không an toàn」

Nguyên nhân: Bộ kiểm tra hợp lệ nguyên bản (`vendor/original/runtime.js`) yêu cầu khóa ký ức chỉ được dùng chữ Hán, chữ cái tiếng Anh, chữ số, `_`, `-`, `/`, độ dài 1–64 ký tự và không được trùng lặp trong cùng một lô. Мо hình thường viết ra các khóa có dấu chấm giữa `·`, dấu hai chấm `：`, khoảng trắng, tiếng Việt có dấu hoặc viết trùng một khóa hai lần, làm cả lô ký ức bị loại bỏ.

Cách sửa nằm tại hàm `normalizeMemory` trong `src/model-response.js`, chạy **trước** bộ kiểm tra nguyên bản:

- Thực hiện chuẩn hóa NFKC trước (chuyển ký tự toàn giác về bán giác);
- Thay các ký tự không được phép bằng dấu gạch dưới `_`, thay thế luôn các từ khóa nguy hiểm;
- Cắt bỏ `_` / `/` ở hai đầu và giới hạn độ dài ở 64 ký tự;
- Nếu sau khi làm sạch mà khóa trống rỗng thì tạo khóa theo dạng `mem_<mã_băm_nội_dung>`;
- Với các khóa trùng lặp trong cùng một lô, chỉ giữ lại mục **ở phía sau** (khớp với hành vi ghi đè của bản gốc).

## 4. Thẻ chuỗi tư duy (CoT) bị 「nuốt mất」

Cách sửa và gia cố trong bản này:

- **Vô hiệu hóa bản nháp khối dữ liệu nằm trong chuỗi tư duy**: Trong phản hồi mới, các thẻ `<ZhuTianPanel>` / `</ZhuTianPanel>` xuất hiện bên trong chuỗi tư duy (ở **bên ngoài** khối dữ liệu chính thức) sẽ được đổi thành ký tự toàn giác `＜ZhuTianPanel＞`. Việc đọc hiểu không bị ảnh hưởng, nhưng không một bộ phân tích nào coi nhầm bản nháp đó là khối dữ liệu thật nữa. Nguyên văn được sao lưu trong tầng và có thể khôi phục. Loại vấn đề mới: `cotpanel`.
- **An toàn cho cả các tầng cũ**: Kết xuất tầng (`splitPanels`), `stripPanels` và bộ lọc khối dữ liệu tầng cũ (`stripOldPanels`) đều bỏ qua chuỗi tư duy nằm ngoài khối dữ liệu trước tiên, nên các tầng lưu từ trước bản 1.1.4 cũng hiển thị và ghi sổ chính xác, chính văn không bị lọc nhầm nữa.
- **Bảo vệ chuỗi tư duy**: Chuỗi tư duy nằm **bên ngoài** khối dữ liệu được thay bằng ký tự giữ chỗ trước khi sửa lỗi và đặt trả lại nguyên vẹn sau khi sửa xong, bao gồm cả trường hợp điền sẵn (prefill) chỉ có thẻ đóng `</think>` hoặc chuỗi tư duy chưa đóng thẻ do bị cắt cụt.
- Khung thoại Lilith không còn trích xuất lời thoại từ bên trong chuỗi tư duy nữa.
- **Nhắc nhở định dạng**: Độ sâu chèn mặc định được đổi từ 0 sang **1** (để không chèn vào sau phần prefill mở đầu chuỗi tư duy của một số preset). Có thể đổi về 0 trong Cài đặt → Bảo vệ định dạng khối dữ liệu → 「Độ sâu chèn nhắc nhở định dạng」.
- Thêm mới nút **Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra tầng mới nhất: Plugin có can thiệp không?」**, liệt kê chi tiết trạng thái tầng mới nhất và toàn bộ lời nhắc tiện ích mở rộng đang hoạt động.

## 5. Sách hướng dẫn

Theo yêu cầu của người chơi: bổ sung tính năng sách hướng dẫn và tổng hợp toàn bộ tính năng, nút bấm, công dụng cùng cách dùng thành một tài liệu hoàn chỉnh.

- Thêm mới `docs/MANUAL.md`: sách hướng dẫn đầy đủ.
- Trong nhóm 「Thiết bị đầu cuối」 ở cột điều hướng bên trái, thêm mới trang 「**Sách hướng dẫn**」 (`src/hub-manual.js`):
  - Đọc trực tiếp tệp `docs/MANUAL.md` từ thư mục plugin ở chế độ chỉ đọc;
  - Hỗ trợ mục lục, chuyển nhanh tới chương, tìm kiếm nhiều từ khóa cách nhau bằng dấu cách và lọc theo chương;
  - Toàn bộ văn bản đều được thoát mã (escape) an toàn trước khi kết xuất Markdown.
