# Nghiệm thu trình duyệt trên máy chủ thực tế 0.3.0

## Môi trường

- Bốn thực thể SillyTavern cô lập, đều được cài đặt từ kho lưu trữ chính thức; tiện ích mở rộng được tải thông qua liên kết tượng trưng (symlink) tại `public/scripts/extensions/third-party/`:

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.17.0 | `e3f41666c69db032e17e079fcddcf40cf47e8593` |
| 1.18.0 | `51ad27fb86d39a3daca3adaa970375c9670c12df` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

- Trình duyệt: Playwright Chromium (headless, swiftshader, 1400×950), **không có GPU thật**.
- Dữ liệu: Chỉ dùng một thẻ nhân vật kiểm thử ghi rõ “Nghiệm thu cô lập” và tầng kiểm thử `<ZhuTianPanel>` do chương trình tạo ra. **Không có bất kỳ thông tin xác thực API nào, cũng không phát đi bất kỳ yêu cầu mô hình nào.**
- Không cài đặt Tavern Helper, không cài đặt kịch bản biểu thức chính quy (regex).
- Thư mục dữ liệu hoàn toàn mới sẽ bật hướng dẫn khởi động lần đầu (chọn ngôn ngữ) trước tiên, làm chặn `APP_READY`. Kịch bản nghiệm thu tự động bấm đóng hộp thoại hướng dẫn này, đây không phải hành vi của tiện ích mở rộng.

## I. Khởi động & Cốt lõi (smoke, cả bốn phiên bản đều PASS)

| Hạng mục kiểm tra | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| Mức độ hỗ trợ `supported` và `tested` | ✅ | ✅ | ✅ | ✅ |
| Phương thức khởi động | Tự khởi động (không hook) | activate | activate | activate |
| Hạng mục năng lực thất bại | Không | Không | Không | Không |
| Thanh trạng thái nguyên bản: cầu nối gốc, sẵn sàng, 8 trang, văn bản phát báo, văn bản bảng gốc đã ẩn | ✅ | ✅ | ✅ | ✅ |
| Sổ cái: `诸天系统.系统点` trong bộ nhớ và trên đĩa đều là 1200 | ✅ | ✅ | ✅ | ✅ |
| Văn bản HUD | ✅ | ✅ | ✅ | ✅ |
| Lilith nguyên bản khởi động đầy đủ (dòng trạng thái không chứa “Chưa khởi động”, `.zt-stage` đã gắn kết) | ✅ | ✅ | ✅ | ✅ |
| `{{zt_points}}\|{{zt_task}}` bung thành `1200\|Sơ nhập Tiên Vực` | ✅ | ✅ | ✅ | ✅ |
| `/zt points`, `/zhutian points` trả về 1200 | ✅ | ✅ | ✅ | ✅ |
| `/zt diag` bật bảng chẩn đoán | ✅ | ✅ | ✅ | ✅ |
| Sửa đổi lồng nhau trong cài đặt ghi vào `extensionSettings` rồi đọc lại được (1.37) | ✅ | ✅ | ✅ | ✅ |
| Cài đặt Sách Thế Giới (35 mục) và gắn kết làm Sách Thế Giới trò chuyện | ✅ | ✅ | ✅ | ✅ |
| `initChat` lũy đẳng trên sổ cái đã tồn tại | ✅ | ✅ | ✅ | ✅ |
| Alt+Z / Alt+X / Alt+S | ✅ | ✅ | ✅ | ✅ |
| Cảnh báo `[DEPRECATED]` do tiện ích mở rộng này tạo ra | 3 mục (1.16 mặc định tắt động cơ macro mới, chỉ có thể đăng ký mục macro cũ) | 0 | 0 | 0 |

- Trên bản 1.16 ngoài ra còn có 8 cảnh báo ngừng sử dụng đến từ các mô-đun authors-note, memory, stable-diffusion có sẵn của SillyTavern, không liên quan tới tiện ích mở rộng này.
- Tắt rồi bật lại `experimental_macro_engine` khi đang chạy (1.19): ở cả hai trạng thái `{{zt_points}}` đều bung thành 1200.

## II. Tương tác thanh trạng thái (1.19)

Bấm lần lượt từng trang trong 8 trang, nội dung đều chuyển đổi; chiều cao iframe tự động đổi từ 1045 thành 3045. Các thao tác nguyên bản nhìn thấy được ở từng trang:

- **Thương thành**: Hộp Mù Vạn Giới, Phần thưởng chờ xử lý, Ước Nguyện Vạn Năng, Kho hàng Thương thành, Thu hồi vật phẩm, Rút đơn, Rút 10, Rút 50, Số lượt rút tùy chỉnh, Hỏi giá, Nhập hàng 1 chạm.
- **Ngoại quải**: Túi Vô Hạn, Đả Thủ Chư Thiên, Con Mắt Động Sát, Phái Cử Phân Thân, Động Thiên Tùy Thân, Lò Nung Vạn Vật, Cất vào, Lấy ra, Triệu hồi, Thanh toán và động sát, Thanh toán và phái đi, Gieo hạt giống.
- **Thần thông**: Cài đặt thực lực, Sao Chép Đồ Giám, Viết Lại Trạng Thái, Ngôn Linh Đổi Chữ, AI Đánh giá bậc thực lực, Thanh toán và sao chép, Thanh toán và viết lại, Thanh toán và đổi chữ.
- **Túi đồ**: AI Sắp xếp túi đồ.

