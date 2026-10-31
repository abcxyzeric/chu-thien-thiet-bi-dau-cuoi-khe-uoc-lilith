# 1.1.0 · Rà soát vòng hai trước khi truyền tệp

> **Sổ theo dõi lịch sử**: tài liệu này ghi lại lần rà soát vòng hai. Các trạng thái như “tạm thời chưa truyền tệp / chờ nghiệm thu” tại thời điểm đó đã được thay thế bởi sự ủy quyền “chỉ bàn giao tệp” sau đó và bản vá vòng ba; các lỗi dữ liệu phát hiện thêm cùng kết quả kiểm thử hiện tại xem tại [PATCH-1.1.0-3](PATCH-1.1.0-3.md). Trạng thái chưa kiểm chứng trên mô hình thật / điện thoại vật lý vẫn không thay đổi.


Ngày: 2026-10-04. Bản cơ sở vẫn là nhánh `main` `ce29f61a9c254517fdf1fae2385b83b55cfa3688` của kho lưu trữ chỉ định. Vòng này kết nối lại địa chỉ MCP mới do người dùng cung cấp, chỉ thực hiện đọc thư mục, đối chiếu môi trường và cập nhật trạng thái nhiệm vụ; **chưa truyền tệp dự án lên máy từ xa, chưa ghi đè thư mục từ xa, chưa triển khai môi trường sản xuất**.

## Kết luận và trạng thái cho phép phát hành

**Gói ở vòng trước phát hiện có lỗi thực tế, không nên tiếp tục dùng làm gói cài đặt cuối cùng.** Đã sửa lỗi trong bản sao làm việc và kiểm chứng lại; vượt qua rà soát tự động hóa, nhưng việc nghiệm thu trên mô hình trả phí thật, điện thoại vật lý và thư mục cài đặt thực tế của người dùng vẫn chưa hoàn thành. Theo yêu cầu “không bỏ qua bước nào”, các mục này vẫn giữ ở trạng thái chờ nghiệm thu và tạm thời chưa mở khóa truyền tệp dự án. Báo cáo này không phải là “cam kết không có lỗi (zero-bug)”.

## Sổ theo dõi kiểm tra

