# Nghiệm thu trình duyệt trên máy chủ thực tế 0.9.1

## Môi trường

- SillyTavern 1.19.0 (cài đặt mới hoàn toàn theo tag chính thức, commit `7e8663cd9c184a550b37238218bdd32c6efc68e9`), thư mục dữ liệu cô lập, **không cài đặt Tavern Helper**;
- Playwright Chromium (headless):
  - Điện thoại: 390×844, `has_touch` + `is_mobile`, UA của Android 14 / Chrome 129, cấp quyền đọc/ghi bộ nhớ tạm (clipboard);
  - Máy tính: 1400×900, chuột;
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1. “Khóa bảo mật” dùng trong kiểm thử là chuỗi giả gán cứng trong `tests/native_v091.py`, sau khi kiểm thử xong sẽ khôi phục lại cấu hình cổng kết nối ban đầu.

**Đợt này chỉ kiểm thử bản 1.19.** Bản 1.16 / 1.17 / 1.18 không chạy; bản 0.9.1 không sửa đổi giao diện máy chủ.

## Kết quả trên máy thật

**Chờ bổ sung.** Sau khi điện thoại Android của người dùng chạy xong 「Tự kiểm tra trên điện thoại thật」 và gửi lại kết quả đã sao chép, sẽ điền vào đây:

| Điện thoại / Trình duyệt | Cách mở SillyTavern | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| (Chờ gửi về) Android | | | |
| iPhone / Safari | — | **Chưa kiểm thử** (không có thiết bị sẵn) | |

## Tổng quan kết quả (1.19, mô phỏng Chromium)

| Bộ kiểm thử | Kết quả |
| --- | --- |
| `native_v091.py` (Mới thêm bản 0.9.1, 35 hạng mục) | 35/35 |
| `native_v090.py` | 24/24 |
| `native_v085.py` | 20/20 |
| `native_v084.py` | 29/29 |
| `native_v083.py` | 13/13 |
| `native_v082.py` | 24/24 (bỏ qua đoạn thẻ nhân vật Tavern Helper: thực thể này không cài Tavern Helper) |
| `native_v081.py` | 20/20 |
| `native_v080.py` | 33/33 |
| `native_group060.py` | 44/44 |
| `native_world070.py` | 40/40 |
| `native_terminal050.py` | 58/58 |
| `native_guards.py` | ✅ Không có lỗi trang, không có yêu cầu mô hình, từ chối gửi trong khi đang tạo phản hồi (`docs/evidence/guards.json`, đã tạo lại cho bản 0.9.1) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) |
| `npm run check` | ✅ (phạm vi kiểm tra thêm mới `diag-report.js`, `device-check.js`) |
| `npm test` | 180/180 (bản 0.9.0 là 164, thêm mới `v091.test.js` và `version.test.js`) |
| `npm run filelist:check` | ✅ |
| Kiểm tra CRLF | ✅ Trong kho lưu trữ không có ký tự CR (`vendor/` vốn đã là LF, byte không đổi, `extract_original.py --check` đạt) |

GitHub Actions (`.github/workflows/ci.yml`) cần đẩy lên GitHub mới chạy lần đầu tiên; bảng trên là kết quả thực thi các lệnh tương đương ở máy cục bộ.

## `native_v091.py` đã kiểm tra những gì

### Sao chép thông tin chẩn đoán (Điện thoại, ngữ cảnh bảo mật)

Trước tiên dùng `saveConfigs()` của chính plugin để ghi một cổng kết nối giả: `https://api.example.com/v1`, Key giả, mô hình `m-test-1`; sau đó in ra một cảnh báo `[诸天]` mang theo Key giả và `https://u:pw@relay.example/v1?key=zzz`. Tiếp theo gọi 「Sao chép thông tin chẩn đoán」 và đọc lại từ bộ nhớ tạm:

