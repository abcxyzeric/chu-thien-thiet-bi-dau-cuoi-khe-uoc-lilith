# 1.1.0-patch4 · Sửa lỗi thiết bị đầu cuối cũ đọc/ghi xuyên cuộc trò chuyện

Ngày: 2026-10-05. Phiên bản tiện ích vẫn là 1.1.0, cấu trúc sổ cái vẫn là 2. Nhãn bản sửa đổi trên trang chẩn đoán là `1.1.0-patch4`.

## Điều kiện xuất hiện và nguyên nhân

Mở hộp thoại bật lên hoặc đặt tiêu điểm vào ô nhập liệu trong thiết bị đầu cuối ở cuộc trò chuyện A, sau đó chuyển sang cuộc trò chuyện B. Trước đây thiết bị đầu cuối hoãn việc chuyển trang để giữ hộp thoại không bị mất; thế nhưng giao diện (API) của trang cũ lại lấy dữ liệu theo cuộc trò chuyện hiện tại tại thời điểm gọi hàm. Việc trang A trừ 100 điểm có thể bị ghi nhầm sang B: A vẫn giữ nguyên 1000, còn B bị giảm từ 2000 xuống 1900.

Chỉ xóa mục đăng ký giao diện thì không giải quyết triệt để được: các hàm mà trang đã sao chép, các lệnh ghi đang xếp hàng chờ và các thao tác đang đợi mô hình trả về vẫn nắm giữ giao diện cũ.

## Nội dung sửa lỗi và phạm vi

- Ngay khi tạo trang sẽ cố định danh tính cuộc trò chuyện gốc, mảng trò chuyện và đối tượng siêu dữ liệu. Mọi thao tác đọc, ghi, truy vấn tầng tin nhắn và trả về kết quả bất đồng bộ đều kiểm tra ràng buộc này.
- Thông báo thay đổi cuộc trò chuyện, thay thế ngữ cảnh hoặc giải phóng trang đều sẽ thu hồi vĩnh viễn giao diện cũ; dù có chuyển ngược về lại cuộc trò chuyện A cũng không thể khôi phục trang đã hết hiệu lực.
- Thao tác ghi sẽ kiểm tra lại xem trang còn hiệu lực hay không ngay sau khi lấy được khóa (lock), cũng như trước và sau khi thực thi hàm cập nhật, bao phủ cả trường hợp trang bị giải phóng trong lúc đang chờ khóa hoặc đang chạy hàm cập nhật bất đồng bộ.
- Khi chuyển cuộc trò chuyện sẽ ưu tiên gỡ bỏ thiết bị đầu cuối cũ ngay lập tức, hộp thoại đang mở, ô nhập liệu đang lấy tiêu điểm hay trạng thái đang tạo văn bản đều không được phép cản trở; còn hộp thoại mở trong cùng một cuộc trò chuyện vẫn giữ nguyên hành vi hoãn chuyển trang như cũ.
- Khi buộc phải dựng lại sẽ thu hồi ngay giao diện cũ trước, rồi mới thực hiện hiệu ứng chuyển cảnh ngắn ngủi vốn có; các bộ lắng nghe sự kiện cũng được dọn dẹp ngay khi giải phóng trang.
- Đợt này chỉ xử lý mục số 1 trong bản rà soát. Hai vấn đề về việc nhận từng món đồ chờ nhận cũ lưu hai lần và việc nhập túi đồ chờ nhận cũ gộp theo tên & phẩm giai vẫn đang chờ sửa ở đợt sau, không mô tả việc vượt qua kiểm tra lần này thành toàn bộ bản 1.1 đã sạch bóng lỗi.

## Bằng chứng kiểm chứng và ranh giới

