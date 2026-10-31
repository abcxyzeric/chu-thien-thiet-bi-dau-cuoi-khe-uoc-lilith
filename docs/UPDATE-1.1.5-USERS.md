# Báo cáo cập nhật Thiết Bị Đầu Cuối Chư Thiên: Từ 1.1.3 lên 1.1.5-r1 đã thay đổi những gì

Báo cáo này bao gồm **1.1.4, 1.1.5 và 1.1.5-r1**, lấy phiên bản 1.1.3 đã phát hành làm điểm xuất phát. Hiện tại tiện ích hiển thị phiên bản **1.1.5**, bản sửa đổi trong phần chẩn đoán hiển thị **1.1.5-r1**. Ngày tổng hợp: 10 tháng 10 năm 2026.

Đợt cập nhật này cho phép đổi nhân cách trợ lý hệ thống, gom các tính năng sẵn có về trang công tắc tập trung, đưa nhân vật trong Sách Thế Giới vào nhóm chat và nối tiếp với chính văn; đồng thời bổ sung xóa từng tin nhắn nhóm, tạo lại (reroll) lượt chat nhóm, cài đặt tạo trò chuyện nhóm, mở khóa sổ cái và kiểm tra tầng tin nhắn. Dưới đây trình bày chi tiết từng thay đổi thực tế, lối vào và điều kiện sử dụng.

## I. Bảng tổng hợp thay đổi

| Tính năng | 1.1.3 | Phiên bản hiện tại |
|---|---|---|
| Thân phận trợ lý | Cố định là Lilith | 3 lựa chọn: Lilith, Quang cầu đánh số, Tùy chỉnh; giao diện và các yêu cầu trợ lý tiếp theo đều đổi theo |
| Quản lý tính năng | Cài đặt nằm rải rác, thiếu nơi quản lý mô-đun và trang thống nhất | 37 công tắc tập trung, quản lý ẩn/hiện trang, lối tắt nhảy tới các cài đặt theo từng cuộc trò chuyện |
| Chiêu mộ thành viên nhóm | Đã có chiêu mộ ngẫu nhiên, chỉ định thế giới hoặc nhân vật | Thêm mới tìm kiếm mục từ điển từ Sách Thế Giới sẵn có, tổng hợp ứng viên và mời vào nhóm |
| Bối cảnh thành viên nhóm | Chủ yếu dựa vào hồ sơ đã đăng ký và trò chuyện gần đây | Thành viên có nguồn từ Sách Thế Giới có thể mang theo mục từ điển nhân vật và bối cảnh từ khóa |
| Tương tác trong nhóm nối tiếp chính văn | Đã có tóm tắt nhóm thông thường | Thêm mới ký ức tương tác định hướng cho thành viên có nguồn từ Sách Thế Giới |
| Quản lý tin nhắn nhóm | Chưa có công cụ xóa từng tin và tạo lại (reroll) | Thêm chế độ quản lý, xóa từng tin nhắn, tạo lại (reroll) lượt gần nhất |
| Tạo trò chuyện nhóm | Số người, số chữ, số tin nhắn gần đây cơ bản cố định | 5 mục cài đặt tùy chỉnh, tự động tính ngân sách đầu ra, cảnh báo cắt cụt với cổng độc lập |
| Đối chiếu bản lưu | Biến không liên quan thay đổi có thể gây đóng băng nhầm | Chỉ đối chiếu những mục thay đổi trong lần ghi này, thêm nút Kiểm tra và mở khóa sổ cái |
| Tự động chỉnh lý ký ức | Tên nhận diện không hợp lệ có thể làm hỏng cả loạt | Làm sạch tên và khử trùng lặp trước, sau đó mới chuyển cho bộ kiểm tra gốc |
| Bảo vệ chuỗi suy nghĩ | Bản nháp khối dữ liệu trong lúc suy nghĩ có thể nuốt nhầm chính văn | Bỏ qua bản nháp, bảo vệ thẻ suy nghĩ, kiểm tra tầng tin nhắn mới nhất |
| Hướng dẫn sử dụng | Chưa có trang Sách hướng dẫn tích hợp trong thiết bị đầu cuối | Tích hợp mục lục và tìm kiếm ngay trong thiết bị đầu cuối, kèm bản chi tiết 40 chương trực tuyến và trang web ngoại tuyến |

## II. 1.1.5: Trợ lý hệ thống có thể đổi nhân cách

**Lối vào: Cài đặt → Làm quen → Nhân cách trợ lý hệ thống.**

### Thêm mới 3 lựa chọn

- **Lilith**: mặc định giữ nguyên nhân cách gốc, ảnh đứng phân lớp, biểu cảm biến thể và cách chạm tương tác.
- **Quang cầu Hệ thống (Đánh số)**: ảnh đại diện quả cầu ánh sáng đánh số, mặc định điềm tĩnh, ngắn gọn, thông báo theo từng mục. Ví dụ đánh số 007 và để trống tên thì sẽ dùng 「Hệ thống 007」.
- **Tùy chỉnh**: tự điền tên, cách xưng hô với Ký chủ, phụ đề tiếng Anh, tính cách, giọng điệu và ảnh đại diện. Chế độ Quang cầu có thêm ô nhập số hiệu.

Phần cài đặt nâng cao cho phép thay thế nguyên đoạn 「Quy tắc nhân cách trong cốt truyện」 và 「Nhân cách trò chuyện riêng」. Mục đầu dùng cho chính văn, mục sau dùng cho trò chuyện riêng với trợ lý, có thể điền độc lập; khi để trống sẽ tự tạo quy tắc dựa trên thông tin cơ bản.