| Hạng mục | Kết quả |
| --- | --- |
| Mở đầu bằng tiêu đề thông tin chẩn đoán Thiết Bị Đầu Cuối Chư Thiên, plugin 0.9.1, SillyTavern 1.19.0 | ✅ |
| UA trình duyệt (Android 14), vùng nhìn thấy 390×844, bố cục điện thoại `port` | ✅ |
| Từng hạng mục giao diện máy chủ, cài đặt plugin (`"mobileLayout":"auto"`) | ✅ |
| Dòng cổng AI: `api.example.com · m-test-1` | ✅ |
| Trong lỗi gần đây có cảnh báo này và thông tin nhạy cảm đã được che thành `sk-***` và `https://***@relay.example/v1?***` | ✅ |
| Trong toàn bộ văn bản không có Key giả, không có `pw@`, không có `key=zzz` | ✅ |
| Khi chưa chạy tự kiểm tra thì ghi 「Chưa chạy lần nào」 | ✅ |

### Sao chép thông tin chẩn đoán (Không có ngữ cảnh bảo mật)

Đổi `isSecureContext` thành `false` (tương đương việc điện thoại mở SillyTavern qua `http://192.168.x.x`): đi theo nhánh `execCommand('copy')`, văn bản sao chép ra mở đầu đúng bằng tiêu đề thông tin chẩn đoán ✅.

### Tự kiểm tra trên điện thoại thật (Đi qua một lượt theo đúng cách thao tác của người dùng)

Bàn phím: Chromium headless không có bàn phím ảo trên màn hình, nên giống bản 0.9.0 đã thay `visualViewport` bằng đối tượng có thể điều khiển, sau khi chạm vào ô nhập liệu thì đổi chiều cao khả kiến thành 470 px.

| Bước | Cách làm trong bài kiểm thử | Kết quả (số liệu gốc) |
| --- | --- | --- |
| Môi trường | Tự động | ✅ Màn hình cảm ứng, cửa sổ 390×844 |
| Toàn màn hình | Tự động | ✅ Phủ kín vùng nhìn thấy, vùng nội dung 646 px |
| Các trang | Tự động | ✅ Cả 20 trang đều không tràn màn hình, không cuộn ngang, không có nút quá nhỏ hay ô nhập liệu cỡ chữ nhỏ |
| Nhóm chat + Bàn phím | Chạm vào ô nhập liệu nhóm → chiều cao khả kiến 470 | ✅ Thiết bị đầu cuối cao 470 px, ô nhập liệu ở 416–460, thanh sổ cái ẩn đi |
| Trò chuyện riêng · Toàn màn hình | Tự động mở | ✅ Phủ kín vùng nhìn thấy |
| Trò chuyện riêng · Bàn phím | Chạm vào ô nhập liệu trò chuyện riêng → chiều cao khả kiến 470 | ✅ Ô nhập liệu ở 362–422, phía trên bàn phím |
| Lilith nổi | Tự động | ✅ Đứng ở góc dưới (top 697) |
| Màn hình ngang | Đổi khung nhìn thành 844×390 rồi đổi về 390×844 | ✅ Điều hướng bên trái 77 px, vùng nội dung 250 px |
| Phím quay lại | Trình duyệt lùi lại | ✅ Thiết bị đầu cuối đóng lại, trang SillyTavern vẫn còn, tiện ích mở rộng vẫn đang chạy |

Ngoài ra:

| Hạng mục | Kết quả |
| --- | --- |
| Dòng đầu tiên của kết quả `✅ 9 · ⚠ 0 · ❌ 0 · Bỏ qua 0`, được lưu trong `settings.deviceCheck` | ✅ |
| Sau khi bấm 「Sao chép kết quả」, nội dung bộ nhớ tạm chính là đoạn kết quả này | ✅ |
| Bấm 「Đóng」 gỡ bỏ thẻ | ✅ |
| Sau đó bấm 「Sao chép thông tin chẩn đoán」 có đính kèm kết quả tự kiểm tra lần trước | ✅ |
| Ở bước đầu tiên cần thao tác, bấm 「Kết thúc tự kiểm tra」: kết quả ghi 「Đã kết thúc thủ công」, không có ❌ | ✅ |
| Chế độ cửa sổ nổi + 「Đóng khi bấm ra ngoài thiết bị đầu cuối = Luôn luôn」: bấm nút trên thẻ bước kiểm tra, nút có hiệu lực và thiết bị đầu cuối không bị đóng | ✅ |
| Bàn phím làm lùn cả trang: sau khi đặt tiêu điểm vào ô nhập liệu nhóm, khung nhìn đổi từ 844→470 (`visualViewport` đổi theo) → `kbMode = 'resize'`, thiết bị đầu cuối cao 470 px, thanh sổ cái ẩn đi, đáy ô nhập liệu ở 460 | ✅ |
| Sau khi mất tiêu điểm và khôi phục về 844 → xóa trạng thái bàn phím, thiết bị đầu cuối trở lại 844 px | ✅ |
| Cả hai đoạn trên điện thoại đều không có lỗi trang | ✅ |

