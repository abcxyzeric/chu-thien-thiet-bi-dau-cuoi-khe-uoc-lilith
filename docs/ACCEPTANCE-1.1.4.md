# Bản ghi nghiệm thu 1.1.4

## Môi trường

- SillyTavern 1.19.0 cô lập dùng một lần (`tests/qa/setup_isolated_st.py`), kết hợp với mô hình mô phỏng tất định (`tests/qa/mock_model.py`).
- Khung nhìn máy tính để bàn 1280×860.
- Đợt này **không phải** nghiệm thu bằng mô hình thực tế, cũng **không phải** nghiệm thu trên điện thoại vật lý.

## Kiểm tra tĩnh & Kiểm thử đơn vị

| Hạng mục | Kết quả |
|---|---|
| `npm run check` | Đạt (runtime đã được dựng lại, mã băm nguồn đồng nhất; `vendor/original` giữ nguyên cấu trúc) |
| `npm test` | 429/429 |
| `npm run filelist` | 285 tệp, đã tạo lại |
| `tests/v114.test.js` (mới) | 19 hạng mục đạt, xem bảng dưới |

Nội dung được `tests/v114.test.js` bao phủ:

| Phạm vi | Nội dung bao phủ |
|---|---|
| Tạo phản hồi nhóm chat | Giá trị mặc định và biên của cài đặt; giới hạn đầu ra tự động; độ ưu tiên của giới hạn đầu ra |
| Roll lại (Reroll) | Kiểm thử đầu-cuối: đầu vào giữ nguyên, tin nhắn của bạn được giữ lại; khi yêu cầu thất bại thì lượt cũ vẫn được giữ nguyên |
| Thu hồi khi roll lại | Các trường hợp không thể roll lại (đã giật lì xì, đã nhận quà tặng); thu hồi lì xì chưa giật, bộ đếm ngày, nhịp độ, cấm chat |
| Xóa tin nhắn | Giới hạn xóa; xóa đầu-cuối |
| Cắt cụt | Loại bỏ nửa câu bị đứt và đưa ra thông báo |
| Đóng băng giả | Lần lưu đến muộn sẽ được lưu lại một lần chứ không đóng băng; kịch bản khác sửa biến riêng của nó sẽ không gây đóng băng; khi thao tác ghi thực sự không lưu xuống được thì vẫn đóng băng; đối chiếu và mở khóa băng |
| Làm sạch khóa ký ức | Dấu chấm giữa, dấu hai chấm, khoảng trắng, chữ Kana, ký tự toàn giác, từ nguy hiểm, khóa trùng lặp |
| Bảo vệ chuỗi tư duy | Vô hiệu hóa thẻ bản nháp; khi chuỗi tư duy lành mạnh thì giữ nguyên; điền sẵn (prefill); chưa đóng thẻ; khối dữ liệu chỉ nằm trong chuỗi tư duy; thẻ `<think>` nằm trong khối dữ liệu vẫn giữ hành vi của bản 1.1.1 |
| Tầng cũ | Hiển thị, gắn kết sổ cái, lọc tầng cũ đều bỏ qua chuỗi tư duy |
| Khung thoại | Không lấy lời thoại từ bên trong chuỗi tư duy |
| Nhắc nhở định dạng | Cài đặt độ sâu |
| Kiểm tra tầng | Nội dung báo cáo |
| Sách hướng dẫn | Thoát mã (escape) khi kết xuất (`<img onerror>`, `javascript:`, HTML trong bảng đều không thể thực thi); mục lục và đóng/mở chương |

## Trình duyệt: `tests/native_v114.py`, 29/29

### Nhóm chat

1. Công việc nhóm → 「Tạo phản hồi nhóm chat」 có 5 cài đặt, giá trị mặc định là 1 / 6 / 300 / 16 / Tự động. Khi đặt giới hạn dưới là 8, giới hạn trên tự động tăng lên 8 theo và ghi vào sổ cái.
2. Sau khi gửi tin nhắn sẽ nhận được một lượt phản hồi. Trong yêu cầu mang theo giới hạn đầu ra đã chọn là 3000, cùng yêu cầu về số người và số chữ. Trong sổ cái có một bản ghi lượt.
3. 「↻ Roll lại」: bật hộp thoại xác nhận trước; thay thế phát biểu của thành viên nhóm, giữ nguyên phát biểu của bạn; kết quả được ghi vào tệp trò chuyện trên máy chủ.
4. Sau khi nhận quà tặng sẽ cất vào túi đồ. Từ lúc đó lượt này **không thể** roll lại nữa, hệ thống sẽ hiển thị lý do và giữ nguyên nội dung.
5. 「🗑 Quản lý」: mỗi tin nhắn đều có nút xóa. Quà tặng đã nhận không thể xóa; tin nhắn thông thường xóa được; sau khi bấm 「✓ Hoàn tất」 các nút xóa sẽ ẩn đi.
6. Cắt cụt: mô hình mô phỏng trả về `finish_reason=length`. Nửa dòng cuối bị loại bỏ, xuất hiện thông báo và lượt này được đánh dấu là bị cắt cụt.