Các hành động cần mô hình **không** bấm nghiệm thu trong đợt này (không có thông tin xác thực).

## III. Tranh đứng

### Biến thể AI (Kết quả trên 1.16 / 1.17 / 1.18 / 1.19 hoàn toàn đồng nhất)

- Cả 8 tấm ảnh biểu cảm đều tải xong, tranh đứng nguyên bản ẩn đi.
- Khi chạm vào 8 bộ phận, biến thể AI chuyển đổi theo đúng dòng thời gian biểu cảm nguyên bản:

| Bộ phận | Dòng thời gian |
| --- | --- |
| wing | smile → neutral |
| horn | surprised → pout → neutral |
| tail | surprised → shy → neutral |
| arm | wink → smile → neutral |
| thigh | smile → neutral |
| lower | pout → neutral |
| chest | smug → neutral |
| cheek | shy → neutral |

- Tư thế “Thả tim”: hiển thị phông nền tĩnh và ảnh tư thế, `animation-name` của phông nền tĩnh là `none`.
- Tư thế “Khoanh tay” (thiếu tài nguyên): trả về 404, rơi về lại nhóm biểu cảm, tấm ảnh bị thiếu không giữ trạng thái hiển thị.
- Sau khi chuyển về `rig`, tranh đứng nguyên bản hiển thị trở lại, lớp biến thể được gỡ bỏ.

### Live2D thật (1.16, 1.17, 1.19; mô hình mẫu chính thức Haru, chỉ đặt trong `user/files` của máy chủ kiểm thử)

| Hạng mục kiểm tra | Kết quả |
| --- | --- |
| Sau khi đồng ý giấy phép thì tải Core (bản sao cục bộ) + PixiJS 6.5.10 + cubism4 | ✅ |
| Biểu cảm f00–f07, nhóm chuyển động Idle và Tap, HitArea Head và Body | ✅ |
| Khung vẽ (canvas) thực sự có điểm ảnh (độ lệch chuẩn điểm ảnh vùng chụp khoảng 23–27; khung vẽ trống khoảng 0) | ✅ |
| Mô hình khớp theo chiều cao, căn đáy, trên dưới không bị khoảng trắng | ✅ (ảnh chụp) |
| Bấm vào tâm vùng Head: phát chuyển động Tap | ✅ |
| Bấm vào Head: dòng thời gian biểu cảm shy → neutral; theo ánh xạ shy→f03 chuyển sang f03 rồi quay về f00 | ✅ |
| Sau khi bấm xuất hiện bong bóng thoại nguyên bản | ✅ |
| Đồng bộ khẩu hình: đỉnh `ParamMouthOpenY` đọc được trong khung hình khoảng 0.35–0.49 | ✅ |
| Sau ba lần áp dụng cài đặt liên tiếp chỉ còn lại 1 lớp Live2D và 1 khung vẽ | ✅ |
| Bảng ánh xạ biểu cảm trong bảng cài đặt có 8 dòng, và nhắc có 1 ngữ khí không thể tự động nhận diện (wink) | ✅ |
| Sau khi chuyển về `rig`, thực thể Pixi được hủy, tranh đứng nguyên bản khôi phục | ✅ |

### Xuất PSD phân lớp (1.19)

Sau khi bấm nút xuất sẽ tải xuống `莉莉丝-分层-用于CubismEditor.psd` (636×948, khoảng 8 MB). Phân tích bằng psd-tools: tổng cộng 13 lớp, lần lượt là Phông nền (tĩnh), Cánh trái, Cánh phải, Đuôi, Cơ thể, cùng 8 lớp biểu cảm đang ẩn (blink, smile, shy, surprised, smug, pout, wink, talk). Khung bao (bounding box) và độ trong suốt của từng lớp đều chính xác.

## IV. Hồi quy cuối cùng

Sau khi sửa xong toàn bộ mã nguồn, cả bốn phiên bản chạy lại một lượt smoke, tất cả đều PASS, số lỗi trang là 0; bản 1.16 chạy lại thêm chuyên đề biến thể AI và Live2D, tất cả cũng đều đạt.

## V. Kiểm thử đơn vị và kiểm tra tĩnh

- `npm test`: Toàn bộ 34 hạng mục đều đạt (27 mục cũ, thêm mới 7 mục).
- `npm run check`: Toàn bộ tệp nguồn `node --check` đều đạt; `tools/extract_original.py --check` xác nhận mã băm của năm tệp gốc khớp hoàn toàn.

## VI. Nội dung chưa xác minh

- Toàn bộ tính năng cần mô hình: AI nhập hàng, rút thẻ, ước nguyện, các hành động thanh toán của Thần thông và Ngoại quải, AI sắp xếp túi đồ, chỉnh lý ký ức, trò chuyện riêng, nối tiếp đề xuất, phản hồi dạng luồng (stream).
- Nhánh WebGL của hoạt ảnh phân lớp nguyên bản dưới GPU thật (trình duyệt headless đi theo nhánh tĩnh).
- Chuyên đề Live2D trên bản 1.18, cũng như xuất PSD trên bản 1.16–1.18.
- Thực thi `initChat` trên cuộc trò chuyện trống hoàn toàn mới để tạo sổ cái; quay lui sổ cái; nhập cấu hình trợ lý cũ.
- Bố cục thiết bị di động và màn hình hẹp.
- Nhường quyền khi xung đột (`yield` mode) trong môi trường người dùng hiện có đang cài cả Tavern Helper và biểu thức chính quy cũ.
