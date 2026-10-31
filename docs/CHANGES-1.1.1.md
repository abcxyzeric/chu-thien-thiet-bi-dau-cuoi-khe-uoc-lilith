# 1.1.1 · Sửa lỗi từ phản hồi người chơi (Phiên bản nhỏ sửa lỗi)

Sửa đổi tăng thêm dựa trên GitHub main `bfa4807` (1.1.0-patch4). Phiên bản plugin 1.1.1, phiên bản cấu trúc sổ cái 2 giữ nguyên, phiên bản quy tắc Sách Thế Giới 1.1.1. ID tiện ích mở rộng, khóa lưu trữ và các trường sổ cái đều không đổi tên.

## 1. Bảo hiểm Thần phẩm: 1000 lượt rút

- Hộp mù thêm mới **Bảo hiểm Thần phẩm**. Rút liên tiếp 1000 lượt không ra Thần phẩm thì lượt thứ 1000 chắc chắn ra Thần phẩm, tương ứng với tỷ lệ rơi 0.1% ghi trong Sách Thế Giới.
- Bảo hiểm Tiên phẩm giữ nguyên, vẫn là lượt thứ 100 chắc chắn ra Tiên phẩm. Nổ Thần phẩm không đặt lại bảo hiểm Tiên phẩm, nổ Tiên phẩm cũng không đặt lại bảo hiểm Thần phẩm. Khi cả hai bảo hiểm cùng chạm mốc một lúc sẽ ưu tiên trao Thần phẩm trước, còn Tiên phẩm dời sang lượt rút kế tiếp.
- Trường mới `诸天系统.盲盒状态.神品保底计数`. Bản lưu cũ sẽ được tính bù trong lần rút thẻ tiếp theo:
  - Nếu chưa từng nổ Thần phẩm lần nào: tính theo tổng số lượt rút tích lũy (tối đa 999);
  - Nếu đã từng nổ Thần phẩm: do không thể biết nổ ở lượt thứ mấy nên bắt đầu tính từ 0.
- Bên cạnh bộ đếm Thần phẩm trên thẻ Hộp mù sẽ hiển thị 「Còn N lượt tới bảo hiểm Thần phẩm」; trong thuyết minh ở trang tùy chỉnh hàng hóa bổ sung cụm 「1000 lượt rút chắc chắn ra Thần phẩm」.
- Mục từ 「11｜Thương thành｜Hộp Mù Vạn Giới」 trong Sách Thế Giới bổ sung một dòng tiến độ bảo hiểm Thần phẩm và quy tắc tương ứng, nâng phiên bản quy tắc lên 1.1.1. Sách cũ sẽ có hiệu lực sau khi vào Cài đặt → Sách Thế Giới → Cập nhật lên bản mới nhất (trước khi cập nhật sẽ tự động sao lưu).
  - Các mục từ do plugin cài đặt từ trước bản 1.1.1 và chưa từng bị người dùng chỉnh sửa sẽ không còn bị nhận nhầm là 「sửa đổi tùy chỉnh」 để hỏi xác nhận nữa.

## 2. Lì xì trong Nhóm chat không nhận được

**Nguyên nhân**: Yêu cầu định dạng của bản 1.0 rất khắt khe, chỉ nhận diện duy nhất cách viết `[红包] 系统点|物品 …`. Các cách viết phổ biến của mô hình đều bị coi là văn bản thông thường nên không hiện nút 「Giật」, bao gồm:
- Dùng `【红包】` hoặc `［红包］` (hoặc `[Lì xì]`, `【Lì xì】`) làm nhãn;
- Lược bỏ hai chữ 「物品」 (Vật phẩm), ví dụ `[红包] Đồng Tiền Cổ Thấm Máu/Phàm phẩm/… 5 đồng`;
- `5000 Điểm Hệ Thống 3 phần`, `1.5 vạn`;
- `**@Tên**:`, `@Tên (Thế giới):`.

**Cách sửa**:
- Nhãn, loại, số tiền (hỗ trợ vạn / ức và dấu phân cách hàng nghìn) cùng số lượng (hỗ trợ dấu × và lượng từ) đều được đọc theo quy tắc nới lỏng.
- Giới hạn nội quy nhóm, giới hạn phẩm giai và giới hạn lì xì trong ngày vẫn thực thi nghiêm ngặt như cũ.
- Những lì xì thực sự thiếu thông tin không thể đọc được sẽ được ghi chú ngay sau tin nhắn nhóm là 「（Định dạng lì xì không đầy đủ, chưa ghi sổ）」, không còn âm thầm biến thành văn bản thường nữa.
- Các tin nhắn lì xì cũ từ trước bản 1.1.1 chưa được nhận diện sẽ hiện nút 「Ghi bù」 ở bên dưới. Việc ghi bù tuân thủ cùng giới hạn trần và số lần mỗi ngày, mỗi tin chỉ có thể ghi bù một lần.
- Trong lời nhắc trò chuyện nhóm đã bổ sung một dòng ví dụ đầy đủ.

