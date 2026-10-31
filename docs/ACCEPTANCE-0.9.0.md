# Nghiệm thu trình duyệt trên máy chủ thực tế 0.9.0

## Môi trường

- SillyTavern 1.19.0 (cài đặt mới hoàn toàn theo tag chính thức, commit `7e8663cd9c184a550b37238218bdd32c6efc68e9`), thư mục dữ liệu cô lập, **không cài đặt Tavern Helper**;
- Playwright Chromium (headless):
  - Điện thoại: 390×844, 844×390, 360×640, mô phỏng cảm ứng `has_touch` + `is_mobile`;
  - Máy tính: 1400×900, chuột;
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

**Đợt này chỉ kiểm thử bản 1.19.** Bản 1.16 / 1.17 / 1.18 không chạy; bản 0.9.0 chỉ sửa bố cục, CSS và một hook lọc ghi biến kịch bản, không sửa giao diện máy chủ.

## Tổng quan kết quả (1.19)

| Bộ kiểm thử | Kết quả |
| --- | --- |
| `native_v090.py` (Mới thêm bản 0.9.0, 24 hạng mục) | 24/24 |
| `native_v085.py` | 20/20 |
| `native_v084.py` (Gồm điện thoại: bấm trò chuyện riêng 5 lần trong thiết bị đầu cuối) | 29/29 |
| `native_v083.py` (Lilith nổi) | 13/13 |
| `native_v082.py` | 24/24 (bỏ qua đoạn thẻ nhân vật Tavern Helper: thực thể này không cài Tavern Helper) |
| `native_v081.py` | 20/20 |
| `native_v080.py` | 33/33 |
| `native_group060.py` | 44/44 |
| `native_world070.py` | 40/40 |
| `native_terminal050.py` | 58/58 |
| `native_guards.py` | ✅ Không có lỗi trang, không có yêu cầu mô hình, từ chối gửi trong khi đang tạo phản hồi (`docs/evidence/guards.json`) |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) |
| `npm run check` | ✅ (phạm vi kiểm tra thêm mới `mobile.js`, `lilith-float.js`, `wb-unbind.js`, `worldbook.js`) |
| `node --test tests/*.test.js` | 164/164 (bản 0.8.5 là 152, thêm mới `v090.test.js` 12 hạng mục) |
| Kiểm tra manifest tiện ích mở rộng (các trường, sự tồn tại của tệp, `homePage`) | ✅ |

## `native_v090.py` đã kiểm tra những gì

Cách mô phỏng bàn phím: Chromium headless không có bàn phím ảo trên màn hình, nên trước khi tải trang đã thay `window.visualViewport` bằng một đối tượng có thể điều khiển. Khi chiều cao của nó giảm xuống (khung nhìn bố cục không đổi) và phát sự kiện `resize`, biểu hiện hoàn toàn giống với khi trình duyệt điện thoại bật bàn phím ảo.

| Hạng mục | 0.8.5 | 0.9.0 |
| --- | --- | --- |
| Màn hình dọc 390×844, vị trí thiết bị đầu cuối | Cửa sổ nổi, bốn phía cách 8 px | Toàn màn hình `[0,0,390,844]` |
| Màn hình dọc, trước đó ghi nhớ cửa sổ nhỏ 380×354 | Vùng nội dung 148 px | Vẫn toàn màn hình, vùng nội dung 646 px |
| Vùng nội dung màn hình dọc | 548 px | 646 px |
| Vùng nội dung màn hình nhỏ 360×640 | — | 442 px |
| Vùng nội dung màn hình ngang 844×390 | 122 px | 250 px (thanh điều hướng bên trái 77 px) |
| Khi bàn phím bật lên (chiều cao khả kiến 470), nhóm chat | Ô nhập liệu bị che khuất | Thiết bị đầu cuối cao 470, ô nhập liệu ở 416–460 px, thanh sổ cái và dòng trạng thái ẩn đi, vùng lịch sử trò chuyện 128 px |
| Màn hình ngang khi bàn phím bật lên (chiều cao khả kiến 200) | — | Thiết bị đầu cuối cao 200, ô nhập liệu ở 146–190 px, thanh đỉnh ẩn đi |
| Khi thu bàn phím xuống | — | Khôi phục 844 px, thanh sổ cái xuất hiện trở lại |
| Trò chuyện riêng (bấm vào từ thanh đỉnh thiết bị đầu cuối) | Bảng nổi 374×426 | Toàn màn hình `[0,0,390,844]`, phủ lên trên thiết bị đầu cuối |
| Trò chuyện riêng + bàn phím (470) | — | Bảng cao 470, ô nhập liệu nằm trong vùng nhìn thấy, ảnh cận cảnh khuôn mặt ẩn đi |
| Lilith nổi (khi thiết bị đầu cuối đang mở) | Đứng ở giữa vùng nội dung | Ở góc dưới (top 697), màn hình ngang ở bên phải (left 814) |
| Bấm vào lời thoại / cuộn trong thiết bị đầu cuối | Lời thoại vẫn nằm đó | Thu gọn lại |
| Lilith sau khi đóng thiết bị đầu cuối | — | Quay về vị trí cũ (sai số < 40 px) |
| Kích thước cửa sổ ghi nhớ trên máy tính sau cả lượt thao tác trên điện thoại | Bị đổi thành kích thước điện thoại | Giữ nguyên 1000×720 |
| Cài đặt 「Cửa sổ nổi」 | — | Khôi phục cửa sổ nổi 374×380; đổi về 「Tự động」 lại toàn màn hình |
| Máy tính 1400×900 (chuột) | — | Không toàn màn hình, cửa sổ nổi bo góc giống bản 0.8.5 |

