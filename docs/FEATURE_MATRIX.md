# Ma trận di chuyển năng lực nguyên bản · 1.1.5

> **Bản chính thức 1.1.5**:
> - Nhân cách trợ lý hệ thống (mặc định Lilith / Quang cầu Hệ thống / Tùy chỉnh): đã hiện thực hóa, nghiệm thu kiểm tra đơn vị + trình duyệt; hiệu quả nhập vai chỉ mới dùng mô hình giả lập (thử nghiệm);
> - Công tắc tính năng (37 mục + Trang thiết bị đầu cuối + lối tắt nhảy tới các công tắc theo cuộc trò chuyện): đã hiện thực hóa, nghiệm thu trình duyệt;
> - Nhóm chat 「Triệu hồi từ Sách Thế Giới」 và tiêm ký ức thành viên nhóm: thử nghiệm, chỉ mới nghiệm thu bằng mô hình giả lập, không ghi vào Sách Thế Giới.
>
> | Năng lực 1.1.5 | Kiểm chứng vòng này | Ranh giới |
> |---|---|---|
> | Nhân cách thay thế quy tắc Sách Thế Giới (không ghi tệp) | Trong yêu cầu tạo văn bản thực tế có quy tắc nhân cách, tệp Sách Thế Giới không đổi | Các mục từ điển khác đổi tên cơ học; máy chủ không có sự kiện WI sẽ chuyển sang dùng lời nhắc ghi đè |
> | Trò chuyện riêng / Ký ức / Bàn làm việc theo nhân cách | Giao diện trò chuyện riêng thực tế → lời nhắc hệ thống của yêu cầu là nhân cách mới | Hiệu quả nhập vai trên mô hình thật chưa kiểm chứng |
> | Giao diện nhân cách (tên / ảnh đại diện / khung thoại / đổi về) | Nghiệm thu trình duyệt, không cần làm mới trang | Ảnh đứng / chạm tương tác / lơ lửng chỉ thuộc về Lilith |
> | Công tắc tính năng / Ẩn trang | Nghiệm thu trình duyệt cho Nhóm chat, lệnh gạch chéo, trang Thương thành | 「Cửa sổ trợ lý hệ thống」 có hiệu lực sau khi làm mới trang |
> | Triệu hồi từ Sách Thế Giới / Ký ức thành viên nhóm | Triệu hồi → vào nhóm → trò chuyện nhóm mang mục từ điển → chính văn tiêm ký ức, sau khi tắt không còn tiêm | Thử nghiệm; chưa thử nghiệm trên điện thoại vật lý |
>
> **1.1.4**:
> - Nhóm chat: xóa từng tin / tạo lại (reroll) lượt gần nhất (cấm khi đã nhận lì xì · quà tặng) / cảnh báo cắt cụt / cài đặt tạo trò chuyện nhóm, đều là thử nghiệm, chỉ mới nghiệm thu bằng mô hình giả lập;
> - Sửa lỗi đóng băng nhầm khi kiểm tra đọc lại sau khi ghi và nút 「Kiểm tra và mở khóa sổ cái」;
> - Làm sạch khóa ký ức;
> - Bảo vệ chuỗi suy nghĩ (tắt bản nháp khối dữ liệu, kết xuất / ràng buộc / lọc bỏ qua chuỗi suy nghĩ) và 「Kiểm tra tầng tin nhắn mới nhất」;
> - Sách hướng dẫn ngay trong thiết bị đầu cuối.
>
> **1.1.3**: Tách riêng 「Chuyển đổi」 và 「Đóng」 cửa sổ nổi (ảnh đại diện cũng có thể đóng), kích thước tối thiểu 20%, nút × của thiết bị đầu cuối chỉ đóng thiết bị đầu cuối; rút thẻ Gộp cổ điển chỉ gọi API một lần.
>
> **1.1.2**: Chuyển đổi chế độ rút thẻ (mặc định Gộp cổ điển / Kết toán mỗi 10 lượt), làm lại trang Quan hệ và 「Kéo vào Quan hệ」 cho thành viên nhóm, chuyển Bảng điều khiển Quản trị viên thành trang bên trong thiết bị đầu cuối (bảo hiểm hộp mù, độ hảo cảm của bất kỳ nhân vật quan hệ hay thành viên nhóm nào, từ chối ghi khi xung đột).

> **1.1.1**: Bảo hiểm Thần phẩm 1000 lượt rút, nhận diện linh hoạt và đăng ký bù lì xì nhóm, Bảo vệ định dạng khối dữ liệu (tự động chỉnh lý / nhắc định dạng / nhắc công pháp cốt truyện / ghi bổ sung khi thiếu · thử nghiệm), sửa lỗi trang bị đẩy lên trên, ảnh đại diện trên điện thoại tránh thanh trạng thái, tự động giảm lô khi hộp mù bị cắt cụt và kết toán mỗi 10 lượt; sửa lỗi rà soát trước phát hành (thao tác vật phẩm ghi một lần, ghi bổ sung chống ghi đè / chống nhảy nhầm cuộc trò chuyện, khôi phục nguyên văn đầy đủ, xếp chồng nghiêm ngặt, tạo lại không cộng dồn tài sản). Xem [CHANGES-1.1.1](CHANGES-1.1.1.md).

> **Bản sửa đổi mới nhất 1.1.0-patch3**: 330/330 bài kiểm tra đơn vị, 10 bộ trình duyệt 301/301. Ba bản sửa lỗi P1 cùng chẩn đoán ngữ cảnh bảo mật / giao thức / Web Locks / lưu thất bại xem tại [PATCH-1.1.0-3](PATCH-1.1.0-3.md). Các kết quả 305/238 của lần rà soát trước bên dưới là thuộc lô lịch sử, không phải tổng số mới nhất. Mô hình thật và điện thoại vật lý vẫn chưa kiểm chứng.


Rà soát vòng hai: vượt qua 305 bài kiểm tra đơn vị, 8 nhóm trình duyệt 238 mục, chi tiết xem [Sổ theo dõi rà soát](REVIEW-1.1.0.md); không đồng nghĩa với nghiệm thu trên mô hình thật hoặc điện thoại vật lý.

1.1.0: Cửa sổ nổi cảm ứng trên điện thoại và nút mở tròn bám sát mép, Thu thập cốt truyện, Quan hệ đa mục tiêu, Tùy chỉnh & tránh trùng lặp cho cửa hàng/hộp mù, chẩn đoán ngân sách API / chính văn rỗng, xem trước nhật ký, giữ lại mục xung đột khi sao lưu Sách Thế Giới, bí danh ký ức, di chuyển an toàn schema 2. Xem [CHANGES-1.1.0](CHANGES-1.1.0.md), [ACCEPTANCE-1.1.0](ACCEPTANCE-1.1.0.md).

| Năng lực thêm mới / sửa lỗi trong 1.1 | Kiểm chứng vòng này | Ranh giới |
|---|---|---|
| Chuyển đổi cửa sổ nổi / kéo thu phóng cảm ứng / đặt lại, nút mở tròn bám mép trái/phải | Vượt qua sự kiện cảm ứng Chromium cô lập | Chưa thử trên điện thoại vật lý |
| Thu thập cốt truyện / Chờ giám định / Nhập kho thống nhất | Vượt qua kiểm tra đơn vị + mô hình giả lập + máy chủ thật | Thế giới quan và quyền sở hữu phải đối chiếu thủ công |
| Quan hệ nhiều người và Sơ đồ quan hệ | Vượt qua kiểm tra đơn vị + trình duyệt | Không tự động bịa bù các nhân vật lịch sử bị thiếu |
| Tùy chỉnh hàng hóa / xác suất / khử trùng lặp có giới hạn / chi phí nguyên tử | Vượt qua kiểm tra đơn vị + mô hình giả lập + máy chủ thật | Độ chân thực nguyên tác và khử trùng lặp ngữ nghĩa chưa nghiệm thu trên mô hình thật |
| Giới hạn đầu ra API / cắt cụt, bí danh ký ức | Ngân sách yêu cầu vượt qua trên trình duyệt; ký ức vượt qua kiểm tra đơn vị | Cổng kết nối cụ thể / mô hình thật vẫn là thử nghiệm |
| Tích chọn / xem trước bản ghi và dọn dẹp phạm vi hẹp | Vượt qua kiểm tra đơn vị + trình duyệt | Không xóa cuộc trò chuyện cũ, không hoàn tác giao dịch |
| Sao lưu Sách Thế Giới / giữ lại xung đột; đóng băng khi trạng thái lưu không rõ | Vượt qua tiêm lỗi máy chủ cô lập | Sau khi giữ lại mục xung đột phải gộp quy tắc mới thủ công |
| 1.1.2 Chế độ rút thẻ (mặc định Gộp cổ điển / Kết toán mỗi 10 lượt) | Vượt qua kiểm tra đơn vị + mô hình giả lập + máy chủ thật | Dòng gộp là bản ghi tổng hợp, không tạo tên và hiệu quả từng món; lô lớn trên mô hình thật (ở 1.1.2 là 20 món một lô) chưa nghiệm thu |
| 1.1.4 Nhóm chat: Xóa / Tạo lại (reroll) / Cảnh báo cắt cụt / Cài đặt tạo trò chuyện nhóm | Vượt qua kiểm tra đơn vị + trình duyệt mô hình giả lập (thay thế khi reroll, cấm sau khi đã nhận, giữ lượt cũ khi thất bại, giới hạn xóa, bỏ nửa dòng khi cắt cụt, giới hạn đầu ra đi vào yêu cầu) | Thử nghiệm; chỉ nhận diện cắt cụt trên API độc lập; tin nhắn trước 1.1.3 không thể reroll |
| 1.1.4 Sửa lỗi đóng băng nhầm khi đọc lại, Kiểm tra và mở khóa sổ cái | Kiểm tra đơn vị (biến thẻ khác thay đổi / lưu trễ lưu lại / lỗi thật vẫn đóng băng) + trình duyệt (khi khớp mở khóa không cần làm mới, khôi phục quyền ghi) | Trạng thái đóng băng chỉ nằm trong bộ nhớ trang; khi không khớp phải tải lại trang |
| 1.1.4 Làm sạch khóa ký ức | Vượt qua kiểm tra đơn vị (dấu chấm giữa / dấu hai chấm / khoảng trắng / chữ Kana / toàn giác / trùng lặp / từ nguy hiểm) | Giữ nguyên kiểm tra nguyên bản, các quy tắc khác (số lượng, bằng chứng) vẫn từ chối như cũ |
| 1.1.4 Bảo vệ chuỗi suy nghĩ, tắt bản nháp khối dữ liệu, kiểm tra tầng tin nhắn | Kiểm tra đơn vị + tạo văn bản thực tế với mô hình giả lập (giữ nguyên chuỗi suy nghĩ và chính văn, khối chính thức vào sổ, 1 thẻ thoại, báo cáo liệt kê toàn bộ lời nhắc tiện ích mở rộng) | Lỗi ảnh chụp màn hình ở cuộc trò chuyện không phải Chư Thiên chưa tái hiện được; không sửa các mục độ sâu 0 trong Sách Thế Giới |
| 1.1.4 Sách hướng dẫn ngay trong thiết bị đầu cuối | Kiểm tra đơn vị (thoát ký tự HTML / mục lục) + trình duyệt (tải trang, tìm kiếm) | Chỉ đọc |
| 1.1.3 Gộp cổ điển gọi API một lần (phần gộp chỉ đếm số lượng) | Vượt qua kiểm tra đơn vị + trình duyệt mô hình giả lập (49 / 60 / 120 lượt rút mỗi lần đều chỉ 1 yêu cầu) | Chưa nghiệm thu mô hình thật xuất 40+ món trong một lần; khi bị cắt cụt sẽ tự giảm một nửa và thử lại, lúc đó sẽ nhiều hơn 1 yêu cầu |
| 1.1.3 Chuyển đổi / đóng cửa sổ nổi, đóng ảnh đại diện, kích thước 20% | Vượt qua kiểm tra đơn vị + trình duyệt (mô phỏng cảm ứng Pixel 7 + máy tính) | Chưa thử trên điện thoại vật lý |
| 1.1.2 Làm lại trang Quan hệ, kéo / đưa thành viên nhóm ra khỏi Quan hệ | Vượt qua kiểm tra đơn vị + trình duyệt (ảnh chụp màn hình máy tính và màn hình hẹp 390px) | Chưa thử trên điện thoại vật lý; nhân vật cùng tên khác thế giới không gộp chung |
| 1.1.2 Trang mới cho Bảng điều khiển Quản trị viên | Vượt qua kiểm tra đơn vị + trình duyệt (từ chối ghi khi xung đột, báo lỗi vượt ngưỡng, đồng bộ ảnh chụp nhanh) | Sửa trực tiếp sổ cái, ở phản hồi tiếp theo AI mới thuật lại theo chỉ số mới |


