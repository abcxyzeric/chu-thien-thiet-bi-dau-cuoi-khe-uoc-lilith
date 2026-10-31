# 1.1.0 · Sửa lỗi từ phản hồi người chơi

> **Bản sửa đổi mới nhất 1.1.0-patch3**: 330/330 bài kiểm thử đơn vị, 10 bộ trình duyệt đạt 301/301. Ba bản sửa lỗi P1 cùng chẩn đoán ngữ cảnh bảo mật / giao thức / Web Locks / lỗi lưu trữ xem tại [PATCH-1.1.0-3](PATCH-1.1.0-3.md). Các kết quả 305/238 của đợt phúc tra trước bên dưới là lô lịch sử, không phải tổng số mới nhất. Mô hình thực tế và điện thoại vật lý vẫn chưa được xác minh.

Sửa đổi tăng thêm dựa trên `ce29f61a9c254517fdf1fae2385b83b55cfa3688` (1.0.0) của nhánh main kho lưu trữ chỉ định. Phiên bản plugin 1.1.0, phiên bản cấu trúc sổ cái 2, phiên bản quy tắc Sách Thế Giới 1.1.0. `vendor/original/*` giữ nguyên cấu trúc và kiểm tra nguồn gốc.

## Cửa sổ & Lối vào

- Thanh tiêu đề bổ sung nút chuyển đổi rõ ràng 「Toàn màn hình / Cửa sổ nổi」. Cửa sổ nổi trên màn hình cảm ứng hỗ trợ kéo thanh tiêu đề, thu phóng ở góc dưới bên phải và giới hạn trong khung nhìn; kích thước cửa sổ nổi trên điện thoại được lưu độc lập, không ghi đè kích thước cửa sổ máy tính ban đầu.
- Nút 「Đặt lại cửa sổ」 nguyên bản khi ở bố cục cảm ứng sẽ đặt lại kích thước trên điện thoại. Xử lý đầy đủ `pointercancel`, mất bắt con trỏ, mất tiêu điểm, ẩn trang và dọn dẹp khi gỡ tải.
- **Lối vào hình tròn** có thể kéo ra mép trái/phải để thu gọn, chạm nhẹ vào phần mép lộ ra để khôi phục; lưu vị trí và trạng thái thu gọn, phân biệt rõ thao tác bấm và kéo, cũng như phân biệt trạng thái đang neo trên thanh tiêu đề.

## API & Chẩn đoán lỗi

- Kiểm tra kết nối và chiêu mộ mặc định dùng 4096 tokens; Thu nạp cốt truyện và tạo hàng hóa sử dụng ngân sách tính năng 8192. Đầu ra tối đa mặc định/cấu hình sẵn được lưu vào cấu hình kết nối chung; giới hạn trần theo từng tính năng được ưu tiên cao nhất, tiếp theo là giới hạn trần tường minh chung, rồi tới ngân sách tính năng.
- Chẩn đoán tách biệt giữa chính văn rỗng và bị cắt cụt; chỉ khi cổng kết nối thực sự trả về dấu hiệu suy luận mới báo là có nội dung suy luận. Không hiển thị nguyên văn suy luận, không quy kết mọi trường hợp chính văn rỗng là do cạn token suy luận.
- Khi không đặt giới hạn trần tường minh mà gặp chính văn rỗng do cắt cụt, hệ thống sẽ thử lại tối đa một lần với ngân sách mở rộng lên 8192; nếu có giới hạn trần tường minh sẽ không vượt qua. Lỗi HTTP/cổng kết nối không bị ngụy trang thành chính văn bình thường.
- Chiêu mộ tạo và xác minh trước, chỉ khi thành công và trạng thái không đổi mới trừ nguyên tử 100 Điểm Hệ Thống và lưu ứng viên; khi thất bại không trừ trước rồi hoàn sau, giữ nguyên ứng viên cũ.

## Bản ghi thao tác

