# Bản ghi thay đổi 0.5.0: Thiết bị đầu cuối là tất cả

Cơ sở: 0.4.0.
Mục tiêu: **Một cửa sổ duy nhất chứa trọn toàn bộ Hệ Thống Chư Thiên**. Cửa sổ Lilith chính là 「Thiết Bị Đầu Cuối Chư Thiên」, thanh trạng thái nguyên bản, ngoại quải và cài đặt đều được chuyển hết vào trong; trong các tầng trò chuyện không còn hiển thị thanh trạng thái nữa.

Kết quả nghiệm thu xem tại [ACCEPTANCE-0.5.0](ACCEPTANCE-0.5.0.md).

## Một cửa sổ duy nhất

| Trước đây | 0.5.0 |
|---|---|
| Cửa sổ Lilith + một cửa sổ 「Bàn làm việc hệ thống / Thiết bị đầu cuối」 khác, phải chuyển qua chuyển lại | Chỉ có một cửa sổ duy nhất là 「Thiết Bị Đầu Cuối Chư Thiên」. Các trang Lilith trước đây (Bàn làm việc, Hồ sơ ký ức, Kho quy tắc, Kết nối, Trạng thái vận hành, Trò chuyện riêng) và các trang hệ thống nằm chung trong cùng một thanh điều hướng |
| Hai lối vào (Ảnh đại diện Lilith + Nút thiết bị đầu cuối) | Một lối vào: Ảnh đại diện Lilith. Cũng có thể dùng Alt+Z, `/zt`, nhãn nhỏ trên tầng, hoặc nút 「Mở Thiết Bị Đầu Cuối Chư Thiên」 trong cài đặt tiện ích mở rộng |
| Một danh sách dài các công tắc trong ngăn kéo cài đặt tiện ích mở rộng | Ngăn kéo chỉ giữ lại 「Mở Thiết Bị Đầu Cuối Chư Thiên」 và 「Khôi phục khẩn cấp bản cũ」. **Tất cả công tắc và công cụ đều nằm ở trang 「Cài đặt」 của thiết bị đầu cuối** |

Các nhóm điều hướng cố định, chuyển trang không làm thay đổi vị trí:
- **Hệ thống**: Tổng quan · Nhiệm vụ · Gắn kết · Tu hành
- **Giao dịch**: Thương thành · Túi đồ
- **Năng lực**: Ngoại quải · Thần thông
- **Lilith**: Bàn làm việc · Ký ức · Quy tắc
- **Thiết bị đầu cuối**: Kết nối · Trạng thái · Cài đặt

Thanh đỉnh thường trực: Thế giới hiện tại, Điểm Hệ Thống, năm loại tài nguyên độc quyền, cấp độ thương thành, đọc trực tiếp từ sổ cái.

### Đóng cửa sổ

Bốn cách dưới đây đều sẽ **đóng toàn bộ cửa sổ chỉ trong một lần**, kèm hiệu ứng mờ dần; tiêu điểm quay về vị trí trước khi mở, cuộc trò chuyện không bị cuộn:
- Nút ✕ ở góc trên bên phải;
- Phím Esc (tiêu điểm nằm ở bất kỳ đâu trong thiết bị đầu cuối đều được; nếu hộp thoại của chính SillyTavern đang mở, nhấn Esc sẽ đóng hộp thoại trước);
- Bấm ra bên ngoài thiết bị đầu cuối (cài đặt: Chỉ điện thoại / Luôn luôn / Không bao giờ, mặc định là Chỉ điện thoại);
- Cử chỉ vuốt quay lại trên điện thoại (có thể tắt).

Khi mở lại sẽ quay về đúng trang của lần trước.

## Tầng trò chuyện không còn hiển thị thanh trạng thái

- Khối dữ liệu `<ZhuTianPanel>` vẫn do động cơ nguyên bản ghi sổ như bình thường (`ztApplyPanel` nguyên bản, cùng một `面板账本`, không bị ghi sổ lặp lại). Vị trí ghi sổ được chuyển từ “thanh trạng thái trong tầng mới nhất” sang “động cơ bên trong thiết bị đầu cuối”.
- Trong tầng chỉ để lại một nhãn nhỏ 「✧ Hệ thống đã ghi nhận · Điểm Hệ Thống … · Nhiệm vụ … · Xem ›」, bấm vào đó sẽ mở Tổng quan thiết bị đầu cuối. Nhãn nhỏ này có thể tắt trong cài đặt.
- Khung thoại Lilith vẫn hiển thị bình thường (vẫn có thể bật/tắt).
- Khi cần kiểu hiển thị cũ: Cài đặt → 「Khối dữ liệu hệ thống trong tầng trò chuyện」 → 「Tương thích: Vẫn hiển thị thanh trạng thái nguyên bản trong tầng」. Toàn bộ hành vi của bản 0.4.0 (thẻ rút gọn, độ sâu hiển thị) được giữ nguyên ở chế độ tương thích.

## 8 trang nguyên bản nằm trong thiết bị đầu cuối

Bên trong thiết bị đầu cuối nhúng **chính động cơ thanh trạng thái 3.1 nguyên bản** (cùng bộ part1/part2/part3), gắn kết với tầng mới nhất có khối dữ liệu:
- Thanh tiêu đề và nhãn phân trang nguyên bản được ẩn đi, chuyển sang điều khiển bằng thanh điều hướng của thiết bị đầu cuối;
- Bảng màu đổi sang chủ đề màu tím của thiết bị đầu cuối (chỉ đổi các biến CSS);
- Tất cả các nút bấm, giỏ hàng, quyết toán, rút thẻ, ước nguyện, thu hồi, túi đồ, ngoại quải, thần thông đều do mã nguồn nguyên bản chạy, ghi vào cùng một `诸天系统.*`.