### Những nơi thực sự thay đổi sau khi lưu

| Vị trí | Thay đổi thực tế |
|---|---|
| Cốt truyện chính văn | Mỗi lần tạo văn bản sẽ tạm thời dùng quy tắc nhân cách mới, danh xưng Lilith trong các quy tắc Chư Thiên cũng được thay thế theo |
| Trò chuyện riêng với trợ lý | Các yêu cầu tiếp theo dùng nhân cách mới, mặc định vẫn giữ ràng buộc “trò chuyện riêng không đồng nghĩa với việc thực thi giao dịch trò chơi” |
| Các yêu cầu trợ lý như Ký ức và Bàn làm việc | Danh xưng hệ thống trong yêu cầu được xử lý theo nhân cách mới, cổng API theo từng tính năng vẫn đi theo định tuyến cũ |
| Giao diện trợ lý | Nhóm điều hướng, tiêu đề, văn bản gợi ý, ảnh đại diện… đều đổi theo |
| Thẻ thoại ở tầng tin nhắn | Nhận diện lời thoại theo tên mới, ví dụ 「【Hệ thống 007】：“……”」 |
| Ảnh đứng và lối vào nổi | Nhân cách khác Lilith sử dụng ảnh đại diện và nút đánh thức hình tròn; ảnh đứng phân lớp, biểu cảm biến thể và chạm tương tác của Lilith vẫn dành riêng cho Lilith |

Thêm mới các nút 「Tải ảnh đại diện lên」, 「Dùng mặc định」, 「Xem trước」, 「Lưu và áp dụng」, 「Hủy thay đổi」, 「Đổi về Lilith」, 「Quay lại cài đặt」. Xem trước giúp kiểm tra quy tắc cốt truyện và trò chuyện riêng mà không gọi mô hình; sau khi lưu thông thường không cần làm mới trang, yêu cầu tiếp theo sẽ dùng ngay nhân cách mới. Quay lại cài đặt sẽ hủy bỏ các thay đổi chưa lưu.

Ảnh đại diện tải lên sẽ được cắt vuông và nén thành ảnh 256 pixel. Ảnh gốc tối đa 8 MB, nội dung lưu sau khi nén giới hạn ở mức 400 KB. Khi chưa tải ảnh lên sẽ dùng ảnh đại diện tự động.

**Việc đổi nhân cách sẽ không viết lại chính văn cũ, trò chuyện riêng cũ, tin nhắn nhóm, kết quả bàn làm việc hay ký ức cũ, cũng không ghi đè tệp Sách Thế Giới gốc.** Đổi tên và tính cách không đồng nghĩa với việc xóa sạch toàn bộ bối cảnh gốc; danh xưng trong các mục Chư Thiên khác được thay thế cơ học nên nội dung hướng người lớn nguyên bản vẫn có thể còn giữ lại. Nếu muốn thay đổi triệt để quy tắc, bạn cần kiểm tra phần thay thế nguyên đoạn nâng cao và các mục từ điển liên quan.

## III. 1.1.5: Công tắc tính năng thống nhất và quản lý hiển thị trang

**Lối vào: Cài đặt → Làm quen → Công tắc tính năng.**

Bản cập nhật này gom các cài đặt sẵn có vào một bảng duy nhất, đồng thời bổ sung quản lý toàn bộ mô-đun và các trang trên thanh điều hướng. Các tính năng cũ không phải đều được viết lại từ đầu, nhưng giờ đây có thể tìm kiếm, bật/tắt và khôi phục tập trung tại một nơi.

### Cụ thể 37 mục gồm những gì

| Nhóm | Số lượng | Các mục có thể quản lý |
|---|---:|---|
| Trợ lý hệ thống | 9 | Cửa sổ trợ lý, cửa sổ nổi, khung thoại ở tầng tin nhắn, chạm tương tác, rung, phản ứng nhân vật giao diện, lời thoại khi vào trang, góc máy quay, bong bóng thông báo |
| Tầng trò chuyện & Khối dữ liệu | 10 | Ghi sổ khối dữ liệu, nhãn nhỏ tầng tin nhắn, lọc khối dữ liệu tầng cũ, tự động sửa lỗi, ghi bổ sung khi thiếu, nhắc định dạng mỗi lượt, nhắc công pháp chưa vào sổ, macro biến, tự động cài đặt & liên kết Sách Thế Giới, tự động gỡ liên kết khi tắt tiện ích |
| Lời nhắc cốt truyện & xử lý tự động liên quan | 7 | Ghi nhận xuyên không, nhắc phẩm giai khi thu thập, hiệu chỉnh phẩm giai, hiệu quả độ thuần thục, tích lũy thực chiến, đồng bộ công pháp thẻ nhân vật, phụ trợ tự tạo |
| Nhóm chat | 4 | Toàn bộ Nhóm chat, công tắc tổng tự động tán gẫu, đọc Sách Thế Giới, tiêm ký ức thành viên nhóm |
| Giao diện & Thao tác | 7 | Xem nhanh sổ cái (HUD), phím tắt, lệnh `/zt`, tự động bật hướng dẫn tân thủ, chủ đề thế giới, hoạt cảnh diễn xuất, thẻ gợi ý cốt truyện khi đóng thiết bị đầu cuối |

### Tác dụng khác nhau của từng công tắc