1.0.0: (Bổ sung từ phản hồi người chơi, giữ nguyên số phiên bản: Giám định phẩm giai, API theo từng tính năng & thiết lập sẵn cổng, Tắt tiện ích một chạm, Đóng Lilith nổi) Ảnh đứng tách nền Lilith nổi, phân tầng & tìm kiếm cài đặt, Xuất / Nhập bản lưu, phiên bản cấu trúc sổ cái, bắt buộc sao lưu trước khi hoàn tác, thông báo lỗi thống nhất, tinh giản thanh điều hướng ngang trên điện thoại, tự động giảm nhẹ hiệu ứng động, `LICENSE`; các năng lực liên quan đến mô hình thật được đánh dấu là 「Thử nghiệm」. Xem [CHANGES-1.0.0](CHANGES-1.0.0.md), [ACCEPTANCE-1.0.0](ACCEPTANCE-1.0.0.md); bảng năng lực xem mục 「II.18」 bên dưới.

0.9.4: Ô nhập liệu của lệnh chiêu mộ nhóm chat tự đi theo chế độ (khi đang chọn 「Thế giới ngẫu nhiên」 mà gõ chữ sẽ tự động đổi sang 「Chỉ định thế giới」; khi chọn chỉ định mà chưa điền tên sẽ không trừ phí), xem [CHANGES-0.9.4](CHANGES-0.9.4.md), [ACCEPTANCE-0.9.4](ACCEPTANCE-0.9.4.md); bảng năng lực xem mục 「II.6」 bên dưới.

0.9.3: Quy tắc → Bối cảnh thế giới bổ sung đọc Sách Thế Giới, Bản đồ sao đính chính thế giới bị tự động nhận diện sai, Hướng dẫn tân thủ, xem [CHANGES-0.9.3](CHANGES-0.9.3.md), [ACCEPTANCE-0.9.3](ACCEPTANCE-0.9.3.md); bảng năng lực xem mục 「II.17」 bên dưới.

0.9.2: Sửa lỗi phản hồi trên máy thật (lời thoại Lilith không còn xuất hiện hai lần, nguyên văn thanh trạng thái không còn lộ ra ngoài, lời thoại trong khối mã giữ nguyên), xem [CHANGES-0.9.2](CHANGES-0.9.2.md), [ACCEPTANCE-0.9.2](ACCEPTANCE-0.9.2.md); bảng năng lực xem mục 「II.16」 bên dưới.

0.9.1: Tự kiểm tra trên điện thoại thật, Sao chép thông tin chẩn đoán, nhận diện bàn phím làm thu thấp toàn trang, xuống dòng LF + `.gitattributes`, CI, xem [CHANGES-0.9.1](CHANGES-0.9.1.md), [ACCEPTANCE-0.9.1](ACCEPTANCE-0.9.1.md); bảng năng lực xem mục 「II.15」 bên dưới.

0.9.0: Tương thích giao diện điện thoại (thiết bị đầu cuối và trò chuyện riêng toàn màn hình, đi theo bàn phím, điều hướng cột trái khi xoay ngang, mục tiêu chạm & ô nhập 16 px, Lilith nổi nhường chỗ, kích thước cửa sổ máy tính không bị ghi đè), xem [CHANGES-0.9.0](CHANGES-0.9.0.md), [ACCEPTANCE-0.9.0](ACCEPTANCE-0.9.0.md), [ROADMAP-1.0](ROADMAP-1.0.md); bảng năng lực xem mục 「II.14」 bên dưới.

0.8.5: Sửa lỗi tầng mới nhất trên điện thoại không kết xuất, dàn trang bản tân thủ cho cài đặt cổng AI, giải thích và hướng dẫn kiểm nghiệm sổ cái, xem [CHANGES-0.8.5](CHANGES-0.8.5.md), [ACCEPTANCE-0.8.5](ACCEPTANCE-0.8.5.md); bảng năng lực xem mục 「II.13」 bên dưới.

0.8.4: Truyền phát trực tuyến (streaming) API và thời gian chờ tùy chỉnh, trò chuyện riêng ngay trong thiết bị đầu cuối, một nơi cài đặt API duy nhất, bảng màu, công tắc mô-đun mạnh, tương thích làm đẹp tầng tin nhắn, xem [CHANGES-0.8.4](CHANGES-0.8.4.md), [ACCEPTANCE-0.8.4](ACCEPTANCE-0.8.4.md); bảng năng lực xem mục 「II.12」 bên dưới.

0.8.3 Chỉnh sửa Lilith nổi: tùy chỉnh kích thước (mặc định 75%), khi thiết bị đầu cuối đang mở bấm vào cô ấy không còn làm đóng thiết bị đầu cuối, sau khi bước ra không còn tự động rụt lại vào mép, xem [CHANGES-0.8.3](CHANGES-0.8.3.md), [ACCEPTANCE-0.8.3](ACCEPTANCE-0.8.3.md); bảng năng lực xem mục 「II.11」 bên dưới.

0.8.2 Thêm mới gỡ liên kết Sách Thế Giới (một chạm / tự động khi tắt tiện ích), Lilith nổi trên điện thoại, sửa lỗi thanh trạng thái riêng của thẻ nhân vật, cân bằng kinh tế & giới hạn tần suất nhóm chat, xem [CHANGES-0.8.2](CHANGES-0.8.2.md), [ACCEPTANCE-0.8.2](ACCEPTANCE-0.8.2.md); bảng năng lực xem mục 「II.10」 bên dưới.

0.8.1 Sửa lỗi lấy danh sách mô hình ở trang kết nối Lilith, chiêu mộ / định giá / nhịp độ lì xì / nguồn gốc cốt truyện của nhóm chat, đồng thời cung cấp cập nhật và xuất JSON bản Sách Thế Giới của tiện ích, xem [CHANGES-0.8.1](CHANGES-0.8.1.md), [ACCEPTANCE-0.8.1](ACCEPTANCE-0.8.1.md); bảng năng lực xem mục 「II.9」 bên dưới.

0.8.0 Thống nhất giao diện Lilith và thiết bị đầu cuối, bong bóng thoại trên ảnh đứng, sửa lỗi đồng nhất Điểm Hệ Thống, lối vào Bảng điều khiển Quản trị viên, lối vào Phụ trợ tự tạo, hiệu quả thực tế của độ thuần thục và nhập công pháp từ thẻ nhân vật, xem [CHANGES-0.8.0](CHANGES-0.8.0.md), [ACCEPTANCE-0.8.0](ACCEPTANCE-0.8.0.md); bảng năng lực xem mục 「II.8」 bên dưới.

