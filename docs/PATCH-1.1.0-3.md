# 1.1.0 · Bản vá vòng ba (Bảo mật dữ liệu P1 + Chẩn đoán lưu)

Nhãn bản sửa đổi: `1.1.0-patch3`, phiên bản tiện ích vẫn là **1.1.0**, cấu trúc sổ cái vẫn là **2**. Ngày 2026-10-04.

Vòng này lấy cây thư mục làm việc của 「Bản rà soát 1.1.0」 đã bàn giao làm cơ sở, tiếp tục vá lỗi tăng thêm trên nhánh `main` `ce29f61a9c254517fdf1fae2385b83b55cfa3688` của kho lưu trữ chỉ định; không quay về bản cũ làm lại, không sửa đổi mã nguồn `vendor` gốc. Cả ba phản ví dụ do người dùng cung cấp đều đã được tái hiện. 305 bài kiểm tra vượt qua trước đó chưa đủ để loại trừ những lỗi này, vòng này bổ sung các phản ví dụ tương ứng.

## Nội dung sửa lỗi

### 1. Phản hồi bất đồng bộ của nhóm chat bị ghi nhầm sang cuộc trò chuyện khác

- Cầu viện, trò chuyện riêng, phản hồi trò chuyện nhóm và phát trực tiếp đều bắt cố định danh tính cuộc trò chuyện gốc, đối tượng cuộc trò chuyện và trạng thái chính văn ngay trước khi gửi yêu cầu.
- Phản hồi nhóm sau khi phát biểu và tự động tán gẫu cũng kế thừa thông tin bắt cố định ban đầu, không xác định lại cuộc trò chuyện đích sau khi chờ xong.
- Kiểm tra lại trước khi cam kết và bên trong khóa (lock), truyền danh tính gốc vào `Bridge`. Nếu chuyển cuộc trò chuyện, chính văn thay đổi hoặc trạng thái tạo văn bản thay đổi thì sẽ hủy bỏ, không ghi câu trả lời vào cuộc trò chuyện khác đang mở hiện tại.
- Không tự động mở lại cuộc trò chuyện gốc ở chạy nền thay người dùng, không âm thầm gửi lại yêu cầu mô hình. Với các yêu cầu API đã gửi đi, nhà cung cấp vẫn có thể tính phí; điều đó không đồng nghĩa với việc đã trừ Điểm Hệ Thống.

### 2. Giám định nâng phẩm giai gộp nhầm lô và đẩy giá thu hồi lên cao

- Khi nâng phẩm giai chỉ sửa đổi phẩm giai và bản ghi giám định của vật phẩm gốc, không còn gộp chung vào các lô khác nguồn có cùng tên và cùng phẩm giai nữa.
- Giữ nguyên giá gốc, thế giới nguồn, phẩm giai thế giới gốc, chứng từ thu thập và số lượng. Các vật phẩm cũ chưa ghi giá vẫn đóng băng mức định giá thu hồi gốc theo phẩm giai cũ chứ không tăng giá theo phẩm giai mới.
- Ứng viên giám định sử dụng khóa lô có chứa cả nguồn gốc và giá tiền; nếu khóa `Tên|Phẩm_giai` kiểu cũ ứng với nhiều nguồn khác nhau thì sẽ từ chối lựa chọn mơ hồ và yêu cầu chọn lại.
- Luồng mua hàng Thương thành nguyên gốc / nhập túi chung và quy hoạch mua hàng dự phòng cũng tránh gộp chung vào các lô đã giám định hoặc lô thu thập cốt truyện; vật phẩm hoàn trả giữ nguyên trường nguồn gốc của nó.
- Thực nghiệm phản ví dụ: 1 thanh Cổ Kiếm ghi bổ sung giá 1 điểm + 1 món Tiên phẩm cùng tên mua trong Thương thành giá 10,000,000 điểm, sau khi giám định nâng cấp thì tổng tiền thu hồi cả hai là **1,000,001 điểm**, không còn biến thành 2,000,000 điểm nữa.
- Bản vá này không tự động sửa các lô đã bị gộp nhầm / thu hồi nhầm từ bản cũ; khi nguồn gốc đã mất thì không thể đoán lại chính xác số lượng và giá tiền. Vui lòng khôi phục từ bản sao lưu trước khi thao tác sai và kiểm tra thủ công, hệ thống không tự động trừ lại hay phát bù điểm.

### 3. Sổ cái cũ ghi đè lên thay đổi khác phát sinh trong lúc chờ kiểm nghiệm

