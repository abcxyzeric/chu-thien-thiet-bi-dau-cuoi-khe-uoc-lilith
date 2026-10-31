# Bản ghi nghiệm thu 1.1.3

Môi trường:
- SillyTavern 1.19.0 cô lập dùng một lần (`tests/qa/setup_isolated_st.py`) + mô hình mô phỏng tất định.
- Hạng mục điện thoại dùng **mô phỏng thiết bị Pixel 7** của Playwright (412×839, màn hình cảm ứng, `pointer: coarse`).
- **Không phải** điện thoại vật lý, cũng **không phải** nghiệm thu bằng mô hình thực tế.

## Kiểm tra tĩnh & Kiểm thử đơn vị

| Hạng mục | Kết quả |
|---|---|
| `npm run check` | Đạt (dựng lại runtime, mã băm nguồn đồng nhất) |
| `npm test` | 410/410 |
| `npm run filelist:check` | 279 tệp, đồng nhất |
| `tests/v113.test.js` (mới) | 7 hạng mục đạt: bốn chế độ, khi đóng cũng ẩn cả ảnh đại diện, hỏi xác nhận trước khi đóng, hai mục tiêu kéo thả, kích thước 20%, lối vào trong Cài đặt và bảng tiện ích mở rộng, nút × không làm thay đổi cài đặt cửa sổ nổi |
| `tests/v112.test.js` | Đổi sang khẳng định 「Gộp cổ điển gửi 1 yêu cầu cho cả lượt, giới hạn đầu ra tăng theo số lượng món」, và thêm mới 1 hạng mục tính giới hạn trần |

## Trình duyệt (`tests/native_v113.py`, 34/34)

Điện thoại (mô phỏng Pixel 7):

1. Mặc định (Tự động): Lilith nổi hiển thị, ảnh đại diện ẩn đi.
2. Kéo Lilith: dưới đáy màn hình xuất hiện hai mục tiêu 「Kéo vào đây để đổi thành ảnh đại diện」 và 「Kéo vào đây để đóng cửa sổ nổi」, khi di qua chỉ làm sáng mục tiêu tương ứng.
3. Thả vào 「Đổi thành ảnh đại diện」: `floatLilith=off`, Lilith biến mất, ảnh đại diện xuất hiện (là chuyển đổi chứ không phải đóng).
4. Kéo ảnh đại diện: xuất hiện 「Kéo vào đây để đổi thành Lilith」 và 「Kéo vào đây để đóng cửa sổ nổi」. Sau khi thả vào 「Đổi thành Lilith」, Lilith quay trở lại; vị trí của ảnh đại diện không đổi vì thả vào mục tiêu không tính là di chuyển.
5. Thả Lilith vào 「Đóng」: hỏi xác nhận trước, bấm 「Khoan đóng」 sẽ giữ cô ấy lại; sau khi xác nhận thì `floatLilith=none`, cả Lilith **lẫn** ảnh đại diện đều không hiển thị.
6. Ở trạng thái đã đóng:
   - Thiết bị đầu cuối vẫn mở được bình thường, ảnh đại diện trong thanh tiêu đề hiển thị bình thường, nút 「Cửa sổ nổi」 vẫn có mặt;
   - Bấm nút × chỉ đóng thiết bị đầu cuối, trên trang không tự dưng mọc ra ảnh đại diện.
7. Thả ảnh đại diện vào 「Đóng」 (sau khi xác nhận): `none`, ảnh đại diện biến mất.
8. Nút 「Cửa sổ nổi / Toàn màn hình」:
   - Khi đang toàn màn hình thì hiển thị 「Cửa sổ nổi」, khi đang ở cửa sổ nổi thì hiển thị 「Toàn màn hình」, sau khi đóng rồi mở lại vẫn giữ nguyên;
   - Nút × ở cả hai bố cục đều đóng thiết bị đầu cuối, Lilith vẫn là Lilith.
9. Kích thước:
   - Khi Lilith ở mức 20% thì rộng 30 px, nằm trong màn hình;
   - Khi ảnh đại diện ở mức 20% thì rộng khoảng 13 px, nằm trong màn hình, kéo được, vị trí thả tay khớp với vị trí đã lưu (sai số ≤2 px);
   - Đổi về lại 100% thì rộng 64 px.
