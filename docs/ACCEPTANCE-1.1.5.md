# Bản chính thức 1.1.5 · Bản ghi nghiệm thu

## Môi trường

- SillyTavern 1.19.0 cô lập dùng một lần (`tests/qa/setup_isolated_st.py`), kết hợp với mô hình mô phỏng tất định (`tests/qa/mock_model.py`).
- Khung nhìn máy tính để bàn 1280×860.
- Đợt này **không phải** nghiệm thu bằng mô hình thực tế, cũng **không phải** nghiệm thu trên điện thoại vật lý.

## Kiểm tra tĩnh & Kiểm thử đơn vị (Unit tests)

| Hạng mục | Kết quả |
|---|---|
| `npm run check` | Đạt (đã thêm các tệp mới; runtime được dựng lại, mã băm nguồn khớp; `vendor/original` giữ nguyên cấu trúc) |
| `npm test` | 449/449 (sau bản sửa lỗi tự kiểm tra r1) |
| `npm run filelist` | Đã tạo lại danh sách tệp |
| `tests/v115.test.js` (mới) | 20 hạng mục đạt, xem bảng dưới |

Nội dung được `tests/v115.test.js` bao phủ:

| Phạm vi | Nội dung bao phủ |
|---|---|
| Mặc định Lilith | Toàn bộ hàm thay thế trả về nguyên bản; `ZT_BOOK` khớp với tên Sách Thế Giới trong `features.js` |
| Quả cầu ánh sáng / Tùy chỉnh | Làm sạch số hiệu, tên mặc định, ảnh đại diện SVG; quy tắc cốt truyện bao gồm định dạng lời thoại, cách xưng hô, tính cách; thiết lập trò chuyện riêng giữ nguyên các ràng buộc gốc; ưu tiên thay thế toàn đoạn |
| Thay thế | Văn bản (gồm cả chữ phồn thể 「莉莉絲」, LILITH / Lilith); khi tên có chứa 「Lilith」 thì không thay thế lặp; tin nhắn yêu cầu chỉ thay tin nhắn hệ thống, nguyên văn của người dùng không đổi; Sách Thế Giới chỉ thay bản sao của sách Chư Thiên, các sách khác giữ nguyên |
| Ảnh đại diện | Chỉ chấp nhận data URI hình ảnh base64, có giới hạn kích thước; biểu mẫu lọc bỏ các khóa lạ và ảnh đại diện không an toàn |
| Khung thoại | Nhận diện lời thoại theo tên nhân vật thiết lập, khi đổi về Lilith thì khôi phục như cũ |
| Yêu cầu trò chuyện riêng | Đi qua fetch của trợ lý: khi ở chế độ Quả cầu ánh sáng thì lời nhắc hệ thống đổi thành 「Bạn là Hệ Thống 009…」, khi ở chế độ Lilith thì giữ nguyên bản gốc |
| Công tắc tính năng | Mỗi khóa cài đặt của công tắc đều có giá trị mặc định; đọc / ghi; công tắc dạng giá trị ghi nhớ giá trị khác tắt gần nhất; mô-đun mặc định bật; 「Cửa sổ trợ lý hệ thống」 được đánh dấu có hiệu lực sau khi làm mới |
| Ẩn trang | Tắt mô-đun sẽ ẩn luôn trang tương ứng; Tổng quan, Cài đặt, Kết nối, Công tắc tính năng, Trang thiết lập nhân vật không thể bị ẩn |
| Giá trị mặc định cài đặt | `persona` / `modules` / `navHidden` / `groupWorld`, cài đặt cũ được tự động bổ sung đầy đủ |
| Triệu hồi từ Sách Thế Giới | Sắp xếp tìm kiếm, bỏ qua mục từ đã tắt, từ khóa biểu thức chính quy / đơn tự; định dạng lời nhắc triệu hồi; ngân sách số chữ đoạn tư liệu; bối cảnh từ khóa |
| Ký ức thành viên nhóm | Chỉ có hiệu lực với thành viên được triệu hồi từ Sách Thế Giới và xuất hiện trong chính văn (theo tên hoặc từ khóa mục từ); bao gồm trò chuyện nhóm, trò chuyện riêng, tặng quà, độ hảo cảm |
| Sách Thế Giới hiện tại | Thứ tự: Trò chuyện → Nhân vật → Toàn cục, loại bỏ sách Chư Thiên |
| Đấu nối (Wiring) | Lối vào, trang, công tắc mô-đun, triệu hồi, kịch bản `check` |
| Sách hướng dẫn | Phiên bản tiêu đề; thiết lập nhân vật, công tắc tính năng, triệu hồi, ký ức thành viên nhóm đều có thuyết minh đầy đủ |