- **Tắt toàn bộ Nhóm chat**: ẩn trang nhóm chat, dừng tóm tắt nhóm cho chính văn, dừng tự động tán gẫu, tạm dừng đếm ngược giáng lâm. Bản r1 còn dừng cả quy tắc liên kết nhóm chat trong Sách Thế Giới tích hợp sẵn, bật lại sẽ khôi phục.
- **Chỉ tắt công tắc tổng Tự động tán gẫu**: không còn tự động trò chuyện nhóm sau mỗi lượt cốt truyện, nhưng trò chuyện thủ công vẫn dùng bình thường.
- **Tắt Đọc Sách Thế Giới**: ẩn lối vào triệu hồi, trò chuyện nhóm và trò chuyện riêng với thành viên nhóm ngừng đính kèm tư liệu trong sách, các thành viên đã có vẫn được giữ nguyên.
- **Tắt Tiêm ký ức thành viên nhóm**: ngừng gửi đoạn tóm tắt tương tác nhân vật này cho chính văn, lịch sử trò chuyện vẫn giữ nguyên.
- **Tắt Phụ trợ tự tạo**: ẩn trang Tự tạo, các quy tắc tự tạo đã bật không còn gửi cho chính văn nữa, cấu hình vẫn được giữ nguyên.
- **Tắt Ghi sổ khối dữ liệu**: ngừng tự động đăng ký từ chính văn; còn chỉ tắt nhãn nhỏ thì chỉ ẩn lối vào xem nhanh, hai mục này khác nhau.
- **Tắt lệnh `/zt`**: lệnh chỉ báo đã tắt và không thực thi hành động.
- **Tắt Tự động bật hướng dẫn tân thủ**: vẫn có thể mở hướng dẫn thủ công từ phần Cài đặt.
- **Tắt Cửa sổ trợ lý hệ thống**: dừng các trang liên quan và tự động chỉnh lý ký ức, cần làm mới trang để có hiệu lực.

Hiệu chỉnh phẩm giai, tích lũy thực chiến và đồng bộ công pháp thẻ nhân vật còn ảnh hưởng tới việc đăng ký tự động, không nên hiểu toàn bộ nhóm này chỉ là “bớt gửi một câu nhắc cho AI”.

### Thêm mới ẩn trang và khôi phục một chạm

Mục 「Trang thiết bị đầu cuối」 có thể gỡ các trang ít dùng khỏi thanh điều hướng. **Ẩn trang Thương thành không đồng nghĩa với việc dừng mọi hoạt động của Thương thành; ẩn trang khác với tắt mô-đun.** Các trang Tổng quan, Cài đặt, Kết nối cùng hai trang Nhân cách và Công tắc dùng để khôi phục quản lý luôn được giữ lại.

Nút 「Bật tất cả」 khôi phục toàn bộ tính năng và các trang bị ẩn trong bảng này, đồng thời cũng có thể bật lại những mục mà bạn từng chủ động tắt.

Việc chỉnh lý ký ức, tóm tắt nhóm & khoảng cách tán gẫu của từng cuộc trò chuyện, hay bật/tắt từng phụ trợ cụ thể vẫn đi theo cuộc trò chuyện hiện tại; trang thống nhất có cung cấp nút 「Đi tới cài đặt」. Bật công tắc tổng không có nghĩa là tự động bật mọi mục chi tiết trong từng bản lưu.

## IV. 1.1.5: Triệu hồi thành viên nhóm từ Sách Thế Giới

**Lối vào: Nhóm chat → Thành viên → Triệu hồi từ Sách Thế Giới.**

Trước đây đã có chiêu mộ theo thế giới hoặc nhân vật, nhưng chưa có quy trình “chọn mục từ điển có sẵn và lưu lại nguồn gốc”. Giờ đây bạn có thể dùng chính tư liệu nhân vật trong Sách Thế Giới của mình để chiêu mộ thành viên nhóm.

1. Chọn một Sách Thế Giới hiện có; dấu ★ biểu thị sách đang dùng trong cuộc trò chuyện hiện tại, danh sách tự loại trừ sách Hệ Thống Chư Thiên.
2. Nhập tên nhân vật hoặc từ khóa, bấm 「Tìm kiếm」. Hệ thống tìm trong tiêu đề, từ khóa và nội dung, bỏ qua các mục đang tắt hoặc trống, hiển thị tối đa 30 mục.
3. Xem tóm tắt mục từ điển, bấm 「Triệu hồi」. Mô hình sẽ tổng hợp tên, xuất xứ, bậc thực lực, tính cách, đặc sản để tạo ra ứng viên.
4. Xem báo giá vào nhóm rồi bấm 「Mời vào nhóm」, hoặc có thể từ bỏ.

**Tìm kiếm không trừ điểm và không gọi mô hình.** Khi lưu ứng viên hợp lệ sẽ trừ 100 Điểm Hệ Thống; nếu thất bại trước khi lưu sẽ không trừ điểm triệu hồi, nhưng nhà cung cấp API vẫn có thể tính phí gọi mô hình. Khi mời vào nhóm sẽ tính phí theo bậc thực lực, 100 điểm không phải là giá trọn gói bao gồm cả phí vào nhóm. Nếu báo trạng thái lưu không rõ ràng, hãy kiểm tra sổ cái trước.

Khi nhóm đã đầy, mục từ điển đã bị xóa, nhân vật cùng nguồn đã ở trong nhóm, hoặc còn ứng viên chưa xử lý, hệ thống sẽ giới hạn thao tác theo điều kiện. Sau khi vào nhóm thành công sẽ lưu lại tên sách và nguồn mục từ điển, thẻ thành viên hiển thị nhãn Sách Thế Giới.