- Trước khi ghi sẽ lưu ảnh chụp nhanh sổ cái bất biến và dấu thời gian so sánh, đồng thời cố định mảng trò chuyện và đối tượng siêu dữ liệu.
- Sau khi kiểm nghiệm máy chủ trả về, trước khi chạy hàm cập nhật và sau khi hàm cập nhật bất đồng bộ trả về đều kiểm tra lại sổ cái trên trang và quyền kết toán.
- Hễ sổ cái trên trang có thay đổi là từ chối lần cam kết này, giữ nguyên sửa đổi từ bên ngoài, không ghi đè bản nháp cũ lên và cũng không tự động chạy lại logic trừ phí.
- Thực nghiệm phản ví dụ: số dư 100 đang chờ kiểm nghiệm, máy chủ đổi thành 200, yêu cầu trừ 10 ban đầu bị từ chối, trên trang/máy chủ vẫn là 200; sau khi người dùng làm mới dữ liệu và xác nhận trừ tiền lại thì nhận được **190**, chứ không phải 90.
- Đây không phải là giao dịch CAS xuyên tiện ích mở rộng ở phía máy chủ. Không thể đảm bảo các tiến trình khác không tuân theo cùng một khóa sẽ tuyệt đối không tranh chấp trong lúc đang lưu thực tế; các trạng thái đọc lại không khớp / không rõ ràng sau khi lưu vẫn tiếp tục đóng băng và nhắc kiểm tra thủ công thay vì tự động gửi lặp lại.

### 4. Môi trường lưu và chẩn đoán

- Đổi dòng báo cáo dễ gây hiểu nhầm “HTTPS: Có/Không” thành báo cáo tách biệt **Ngữ cảnh bảo mật, Giao thức kết nối, Web Locks, Khả năng lưu**. `HTTP localhost` vẫn có thể là ngữ cảnh bảo mật; và `HTTPS` cũng không đồng nghĩa với việc `Web Locks` chắc chắn khả dụng.
- Trang Cài đặt và trang Kết nối hiển thị giới hạn ngay trước khi lưu; việc lưu cài đặt, biến và sổ cái trong môi trường bị hạn chế sẽ bị từ chối ngay từ đầu chứ không sửa bộ nhớ trước rồi báo khống là đã lưu thành công.
- Ngữ cảnh không bảo mật: khi chạy quán rượu trên cùng máy có thể dùng `http://localhost:cổng` / `http://127.0.0.1:cổng`; khi dùng điện thoại truy cập vào máy tính bắt buộc phải dùng phương thức truy cập HTTPS được trình duyệt tin cậy, vì `localhost` trên điện thoại không phải là máy tính.
- Có ngữ cảnh bảo mật nhưng không có Web Locks: nhắc chuyển sang trình duyệt hiện đại có hỗ trợ Web Locks và thoát khỏi các trình duyệt nhúng WebView bị hạn chế, tránh để người dùng tốn công chỉ đi đổi HTTPS vô ích.
- Không khuyến khích tắt bảo vệ an ninh của trình duyệt hay mở danh sách trắng cho nguồn không an toàn. Trước khi đổi nguồn truy cập hãy sao lưu trước, đừng xóa dữ liệu trình duyệt.
- Đưa các lỗi từ chối môi trường, từ chối ghi của Bridge và ngoại lệ lưu cài đặt vào danh sách lỗi gần đây. Đối với các ngoại lệ lưu cài đặt trễ bị nội bộ quán rượu nuốt mất, hệ thống nhận diện tiền tố lỗi cố định của máy chủ và ghi nhận lỗi chung mà không sao chép nội dung yêu cầu, khóa API hay trò chuyện riêng.
- Đổi câu thông báo thành công ở trang Kết nối thành “Đã giao cho quán rượu lưu”, không coi việc hàm chống dội (debounce) của máy chủ trả về là chứng từ đã ghi đĩa trên máy chủ. Xác minh bằng tiêm lỗi HTTP 503: sau khi máy chủ bắt lỗi, trong báo cáo chẩn đoán vẫn có bản ghi “Lưu cài đặt máy chủ”.
- Nhật ký lỗi tiếp tục giữ tối đa 30 mục gần nhất trong bộ nhớ phiên trang hiện tại, làm mới trang sẽ xóa trống; không phải cơ sở dữ liệu kiểm toán xuyên suốt các lần khởi động lại. Nhãn bản sửa đổi có thể kiểm tra trong phần Sao chép thông tin chẩn đoán.

## Kiểm chứng vòng này

- `npm test`: **330/330** (305 mục cũ + 25 mục mới trong vòng này).
- Trình duyệt: **10 bộ, 301/301**, SillyTavern cô lập **1.19.0 / 7e8663c**, Playwright Chromium, mô hình giả lập tất định.