## Trình duyệt: `tests/native_v115.py`, 30/30 (sau bản sửa lỗi tự kiểm tra r1; trước r1 là 27/27)

### Thiết lập nhân vật trợ lý hệ thống

1. Cài đặt → Làm quen → 「Thiết lập nhân vật trợ lý hệ thống」 mở trang thiết lập. Chọn 「Quả cầu ánh sáng hệ thống」, số hiệu 007, bấm 「Lưu và áp dụng ngay」:
   - Cài đặt đã lưu, `app.persona.name = Hệ Thống 007`, phần tử máy chủ gắn nhãn `data-zt-persona=orb`;
   - Không cần làm mới trang.
2. Giao diện đổi theo ngay lập tức:
   - Vị trí tranh đứng và nút đánh thức đều hiển thị quả cầu ánh sáng mang số hiệu SVG;
   - Tranh đứng phân lớp được ẩn đi;
   - Nhóm điều hướng 「Lilith」 đổi thành 「Hệ Thống 007」;
   - Không hiển thị Lilith nổi.
3. Tạo phản hồi thực tế (đi qua API chính của SillyTavern → mô hình mô phỏng):
   - Trong lời nhắc có quy tắc thiết lập nhân vật của 「Hệ Thống 007」 và định dạng lời thoại `【Hệ Thống 007】: “`, không còn 「Thiết lập độc quyền Trợ lý hệ thống Lilith」;
   - Tệp Sách Thế Giới trên máy chủ vẫn giữ nguyên bản gốc của Lilith.
4. Trò chuyện riêng (giao diện thực tế: bấm ảnh đại diện → nhập → gửi):
   - Lời nhắc hệ thống của yêu cầu bắt đầu bằng 「Bạn là Hệ Thống 007」, phản hồi hiển thị bình thường;
   - Tiêu đề trò chuyện riêng là 「Hệ Thống 007 · Trò chuyện riêng」.
5. Đổi về lại Lilith mà không cần làm mới trang:
   - Tranh đứng khôi phục lại ảnh webp nguyên bản, điều hướng và tiêu đề trò chuyện riêng khôi phục về 「Lilith」;
   - Nhãn thiết lập nhân vật trên phần tử máy chủ được gỡ bỏ.

### Công tắc tính năng

6. Cài đặt → 「Công tắc tính năng」 mở bảng (61 dòng).
7. Tắt 「Nhóm chat」:
   - Nút điều hướng ẩn đi, phần tiêm nhóm chat vào chính văn được xóa trống;
   - Lúc này chuyển hướng tới nhóm chat sẽ bị chặn lại và đứng yên ở trang hiện tại;
   - Sau khi bật lại thì khôi phục như cũ.
8. Tắt 「Lệnh gạch chéo /zt」: thực thi `/zt status` chỉ trả về thông báo đã tắt trong Cài đặt → Công tắc tính năng.
9. Trong mục 「Trang thiết bị đầu cuối」, tắt 「Thương thành」: trong thanh điều hướng không còn hiển thị nữa, `navHidden = ['shop']`. Bấm 「Bật tất cả」 sẽ khôi phục lại.

### Nhóm chat × Sách Thế Giới

10. Trang Thành viên nhóm → 「Triệu hồi từ Sách Thế Giới」:
    - Trong danh sách sách có Eldoria, không có sách Chư Thiên;
    - Tìm kiếm 「glade」 tìm thấy mục từ tương ứng.
11. Bấm 「Triệu hồi」: ứng viên mang theo `来源 {book: Eldoria, uid: 2, comment: glade}`. Sau khi 「Mời vào nhóm」, thành viên giữ nguyên nguồn gốc, trên thẻ hiển thị 「📖 Sách Thế Giới」.
12. Gửi tin nhắn nhóm: trong yêu cầu trò chuyện nhóm có kèm 「【Tư liệu Sách Thế Giới (Tham khảo chỉ đọc)】」 và mục từ này.
13. Viết 「Ta bước vào glade」 trong chính văn rồi tạo phản hồi: trong lời nhắc chính văn có 「【Nhóm Chat Chư Thiên · Ký ức thành viên nhóm】」. Tắt 「Tiêm ký ức thành viên nhóm」 rồi tạo lại thì không còn nữa.
14. Số lượng mục từ của Sách Thế Giới Eldoria không thay đổi (plugin chỉ đọc).
15. Suốt quá trình không có lỗi trang (0 pageerror).