- Phân biệt rõ giữa bản ghi hiển thị, chứng từ sổ cái và bản tóm tắt gửi vào cốt truyện. Làm mới kho hàng không còn đưa vào danh sách chờ gửi hiển thị; phân giải/thu hồi mặc định không tích chọn, hỗ trợ chọn tất cả, bỏ chọn tất cả, chọn theo phân loại, xóa trống danh sách hiển thị và xem trước nội dung gửi.
- Xem trước chỉ ghi vào ô nhập liệu chính để người dùng chủ động gửi đi; phân giải/thu hồi được gộp tóm tắt. Lối vào mới loại bỏ lớp bọc từ khóa mô-đun cũ; bản sao lịch sử gửi chỉ rút gọn các lớp bọc thao tác hệ thống cũ nhận diện được, không xóa lịch sử trò chuyện cũ, bản chụp nhanh bảng hay chứng từ giao dịch.
- Các giao dịch gốc mới có thêm nhật ký thao tác cục bộ lưu 100 mục gần nhất, không tự động gửi cho mô hình và không phải là lối vào hoàn tác.

## Thu nạp cốt truyện (Độc lập với Ước nguyện)

- Thiết bị đầu cuối thêm mới trang 「Thu nạp cốt truyện」, cũng có thể đi vào từ thanh công cụ của các trang liên quan. Mỗi lần chọn từ 1–10 tầng với tổng độ dài chính văn trợ lý không quá 24.000 chữ; có thể tùy chọn đính kèm mô tả thẻ nhân vật / một Sách Thế Giới để phục vụ phán đoán phẩm giai.
- Đầu ra của mô hình bắt buộc phải có bằng chứng nguyên văn từng chữ thực tế, tuyên bố quyền sở hữu rõ ràng, phân loại và số lượng nguyên dương; người dùng xem trước, tích chọn xác nhận quyền sở hữu và chỉnh lại số lượng / phẩm giai hệ thống rồi mới gửi lưu, không tự động nhận.
- Lưu lại phẩm giai thế giới gốc, thế giới, nguồn nguyên văn và chứng từ; hỗ trợ ánh xạ phẩm giai thế giới do người dùng xác nhận rõ ràng. Các mục chưa rõ phẩm giai được lưu tạm riêng thành 「Chờ giám định」 (`待鉴定`), không âm thầm đưa vào túi đồ dưới dạng Phàm phẩm; sau khi xác nhận thủ công mới chính thức nhập kho.
- Cùng một chứng từ nguồn không thể nhận lặp lại; vật phẩm cùng tên đã có sẵn mặc định từ chối nối thêm, chỉ khi xác nhận rõ là nhận thêm phần mới mới được tích chọn nối thêm; công pháp cùng tên không thêm lặp lại. Vật phẩm ghi vào túi đồ thống nhất, công pháp ghi vào kho công pháp thống nhất và đồng bộ bản chụp nhanh.
- Ghi bù không thu phí; vật phẩm chưa định giá có giá danh nghĩa là 1, việc đính chính phẩm giai không làm tăng giá thu hồi.

## Gắn kết đa nhân vật

- Hồ sơ đa nhân vật mới tạo ID ổn định dựa theo Thế giới + Họ tên, tương thích phản chiếu với mục 「恋爱目标」 (Mục tiêu tình yêu) cũ; khi động cơ cũ đổi họ tên gắn kết tại chỗ sẽ không kế thừa nhầm ID, độ hảo cảm và các trường không đổi của người trước đó.
- Danh sách gắn kết, tìm kiếm, xem chi tiết, chuyển đổi tường minh mục tiêu hiện tại và nhảy tới đồ phổ quan hệ. Chỉ xem chi tiết sẽ không làm đổi mục tiêu hiện tại và không phát thưởng; phân biệt người trùng tên xuyên thế giới, không tự động biến đả thủ / thành viên nhóm chat thành đối tượng tình yêu.

## Thương thành & Hộp mù

