# Nhật ký cập nhật (CHANGELOG)

Mô tả đầy đủ của từng phiên bản nằm trong `docs/CHANGES-<phiên_bản>.md`, hồ sơ nghiệm thu nằm trong `docs/ACCEPTANCE-<phiên_bản>.md`. Tệp này tổng hợp theo thứ tự phiên bản giảm dần, nội dung trước bản 1.0.0 được chuyển nguyên văn từ README cũ sang.

## 1.1.5 (Bản chính thức)

Nhân cách trợ lý hệ thống có thể tùy chỉnh: mặc định vẫn là Lilith, ngoài ra có thiết lập sẵn 「Quang cầu Hệ thống (Đánh số)」, hoặc tự viết tên / cách xưng hô / tính cách / giọng điệu / ảnh đại diện. Trong cốt truyện mỗi lần tạo văn bản sẽ tạm thời thay thế quy tắc Lilith trong Sách Thế Giới, không ghi vào tệp Sách Thế Giới; Trò chuyện riêng / Ký ức / Bàn làm việc đổi theo nhân cách, giao diện cũng đổi theo, có thể đổi về bất cứ lúc nào. Thêm mới 「Công tắc tính năng」: toàn bộ tính năng nằm trên một bảng duy nhất, bật/tắt riêng từng mục, các trang không dùng có thể ẩn khỏi thanh điều hướng. Nhóm chat có thể 「Triệu hồi từ Sách Thế Giới」 nhân vật: chỉ đọc mục từ điển, trò chuyện nhóm mang theo tư liệu mục từ điển, khi nhân vật đó xuất hiện trong chính văn sẽ tiêm ký ức thành viên nhóm (có thể tắt). Sách hướng dẫn thêm mới chương 18 và 19.

**Bản sửa đổi tự kiểm tra r1**: khi có thành viên nhóm được triệu hồi mà bấm gửi liên tiếp có thể chạy song song hai lượt trò chuyện nhóm (đã sửa); sau khi tắt nhóm chat thì mục số 36 trong Sách Thế Giới của tiện ích vẫn gửi cho chính văn (đã sửa); khi câu nói lượt này lần đầu nhắc tới thành viên nhóm thì ký ức bị trễ một lượt (đã sửa); quy tắc nhân cách thêm 「Đối chiếu danh xưng」 để tránh bị tên cũ 「Lilith」 kéo ngược về; tên nhân cách tối thiểu 2 ký tự.

Xem [CHANGES-1.1.5](docs/CHANGES-1.1.5.md), [ACCEPTANCE-1.1.5](docs/ACCEPTANCE-1.1.5.md).

## 1.1.4

Nhóm chat có thể xóa từng tin nhắn, tạo lại (reroll) lượt gần nhất (lì xì / quà tặng đã nhận không thể thu hồi), hiển thị cảnh báo khi bị cắt cụt, và thêm mới cài đặt tạo trò chuyện nhóm (số người / số chữ / ngữ cảnh / giới hạn đầu ra); sửa lỗi đóng băng nhầm khi kiểm tra đọc lại sau khi ghi, thêm mới 「Kiểm tra và mở khóa sổ cái」; tự động làm sạch khóa ký ức, không còn báo lỗi cả loạt 「trùng lặp hoặc không an toàn」; bảo vệ chuỗi suy nghĩ (bản nháp khối dữ liệu trong chuỗi suy nghĩ không còn nuốt mất `</think>` và chính văn), thêm mới 「Kiểm tra tầng tin nhắn mới nhất」; thêm mới Sách hướng dẫn ngay trong thiết bị đầu cuối (`docs/MANUAL.md`).

Xem [CHANGES-1.1.4](docs/CHANGES-1.1.4.md), [ACCEPTANCE-1.1.4](docs/ACCEPTANCE-1.1.4.md).

## 1.1.3

Tách riêng 「Chuyển đổi」 cửa sổ nổi (Lilith ⇄ Ảnh đại diện) và 「Đóng」 (ẩn cả hai), kéo Lilith hoặc ảnh đại diện xuống đáy màn hình đều có hai ô mục tiêu riêng, trong phần Cài đặt có thể đóng riêng; kích thước Lilith nổi / ảnh đại diện giảm xuống tối thiểu 20%; nút × của thiết bị đầu cuối chỉ đóng thiết bị đầu cuối; rút thẻ Gộp cổ điển chỉ gọi API một lần duy nhất, phần Phàm phẩm / Linh phẩm bị gộp chỉ đếm số lượng.

Xem [CHANGES-1.1.3](docs/CHANGES-1.1.3.md), [ACCEPTANCE-1.1.3](docs/ACCEPTANCE-1.1.3.md).

## 1.1.2

Chuyển đổi chế độ rút thẻ (mặc định là Gộp cổ điển: ≥50 lượt rút gộp Phàm phẩm, ≥100 lượt rút gộp cả Linh phẩm thành một dòng, phần đã gộp không gọi mô hình; có thể chọn Kết toán mỗi 10 lượt); làm lại trang Quan hệ (ưu tiên thế giới hiện tại, bộ lọc, thành viên nhóm mặc định không vào Quan hệ, có thể kéo vào từ trang Thành viên nhóm chat hoặc Sơ đồ quan hệ); chuyển Bảng điều khiển Quản trị viên thành trang bên trong thiết bị đầu cuối (thêm bảo hiểm hộp mù, độ hảo cảm của bất kỳ nhân vật quan hệ hay thành viên nhóm nào, chỉ ghi những mục đã sửa, từ chối ghi nếu có xung đột, tài nguyên độc quyền đồng bộ với ảnh chụp nhanh các tầng).

Xem [CHANGES-1.1.2](docs/CHANGES-1.1.2.md), [ACCEPTANCE-1.1.2](docs/ACCEPTANCE-1.1.2.md).

## 1.1.1

Bản cập nhật nhỏ sửa lỗi: bảo hiểm Thần phẩm 1000 lượt rút (phiên bản quy tắc Sách Thế Giới 1.1.1); nhận diện linh hoạt lì xì nhóm, đánh dấu lì xì chưa vào sổ, đăng ký bù từ tin nhắn cũ; Bảo vệ định dạng khối dữ liệu (tự động chỉnh lý phản hồi mới và có thể khôi phục, hiển thị tầng cũ và lời nhắc dùng khối đã chỉnh lý, nhắc định dạng mỗi lượt, tự sửa 「Kích hoạt / Lĩnh ngộ 《X》」 thành `收录:X`, nhắc nhở công pháp cốt truyện chưa vào sổ, ghi bổ sung khi thiếu · thử nghiệm); sửa lỗi toàn trang bị đẩy dịch lên trên; ở chế độ toàn màn hình trên điện thoại, ảnh đại diện Lilith ở góc trên bên trái thiết bị đầu cuối không còn đè vào thanh trạng thái (cửa sổ nổi cảm ứng cũng tránh thanh trạng thái / tai thỏ); khi hộp mù và thương thành bị cắt cụt sẽ giữ lại các kết quả hoàn chỉnh và giảm một nửa kích thước lô, hộp mù kết toán mỗi 10 lượt rút.

**Sửa lỗi rà soát trước phát hành**: Giữ lại / Phân giải / Phân giải theo phẩm giai / Giữ lại tất cả / Thu hồi được đổi thành một lần ghi có khóa duy nhất (không còn nuốt phần thưởng hoặc phát thưởng trùng lặp); trong lúc chờ ghi bổ sung nếu sổ cái có thay đổi thì không ghi, cố định vào cuộc trò chuyện đã khởi tạo, sau khi tắt tiện ích thì không ghi; 「Khôi phục nguyên văn」 lưu toàn bộ nguyên văn và từ chối bản sao lưu không đầy đủ; túi đồ chỉ xếp chồng các vật phẩm có cùng Tên / Phẩm cấp / Giá / Nguồn gốc / Phân loại / Hiệu quả; trước khi swipe / tạo lại sẽ hoàn tác ảnh chụp nhanh của tầng đó trước để tài sản ngoài Điểm Hệ Thống không bị cộng dồn; khi lưu kết quả rút thẻ chưa được xác nhận sẽ thông báo trung thực.

