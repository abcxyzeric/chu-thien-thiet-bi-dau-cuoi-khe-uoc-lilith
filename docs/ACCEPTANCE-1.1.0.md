# 1.1.0 · Bản ghi xác minh

> **Bản sửa đổi mới nhất 1.1.0-patch3**: 330/330 bài kiểm thử đơn vị, 10 bộ trình duyệt đạt 301/301. Ba bản sửa lỗi P1 cùng chẩn đoán ngữ cảnh bảo mật / giao thức / Web Locks / lỗi lưu trữ xem tại [PATCH-1.1.0-3](PATCH-1.1.0-3.md). Các kết quả 305/238 của đợt phúc tra trước bên dưới là lô lịch sử, không phải tổng số mới nhất. Mô hình thực tế và điện thoại vật lý vẫn chưa được xác minh.

## Môi trường & Quy chuẩn

- Cơ sở (Baseline): nhánh main của kho lưu trữ chỉ định `ce29f61a9c254517fdf1fae2385b83b55cfa3688`; sửa đổi sau khi toàn bộ 250 bài kiểm thử đơn vị gốc đã đạt.
- Ngày: 2026-10-04. SillyTavern 1.19.0 cô lập (`7e8663c`), Chromium/Playwright; chỉ nghiệm thu nhân vật 「Lilith · Nghiệm thu Chư Thiên」. Không kết nối dữ liệu sản xuất thực tế.
- Phản hồi mô hình là mô phỏng tất định; lưu sổ cái, lưu Sách Thế Giới và tải lại trang sử dụng máy chủ SillyTavern cô lập thực sự. Việc tiêm lỗi trình duyệt và kiểm thử thiết bị vật lý / mô hình thực tế được trình bày tách biệt rõ ràng.
- 1.16–1.19 là phạm vi hỗ trợ vốn có của kho lưu trữ; đợt chạy trình duyệt thực tế lần này chỉ chạy trên 1.19.0, không tuyên bố đã kiểm thử lại từng phiên bản máy chủ.

## Kết quả

Đợt phúc tra thứ hai trước khi bàn giao đã hoàn tất: 305 bài kiểm thử đơn vị, 8 bộ trình duyệt với 238 hạng mục đều đạt; các vấn đề phát hiện và sửa chữa, bản ghi thất bại và ngưỡng chưa xác minh xem chi tiết tại [REVIEW-1.1.0](REVIEW-1.1.0.md). 37/28 hạng mục dưới đây là hai bộ trong tập hợp phúc tra đầy đủ, không phải toàn bộ phạm vi bao phủ trình duyệt.

| Kiểm tra | Kết quả & Phạm vi |
|---|---|
| `npm test` | 305 hạng mục: 250 mục cũ + 35 mục lượt 1 bản 1.1 + 20 mục phúc tra; nhật ký cụ thể xem trong bằng chứng đi kèm |
| `npm run check` | Kiểm tra cú pháp toàn bộ JS gốc, trích xuất/kiểm tra nguồn gốc vendor nguyên bản |
| `npm run filelist:check` | Đồng nhất với cây thư mục tệp bàn giao đầy đủ |
| `tests/native_v110.py --isolated-test-only` | **Đạt 37/37**; chuyên đề 1.1 và tiêm lỗi |
| `tests/native_v100.py --isolated-test-only` | **Đạt 28/28**; hồi quy các tính năng cũ như bản lưu, cài đặt, tranh đứng, màn hình ngang |
| Ngoại lệ chưa bắt được trên trình duyệt | Cả chuyên đề và hồi quy cũ nêu trên đều có 0 pageerror |
| `vendor/original` | Không sửa đổi cấu trúc so với cơ sở |

## Bao phủ chuyên đề 1.1 (37 hạng mục)

1. Gắn kết mô-đun mới; làm mới 500 điểm / 8 món; lô thứ hai tránh trùng lặp gần đây và lưu lịch sử 16 mục; làm mới không đi vào bản ghi hiển thị; mua sắm ghi vào túi đồ thực tế.
2. JSON hỏng không trừ phí, không đổi kho hàng; rút 10 lần trừ 100.000 điểm trong một lần và ghi vào mục chờ xử lý cùng tổng số lượt rút tích lũy; bắt sự kiện nút bấm thực tế ngăn mã cũ trừ phí lần nữa.
3. Xem trước tóm tắt bản ghi mặc định loại trừ làm mới và phân giải, giữ lại mua sắm.
4. Thu nạp trích dẫn nguồn gốc thực tế; phẩm giai chưa rõ được lưu tạm chứ không ngụy trang thành Phàm phẩm; sau khi xác nhận Tiên phẩm sẽ đưa vào túi đồ và giữ lại phẩm giai gốc 「Thiên giai」.
5. Hai mục tiêu tình yêu cũ sau khi cập nhật liên tiếp vẫn giữ lại cả hai hồ sơ; chỉ xem không làm chuyển đổi mục tiêu gắn kết; đồ phổ quan hệ đọc cùng một kho đa nhân vật.
6. Cắt cụt chính văn rỗng 4096→8192 chỉ thử lại đúng một lần và thông báo lỗi không tự bịa nguyên nhân; không vượt quá giới hạn trần 1000 tường minh; chiêu mộ lưu ứng viên hợp lệ, thất bại không trừ Điểm Hệ Thống.
7. **Tiêm lỗi thay đổi định danh**: Sau khi mô hình trả về, thay thế giá trị đọc định danh của adapter để mô phỏng chuyển cuộc trò chuyện, việc gửi bị từ chối và sổ cái hoàn toàn không thay đổi. Không tuyên bố đã thực thi toàn bộ quy trình chuyển đổi nhân vật thủ công trên thiết bị vật lý.
8. **Ghi Sách Thế Giới xuống đĩa thực sự**: Sao lưu trước; sau khi từ chối xung đột vẫn giữ nguyên chính văn tự sửa, công tắc bật/tắt, từ khóa tùy chỉnh và `depth`; giữ lại mục từ bổ sung và siêu dữ liệu cấp cao nhất, các mục từ tích hợp sẵn khác được nâng cấp.
9. **Lỗi kiểm nghiệm sao lưu Sách Thế Giới**: Máy chủ đọc lại trả về 503 sẽ dừng nâng cấp ngay lập tức, không bị bộ nhớ đệm của máy chủ đánh lừa.
10. **Lỗi đọc lại sổ cái**: 503 trước khi lưu không làm thay đổi biến số; 503 sau khi lưu sẽ đóng băng giao dịch, tác vụ ghi thứ hai đang xếp hàng không được thực thi, tránh trừ phí lặp lại.
11. Sau khi tải lại trang vẫn giữ nguyên túi đồ đã mua và vật phẩm chờ xử lý; trên máy tính không có pageerror.
12. Sự kiện cảm ứng CDP màn hình 390×844: toàn màn hình → cửa sổ nổi; kéo y8→78; thu nhỏ 366×675 xuống 291×575; chuyển đổi qua lại toàn màn hình vẫn giữ nguyên kích thước cửa sổ nổi; đặt lại về kích thước mặc định.
13. **Lối vào hình tròn**: nấp sát mép trái / bấm quay ra, nấp sát mép phải / bấm quay ra; khi khôi phục không mở nhầm thiết bị đầu cuối; không có pageerror.