- Hai bộ tùy chỉnh độc lập: Hỗn hợp Chư Thiên / Thế giới hiện tại / Tác phẩm chỉ định, Đề tài, Phân loại, Công dụng, Mục loại trừ, Cho phép sáng tác gốc, Tránh trùng lặp gần đây / Cho phép lặp lại vật phẩm tiêu hao.
- Phân bổ phẩm giai và ô nội dung ngay tại máy cục bộ; tạo theo từng lô tối đa 8 món, mỗi lô bù khuyết tối đa 3 vòng; khử trùng lặp tên và hiệu quả tương tự trong cùng lô và gần đây, lưu lịch sử 160 mục, trong lời nhắc mang theo tối đa 50 mục.
- Thương thành 500 điểm / 8 món, cơ bản gồm 4 Phàm 3 Linh 1 Tiên, có 10% cơ hội thay 1 món bằng Thần phẩm. Hàng thông thường không bị giới hạn bởi cấp độ thương thành, cảnh giới hay thế giới; không cưỡng ép áp đặt hồi chiêu hay phản phệ để cân bằng.
- Hộp mù 10.000 điểm / lượt, mỗi lần rút từ 1–200 lượt: Phàm 60%, Linh 38%, Tiên 1.9%, Thần 0.1%; lượt thứ 100 bảo hiểm Tiên phẩm, nổ Thần phẩm không đặt lại bảo hiểm Tiên phẩm; Cấm kỵ không nằm trong bể hộp mù.
- Hàng Cấm kỵ chỉ kiểm tra tư cách khi nhận: ít nhất 10 tỷ Điểm Hệ Thống, ít nhất 1 Quân Bài Nhân Quả, 2% cơ hội xuất hiện khi nhập hàng; khi mua thanh toán giá kho hàng + 1 Quân Bài Nhân Quả và không áp dụng giảm giá. Sau khi nhận được không áp đặt thêm giới hạn sử dụng.
- Toàn bộ lô vượt qua kiểm tra hợp lệ mới gửi lưu chi phí, kho hàng / vật phẩm chờ xử lý và bảo hiểm trong một lần duy nhất; JSON hỏng, sản phẩm không đạt chuẩn hoặc cuộc trò chuyện/chính văn thay đổi trước khi gửi lưu sẽ hủy bỏ ngay, không trừ phí trước rồi hoàn tiền sau.

## Sách Thế Giới, Ký ức & An toàn bản lưu

- Sách Thế Giới cập nhật mục 09 Thương thành, bổ sung mục 05 Thu nạp / 11 Hộp mù / 29 Đa nhân vật; lời nhắc tạo hàng hóa độc lập sử dụng cùng bộ quy tắc này. Sách Thế Giới chỉ sửa sách hiện có khi người dùng xác nhận nâng cấp.
- Trước khi nâng cấp hiển thị rõ ảnh hưởng và tạo bản sao lưu toàn bộ quyển sách với tên duy nhất; đối chiếu trực tiếp tệp trên máy chủ để tránh bị bộ nhớ đệm của SillyTavern đánh lừa. Giữ nguyên mục từ tùy chỉnh, công tắc, từ khóa, cài đặt chèn và siêu dữ liệu cấp cao nhất; với mục từ tích hợp sẵn có chính văn đã tự sửa sẽ hỏi xác nhận từng mục một.
- Nâng cấp cấu trúc sổ cái 0/1→2 sao lưu trước, di chuyển dữ liệu mới bên trong khóa và đối chiếu định danh cuộc trò chuyện; các trường gốc mới không bị ghi đè bởi chỉ lệnh biến số thông thường của mô hình hay iframe cũ.

## Nâng cấp & Nghiệm thu

Xem danh sách thay thế từng tệp và các bước thao tác trong SillyTavern tại [REPLACE-1.1.0](REPLACE-1.1.0.md); xem phạm vi kiểm thử, bằng chứng và các mục chưa bao phủ tại [ACCEPTANCE-1.1.0](ACCEPTANCE-1.1.0.md).

## Sửa đổi qua đợt phúc tra trước khi bàn giao

Đợt phúc tra thứ hai đã phát hiện và sửa các lỗi: giám định/nhập/quay lui xuyên cuộc trò chuyện, thay thế toàn bộ làm trộn lẫn gắn kết cũ, hợp nhất trùng tên xuyên thế giới, kiểm tra tài nguyên Cấm kỵ bất hợp pháp, hạ cấp schema quyết toán dự phòng, xuất khóa ngữ nghĩa ký ức, mất bản sao cùng tên của Sách Thế Giới, giới hạn trần tường minh của kiểm tra kết nối cũ, xác nhận nối thêm mục chờ giám định, ánh xạ thế giới nguồn và dọn dẹp iframe. Chi tiết xem tại [REVIEW-1.1.0](REVIEW-1.1.0.md).