Xem [CHANGES-1.1.1](docs/CHANGES-1.1.1.md), [ACCEPTANCE-1.1.1](docs/ACCEPTANCE-1.1.1.md).

## 1.1.0

**Bản sửa đổi 1.1.0-patch4**: sửa lỗi thiết bị đầu cuối cũ vẫn có thể đọc/ghi cuộc trò chuyện mới sau khi chuyển cuộc trò chuyện; ràng buộc danh tính và ngữ cảnh cuộc trò chuyện gốc, thu hồi giao diện khi giải phóng trang, kiểm tra lại các thao tác xếp hàng/bất đồng bộ trước khi cam kết. Vượt qua 348 bài kiểm tra đơn vị, 60 kiểm tra tĩnh và 9 kiểm tra trình duyệt cô lập; vòng này chưa nghiệm thu trên phiên bản SillyTavern thực tế. [Sổ theo dõi vòng này](docs/PATCH-1.1.0-4.md).

**Bản sửa đổi 1.1.0-patch3**: phản hồi bất đồng bộ của nhóm chat cố định vào cuộc trò chuyện đích; giám định giữ nguyên lô nguồn gốc vật phẩm và giá thu hồi; sau khi kiểm nghiệm máy chủ / trình cập nhật bất đồng bộ sẽ kiểm tra lại sổ cái trên trang, nếu xung đột sẽ từ chối ghi và không trừ điểm lại; kiểm tra trước ngữ cảnh bảo mật và Web Locks trước khi lưu, tách riêng giao thức kết nối, ghi nhận lỗi lưu trễ của máy chủ vào chẩn đoán. Vượt qua 330 bài kiểm tra đơn vị và 10 bộ với 301 mục hồi quy trình duyệt, chưa nghiệm thu trên mô hình thật / điện thoại thật. [Sổ theo dõi vòng này](docs/PATCH-1.1.0-3.md).

Cửa sổ nổi cảm ứng / nút mở tròn, Thu thập cốt truyện độc lập, Quan hệ đa mục tiêu, Tùy chỉnh hàng hóa và tránh trùng lặp, ngân sách API và chẩn đoán cắt cụt, tinh giản nhật ký thao tác, Sách Thế Giới không ép giảm sức mạnh cùng xử lý xung đột sao lưu, chuẩn hóa bí danh ký ức; sổ cái schema 2 và bảo vệ đóng băng khi đọc lại từ máy chủ. Sửa đổi tăng thêm dựa trên nhánh `main` `ce29f61`, giữ nguyên `vendor` gốc.

Xem [CHANGES-1.1.0](docs/CHANGES-1.1.0.md), [ACCEPTANCE-1.1.0](docs/ACCEPTANCE-1.1.0.md), [Danh sách thay thế](docs/REPLACE-1.1.0.md).

## 1.0.0

Xem [docs/CHANGES-1.0.0.md](docs/CHANGES-1.0.0.md), [docs/ACCEPTANCE-1.0.0.md](docs/ACCEPTANCE-1.0.0.md).

- Lilith nổi trên điện thoại đổi thành nhân vật tách nền (không khung thẻ), có vỗ cánh, biểu cảm, chớp mắt và nhép môi khi nói;
- Trang Cài đặt chia thành 「Thường dùng / Cài đặt nâng cao / Chẩn đoán & Bảo trì」, có thanh tìm kiếm;
- Xuất / Nhập bản lưu (không chứa API Key, trước khi nhập có xem trước, sao lưu trước và kiểm tra đọc lại); phiên bản cấu trúc sổ cái (cuộc trò chuyện cũ sao lưu trước rồi mới nâng cấp, sổ cái được ghi bởi bản mới hơn sẽ ở chế độ chỉ đọc);
- Trước khi hoàn tác sổ cái luôn tự động sao lưu trạng thái hiện tại trước; thông báo lỗi thống nhất nêu rõ 「sổ cái có thay đổi hay không, bước tiếp theo làm gì」;
- Thanh điều hướng xoay ngang trên điện thoại chỉ giữ 6 trang thường dùng + nút 「Thêm」; hiệu ứng động tự động chuyển sang bản rút gọn trên thiết bị cấu hình thấp;
- `/zt init` không còn tiện tay mở luôn hộp thoại Sách Thế Giới; thêm mới lệnh `/zt export`;
- Thêm mới `LICENSE` (mã nguồn hiển thị công khai, bảo lưu mọi quyền, nghiêm cấm phân phối lại, sử dụng thương mại và huấn luyện AI), `docs/UNINSTALL.md`; tinh giản README và chuyển lịch sử phiên bản sang tệp này.

Bổ sung từ phản hồi người chơi (giữ nguyên số phiên bản):
- Giám định phẩm giai: công pháp và vật phẩm đến từ cốt truyện / thẻ nhân vật / bản lưu cũ không còn bị khóa cứng ở Phàm phẩm, có thể nhờ AI giám định hoặc chỉnh sửa thủ công (chỉ tăng không giảm); cú pháp 「收录:Tên_công_pháp[Phẩm_giai_cao_hơn]」 có thể hiệu chỉnh phẩm giai;
- API theo từng tính năng: 11 nơi như rút thẻ, nhóm chat, trò chuyện riêng với Lilith… có thể dùng cổng API riêng cho từng tính năng; thiết lập sẵn cổng API (bắt buộc nhập tên mới lưu được);
- Tắt tiện ích một chạm ngay trong phần Cài đặt; có thể kéo Lilith nổi xuống đáy màn hình / bấm chuột phải để đóng, kèm hướng dẫn mở lại bảng điều khiển từ bảng 「Tiện ích mở rộng」 của quán rượu;
- Sửa lỗi: lời nhắc đã tiêm có thể bị mất sau khi chuyển cuộc trò chuyện; trên điện thoại, thẻ diễn xuất ở trang trò chuyện, nút lối vào dự phòng và ô mục tiêu 「Đóng cửa sổ nổi」 bị trôi ra ngoài phía trên màn hình không nhìn thấy.

## Tóm tắt các phiên bản 0.5.0 – 0.8.5 (Phần đầu README cũ)

**Từ 0.5.0 trở đi, toàn bộ Hệ Thống Chư Thiên nằm gọn trong một cửa sổ duy nhất**: bấm vào ảnh đại diện Lilith để mở 「Thiết Bị Đầu Cuối Chư Thiên」, Tổng quan, Nhiệm vụ, Quan hệ, Tu hành, Thương thành, Túi đồ, Phụ trợ, Thần thông, Bàn làm việc Lilith, Ký ức, Cài đặt đều nằm trong cùng một thanh điều hướng; tầng tin nhắn trò chuyện không còn hiển thị thanh trạng thái lớn nữa mà chỉ để lại một nhãn nhỏ 「✧ Hệ thống đã ghi nhận」. Xem [CHANGES-0.5.0](docs/CHANGES-0.5.0.md).

**0.6.0 thêm mới Nhóm Chat Chư Thiên Vạn Giới**: nhóm chat xuyên thế giới ngay trong thiết bị đầu cuối, thành viên nhóm có thể trò chuyện, phát lì xì, tặng quà, cầu viện, phát trực tiếp, giáng lâm vào cốt truyện; những thứ thành viên nhóm gửi tặng thực sự được ghi vào sổ cái. Xem [CHANGES-0.6.0](docs/CHANGES-0.6.0.md).

**0.7.0 giúp thiết bị đầu cuối biến đổi theo thế giới**: tự động chuyển đổi giữa ba bộ chủ đề thế giới Tiên hiệp / Cyber / Quỷ dị; Lilith phản ứng với nhiệm vụ, vật phẩm bạn chọn cũng như kết quả thành bại khi kết toán; thêm mới 「Đồ phổ」 (Dòng sự kiện, Sơ đồ quan hệ, Bản đồ sao, Cây năng lực) với mọi nút đều liên kết ngược về bản ghi trong sổ cái; xuyên không, đột phá, ký khế ước, hoàn thành nhiệm vụ, rút thưởng, nhập kho đều có hoạt cảnh diễn xuất ngắn có thể bỏ qua, và chỉ phát sau khi sổ cái đã ghi và đọc lại xác nhận. Xem [CHANGES-0.7.0](docs/CHANGES-0.7.0.md).