0.7.0 Thêm mới chủ đề thế giới, nhân vật giao diện & góc máy quay Lilith, Đồ phổ, Hoạt cảnh diễn xuất, và ngừng cung cấp thanh trạng thái trong tầng tin nhắn (chế độ tương thích cũ), xem [CHANGES-0.7.0](CHANGES-0.7.0.md), [ACCEPTANCE-0.7.0](ACCEPTANCE-0.7.0.md); bảng năng lực xem mục 「II.7」 bên dưới.

0.6.0 Thêm mới 「Nhóm Chat Chư Thiên Vạn Giới」 bên trong thiết bị đầu cuối, xem [CHANGES-0.6.0](CHANGES-0.6.0.md), [ACCEPTANCE-0.6.0](ACCEPTANCE-0.6.0.md); bảng năng lực xem mục 「II.6」 bên dưới.

0.5.0 Thu gọn toàn bộ hệ thống vào một cửa sổ duy nhất 「Thiết Bị Đầu Cuối Chư Thiên」: engine thanh trạng thái nguyên bản, phụ trợ, cài đặt đều nằm trong thiết bị đầu cuối, tầng tin nhắn trò chuyện không còn hiển thị thanh trạng thái lớn. Xem [CHANGES-0.5.0](CHANGES-0.5.0.md), [ACCEPTANCE-0.5.0](ACCEPTANCE-0.5.0.md).

Mục tiêu của bản 0.4.0 là: **chỉ cần cài tiện ích này là có thể thay thế toàn bộ nội dung cài đặt của 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 v1.1**.
Nội dung cài đặt của v1.1 bao gồm:
- Sách Thế Giới phụ trợ;
- 4 kịch bản biểu thức chính quy (regex);
- Kịch bản Tavern Helper 「Không Gian Khế Ước Lilith v1.1」.

Đối chiếu từng mục xem tại [CHANGES-0.4.0](CHANGES-0.4.0.md), chi tiết nghiệm thu xem tại [ACCEPTANCE-0.4.0](ACCEPTANCE-0.4.0.md).

## Giải thích trạng thái

- **Đã nghiệm thu**: đã thực hiện nghiệm thu trình duyệt đầu-cuối (end-to-end) trên máy chủ SillyTavern cô lập thực tế. Trong ngoặc là các phiên bản đã nghiệm thu.
- **Đã nghiệm thu (Mô hình giả lập)**: toàn bộ luồng đã chạy thông suốt trên SillyTavern thật, bao gồm bấm nút, gửi yêu cầu (đi qua đường ống yêu cầu thật của ST hoặc API độc lập), phân tích cú pháp, ghi trả lại và cập nhật giao diện.
  Tuy nhiên câu trả lời đến từ mô hình giả lập cục bộ `tests/qa/mock_model.py` vốn trả về đáp án đúng định dạng theo lời nhắc nguyên bản.
  **Chưa kết nối với mô hình thật để chạy thử**, nên không đại diện cho chất lượng đầu ra hay mức độ tuân thủ định dạng của bất kỳ mô hình cụ thể nào.
- **Thử nghiệm** (từ bản 1.0 trở đi): các năng lực liên quan tới mô hình thật. Luồng xử lý đã chạy thông suốt theo mức 「Đã nghiệm thu (Mô hình giả lập)」, nhưng chưa nối với mô hình thật để nghiệm thu, cả giao diện lẫn README đều ghi chú rõ như vậy; trạng thái trong `src/contracts.js` là `experimental`.
- **Đã nghiệm thu ở 0.2 / 0.3**: phiên bản hiện tại không sửa đổi phần này, kế thừa kết quả nghiệm thu tại thời điểm đó.
- **Chưa bấm thử từng mục**: giao diện và logic đã di chuyển sang, nhưng khi nghiệm thu chưa bấm thử từng nút một.
- **Chưa hoàn thành / Chưa hỗ trợ**: đúng như nghĩa đen.

## I. Thay thế nội dung cài đặt của bản v1.1

| Nội dung cài đặt v1.1 | Thay thế bên trong tiện ích | Trạng thái |
|---|---|---|
| Sách Thế Giới phụ trợ (35 mục) | Khi mở cuộc trò chuyện Chư Thiên sẽ tự động cài đặt và liên kết làm Sách Thế Giới trò chuyện; nếu đã tồn tại sẽ không ghi đè; khi đang liên kết Sách Thế Giới trò chuyện khác sẽ không chiếm quyền; không phụ thuộc MVU của thẻ nhân vật | **Đã nghiệm thu** (1.16–1.19). Trong lời nhắc thực sự có chứa nguyên văn quy tắc thường trực, các macro bên trong cũng đã được thay thế bằng giá trị sổ cái |
| Ngân sách Sách Thế Giới | Bảng chẩn đoán hiển thị “Ngân sách Sách Thế Giới”, khi không đủ có thể điều chỉnh một chạm cài đặt ngân sách của ST; nếu nâng lên 100% vẫn không đủ sẽ nhắc người dùng tăng ngữ cảnh | **Đã nghiệm thu** (1.16–1.19): ngữ cảnh 16k kèm ngân sách 25% sẽ báo động, sau khi điều chỉnh một chạm sẽ trở lại bình thường |
| Regex · Thanh trạng thái 3.1 | Từ 0.5.0 mặc định do **engine nguyên bản trong thiết bị đầu cuối** ghi sổ, ở tầng tin nhắn chỉ để lại nhãn nhỏ 「Hệ thống đã ghi nhận」; ở chế độ tương thích vẫn kết xuất trong tin nhắn (từ 0.7.0 trong Cài đặt không còn cung cấp chế độ tương thích, bản lưu cũ tự động chuyển sang chế độ thiết bị đầu cuối một lần; mã nguồn vẫn giữ lại) | **Đã nghiệm thu** (1.16–1.19): ở chế độ thiết bị đầu cuối trong tầng có 0 thanh trạng thái, 3 nhãn nhỏ, engine ghi vào cùng một `面板账本`; 70 mục hồi quy chế độ tương thích của 0.4.0 đều vượt qua |
| Regex · Khung thoại độc quyền của Lilith | Thẻ thoại nguyên bản, **có thể bật/tắt**; không hiển thị từ chỉ cảm xúc; hỗ trợ Markdown nội dòng; tự đổi ảnh đại diện theo ngữ khí | **Đã nghiệm thu** (1.16–1.19), bao gồm cả bật/tắt qua lại |
| Regex · Không gửi tầng cũ cho AI | Bộ chặn chỉ bóc tách các bảng dữ liệu cũ khỏi lời nhắc gửi cho mô hình, bản lưu trò chuyện không thay đổi | **Đã nghiệm thu** (1.16–1.19): trong lời nhắc chỉ có tầng ở độ sâu 1 giữ lại bảng dữ liệu; trong bản lưu bảng dữ liệu vẫn còn nguyên |
| Regex · Hiển thị rút gọn tầng cũ | Giữ lại trong chế độ tương thích (từ 0.7.0 không còn cung cấp trong Cài đặt): thẻ rút gọn (Điểm Hệ Thống, Hảo cảm, Nhiệm vụ), bấm vào sẽ mở rộng thanh trạng thái đầy đủ; có thể tắt để đổi thành nút “Lịch sử”. Ở chế độ thiết bị đầu cuối các tầng cũ chỉ có nhãn nhỏ | **Đã nghiệm thu** (1.16–1.19) |
| Kịch bản Tavern Helper · Không Gian Khế Ước Lilith | Trợ lý nguyên bản chạy nguyên gốc, không cần Tavern Helper | **Đã nghiệm thu** (1.16–1.19) |
| Macro biến Tavern Helper `{{get_chat_variable::…}}` v.v. | Thay thế trong cả lời nhắc lẫn HTML dùng để hiển thị | **Đã nghiệm thu** (1.16–1.19): trong lời nhắc không còn sót lại macro thô |
| Tiếp quản và khôi phục bản cũ một chạm | Tạm dừng (không xóa) regex cũ và kịch bản cũ, **sau khi ghi xuống đĩa** mới làm mới trang; khi khôi phục chỉ bật lại những mục đã bị tiện ích này tạm dừng | **Đã nghiệm thu** (1.16–1.19): đọc lại cài đặt từ máy chủ để xác nhận đã lưu xuống đĩa |

