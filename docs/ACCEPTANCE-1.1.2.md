# 1.1.2 · Bản ghi xác minh

> Chi tiết thay đổi xem tại [CHANGES-1.1.2](CHANGES-1.1.2.md). Kết luận: kiểm thử đơn vị đạt 402/402; chuyên đề trình duyệt 1.1.2 đạt 40/40 (SillyTavern cô lập thực tế + mô hình mô phỏng); toàn bộ chuyên đề của 1.1.1 và hồi quy cũ đều đã chạy lại, kết quả đồng nhất với 1.1.1, không phát sinh thất bại mới. **Chưa nghiệm thu bằng mô hình thực tế hay điện thoại vật lý.**

## Môi trường & Quy chuẩn

- Cơ sở: 1.1.1 (main `bfa4807` + các thay đổi 1.1.1).
- Ngày: 2026-10-06. SillyTavern 1.19.0 cô lập (gói mã nguồn tag chính thức) + Chromium/Playwright, cổng 8019. Chỉ dùng nhân vật nghiệm thu, không chạm tới bất kỳ SillyTavern hay dữ liệu người dùng nào.
- Phản hồi mô hình toàn bộ là mô phỏng tất định (`tests/qa/mock_model.py` và chặn trong trang), chỉ chứng minh logic của plugin chứ không đại diện cho cách viết của mô hình thực tế. Lưu cuộc trò chuyện, lưu biến số và tải lại trang đều đi qua máy chủ SillyTavern cô lập thực sự.

## Kết quả

| Kiểm tra | Kết quả & Phạm vi |
|---|---|
| `npm test` | **402/402**: 381 mục của 1.1.1 + `tests/v112.test.js` 21 mục. Cập nhật giá trị kỳ vọng của 2 bài kiểm thử cũ: số phiên bản; danh sách gắn kết trong `v110.test.js` không còn mặc định chứa thành viên nhóm (quy tắc mới của 1.1.2) |
| `npm run check` | Kiểm tra cú pháp JS, trích xuất vendor và mã băm nguồn đều đạt |
| `npm run filelist:check` | Đồng nhất với cây thư mục tệp bàn giao |
| `tests/native_v112.py --isolated-test-only` | **40/40**, chuyên đề 1.1.2 (xem bên dưới); chạy xen kẽ liên tiếp với chuyên đề 1.1.1 cũng đều đạt toàn bộ (khi bắt đầu kiểm thử đưa chế độ rút thẻ về mặc định, khi kết thúc khôi phục lại) |
| `tests/native_v111.py` | 32/32. Các hạng mục hộp mù kiểm thử chế độ 10 lượt 1 lần quyết toán, hiện trong bài kiểm thử chuyển sang 「10 lượt 1 lần quyết toán」 trước rồi khôi phục mặc định sau khi kết thúc |
| `tests/native_v111_audit.py` | 34/34 |
| `tests/native_v111_mobile.py` | 12/12 |
| `tests/native_v080.py` | 33/33 (chạy tổng cộng 7 lần, 6 lần đạt toàn bộ). 「Cài đặt → Bảng điều khiển Quản trị viên」 hiện mở trang mới của thiết bị đầu cuối trước, bài kiểm thử được cập nhật bấm thêm 「Mở bảng nguyên bản」, các khẳng định về lưu bảng nguyên bản và không tải lại động cơ giữ nguyên |
| `tests/native_v110.py` | 37/37 |
| `tests/native_v100.py` | 28/28 |
| `tests/native_v090.py` | 24/24 |
| `tests/native_v110_patch3.py` | 19/19 |
| `tests/native_group060.py` | 44/44 |
| `tests/native_world070.py` | 40/40 |
| `tests/native_v110_review.py` | 11/12, giống 1.1.1 và cơ sở (1 mục do kịch bản cũ tính lỗi cố ý ném ra là ngoại lệ trang) |
| `tests/native_terminal050.py` | 49/58. Đợt này đã chạy đối chiếu lại trên `bfa4807` nguyên bản, **tên của 9 mục thất bại giống hệt nhau** (khẳng định thương thành / điều hướng cũ thời 0.5.0), không có thất bại mới |
| Ngoại lệ chưa bắt được trên trình duyệt | Cả chuyên đề lẫn hồi quy đều có 0 pageerror |

## Tóm tắt chuyên đề 1.1.2 (`native_v112`, 40 hạng mục)