**0.8.0 hợp nhất Lilith và thiết bị đầu cuối làm một**: các trang của Lilith đi theo chủ đề thế giới, dòng trạng thái Lilith ở thanh trạng thái gốc được đổi thành bong bóng thoại trên ảnh đứng (bấm vào khoảng trống sẽ có lời thoại theo cốt truyện); Điểm Hệ Thống ở thanh đỉnh và phần Tổng quan cơ bản thống nhất đọc từ sổ cái; thu gọn Bảng điều khiển Quản trị viên vào trong Cài đặt; thanh điều hướng thêm mới phụ trợ 「Tự tạo」; hiệu quả thực tế của từng giai đoạn độ thuần thục được báo rõ cho AI, công pháp đã dùng trong cốt truyện sẽ tích lũy thực chiến; có thể đọc công pháp từ thẻ nhân vật. Xem [CHANGES-0.8.0](docs/CHANGES-0.8.0.md).

**0.8.1 Bản sửa lỗi**: nút 「Lấy danh sách mô hình」 ở trang kết nối của Lilith không còn báo lỗi CORS liên tục nữa (khi bị chặn sẽ chuyển tiếp qua máy chủ quán rượu của chính bạn); chiêu mộ nhóm chat ngẫu nhiên thực sự, chọn bậc thực lực theo Điểm Hệ Thống của bạn, phí vào nhóm bắt đầu từ 300 điểm; lì xì của thành viên nhóm 3–4 lượt một lần (trừ khi bạn chủ động xin); đồ vật nhận được từ nhóm chat mang theo lai lịch ghi vào lời nhắc cốt truyện; Sách Thế Giới có thể cập nhật một chạm lên bản của tiện ích (sao lưu trước) hoặc xuất ra JSON. Xem [CHANGES-0.8.1](docs/CHANGES-0.8.1.md).

**0.9.0 Tương thích giao diện điện thoại**: trên điện thoại thiết bị đầu cuối hiển thị toàn màn hình (khi xoay ngang thanh điều hướng chuyển sang cột dọc bên trái), tự thu thấp chiều cao theo bàn phím ảo để ô nhập liệu không bị che khuất; cửa sổ trò chuyện riêng cũng toàn màn hình; phóng to nút bấm, ô nhập liệu 16 px (iOS không còn tự phóng to cả trang khi chạm vào ô nhập); Lilith nổi đậu ở góc dưới khi mở thiết bị đầu cuối; sau khi dùng trên điện thoại thì kích thước cửa sổ thiết bị đầu cuối trên máy tính không còn bị ghi đè theo kích thước điện thoại. Có thể đổi lại thành cửa sổ nổi tại Cài đặt → 「Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại」. Chỉ mới nghiệm thu trên trình giả lập điện thoại, chưa thử nghiệm trên máy thật. Xem [CHANGES-0.9.0](docs/CHANGES-0.9.0.md), những việc còn lại trước bản 1.0 xem [ROADMAP-1.0](docs/ROADMAP-1.0.md).

**0.8.5**: sửa lỗi tầng mới nhất trên điện thoại không kết xuất mà hiển thị dữ liệu thô (khi bị sót sự kiện 「Kết thúc tạo」 sẽ lấy nút Dừng làm chuẩn, trong Chẩn đoán tương thích có thể kiểm tra và kết xuất lại tầng mới nhất); trang cài đặt cổng AI đổi thành 「Một câu trạng thái + Ba bước」, sửa lỗi dàn trang nút radio; nút 「Kiểm nghiệm ngay chính văn mới nhất」 ở trang Ký ức thêm giải thích, khi chưa bật sẽ làm nổi bật công tắc cần tích và nút lưu. Xem [CHANGES-0.8.5](docs/CHANGES-0.8.5.md).

**0.8.4**: toàn bộ yêu cầu API đều chuyển sang truyền phát trực tuyến (streaming) (sửa lỗi lấy danh sách mô hình báo cắt cụt, trò chuyện báo lỗi 502, trò chuyện riêng kèm cốt truyện bị quá thời gian), thời gian chờ trò chuyện riêng có thể đặt 60–600 giây (mặc định 180 giây); trên điện thoại bấm trò chuyện riêng từ trong thiết bị đầu cuối không còn làm đóng thiết bị đầu cuối; gộp cài đặt API về một nơi duy nhất (trang 「Kết nối」 của thiết bị đầu cuối); thêm 7 bảng màu, chủ đề Tiên hiệp đổi sang Vàng Mặc Ngọc; có thể bật/tắt các mô-đun mạnh như Thần Hào Tiêu Xài, Tay Đấm Chư Thiên (Sách Thế Giới cài mới mặc định tắt hai mục này); tương thích thêm nhiều tiện ích làm đẹp tầng tin nhắn (trình kết xuất thẻ iframe, kịch bản JS làm đẹp, regex làm đẹp). Xem [CHANGES-0.8.4](docs/CHANGES-0.8.4.md).

**0.8.3**: Lilith nổi mặc định thu nhỏ còn 75%, có thể chỉnh kích thước trong Cài đặt (55%–100%); sửa lỗi khi thiết bị đầu cuối đang mở mà bấm vào cô ấy sẽ làm đóng thiết bị đầu cuối (giờ bấm vào cô ấy chỉ nói chuyện), cũng như lỗi cô ấy vừa bước ra đã tự rụt lại vào mép màn hình. Xem [CHANGES-0.8.3](docs/CHANGES-0.8.3.md).

**0.8.2**: khi tắt tiện ích sẽ tự động gỡ liên kết Sách Thế Giới Chư Thiên khỏi thẻ nhân vật / toàn cục / cuộc trò chuyện hiện tại (SillyTavern 1.17+), trong Cài đặt cũng có nút 「Gỡ liên kết một chạm」 và 「Khôi phục liên kết」; nút góc dưới bên trái trên điện thoại được thay bằng Lilith nổi có thể kéo thả, kéo ra sát mép sẽ trốn vào cạnh màn hình, khi không nhìn thấy ảnh đứng thì lời thoại sẽ bật lên trong bong bóng bên cạnh cô ấy; sửa lỗi thanh trạng thái riêng của thẻ nhân vật (giao diện Tavern Helper) không hiển thị sau khi bật tiện ích; lai lịch vật phẩm nhóm chat được lưu trực tiếp trên vật phẩm trong túi đồ, lời nhắc cốt truyện đọc từ túi đồ; tự động tán gẫu mỗi N lượt một lần, cân bằng lại giới hạn lì xì và chi phí mở rộng nhóm. Nội dung Sách Thế Giới không đổi, không cần nhập lại. Xem [CHANGES-0.8.2](docs/CHANGES-0.8.2.md).

## 0.9.4

Cải tiến nhỏ (từ phản hồi người dùng), mô tả đầy đủ xem [CHANGES-0.9.4](docs/CHANGES-0.9.4.md), nghiệm thu xem [ACCEPTANCE-0.9.4](docs/ACCEPTANCE-0.9.4.md).

- **Nhóm chat → Thành viên → Phát lệnh chiêu mộ**: trước đây khi đang chọn 「Thế giới ngẫu nhiên」, dù điền gì vào ô nhập liệu cũng không có tác dụng, kết quả chiêu mộ vẫn là người từ thế giới ngẫu nhiên. Giờ đây khi gõ chữ vào ô nhập liệu sẽ **tự động chuyển sang 「Chỉ định thế giới」** (sau đó vẫn có thể đổi sang 「Chỉ định nhân vật」); chuyển về 「Thế giới ngẫu nhiên」 sẽ xóa trống ô nhập liệu; văn bản gợi ý (placeholder) của ô nhập liệu thay đổi theo chế độ.
- Khi chọn 「Chỉ định thế giới / Chỉ định nhân vật」 mà chưa điền tên sẽ nhắc ngay “Vui lòng điền tên thế giới / tên nhân vật”, **không trừ 100 điểm**.
- Sổ cái, khóa lưu trữ và Sách Thế Giới đều không thay đổi.

## 0.9.3

