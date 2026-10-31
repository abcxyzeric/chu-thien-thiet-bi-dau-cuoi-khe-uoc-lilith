# Bản ghi thay đổi 0.3.0

Cơ sở: `main` @ `a7678dd` (điểm kiểm tra phát triển 0.2.0). Phiên bản này đã chạy nghiệm thu trình duyệt trên bốn máy chủ thực tế cô lập SillyTavern **1.16.0 / 1.17.0 / 1.18.0 / 1.19.0**, kết quả xem tại `docs/ACCEPTANCE-0.3.0.md`.
Những tính năng nào đã di chuyển, những tính năng nào chưa di chuyển đều lấy `docs/FEATURE_MATRIX.md` làm chuẩn; tệp này chỉ ghi lại những gì đã thay đổi.

## 1. Tương thích phiên bản: Chỉ 1.19 → 1.16–1.19

- `manifest.json`: `minimum_client_version` từ 1.19.0 → **1.16.0**.
- Thêm mới `src/compat.js`: phân tích và so sánh phiên bản, mức độ hỗ trợ (Đã nghiệm thu / Cùng nhánh phiên bản / Mới hơn phạm vi nghiệm thu / Quá cũ), dò giao diện máy chủ theo năng lực;
  dùng `import('/script.js')` động để lấy các xuất (export) nội bộ của máy chủ, khi thiếu một export nào đó chỉ tắt tính năng liên quan chứ không làm hỏng quá trình tải toàn bộ tiện ích mở rộng.
- Viết lại `index.js`: từ bản 1.17 trở đi đi theo hook `activate` của manifest; **bản 1.16 không có hook vòng đời tiện ích mở rộng**, lúc này sẽ tự động khởi động (`selfStart`) và ghi nhật ký “Máy chủ không có hook vòng đời tiện ích mở rộng (<1.17), tự động khởi động”.
- Loại bỏ ngưỡng cứng `HOST_VERSION === '1.19.0'` của bản 0.2.0; `contracts.js`, `host-adapter.js`, `ledger-service.js` chuyển sang chạy dựa theo kết quả dò năng lực.
- Macro: động cơ macro mới bật mặc định từ bản 1.17 trở đi đi theo `macros.register`; bản 1.16 mặc định tắt động cơ mới nên đăng ký thêm mục `MacrosParser` cũ; kiểm tra lại khi lưu cài đặt để chuyển đổi công tắc khi đang chạy cũng không làm macro mất hiệu lực.
- `terminal.js`: huy hiệu “Bản phát triển gốc · 0.2.0” đổi sang đọc `VERSION`, chân trang hiển thị phiên bản máy chủ thực tế, không còn gán cứng “SILLYTAVERN 1.19.0”.

## 2. Di chuyển các tính năng chưa di chuyển trước đó

- **Thanh trạng thái v3.1 nguyên bản chạy gốc** (`src/statusbar-host.js` + `src/th-bridge.js`): tiện ích mở rộng gốc trực tiếp kết xuất `<ZhuTianPanel>`, không cần kịch bản biểu thức chính quy, cũng không cần Tavern Helper.
  Cả 8 trang nguyên bản (Cơ bản, Gắn kết, Nhiệm vụ, Vạn Tượng, Thương thành, Túi đồ, Ngoại quải, Thần thông) đều chạy trong iframe bên trong tin nhắn; 7 giao diện Tavern Helper mà nó sử dụng
  (`getVariables`, `replaceVariables`, `updateVariablesWith`, `getLastMessageId`, `getCurrentMessageId`, `generateRaw`, `SillyTavern`)
  đều do cầu nối gốc triển khai và ghi về cùng vị trí `chat_metadata.variables`. Tệp gốc được tạo qua `tools/extract_original.py` và kiểm tra mã băm.
- **Trợ lý Lilith nguyên bản chạy gốc** (`src/assistant-host.js`): trợ lý v1.1 nguyên bản (Bàn làm việc, Hồ sơ ký ức, Kho quy tắc, Cài đặt kết nối, Trạng thái vận hành, Trò chuyện riêng, Khung thoại cốt truyện, Trợ lý sổ cái)
  chạy trên cầu nối gốc, không cần Tavern Helper; cấu hình API, giao diện và khung trò chuyện riêng trong kịch bản trợ lý cũ sẽ được nhập chỉ đọc một lần.