Ảnh chụp màn hình:
- `v115-persona-orb.png`
- `v115-switches.png`
- `v115-group-worldbook.png`

## Bản sửa lỗi tự kiểm tra r1

| Hạng mục | Kết quả |
|---|---|
| Thêm mới 5 bài kiểm thử đơn vị | Tên có ký tự `$` không làm hỏng biểu thức chính quy nhận diện giọng nói; tên 1 ký tự bị từ chối; đối chiếu xưng hô (gồm cả thay thế toàn đoạn); khi tắt nhóm chat sẽ bỏ mục từ 36; trong lúc đọc Sách Thế Giới đã đánh dấu bận (kiểm thử tích hợp, trước khi sửa sẽ thất bại) |
| Thêm mới 3 bài kiểm thử trình duyệt | Lời nhắc chính văn có chứa 「Đối chiếu xưng hô」; khi tắt nhóm chat thì lời nhắc chính văn không còn mục từ 「Liên kết với chính văn」, các mục từ Chư Thiên khác vẫn bình thường; sau khi bật lại thì mục từ quay trở lại |
| Hiệu năng giao diện thiết lập nhân vật (chế độ Quả cầu ánh sáng, lật qua 10 trang) | Trong 4 giây nghỉ, bộ thay thế chỉ chạy 4 lần (không có vòng lặp tự kích hoạt); tác vụ dài khi chuyển trang 70–180 ms, khi ở chế độ Lilith là 60–70 ms |
| Hồi quy | native_v114 29/29, native_group060 44/44, native_v113 34/34, native_v112 40/40, native_v111 32/32, native_guards không có lỗi trang |

## Hồi quy trình duyệt các bản cũ (cùng môi trường)

| Kịch bản | Kết quả |
|---|---|
| `native_v114.py` | 29/29 (sau khi đổi kiểm tra phiên bản thành ≥ 1.1.4) |
| `native_v113.py` | 34/34 |
| `native_v112.py` | 40/40 |
| `native_v111.py` | 32/32 |
| `native_v111_mobile.py` | 12/12 |
| `native_group060.py` | 44/44 |
| `native_guards.py` | Đạt (không có lỗi trang, máy chủ 1.19.0, tiện ích mở rộng 1.1.5) |
| `native_v100.py` | 27/28 |

Hạng mục thất bại duy nhất của `native_v100.py` là 「Hiệu ứng động Rút gọn」, đã tồn tại từ bản 1.1.4, không liên quan tới bản này.

## Chưa xác minh / Ranh giới

- **Mô hình thực tế**: Hiệu quả nhập vai của nhân vật tùy chỉnh và quả cầu ánh sáng trong cốt truyện, độ chính xác của tư liệu triệu hồi, cũng như việc ký ức thành viên nhóm có được sử dụng trong cốt truyện hay không đều mới chỉ được xác minh bằng mô hình mô phỏng (Tính năng thử nghiệm).
- **Thay thế cơ học**: Từ 「Lilith」 trong các mục từ khác của Sách Thế Giới sẽ được thay thế cơ học thành tên nhân vật mới, nội dung hướng người lớn của bản gốc cũng sẽ đổi tên theo. Nếu muốn thay đổi triệt để, cần dùng 「Thay thế toàn đoạn」 hoặc trực tiếp chỉnh sửa Sách Thế Giới.
- **Máy chủ không có sự kiện `WORLDINFO_ENTRIES_LOADED`**: Chuyển sang dùng một lời nhắc ghi đè, hiệu quả yếu hơn so với thay thế trực tiếp. Bản 1.16–1.19 đều có sự kiện này, TauriTavern chưa được kiểm thử.
- **Ảnh đại diện tùy chỉnh**: Mới chỉ tải lên trên trình duyệt máy tính (nén về 256 pixel). Việc chọn ảnh từ thư viện trên điện thoại vật lý chưa được kiểm thử.
- **Điện thoại vật lý**: Trang thiết lập nhân vật, trang công tắc tính năng và thẻ triệu hồi mới chỉ được nghiệm thu trên khung nhìn máy tính, bài kiểm thử hồi quy bố cục di động (`native_v111_mobile` 12/12) chưa bao gồm ba trang này.