| Bộ kiểm thử | Đạt |
|---|---:|
| native_v084 | 29/29 |
| native_v090 | 24/24 |
| native_v091 | 35/35 |
| native_v093 | 29/29 |
| native_v100 | 28/28 |
| native_v100_feedback | 44/44 |
| native_v110 | 37/37 |
| native_v110_review | 12/12 |
| native_group060 | 44/44 |
| native_v110_patch3 (thêm mới vòng này) | 19/19 |

- 19 mục mới bao gồm chuyển đổi nhân vật trên máy chủ thật, kết quả mô hình trả về trễ, lưu và tải lại cuộc trò chuyện thật, sửa sổ cái trong khe hở chờ kiểm nghiệm, ghi đĩa quy hoạch thu hồi thực tế, lỗi HTTP lưu bị máy chủ bắt giữ. Bài kiểm tra chuyên biệt về môi trường sử dụng trang mô-đun độc lập trên cùng máy chủ cô lập: HTTP không phải loopback thực tế (không có ngữ cảnh bảo mật / không có Web Locks), và tiêm lỗi xóa tường minh Web Locks trong ngữ cảnh bảo mật HTTP loopback; trường hợp sau không tuyên bố là đã thử nghiệm một lỗi trình duyệt vật lý cụ thể nào.
- Thực thi đầy đủ kiểm tra cú pháp JS toàn bộ tệp, nguồn gốc `vendor` nguyên bản, biên dịch Python, kiểm tra khoảng trắng `git diff`, danh sách SHA toàn bộ tệp, CRC của tệp ZIP, đối chiếu từng tệp trong ZIP với cây thư mục làm việc, và kiểm tra toàn bộ cây thư mục sau khi đè gói cập nhật lên bản cơ sở.
- Chưa kết nối cuộc trò chuyện thật của người dùng, chưa chạy yêu cầu trả phí trên mô hình thật, chưa nghiệm thu trên điện thoại vật lý, thực thể cài đặt thực tế của người dùng hay toàn bộ ma trận phiên bản 1.16/1.17/1.18. Cảm ứng trên trình duyệt là mô phỏng, không đồng nghĩa với điện thoại vật lý.

## Quá trình gặp lỗi và khắc phục cũng được lưu lại

1. Thêm đợt đầu 14 phản ví dụ định hướng: trước khi vá có 13 mục thất bại và 1 mục đạt, xác nhận đây không phải chỉ là thêm các kiểm tra tĩnh hình thức.
2. Trong bản vá đầu tiên, vị trí chèn bước kiểm tra sau hàm cập nhật bất đồng bộ bị đặt sai, bài kiểm tra định hướng đã bắt được lỗi này và sửa lại; đồng thời bổ sung thêm bài kiểm tra hồi quy ghi cài đặt toàn cục để tránh việc kiểm tra cục bộ của cuộc trò chuyện chặn nhầm nhánh cài đặt.
3. Bộ khung kiểm thử trình duyệt chẩn đoán mới ban đầu chặn điều hướng HTML khiến Chromium coi tài nguyên mô-đun thuộc không gian địa chỉ riêng tư hơn và làm lỗi lệnh `import`; đã đổi sang phản hồi HTTP thực tế để trang tải mô-đun mà không nới lỏng kiểm soát bảo mật của trình duyệt.
4. Kịch bản trình duyệt `feedback` cũ dùng bộ chọn cứng `Tên|Phẩm_giai` kiểu cũ nên bị quá thời gian ở mục 20/22. Đã đổi sang định danh lô nguồn gốc mới / định vị vật phẩm hiển thị thực tế mà không xóa bất kỳ kiểm tra nào về giám định, giá tiền, nguồn gốc hay các kiểm tra gốc khác, chạy lại trọn vẹn đạt **44/44**.
5. Bài kiểm tra đơn vị cũ từng coi việc “gộp chung các vật phẩm có mức định giá khác nhau” là hành vi đúng. Vòng này đã sửa lại thành kiểm tra tách riêng hai lô nguồn gốc và đóng băng giá thu hồi, đồng thời thêm bài kiểm tra tổng số tiền thu hồi thực tế; không giữ lại hành vi sai cũ chỉ để làm đẹp số lượng bài kiểm tra vượt qua.

Bàn giao vòng này chỉ là bàn giao tệp. Chưa cài đặt, chưa ghi đè tiện ích hiện có, chưa cập nhật hay đẩy lên Git. Các thao tác tiếp theo và danh sách toàn bộ đường dẫn thay thế xem tại [REPLACE-1.1.0](REPLACE-1.1.0.md).