- **Sách Thế Giới ngoại vi** (`features.js`): cài đặt một chạm Sách Thế Giới “Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” (35 quy tắc tích hợp sẵn), có thể gắn kết làm Sách Thế Giới trò chuyện của cuộc trò chuyện hiện tại; khi đã tồn tại Sách Thế Giới cùng tên thì chỉ gắn kết chứ không ghi đè. Không phụ thuộc vào MVU của thẻ nhân vật.
- **Khởi tạo cuộc trò chuyện mới / Di chuyển bản lưu cũ / Quay lui sổ cái**: `/zt init`; báo cáo di chuyển (sổ cái, ký ức, trò chuyện riêng, cấu hình kịch bản cũ, chứng từ quyết toán); tự động sao lưu sổ cái và có thể quay lui về bất kỳ bản nào.
- **Ngăn kéo cài đặt tiện ích mở rộng** (`src/settings.js`): công tắc tổng, chế độ thanh trạng thái, số tầng thời gian thực, HUD, phím tắt, chế độ tranh đứng, v.v.

## 3. Live2D thật & Tranh đứng biến thể AI (`src/portrait.js`)

- Ba chế độ tranh đứng: `rig` (hoạt ảnh tham số phân lớp nguyên bản), `variants` (tranh đứng biến thể AI), `live2d` (Live2D thật).
- **Live2D thật**: PixiJS 6.5.10 + pixi-live2d-display 0.4.0 (`vendor/live2d/`, MIT). Hỗ trợ `.model3.json` của Cubism 3/4/5.
  - Cubism Core là phần mềm độc quyền nên theo giấy phép **không đóng gói sẵn**: chỉ tải sau khi người dùng tích chọn đồng ý Live2D Proprietary Software License, địa chỉ có thể là địa chỉ chính thức hoặc bản sao trong `user/files`.
  - PixiJS được cô lập với các tiện ích mở rộng khác: khôi phục `PIXI` toàn cục của tiện ích khác trước và sau khi tải.
  - Mô hình khớp theo chiều cao, căn đáy, trên dưới không để trống; ánh mắt đi theo con trỏ chuột; thao tác chạm sử dụng HitArea của chính mô hình, phát chuyển động Tap và bong bóng thoại Lilith nguyên bản.
  - Khi chạm sẽ phát trọn vẹn dòng thời gian biểu cảm nguyên bản (ví dụ surprised → pout → neutral), không còn chỉ lấy khung hình cuối cùng.
  - Đồng bộ khẩu hình: khi có âm thanh TTS sẽ điều khiển theo âm lượng, nếu không sẽ tạo đường bao nhịp điệu theo độ dài chính văn và ghi vào `ParamMouthOpenY`.
  - Chuyển động Tap được tải trước; khi gọi lần đầu nếu chỉ đặt lịch mà chưa phát thì tự động thử lại một lần.
  - Khi áp dụng cài đặt liên tiếp sẽ dùng thẻ thế hệ (epoch token) để đảm bảo chỉ giữ lại lần tải mới nhất, không bị chồng hai thực thể Pixi.
  - **Bảng ánh xạ biểu cảm**: với các mô hình có tên biểu cảm không thể tự động nhận diện (ví dụ `f00…f07` hoặc đặt tên bằng ngôn ngữ khác), có thể chỉ định từng ngữ khí trong 8 ngữ khí tương ứng với biểu cảm nào, chọn xong sẽ xem trước ngay trên mô hình và khi lưu không cần tải lại mô hình.
- **Xuất PSD phân lớp** (`src/psd-export.js`): xuất tài nguyên phân lớp của Lilith nguyên bản thành tệp PSD phân lớp thực sự (Phông nền, Cánh trái, Cánh phải, Đuôi, Cơ thể, cộng thêm 8 lớp biểu cảm đang ẩn; RGB 8 bit, tên lớp Unicode),
  có thể mở trực tiếp bằng Cubism Editor, cắt ArtMesh, gắn kết tham số rồi xuất ra `.moc3`. Đây là lộ trình biến tranh đứng nguyên bản thành mô hình Live2D thật; bản thân chương trình không thể tự sinh ra `.moc3` từ hư không.
