# Ảnh đứng biến thể AI của Lilith · Thuyết minh nguồn gốc

Các hình ảnh trong thư mục này được dùng cho `portrait.mode = "variants"` (Cài đặt → Ảnh đứng Lilith → Ảnh đứng biến thể AI).
Ngoại trừ `neutral.webp`, tất cả đều là ảnh phái sinh được **tạo / chỉnh sửa bằng mô hình hình ảnh AI** rồi xử lý qua kịch bản dựa trên ảnh đứng nguyên bản `assets/original/lilith.webp` (424×632).

## Biến thể biểu cảm (Toàn khung hình, gồm cả nền gốc)

| Tệp | Biểu cảm | Phương thức tạo |
| --- | --- | --- |
| `neutral.webp` | Bình thản | Mã hóa lại nguyên trạng từ ảnh đứng gốc, **không dùng AI** |
| `smile.webp` | Mỉm cười | AI chỉnh sửa vùng cắt khuôn mặt → ghép trở lại ảnh gốc |
| `shy.webp` | Xấu hổ | Như trên |
| `pout.webp` | Bĩu môi | Như trên |
| `surprised.webp` | Ngạc nhiên | Như trên |
| `wink.webp` | Nháy mắt | Như trên |
| `smug.webp` | Cười ranh mãnh | Như trên |
| `sad.webp` | Tủi thân | Như trên |

Quy trình (`tools/lilith_variants_compose.py`):

1. Cắt vùng khuôn mặt `(118,30)-(278,190)` từ ảnh gốc, phóng lên 640² rồi giao cho mô hình hình ảnh để chỉ sửa biểu cảm.
2. Ở vùng **bên ngoài** hình elip khuôn mặt (tóc, sừng, tai), dùng đặc trưng ORB + phép biến đổi đồng dạng RANSAC để căn chỉnh ảnh tạo ra khớp về lại tọa độ ảnh gốc;
   số điểm khớp trong (inliers) của cả 7 tấm ảnh này đều nằm trong khoảng 252–284, phép biến đổi gần như đồng nhất (tỷ lệ thu phóng 0.999–1.000, độ dịch chuyển ≤0.3px).
3. Khớp màu theo trung bình/phương sai không gian màu LAB trong dải vành đai quanh mặt, thu về độ phân giải gốc và dùng mặt nạ elip làm mờ Gauss (Gaussian feather) để chỉ thay thế vùng khuôn mặt.
4. Các điểm ảnh cơ thể, cánh, đuôi và nền hoàn toàn giống hệt ảnh gốc, nhờ đó khi chuyển cảnh mờ dần (cross-fade) giữa các biểu cảm khác nhau sẽ không xảy ra hiện tượng giật lệch cơ thể hay nền.

## Biến thể tư thế: Đã gỡ bỏ từ bản 0.5.0

Đã thử tạo lại một lần theo yêu cầu bằng cách lấy ảnh đứng toàn thân nguyên bản làm tham chiếu (2026-09-30), nhưng mô hình hình ảnh từ chối tạo nên đã hủy bỏ, không dùng trang phục khác để thay thế.
Khi cần chuyển động cơ thể sẽ sử dụng hoạt ảnh tham số phân lớp nguyên bản (nhịp thở, cánh, đuôi, tóc, đung đưa cánh tay), toàn bộ tư liệu đều lấy từ các lớp nguyên bản.

## SHA-256

```
2645ed0364130ee5bb3437fffa2ffb5da9342ed874a5b9791767223132fff72e  neutral.webp
144db189e3d622b0b75ea32b5cc6310cb260befaeca7a52ee1ddb7beb8cb1e96  pout.webp
c6c5a1cad30ab637e32676473926f2c0d89fdae61359f8a1a8617b255515f587  sad.webp
292470438a425694de22993ea3517b4cfd1d1d5f6177f7a95f95f4518cacb8be  shy.webp
e3faa6e76c6842be1f8e6f9de06b07f370e972731769959a1cc1f3b8bed30726  smile.webp
b13515492de80a5bfd85cef59389e836fcb0142fd806b47688561feff1150db2  smug.webp
1e05ba12c749193cc0f52e0e6900941483c49b1741b28da1baa13d4d4142e2b3  surprised.webp
9a88ab94ec5002338df8933315b9d7ef7d8af75a5f992f71335c08949e11c6e4  wink.webp
```