Sửa lỗi từ phản hồi người dùng + Hướng dẫn tân thủ, mô tả đầy đủ xem [CHANGES-0.9.3](docs/CHANGES-0.9.3.md), nghiệm thu xem [ACCEPTANCE-0.9.3](docs/ACCEPTANCE-0.9.3.md).

- **Quy tắc → Bối cảnh thế giới bổ sung đã đọc được Sách Thế Giới**: trước đây bấm 「Đọc danh mục sách」 sẽ báo “Trợ lý hiện tại thiếu giao diện đọc Sách Thế Giới” (bản Tavern Helper đọc được, bản tiện ích mở rộng không đọc được). Giờ tiện ích tự cung cấp hai giao diện đọc này, cả SillyTavern và TauriTavern đều đi chung một luồng, không cần Tavern Helper; chỉ đọc, không sửa, không liên kết hay gỡ liên kết bất kỳ Sách Thế Giới nào.
- **Có thể đính chính thế giới bị nhận diện sai trên Bản đồ sao**: chọn thế giới → 「Nhận diện sai? Đính chính thế giới này」, sửa tên thế giới hoặc loại thế giới (ví dụ đổi 「Linh Lung」 bị đoán nhầm thành Tiên hiệp sang Mạt thế). Việc đính chính không tính là một lần xuyên không, không phát hoạt cảnh diễn xuất; đổi tên trùng với dấu chân đã có sẽ tự động gộp lại; thế giới viết sai trong danh sách từng đi qua có thể 「Xóa khỏi dấu chân」. Loại thế giới đoán theo tên sẽ được đánh dấu 「?」 trên Bản đồ sao; nút thế giới hiện tại và chủ đề thanh đỉnh luôn đồng bộ với nhau.
- **Hướng dẫn tân thủ**: lần đầu mở thiết bị đầu cuối khi vẫn còn bước chưa hoàn thành sẽ tự động hiện ra một lần (sau đó mở tại Thiết bị đầu cuối → Hướng dẫn, hoặc Cài đặt → Làm quen → Hướng dẫn tân thủ). Gồm 3 bước: Nhập hoặc cập nhật Sách Thế Giới → Cài đặt cổng AI (có thể chọn dùng ngay mô hình chính hiện tại của quán rượu bằng một chạm) → Bật trong cuộc trò chuyện hiện tại (tạo sổ cái + bật ký ức Lilith). Mỗi bước tự đánh dấu tích theo trạng thái thực tế và có thể bỏ qua.

## 0.9.2

Sửa lỗi phản hồi trên máy thật, mô tả đầy đủ xem [CHANGES-0.9.2](docs/CHANGES-0.9.2.md), nghiệm thu xem [ACCEPTANCE-0.9.2](docs/ACCEPTANCE-0.9.2.md).

- **Lời thoại của Lilith không còn xuất hiện hai lần**: trước đây nếu một tiện ích mở rộng khác (ví dụ tiện ích tô sáng từ khóa bằng gạch chân nét đứt) sửa đoạn lời thoại trước, trong tầng tin nhắn sẽ hiện đồng thời cả nguyên văn lẫn khung thoại, giờ chỉ hiển thị khung thoại.
- **Nguyên văn thanh trạng thái không còn bị lộ ra**: trước đây nếu tiện ích mở rộng dạng biến sửa lại tin nhắn sau khi quán rượu đã vẽ xong tầng tin nhắn, các dòng thô như `系统点: … / 好感度: …` sẽ còn sót lại trong tầng, giờ chỉ giữ lại nhãn nhỏ 「✧ Hệ thống đã ghi nhận」.
- **Khung thoại không còn bị nhảy xuống dưới thanh trạng thái của thẻ nhân vật**: thẻ giao diện do Tavern Helper / Tiểu Bạch X kết xuất được đặt đúng vị trí của nó trong tin nhắn; đoạn `莉莉丝：…` nằm bên trong mã nguồn thẻ giao diện cũng được giữ nguyên, không bị sửa hỏng.
- Thẻ giao diện iframe, thanh trạng thái riêng của thẻ nhân vật và các bước làm đẹp chạy sau khi tiện ích xử lý đều được giữ nguyên như trước.
- Đã tái hiện và sửa xong trong quán rượu cô lập theo đúng tình huống trên điện thoại, **vẫn cần kiểm tra lại trên điện thoại của bạn**.

## 0.9.1

Thay đổi đầy đủ xem [CHANGES-0.9.1](docs/CHANGES-0.9.1.md), kết quả nghiệm thu xem [ACCEPTANCE-0.9.1](docs/ACCEPTANCE-0.9.1.md).

- **Tự kiểm tra trên điện thoại thật**: Cài đặt → Tương thích & Bảo trì → 「Tự kiểm tra trên điện thoại thật…」 (hoặc `/zt selftest`).
  - Thẻ nhỏ ở đầu màn hình dẫn bạn đi qua 8 bước trong khoảng 2 phút: toàn màn hình, đo từng trang, nhóm chat + bàn phím, trò chuyện riêng, Lilith nổi, xoay ngang, phím quay lại.
  - Những việc bạn cần làm chỉ là: chạm một lần vào ô nhập liệu, xoay ngang điện thoại rồi xoay dọc lại, bấm phím quay lại một lần.
  - Sau khi xong bấm 「Sao chép kết quả」 để sao chép một chạm và gửi cho nhà phát triển. Quá trình tự kiểm tra không ghi sổ cái, không gửi tin nhắn, không gọi mô hình.
- **Sao chép thông tin chẩn đoán**: Cài đặt → Tương thích & Bảo trì (hoặc hộp thoại Chẩn đoán tương thích, `/zt copydiag`).
  - Xuất ra một đoạn văn bản thuần túy gồm: phiên bản, thiết bị, giao diện máy chủ, trạng thái chạy, tên máy chủ và tên mô hình của cổng AI, cài đặt tiện ích, kết quả tự kiểm tra lần trước, 30 lỗi tiện ích gần nhất.
  - **Không chứa API Key, nội dung trò chuyện hay số liệu sổ cái**; khóa API vô tình lẫn trong thông báo lỗi cũng sẽ tự động bị che khuất.
  - Khi mở quán rượu trên điện thoại qua địa chỉ mạng LAN (không có HTTPS) vẫn sao chép được.
- **Sửa lỗi trên điện thoại**: các trình duyệt WebView / trình duyệt đóng gói làm thu thấp toàn bộ trang khi bật bàn phím ảo giờ đây cũng được nhận diện là đang bật bàn phím, giúp ô nhập liệu không còn bị che khuất.
- **Chuẩn hóa kỹ thuật**: thống nhất ký tự xuống dòng LF cho toàn bộ tệp và thêm `.gitattributes`; tự động kiểm tra qua GitHub Actions; `npm run filelist` tạo `FILELIST.sha256`; gom các kiểm tra số phiên bản về `tests/version.test.js`.
  - Việc thống nhất ký tự xuống dòng lần này sẽ khiến 25 tệp hiển thị thay đổi toàn bộ tệp trên GitHub, chỉ diễn ra một lần duy nhất này.
- Máy thật: **chưa có kết quả trên điện thoại thật**, đợi chạy xong tự kiểm tra trên điện thoại Android sẽ bổ sung vào hồ sơ nghiệm thu. Chưa thử nghiệm trên iPhone.

## 0.9.0

Thay đổi đầy đủ xem [CHANGES-0.9.0](docs/CHANGES-0.9.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.9.0](docs/ACCEPTANCE-0.9.0.md), những việc cần làm trước bản 1.0 xem [ROADMAP-1.0](docs/ROADMAP-1.0.md).

- **Thiết bị đầu cuối toàn màn hình**:
  - Trên điện thoại thiết bị đầu cuối trải kín màn hình, chừa sẵn vị trí tai thỏ và thanh cử chỉ dưới đáy;
  - Khi xoay ngang màn hình, thanh điều hướng chuyển sang cột dọc bên trái, giúp vùng nội dung ở độ phân giải 844×390 tăng từ 122 px lên 250 px;
  - Sau khi dùng ở chế độ xoay ngang rồi quay lại màn hình dọc sẽ không còn giữ kích thước cửa sổ nhỏ của chế độ ngang nữa.