- **Tranh đứng biến thể AI** (`assets/lilith/variants/`, nguồn gốc xem tại `PROVENANCE.md` bên trong):
  - 7 tấm biến thể biểu cảm AI (Mỉm cười, Thẹn thùng, Dỗi hờn, Kinh ngạc, Nháy mắt, Cười xấu xa, Tủi thân) cộng với ảnh gốc “Bình tĩnh”. Chỉ sửa phần khuôn mặt, sau khi căn chỉnh điểm đặc trưng, khớp màu và làm mềm biên (feathering) thì ghép ngược vào ảnh gốc, các điểm ảnh cơ thể và phông nền khớp hoàn toàn với ảnh gốc; giữa các biểu cảm chuyển cảnh mờ dần trong 1 giây.
  - 1 tấm tư thế AI “Thả tim” (váy dài Gothic, nền trong suốt), xếp chồng lên phông nền tĩnh `plate` nguyên bản đã tách nhân vật, phông nền không chạy bất kỳ hoạt ảnh nào.
  - Hai tư thế “Khoanh tay” và “Ngồi nghiêng” ở bản 0.3.0 chưa tạo tài nguyên, trong cài đặt đánh dấu là “Chờ bổ sung tài nguyên”, khi chọn sẽ tự động quay về tư thế đứng chuẩn.

## 4. Tính năng mới

- **HUD** sổ cái phía trên thanh nhập liệu (Điểm Hệ Thống, Thế giới, Tiền tệ, Nhiệm vụ), bấm vào sẽ mở cửa sổ Lilith.
- **Phím tắt**: Alt+Z mở Lilith, Alt+X mở thiết bị đầu cuối khế ước, Alt+S nhảy tới thanh trạng thái mới nhất.
- **Lệnh gạch chéo** `/zt` (bí danh `/zhutian`): `open|terminal|status|init|world|backup|diag|points|live2d [off]`.
- **Macro**: `{{zt_points}}`, `{{zt_world}}`, `{{zt_task}}`, có thể tham chiếu trực tiếp sổ cái trong lời nhắc hoặc bản mẫu chính văn.
- **Bảng chẩn đoán tương thích** (`/zt diag`): phiên bản máy chủ, mức độ hỗ trợ, trạng thái từng giao diện, chế độ thanh trạng thái, trạng thái vận hành thực tế của trợ lý Lilith (đọc dòng trạng thái của chính bản gốc), chế độ tranh đứng.

## 5. Các vấn đề phát hiện và sửa chữa trong quá trình nghiệm thu trình duyệt

1. **Trợ lý Lilith chưa thực sự khởi động**: Mã gốc kiểm tra `SillyTavern` bên trong iframe Tavern Helper (bản thân nó chính là đối tượng ngữ cảnh), trong khi cầu nối truyền vào không gian tên cấp cao nhất của máy chủ,
   khiến bản gốc báo lỗi thiếu giao diện định danh SillyTavern và dừng ở trạng thái chưa khởi động.
   Hiện đã đổi sang đại diện thời gian thực (`stContextProxy`) luôn lấy `getContext()` mới nhất mỗi lần đọc.
2. **Sửa đổi lồng nhau trong cài đặt tiện ích mở rộng bị mất**: Mỗi lần đọc `Settings.all` đều thay bằng đối tượng nhân bản mới, nên `all[key] = merge(all[key], …)` ghi vào đối tượng đã bị loại bỏ.
   Hiện đã đổi sang điền giá trị mặc định tại chỗ, giữ nguyên định danh đối tượng (có kiểm thử hồi quy).
3. **PSD bị thiếu cánh phải**: Khung cắt cánh dùng tọa độ logic (424×632) trong khi tài nguyên thực tế là 636×948, khiến cánh phải bị cắt rỗng rồi bị loại bỏ. Hiện đã thu phóng khung cắt theo tỷ lệ, xuất đủ 13 lớp và đối chiếu bằng thư viện phân tích độc lập psd-tools.
4. Mô-đun tranh đứng trước đây nhắm vào cấu trúc sân khấu 1.7.1; hiện gắn trực tiếp vào sân khấu phân lớp nguyên bản (`.zt-stage > .zt-media`), khi chạm vào các bộ phận thì biến thể AI sẽ chuyển đổi theo đúng dòng thời gian biểu cảm nguyên bản.

## 6. Kiểm thử & Công cụ

- `tests/native030.test.js`: ngưỡng phiên bản, hồi quy lưu trữ cài đặt, đại diện SillyTavern, hàm phụ trợ Live2D, danh sách biến thể AI, bộ mã hóa PSD, tính đồng nhất số phiên bản ở bốn nơi.
- Kịch bản `check` của `package.json` bao phủ toàn bộ tệp nguồn mới, hai runtime nguyên bản, đồng thời thực thi `tools/extract_original.py --check`.
- `tools/lilith_variants_compose.py`, `tools/lilith_variants_key.py`: kịch bản căn chỉnh ghép ảnh và tách nền cho biến thể AI, có thể tạo lặp lại.