10. Trang Cài đặt:
    - Mục 「Cửa sổ nổi (Chuyển đổi kiểu dáng)」 có bốn tùy chọn (auto / on / off / none);
    - Nút 「Đóng cửa sổ nổi…」 riêng biệt hoạt động bình thường;
    - Cả hai tùy chọn kích thước đều bắt đầu từ mức 20%.
11. Bảng tiện ích mở rộng: bấm 「Hiển thị ảnh đại diện」 sẽ hiển thị ảnh đại diện, bấm 「Hiển thị Lilith nổi」 sẽ hiển thị Lilith. Không có lỗi trang.

Máy tính (1280×860):

12. Mặc định hiển thị nút đánh thức nguyên bản. Sau khi kéo vào 「Đổi thành Lilith」 sẽ chuyển thành `on`, Lilith nổi xuất hiện.
13. Nhấp chuột phải vào Lilith: menu có 「Đổi thành ảnh đại diện」 và 「Đóng cửa sổ nổi」; sau khi chọn 「Đổi thành ảnh đại diện」, nút đánh thức quay trở lại.
14. Nút đánh thức thu phóng ở mức 40% vẫn nằm gọn trong màn hình.

Gộp cổ điển (mô hình mô phỏng thống kê số lần yêu cầu):

| Số lượt rút | Yêu cầu mô hình | Số món trong yêu cầu lần này | Gộp (chỉ đếm số lượng) | Giới hạn đầu ra |
|---|---|---|---|---|
| 49 | **1** | 49 | — | 12784 |
| 60 | **1** | 32 | Phàm phẩm ×28 | 8704 |
| 120 | **1** | 3 | Phàm phẩm ×76, Linh phẩm ×41 | 8192 |

Mọi dòng trong bảng trên đều đã được đối chiếu: Σsố lượng = số lượt rút, trừ phí 1 lần, phẩm cấp đã gộp không gửi cho mô hình.

## Hồi quy (cùng SillyTavern cô lập)

| Bộ kiểm thử | Kết quả |
|---|---|
| native_v113 (mới) | 34/34 |
| native_v112 | 40/40 (đổi 「≤20 món mỗi lô」 thành 「1 yêu cầu duy nhất」) |
| native_v100_feedback | 44/44 (đóng = `none`; chạm giữ thực tế kéo vào mục tiêu 「Đóng」) |
| native_v082 | 24/24 |
| native_v083 | 13/13 (kiểm tra tùy chọn kích thước đổi sang xem giá trị) |
| native_v111 | 32/32 |
| native_v111_audit | 34/34 |
| native_v111_mobile | 12/12 |
| native_v080 | 33/33 |
| native_v110 | 37/37 |
| native_v100 | 28/28 |
| native_v090 | 24/24 |
| native_group060 | 44/44 |
| native_world070 | 40/40 |
| native_v110_patch3 | 19/19 |
| native_v110_review | 11/12 (1 mục là thất bại đã có từ trước) |
| native_terminal050 | 49/58 (9 mục thất bại giống hệt khi bàn giao 1.1.2; kiểm tra bảng tiện ích mở rộng đã thêm 「Hiển thị ảnh đại diện」) |

Khi kết thúc, `native_v113` sẽ khôi phục toàn bộ cài đặt plugin mà nó đã thay đổi (trình diễn, cửa sổ nổi, kích thước, vị trí, bố cục, chế độ rút thẻ) về nguyên trạng. Ngay sau đó chạy tiếp `native_v100_feedback` đạt 44/44.

## Những phần chưa nghiệm thu

- **Điện thoại vật lý**: Mới chỉ chạy mô phỏng thiết bị Pixel 7. Việc người chơi phản ánh không nhìn thấy nút 「Cửa sổ nổi / Toàn màn hình」 chưa tái hiện được trên môi trường mô phỏng.
- **Mô hình thực tế**: Việc xuất hơn 40 món vật phẩm trong một yêu cầu duy nhất chưa được nghiệm thu trên mô hình thực tế. Nếu giới hạn trần của cổng kết nối quá nhỏ hoặc mô hình bị cắt cụt giữa chừng, plugin sẽ tự động giảm một nửa rồi thử lại, khi đó số lần yêu cầu sẽ nhiều hơn 1 lần.
- Ảnh đại diện ở mức 20% (khoảng 13 px) trên điện thoại nhỏ hơn rất nhiều so với vùng chạm tối thiểu thông thường (khoảng 44 px), được cung cấp theo đúng yêu cầu của người chơi.