- **Bàn phím bộ gõ**: khi bàn phím bật lên, thiết bị đầu cuối tự thu thấp chiều cao theo, thanh sổ cái và dòng trạng thái tạm thời nhường chỗ để ô nhập liệu của nhóm chat và trò chuyện riêng luôn hiển thị rõ; khi thu bàn phím lại sẽ khôi phục như cũ.
- **Trò chuyện riêng**: trên điện thoại cũng hiển thị toàn màn hình và tự co giãn theo bàn phím.
- **Dễ bấm, không bị phóng to trang**:
  - Các nút bấm, thanh điều hướng, thẻ nhóm chat và nút gửi đều được làm lớn hơn;
  - Ô nhập liệu trên màn hình cảm ứng thống nhất cỡ chữ 16 px, iOS không còn tự phóng to toàn trang mỗi khi chạm vào ô nhập liệu.
- **Lilith nổi**: khi thiết bị đầu cuối đang mở sẽ đậu ở góc dưới (màn hình ngang đậu ở bên phải); chạm vào lời thoại của cô ấy sẽ thu gọn ngay, khi cuộn trang trong thiết bị đầu cuối lời thoại cũng tự thu gọn.
- **Kích thước cửa sổ trên máy tính**: sau khi dùng thiết bị đầu cuối trên điện thoại, kích thước cửa sổ ghi nhớ trên máy tính không còn bị đổi thành kích thước điện thoại nữa.
- **Cài đặt**: Cài đặt → 「Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại」, có thể chọn Tự động (mặc định) / Luôn toàn màn hình / Cửa sổ nổi (kiểu của bản 0.8.5).
- Chỉ mới nghiệm thu trên trình giả lập điện thoại Chromium (390×844, 844×390, 360×640, sự kiện cảm ứng), **chưa thử nghiệm trên iPhone / Android thật**.

## 0.8.5

Thay đổi đầy đủ xem [CHANGES-0.8.5](docs/CHANGES-0.8.5.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.5](docs/ACCEPTANCE-0.8.5.md).

- **Tầng tin nhắn trên điện thoại không kết xuất**: khi chuyển ứng dụng sang chạy nền trên điện thoại, quán rượu có thể bỏ sót sự kiện 「Kết thúc tạo」, khiến tiện ích tưởng rằng vẫn đang tạo văn bản nên bỏ qua tầng mới nhất. Giờ đây lấy nút Dừng của quán rượu làm chuẩn để tầng mới nhất vẫn kết xuất bình thường. Trong Cài đặt → Chẩn đoán tương thích thêm mới trạng thái 「Tầng mới nhất」 và nút 「Kết xuất lại tầng tin nhắn」.
- **Cài đặt cổng AI** (trang 「Kết nối」 trong thiết bị đầu cuối): tóm tắt trạng thái hiện tại trong một câu, thao tác theo 3 bước 「Chọn dùng AI nào → Điền thông tin cổng → Kiểm tra và lưu」; đưa phần 「Lưu vào…」 vào trong 「Cài đặt nâng cao」; khôi phục kích thước bình thường cho các nút radio.
- **Kiểm nghiệm sổ cái** (Thiết bị đầu cuối → trang 「Ký ức」): 「Kiểm nghiệm ngay chính văn mới nhất」 = không gọi mô hình, dùng dữ liệu Chư Thiên ở cuối chính văn mới nhất đối chiếu với sổ cái và kết toán phần thưởng. Trước khi dùng cần tích chọn 「Bật trợ lý và tiêm ký ức trong cuộc trò chuyện hiện tại」 cùng 「Lilith giám sát sổ cái và phần thưởng」, sau đó bấm 「Lưu cài đặt cuộc trò chuyện hiện tại」. Khi chưa bật, hệ thống sẽ làm nổi bật các mục này và nhắc bằng lời lẽ dễ hiểu.

## 0.8.4

Thay đổi đầy đủ xem [CHANGES-0.8.4](docs/CHANGES-0.8.4.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.4](docs/ACCEPTANCE-0.8.4.md).

- **API**:
  - Mọi yêu cầu đối thoại đều truyền phát trực tuyến (streaming), dù kết nối trực tiếp hay chuyển tiếp qua máy chủ quán rượu, giúp phản hồi dài không còn bị proxy ngắt giữa chừng (lỗi 502 / quá thời gian);
  - Khi lấy danh sách mô hình thất bại sẽ hiển thị nguyên nhân rõ ràng dễ đọc;
  - Thời gian chờ có thể chọn tại Cài đặt → 「Thời gian chờ API độc lập」, mặc định 180 giây.
- **Trò chuyện riêng**: trên điện thoại khi bấm trò chuyện riêng từ thiết bị đầu cuối, khung trò chuyện riêng sẽ mở đè lên phía trên thiết bị đầu cuối chứ không làm đóng thiết bị đầu cuối nữa.
- **Một nơi cài đặt API duy nhất**: trang 「Kết nối」 trong thiết bị đầu cuối chính là Trung tâm API (từ bản 0.8.5 đổi tên thành 「Cài đặt cổng AI」), lưu một lần sẽ ghi đồng thời cho cả thanh trạng thái và Lilith.
- **Bảng màu**: Cài đặt → 「Bảng màu」, có 7 bảng màu cố định để chọn hoặc đi theo chủ đề thế giới; chủ đề Tiên hiệp mặc định đổi sang Vàng Mặc Ngọc.
- **Mô-đun mạnh**: Quản lý phụ trợ → 「Mô-đun mạnh」, công tắc sẽ ghi trực tiếp vào Sách Thế Giới. Sách Thế Giới cài mới mặc định tắt Thần Hào Tiêu Xài và Tay Đấm Chư Thiên; Sách Thế Giới đã có sẵn sẽ không bị tự động sửa đổi, trong Quản lý phụ trợ có nút 「Cân bằng một chạm」.
- **Tương thích làm đẹp**: thẻ / iframe do tiện ích khác kết xuất, đoạn văn đã qua kịch bản JS làm đẹp, hoặc regex làm đẹp đều được giữ nguyên khi tiện ích dựng lại tầng tin nhắn, không bị hiển thị lặp.

## 0.8.3

Thay đổi đầy đủ xem [CHANGES-0.8.3](docs/CHANGES-0.8.3.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.3](docs/ACCEPTANCE-0.8.3.md).

- **Kích thước Lilith nổi**: Cài đặt → Lilith → 「Kích thước Lilith nổi」, có 5 mức: Rất nhỏ 55%, Nhỏ 65%, Tiêu chuẩn 75% (mặc định), Lớn 90%, Rất lớn 100% (kích thước của bản 0.8.2).
- **Bấm vào cô ấy khi thiết bị đầu cuối đang mở**: trước đây sẽ kích hoạt 「Đóng khi bấm bên ngoài thiết bị đầu cuối」, giờ bấm vào cô ấy chỉ nói một câu thoại và thiết bị đầu cuối vẫn mở. Bấm thực sự ra ngoài thiết bị đầu cuối vẫn đóng bình thường.
- **Cô ấy vừa bước ra lại tự rụt về mép màn hình**: trước đây thường xảy ra sau khi đóng thiết bị đầu cuối, xoay màn hình hoặc làm mới trang, nay đã sửa. Chỉ khi kéo rồi thả tay ở sát mép màn hình thì cô ấy mới trốn vào cạnh.

## 0.8.2

Thay đổi đầy đủ xem [CHANGES-0.8.2](docs/CHANGES-0.8.2.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.2](docs/ACCEPTANCE-0.8.2.md).

- **Gỡ liên kết Sách Thế Giới**:
  - Cài đặt → Sách Thế Giới → 「Gỡ liên kết Sách Thế Giới một chạm」: gỡ Sách Thế Giới Chư Thiên khỏi thẻ nhân vật (cả sách chính và sách phụ), Sách Thế Giới toàn cục và cuộc trò chuyện hiện tại, không xóa bản thân Sách Thế Giới;
  - Sau khi gỡ có thể 「Khôi phục liên kết」;
  - Khi tắt tiện ích trong danh sách tiện ích mở rộng sẽ tự động gỡ liên kết (mặc định bật, **cần SillyTavern 1.17+**; bản 1.16 không có hook tắt nên vui lòng bấm thủ công).