| Hạng mục | Thực thi và kết luận vòng này |
|---|---|
| Kết nối mới, thư mục từ xa | Khởi tạo địa chỉ mới thành công; thư mục mở trên máy từ xa là thư mục tư liệu “Hệ thống” trên màn hình nền, bên trong thư mục con `1.0.0` chỉ có tệp ZIP bản cũ chứ không phải thư mục mã nguồn Git; không mạo nhận đó là thực thể cài đặt hiện tại |
| Bản cơ sở kho lưu trữ | HEAD cục bộ khớp với nhánh `main` trên GitHub vừa truy vấn lại, đều là `ce29f61` |
| Kiểm kê bề mặt sửa đổi | Kiểm tra các tệp chạy sửa đổi/thêm mới cùng các đường dẫn đọc/ghi liên quan; giữ nguyên tệp `vendor` gốc, không đổi không gian tên cài đặt máy chủ hay ID tiện ích mở rộng |
| Tương tác trên điện thoại | 360×640, 390×844, 844×390, 1400×900; bố cục từng trang điều hướng, giả lập bàn phím, kéo thu phóng cảm ứng, nút tròn bám mép trái/phải, đặt lại, ghi nhớ kích thước, hủy/dọn dẹp |
| API | Định tuyến mặc định / thiết lập sẵn / theo tính năng, giới hạn đầu ra tường minh, kết nối trực tiếp & chuyển tiếp CORS, chính văn rỗng / cắt cụt, phản hồi lỗi, phản hồi chậm 75 giây (không bỏ qua bài kiểm tra chậm) |
| Nhật ký / Đầu vào cốt truyện | Tích chọn phân loại xem trước, làm mới không tự gửi, dọn dẹp vỏ bọc phạm vi hẹp, không xóa cuộc trò chuyện gốc và chứng từ sổ cái |
| Thu thập / Phẩm giai | Bằng chứng, tuyên bố quyền sở hữu, số lượng, ánh xạ, chờ giám định, nguồn trùng lặp, thêm một phần mới, ảnh chụp nhanh công pháp, giá thu hồi ghi bổ sung; giám định ánh xạ theo thế giới nguồn của vật phẩm |
| Quan hệ nhiều người | Di chuyển mục tiêu cũ, ID ổn định, trùng tên xuyên thế giới, phân biệt xem/chuyển đổi, giữ lại nhân vật gốc, bảo vệ trường nguyên bản, sơ đồ quan hệ |
| Hàng hóa / Kết toán | Xác suất/bảo hiểm, khử trùng lặp ô hàng, chi phí, từ chối ghi đầu ra không đạt chuẩn, bấm lặp lại, hai lối vào mua hàng Cấm kỵ và dữ liệu tài nguyên không hợp lệ |
| Sách Thế Giới | Bản sao lưu duy nhất, đọc lại trực tiếp từ máy chủ, xung đột chính văn tự sửa, giữ lại mục trùng tên lặp lại, giữ lại công tắc/từ khóa/siêu dữ liệu, bảo vệ nâng cấp/thay đổi đồng thời |
| Ký ức / Bản lưu | Chuẩn hóa bí danh & kiểm tra bằng chứng, giữ nguyên `key` ngữ nghĩa ký ức, nhập/hoàn tác/di chuyển, bảo vệ phiên bản cấu trúc, xuất không chứa Key |
| Danh tính / Đồng thời / Thất bại | Chuyển đổi nhân vật trong quán rượu cô lập thật, giám định/nhập/hoàn tác trả về trễ đều từ chối ghi sổ xuyên cuộc trò chuyện; kiểm tra ghi xen ngang trong cùng cuộc trò chuyện; thất bại trước khi lưu không làm đổi dữ liệu, trạng thái không rõ sau khi lưu sẽ đóng băng các lệnh ghi xếp hàng |
| Vòng đời | Sau 5 lần dựng lại iframe, mỗi mô-đun chỉ giữ lại 1 phạm vi khung hình (`frame scope`) đang hoạt động, 1 mục gỡ cài đặt toàn cục, 1 thanh công cụ bản ghi; sau khi `dispose` giải phóng về 0 |
| Kiểm tra tĩnh / Đơn vị | Kiểm tra cú pháp, đối chiếu nguồn gốc, biên dịch Python, kiểm tra khoảng trắng diff, chạy lại 305 bài kiểm tra đơn vị |
| Tính toàn vẹn / Bảo mật bàn giao | Tạo lại gói ghi đè, kiểm tra chồng lớp lên bản cơ sở khớp toàn bộ `FILELIST`, CRC của tệp ZIP, mã băm từng tệp, rà soát lại đường dẫn / liên kết tượng trưng (symlink) / chuỗi nhạy cảm; không có Key người dùng |
| Mô hình thật / Điện thoại vật lý / Bản cài đặt thực tế của người dùng | **Chưa kiểm chứng, không tính là đạt, không lấy mô phỏng thay thế. Cần người dùng chỉ định thực thể và cấu hình mô hình được phép thử nghiệm, đồng thời cung cấp điều kiện kiểm tra trên máy thật** |

## Phát hiện và sửa lỗi

### Sổ cái và Nhân vật

- Khi nhân vật trùng tên được đổi rõ ràng sang một thế giới khác mà logic cũ vẫn dùng lại ID cũ: đã thêm bài kiểm tra phản ví dụ trên `Bridge` thật và kiểm tra đơn vị, hiện giữ lại cả hai người cùng độ hảo cảm riêng của từng người.
- Chuyển cuộc trò chuyện trong lúc giám định đang chờ mô hình, nhập bản lưu đang chờ sao lưu, hoặc hoàn tác đang chờ sao lưu bị thiếu bước bắt cố định mục tiêu xuyên suốt: hiện đã cố định danh tính trước khi tạo / trước khi sao lưu, kiểm tra lại trước khi cam kết và bên trong khóa; thêm bài kiểm tra chọn sang nhân vật khác thực tế chứ không chỉ thay hàm danh tính giả.
- Nhập tổng thể / hoàn tác đi nhầm vào nhánh đồng bộ quan hệ tăng thêm nên có thể trộn lẫn mục tiêu trước khi nhập: đã phân biệt rõ giữa thay thế toàn bộ sổ cái và cập nhật tăng thêm.
- Kết toán nguyên bản dự phòng mã hóa cứng `schema 1` và chưa từ chối phiên bản tương lai: đã đổi sang dùng `schema 2` hiện tại và kiểm tra ranh giới chỉ đọc.
- Bổ sung bảo vệ cho các trường hợp biên: chuyển cuộc trò chuyện trong lúc đang xem trước nhập bản lưu, sổ cái thay đổi sau khi sao lưu, bấm nhập lặp lại, lưu phiên bản cấu trúc chưa được xác minh.

