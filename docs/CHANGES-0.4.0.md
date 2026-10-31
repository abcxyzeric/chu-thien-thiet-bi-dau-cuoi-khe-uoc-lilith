# Bản ghi thay đổi 0.4.0: Plugin thay thế toàn diện bản gốc v1.1

Cơ sở: 0.3.0 (`84ed96f`, dựa trên `main` @ `486b28b` thượng nguồn).
Mục tiêu: **Chỉ cần cài đặt plugin này là có thể thay thế toàn bộ nội dung cài đặt của 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 v1.1**:
- Sách Thế Giới ngoại vi;
- 4 kịch bản biểu thức chính quy (regex);
- 1 kịch bản Tavern Helper;
- Toàn bộ tính năng AI của thanh trạng thái;
- Trợ lý Lilith, trò chuyện riêng, tương tác chạm, cùng tính năng làm đẹp giọng nói có thể bật/tắt.

Kết quả nghiệm thu xem tại [ACCEPTANCE-0.4.0](ACCEPTANCE-0.4.0.md).

## Nội dung cài đặt v1.1 → Sự thay thế bên trong plugin

| Nội dung cài đặt v1.1 | Sự thay thế bên trong plugin | Mô-đun |
|---|---|---|
| Sách Thế Giới 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 (35 mục) | Khi mở cuộc trò chuyện Chư Thiên sẽ **tự động cài đặt và gắn kết** làm Sách Thế Giới trò chuyện; nếu đã tồn tại thì không ghi đè; khi đã gắn kết Sách Thế Giới trò chuyện khác thì không chiếm quyền. Thêm mới **kiểm tra ngân sách Sách Thế Giới & điều chỉnh 1 chạm**, xem thuyết minh bên dưới | `src/features.js` |
| Biểu thức chính quy 「Thanh trạng thái Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới 3.1 Bản thông dụng」 | Thanh trạng thái nguyên bản kết xuất gốc ngay trong tin nhắn: tầng mới nhất hiển thị thanh trạng thái đầy đủ, tầng cũ hiển thị thẻ rút gọn | `src/statusbar-host.js` |
| Biểu thức chính quy 「Khung thoại độc quyền của Lilith」 | Thẻ giọng nói gốc. **Có thể bật/tắt**: Cài đặt → Làm đẹp giọng nói Lilith. Không hiển thị từ chỉ cảm xúc; sau khi tắt sẽ khôi phục văn bản thuần | `src/voice-box.js` |
| Biểu thức chính quy 「Thanh trạng thái Chư Thiên - Tầng cũ không gửi cho AI」 | Bộ chặn tạo phản hồi chỉ bóc tách bảng của các tầng cũ ra khỏi **lời nhắc gửi cho mô hình**, bản thân lịch sử trò chuyện không bị sửa đổi. Độ sâu giữ lại có thể điều chỉnh, mặc định là 2 | `src/prompt-filter.js` |
| Biểu thức chính quy 「Thanh trạng thái Chư Thiên - Hiển thị rút gọn tầng cũ」 | Thẻ rút gọn, bấm vào có thể mở rộng thanh trạng thái đầy đủ; cũng có thể tắt để đổi thành nút “Lịch sử” | `src/statusbar-host.js` |
| Kịch bản Tavern Helper 「Không Gian Khế Ước Lilith v1.1」 | Trợ lý Lilith nguyên bản chạy gốc, **không cần Tavern Helper**. Bao gồm Bàn làm việc, Hồ sơ ký ức, Kho quy tắc, Cài đặt kết nối, Trạng thái vận hành, Trò chuyện riêng (ảnh đại diện góc trên bên trái), tự động chỉnh lý ký ức và khung thoại cốt truyện | `src/assistant-host.js` |
| Macro biến số của Tavern Helper `{{get_chat_variable::…}}`, v.v. | Triển khai mô phỏng `macro_like` của TH: đồng thời thay thế lời nhắc trước khi gửi và HTML dùng để hiển thị. Bản 1.16 đi theo đường dẫn macro cũ, động cơ macro mới đi theo `macros.register` | `src/macro-like.js` |
| Hai nơi cấu hình API ở ⚙ Thanh trạng thái và 「Cài đặt kết nối」 của Trợ lý | **Trung tâm API**. Có thể chọn cổng tương thích OpenAI độc lập, hoặc sử dụng trực tiếp API chính hiện tại của SillyTavern. Cấu hình được ghi đồng thời về cả ba nơi lưu trữ nguyên bản, giao diện nguyên bản đọc được cùng một bản | `src/api-center.js` |
| Chạm tranh đứng nguyên bản | Ngoài thao tác bấm đơn, thêm mới **vuốt ve** (vuốt ve liên tiếp sẽ tăng dần cấp độ phản ứng), **nhấn giữ**, phản hồi xúc giác; hoạt động tốt trên thiết bị di động | `src/touch.js` |

Thuyết minh ngân sách Sách Thế Giới: Mặc định ST chỉ phân bổ 25% ngữ cảnh cho Sách Thế Giới, ngữ cảnh 8k không chứa nổi 11 quy tắc thường trực (khoảng 11.7k token), dẫn tới ST loại bỏ toàn bộ, bản gốc cũng gặp đúng vấn đề này. Hiện tại:
- Khi ngân sách không đủ sẽ bật thông báo nhắc nhở;
- Trong bảng chẩn đoán có dòng “Ngân sách Sách Thế Giới” và cung cấp nút “Điều chỉnh 1 chạm”.

## Tiếp quản 1 chạm và Khôi phục bản cũ