## II. 8 trang phân loại nguyên bản (Từ 0.5.0 nằm trong thiết bị đầu cuối)

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| 8 trang chuyển đổi qua thanh điều hướng thiết bị đầu cuối, đọc/ghi sổ cái | **Đã nghiệm thu** (1.16–1.19) | Bản thân engine nguyên bản chạy bên trong thiết bị đầu cuối, gắn với tầng mới nhất có khối dữ liệu; dữ liệu ghi vào `chat_metadata.variables` và xác nhận đã lưu xuống đĩa |
| Các thao tác ghi vào ô nhập liệu (kết toán giỏ hàng, bế quan, sử dụng vật phẩm…) | **Đã nghiệm thu** (1.16–1.19, kết toán giỏ hàng) | Thiết bị đầu cuối hiện thông báo 「Đã ghi vào ô nhập liệu trò chuyện」 kèm nút 「Đóng thiết bị đầu cuối để gửi」 |
| **Trung tâm API** (API độc lập hoặc API chính của quán rượu) | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Danh sách mô hình và kiểm tra kết nối đều hoạt động; cấu hình ghi trả về cả ba nơi lưu trữ nguyên bản; ở chế độ API chính không gửi yêu cầu tới địa chỉ giả |
| Thương thành · AI nhập hàng | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Đi qua API độc lập; `max_tokens` và `temperature` theo cài đặt nguyên bản; lọc hàng hóa theo cấp cửa hàng; trừ 500 điểm |
| Thương thành · Báo giá ước nguyện | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Đi qua API chính của quán rượu |
| Thương thành · Rút thẻ | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Rút đơn trừ 1 vạn điểm → trình tạo phần thưởng → chờ nhận → sau khi nhận đi vào túi đồ; mười lần trừ 10 vạn điểm, kết quả vào phần thưởng chờ xử lý. Số lượt tùy chỉnh đi chung một đường dẫn mã nguồn, **chưa bấm thử từng mục** |
| Thương thành · Mua hàng, thanh toán ước nguyện, thu hồi vật phẩm | **Đã nghiệm thu** (1.16–1.19) | Mua hàng trừ điểm và vào túi (hoặc vào chờ kết toán); thanh toán ước nguyện trừ 2 vạn điểm; thu hồi cộng điểm |
| Túi đồ · AI sắp xếp | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Mỗi vật phẩm đều được phân loại lại |
| Phụ trợ · Triệu hồi Tay Đấm Chư Thiên | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Tạo thẻ tay đấm |
| Phụ trợ · Vạn Vật Dung Lô | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Tạo vật phẩm dung luyện do mô hình đặt tên. Bản gốc có 10% xác suất thất bại, khi thất bại không gọi mô hình; khi nghiệm thu đã cố định hạt giống ngẫu nhiên |
| Thần thông · AI đánh giá bậc thực lực | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Ghi bậc thực lực trả về hộp thả xuống |
| ⚙ Kiểm tra kết nối | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | |
| Phụ trợ · Túi Đồ Vô Hạn, Mắt Động Sát | **Đã nghiệm thu** (1.16–1.19) | Cất vào túi rồi lấy ra ×3 ghi vào túi đồ; Mắt Động Sát trừ điểm → giỏ hàng → kết toán ghi vào ô nhập liệu |
| Các hành động cục bộ còn lại không gọi mô hình trong Phụ trợ và Thần thông | **Chưa bấm thử từng mục** | Phái Đi Phân Thân, Động Thiên Tùy Thân, Sao Chép Đồ Giám, Cải Biên Trạng Thái, Ngôn Linh Cải Tự. Tất cả đều là mã nguyên bản chạy qua cầu nối nguyên gốc, việc ghi sổ cái đi qua cùng một giao diện đã được nghiệm thu |

## II.5. Thiết bị đầu cuối (Thêm mới từ 0.5.0)

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Cửa sổ đơn: cửa sổ Lilith chính là thiết bị đầu cuối, không có cửa sổ thứ hai | **Đã nghiệm thu** (1.16–1.19) | Thanh điều hướng chia nhóm cố định: Hệ thống / Giao dịch / Năng lực / Lilith / Thiết bị đầu cuối |
| Đóng: ✕, Esc, bấm bên ngoài (tùy chỉnh), cử chỉ quay lại trên điện thoại; mở lại về đúng trang trước đó; cuộc trò chuyện không bị cuộn lệch | **Đã nghiệm thu** (1.16–1.19) | Khi hộp thoại riêng của quán rượu đang mở thì nhấn Esc sẽ đóng hộp thoại trước |
| Trang Cài đặt (toàn bộ công tắc và công cụ từ ngăn kéo cài đặt tiện ích cũ) | **Đã nghiệm thu** (1.16–1.19) | Ngăn kéo chỉ giữ lại 「Mở Thiết Bị Đầu Cuối Chư Thiên」 và 「Khôi phục khẩn cấp bản cũ」 |
| Công tắc phụ trợ (6 phụ trợ nguyên bản, theo từng cuộc trò chuyện) | **Đã nghiệm thu** (1.16–1.19) | Sau khi tắt sẽ ẩn trong thiết bị đầu cuối và tiêm lời nhắc “không được sử dụng” |
| Phụ trợ tự tạo: kho trên máy, bật theo từng cuộc trò chuyện, tiêm lời nhắc, phát động trừ phí đọc lại, số lần mỗi ngày | **Đã nghiệm thu** (1.16–1.19) | Xuất / Nhập `.json` có kiểm tra logic thuần túy (kiểm tra trường, cắt độ dài, làm trơ macro & thẻ), **trên trình duyệt chưa bấm hộp thoại chọn tệp nhập** |
| Bố cục điện thoại / cửa sổ hẹp | **Đã nghiệm thu** (1.16–1.19, 390×800) | Ở các trang hệ thống ẩn ảnh đứng, thanh điều hướng cuộn ngang; ở các trang Lilith hiển thị ảnh đứng |

## II.6. Nhóm Chat Chư Thiên Vạn Giới (Thêm mới từ 0.6.0, bản gốc không có)

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Chiêu mộ (ngẫu nhiên / chỉ định thế giới), mời vào nhóm, mở rộng dung lượng | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Phí chiêu mộ 200 (từ 0.8.1 là 100), phân tích thất bại được hoàn lại; phí vào nhóm theo bậc thực lực (từ 0.8.1 có đường cong giá riêng, xem mục 「II.9」) |
| Ô nhập liệu lệnh chiêu mộ đi theo chế độ: khi đang ở Ngẫu nhiên mà gõ chữ → Chỉ định thế giới; chuyển về Ngẫu nhiên tự xóa trống; chọn chỉ định nhưng chưa điền tên → nhắc nhở và không trừ phí (0.9.4) | **Đã nghiệm thu (Mô hình giả lập)** (1.19, điện thoại 390×844) | Chỉ mới chạy trên 1.19; chưa chạy lại riêng trên 1.16–1.18 |
| Trò chuyện nhóm: mỗi lần phát biểu gọi mô hình một lần, 1–6 thành viên trả lời | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Các dòng của người không thuộc nhóm hoặc người đang bị cấm ngôn sẽ bị loại bỏ |
| Lì xì của thành viên (Điểm Hệ Thống / vật phẩm), quà tặng → giật / nhận vào sổ | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Ghi sổ cái và đọc lại trước rồi mới báo 「Đã nhập kho」; nguồn gốc ghi 「Tên@Thế_giới」 |
| Giới hạn quy tắc nền tảng: phẩm giai ≤ cấp Thương thành, ≤ thực lực thành viên, cấm hàng Cấm kỵ, tự động hạ cấp; trần số tiền lì xì và số lượng mỗi ngày | **Đã nghiệm thu** (1.16–1.19 + logic thuần túy) | Không thể tắt |
| Ký chủ phát lì xì (Điểm Hệ Thống / vật phẩm túi đồ), độ hảo cảm, quà đáp lễ | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Quà đáp lễ là ngẫu nhiên, khi nghiệm thu chỉ kiểm tra độ hảo cảm tăng lên |
| Điểm danh | **Đã nghiệm thu** (1.16–1.19) | |
| Cầu viện → kho nhiệm vụ nguyên bản trạng thái 「Chờ nhận」 | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | |
| Phát trực tiếp nhóm, trò chuyện riêng | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | |
| Giáng lâm: trừ phí, tiêm vào cốt truyện sau 3 lượt thì kết thúc | **Đã nghiệm thu** (1.16–1.19) | Chỉ mới xác minh việc tiêm lời nhắc, **chưa dùng mô hình thật để xem hiệu quả trong chính văn** |
| Chợ phiên: mua đơn treo của thành viên, Ký chủ treo đơn (chốt đơn trong phạm vi định giá ×1.3), hủy đơn | **Đã nghiệm thu** (1.16–1.19) | |
| Việc nhóm: thông báo, nội quy nhóm, cấm ngôn, trục xuất, quản trị viên, công tắc tiêm tóm tắt, tự động tán gẫu | **Đã nghiệm thu** (1.16–1.19) | Văn bản nội quy nhóm chỉ dùng làm lời nhắc, quy tắc nền tảng nằm trong mã nguồn |
| Giữ nguyên sau khi làm mới trang, bố cục điện thoại | **Đã nghiệm thu** (1.16–1.19) | |

## II.7. Chủ đề thế giới · Nhân vật giao diện Lilith · Đồ phổ · Diễn xuất (Thêm mới từ 0.7.0, bản gốc không có)

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Chủ đề thế giới: Tiên hiệp / Cyber / Quỷ dị / Mặc định, tự động phán đoán hoặc cố định trong Cài đặt | **Đã nghiệm thu** (1.16–1.19) | Chỉ đổi màu sắc và họa tiết trang trí, tọa độ các điều khiển dưới từng chủ đề được đối chiếu khớp nhau từng cái; engine nguyên bản chỉ đổi biến CSS |
| Dấu chân Vạn Giới `诸天系统.万界足迹`, `世界类型` | **Đã nghiệm thu** (1.16–1.19) | Khi thế giới hiện tại thay đổi sẽ khóa ghi và đọc lại; thế giới mới không kế thừa `世界类型` cũ |
| AI ghi `当前世界` / `世界类型` trong mục 「Cập nhật biến」 | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Đã xác minh việc tiêm lời nhắc; **việc mô hình thật có tuân thủ hay không chưa kiểm chứng**; trên Bản đồ sao có thể 「Ghi nhận xuyên không」 thủ công |
| Giảm chuyển động, bố cục điện thoại | **Đã nghiệm thu** (1.16–1.19, 390×800; bố cục điện thoại kiểm tra trực quan bằng ảnh chụp) | Khi bật giảm chuyển động thì họa tiết đứng yên và diễn xuất chỉ hiện thẻ kết quả; Đồ phổ trên điện thoại có thể kéo ngang |
| Phản ứng của Lilith: chọn nhiệm vụ / vật phẩm / công pháp, kết toán thành bại | **Đã nghiệm thu** (1.16–1.19) | Chỉ dùng biểu cảm biến thể và chuyển động phân lớp nguyên bản; lời thoại lấy từ các trường sổ cái |
| Góc máy quay Lilith: trang hệ thống nửa người · bàn làm việc toàn thân · trò chuyện riêng cận cảnh khuôn mặt · gợi ý cốt truyện ảnh chân dung | **Đã nghiệm thu** (1.16–1.19; góc cắt kiểm tra trực quan bằng ảnh chụp) | Cắt khung từ ảnh gốc theo tọa độ điểm ảnh; không có giả Live2D |
| Đồ phổ: Dòng sự kiện, Sơ đồ quan hệ, Bản đồ sao, Cây năng lực | **Đã nghiệm thu** (1.16–1.19) | Các nút lấy từ sổ cái; chi tiết hiển thị trường và đường dẫn gốc; nhiệm vụ có thể định vị về dòng nhiệm vụ gốc; hỗ trợ thao tác bằng bàn phím |
| Đồ phổ → Định vị tầng tin nhắn trò chuyện | **Đã hiện thực hóa, chưa nghiệm thu trình duyệt** | Khi tầng tin nhắn không nằm trong phần trò chuyện đã tải sẽ nhắc tải các tin nhắn cũ hơn trước |
| Diễn xuất: xuyên không, đột phá, ký khế ước, hoàn thành / thất bại nhiệm vụ, rút thưởng, nhập kho phần thưởng | **Đã nghiệm thu** (1.16–1.19: hoàn thành nhiệm vụ, xuyên không, hoàn tác rút thưởng; đột phá / khế ước kiểm tra bằng logic thuần túy) | Phát sau khi đọc lại sổ cái, trước khi phát đối chiếu lại lần nữa; mục bị hoàn tác ghi là 「Chưa vào sổ」; có thể bỏ qua; có thể đổi thành chỉ hiện thẻ hoặc tắt |
| Thẻ gợi ý cốt truyện khi đóng thiết bị đầu cuối | **Đã nghiệm thu** (1.16–1.19) | Tự thu gọn khi mở thiết bị đầu cuối |
| Chế độ tương thích cũ (thanh trạng thái trong tầng tin nhắn) không còn cung cấp trong Cài đặt; giá trị cũ tự động chuyển sang chế độ thiết bị đầu cuối một lần | **Đã nghiệm thu** (1.16–1.19 + logic thuần túy) | Giữ lại mã nguồn chế độ cũ; `native_replace040.py` không chạy trong vòng này (thiếu tệp v1.1 nguyên bản) |