- **Lilith nổi** (mặc định bật trên điện thoại / màn hình cảm ứng):
  - Chạm một lần để mở thiết bị đầu cuối, chạm đúp để chọc cô ấy;
  - Nhấn giữ để kéo, kéo ra sát mép trái/phải sẽ phát hoạt ảnh trốn và nấp ở đó;
  - Tự động ghi nhớ vị trí;
  - Khi không nhìn thấy ảnh đứng, phản ứng của cô ấy và thông báo hệ thống sẽ bật lên trong bong bóng bên cạnh cô ấy.
- **Thanh trạng thái riêng của thẻ nhân vật**: trước đây khi tiện ích dựng lại tầng tin nhắn sẽ xóa mất iframe thanh trạng thái do Tavern Helper gắn vào, mà Tavern Helper không gắn lại lần thứ hai nên thanh trạng thái không hiển thị hoặc phải đợi lần kết xuất lại tiếp theo mới hiện. Giờ đã giữ nguyên tại chỗ (thử nghiệm thực tế trên 1.19 + Tavern Helper: 0/12 → 12/12).
- **Nhóm chat**:
  - Lai lịch vật phẩm được ghi trực tiếp trên vật phẩm trong túi đồ, lời nhắc cốt truyện đọc từ túi đồ;
  - Tự động tán gẫu mỗi N lượt phản hồi chính văn một lần (mặc định 3);
  - Lì xì Điểm Hệ Thống của thành viên nhóm không vượt quá phí vào nhóm của người đó;
  - Chi phí mở rộng nhóm đổi thành Dung lượng × 1,000.

## 0.8.1 Sửa lỗi

Thay đổi đầy đủ xem [CHANGES-0.8.1](docs/CHANGES-0.8.1.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.1](docs/ACCEPTANCE-0.8.1.md).

- **API độc lập của Lilith**: hàm `fetch` được gọi khi lấy danh sách mô hình ở trang kết nối nguyên bản không tồn tại trong phạm vi riêng tư của tiện ích, khiến từ bản 0.4 trở đi mỗi lần bấm đều báo 「CORS」; nay đã sửa. Khi trình duyệt thực sự bị CORS chặn, yêu cầu sẽ được chuyển tiếp qua máy chủ quán rượu của chính bạn và giữ nguyên đường dẫn cơ sở `/v1`. Khi chỉ điền tên miền sẽ không còn ghép thành địa chỉ hai dấu gạch chéo `//models` nữa.
- **Chiêu mộ nhóm chat**:
  - Ứng viên vừa mới xuất hiện sẽ không xuất hiện lặp lại ngay;
  - Chế độ ngẫu nhiên tự bốc loại thế giới và bậc thực lực mục tiêu ở cục bộ, đồng thời giới hạn bậc thực lực theo Điểm Hệ Thống hiện có của bạn;
  - Phí vào nhóm đổi thành 300 / 1,500 / 6,000 / 3 vạn / 20 vạn / 200 vạn / 3,000 vạn / 5 tỷ; lệnh chiêu mộ 100 điểm;
  - Ứng viên không đủ tiền mời sẽ không làm trừ âm điểm.
- **Nhịp độ lì xì của thành viên nhóm**: sổ cái bắt buộc cách 3–4 lượt mới có một lần, nếu mô hình tự ý phát thêm cũng không được ghi vào sổ; riêng khi bạn chủ động xin trong nhóm (lì xì / tặng quà / quà…) thì lượt đó được phép.
- **Nối tiếp chính văn**: trường mới `聊天群.入库记录` ghi lại những thứ thực sự đã nhập sổ từ nhóm chat. Lời nhắc cốt truyện sẽ nêu rõ những thứ này đến từ nhóm chat, yêu cầu AI không được sửa đổi lai lịch và không tự bịa ra cuộc trò chuyện nhóm.
- **Bản Sách Thế Giới của tiện ích**: hiệu chỉnh các hướng dẫn đã lỗi thời trên 35 mục nguyên bản (lối vào quản trị viên, Tavern Helper) và thêm mới mục 「36｜Liên kết｜Nhóm Chat Chư Thiên」. Trong Cài đặt có thể 「Cập nhật lên bản mới nhất (sao lưu trước)」 hoặc 「Xuất JSON」, sách cũ không bị tự động ghi đè.

## 0.8.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.8.0](docs/CHANGES-0.8.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.8.0](docs/ACCEPTANCE-0.8.0.md).

- **Thống nhất giao diện**: các trang nguyên bản như Bàn làm việc Lilith, Ký ức, Quy tắc sử dụng màu nền và viền của chủ đề thế giới hiện tại (Tiên hiệp Ngọc giản / Cyber Toàn tức / Quỷ dị), dòng trạng thái dưới đáy dùng màu thanh chủ đề; chủ đề mặc định giữ nguyên tông màu tím nguyên bản.
- **Bong bóng thoại Lilith**: dòng chữ 「Ký chủ đại nhân, Lilith đã trực tuyến~」 trong thanh trạng thái gốc không còn hiển thị nữa, mục 「Thông báo hệ thống」 trong khối dữ liệu được chuyển sang nói trong bong bóng trên ảnh đứng; bấm vào khoảng trống trên ảnh đứng sẽ hiện lời thoại theo cốt truyện (lấy từ sổ cái: nhiệm vụ, thế giới, Điểm Hệ Thống…). Trên điện thoại khi thu gọn ảnh đứng sẽ chuyển sang dùng thanh gợi ý.
- **Đồng nhất Điểm Hệ Thống (Sửa lỗi)**: phần Tổng quan cơ bản trước đây điền số theo văn bản bảng ở tầng tin nhắn, nên sau khi điểm danh hoặc ghi dữ liệu ngoài tầng tin nhắn sẽ bị lệch với thanh đỉnh; giờ số liệu hiển thị trong engine cũng đọc trực tiếp từ sổ cái giống như thanh đỉnh.
- **Bảng điều khiển Quản trị viên**: đưa vào Cài đặt → Nâng cao · Quản trị viên → Bảng điều khiển Quản trị viên; không còn để lộ lối vào trong thiết bị đầu cuối nữa.
- **Phụ trợ tự tạo**: nhóm điều hướng 「Năng lực」 thêm mục 「Tự tạo」, trang Phụ trợ thêm nút 「＋ Phụ trợ tự tạo」; khi phát động trừ phí sẽ đóng dấu `界面记账时间` để không bị khối dữ liệu ở lượt tiếp theo hoàn tiền nhầm (đã sửa).
- **Độ thuần thục có tác dụng thực tế**: hiệu quả giai đoạn hiện tại của từng công pháp (Thuần Thục −30% tiêu hao, Tinh Thông +100% uy lực, Tông Sư áo nghĩa độc quyền, Nhập Đạo thi triển tức thời không tiêu hao; Chưa Nhập Môn không ổn định) được gửi làm lời nhắc cho AI; công pháp có sử dụng trong cốt truyện nhưng mục 「Tu luyện công pháp」 quên ghi sẽ tự động được cộng tích lũy thực chiến (giới hạn theo trần phẩm giai, mỗi tầng chỉ tính một lần); khi thăng cấp giai đoạn sẽ bảo AI thông báo ở phản hồi tiếp theo.
- **Đọc công pháp từ thẻ nhân vật**: nhập các cấu trúc công pháp phổ biến từ biến thẻ nhân vật / biến trò chuyện hiện tại vào kho công pháp, chỉ tăng không giảm, không sửa đổi bản thân thẻ nhân vật; ghi nhận tại `角色卡功法同步` và `功法记录`.
- **Các sửa lỗi khác**: khi đang mở hộp thoại quản trị viên / rút thẻ / chi tiết thì engine có thể bị tải lại; Điểm Hệ Thống trong engine bị cũ sau khi ghi ngoài tầng tin nhắn; thông báo 「bấm liên tiếp 5 lần vào ◆」 đã lỗi thời.

## 0.7.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.7.0](docs/CHANGES-0.7.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.7.0](docs/ACCEPTANCE-0.7.0.md).