- Bảng chẩn đoán sẽ liệt kê các biểu thức chính quy cũ và kịch bản Tavern Helper cũ vẫn đang bật.
- Bấm 「Tiếp quản 1 chạm」 sẽ tắt chúng đi (chỉ tắt chứ không xóa). Trước khi tiếp quản sẽ bật hộp thoại xác nhận.
- **Sau khi ghi xuống đĩa xong** mới làm mới trang: Tavern Helper giữ một bản sao kịch bản cũ trong bộ nhớ nên bắt buộc phải làm mới trang. E2E sẽ đọc lại cài đặt từ máy chủ để xác nhận đã lưu xuống đĩa trước khi làm mới.
- 「Khôi phục bản cũ」 sẽ chỉ bật lại đúng những mục từng bị plugin này tắt đi.
- Trước khi tiếp quản, nếu biểu thức chính quy cũ vẫn đang bật và chưa cài Tavern Helper, plugin vẫn kết xuất gốc bình thường, không xuất hiện khung thoại kép.

## Toàn bộ tính năng AI của Thanh trạng thái

Tất cả yêu cầu mô hình của thanh trạng thái nguyên bản đều đi qua cùng một hàm `sysFetchAPI`, tổng cộng 8 nơi gọi. Bản 0.4.0 giúp cả 8 nơi hoạt động tốt dưới cả hai phương thức kết nối:
- API độc lập;
- API chính hiện tại của SillyTavern, đi qua `generateRaw`, không đi qua bất kỳ địa chỉ giả lập nào.

Trên ST thực tế kết hợp với mô hình mô phỏng cục bộ, cả 8 nơi đều chạy thông suốt trọn vẹn: bấm nút → gửi yêu cầu → phân tích kết quả → ghi về sổ cái → làm mới giao diện.

| Trang | Tính năng | Kiểm tra E2E |
|---|---|---|
| Thương thành | AI Nhập hàng | Tham số yêu cầu chính xác (max_tokens 1500, temperature 0.7), lọc hàng hóa theo cấp độ cửa hàng, trừ 500 điểm |
| Thương thành | Báo giá ước nguyện | Phân tích báo giá chính xác (20.000 điểm) |
| Thương thành | Rút đơn | Trừ 10.000 điểm → Trình tạo phần thưởng → Chờ nhận → Sau khi nhận đi vào túi đồ |
| Túi đồ | AI Sắp xếp túi đồ | Mỗi vật phẩm đều được phân loại lại theo đầu ra mô hình và bổ sung mô tả hiệu quả |
| Ngoại quải | Triệu hồi Đả Thủ Chư Thiên | Quan chiêu mộ tạo thẻ đả thủ (Tên, Xuất xứ, Đánh giá) |
| Ngoại quải | Lò Nung Vạn Vật | Hai nguyên liệu dung luyện thành vật phẩm mới do mô hình đặt tên |
| Thần thông | AI Đánh giá bậc thực lực | Bậc thực lực do mô hình đưa ra được ghi vào hộp chọn thả xuống |
| ⚙ | Kiểm tra kết nối | Trả về “Kết nối thành công” |

## Sửa lỗi

- **Nút lối vào thiết bị đầu cuối tùy chọn bị chồng lấp với lối vào Lilith**: Ở một số khung nhìn (ví dụ 1500×1000), hai nút đè lên nhau khiến không bấm được. Hiện nút thiết bị đầu cuối luôn neo ngay phía trên lối vào Lilith, khi kéo lối vào hoặc thu phóng cửa sổ cũng tự động đi theo.
- **Sách Thế Giới không đi vào lời nhắc**: Nguyên nhân là ngân sách không đủ, xem thuyết minh ngân sách ở trên.

## Tài nguyên

Thêm mới tư thế AI 「Khoanh tay」 và 「Ngồi nghiêng」:
- Ảnh tham chiếu là phần cắt khuôn mặt nguyên bản kết hợp với tư thế “Thả tim” lót phông xanh lá để khóa nhân vật và trang phục;
- Sau khi tạo xong thực hiện tách nền, số điểm ảnh tràn viền xanh lá bằng 0, nhân vật sát mép trên dưới không có khoảng trắng;
- Xếp chồng lên phông nền nguyên bản tĩnh để hiển thị.

Nguồn gốc và mã băm xem tại `assets/lilith/variants/PROVENANCE.md`.

## Kiểm thử

- `tests/native_replace040.py`: Nghiệm thu đầu-cuối trên ST thực tế cộng mô hình mô phỏng cục bộ, tổng cộng 70 hạng mục, bao phủ toàn bộ các mục thay thế nêu trên.
- `tests/qa/`: Môi trường nghiệm thu có thể tái hiện:
  - `setup_isolated_st.py`: cấu hình máy chủ dùng một lần;
  - `mock_model.py`: mô hình mô phỏng, định tuyến theo lời nhắc nguyên bản và ghi lại mọi yêu cầu;
  - `run_matrix.sh`: kiểm thử lần lượt bốn máy chủ.
- 5 bộ kịch bản nghiệm thu cũ 0.2/0.3:
  - Thống nhất sử dụng `launcher(page)` để đi vào chế độ “Chỉ thiết bị đầu cuối”.
  - Trong báo cáo không còn gán cứng “SillyTavern 1.19.0 / 0.2.0” mà đọc giá trị thực tế từ `/version` và `manifest.json` (`tests/qa_host.py`).
- Kiểm thử đơn vị: `tests/replace040.test.js`, là bài kiểm thử thuần logic.
