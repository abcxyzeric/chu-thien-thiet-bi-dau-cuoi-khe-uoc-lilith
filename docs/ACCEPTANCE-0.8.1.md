# Nghiệm thu trình duyệt trên máy chủ thực tế 0.8.1

## Môi trường

Giống với [0.8.0](ACCEPTANCE-0.8.0.md): các thực thể SillyTavern dùng một lần (cài đặt mới hoàn toàn theo tag từ kho lưu trữ chính thức, tiện ích mở rộng tải không gian làm việc kho lưu trữ qua liên kết tượng trưng), Playwright Chromium headless + swiftshader, mô hình mô phỏng cục bộ `tests/qa/mock_model.py`. Tất cả các cuộc trò chuyện kiểm thử đều là cuộc trò chuyện kiểm thử cô lập.

Đợt này thêm nhà cung cấp mô phỏng thứ hai `mock_model.py --no-cors` (cổng 5002): nó **không gửi bất kỳ tiêu đề CORS nào**, kết nối trực tiếp từ trình duyệt sẽ bị chặn, chỉ có chuyển tiếp qua phía máy chủ mới lấy được kết quả, dùng để mô phỏng trường hợp 「trạm trung chuyển không cho phép truy cập chéo miền (CORS)」.

| Phiên bản | commit |
| --- | --- |
| 1.16.0 | `e3b866b5d2bcc7fbaa889bb926fbb567cd1ed25b` |
| 1.19.0 | `7e8663cd9c184a550b37238218bdd32c6efc68e9` |

## Tổng quan kết quả

| Bộ kiểm thử | 1.16 | 1.19 |
| --- | --- | --- |
| `native_v081.py` (Mới thêm bản 0.8.1, 20 hạng mục) | 20/20 | 20/20 |
| `native_group060.py` (Hồi quy nhóm chat, 44 hạng mục; khẳng định giá được cập nhật theo bảng giá mới của 0.8.1) | 44/44 | 44/44 |
| `native_v080.py` (0.8.0, 33 hạng mục) | Đợt này không chạy lại (ở bản 0.8.0 đạt 33/33) | 33/33 |
| `native_world070.py` (40 hạng mục) | Đợt này không chạy lại (ở bản 0.8.0 đạt 40/40) | 40/40 |
| `native_terminal050.py` (58 hạng mục) | Đợt này không chạy | 58/58 |
| `native_guards.py` | Đợt này không chạy | ✅ |
| `native_replace040.py` | **Không chạy** (cần tệp nguyên bản v1.1 không tải lên) | **Không chạy** |
| `node --test tests/*.test.js` (Thuần logic) | 101/101 | 101/101 |

Bản 1.17 / 1.18 đợt này không kiểm thử.

### Về một lần thất bại của `native_world070`

Trên bản 1.19, lần chạy đầu tiên bị hết thời gian chờ (timeout) khi chụp ảnh màn hình, lần thứ hai có 2 hạng mục 「Phản ứng của Lilith」 thất bại. Nguyên nhân là do cô lập kiểm thử: giai đoạn điện thoại của `native_group060` chạy trước đó đã lưu kích thước cửa sổ 380×764 vào tùy chọn giao diện phía máy chủ, khiến thiết bị đầu cuối đi vào chế độ thu gọn, tranh đứng bị ẩn đi nên bong bóng thoại của Lilith tất nhiên trống rỗng. Đây là cùng một vấn đề mà `native_v080` đã gặp khi nghiệm thu bản 0.8.0. Hiện tại `native_world070.py` khi khởi động sẽ bấm 「Đặt lại cửa sổ」 trước, sau đó đạt 40/40. **Mã nguồn plugin không thay đổi vì việc này.**

## Các hạng mục bao phủ của `native_v081.py`