## II.18. 1.0.0

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Đổi Lilith nổi sang nhân vật tách nền (không khung thẻ): tách lớp cơ thể và đôi cánh, 9 mảnh vá biểu cảm, chớp mắt, nhép môi khi nói, chạm đổi biểu cảm; khi đang trốn ở mép mà nói chuyện sẽ ló người ra trước | **Đã nghiệm thu** (1.19, mô phỏng cảm ứng điện thoại 390×844) | Nhấn giữ, rung và tốc độ khung hình trên iOS / Android thật chưa thử; mã `sha256` của tư liệu được đối chiếu bằng kiểm tra đơn vị |
| Chia Cài đặt thành 「Thường dùng / Cài đặt nâng cao / Chẩn đoán & Bảo trì」, ô tìm kiếm lọc theo tiêu đề & mô tả và tự động mở rộng / thu gọn | **Đã nghiệm thu** (1.19, trình duyệt + logic thuần túy) | |
| Xuất bản lưu: gồm cài đặt và sổ cái trò chuyện hiện tại (tùy chọn ký ức, trò chuyện riêng), không chứa API Key | **Đã nghiệm thu** (1.19, tải tệp thực tế) | Loại bỏ khóa API theo tên trường và định dạng giá trị; các khóa ngắn có định dạng đặc biệt có thể không nhận diện được |
| Nhập bản lưu: Xem trước → Sao lưu trước → Ghi → Đọc lại từng mục; API Key trên máy không bị xóa trắng | **Đã nghiệm thu** (1.19, dán văn bản khứ hồi) | 「Chọn tệp」 đi chung một đường dẫn phân tích, trên trình duyệt không bấm hộp thoại chọn tệp hệ thống |
| Phiên bản cấu trúc sổ cái: sổ cái cũ sao lưu trước rồi mới nâng cấp; sổ cái được ghi bởi tiện ích bản mới hơn sẽ ở chế độ chỉ đọc | **Đã nghiệm thu** (1.19 + logic thuần túy) | Hiện tại có bước di chuyển 0 → 1 → 2 |
| Hoàn tác sổ cái (bấm trong hộp thoại): trạng thái trước khi hoàn tác luôn được sao lưu và giữ lại | **Đã nghiệm thu** (1.19) | Mục 「Di chuyển bản lưu cũ, sao lưu & hoàn tác sổ cái」 được đổi thành `implemented` |
| Thông báo lỗi thống nhất 「Chuyện gì đã xảy ra · Sổ cái · Bước tiếp theo」 | **Đã nghiệm thu** (1.19 thông báo từ chối nhóm chat + logic thuần túy) | Phân loại theo văn bản lỗi, những lỗi không nhận diện được sẽ không tự đoán trạng thái sổ cái |
| Thanh điều hướng ngang trên điện thoại: 6 trang thường dùng + nút 「Thêm」, trang hiện tại luôn hiển thị | **Đã nghiệm thu** (1.19, mô phỏng điện thoại 844×390) | Chưa thử trên máy thật |
| Hiệu ứng động: Tự động (hệ thống bật giảm chuyển động / tốc độ khung hình cảm ứng < 40) / Đầy đủ / Rút gọn | **Đã nghiệm thu** (1.19, tiêm tốc độ khung hình + logic thuần túy) | Chưa thử trên máy cấu hình thấp thật; lấy mẫu tốc độ khung hình chỉ thực hiện một lần sau khi khởi chạy 6 giây |
| `/zt init` không còn tiện tay mở hộp thoại Sách Thế Giới; thêm mới `/zt export` | **Đã nghiệm thu** (1.19) | |
| Thương thành AI, Bàn làm việc, Tự động chỉnh lý ký ức, Trò chuyện riêng, AI ghi thế giới hiện tại | **Thử nghiệm** (Mô hình giả lập) | Chưa nghiệm thu trên mô hình thật |
| Bổ sung từ phản hồi người chơi · Trang Giám định phẩm giai: chỉ liệt kê công pháp / vật phẩm không có nguồn từ hệ thống; chỉnh sửa thủ công chỉ tăng không giảm, giá thu hồi vật phẩm giữ nguyên giá gốc, ghi đọc lại và đồng bộ ảnh chụp nhanh các tầng | **Đã nghiệm thu** (1.19, bấm trình duyệt + logic thuần túy) | Nguồn hệ thống phán đoán theo trường `来源`; vật phẩm cũ không có trường nguồn gốc được tính là phi hệ thống |
| Bổ sung từ phản hồi người chơi · Phán đoán AI của Giám định phẩm giai | **Thử nghiệm** (Mô hình giả lập) | Phẩm giai do mô hình thật đưa ra có hợp lý hay không chưa được kiểm chứng |
| Bổ sung từ phản hồi người chơi · 「收录:Tên_công_pháp[Phẩm_giai_cao_hơn]」 hiệu chỉnh công pháp cốt truyện; nhắc AI ghi rõ phẩm giai khi thu thập | **Đã nghiệm thu** (1.19, tầng khối dữ liệu + logic thuần túy) | Đi theo tầng tin nhắn: khi chuyển swipe sẽ thu hồi theo phản hồi cũ |
| Bổ sung từ phản hồi người chơi · Thiết lập sẵn cổng kết nối: bắt buộc nhập tên mới lưu được, trùng tên sẽ ghi đè, có thể xóa; không đi vào tệp trò chuyện, không đi vào tệp xuất | **Đã nghiệm thu** (1.19, bấm trình duyệt + logic thuần túy) | Tối đa 30 thiết lập sẵn |
| Bổ sung từ phản hồi người chơi · API theo từng tính năng: 12 nơi (bản 1.1.1 thêm Ghi bổ sung khối dữ liệu) mỗi nơi có thể chọn Theo mặc định / API chính của quán rượu / Thiết lập sẵn / Cấu hình riêng, yêu cầu tự động chuyển sang địa chỉ, khóa và mô hình tương ứng | **Đã nghiệm thu** (1.19, nhật ký yêu cầu mô hình giả lập) | Các tính năng thanh trạng thái phân biệt theo lời nhắc hệ thống nguyên bản và xác minh bằng cách gọi trực tiếp với lời nhắc giống hệt, chưa bấm từng nút nguyên bản; chưa thử với trạm API công ích thật |
| Bổ sung từ phản hồi người chơi · Tắt tiện ích một chạm (`disableExtension` của quán rượu, hỏi xác nhận trước); đóng Lilith nổi (kéo xuống đáy / chuột phải, nhắc mở lại từ bảng 「Tiện ích mở rộng」), nút 「Hiện Lilith nổi」 trong bảng Tiện ích mở rộng | **Đã nghiệm thu** (1.19, bấm trình duyệt; trong mô phỏng điện thoại dùng sự kiện cảm ứng thật nhấn giữ kéo xuống đáy để đóng) | Bản 1.16 chỉ đối chiếu mã nguồn (`disableExtension` đã được xuất, không có hook tắt nên khi tắt không tự động gỡ liên kết Sách Thế Giới); chưa thử trên máy thật |
| Bổ sung từ phản hồi người chơi · Sửa lỗi: dưới bố cục điện thoại, thẻ diễn xuất ở trang trò chuyện, nút lối vào dự phòng và ô mục tiêu 「Đóng cửa sổ nổi」 bị trôi ra ngoài phía trên màn hình | **Đã nghiệm thu** (1.19, đo vị trí trong mô phỏng điện thoại 390×844) | Chưa thử trên máy thật |