**Chế độ rút thẻ**
- Khi chưa từng cài đặt, mặc định là Gộp cổ điển; trong nút chuyển đổi cạnh nút hộp mù, chế độ Gộp cổ điển đang ở trạng thái được chọn.
- Rút 30 lượt: quyết toán 1 lần, chi phí chính xác, không gộp.
- Rút 60 lượt: Phàm phẩm gộp thành một dòng 「Tạp vật Phàm phẩm ×N」, Σsố lượng = 60, chỉ trừ phí 1 lần; không gửi Phàm phẩm cho mô hình, mỗi yêu cầu không vượt quá 20 món.
- Rút 120 lượt: Phàm phẩm và Linh phẩm mỗi loại gộp thành một dòng, Tiên phẩm tạo từng món; bảo hiểm và tổng số lượt rút tích lũy vẫn tính như bình thường; thông báo ghi rõ đã gộp những gì.
- Sau khi bấm 「Giữ lại」 dòng đã gộp, túi đồ nhận được 「Tạp vật Phàm phẩm ×N」.
- Chuyển sang 10 lượt 1 lần quyết toán: rút 60 lượt = 6 lần quyết toán, tạo từng món, không gộp.
- Trang tùy chỉnh hàng hóa có cùng nút chuyển đổi này và đồng bộ ở cả hai nơi.

**Gắn kết**
- Mặc định mở bộ lọc 「Thế giới này」, thành viên nhóm không xuất hiện; trong bộ lọc 「Tất cả」, người của thế giới này được xếp lên trước.
- Ở trang Thành viên nhóm, mỗi người đều có nút 「Đưa vào Gắn kết」. Sau khi đưa vào, quan hệ là Bạn cùng nhóm, độ hảo cảm lấy từ hảo cảm trong nhóm, trang tự động nhảy tới người đó và phần chi tiết hiển thị trạng thái trong nhóm.
- Thành viên nhóm cùng tên cùng thế giới được liên kết với nhân vật đã có, không bị nhân đôi.
- Đồ phổ quan hệ: thành viên nhóm đã đưa vào Gắn kết chỉ vẽ một lần; nút 「Đưa vào Gắn kết」 trên nút đồ phổ hoạt động tốt.
- Nút 「Đưa ra khỏi Gắn kết」 chỉ xóa người bạn cùng nhóm được đưa vào, người trong nhóm chat vẫn còn nguyên; mục tiêu công lược hiện tại không có nút 「Đưa ra」.
- Dưới màn hình hẹp không bị tràn ngang.

**Bảng điều khiển Quản trị viên**
- Lối vào trong Cài đặt mở trang thiết bị đầu cuối, đầy đủ 7 nhóm, hiển thị tiến độ bảo hiểm.
- Ô nhập liệu đã sửa đổi được tô sáng và hiển thị bộ đếm; 5 mục sửa đổi được ghi trong một lần (bao gồm đồng bộ mục tiêu hiện tại sang mục tiêu tình yêu và hảo cảm thành viên nhóm).
- Sửa đổi tài nguyên độc quyền được đồng bộ vào bản chụp nhanh tầng; sau khi ghi để lại bản ghi thao tác và trang tự đọc lại dữ liệu mới.
- Sổ cái có thay đổi trước khi ghi → từ chối ghi; giá trị vượt ngưỡng → báo rõ tên trường và phạm vi hợp lệ; chuyển cuộc trò chuyện rồi bấm lưu → đọc lại dữ liệu mới chứ không ghi đè.
- Độ thuần thục công pháp được ghi thông qua logic đồng bộ nguyên bản và không ghi đè mất tài nguyên độc quyền trong bản chụp nhanh tầng.
- Nút 「Mở bảng nguyên bản」 mở được hộp thoại quản trị viên nguyên bản.

## Kiểm tra thị giác

Ngoài ra đã chụp ảnh màn hình trang Gắn kết, trang Thành viên nhóm và Bảng điều khiển Quản trị viên ở chế độ toàn màn hình máy tính (1280×860) và màn hình hẹp (390×844). Đã sửa hai chỗ: nhãn 「Nhân vật / Thành viên nhóm」 ở trang Quản trị viên bị ép thành hàng dọc; tiêu đề nhóm dưới màn hình hẹp bị tách làm hai dòng.

## Những phần chưa xác minh

- Chất lượng đầu ra và tần suất bị cắt cụt của chế độ Gộp cổ điển dưới mô hình thực tế. Khi bị cắt cụt sẽ tự động giảm một nửa, điểm này đã được mô hình mô phỏng bao phủ.
- Cảm ứng trên điện thoại vật lý.
- Hiệu năng danh sách khi trong bản lưu thực tế có lượng lớn mối gắn kết (hàng trăm người).