### Hàng hóa, Thu thập và Giám định

- Trong giao dịch mua hàng Cấm kỵ, biểu thức `Number(undefined/NaN/văn_bản_lỗi) < 1` trả về `false` nên có thể lọt qua bước kiểm tra điều kiện: cả hai đường dẫn mua hàng đều đã thống nhất kiểm tra số nguyên an toàn và tối thiểu 1 phỉnh.
- Tạm lưu chờ giám định chưa giữ lại dấu tích “rõ ràng là một phần mới nhận thêm” của người dùng nên sau đó không thể cộng thêm: hiện đã giữ lại cờ xác nhận này và tiếp tục dùng chứng từ nguồn gốc để chống trùng lặp.
- Giám định lại sử dụng ánh xạ của thế giới đang du hành hiện tại thay vì thế giới nguồn của vật phẩm: ứng viên hiện mang theo phẩm giai thế giới gốc và thế giới nguồn, lời nhắc sử dụng đúng bảng ánh xạ tương ứng.
- Trong lúc chờ mua hàng, nội dung đã thay đổi nhưng tên/giá không đổi: khi cam kết sẽ so sánh toàn bộ ảnh chụp nhanh của mục ứng viên, nếu có thay đổi sẽ từ chối ghi.

### Sách Thế Giới, API, Xuất bản lưu và Giao diện

- Khi có nhiều bản của mục tích hợp sẵn trùng tên, việc gộp bằng `Map` có thể làm mất bản sao của người dùng: hiện chỉ cập nhật bản đầu tiên, các mục trùng lặp còn lại giữ nguyên.
- Nâng cấp Sách Thế Giới bổ sung bảo vệ chống gửi trùng lặp và kiểm tra thay đổi trước khi cam kết; bản vá đó từng ảnh hưởng nhầm sang công tắc mô-đun thông thường, bộ hồi quy trình duyệt mở rộng đã bắt được lỗi `readDisk is not defined`, hiện đã sửa xong và bổ sung bài kiểm tra đơn vị chuyên biệt, sau đó chạy lại toàn bộ bộ kiểm thử mô-đun / API chậm.
- Bài kiểm tra kết nối cũ ép nâng mức giới hạn 1000 tường minh của người dùng lên 4096: hiện giới hạn tường minh chung / theo tính năng đều được ưu tiên thống nhất, bao gồm cả đường dẫn trợ lý đi qua API chính của quán rượu.
- Hàm làm sạch trường nhạy cảm chung xóa nhầm trường ngữ nghĩa `key` của bản ghi ký ức cũng như tên thế giới đặc biệt `__proto__`: hiện giữ nguyên trường ngữ nghĩa và khóa dữ liệu thông thường, tiếp tục xóa sạch Key cấu hình API thực sự và tránh làm thay đổi nguyên mẫu đối tượng (`Object.prototype`).
- Bộ tăng cường iframe mới tích tụ các đóng gói (`closure`) `document` cũ trong danh sách dọn dẹp toàn cục: đã đổi sang vùng tài nguyên khung hình đang hoạt động (`frameScope`), khi dựng lại sẽ dọn vùng cũ và giải phóng tất định khi `pagehide` / tắt tiện ích.

## Kết quả vòng này (Không dùng lại bản ghi vòng trước)

### Kiểm tra đơn vị / Kiểm tra tĩnh

- Chạy lại trước khi vá: đạt 285/285; sau đó thêm các phản ví dụ hướng phủ định và thực sự tái hiện được các kẽ hở bị sót, lưu lại nhật ký thất bại.
- Sau khi vá: **đạt 305/305**, trong đó vòng này thêm mới 20 mục. Các phản ví dụ mới bao phủ đầy đủ những điều kiện lỗi quan trọng nêu trên.
- `npm run check`, `git diff --check` và biên dịch các kịch bản kiểm thử Python đã sửa đều vượt qua; giữ nguyên mã băm nguồn `vendor`.

### Trình duyệt máy chủ cô lập: 8 nhóm, tổng cộng vượt qua 238 mục