## II.17. 0.9.3

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Quy tắc → Bối cảnh thế giới bổ sung: 「Đọc danh mục sách」 liệt kê Sách Thế Giới của quán rượu, 「Đọc cuốn sách này」 lưu ảnh chụp nhanh chỉ đọc (bỏ qua các mục đang tắt), Sách Thế Giới gốc không bị sửa đổi | **Đã nghiệm thu** (1.19, bấm trình duyệt) | Chưa thử thực tế trên TauriTavern: đi chung một bộ giao diện frontend của quán rượu, chờ người dùng kiểm tra lại |
| Máy chủ không có `getWorldInfoNames` / `loadWorldInfo`: chuyển sang dùng mô-đun `world-info` và `/api/worldinfo/get`; sách không đọc được sẽ hiện thông báo rõ ràng | **Đã nghiệm thu** (giả lập thiếu giao diện trên 1.19) | Chưa chạy riêng trên 1.16–1.18 |
| Bản đồ sao → Đính chính: sửa loại / tên thế giới hiện tại (không tính là xuyên không, không phát diễn xuất, dấu chân không cộng thêm số lần); thế giới không phải hiện tại có thể xóa; điền tên thế giới hiện tại vào Ghi nhận xuyên không = đính chính loại thế giới | **Đã nghiệm thu** (1.19, mô phỏng Chromium Android) | Nếu sau đó AI lại viết sai thì cần đính chính lại lần nữa |
| Nút trên Bản đồ sao: loại thế giới đoán theo tên được đánh dấu 「?」; loại thế giới hiện tại lấy `世界类型` trong sổ cái làm chuẩn, đồng bộ với chủ đề thanh đỉnh | **Đã nghiệm thu** (logic thuần túy + trình duyệt) | |
| Hướng dẫn tân thủ: lần đầu mở thiết bị đầu cuối bình thường sẽ tự động hiện một lần (khi mở thẳng vào trang chỉ định sẽ không cắt ngang), 3 bước tự đánh dấu tích theo trạng thái thực tế, ghi nhớ trạng thái Hoàn tất / Bỏ qua, có thể mở lại từ Cài đặt | **Đã nghiệm thu** (1.19, mô phỏng Chromium Android, gồm thực thi thật cả 3 bước) | Bước 3 yêu cầu đã mở cuộc trò chuyện nhân vật đơn; không hỗ trợ trò chuyện nhóm của quán rượu |

## II.16. 0.9.2

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Tiện ích mở rộng khác sửa đổi tại chỗ đoạn lời thoại trước khi tiện ích này xử lý (tô sáng từ khóa): `【Lilith】` chỉ hiển thị khung thoại, không còn bị “nguyên văn + khung thoại” | **Đã nghiệm thu** (1.19, mô phỏng Chromium Android; tái hiện thất bại trên 0.9.1, vượt qua trên 0.9.2) | Phần làm đẹp trên đoạn đó sẽ được thay bằng thẻ của tiện ích; chờ kiểm tra lại trên máy thật |
| Tin nhắn sau khi quán rượu vẽ xong lại bị sửa tiếp (tiện ích biến nối thêm khối cập nhật mà không vẽ lại): không còn lộ nguyên văn `系统点 / 好感度`, lời thoại cũng không bị lặp | **Đã nghiệm thu** (như trên) | Tái hiện bằng cách nối thêm giả lập, chưa cài MVU thật |
| Thẻ giao diện (khối mã → iframe) nằm đúng vị trí khối mã mà nó thay thế: khi lời thoại đứng trước thì khung thoại không còn bị nhảy xuống dưới thanh trạng thái của thẻ nhân vật | **Đã nghiệm thu** (1.19, trình kết xuất giả lập + **Tavern Helper 4.11.2 thật**; tái hiện thất bại trên 0.9.1) | |
| `莉莉丝：…` nằm trong khối mã / `<script>` / `<style>` / `<textarea>` / `<pre>` không biến thành khung thoại; giữ nguyên thẻ giao diện | **Đã nghiệm thu** (1.19 + logic thuần túy) | |
| Tương thích làm đẹp của 0.8.4 (làm đẹp tại chỗ chạy sau, thẻ iframe không bị tải lại, làm đẹp bằng regex), giữ nguyên thanh trạng thái thẻ nhân vật của 0.8.2 | **Vượt qua hồi quy** (`native_v084`, `native_v082`, mỗi bộ chạy 1 vòng có cài và không cài Tavern Helper) | |

## II.15. 0.9.1

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Tự kiểm tra trên điện thoại thật (8 bước: môi trường, toàn màn hình, đo từng trang, nhóm chat + bàn phím, trò chuyện riêng toàn màn hình + bàn phím, Lilith nổi, xoay ngang, phím quay lại), lưu kết quả và sao chép một chạm; có thể bỏ qua hoặc kết thúc sớm; thẻ bước kiểm tra không kích hoạt “bấm bên ngoài để đóng” | **Đã nghiệm thu** (1.19, mô phỏng cảm ứng Chromium Android, chạm / giả lập bàn phím / xoay màn hình / quay lại theo đúng thao tác người dùng) | **Chờ người dùng gửi lại kết quả trên điện thoại Android thật**; chưa thử trên iPhone |
| Sao chép thông tin chẩn đoán: phiên bản, thiết bị, giao diện, trạng thái chạy, tên máy chủ cổng + mô hình, danh sách trắng cài đặt, lần tự kiểm tra trước, 30 lỗi tiện ích gần nhất | **Đã nghiệm thu** (1.19, đọc lại từ bộ nhớ tạm) | Nhật ký lỗi chỉ thu thập các dòng mở đầu bằng `[诸天…]` và lỗi trang từ tệp của tiện ích |
| Thông tin chẩn đoán không chứa API Key (kể cả khóa lẫn trong văn bản lỗi), tài khoản/mật khẩu trong URL và tham số truy vấn | **Đã nghiệm thu** (1.19 ghi Key giả vào cấu hình cổng và bắn vào thông báo lỗi; kiểm tra hàm thuần túy `redact`) | Nhận diện theo định dạng, các khóa ngắn có định dạng lạ có thể bị sót |
| Sao chép dưới môi trường không có HTTPS (địa chỉ mạng LAN): lùi về dùng `execCommand`, nếu vẫn thất bại sẽ bật ô văn bản để sao chép tay | **Đã nghiệm thu** (1.19, giả lập `isSecureContext=false`) | Chưa thử trên trình duyệt điện thoại thật |
| Bàn phím làm thu thấp toàn trang (`innerHeight` giảm xuống trong khi `visualViewport` không đổi) được xử lý như đang bật bàn phím | **Đã nghiệm thu** (1.19, sau khi lấy tiêu điểm vào ô nhập liệu thì khung nhìn giảm từ 844 xuống 470) | Chưa xác nhận từng cái xem những WebView cụ thể nào có hành vi này |
| Xuống dòng LF + `.gitattributes`; CI (check / test / FILELIST / CRLF / khóa bí mật); `npm run filelist` | **Đã hoàn thành** (chạy các lệnh tương tự trên máy cục bộ đều đạt) | GitHub Actions cần đẩy lên kho lưu trữ mới chạy lần đầu |

## II.14. 0.9.0

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Thiết bị đầu cuối toàn màn hình trên điện thoại (màn hình dọc 390×844 → vùng nội dung 646 px; 360×640 → 442 px), chừa khoảng trống vùng an toàn; kích thước cửa sổ nhỏ ghi nhớ trước đó không còn áp dụng | **Đã nghiệm thu** (1.19, mô phỏng cảm ứng Chromium; đọc lại kích thước + kiểm tra ảnh chụp) | Chưa thử trên iOS / Android thật; bản 1.16 không chạy trong vòng này |
| Khi bật bàn phím, thiết bị đầu cuối tự thu thấp theo vùng hiển thị, thanh sổ cái / dòng trạng thái nhường chỗ, ô nhập liệu nhóm chat luôn nhìn thấy; khi thu bàn phím sẽ khôi phục | **Đã nghiệm thu** (1.19, giả lập `visualViewport` thu nhỏ còn 470 / 200 px) | Chưa thử sự thay đổi chiều cao của bộ gõ thật (thanh ứng viên chữ, bàn phím bên thứ ba) |
| Thanh điều hướng cột trái khi xoay ngang (844×390 → vùng nội dung 250 px, ở bản 0.8.5 là 122 px) | **Đã nghiệm thu** (1.19, như trên) | 20 lối vào cần cuộn dọc |
| Trò chuyện riêng toàn màn hình và đi theo bàn phím; khi xoay ngang / bật bàn phím thì ảnh cận cảnh khuôn mặt tự nhường chỗ | **Đã nghiệm thu** (1.19, chạm thực tế từ thanh đỉnh thiết bị đầu cuối để đi vào) | |
| Tất cả các trang thiết bị đầu cuối: không tràn ngang, không cuộn ngang, mục tiêu chạm ≥ 36 px, ô nhập liệu 16 px (màn hình dọc 20 trang, màn hình ngang 6 trang, màn hình nhỏ 7 trang) | **Đã nghiệm thu** (1.19, đo tự động) | Các hộp thoại bật lên như kết quả rút thẻ / chi tiết vật phẩm bên trong trang engine chỉ mới kiểm tra tràn khung |
| Lilith nổi: khi thiết bị đầu cuối toàn màn hình sẽ đậu ở góc dưới (màn hình ngang đậu ở bên phải), chạm vào lời thoại sẽ thu gọn, cuộn trang tự thu gọn, sau khi đóng thiết bị đầu cuối sẽ quay về vị trí cũ | **Đã nghiệm thu** (1.19) | |
| Phiên toàn màn hình trên điện thoại không ghi đè kích thước cửa sổ ghi nhớ trên máy tính (`Bridge.addScriptFilter` + `keepWindowBox`) | **Đã nghiệm thu** (1.19 + logic thuần túy) | Khi chuyển sang 「Cửa sổ nổi」 vẫn lưu kích thước bình thường |
| Cài đặt 「Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại」: Tự động / Luôn toàn màn hình / Cửa sổ nổi; trên máy tính (chuột 1400×900) không thay đổi | **Đã nghiệm thu** (1.19) | |
| 1.16 / 1.17 / 1.18 | **Vòng này không chạy** | Bản 0.9.0 chỉ sửa bố cục và CSS, giao diện máy chủ không đổi |