- 18 bài kiểm tra định hướng thêm mới trước khi sửa: 2 đạt, 16 thất bại; sau khi sửa đạt 18/18.
- Toàn bộ bộ kiểm tra đơn vị: 348/348 (330 mục trước đó cộng thêm 18 mục lần này). Khi chạy trên Windows chỉ trỏ lệnh `python3` mà bài kiểm tra gọi sang Python hiện có, không sửa đổi logic kiểm thử của dự án.
- Kiểm tra tĩnh của dự án: 60/60, bao gồm kiểm nghiệm nguồn gốc `vendor` nguyên bản; `vendor` nguyên bản không thay đổi.
- Trang cô lập trên Chrome 154.0.8037.93: đạt 9/9, chạy `Bridge`, `Hub`, `StatusBarHost` thực tế cùng kịch bản thiết bị đầu cuối 3.1 nguyên bản, sử dụng Web Locks thật của trình duyệt, không gửi yêu cầu mô hình thật.
- Kiểm thử trình duyệt bao phủ: chuyển cuộc trò chuyện khi đang mở hộp thoại, chuyển cuộc trò chuyện khi đang đặt tiêu điểm vào ô nhập liệu hiển thị và khi đang tạo văn bản, chuyển A→B→A, tải lại ngữ cảnh cuộc trò chuyện cùng tên, hàng đợi khóa, cưỡng bức dựng lại trong lúc đang ghi bất đồng bộ, chuyển cuộc trò chuyện trước khi kết quả mô hình trả về, dọn dẹp khi giải phóng và trừ điểm bình thường trên cuộc trò chuyện mới; không có lỗi trang ngoài dự kiến.
- Sau khi lệnh ghi từ giao diện A cũ bị từ chối thì A=1000, B=2000; sau khi trang B mới trừ 100 điểm bình thường thì A=1000, B=1900.
- Bộ khung kiểm thử ô nhập liệu ban đầu thử đặt tiêu điểm vào ô nhập quản trị viên đang ẩn nên thực tế không lấy được tiêu điểm; sau khi đổi sang ô nhập hiển thị và kiểm tra đồng thời cả tiêu điểm lẫn trạng thái bận thì đã vượt qua, không sửa đổi mã nguồn sản phẩm để chiều theo bộ khung kiểm thử.
- Vòng này không tìm thấy thực thể kiểm thử SillyTavern thật khả dụng; trang cô lập không đồng nghĩa với nghiệm thu trên quán rượu thật. Điện thoại vật lý, bản cài đặt thực tế của người dùng, lưu xuống đĩa thực tế và toàn bộ ma trận phiên bản máy chủ vẫn chưa được kiểm chứng. Không lấy kết quả kiểm chứng quán rượu lịch sử trong các sổ theo dõi cũ làm bằng chứng cho vòng này.

## Kiểm tra thay đổi và đồng bộ Git

Áp dụng sửa lỗi cục bộ, hành vi cốt lõi liên quan tới 3 tệp chạy; ngoài ra có nhãn bản sửa đổi, 1 tệp kiểm thử, tài liệu thuyết minh hiện tại và danh sách mã băm SHA. Ngân sách thay đổi tối đa 9 tệp và 300 dòng thêm/xóa (bao gồm cả kiểm thử và thuyết minh, không tính phần nhập cơ sở 1.1 sẵn có).

Điểm xuất phát nhánh `main` từ xa là 1.0.0 `ce29f61a9c254517fdf1fae2385b83b55cfa3688`. Trước tiên commit riêng gói ghi đè đầy đủ 61 tệp của `patch3` do người dùng cung cấp và đã qua rà soát, sau đó mới commit riêng bản sửa lỗi lần này để dễ phân biệt giữa nội dung 1.1 sẵn có và thay đổi của đợt này. Giữ nguyên tệp gốc, không commit bộ nhớ đệm kiểm thử.

Nếu kiểm tra thất bại, xuất hiện sửa đổi mới không thuộc phạm vi mục này, hoặc trên nhánh từ xa xuất hiện commit chưa gộp thì sẽ dừng phát hành. Chỉ cần hoàn tác commit sửa lỗi lần này là sẽ khôi phục về `patch3`; không đặt lại cuộc trò chuyện của người dùng, không đoán mò để tự sửa dữ liệu đã bị ghi nhầm giữa các cuộc trò chuyện trước đó.

Bước nghiệm thu tiếp theo sau khi cài đặt: mở hộp thoại Thương thành trong cuộc trò chuyện thử nghiệm A đã sao lưu, chuyển sang cuộc trò chuyện B và xác nhận màn hình lập tức hiển thị thiết bị đầu cuối của B; sau đó chuyển về lại A và thao tác bình thường. Bản sửa đổi trong phần chẩn đoán phải hiển thị `patch4`; bước nghiệm thu thủ công này vẫn chờ người dùng thực hiện.