### Trò chuyện nhóm và trò chuyện riêng bổ sung tư liệu nhân vật và bối cảnh

Thành viên có nguồn từ Sách Thế Giới có thể mang theo bản tóm tắt mục từ điển gốc của chính mình, thông thường khoảng 360 chữ mỗi người; khi cuộc trò chuyện khớp từ khóa còn có thể mang theo bối cảnh trong cùng cuốn sách đó, mỗi cuốn lấy tối đa 3 mục. Hồ sơ thành viên nhóm sẵn có và tin nhắn gần đây vẫn tiếp tục được sử dụng như cũ.

Tư liệu có tổng ngân sách số chữ, mặc định là 1600 chữ để tránh đính kèm vô hạn cả cuốn sách. Ngân sách là cấu hình trong mã nguồn, phiên bản này không có “thanh trượt ngân sách Sách Thế Giới” hiển thị cho người dùng thông thường. Khi không có thành viên nào mang nguồn Sách Thế Giới, hệ thống sẽ không tự dưng thêm đoạn tư liệu này.

Nhờ đó mô hình có thêm căn cứ về nhân vật, nhưng việc nhập vai có chuẩn xác hay tư liệu có được tận dụng hay không vẫn phụ thuộc vào đầu ra thực tế của mô hình.

## V. 1.1.5: Đưa ký ức tương tác của thành viên Sách Thế Giới trở lại chính văn

Bản tóm tắt nhóm chat thông thường đã có từ trước; điểm mới lần này là bản tóm tắt tương tác định hướng dành cho các thành viên có nguồn từ Sách Thế Giới.

Khi 4 tầng chính văn gần nhất xuất hiện tên thành viên nhóm, hoặc khớp với từ khóa hợp lệ của mục từ điển nguồn, hệ thống có thể đính kèm vào chính văn các cuộc trò chuyện nhóm gần đây, trò chuyện riêng, quà tặng và độ hảo cảm, mỗi lần tối đa 3 người.

Ví dụ: bạn vừa bàn bạc một việc với nhân vật nào đó trong nhóm chat, sau đó ở chính văn viết “Ta đi tìm người đó”. Khi bật liên kết, mô hình chính văn sẽ nhận được tóm tắt tương tác liên quan trong nhóm, giảm tình trạng hai bên tách biệt hoàn toàn.

Để có hiệu lực cần thỏa mãn: **thành viên có nguồn từ Sách Thế Giới, tên nhân vật hoặc từ khóa khớp trong chính văn, cuộc trò chuyện hiện tại bật tiêm tóm tắt cốt truyện, và tiện ích bật tiêm ký ức thành viên nhóm.** Tính năng này cung cấp ngữ cảnh chứ không đảm bảo mô hình luôn làm theo 100%, và cũng không ghi lịch sử trò chuyện vào Sách Thế Giới gốc.

## VI. 1.1.4: Xóa từng tin nhắn trong nhóm chat

**Lối vào: Nhóm chat → Trò chuyện → 「🗑 Quản lý」.** Mỗi tin nhắn sẽ hiện nút xóa, bấm 「✓ Xong」 để thoát chế độ quản lý.

| Loại tin nhắn | Có xóa được không | Hệ quả |
|---|---|---|
| Tin nhắn thông thường của thành viên, tin nhắn thông thường của bạn, thông báo hệ thống | Được | Xóa khỏi danh sách tin nhắn nhóm |
| Lì xì chưa giật | Được sau khi xác nhận | Tin nhắn và lì xì cùng bị hủy bỏ, bộ đếm số lì xì nhận trong ngày (nếu đủ điều kiện) được hoàn lại |
| Quà tặng chưa nhận | Được sau khi xác nhận | Tin nhắn và quà tặng chờ nhận cùng bị hủy bỏ |
| Lì xì đã giật | Không được | Giữ nguyên bản ghi nhận thưởng đã vào sổ |
| Lì xì do chính bạn phát | Không được | Điểm Hệ Thống hoặc vật phẩm đã trừ không được hoàn lại khi xóa tin nhắn |
| Quà tặng đã nhận | Không được | Giữ nguyên bản ghi nhận quà đã vào túi đồ |

Công cụ này quản lý Nhóm Chat Chư Thiên bên trong thiết bị đầu cuối, không phải các tầng tin nhắn của cuộc trò chuyện chính trong quán rượu. Xóa tin nhắn thông thường không tự động hoàn tác các giao dịch đã hoàn tất.

## VII. 1.1.4: Tạo lại (reroll) lượt trò chuyện nhóm gần nhất

**Lối vào: Nhóm chat → Trò chuyện → 「↻ Tạo lại」.** Tạo lại (reroll) nghĩa là giữ nguyên đầu vào và tạo lại phản hồi của các thành viên nhóm.

