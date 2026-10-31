# Nghiệm thu trình duyệt trên máy chủ thực tế 0.6.0

## Môi trường

Giống với [0.5.0](ACCEPTANCE-0.5.0.md): bốn thực thể SillyTavern dùng một lần (cài đặt mới hoàn toàn theo tag từ kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng), Playwright Chromium headless + swiftshader, mô hình mô phỏng cục bộ `tests/qa/mock_model.py`, không sử dụng bất kỳ khóa thực tế hay bản lưu người dùng nào.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.17.0 | `e3f41666c69db032e17e079fcddcf40cf47e8593` |
| 1.18.0 | `51ad27fb86d39a3daca3adaa970375c9670c12df` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.17 | 1.18 | 1.19 |
| --- | --- | --- | --- | --- |
| `native_group060.py` (Nhóm chat 0.6.0, 44 hạng mục) | 44/44 | 44/44 | 44/44 | 44/44 |
| `native_terminal050.py` (Hồi quy thiết bị đầu cuối 0.5.0, 58 hạng mục) | 58/58 | 58/58 | 58/58 | 58/58 |
| `native_replace040.py` (Thay thế toàn diện v1.1, chế độ tương thích, 70 hạng mục) | 70/70 | 70/70 | 70/70 | 70/70 |
| `native_guards.py` (Bảo vệ gửi tin) | ✅ | ✅ | ✅ | ✅ |
| `node --test tests/*.test.js` (Thuần logic, không phụ thuộc phiên bản máy chủ) | 67/67 | 67/67 | 67/67 | 67/67 |

## Các hạng mục bao phủ của `native_group060.py`

**Lối vào & Chiêu mộ**
- Trong nhóm điều hướng 「Vạn Giới」 của thiết bị đầu cuối có mục 「Nhóm chat」; trang nhóm trống hướng dẫn cách bắt đầu.
- Lệnh Chiêu Mộ trừ 200 điểm, thẻ nhân vật do mô hình đưa ra (Tên/Thế giới/Bậc thực lực/Tính cách/Đặc sản) được phân tích; chiêu mộ chỉ định thế giới hoạt động tốt.
- Mời vào nhóm thu phí vào nhóm theo bậc thực lực (Võ đạo tông sư 10.000, Cấp thành phố 1.000.000), đọc lại sổ cái để đối chiếu; thành viên thứ ba vào nhóm.

**Trò chuyện nhóm**
- Ký chủ gửi 1 tin = yêu cầu mô hình 1 lần; trong yêu cầu mang theo danh sách thành viên, nội quy nhóm và giới hạn phẩm giai.
- Từ 1–6 thành viên trả lời, lời nói của người không ở trong nhóm bị loại bỏ.

**Lì xì & Quà tặng (toàn bộ đều ghi sổ trước, đọc lại xác nhận rồi mới hiện thông báo)**
- Thành viên phát lì xì Điểm Hệ Thống (3.000 · 3 phần); lì xì vật phẩm vượt quá cấp độ thương thành sẽ tự động hạ xuống phẩm giai cao nhất được phép (Tiên phẩm → Linh phẩm, Thương thành Lv2); quà tặng Thần phẩm → Linh phẩm đi vào mục 「Chờ nhận」.
- Giật lì xì: phần chia được ghi vào Điểm Hệ Thống và đọc lại xong mới báo 「Đã nhập kho」; các thành viên khác giật hết phần còn lại; sau khi đã giật không còn hiển thị nút 「Giật」.
- Lì xì vật phẩm vào túi đồ mang theo nguồn gốc 「Bạch Thiển@Thanh Khâu」; nhận quà tặng đưa vào túi đồ và xóa khỏi danh sách chờ nhận.
- Ký chủ phát lì xì Điểm Hệ Thống trừ 1.000, độ hảo cảm của thành viên nhóm tăng lên; phát lì xì vật phẩm làm 2 cây Linh Thảo rời khỏi túi đồ.

**Công việc nhóm**
- Điểm danh (100×chuỗi liên tiếp + 10×thành viên) vào sổ, nút điểm danh trong ngày bị vô hiệu hóa.
- Cầu viện tạo ra nhiệm vụ 「Chờ nhận」 đi vào `任务库`, nhìn thấy được ở trang Nhiệm vụ.
- Phát sóng trực tiếp nhóm, trò chuyện riêng (lưu cả lời của Ký chủ lẫn thành viên), cấm chat (mô hình được thông báo), trục xuất, đặt làm quản trị viên, thông báo nhóm.
- Giáng lâm: trừ phí bằng 1/10 giá bậc thực lực, tiêm lời nhắc vào cốt truyện, kết thúc sau 3 lần phản hồi cốt truyện.
- Chợ nhóm: mỗi thành viên treo bán một món và không vượt quá giới hạn phẩm giai; mua xong trừ điểm đưa vào túi đồ kèm nguồn gốc; đơn treo bán vượt quá 130% định giá gốc bị từ chối; rút đơn hoàn trả vật phẩm; treo bán theo định giá thu về +300.
- Mở rộng nhóm từ 5 → 10 người trừ 10.000.
- Tóm tắt nhóm (thành viên + trò chuyện gần đây) tiêm vào cốt truyện, có thể tắt; sau mỗi lượt cốt truyện tự động tán gẫu một lần (có thể tắt).
- Thanh đỉnh, tiêu đề trang nhóm và `商城等级` trong sổ cái khớp nhau ở cả ba nơi (Lv2); sau khi làm mới trang, dữ liệu nhóm vẫn còn nguyên (biến trò chuyện).

**Điện thoại (390×800)**
- Lịch sử trò chuyện và ô nhập liệu đều nằm gọn trong màn hình; không có lỗi trang.

## Ảnh chụp màn hình

`docs/evidence/g060-chat.png` (trò chuyện nhóm trên máy tính: lì xì, quà tặng bị hạ cấp theo nội quy nhóm, thanh chờ nhận), `g060-chat-end.png`, `g060-members.png`, `g060-market.png`, `g060-mobile.png`.

## Ranh giới đã biết

- **Mô hình thực tế**: Vẫn chưa xác minh, đầu ra mô hình cho trò chuyện nhóm, chiêu mộ, lì xì mới chỉ chạy với mô hình mô phỏng; khi mô hình thực tế không xuất đúng định dạng, lì xì/quà tặng tương ứng sẽ bị bỏ qua chứ không ghi sổ.
- **Trò chuyện nhóm của SillyTavern (ST group chat)**: Chưa kiểm thử, Nhóm chat Chư Thiên chỉ sử dụng trong cuộc trò chuyện đơn nhân vật.
- **Nhãn chứng từ tầng bản cũ 0.4.0**, **Phản hồi xúc giác**: Giống bản 0.5.0.