| # | Hạng mục |
| --- | --- |
| 1 | Tiền đề: Nhà cung cấp không có tiêu đề CORS, kết nối trực tiếp từ trình duyệt thực sự bị chặn |
| 2 | Lilith → Kết nối → 「Lấy mô hình」 vẫn lấy được danh sách mô hình bình thường (chuyển tiếp qua máy chủ SillyTavern), trong phản hồi không có lỗi 「CORS」 |
| 3 | Lệnh Chiêu Mộ trừ 100; bậc thực lực yêu cầu trong lời nhắc chiêu mộ ngẫu nhiên = bậc mà Ký chủ đủ tiền trả (500 điểm → bậc 1, phí vào nhóm 300) |
| 4 | Khi mô hình phớt lờ yêu cầu bậc thực lực, tự động đính chính hỏi lại một lần; ứng viên vẫn vượt ngân sách sẽ được đánh dấu `Vượt ngân sách` |
| 5 | Ứng viên không đủ tiền mời: lời mời bị từ chối, không trừ thành số âm, không có ai vào nhóm, thông báo rõ phí vào nhóm và số dư |
| 6 | Thẻ ứng viên hiển thị 「Điểm Hệ Thống không đủ…… sau khi từ bỏ rồi chiêu mộ lại sẽ đổi sang người khác」 |
| 7 | Sau khi từ bỏ rồi chiêu mộ lại: trong mục 【Không được chọn】 của lời nhắc có tên ứng viên trước đó, kết quả trả về là một người khác |
| 8 | Phí vào nhóm tính theo đường cong mới (Đỉnh cao phàm nhân 300) |
| 9 | Chiêu mộ lại khi ứng viên cũ vẫn còn đó: hai lần tuyệt đối không phải cùng một người (người đầu tiên đã đi vào lịch sử ứng viên) |
| 10 | Mô hình 「tham lam」 lượt nào cũng muốn phát lì xì: lượt 1 được ghi sổ, lượt 2 và 3 trong lời nhắc ghi rõ 「Lượt này cấm phát」, và dòng cố tình phát ra bị sổ cái loại bỏ |
| 11 | Ký chủ nói 「Ai phát lì xì cho tôi đi」 → lượt này được phép, lì xì được ghi sổ |
| 12 | Sau khi phát, nhịp độ được đặt lại thành 3 hoặc 4 lượt |
| 13 | Giật lì xì ghi vào `入库记录` (Nguồn gốc Tên@Thế giới, Phương thức Lì xì) |
| 14 | Lời nhắc cốt truyện có chứa 「Bản ghi nhập kho thực tế」, nguồn gốc, 「không được sửa thành……」; tiêm ở độ sâu 2 |
| 15 | Sách Thế Giới bản cũ được nhận diện là 「Không phải bản mới nhất」 |
| 16 | 「Cập nhật lên bản mới nhất」: lưu bản sao lưu đầy đủ 36 mục trước rồi mới hợp nhất; thêm mới mục từ nhóm chat số 36, các mục từ do người dùng tự tạo được giữ nguyên |
| 17 | Mục số 05 đổi sang trỏ tới Bảng điều khiển Quản trị viên trong Cài đặt; trạng thái tắt của người dùng đối với các mục tích hợp sẵn được giữ nguyên |
| 18 | Sau khi cập nhật, trạng thái hiển thị 「Đã là bản mới nhất」 |
| 19 | Tệp Sách Thế Giới tải xuống qua 「Xuất JSON」 có chứa đủ 36 mục |
| 20 | Không có lỗi trang |

## Kiểm tra ảnh chụp thủ công

- Ảnh chụp trang Kết nối trên 1.16 / 1.19: hộp chọn thả xuống liệt kê `mock-zt`, `mock-zt-mini`, phản hồi 「Đã tìm thấy 2 mô hình」.

## Chưa xác minh

- **Trạm trung chuyển thực tế**: Logic chuyển tiếp mới chỉ được xác minh bằng nhà cung cấp mô phỏng không có CORS cục bộ; trạm trung chuyển mà người dùng báo cáo chưa được kiểm thử thực tế (không có Key của nó, và cũng không nên có). Nếu trạm đó từ chối cả yêu cầu từ phía máy chủ (ví dụ chặn theo IP nguồn), việc chuyển tiếp cũng sẽ thất bại, khi đó giao diện sẽ hiển thị thông báo chuyển tiếp qua máy chủ SillyTavern cũng không lấy được danh sách mô hình.
- **Mô hình thực tế**: Việc chiêu mộ có tuân thủ bậc thực lực hay không và chính văn có tuân thủ 「không được sửa đổi nguồn gốc」 hay không mới chỉ được xác minh bằng mô hình mô phỏng. Các hạng mục cưỡng chế ở tầng sổ cái (nhịp độ lì xì, trừ phí vào nhóm, từ chối ứng viên trùng lặp) không phụ thuộc vào mô hình.
- Bản 1.17 / 1.18; `native_replace040.py`.