## II.13. 0.8.5

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Khi bị sót sự kiện 「Kết thúc tạo」 thì tầng mới nhất vẫn kết xuất (`#mes_stop` từng xuất hiện trong lần tạo này rồi ẩn đi sẽ được coi là đã kết thúc và quét lại; nếu chưa từng xuất hiện thì khóa gửi giữ nguyên) | **Đã nghiệm thu** (1.16, 1.19, mô phỏng điện thoại Chromium: chỉ phát sự kiện bắt đầu tạo mà không phát kết thúc; khi gỡ bản vá ra sẽ tái hiện lỗi hiện văn bản thô) | Chưa thử trên trình duyệt điện thoại thật; chưa tái hiện từng dòng máy / mô hình cụ thể bị sót sự kiện ngoài thực tế |
| Trên điện thoại sau khi bấm 「Chỉnh sửa → ✔」 thì tầng tin nhắn tự kết xuất lại | **Đã nghiệm thu** (như trên, chạm thực tế vào nút chỉnh sửa của quán rượu) | Việc trong ô chỉnh sửa hiển thị nguyên văn là hành vi bình thường của quán rượu |
| Trạng thái 「Tầng mới nhất」 và nút 「Kết xuất lại tầng tin nhắn」 trong Chẩn đoán tương thích | **Đã nghiệm thu** (1.16, 1.19) | Chỉ kiểm tra 10 tầng gần nhất |
| Cài đặt cổng AI: một câu trạng thái, 3 bước, thu gọn cài đặt nâng cao, nút radio kích thước bình thường; khi dùng trực tiếp mô hình quán rượu sẽ ẩn Bước 2 | **Đã nghiệm thu** (1.16, 1.19, máy tính + điện thoại 390×844, đọc lại kích thước + kiểm tra ảnh chụp) | Lưu trữ giống hệt bản 0.8.4 |
| Giải thích kiểm nghiệm sổ cái; khi chưa bật sẽ làm nổi bật hai công tắc cùng nút lưu và nhắc dễ hiểu; khi đã tích mà chưa lưu sẽ nhắc bấm lưu; sau khi lưu thì kiểm nghiệm nguyên bản chạy bình thường | **Đã nghiệm thu** (1.16, 1.19) | Logic kiểm tra nguyên bản không đổi, chỉ thay thế văn bản thông báo |
| 1.17 / 1.18 | **Vòng này không chạy** | Ở bản 0.7.0 cả 4 phiên bản đều đã vượt qua |

## II.12. 0.8.4

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Mọi yêu cầu đối thoại đều truyền phát trực tuyến (streaming) (AI thanh trạng thái, Trò chuyện riêng / Ký ức / Bàn làm việc của Lilith; kết nối trực tiếp và chuyển tiếp qua quán rượu), sau đó ghép lại thành JSON thông thường | **Đã nghiệm thu** (1.16, 1.19: mô hình giả lập nhận được `stream:true`, câu trả lời khớp từng chữ; logic thuần túy: phân tích SSE, lỗi, lùi về phi-streaming) | Chưa thử với nhà cung cấp dịch vụ thật / chuỗi proxy thật |
| Lấy danh sách mô hình: khi bị CORS chặn sẽ chuyển tiếp qua máy chủ quán rượu; khi thất bại trả về nguyên nhân dễ đọc thay vì lỗi mạng chung chung của trình duyệt | **Đã nghiệm thu** (1.16, 1.19, nhà cung cấp giả lập không gửi header CORS + địa chỉ không tồn tại) | |
| Thời gian chờ API độc lập 60–600 giây (mặc định 180 giây), thay thế mức 60 giây cứng của bản gốc | **Đã nghiệm thu** (1.16, 1.19: phản hồi chậm 75 giây trong trò chuyện riêng về tới nơi đầy đủ; logic thuần túy: thay bộ hẹn giờ, đổi số giây trong thông báo) | Chỉ thay thế bộ hẹn giờ 60 giây cố định của bản gốc |
| Bấm trò chuyện riêng từ trong thiết bị đầu cuối trên điện thoại: khung trò chuyện riêng mở đè lên trên thiết bị đầu cuối, thiết bị đầu cuối không bị đóng | **Đã nghiệm thu** (1.16, 1.19, mô phỏng điện thoại Chromium + chạm thực tế 5 lần liên tiếp; khi gỡ bản vá ra sẽ thất bại) | Chưa thử trên trình duyệt điện thoại thật |
| Một nơi cài đặt API duy nhất: trang 「Kết nối」 = Trung tâm API, ẩn biểu mẫu nguyên bản; bấm biểu tượng bánh răng → API cũng đi vào cùng biểu mẫu đó | **Đã nghiệm thu** (1.16, 1.19) | Giữ nguyên DOM biểu mẫu nguyên bản, không xóa |
| 7 bảng màu + đi theo thế giới; chủ đề Tiên hiệp đổi sang Vàng Mặc Ngọc | **Đã nghiệm thu** (1.16, 1.19: đọc lại biến màu của thiết bị đầu cuối, trang engine và lớp diễn xuất; hiệu ứng phối màu kiểm tra trực quan bằng ảnh chụp) | |
| Công tắc Mô-đun mạnh (`disable` của mục Sách Thế Giới); cài mới mặc định tắt Thần Hào Tiêu Xài / Tay Đấm Chư Thiên; sách cũ có nút Cân bằng một chạm; sau khi tắt sẽ ẩn lối vào và báo cho AI | **Đã nghiệm thu** (1.16, 1.19: đọc lại Sách Thế Giới từ máy chủ để xác nhận) | Sách Thế Giới đã có sẵn sẽ không bị tự động sửa đổi |
| Tương thích làm đẹp tầng tin nhắn: thẻ iframe bên ngoài được giữ nguyên tại chỗ, không tải lại, không lặp; giữ nguyên các sửa đổi tại chỗ của kịch bản JS làm đẹp; regex làm đẹp có hiệu lực; thứ tự không đổi | **Đã nghiệm thu** (1.16, 1.19 trình kết xuất / kịch bản làm đẹp giả lập; 1.19 + thanh trạng thái thật của Tavern Helper 4.11.2; khi gỡ bản vá ra sẽ thất bại) | Chưa thử thực tế từng kịch bản làm đẹp bên thứ ba cụ thể (như Tiểu Bạch X…) |
| 1.17 / 1.18 | **Vòng này không chạy** | Ở bản 0.7.0 cả 4 phiên bản đều đã vượt qua |

## II.11. 0.8.3

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Kích thước Lilith nổi 5 mức (mặc định 75%), có hiệu lực tức thì, giữ nguyên vị trí | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | Phần nhô ra ở mép không nhỏ hơn 24px |
| Khi thiết bị đầu cuối đang mở mà bấm vào cô ấy sẽ chỉ nói chuyện (không còn kích hoạt 「Đóng khi bấm bên ngoài thiết bị đầu cuối」); chạm đúp hoạt động bình thường; bấm vào vùng trò chuyện vẫn đóng thiết bị đầu cuối như cũ | **Đã nghiệm thu** (1.16, 1.19, mô phỏng điện thoại Chromium + chạm thực tế `touchscreen.tap`) | Chưa thử trên trình duyệt điện thoại thật |
| Vị trí sau khi bước ra không còn bị tự động thu về mép màn hình (khi đóng thiết bị đầu cuối / xoay màn hình / làm mới trang) | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | Chỉ khi kéo rồi thả tay ở sát mép màn hình mới trốn vào cạnh |

## II.10. 0.8.2

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Gỡ liên kết Sách Thế Giới một chạm (sách chính / sách phụ của thẻ nhân vật, toàn cục, cuộc trò chuyện hiện tại) và khôi phục liên kết | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy; đọc lại tệp thẻ nhân vật từ máy chủ để xác nhận) | Bản thân Sách Thế Giới không bị xóa; liên kết trong các cuộc trò chuyện khác không đổi |
| Tự động gỡ liên kết khi tắt tiện ích, khi bật lại sẽ hiện thông báo một lần | **Đã nghiệm thu** (1.19, gọi `disableExtension` thật) | Cần hook tiện ích mở rộng của 1.17+; 1.17 / 1.18 chưa thử trong vòng này; bản 1.16 không có hook này |
| Lilith nổi: chạm để mở thiết bị đầu cuối, chạm đúp để chọc, nhấn giữ để kéo, trốn vào mép màn hình, ghi nhớ vị trí | **Đã nghiệm thu** (1.16, 1.19, mô phỏng điện thoại Chromium 390×844 + sự kiện con trỏ cảm ứng) | Cảm giác vuốt trên trình duyệt điện thoại thật chưa thử; trên máy tính mặc định không hiển thị |
| Khi không nhìn thấy ảnh đứng thì lời thoại / thông báo hệ thống bật lên bên cạnh Lilith nổi | **Đã nghiệm thu** (1.16, 1.19) | Khi đặt thành 「Tắt」 sẽ lùi về hành vi của bản 0.8.1 |
| Thanh trạng thái riêng của thẻ nhân vật (`div.TH-render` của Tavern Helper) được giữ nguyên tại chỗ khi tiện ích dựng lại tầng tin nhắn | **Đã nghiệm thu** (1.19 + Tavern Helper 4.11.2: 12/12; 1.16 dùng nút bao bọc giả lập) | Chỉ bảo vệ thẻ bao bọc `div.TH-render`; chưa bao phủ các trình kết xuất khác |
| Lai lịch vật phẩm nhóm chat được ghi trên túi đồ, lời nhắc cốt truyện đọc từ túi đồ | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | Khi gộp các vật phẩm cùng tên vẫn giữ nguyên lai lịch gốc |
| Tự động tán gẫu mỗi N lượt phản hồi chính văn một lần (mặc định 3) | **Đã nghiệm thu** (1.16, 1.19) | |
| Lì xì điểm của thành viên nhóm ≤ phí vào nhóm; chi phí mở rộng nhóm = Dung lượng × 1,000 | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | |
| 1.17 / 1.18 | **Vòng này không chạy** | Ở bản 0.7.0 cả 4 phiên bản đều đã vượt qua |