![Thiết Bị Đầu Cuối Chư Thiên trong quán rượu cô lập (Chủ đề Quỷ dị)](docs/evidence/w070-eerie.png)

- **Chủ đề thế giới**: tự động nhận diện Tiên hiệp (ngọc giản, bản đồ sao, trận văn), Cyber (thiết bị đầu cuối toàn tức), Quỷ dị (dị thường và ăn mòn tiết chế) dựa theo `世界类型` / `当前世界` / đơn vị tiền tệ; cũng có thể cố định trong Cài đặt. Chỉ đổi màu sắc và họa tiết trang trí, giữ nguyên vị trí các nút bấm; tự đứng yên khi bật chế độ 「Giảm chuyển động」. Các thế giới đã đi qua được ghi vào trường mới `诸天系统.万界足迹`.
- **Nhân vật giao diện Lilith**: khi chọn nhiệm vụ / vật phẩm / công pháp, hoặc khi kết toán thành công hay thất bại, cô ấy sẽ phản ứng bằng biểu cảm và chuyển động phân lớp nguyên bản kèm lời thoại mang dữ liệu sổ cái; ở trang hệ thống là khung nửa người, ở bàn làm việc là toàn thân, ở trò chuyện riêng là cận cảnh khuôn mặt, ở thẻ gợi ý cốt truyện là ảnh chân dung. Không thêm động tác mới, không giả làm Live2D.
- **Đồ phổ**: thanh điều hướng thêm nhóm 「Đồ phổ」——Dòng sự kiện (Nguyên nhân → Nhiệm vụ → Kết toán), Sơ đồ quan hệ, Bản đồ sao, Cây năng lực. Mỗi nút đều hiển thị trường và đường dẫn sổ cái gốc, có thể nhảy về dòng nhiệm vụ gốc, nhóm chat, phụ trợ hoặc tầng tin nhắn trò chuyện.
- **Hoạt cảnh diễn xuất**: xuyên không, đột phá, ký khế ước, hoàn thành / thất bại nhiệm vụ, rút thưởng, nhập kho phần thưởng. Chỉ phát sau khi sổ cái đã lưu và đọc lại xác nhận, trước khi phát còn kiểm tra lại một lần nữa, những thay đổi bị hoàn tác sẽ được đánh dấu 「Chưa vào sổ」; thời lượng ≤2.1 giây, bấm chuột / nhấn Esc để bỏ qua, sau khi kết thúc luôn để lại thẻ kết quả. Có thể đổi thành chỉ hiện thẻ kết quả hoặc tắt hẳn.
- **Không còn cung cấp thanh trạng thái trong tầng tin nhắn (chế độ tương thích cũ)**: bản lưu cũ khi nâng cấp sẽ tự động chuyển sang chế độ thiết bị đầu cuối một lần; mã nguồn vẫn được giữ lại để chạy kiểm tra hồi quy.

## 0.6.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.6.0](docs/CHANGES-0.6.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.6.0](docs/ACCEPTANCE-0.6.0.md).

![Nhóm Chat Chư Thiên Vạn Giới trong quán rượu cô lập](docs/evidence/g060-chat.png)

- **Nhóm chat**: mục điều hướng 「Vạn giới · Nhóm chat」 trong thiết bị đầu cuối, chia làm 4 trang: Trò chuyện, Thành viên, Chợ phiên, Việc nhóm. Dữ liệu lưu tại `诸天系统.聊天群`, đi theo bản lưu.
- **Chiêu mộ & Thành viên nhóm**: phát lệnh chiêu mộ (ngẫu nhiên hoặc chỉ định thế giới), trả phí vào nhóm theo bậc thực lực; có thể mở rộng dung lượng, trò chuyện riêng, cấm ngôn, trục xuất,ตั้ง làm quản trị viên.
- **Lì xì / Quà tặng / Chợ phiên**: Điểm Hệ Thống và vật phẩm do thành viên nhóm gửi, khi giật được, nhận quà hoặc mua hàng sẽ **ghi vào sổ cái và đọc lại xác nhận trước, rồi mới báo 「Đã nhập kho」**, nguồn gốc vật phẩm được ghi là 「Tên@Thế_giới」. Ký chủ cũng có thể phát lì xì và treo đơn bán hàng.
- **Giới hạn quy tắc nền tảng**: phẩm giai vật phẩm do thành viên nhóm gửi tặng không vượt quá cấp Thương thành và thực lực bản thân của thành viên đó, nghiêm cấm hàng Cấm kỵ, nếu vượt mức sẽ tự động hạ cấp; lì xì Điểm Hệ Thống và số lượng lì xì mỗi ngày đều có trần giới hạn. Bản thân nội quy nhóm có thể chỉnh sửa.
- **Liên kết với cốt truyện**: cầu viện sẽ tạo ra nhiệm vụ nguyên bản (trạng thái Chờ nhận); giáng lâm giúp thành viên nhóm xuất hiện trong 3 lượt cốt truyện tiếp theo; bản tóm tắt trò chuyện nhóm có thể tiêm vào cốt truyện; có thể bật tự động tán gẫu sau mỗi lượt cốt truyện.

## 0.5.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.5.0](docs/CHANGES-0.5.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.5.0](docs/ACCEPTANCE-0.5.0.md).

- **Một cửa sổ duy nhất**: cửa sổ Lilith chính là Thiết Bị Đầu Cuối Chư Thiên, cửa sổ thiết bị đầu cuối thứ hai trước đây đã được xóa bỏ. Nút đóng, phím Esc, bấm ra ngoài hay cử chỉ quay lại trên điện thoại đều đóng toàn bộ cửa sổ trong một lần; khi mở lại sẽ quay về đúng trang lần trước.
- **Trong tầng tin nhắn không còn thanh trạng thái lớn**: khối dữ liệu được engine nguyên bản bên trong thiết bị đầu cuối ghi sổ, ở tầng tin nhắn chỉ để lại nhãn nhỏ có thể tắt. (Từ bản 0.7.0 trở đi trong phần Cài đặt không còn cung cấp chế độ tương thích cũ nữa, xem ở trên.)
- **8 trang phân loại nguyên bản nằm ngay trong thiết bị đầu cuối**: bản thân engine nguyên bản vẫn chạy và được chuyển trang thông qua thanh điều hướng của thiết bị đầu cuối; các thao tác ghi vào ô nhập liệu sẽ hiện thông báo kèm nút 「Đóng thiết bị đầu cuối để gửi」.
- **Quản lý phụ trợ + Phụ trợ tự tạo**: 6 phụ trợ nguyên bản có thể bật/tắt theo từng cuộc trò chuyện (khi tắt đồng thời báo cho AI không được sử dụng); phụ trợ tự tạo hỗ trợ xuất/nhập tệp, ghi vào lời nhắc, khi phát động sẽ trừ cái giá phải trả và đọc lại xác nhận trước.
- **Mọi cài đặt đều nằm ở trang 「Cài đặt」 trong thiết bị đầu cuối**, ngăn kéo cài đặt tiện ích mở rộng chỉ giữ lại nút mở và khôi phục khẩn cấp.
- **Ảnh đứng**: xóa bỏ các tư thế AI đổi trang phục; trên máy tính ảnh đứng giữ nguyên tỷ lệ gốc, trên điện thoại khi ở các trang hệ thống sẽ nhường chiều cao cho phần nội dung.

## 0.4.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.4.0](docs/CHANGES-0.4.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.4.0](docs/ACCEPTANCE-0.4.0.md).

- **Thay thế toàn bộ nội dung cài đặt của bản v1.1**: Sách Thế Giới (tự động cài đặt và liên kết, kèm kiểm tra ngân sách ngữ cảnh), 4 biểu thức chính quy (regex), kịch bản Tavern Helper và macro biến.
- **Toàn bộ tính năng AI của thanh trạng thái**: AI nhập hàng, ước nguyện, rút thẻ, sắp xếp túi đồ, triệu hồi tay đấm, Vạn Vật Dung Lô, đánh giá thực lực, kiểm tra kết nối. Cả hai cách kết nối đều dùng được:
  - API độc lập;
  - API chính của quán rượu.