- Áp dụng cho lượt phản hồi tin nhắn gần nhất, hoặc lần tự động tán gẫu gần nhất.
- Câu nói của chính bạn được giữ nguyên; khi thử lại sẽ dùng đúng câu nhập hoặc đoạn cốt truyện ban đầu.
- Trước khi phản hồi mới về tới nơi và được lưu thay thế, lượt cũ vẫn được giữ nguyên; nếu yêu cầu thất bại hoặc quá thời gian sẽ không xóa trắng tin nhắn cũ trước.
- Khi thay thế, các tin nhắn thành viên, cảnh báo cắt cụt, lì xì chưa giật và quà tặng chưa nhận của lượt đó sẽ được xử lý cùng lúc; bộ đếm lì xì và nhịp độ được điều chỉnh đồng bộ, số lượt cấm ngôn đã tiêu hao trong lượt đó (nếu đủ điều kiện) được khôi phục.
- Nếu trong lượt đó bạn đã giật lì xì hoặc đã nhận quà tặng thì không thể tạo lại nữa, tránh việc giữ nguyên lợi ích cũ rồi lại nhận thêm lần nữa.
- **Chỉ hỗ trợ lượt gần nhất.** Việc lưu tối đa 5 lượt gần đây không có nghĩa là có thể tùy ý chọn 1 trong 5 lượt để làm lại.
- Tin nhắn từ bản 1.1.3 trở về trước không có bản ghi lượt kiểu mới nên không thể tạo lại hồi tố, nhưng những tin nhắn được phép xóa vẫn có thể xóa từng tin.

Tạo lại sẽ gọi lại mô hình nên nhà cung cấp dịch vụ có thể tính phí; đây không phải là nút hoàn tiền giao dịch.

## VIII. 1.1.4: 5 mục cài đặt tạo trò chuyện nhóm và cảnh báo cắt cụt

**Lối vào: Nhóm chat → Việc nhóm → Tạo trò chuyện nhóm.**

| Cài đặt | 1.1.3 | Phạm vi tùy chọn hiện tại | Mặc định |
|---|---|---|---|
| Số người phát biểu tối thiểu | Phạm vi mặc định cơ bản cố định | 1–6, 8, 10 người | 1 người |
| Số người phát biểu tối đa | Phạm vi mặc định cơ bản cố định | 1–6, 8, 10 người | 6 người |
| Giới hạn số chữ mỗi tin | 300 chữ | 120, 200, 300, 400, 600, 800 chữ | 300 chữ |
| Số tin nhắn gần đây mang theo | 16 tin | 8, 16, 30, 50 tin | 16 tin |
| Giới hạn đầu ra (max tokens) | Thường là 1200, hoặc bị cài đặt cổng mặc định ghi đè | Tự động, 1200, 2000, 3000, 4000, 6000, 8000 | Tự động |

Khi đặt mức tối thiểu lớn hơn mức tối đa, mục còn lại sẽ tự điều chỉnh theo. Số người thực tế còn phụ thuộc vào số thành viên hiện có, trạng thái cấm ngôn và đầu ra của mô hình. Tự động tán gẫu thông thường tối đa 3 người, nhưng nếu đặt mức tối thiểu cao hơn 3 thì bản hiện tại có thể vượt quá 3 người.

### Ngân sách đầu ra mặc định cũng đã thay đổi

Số người, số chữ và số tin nhắn gần đây mặc định vẫn giữ nguyên giá trị cũ, nhưng ngân sách đầu ra được đổi thành:

`600 + Số_người_tối_đa × (Số_chữ_mỗi_tin + 20)`, tự động giới hạn trong khoảng 1200–6000.

Với mặc định 6 người và 300 chữ, công thức tính ra **2520 tokens**, rộng rãi hơn mức 1200 trước đây. `tokens` là đơn vị giới hạn độ dài của cổng API, không bằng trực tiếp số chữ tiếng Việt/tiếng Trung; giá trị cuối cùng còn phụ thuộc vào cấu hình cổng kết nối.

Thứ tự ưu tiên hiện tại là: **giới hạn của cổng API riêng cho Nhóm chat → giới hạn chọn cụ thể trong Việc nhóm → giới hạn cổng API mặc định → ước tính tự động**. Khi chọn một con số cụ thể trong Việc nhóm thì giá trị đó được ưu tiên hơn cổng mặc định, nhưng vẫn đứng sau giới hạn của cổng API chuyên biệt cho Nhóm chat.

### Thêm cảnh báo rõ ràng khi đầu ra chạm trần giới hạn

Khi API độc lập báo bị cắt cụt (truncation), tiện ích sẽ bỏ dòng cuối cùng để tránh nhận một câu đang viết dở làm tin nhắn hoàn chỉnh, đồng thời hiện thông báo gợi ý Tạo lại, tăng giới hạn đầu ra hoặc giảm số người và số chữ. Vì vậy khi bị cắt cụt có thể hiển thị ít hơn trước một dòng cuối——đây là bước chủ động loại bỏ nội dung chưa hoàn chỉnh.

**API chính của quán rượu chỉ trả về văn bản mà không trả về nguyên nhân kết thúc này, nên không thể hiển thị cảnh báo cắt cụt tương tự một cách đáng tin cậy.** Người dùng API chính vẫn có thể chỉnh các cài đặt trên; không thấy cảnh báo không có nghĩa là câu trả lời chắc chắn đầy đủ.

## IX. 1.1.4: Giảm đóng băng nhầm sổ cái, thêm nút Kiểm tra và mở khóa

Trước đây sau khi lưu sẽ so sánh toàn bộ biến trò chuyện, nên nếu thẻ nhân vật hoặc kịch bản khác vừa khéo thay đổi dữ liệu không liên quan thì cũng có thể kích hoạt thông báo “trạng thái ghi không rõ ràng”; hình thức lưu của các giá trị đặc biệt và những lần lưu cũ đến trễ cũng gây nhiễu.