Ảnh chụp màn hình: `/var/tmp/qa/shots091/v091-selftest-step.png` (thẻ bước 4), `v091-selftest-done.png` (kết quả). Kiểm tra ảnh thủ công: thẻ nằm ở trên cùng, không che ô nhập liệu; danh sách kết quả, ô văn bản và ba nút hiển thị đầy đủ trong chiều rộng 390. Ảnh chụp không đưa vào `docs/evidence/` (theo quyết định bản này không chạm tới thư mục bằng chứng).

### Máy tính (1400×900, chuột)

| Hạng mục | Kết quả |
| --- | --- |
| Hộp thoại Chẩn đoán tương thích có hai nút 「Sao chép thông tin chẩn đoán」 và 「Tự kiểm tra trên điện thoại thật」 | ✅ |
| Trang Cài đặt có hai mục `copy-diag` và `selftest` | ✅ |
| Không có lỗi trang | ✅ |

## Kiểm thử đơn vị mới thêm (`tests/v091.test.js`, `tests/version.test.js`)

- `redact`: `sk-`, `AIza`, `Bearer`, `"apiKey":… / token=`, tài khoản/mật khẩu trong URL, tham số truy vấn đều được che đi; URL thông thường, mã băm commit, chữ tiếng Trung/Việt và con số được giữ nguyên;
- `settingsSnapshot`: không xuất biến kịch bản, bản ghi tiếp quản, vị trí cửa sổ nổi, các danh sách chuyển thành số lượng mục;
- `endpointText`: chỉ có tên máy chủ + mô hình; API chính của SillyTavern; chưa cài đặt; không thể phân tích;
- `ErrorLog`: chỉ thu thập nhật ký bắt đầu bằng `[诸天` / `[Chư Thiên` (các nhật ký khác vẫn xuất ra bảng điều khiển như bình thường), vượt quá giới hạn sẽ bỏ mục cũ nhất (mặc định 30, kiểm thử dùng 3), Key trong thông báo lỗi được che đi, sau khi `dispose()` sẽ khôi phục lại `console`;
- `keyboardState`: `visualViewport` thu nhỏ, cả trang thấp đi + đang có tiêu điểm, xoay màn hình (không có tiêu điểm) không tính là bàn phím;
- `buildReport`: đầy đủ các phần, toàn văn không có Key, khi một phần đọc thất bại sẽ ghi 「Đọc thất bại」 chứ không làm hỏng cả báo cáo;
- `summarize`, `fillsView`;
- Trang Cài đặt, Chẩn đoán tương thích, lệnh gạch chéo đều đã được đấu nối; `.gitattributes`, quy trình CI, `tools/filelist.py` tồn tại và có nội dung chính xác;
- Phiên bản: contracts / manifest / package.json / hai nơi trong package-lock = 0.9.1; phần mở đầu và tiểu mục trong README, tiêu đề ma trận tính năng, CHANGES, ACCEPTANCE.

## Chưa xác minh

- **Điện thoại thực tế**: Kết quả Android chờ người dùng gửi về; iPhone, màn hình nhỏ rộng 360, trình duyệt bọc vỏ (wrapper) / Termux chưa kiểm thử.
- Thay đổi chiều cao của bộ gõ thực tế (thanh từ gợi ý, bàn phím bên thứ ba, bàn phím nổi).
- Hành vi `execCommand('copy')` của trình duyệt điện thoại thực tế dưới kết nối không phải HTTPS (mức độ hỗ trợ của từng trình duyệt khác nhau; khi thất bại sẽ bật ô văn bản để sao chép thủ công).
- Bản 1.16 / 1.17 / 1.18.
- Lần chạy đầu tiên của GitHub Actions trên GitHub.