| Bộ kiểm thử | Đạt |
|---|---:|
| `native_v084`: API trực tiếp/chuyển tiếp, phản hồi chậm 75 giây, mô-đun Sách Thế Giới, bảng màu, tương thích làm đẹp bên ngoài | 29/29 |
| `native_v090`: bố cục màn hình hẹp/xoay ngang/toàn trang, bàn phím giả lập, kích thước máy tính | 24/24 |
| `native_v091`: thu gọn theo bàn phím, công cụ chẩn đoán & tự kiểm tra (chạy trong thiết bị mô phỏng) | 35/35 |
| `native_v093`: đọc Sách Thế Giới, đính chính Bản đồ sao, hướng dẫn tân thủ | 29/29 |
| `native_v100`: bản lưu, hoàn tác, schema 2, cài đặt, xoay ngang | 28/28 |
| `native_v100_feedback`: thiết lập sẵn/định tuyến riêng, giám định, công tắc, ảnh đứng cảm ứng | 44/44 |
| `native_v110`: tính năng mới, lỗi lưu, nút mở tròn cảm ứng | 37/37 |
| `native_v110_review`: hướng phủ định chuyển cuộc trò chuyện thật, thay thế tổng thể, hai lối vào mua hàng, Sách Thế Giới trùng mục, vòng đời | 12/12 |

Máy chủ là SillyTavern 1.19.0 cô lập `7e8663c`; mô hình là giả lập tất định. Tất cả các bộ kiểm thử đều không có `pageerror` chưa bắt. Không tuyên bố đã chạy hết toàn bộ kịch bản lịch sử của mọi phiên bản hay mọi phiên bản máy chủ; trên đây là tập hợp hồi quy được chọn theo các đường dẫn sửa đổi lần này và đã chạy trọn vẹn.

### Xử lý vấn đề môi trường kiểm thử (Không che giấu lỗi thất bại)

- Hồi quy phản hồi API cũ ở vòng đầu thất bại: thư mục cha chứa nhật ký của máy chủ giả lập chưa được tạo nên máy chủ ném lỗi `FileNotFoundError`; sau khi tạo thư mục nhật ký kiểm thử và chạy lại đã đạt 44/44. Không phải ép cho lỗi cổng kết nối vượt qua.
- Hồi quy điện thoại / tự kiểm tra cũ ở vòng đầu kế thừa cài đặt tắt ảnh đứng của bộ kiểm thử chạy ngay trước đó: đã đặt tường minh `auto` ở đầu hai bộ kiểm thử, giữ nguyên các kiểm tra gốc và chạy lại đạt lần lượt 24/24 và 35/35.
- Bài kiểm tra đơn vị cũ từng phụ thuộc vào lát cắt cố định 700 ký tự / đoạn câu lệnh cố định để định vị hàm hoàn tác và nhập bản lưu: đã đổi sang định vị theo phạm vi hàm / lời gọi ổn định mà không xóa kiểm tra sao lưu trước khi ghi.
- Quét định dạng khóa phát hiện Key giả lập cố định trong tệp kiểm thử cũ của kho lưu trữ; sau khi đối chiếu với bản cơ sở xác nhận đó là dữ liệu mẫu (`fixture`) kiểm thử cô lập, không báo nhầm thành Key người dùng và cũng không giấu bản ghi khớp. Trong các tệp chạy không phát hiện thông tin xác thực thật nào.

## Những mục vẫn cần bổ sung hoàn thiện

1. Thư mục cài đặt thực tế của người dùng hiện chưa được chỉ định / đối chiếu, không thể coi thư mục chứa tệp ZIP tư liệu từ xa là thư mục tiện ích sản xuất để ghi đè lên.
2. Không tự ý dùng Key của người dùng để gửi yêu cầu có tính phí. Mô hình thật cần được người dùng ủy quyền gọi trong cuộc trò chuyện thử nghiệm, đồng thời đối chiếu độ chân thực nguyên tác, ý nghĩa phẩm giai và chất lượng khử trùng lặp nội dung.
3. Cảm ứng, bàn phím ảo, thanh công cụ trình duyệt và khôi phục từ chạy nền trên Android/iPhone vật lý cần thao tác trên máy thật; mô phỏng cảm ứng và khung nhìn trên Chromium chỉ là bằng chứng hỗ trợ.

Trước khi xác nhận xong các ranh giới nghiệm thu này, gói sửa đổi chỉ lưu lại trong không gian làm việc cục bộ, không tải lên địa chỉ MCP mới và không triển khai vào quán rượu của người dùng.