Giờ đây hệ thống chỉ đối chiếu những biến thực sự thay đổi trong lần ghi này và so sánh theo dạng dữ liệu có thể lưu trữ. Trong luồng cầu nối (bridge), nếu đọc lại không khớp sẽ đợi khoảng 0.7 giây rồi thử lưu lại và đọc lại lần nữa; luồng kết toán sổ cái nguyên bản sẽ đọc lại thêm một lần để xác nhận chứ không tự động ghi đè lại. Khi thực sự không thể xác nhận thì vẫn đóng băng để tránh trừ phí lặp lại khi chưa rõ kết quả.

Thêm mới **Cài đặt → Chẩn đoán & Bảo trì → Kiểm tra và mở khóa sổ cái**:

- Bản lưu máy chủ và trên trang khớp nhau: mở khóa ngay, không cần làm mới trang.
- Không khớp: liệt kê các mục khác biệt và hỏi có muốn tải lại trang hay không; sau khi đồng ý sẽ tải lại theo bản lưu trên máy chủ.
- Không bị đóng băng: báo có thể thao tác bình thường.

Nút kiểm tra không sửa đổi sổ cái, không tự động phát bù hay hoàn tiền. Sau khi mở khóa, hãy kiểm tra xem thao tác vừa rồi đã có hiệu lực hay chưa rồi mới quyết định có làm lại hay không.

## X. 1.1.4: Làm sạch tên khóa ký ức, giảm lỗi thất bại cả loạt khi chỉnh lý

Khóa ký ức là tên nhận diện của từng mục ký ức. Trước đây nếu mô hình viết ra các khóa như 「林雪·关系」, 「任务：取钥匙」, 「Lin Xue」, chữ toàn giác hoặc tên trùng lặp thì có thể khiến cả loạt không thể lưu.

Giờ đây hệ thống sẽ chuẩn hóa ký tự toàn giác trước, đổi các ký tự không được phép thành dấu gạch dưới, xử lý các tên nguy hiểm, cắt bỏ dấu phân cách thừa ở hai đầu và giới hạn ở 64 ký tự. Nếu sau khi làm sạch bị rỗng sẽ tự tạo tên nhận diện; nếu trong cùng một loạt có tên trùng nhau sẽ giữ lại mục đứng sau, rồi mới chuyển cho bộ kiểm tra nguyên bản.

Việc này giúp giảm lỗi thất bại do định dạng tên, **nhưng không nới lỏng các bước kiểm tra nguyên bản về bằng chứng, số lượng và nội dung, cũng không tự động sửa những sự thật mà mô hình viết sai.**

## XI. 1.1.4: Bảo vệ bản nháp trong chuỗi suy nghĩ và kiểm tra tầng mới nhất

Chuỗi suy nghĩ là đoạn suy luận của mô hình, ví dụ `<think>…</think>`; khối dữ liệu là `<ZhuTianPanel>` ở cuối chính văn dùng để ghi sổ.

Lỗi đã tái hiện được: trong phần suy nghĩ có bản nháp chưa đóng thẻ, còn ở cuối chính văn lại có khối dữ liệu chính thức, bộ phân tích cũ có thể nối liền hai chỗ thành một đoạn và nuốt mất cả thẻ đóng suy nghĩ lẫn chính văn, dẫn tới mất chính văn, hiển thị nhầm chỉ số nháp và dữ liệu chính thức không được ghi sổ.

Cách xử lý cụ thể trong bản này:

1. Đổi thẻ bản nháp trong phần suy nghĩ sang ký tự toàn giác để nội dung vẫn đọc được bình thường nhưng không bị coi là khối ghi sổ chính thức nữa.
2. Khi kết xuất tầng tin nhắn, ràng buộc sổ cái và lọc khối dữ liệu cũ đều bỏ qua đoạn suy nghĩ nằm ngoài khối dữ liệu; nội dung tương tự ở các tầng cũ cũng được xử lý theo bộ phân tích mới.
3. Bảo vệ các thẻ suy nghĩ trong quá trình sửa lỗi, bao gồm cả trường hợp điền sẵn (prefill) chỉ để lại thẻ đóng.
4. Khi chỉ có khối dữ liệu nằm bên trong phần suy nghĩ, hệ thống sẽ chuyển nó ra sau chính văn theo quy tắc và giữ nguyên các thẻ suy nghĩ.
5. Khi phần suy nghĩ chưa đóng thẻ, hệ thống tránh tiếp tục thực hiện các bước sửa lỗi hay ghi bổ sung khác.
6. Kiểm tra xem nội dung được bảo vệ có được đặt trả lại đúng hay không, nếu không thỏa mãn sẽ giữ nguyên toàn bộ nguyên văn.
7. Lời thoại hệ thống nằm trong phần suy nghĩ không còn bị vẽ nhầm thành thẻ thoại nữa.
8. Nhắc định dạng mỗi lượt mặc định đổi từ độ sâu 0 sang độ sâu 1 (có thể chỉnh trong Cài đặt) và cập nhật lại nội dung câu nhắc.

**Tất cả các mục ở độ sâu 0 trong Sách Thế Giới gốc không bị tự động sửa đổi.** Các thiết lập sẵn (preset) phụ thuộc vào điền sẵn (prefill) để mở đầu chuỗi suy nghĩ có thể vẫn cần chỉnh độ sâu trong Sách Thế Giới; hiện tượng lỗi thẻ được phản hồi ở các cuộc trò chuyện không phải Chư Thiên chưa tái hiện được, nên không thể khẳng định mọi vấn đề về chuỗi suy nghĩ đều đã được giải quyết hoàn toàn.