## 3. Công pháp học được trong cốt truyện không vào sổ · 7. Khối dữ liệu bị nhiễu chính văn hoặc chuỗi tư duy · 4. Thanh trạng thái biến mất

Thêm mới **Bộ bảo vệ định dạng khối dữ liệu** (`src/panel-guard.js`).

**Tự động chỉnh lý phản hồi mới** (mặc định bật, chỉ sửa tầng mới nhất vừa tạo ra):

| Vấn đề | Xử lý |
|---|---|
| Đoạn chính văn, `<think>`, MVU `<UpdateVariable>`, HTML hoặc chú thích bị viết nhầm vào bên trong `<ZhuTianPanel>` | Chuyển ra phần chính văn phía trước khối dữ liệu. Nội dung `<think>` được đưa vào khung chuỗi tư duy của SillyTavern (chỉ khi khung đó đang trống). |
| Thiếu thẻ đóng (khiến bản gốc không nhận diện được cả khối và làm thanh trạng thái biến mất) | Bổ sung thẻ đóng, chuyển phần chính văn phía sau khối lên phía trước khối. |
| Chỉ có thẻ đóng / viết sai chữ hoa-thường hoặc khoảng trắng trong thẻ / bị bọc trong khối mã ``` | Chuẩn hóa thành thẻ tiêu chuẩn. |
| Trong một phản hồi viết nhiều khối dữ liệu | Giữ lại khối cuối cùng có trường hợp lệ. |
| Khối dữ liệu chỉ được viết bên trong chuỗi tư duy (`extra.reasoning`) | Chuyển về cuối phần chính văn. |
| Hoàn toàn không viết thẻ nhưng ở cuối có từ 6 dòng trường hợp lệ trở lên (có chứa Điểm Hệ Thống) | Bọc thẻ chuẩn vào. |
| Dòng `功法修炼` viết thành 「Kích hoạt:X」, 「Lĩnh ngộ 《X》[Tiên phẩm]」, 「Thu lục mới: 收录:X」 | Viết lại thành `收录:X[Phẩm giai]`. |

- **Khối dữ liệu lành mạnh giữ nguyên từng chữ**. Thiết bị đầu cuối ghi sổ cho từng tầng dựa theo mã băm văn bản của khối dữ liệu, việc sửa đổi khối lành mạnh sẽ dẫn tới ghi sổ lặp lại.
- Nguyên văn của AI được sao lưu tại `extra.zhutianCovenantTerminal.panelRepair` của tầng đó. Có thể khôi phục trong Cài đặt → Cài đặt nâng cao → Bảo vệ định dạng khối dữ liệu → 「Khôi phục lần tự động sửa gần nhất」.
- **Tầng cũ không ghi đè vào tệp**: chỉ xử lý theo khối đã chỉnh lý khi hiển thị và lọc lời nhắc.
- **Nhắc nhở định dạng mỗi lượt**: tiêm một dòng lời nhắc hệ thống. Khi lượt trước vừa gặp lỗi, lời nhắc sẽ nêu rõ vấn đề cụ thể.
- **Gợi ý công pháp cốt truyện**: khi chính văn viết 「nhận được / học được / lĩnh ngộ… 《Công pháp X》」 nhưng cả trong khối dữ liệu lẫn kho công pháp đều chưa có môn công pháp đó, hệ thống sẽ bật thông báo để bạn đi thẳng tới trang 「Thu nạp cốt truyện」 đăng ký.
- **Bổ sung khối dữ liệu (Ghi bù)** (Tính năng thử nghiệm): khi trong phản hồi hoàn toàn không có khối dữ liệu, hệ thống sẽ gửi các con số hiện tại, khối của lượt trước, đầu vào của Ký chủ và chính văn lượt này theo bản mẫu `[状态栏数据]模版` trong Sách Thế Giới cho mô hình để nó viết bù một lần.

## 5. Toàn bộ trang bị trượt lên trên (Nút Ước nguyện / Công xưởng ngoại quải)

**Nguyên nhân**: `scrollIntoView()` và `textarea.focus()` trong `insertIntoChatInput` nguyên bản làm cuộn tất cả các phần tử cha có thể cuộn, bao gồm cả `<html>` và `<body>`.

**Cách sửa** (tệp mới `src/page-scroll.js`):
- Toàn bộ lệnh `scrollIntoView` được đổi thành `scrollWithin` chỉ cuộn khung cuộn bên trong thiết bị đầu cuối.
- Khi thiết bị đầu cuối ghi vào ô nhập liệu chính: nếu thiết bị đầu cuối đang mở thì chỉ ghi văn bản mà không đặt tiêu điểm; nếu thiết bị đầu cuối đang đóng thì đặt tiêu điểm không cuộn trang (`preventScroll`). Sau khi ghi xong đưa vị trí cuộn trang về 0.

## 8. Ảnh đại diện Lilith ở góc trên bên trái thiết bị đầu cuối trên điện thoại không bấm được

**Nguyên nhân**: Khi mở thiết bị đầu cuối, ảnh đại diện Lilith neo ở bên trái thanh tiêu đề để bấm vào trò chuyện riêng. Mã gốc tính vị trí ảnh đại diện theo **đỉnh trên cùng của cửa sổ**, nên khi toàn màn hình trên điện thoại có vùng trống `safe-area` dành cho thanh trạng thái hệ thống, ảnh đại diện bị rơi vào trong thanh trạng thái (giờ / cột sóng).

**Cách sửa** (`src/window-controls.js`, không sửa mã gốc):
- Sau khi ảnh đại diện neo vào, căn chỉnh lại theo vị trí của **chính thanh tiêu đề**: căn giữa theo chiều dọc trong thanh tiêu đề và nằm bên phải vùng tai thỏ theo chiều ngang, đảm bảo không bị rơi vào thanh trạng thái.

## 6. Rút Hộp mù từ 10 lượt trở lên bị thất bại

**Nguyên nhân**: Khi tạo một lô 8 món hàng mà văn bản mô tả hiệu quả lại dài, đầu ra của mô hình dễ vượt quá hạn mức và bị cắt cụt, làm hỏng quá trình phân tích JSON của cả đoạn.

**Cách sửa**:
- Nhận diện cắt cụt: khi cổng kết nối trả về `finish_reason` là `length` / `max_tokens`, hoặc mảng JSON chưa đóng ngoặc.
- Khi bị cắt cụt sẽ giữ lại các món hàng đã hoàn chỉnh, chỉ tạo lại các ô còn thiếu và giảm một nửa kích thước lô.
- Phẩm giai, phân loại và đề tài do ô cục bộ quyết định, việc mô hình viết sai mấy trường này không còn làm hỏng cả lô nữa.
- Hộp mù **quyết toán mỗi 10 lượt một lần**: mỗi chặng tung xúc xắc từ sổ cái hiện tại, kiểm tra trạng thái bảo hiểm không đổi rồi trừ phí của chặng đó và đưa vào mục chờ xử lý. Nếu thất bại giữa chừng, phần đã hoàn thành vẫn được ghi sổ bình thường và thông báo rõ 「Đã hoàn thành X/N lượt rút và ghi sổ, N−X lượt còn lại chưa trừ phí」.

## Các bản sửa lỗi qua đợt thẩm tra trước khi phát hành (Số phiên bản vẫn là 1.1.1)

1. **Giữ lại / Phân giải / Thu hồi làm mất phần thưởng hoặc nhân đôi phần thưởng**: Thêm mới `src/item-actions.js`, tiếp quản 5 nút Giữ lại, Phân giải, Phân giải theo phẩm giai, Giữ lại toàn bộ, Thu hồi bằng **một lần** ghi có khóa duy nhất kèm đọc lại xác nhận từ máy chủ.
2. **Ghi bù ghi đè mất số dư giao dịch vừa hoàn tất trong lúc chờ**: Khi bắt đầu ghi bù sẽ lưu lại dấu vân tay sổ cái; khi mô hình trả về nếu dấu vân tay đã thay đổi sẽ từ chối ghi và giữ nguyên số dư mới.
3. **Tác vụ ghi bù xếp hàng ở cuộc trò chuyện A lại chạy sang cuộc trò chuyện B**: Cố định tác vụ ghi bù vào mảng trò chuyện, định danh nhân vật và số thế hệ lúc phát khởi.
4. **「Khôi phục nguyên văn」 làm cắt cụt phản hồi dài**: Lưu trọn vẹn toàn bộ nguyên văn và độ dài `len` trong bản sao lưu, kiểm tra tính toàn vẹn trước khi khôi phục.
5. **Vật phẩm cùng tên bị gộp nhầm**: `ledger-ops.js` thêm mới `stackKey`: chỉ gộp khi Tên, Phẩm cấp, Giá thực tế, Nguồn gốc, Phân loại và Hiệu quả giống hệt nhau hoàn toàn. Các vật phẩm đã qua giám định hoặc thu nạp cốt truyện không bao giờ bị gộp.
6. **Sau khi tắt plugin, tác vụ ghi bù vẫn ghi vào cuộc trò chuyện**: Khi tắt plugin sẽ làm vô hiệu hóa số thế hệ ghi bù ngay lập tức.
7. **Roll lại (Reroll) làm cộng dồn tài sản phi Điểm Hệ Thống**: Thêm mới `src/reroll-guard.js`. Ngay khi SillyTavern bắt đầu swipe / tạo lại phản hồi (trước khi ghép lời nhắc), khôi phục tầng hiện tại về bản chụp nhanh của tầng trước đó và tính lại dòng tài nguyên.