## II.9. Sửa lỗi 0.8.1

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Lấy danh sách mô hình ở trang kết nối Lilith (khi nhà cung cấp không cho phép CORS sẽ chuyển tiếp qua máy chủ quán rượu) | **Đã nghiệm thu** (1.19, nhà cung cấp giả lập không có header CORS) | Yêu cầu chuyển tiếp do máy chủ quán rượu của chính người dùng phát đi; chưa thử từng trạm trung chuyển thực tế |
| Chiêu mộ: loại trừ ứng viên vừa xuất hiện, bốc cục bộ loại thế giới và bậc thực lực mục tiêu | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | Nếu mô hình vẫn trả về trùng tên sẽ nhắc sửa một lần, nếu vẫn trùng tiếp sẽ hoàn phí |
| Đường cong phí vào nhóm độc lập, chọn bậc thực lực theo ngân sách, không đủ tiền mua sẽ không bị trừ thành số âm | **Đã nghiệm thu** (1.16, 1.19 + logic thuần túy) | Chế độ 「Chỉ định nhân vật」 không bị giới hạn bởi ngân sách, đánh giá đúng thực tế |
| Lì xì / quà tặng cách 3–4 lượt một lần (sổ cái cưỡng chế), khi Ký chủ chủ động xin thì cho phép | **Đã nghiệm thu** (1.16, 1.19, mô hình giả lập cố tình vi phạm) | Trần nhận lì xì mỗi ngày là 6 lần không đổi |
| Tiêm bản ghi nhập kho nhóm chat vào lời nhắc cốt truyện (không được sửa đổi nguồn gốc) | **Đã nghiệm thu (Mô hình giả lập)** (1.16, 1.19) | Đã xác minh việc tiêm lời nhắc; **việc mô hình thật có tuân thủ hay không chưa kiểm chứng** |
| Bản Sách Thế Giới của tiện ích: cập nhật lên bản mới nhất (sao lưu trước), xuất JSON, nhắc nhở khi dùng bản cũ | **Đã nghiệm thu** (1.16, 1.19) | Sách cũ không bị tự động ghi đè; giữ nguyên các mục do người dùng tự tạo và trạng thái bật/tắt |

## II.8. Thống nhất giao diện · Độ thuần thục · Công pháp thẻ nhân vật (0.8.0)

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Các trang nguyên bản của Lilith đi theo chủ đề thế giới; dòng trạng thái dưới đáy dùng màu thanh chủ đề | **Đã nghiệm thu** (1.16, 1.19; cảm quan 4 bộ chủ đề kiểm tra trực quan bằng ảnh chụp) | Chỉ sửa CSS; chủ đề mặc định giữ nguyên màu tím nguyên bản |
| Ẩn dòng trạng thái Lilith ở thanh trạng thái gốc, chuyển thông báo hệ thống thành bong bóng trên ảnh đứng; bấm khoảng trống hiện lời thoại cốt truyện | **Đã nghiệm thu** (1.16, 1.19; vị trí bong bóng kiểm tra trực quan bằng ảnh chụp) | Trên điện thoại khi thu gọn ảnh đứng sẽ chuyển sang dùng thanh gợi ý |
| Điểm Hệ Thống ở thanh đỉnh và phần Tổng quan cơ bản luôn khớp nhau (sau khi điểm danh hoặc quản trị viên ghi sổ) | **Đã nghiệm thu** (1.16, 1.19) | Con số trong engine đọc từ sổ cái, không còn chỉ nhìn vào văn bản bảng ở tầng tin nhắn |
| Chuyển Bảng điều khiển Quản trị viên vào Cài đặt → Nâng cao · Quản trị viên | **Đã nghiệm thu** (1.16, 1.19) | Trong lúc bảng điều khiển đang mở thì engine không bị tải lại |
| Lối vào Phụ trợ tự tạo: mục điều hướng 「Tự tạo」, nút 「＋ Phụ trợ tự tạo」 ở trang Phụ trợ; trừ phí đóng dấu `界面记账时间` | **Đã nghiệm thu** (1.16, 1.19) | Bản thân trình chỉnh sửa kế thừa từ bản 0.5.0 |
| Lời nhắc hiệu quả thực tế của công pháp (báo hiệu quả giai đoạn cho AI) | **Đã nghiệm thu (Mô hình giả lập)** (1.16, 1.19) | **Việc mô hình thật có tuân thủ hay không chưa kiểm chứng** |
| Tích lũy thực chiến: có dùng trong cốt truyện nhưng mục Tu luyện công pháp quên ghi → +2; thăng cấp giai đoạn xếp hàng thông báo | **Đã nghiệm thu** (1.16, 1.19) | Chịu sự ràng buộc của trần phẩm giai; cùng một tầng chỉ tính một lần; chứng từ ghi trong `功法记录` |
| Nhập công pháp từ thẻ nhân vật / biến trò chuyện (chỉ tăng không giảm, không sửa thẻ nhân vật) | **Đã nghiệm thu** (1.16, 1.19, cấu trúc biến dựng để kiểm thử) | Chỉ nhận diện các cấu trúc phổ biến; chưa xác minh từng cách viết riêng của mọi tác giả thẻ |
| 1.17 / 1.18 | **Vòng này không chạy** | Ở bản 0.7.0 cả 4 phiên bản đều đã vượt qua |

## III. Lilith

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Cửa sổ trợ lý nguyên bản (Bàn làm việc, Hồ sơ ký ức, Tàng thư quy tắc, Cài đặt kết nối, Trạng thái hoạt động) | **Đã nghiệm thu** (1.16–1.19) | |
| Kiểm tra kết nối trợ lý (API chính của quán rượu) | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Địa chỉ giả không bao giờ bị gọi mạng thực sự |
| Tự động chỉnh lý ký ức (lời nhắc nhân viên ghi chép nguyên bản) → ghi vào biến trò chuyện | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Ở chế độ API chính, yêu cầu của nhân viên ghi chép dùng nhiệt độ trong thiết lập sẵn của ST chứ không phải giá trị cố định |
| Trò chuyện riêng (ảnh đại diện góc trên bên trái) → API độc lập → hiển thị phản hồi | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | |
| Chạm tương tác chân thực: vuốt ve (tăng dần cấp độ phản ứng), nhấn giữ, chạm nhẹ | **Đã nghiệm thu** (1.16–1.19, khung nhìn di động) | Sau khi thả tay không kích hoạt thừa lời thoại chạm nhẹ; trong trình duyệt không đầu (headless) không xác minh được phản hồi xúc giác (rung) |
| Ảnh đứng phân lớp nguyên bản và bong bóng chạm | **Đã nghiệm thu ở 0.3** | |
| Ảnh đứng biến thể AI: 8 biểu cảm | **Đã nghiệm thu ở 0.3** | |
| Ảnh đứng biến thể AI: tư thế | **Đã xóa ở 0.5.0** | Các tư thế ở 0.4.0 bị đổi trang phục, không đúng yêu cầu “bắt buộc dùng ảnh gốc”; khi dùng ảnh gốc tạo lại thì bị mô hình hình ảnh từ chối. Xem `assets/lilith/variants/PROVENANCE.md` |
| Live2D thật (mô hình Cubism 3/4/5) | **Đã nghiệm thu ở 0.3** (1.16, 1.17, 1.19, mô hình mẫu chính thức Haru) | Bản 0.4.0 không sửa đổi phần này |
| Mô hình Live2D của chính Lilith | **Chưa hoàn thành (Cần gắn xương thủ công)** | Chương trình không thể tự tạo tệp `.moc3` từ hư không. Đã cung cấp tính năng xuất PSD phân lớp, cần gắn xương trong Cubism Editor |
| Cubism Core | Không đóng gói kèm | Giấy phép độc quyền, chỉ tải sau khi người dùng đồng ý |

## IV. Khác

| Năng lực | Trạng thái | Ranh giới |
|---|---|---|
| Tạo văn bản và phản hồi truyền phát trực tuyến (streaming) | **Đã nghiệm thu (Mô hình giả lập)** (1.16–1.19) | Đường ống tạo văn bản thật của ST: sau khi xuất luồng trực tuyến sẽ hiển thị thanh trạng thái và 2 thẻ thoại; bản lưu vẫn giữ nguyên bảng dữ liệu |
| Cửa sổ thiết bị đầu cuối độc lập và nút lối vào của bản 0.1–0.4 | **Đã xóa ở 0.5.0** | Đã gộp vào Thiết Bị Đầu Cuối Chư Thiên. 4 bộ kịch bản nghiệm thu trình duyệt cũ tương ứng cũng ngừng hoạt động theo; bảo vệ gửi tin vẫn do `native_guards.py` nghiệm thu |
| Thiết bị di động | **Đã nghiệm thu** (1.16–1.19) | Bố cục điện thoại của thiết bị đầu cuối (390×800), cử chỉ quay lại để đóng, lớp cảm ứng |
| HUD, phím tắt, lệnh `/zt`, macro `{{zt_*}}`, bảng chẩn đoán | **Đã nghiệm thu ở 0.3** | Bảng chẩn đoán thêm mới: bảng thay thế v1.1, tàn dư bản cũ, ngân sách Sách Thế Giới |
| Trò chuyện nhóm của quán rượu | Chưa hỗ trợ | Từ chối ghi dữ liệu (không liên quan gì tới Nhóm Chat Chư Thiên) |
| **Mô hình thật** | **Chưa kiểm chứng** | Toàn bộ các luồng AI ở trên đều chỉ mới chạy qua mô hình giả lập cục bộ. Khi kết nối với mô hình thật lần đầu, vui lòng thử nghiệm trên cuộc trò chuyện đã sao lưu trước |