- **Trung tâm API**: cấu hình được ghi đồng thời vào cả ba nơi lưu trữ nguyên bản, giao diện nguyên bản đọc cùng một bản cấu hình.
- **Làm đẹp khung thoại Lilith (có thể bật/tắt)**, **thẻ rút gọn cho tầng cũ**, **không gửi bảng dữ liệu tầng cũ cho AI** (chỉ ảnh hưởng lời nhắc, không sửa bản lưu).
- **Chạm tương tác chân thực**: vuốt ve (tăng dần cấp độ phản ứng), nhấn giữ, chạm nhẹ, phản hồi xúc giác (rung); hỗ trợ thiết bị di động.
- **Tiếp quản và khôi phục bản cũ một chạm**, bảng chẩn đoán cung cấp bảng đối chiếu thay thế v1.1.
- **Tư thế AI mới**: khoanh tay, ngồi nghiêng.

## 0.3.0 Thêm mới

Thay đổi đầy đủ xem [CHANGES-0.3.0](docs/CHANGES-0.3.0.md), kết quả nghiệm thu xem [ACCEPTANCE-0.3.0](docs/ACCEPTANCE-0.3.0.md).

- **Tương thích 1.16–1.19**: từ 1.17 trở đi dùng hook tiện ích mở rộng, bản 1.16 tự động khởi chạy; thăm dò giao diện theo năng lực thực tế, thiếu giao diện nào thì chỉ tắt tính năng tương ứng.
- **Thanh trạng thái nguyên bản chạy nguyên gốc (native)**: cả 8 trang (Cơ bản, Quan hệ, Nhiệm vụ, Vạn Tượng, Thương thành, Túi đồ, Phụ trợ, Thần thông) đều chạy trong tin nhắn và ghi dữ liệu về đúng vị trí gốc.
- **Trợ lý Lilith nguyên bản chạy nguyên gốc (native)**: Bàn làm việc, Hồ sơ ký ức, Tàng thư quy tắc, Cài đặt kết nối, Trạng thái hoạt động, Trò chuyện riêng, Khung thoại cốt truyện.
- **Sách Thế Giới phụ trợ** cài đặt và liên kết một chạm vào cuộc trò chuyện hiện tại (35 quy tắc tích hợp sẵn, nếu đã tồn tại sẽ không ghi đè, không phụ thuộc MVU của thẻ nhân vật); khởi tạo cuộc trò chuyện mới `/zt init`; báo cáo di chuyển bản lưu cũ; sao lưu và hoàn tác sổ cái.
- **Live2D thật**: tải bất kỳ mô hình Cubism 3/4/5 nào, hỗ trợ ánh xạ biểu cảm, động tác Tap, bong bóng thoại khi chạm HitArea, đồng bộ khẩu hình và ánh mắt dõi theo con trỏ. Không đóng gói sẵn Cubism Core, chỉ tải sau khi người dùng đồng ý giấy phép, xem [vendor/live2d/LICENSES.md](vendor/live2d/LICENSES.md).
- **Xuất tệp PSD phân lớp của Lilith**: có thể gắn xương trực tiếp trong Cubism Editor để tạo mô hình Live2D của chính Lilith.
- **Ảnh đứng biến thể AI**: 8 biểu cảm (chỉ thay vùng khuôn mặt, giữ nguyên từng điểm ảnh cơ thể và nền), kèm tư thế “bắn tim” (nền tĩnh). Nguồn gốc xem tại [PROVENANCE](assets/lilith/variants/PROVENANCE.md).
- **HUD, phím tắt Alt+Z/X/S, lệnh `/zt`, macro `{{zt_points}}`, `{{zt_world}}`, `{{zt_task}}`, bảng chẩn đoán tương thích, ngăn kéo cài đặt tiện ích mở rộng.**

## 0.2.0 Thêm mới

### Giao dịch Vạn Giới

- Trích xuất **52 hàm gốc** từ `statusbar-v3.1-part2.js` nguyên bản, giữ nguyên các quy tắc bảng dữ liệu, nhiệm vụ, dẫn xuất công pháp/tài nguyên và định giá gốc.
- `ZhuTianPanel` trong phản hồi nhân vật mới nhất: **Xem trước → Xác nhận rõ ràng → Kết toán**, không tự động quét lịch sử cũ để phát thưởng.
- Phần thưởng hiện vật của nhiệm vụ tuân theo cơ chế **kiểm tra lời hứa trước, bằng chứng trong chính văn, phẩm cấp/số lượng và chứng từ ổn định** của trợ lý gốc. Sau khi phần thưởng đã tiêu dùng sẽ không phát bù lại lần nữa.
- Mua hàng tồn kho trong Thương thành: giữ nguyên chiết khấu Danh vọng, làm tròn lên, nhập túi từng món và đánh dấu đã bán.
- Sử dụng và thu hồi từng món trong túi đồ: vật phẩm tiêu hao trừ 1 món, vật phẩm không tiêu hao giữ nguyên; thu hồi áp dụng quy tắc định giá gốc.
- **Bản ghi kết toán hệ thống được lưu trực tiếp trong chính văn trò chuyện bình thường**, phân biệt rõ ràng với hành động của người chơi và phản hồi của mô hình.

### Ghi dữ liệu và xử lý khi thất bại

Bản xem trước ràng buộc toàn bộ ảnh chụp nhanh của cuộc trò chuyện và siêu dữ liệu; các thẻ cùng nguồn (same-origin tabs) sử dụng Web Locks; trước khi cam kết sẽ đối chiếu bản lưu trên máy chủ, khi lưu sẽ bắt cố định mục tiêu nhân vật/cuộc trò chuyện chứ không suy đoán lại mục tiêu sau lệnh `await`.

Một lần lưu bao gồm đồng thời sổ cái, chứng từ thao tác và tin nhắn hệ thống, sau đó đọc lại bản ghi trên máy chủ để đối chiếu. Khi trạng thái mạng không rõ ràng sẽ đóng băng giao dịch, không tự động thử lại, không âm thầm hoàn tiền; vui lòng dừng thao tác trên cuộc trò chuyện đó, tải lại trang và kiểm tra thủ công.

**Đây không phải là giao dịch CAS phía máy chủ xuyên suốt mọi trình khách.** Web Locks cùng nguồn không khóa được trình duyệt khác, thiết bị khác hoặc các tiện ích mở rộng không phối hợp. Vui lòng không thao tác đồng thời trên cùng một cuộc trò chuyện.

Sau khi chính văn bị chỉnh sửa, xóa hoặc chuyển nhánh mà không khớp với nguồn kết toán đã có, hệ thống sẽ đóng băng giao dịch chứ không tự ý hoàn tác số dư đã chi tiêu. Cần kiểm tra thủ công trên bản sao lưu.

## Các năng lực bản 0.1 được giữ lại

- Ảnh đứng Lilith nguyên bản, biểu cảm, hoạt ảnh tham số phân lớp, ánh nhìn và chạm tương tác (chế độ `rig` mặc định). Live2D thật là một chế độ khác, cần người dùng tự cung cấp mô hình `.model3.json`.
- Lối vào thường trực nguyên bản (ảnh đại diện Lilith). Thiết bị đầu cuối toàn màn hình độc lập và 7 khung nhìn của bản 0.1–0.4 đã được gộp vào Thiết Bị Đầu Cuối Chư Thiên từ bản 0.5.0.
- Bảo vệ gửi tin (chặn tệp đính kèm, bản xem trước hết hạn, khóa khi đang tạo, chống gửi trùng lặp, không gửi lại khi đọc lại thất bại) vẫn nằm ở tầng tương thích máy chủ và được nghiệm thu bởi `native_guards.py`.
- Đọc nhiệm vụ gốc, túi đồ, tên nhân vật, 35 quy tắc tích hợp sẵn cùng nhánh ký ức hợp lệ nguyên bản.
- Sau khi bật rõ ràng sẽ sử dụng thuật toán hồi tưởng nguyên bản; không tự động bật chỉnh lý trả phí.
- Khi WebGL không khả dụng sẽ tự quay về ảnh gốc, đóng thiết bị đầu cuối hoặc bật tùy chọn giảm chuyển động sẽ tạm dừng hoạt ảnh.