Thêm mới **Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra tầng mới nhất: Tiện ích có can thiệp không?」**: xem cuộc trò chuyện có phải bản lưu Chư Thiên không, tầng này có bị viết lại không, có bản sao lưu nguyên văn không, tình trạng thẻ suy nghĩ và khung suy luận, có phải do tiện ích kết xuất không, cũng như vị trí, độ sâu và vai trò của các lời nhắc do mọi tiện ích mở rộng đang tiêm vào. Báo cáo sẽ tự động sao chép vào bộ nhớ tạm để tiện gửi phản hồi.

## XII. 1.1.5-r1: 5 bản vá tiếp theo

| Điều kiện | Trước bản r1 có thể xảy ra chuyện gì | Cách xử lý hiện tại |
|---|---|---|
| Khi trò chuyện nhóm hoặc trò chuyện riêng với thành viên đang đọc Sách Thế Giới mà bấm gửi liên tiếp hoặc đụng đúng lúc tự động tán gẫu | Khi chưa kịp đánh dấu bận có thể chen thêm một lượt nữa, gây gửi yêu cầu và trả lời trùng lặp | Đánh dấu trạng thái bận ngay trước khi đọc Sách Thế Giới, khép kín khoảng trống kích hoạt trùng lặp này |
| Tắt toàn bộ Nhóm chat | Quy tắc nhóm chat trong Sách Thế Giới tích hợp sẵn vẫn có thể gửi cho chính văn, khiến mô hình tưởng rằng vẫn còn nhóm chat | Loại bỏ mục liên kết nhóm khỏi bản sao của lượt tạo này, bật lại sẽ khôi phục, không sửa sách gốc |
| Chính văn vừa gửi lần đầu nhắc tới thành viên có nguồn từ Sách Thế Giới | Ký ức thành viên nhóm bị trễ một lượt mới theo kịp | Làm mới bản tóm tắt ngay sau khi tin nhắn người dùng đi vào cuộc trò chuyện |
| Sau khi đổi nhân cách, lịch sử cũ vẫn gọi là Lilith | Mô hình lại quay về dùng tên cũ và giọng điệu cũ | Quy tắc mới đính kèm thêm phần Đối chiếu danh xưng, phần thay thế nguyên đoạn nâng cao cũng tự động đính kèm |
| Tên nhân cách chỉ có 1 ký tự hoặc chứa ký tự thay thế đặc biệt | Câu tự thuật kiểu 「Ta nói」 bị nhận nhầm thành lời thoại hệ thống, hoặc việc nhận diện bị ký tự đặc biệt làm lệch | Yêu cầu tối thiểu 2 ký tự khác khoảng trắng và sửa cách xử lý ký tự đặc biệt |

5 mục trên là các bản vá bổ sung cho tính năng mới của 1.1.5; bản r1 không tăng số phiên bản hiển thị riêng nên cần xem số bản sửa đổi trong phần chẩn đoán.

## XIII. Sách hướng dẫn và các mục giao diện nhỏ

- **Sách hướng dẫn tích hợp từ 1.1.4**: thanh điều hướng thiết bị đầu cuối thêm trang Hướng dẫn với mục lục, nhảy chương và tìm kiếm theo chương, hỗ trợ nhiều từ khóa cách nhau bằng dấu cách.
- **Mở rộng bản tra cứu nhanh trong 1.1.5**: bổ sung nhân cách, công tắc tính năng, triệu hồi Sách Thế Giới và ký ức thành viên nhóm, hiện có 19 chương.
- **Bàn giao tài liệu hướng dẫn chi tiết**: bản trực tuyến 40 chương và tệp HTML ngoại tuyến, giải thích từng nút bấm, chi phí, phạm vi lưu và cách khôi phục, trang web có tìm kiếm, mục lục, in ấn, quay về đầu trang và giao diện đọc trên điện thoại. Bản tra cứu nhanh bên trong tiện ích không bị thay thành 40 chương.
- **Xử lý khi thoát mô-đun**: bổ sung hàm dọn dẹp khi đóng trang Hướng dẫn, sửa cảnh báo thiếu hàm xử lý có thể xuất hiện khi tắt tiện ích.
- **Tên nhóm cài đặt**: nhóm 「Lilith」 trước đây được đổi tên thành 「Trợ lý hệ thống」 và hiển thị mô tả theo nhân cách hiện tại.

[Hướng dẫn chi tiết trực tuyến](USER-GUIDE-1.1.5.md) · [Tệp phiên bản web có tìm kiếm](USER-GUIDE-1.1.5.html). Bản trực tuyến có thể đọc ngay; tệp HTML tải về rồi mở bằng trình duyệt.

## XIV. Tại sao sau khi cập nhật một số nơi trông như không thay đổi