## Hồi quy tính năng cũ

28 hạng mục bao gồm: tài nguyên tranh đứng và nền trong suốt, tương tác, phân tầng / tìm kiếm cài đặt, xuất không kèm Key và xem trước nhập bản lưu, đọc lại sổ cái thực tế, sao lưu trước khi nhập / trước khi quay lui, giữ nguyên Key cũ, nâng cấp schema 2 và chỉ đọc với phiên bản cao hơn, thông báo lỗi, khởi tạo không mở nhầm Sách Thế Giới, hiệu ứng động rút gọn, 6 lối vào thường dùng + Thêm trên màn hình ngang điện thoại và giữ trang hiện tại luôn hiển thị.

## Trọng tâm kiểm thử đơn vị

Biên xác suất / bảo hiểm, ô tùy chỉnh, thế giới có tên và mục loại trừ, khử trùng lặp tên / hiệu quả, điều kiện nhận Cấm kỵ, hàng thông thường không ép làm yếu; bằng chứng / quyền sở hữu / số lượng, nguồn trùng lặp, phẩm giai chưa rõ, túi đồ sẵn có, bản chụp nhanh công pháp, xuất không kèm Key giữ nguyên chứng từ thu nạp; di chuyển bản lưu cũ đa nhân vật và trùng tên xuyên thế giới, cô lập ID / hảo cảm mục tiêu cũ; biến mô hình không thể xóa kho gốc; bí danh ký ức và kiểm tra bằng chứng; dọn dẹp nhật ký phạm vi hẹp; ràng buộc hình học cửa sổ; giữ nguyên cài đặt tùy chỉnh Sách Thế Giới.

## Cách tái hiện

```sh
npm ci
npm run check
npm test
npm run filelist:check
# Chỉ trỏ tới SillyTavern cô lập do chính bạn tự tạo; kịch bản sẽ ghi cuộc trò chuyện/cài đặt/Sách Thế Giới kiểm thử, tuyệt đối không trỏ vào môi trường sản xuất.
python tests/native_v110.py --isolated-test-only --base-url http://127.0.0.1:8019 --output /tmp/zt-v110-evidence
python tests/native_v100.py --isolated-test-only --base-url http://127.0.0.1:8019 --mock http://127.0.0.1:5001/v1 --shots /tmp/zt-v100-evidence
```

## Chưa bao phủ / Bắt buộc kiểm tra thủ công

- Chưa sử dụng Key người dùng hoặc mô hình trả phí thực tế: không đảm bảo định dạng đầu ra, tính xác thực của tác phẩm, ngữ nghĩa phẩm giai và hiệu quả khử trùng lặp của mô hình/cổng kết nối cụ thể.
- Màn hình cảm ứng là mô phỏng Chromium, chưa kiểm thử trên thiết bị Android/iPhone/Safari vật lý; bàn phím ảo, thanh công cụ trình duyệt và cử chỉ đa điểm vẫn cần xác nhận trên máy thật.
- Đợt này không nghiệm thu lại đầu-cuối bằng mô hình thực tế cho toàn bộ tính năng AI lịch sử, không tự động dựng lại lịch sử đa nhân vật không tồn tại.
- Không thể xác minh từ văn bản rằng vật phẩm thực sự thuộc về Ký chủ; quyền sở hữu, số lượng, ánh xạ thế giới vẫn do người dùng tích chọn đối chiếu. Đừng coi vật người khác đang cầm, lời hứa tương lai hay hàng đang bày bán là đã nhận được.
- Lỗi đọc lại sau khi lưu thuộc trường hợp kết quả chưa rõ, không thể tuyên bố là đã hoàn tiền hay chưa trừ tiền. Cần tải lại trang để đối chiếu một lần, không bấm liên tiếp hoặc tự phát bù thủ công.
- Khi Sách Thế Giới từ chối ghi đè chính văn tự sửa sẽ giữ lại quy tắc cũ, cần hợp nhất thủ công; đây là cơ chế bảo toàn sửa đổi của người dùng, không tự động đảm bảo mọi quy tắc tùy chỉnh đều không có xung đột.