Đo đạc cấp trang (tự động kiểm tra từng trang: phần tử không tràn khỏi màn hình, trang không cuộn ngang, nút trên thanh đỉnh / điều hướng / nhóm chat ≥ 36 px, ô nhập liệu ≥ 16 px, kiểm tra cả bên trong iframe của trang động cơ):

- Màn hình dọc 390×844: toàn bộ 20 trang trên thanh điều hướng, không có vấn đề;
- Màn hình ngang 844×390: 6 trang Thương thành, Nhóm chat, Cài đặt, Bàn làm việc, Kết nối, Dòng sự kiện, không có vấn đề;
- Màn hình nhỏ 360×640: 7 trang Tổng quan, Thương thành, Ngoại quải, Nhóm chat, Cài đặt, Kết nối, Quản lý ngoại quải, không có vấn đề.

Cả ba kích thước đều không có lỗi trang.

Ảnh chụp màn hình (không đưa vào commit, được tạo trong thư mục `--shots` khi chạy kiểm thử): Tổng quan dọc, bàn phím dọc, trò chuyện riêng dọc, bàn phím trò chuyện riêng, Tổng quan ngang, Nhóm chat ngang, Thương thành màn hình nhỏ.

## Các vấn đề phát hiện và sửa chữa trong quá trình kiểm thử

1. **Phiên làm việc trên điện thoại làm thay đổi kích thước cửa sổ trên máy tính (tồn tại từ bản 0.8.5).** Ở lượt kiểm thử đầu tiên, khi bộ kiểm thử máy tính mở thiết bị đầu cuối sau bộ kiểm thử điện thoại, cửa sổ chỉ còn 380×380: trình quản lý cửa sổ nguyên bản đã lưu kích thước cửa sổ trên điện thoại vào chung một bản tùy chọn. Cách sửa là thêm bộ lọc ghi ở tầng cầu nối: khi phiên toàn màn hình ghi dữ liệu sẽ giữ nguyên kích thước `window` ban đầu. `native_v090.py` đã bổ sung một hạng mục tương ứng (ghi 1000×720 trước, sau cả lượt thao tác điện thoại thì đọc lại).
2. **Trò chuyện riêng vẫn là bảng nhỏ.** Ở lượt đầu tiên, trò chuyện riêng phủ lên trên thiết bị đầu cuối toàn màn hình nhưng chỉ có kích thước 374×426, vùng lịch sử trò chuyện chỉ còn lại một khe hẹp. Trò chuyện riêng và thiết bị đầu cuối nằm trong cùng một shadow root, nên đã ghi biến vùng nhìn thấy lên phần tử máy chủ cùng lúc và chuyển cả trò chuyện riêng sang toàn màn hình.
3. **Khi xoay ngang, Lilith nổi che mất biểu tượng của thanh điều hướng bên trái.** Khi xoay ngang đã đổi sang neo cố định ở bên phải.
4. **Khi ở chế độ toàn màn hình, phía trên cùng vẫn hiển thị gợi ý 「Kéo cửa sổ」 và nhãn nhỏ số phiên bản.** Đã ẩn đi (màn hình ngang vẫn giữ số phiên bản).
5. **Bài kiểm thử phiên bản chỉ chấp nhận 0.8.x.** Khẳng định của `v083` / `v084` là `0.8.[3-9]`, nên khi nâng cấp lên 0.9.0 sẽ báo lỗi giả. Đã đổi thành 「≥ phiên bản đó và đồng nhất ở mọi nơi」.

## Chưa xác minh

- **Điện thoại thực tế**:
  - iOS Safari: chiều cao thực tế của bộ gõ và thanh gợi ý từ, `env(safe-area-inset-*)`, cuộn nảy (bounce scroll), menu nhấn giữ;
  - Android Chrome / WebView: phím quay lại, chia đôi màn hình, màn hình gập.
- **1.16 / 1.17 / 1.18**: Đợt này không chạy.
- **Lớp bật lên bên trong trang động cơ** (kết quả rút thẻ, chi tiết vật phẩm): mới chỉ kiểm tra tràn khung và cỡ chữ, chưa thao tác khi bàn phím đang bật lên.
- **Máy tính bảng**: Theo thiết kế vẫn dùng cửa sổ nổi, chưa kiểm thử riêng.
- Toàn bộ chuỗi AI vẫn chỉ dùng mô hình mô phỏng (giống 0.8.x).