Một số thao tác nguyên bản có cơ chế “ghi một đoạn thao tác hệ thống vào ô nhập liệu trò chuyện để bạn gửi cho AI diễn dịch” (quyết toán giỏ hàng, bế quan, sử dụng vật phẩm, giải tán đả thủ). Khi thiết bị đầu cuối đang mở thì ô nhập liệu bị che khuất, nên hiện tại sau khi ghi xong, thiết bị đầu cuối sẽ hiện thông báo 「Đã ghi vào ô nhập trò chuyện」 kèm nút 「Đóng thiết bị đầu cuối để gửi」: đóng cửa sổ, đặt tiêu điểm vào ô nhập liệu và giữ nguyên văn bản.

## Quản lý ngoại quải + Ngoại quải tự tạo

Đầu trang 「Ngoại quải」 thêm mới một lối vào 「Quản lý ngoại quải ›」.

**Bật/tắt 6 ngoại quải nguyên bản theo từng cuộc trò chuyện** (Túi Vô Hạn, Đả Thủ Chư Thiên, Con Mắt Động Sát, Phái Cử Phân Thân, Động Thiên Tùy Thân, Lò Nung Vạn Vật):
- Ngoại quải đã tắt sẽ ẩn đi trong thiết bị đầu cuối và không thể sử dụng;
- Đồng thời báo cho AI biết 「Ký chủ hiện đã tắt: …, không được xuất hiện hoặc sử dụng trong cốt truyện」.

**Ngoại quải tự tạo**:
- Các trường: Tên, Phẩm cấp (Phàm phẩm → Cấm kỵ), Loại (Bị động / Chủ động / Số lần mỗi ngày), Quy tắc, Cái giá phải trả (Không / Điểm Hệ Thống / Tài nguyên độc quyền), Số lượt hồi chiêu;
- Lưu trong kho ngoại quải trên máy (dùng chung cho mọi cuộc trò chuyện), mỗi cuộc trò chuyện tích chọn kích hoạt riêng;
- Có thể xuất ra tệp `.json`, nhập từ tệp `.json` (khi nhập sẽ kiểm tra từng mục, cắt bớt văn bản quá dài, biến macro và thẻ HTML thành văn bản trơ);
- Ngoại quải đang bật sẽ được ghi vào lời nhắc dưới dạng 「Ngoại quải tự tạo Ký chủ đã trang bị」;
- Ngoại quải Chủ động / Số lần mỗi ngày có nút 「Phát động」: **trừ chi phí trước và đọc lại từ sổ cái để xác nhận**, sau đó mới ghi lệnh phát động vào ô nhập liệu; giới hạn số lần mỗi ngày và hồi chiêu do thiết bị đầu cuối thực thi, lưu lại bản ghi 30 lần phát động gần nhất.

## Tranh đứng

- Đã xóa hai tấm tư thế AI (Khoanh tay, Ngồi nghiêng) của bản 0.4.0 vì chúng bị đổi trang phục, không đáp ứng yêu cầu “bắt buộc dùng ảnh gốc”.
- Giữ lại hoạt ảnh phân lớp nguyên bản (giả Live2D) và 8 tấm biến thể biểu cảm.
- Trên máy tính, tranh đứng giữ nguyên tỷ lệ gốc, không còn dải trống hai bên. Trên điện thoại và cửa sổ hẹp chỉ hiển thị tranh đứng ở các trang riêng của Lilith, còn các trang hệ thống nhường toàn bộ chiều cao cho nội dung.

## Các tệp thay đổi

Thêm mới:
- `src/hub.js`: Vỏ thiết bị đầu cuối (điều hướng, thanh đỉnh, nhúng động cơ, cách đóng, thanh thông báo).
- `src/hub-settings.js`: Trang cài đặt.
- `src/hub-plugins.js`: Quản lý ngoại quải và ngoại quải tự tạo.
- `styles/hub.css`: Kiểu dáng thiết bị đầu cuối (bên trong Shadow DOM của cửa sổ Lilith).
- `tests/native_terminal050.py`: Nghiệm thu máy chủ thực tế 0.5.0.
- `tests/terminal050.test.js`: Kiểm thử thuần logic cho mô hình dữ liệu ngoại quải tự tạo, lời nhắc và phán định chế độ tầng.

Sửa đổi: `index.js`, `src/settings.js`, `src/features.js`, `src/statusbar-host.js`, `src/th-bridge.js`, `src/assistant-host.js`, `src/portrait.js`, `src/contracts.js`, `styles/host.css`, `tests/native_replace040.py` (cố định ở chế độ tương thích), `tests/native_guards.py`, `tests/native030.test.js`, `tests/qa/run_matrix.sh`, `package.json`, `package-lock.json`, `manifest.json`, `assets/lilith/variants/PROVENANCE.md`.

Xóa bỏ:
- `src/terminal.js`, `styles/shell.css`, `assets/star-sea.jpg`: Cửa sổ thiết bị đầu cuối thứ hai kiểu cũ.
- `assets/lilith/variants/pose-*.webp`: Hai tấm tư thế bị đổi trang phục.
- `tests/native_acceptance.py`, `native_views.py`, `native_ledger.py`, `native_ledger_guards.py`: Các kịch bản điều khiển giao diện thiết bị đầu cuối cũ đã xóa.
