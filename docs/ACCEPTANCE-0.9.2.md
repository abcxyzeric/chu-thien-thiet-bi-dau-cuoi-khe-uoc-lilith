# Nghiệm thu trình duyệt trên máy chủ thực tế 0.9.2

## Môi trường

- SillyTavern 1.19.0 (cài đặt mới hoàn toàn theo tag chính thức, commit `7e8663cd9c184a550b37238218bdd32c6efc68e9`), thư mục dữ liệu cô lập;
- Hai lượt:
  - **Có cài đặt Tavern Helper** (JS-Slash-Runner 4.11.2, kho lưu trữ GitHub chính thức, không chỉnh sửa) — chạy toàn bộ các bộ kiểm thử;
  - **Không cài đặt Tavern Helper** — chạy các bộ kiểm thử liên quan tới kết xuất tầng (`native_v092`, `native_v084`, `native_v082`, `native_terminal050`);
- Playwright Chromium (headless), mô phỏng cảm ứng điện thoại 390×844 (UA Android 14 / Chrome);
- Mô hình mô phỏng: cổng 5001 thông thường, cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1. **Không cài đặt MVU**: tiện ích mở rộng biến số trong ảnh chụp màn hình được mô phỏng theo cách “nối thêm khối cập nhật mà không vẽ lại tầng”; việc tô sáng từ khóa cũng được mô phỏng vì không rõ trên máy thật cụ thể là tiện ích mở rộng nào.

## Kiểm thử lại trên máy thật

**Chờ bổ sung.** Vui lòng cập nhật lên bản 0.9.2 rồi mở lại đoạn trò chuyện từng gặp lỗi để kiểm tra:

- Lời thoại 【Lilith】 chỉ còn lại khung thoại;
- Trong tầng không còn nguyên văn `系统点: … / 好感度: …`;
- Ở những tầng có thanh trạng thái thẻ nhân vật, vị trí của khung thoại khớp với thứ tự viết trong tin nhắn.

## Tái hiện: So sánh 0.9.1 và 0.9.2 (`native_v092.py`)

| Kịch bản (dựng theo ảnh chụp màn hình máy thật) | 0.9.1 | 0.9.2 |
| --- | --- | --- |
| A Tiện ích tô sáng từ khóa sửa đoạn văn lời thoại trước khi plugin xử lý | ❌ Nguyên văn + khung thoại mỗi thứ một bản | ✅ Chỉ có khung thoại, vị trí không đổi; phần tô sáng ở các đoạn văn khác được giữ nguyên |
| B Tin nhắn sau khi SillyTavern vẽ xong bị nối thêm khối cập nhật (không vẽ lại) | ❌ Lời thoại bị nhân đôi + lộ nguyên văn 3 dòng `系统点/子系统/好感度` | ✅ Chỉ có khung thoại và nhãn 「Hệ thống đã ghi nhận」 |
| C Trong mã thẻ giao diện có chứa `莉莉丝：…` | ✅ | ✅ Mã giữ nguyên, chỉ có câu trong chính văn mới trở thành khung thoại |
| E Lời thoại → Thẻ giao diện (bộ kết xuất mô phỏng) → Lời thoại | ❌ `Lời thoại nguyên văn → Thẻ giao diện → Khung thoại → Khung thoại`, sau khi kết xuất lại còn làm lộ mã nguồn thô | ✅ `Khung thoại → Thẻ giao diện → Khung thoại → Nhãn nhỏ`, sau khi kết xuất lại không thay đổi |
| D Giống trên, nhưng đổi thành iframe thanh trạng thái của **Tavern Helper 4.11.2 thực tế** | ❌ Giống E (chính là ảnh chụp 4: khung thoại nằm dưới thanh trạng thái, còn nguyên văn nằm ở trên) | ✅ Thứ tự chính xác, sau khi kết xuất lại không thay đổi |
| Plugin kết xuất lại toàn bộ / tải lại cuộc trò chuyện (tô sáng và thẻ giao diện thực thi lại) | ❌ Vẫn bị lặp | ✅ |

Bản 0.9.1 thất bại 10 trên 17 hạng mục, còn bản 0.9.2 đạt toàn bộ (khi không cài Tavern Helper thì 3 hạng mục của D được bỏ qua, đạt 14/14).

Ảnh chụp màn hình (không đưa vào `docs/evidence/`): `/var/tmp/qa/shots092th/v092-D-tavern-helper.png`, `v092-A-highlighter.png`. Kiểm tra ảnh thủ công: thứ tự thẻ khớp với tin nhắn, không bị lặp nguyên văn.

## Tổng quan kết quả (1.19)

| Bộ kiểm thử | Có cài Tavern Helper | Không cài Tavern Helper |
| --- | --- | --- |
| `native_v092.py` (Mới thêm bản 0.9.2) | 17/17 | 14/14 (bỏ qua D) |
| `native_v091.py` | 35/35 | — |
| `native_v090.py` | 24/24 | — |
| `native_v085.py` | 20/20 | — |
| `native_v084.py` (Tương thích làm đẹp 0.8.4) | 29/29 | 29/29 |
| `native_v083.py` | 13/13 | — |
| `native_v082.py` (Thanh trạng thái thẻ nhân vật) | **25/25** (gồm đoạn Tavern Helper thực tế) | 24/24 (bỏ qua đoạn đó) |
| `native_v081.py` | 20/20 | — |
| `native_v080.py` | 33/33 | — |
| `native_group060.py` | 44/44 | — |
| `native_world070.py` | 40/40 | — |
| `native_terminal050.py` | 58/58 | 58/58 |
| `native_guards.py` | ✅ (`docs/evidence/guards.json` tạo lại cho bản 0.9.2) | — |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | |
| `npm run check` | ✅ | |
| `npm test` | 186/186 (bản 0.9.1 là 180, thêm mới `v092.test.js` 6 hạng mục) | |
| `npm run filelist:check` | ✅ | |

## Chưa xác minh

- Kiểm thử lại trên máy thật (xem ở trên).
- Cách triển khai thực tế của tiện ích tô sáng từ khóa trên máy thật và cách viết lại của MVU thực tế: được tái hiện bằng mô phỏng, quy tắc phán đoán không phụ thuộc vào tiện ích mở rộng cụ thể.
- Khi tiện ích mở rộng làm đẹp sửa đổi đoạn văn có chứa lời thoại / khối dữ liệu **trước khi** plugin xử lý, phần làm đẹp của đoạn đó sẽ bị thay thế bằng phiên bản của plugin (thiết kế có chủ đích, xem CHANGES).
- Bản 1.16 / 1.17 / 1.18 đợt này không chạy.