| Tình huống | Nguyên nhân và cách kiểm tra |
|---|---|
| Vẫn là Lilith | Mặc định giữ nguyên thiết lập cũ; hãy vào trang Nhân cách để chọn và lưu |
| Phản hồi cũ vẫn mang tên cũ | Lịch sử cũ không bị viết lại, hãy quan sát ở lần tạo văn bản hoặc trò chuyện riêng tiếp theo |
| Thanh điều hướng vẫn nhiều trang như trước | Hệ thống không tự ý ẩn trang thay bạn, hãy vào Công tắc tính năng để chọn ẩn/hiện trang |
| Thành viên nhóm cũ không có tư liệu sách | Thành viên chiêu mộ kiểu cũ không tự động ghép mục từ điển, nguồn sách chỉ được đăng ký qua quy trình triệu hồi mới |
| Chính văn không thể hiện tương tác trong nhóm | Kiểm tra nguồn thành viên, từ khóa/tên nhân vật có xuất hiện trong chính văn không, và cả hai công tắc tiêm tóm tắt đã bật chưa; mức độ tận dụng của mô hình thật vẫn cần quan sát thêm |
| Tin nhắn cũ không tạo lại (reroll) được | Không có bản ghi lượt kiểu mới, cần tạo một lượt mới sau khi cập nhật |
| Phản hồi nhóm vẫn ngắn | Mặc định mỗi tin vẫn là 300 chữ, giới hạn cổng theo tính năng có thể đang ghi đè, hoặc bản thân mô hình viết ngắn |
| Không thấy khác biệt rõ rệt khi lưu hay trong chuỗi suy nghĩ | Cơ chế bảo vệ chỉ kích hoạt khi gặp điều kiện lỗi cụ thể, không chủ động sửa đổi các phản hồi bình thường |
| Đổi công tắc trợ lý mà chưa thấy tác dụng | Cửa sổ trợ lý cần làm mới trang, còn tự động chỉnh lý ký ức và tán gẫu vẫn phải xem cài đặt của cuộc trò chuyện hiện tại |

**Những nội dung đã có từ 1.1.3, không tính lặp lại là tính năng mới của đợt này:** tách riêng đóng và chuyển đổi cửa sổ nổi, kích thước tối thiểu 20%, nút × chỉ đóng thiết bị đầu cuối, rút thẻ Gộp cổ điển gom thành một yêu cầu, cùng bộ lọc trang Quan hệ, Bảng điều khiển Quản trị viên, đăng ký bù lì xì và bảo hiểm Thần phẩm trước đó.

Xác suất của Thương thành và rút thẻ, quy tắc cơ bản của Thần phẩm và Cấm kỵ, trần lì xì nhóm, biểu phí cơ bản của chiêu mộ và giáng lâm không phải được thiết kế lại trong đợt này. Việc sách hướng dẫn đính chính lại mô tả về phí giáng lâm cố định, phí mở rộng nhóm cố định hay phạm vi gỡ liên kết là để chuẩn hóa tài liệu, không có nghĩa là đợt này lại sửa đổi tính năng tính phí hay gỡ liên kết.

## XV. Cập nhật và tương thích với bản lưu cũ

1. Vào Cài đặt → Sổ cái & Bản lưu → Xuất / Nhập bản lưu để sao lưu trước.
2. Cập nhật tiện ích này trong phần Quản lý tiện ích mở rộng của quán rượu, sau khi xong hãy làm mới trang; chỉ làm mới trang sẽ không tải mã nguồn mới về.
3. Sao chép thông tin chẩn đoán để xác nhận phiên bản 1.1.5, bản sửa đổi 1.1.5-r1, sau đó bật các cài đặt mới theo nhu cầu.

Phiên bản cấu trúc sổ cái vẫn là 2, giữ nguyên khóa lưu trữ, quy tắc Sách Thế Giới vẫn là 1.1.1. Các cuộc trò chuyện cũ tiếp tục sử dụng bình thường; dữ liệu mới như lượt trò chuyện nhóm & cài đặt tạo, cài đặt nhân cách & mô-đun, nguồn Sách Thế Giới của thành viên nhóm… được bổ sung tự nhiên mà không cần xóa bản lưu cũ hay ghi đè lại toàn bộ Sách Thế Giới Chư Thiên.

Các cài đặt sẵn có chỉ điền bù những trường còn thiếu chứ không ép bật toàn bộ các mục chi tiết cũ. Ví dụ đồng bộ công pháp thẻ nhân vật mặc định vẫn tắt, và tự động tán gẫu của từng cuộc trò chuyện vẫn tuân theo cài đặt riêng của cuộc trò chuyện đó.

## XVI. Phạm vi kiểm증 và căn cứ

Hồ sơ phát hành r1 ghi nhận 449 bài kiểm tra tự động đều vượt qua. Báo cáo này được biên soạn lại bằng cách đối chiếu mã nguồn và khác biệt giữa các phiên bản, không coi các bài kiểm tra lịch sử là kết quả thử nghiệm thực tế vừa chạy lại hôm nay. Các tính năng nhân cách, triệu hồi và ký ức trong quán rượu cô lập được kiểm chứng bằng mô hình giả lập; hiệu quả nhập vai trên mô hình thật, điện thoại vật lý cũng như một số thao tác thanh toán nguyên bản vẫn chưa được nghiệm thu toàn diện. Trong bộ kiểm tra hồi quy trình duyệt lịch sử, mục 「Rút gọn hiệu ứng động」 vẫn còn 1 lỗi chưa đạt vốn cũng tái hiện được trên bản 1.1.3 cũ, đợt này không tuyên bố đã sửa xong mục đó.

Căn cứ: khác biệt giữa mã nguồn 1.1.3 `96d477b` và mã nguồn 1.1.5-r1 `8bbb23d`, cùng [Thay đổi 1.1.4](CHANGES-1.1.4.md), [Thay đổi 1.1.5 và r1](CHANGES-1.1.5.md), [Nghiệm thu 1.1.5](ACCEPTANCE-1.1.5.md). Các lần commit tài liệu tiếp theo không đại diện cho phiên bản tính năng mới của tiện ích.