### Đóng băng

7. Ở trạng thái đóng băng, thao tác ghi bị từ chối và thông báo chỉ dẫn tới nút mới.
8. 「Đối chiếu & Mở khóa sổ cái」: khi bản lưu trên máy chủ khớp với trên trang, sổ cái sẽ được mở khóa ngay mà không cần làm mới trang; sau đó các thao tác ghi trở lại bình thường.

### Chuỗi tư duy (Tạo phản hồi thực tế, đi qua API chính của SillyTavern → mô hình mô phỏng)

9. Cấu trúc phản hồi của mô hình mô phỏng:
   - Bên trong `<think>` có một bản nháp khối dữ liệu chưa đóng thẻ cùng một câu thoại nháp;
   - Tiếp theo là chính văn và lời thoại của Lilith;
   - Cuối cùng là khối dữ liệu chính thức (Điểm Hệ Thống 1400).
10. Kết quả xác minh:
    - Thẻ và văn bản của chuỗi tư duy đều được giữ nguyên, chỉ có thẻ bản nháp bên trong bị đổi thành ký tự toàn giác, nguyên văn có bản sao lưu;
    - Khối dữ liệu chính thức được ghi sổ, Điểm Hệ Thống tăng từ 1200 → 1400;
    - Khung thoại chỉ có đúng câu trong chính văn, tổng cộng 1 thẻ;
    - Lời nhắc định dạng nằm ở độ sâu 1, trong văn bản nhắc nhở không có cụm từ cấm quá trình suy nghĩ.
11. Đối chiếu: Trong cùng kịch bản này ở bản 1.1.3, thẻ `</think>` và chính văn trên tầng bị nuốt mất, nhãn nhỏ hiển thị 「Điểm Hệ Thống Bản nháp」, không được ghi sổ, khung thoại có 0 thẻ.

### Kiểm tra tầng & Sách hướng dẫn

12. Nút 「Kiểm tra tầng mới nhất」 nằm trong Cài đặt → Chẩn đoán & Bảo trì. Báo cáo liệt kê:
    - Chính văn đã được viết lại (kèm thuyết minh nguyên nhân);
    - Trong chính văn có 1 đoạn chuỗi tư duy;
    - Được kết xuất bởi plugin;
    - 8 lời nhắc tiện ích mở rộng hiện tại, bao gồm cả lời nhắc Sách Thế Giới do nguồn khác tiêm vào.
13. Thiết bị đầu cuối → Sách hướng dẫn: đọc `docs/MANUAL.md`, mục lục có đủ các chương. Khi tìm kiếm 「Đối chiếu và mở khóa」 chỉ còn lại 3 chương liên quan.
14. Suốt quá trình không có lỗi trang.

## Hồi quy trình duyệt các bản cũ (cùng môi trường)

| Kịch bản | Kết quả |
|---|---|
| `native_v111.py` | 32/32 |
| `native_v112.py` | 40/40 |
| `native_v113.py` | 34/34 |
| `native_group060.py` | 44/44 |
| `native_guards.py` | Đạt |
| `native_v100.py` | 27/28 |

Hạng mục thất bại duy nhất của `native_v100.py` là 「Hiệu ứng động Rút gọn」. Khi khôi phục kho lưu trữ về bản 1.1.3 chưa sửa đổi rồi chạy lại vẫn thất bại y hệt, nên đây là vấn đề đã có từ trước, không liên quan tới bản này.

## Chưa xác minh / Ranh giới

- **Mô hình thực tế**: Roll lại, nhận diện cắt cụt, hiệu quả chỉnh lý sau khi làm sạch khóa ký ức, và ghi bù đều mới chỉ được xác minh bằng mô hình mô phỏng.
- **Nhận diện cắt cụt**: Chỉ có hiệu lực với API độc lập. Khi đi qua API chính của SillyTavern, SillyTavern không trả về nguyên nhân kết thúc (`finish_reason`).
- **Ảnh chụp màn hình của người chơi (Hình 6)**: Hiện tượng mất thẻ chuỗi tư duy trong cuộc trò chuyện không phải Chư Thiên chưa tái hiện được. Phán đoán là do xung đột với preset, tiện ích mở rộng khác hoặc biểu thức chính quy, có thể dùng nút 「Kiểm tra tầng mới nhất」 để xác nhận.
- **Độ sâu 0 của Sách Thế Giới**: Sách Thế Giới nguyên bản có 3 mục từ thường trực chèn ở độ sâu 0, plugin không tự ý sửa. Trong Sách hướng dẫn đã ghi rõ cách điều chỉnh thủ công.
- **Trạng thái đóng băng** chỉ lưu trong bộ nhớ trang. Khi kết quả đối chiếu không khớp, người dùng vẫn cần tải lại trang.
- **Điện thoại vật lý**: Các giao diện thay đổi trong bản này (thanh công cụ nhóm chat, trang sách hướng dẫn) chưa được bấm kiểm thử trên điện thoại vật lý.
