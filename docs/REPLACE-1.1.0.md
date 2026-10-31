# 1.1.0-patch3 · Danh sách thay thế đầy đủ và hướng dẫn thao tác

## Bàn giao hiện tại

Gói này thay thế cho 「Bản rà soát 1.1.0」 trước đó. Người dùng đã ủy quyền chỉ bàn giao tệp; không cài đặt, không ghi đè môi trường sản xuất, không commit hay đẩy lên Git.
Phiên bản tiện ích **1.1.0** / Bản sửa đổi chẩn đoán **1.1.0-patch3** / Cấu trúc sổ cái **2**.

- Bản cơ sở là nhánh `main` **ce29f61a9c254517fdf1fae2385b83b55cfa3688** của kho lưu trữ chỉ định; không phải dùng bản cũ làm lại.
- `zhutian-1.1.0-patch3-changed-files.zip` chứa **toàn bộ nội dung của tất cả 61 tệp sửa đổi / thêm mới** so với bản cơ sở, kế thừa mọi thay đổi của bản 1.1.0 trước đó và bổ sung các bản vá của vòng này, không phải chỉ có vài đoạn diff.
- Thư mục gốc của tệp ZIP tương ứng với thư mục gốc của tiện ích, giữ nguyên đường dẫn gốc và tên tệp gốc. Không xóa tệp nào. `vendor/original` và các tài nguyên không sửa đổi tiếp tục dùng phiên bản cơ sở, không đóng gói lặp lại.
- **Đây là gói ghi đè, không phải tiện ích đầy đủ có thể cài đặt vào một thư mục trống**. Nếu đã có bản 1.1.0 trước đó, hãy dùng gói này ghi đè đầy đủ toàn bộ các đường dẫn được liệt kê; đừng trộn lẫn các tệp JS cũ và mới. Nếu bạn từng tự sửa mã nguồn, hãy đối chiếu và gộp thủ công trước.
- Danh sách mã băm toàn bộ tệp (`FILELIST.sha256`) bao phủ toàn bộ cây thư mục tiện ích sau khi đã đè bản vá lên bản cơ sở, chứ không chỉ riêng các tệp trong gói ZIP; nếu chỉ giải nén gói ghi đè này vào một thư mục trống rồi chạy kiểm tra danh sách tệp thì sẽ báo thiếu các tệp không sửa đổi.
- Các chữ như “tạm thời chưa truyền tệp” trong sổ theo dõi cũ là trạng thái lịch sử, hiện tại lấy tài liệu này và `docs/PATCH-1.1.0-3.md` làm chuẩn.

## Bản vá vòng này

Cố định cuộc trò chuyện đích cho 4 loại phản hồi bất đồng bộ của nhóm chat và tự động tán gẫu; giám định giữ nguyên lô nguồn gốc và giá thu hồi gốc (phản ví dụ 1,000,001 điểm); hủy cam kết cũ khi sổ cái bị sửa trong lúc chờ kiểm nghiệm (giữ nguyên 200, xác nhận trừ 10 lại sẽ được 190); báo cáo chẩn đoán tách riêng Ngữ cảnh bảo mật / Giao thức kết nối / Web Locks, nhắc cách dùng máy cục bộ / HTTPS trước khi lưu, và ghi nhận lỗi lưu thất bại vào chẩn đoán.

## Những việc cần làm trong quán rượu

1. **Sao lưu** thư mục tiện ích hiện tại, cuộc trò chuyện / cài đặt và Sách Thế Giới; có thể dùng 「Cài đặt → Xuất / Nhập bản lưu」 trong thiết bị đầu cuối để xuất bản lưu không chứa Key, nhưng vui lòng tự bảo quản kỹ API Key của mình. Đừng chạy đồng thời bản Tavern Helper cũ và bản nguyên gốc này.
2. Dừng tạo văn bản và giao dịch, đóng các thẻ trình duyệt quán rượu khác; sao chép các tệp trong gói ghi đè vào thư mục gốc của tiện ích hiện có theo đúng đường dẫn tương đối. Đường dẫn thường gặp là `public/scripts/extensions/third-party/zhutianxitongchajianban/`, hoặc thư mục tiện ích mở rộng cùng tên theo tài khoản người dùng thực tế của bạn. Không sao chép vào thư mục thẻ nhân vật hay thư mục Sách Thế Giới.
3. Làm mới cưỡng bức (hard refresh) trang quán rượu và xác nhận tiện ích hiển thị **1.1.0**. Khi mở cuộc trò chuyện Chư Thiên đã có, cấu trúc sổ cái sẽ tự sao lưu trước rồi nâng cấp lên 2; đừng dùng lẫn bộ ghi dữ liệu của bản cũ trên dữ liệu bản mới.
4. **Nâng cấp riêng Sách Thế Giới**: Cài đặt → Cài đặt / Liên kết Sách Thế Giới → Cập nhật lên bản mới nhất. Hãy đọc kỹ thông báo ảnh hưởng trước; đối với các mục cùng tên do bạn tự sửa, hệ thống sẽ hỏi chọn ghi đè hay giữ lại từng mục một. Nếu hủy ghi đè để giữ lại, quy tắc cũ của mục đó sẽ không tự động đổi sang bản mới, vui lòng đối chiếu từ bản sao lưu để gộp thủ công, đặc biệt là mục `09` Thương thành.
5. Kiểm tra cấu hình mặc định / theo tính năng trong Trung tâm API: giới hạn đầu ra điền rõ được ưu tiên hơn mặc định của tính năng; nếu trước đây bạn từng đặt giới hạn thấp như 300/1000 thì hãy đổi sang giá trị phù hợp với mô hình (có thể thử 4096 trước, hàng hóa / thu thập cốt truyện khuyên dùng 8192), hoặc để trống cho từng tính năng tự quyết định. Đừng để lộ Key trong nội dung phản hồi hay ảnh chụp màn hình.
6. Vào 「Tùy chỉnh hàng hóa」 lưu riêng tùy chọn cho cửa hàng và hộp mù; hàng tồn kho đang có sẵn sẽ không tự động viết lại, phải sau khi nhập hàng mới thì mới tạo theo quy tắc mới. Các món hàng Cấm kỵ cũ nếu thiếu chứng từ cái giá nhận được thì cần nhập hàng lại.
7. Trong 「Thu thập cốt truyện」, hãy chọn một phạm vi nhỏ chính văn, đối chiếu quyền sở hữu, số lượng, bằng chứng và phẩm giai thế giới gốc rồi mới tích chọn; những mục chưa rõ hãy tạm lưu chờ giám định trước. Đừng sửa bừa phẩm giai hàng loạt chỉ để đẩy giá thu hồi lên cao.
8. Kiểm tra các nhân vật đã di chuyển ở trang Quan hệ; bấm xem chi tiết sẽ không làm chuyển đổi mục tiêu công lược hiện tại, khi cần hãy bấm nút chuyển đổi tường minh. Trên điện thoại có thể bấm nút 「Cửa sổ nổi」 trên thanh tiêu đề rồi kéo thanh tiêu đề / góc dưới bên phải; nút mở hình tròn kéo ra sát mép trái/phải sẽ ẩn đi, chạm nhẹ vào mép để hiện lại.
9. Hãy thử nghiệm mô hình thật và kiểm tra trên điện thoại vật lý ở **cuộc trò chuyện đã sao lưu** trước. Khi xuất hiện thông báo “trạng thái ghi chưa xác nhận / đóng băng”, hãy tải lại trang để đối chiếu hàng tồn kho và Điểm Hệ Thống, đừng bấm mua lặp lại và đừng tự đoán mò để hoàn tiền.

### Quay lại bản cũ

Khôi phục đồng bộ cả ba thứ: thư mục tiện ích trước khi nâng cấp, bản sao lưu cuộc trò chuyện và bản sao lưu Sách Thế Giới. Nếu chỉ đổi riêng mã nguồn về bản cũ thì sổ cái có thể bị chuyển sang chế độ chỉ đọc do đã ở phiên bản cấu trúc 2; đừng tự tay hạ `schema` xuống 1 để lách cơ chế bảo vệ. Trước khi gói ghi đè này được phát hành lên nhánh chính thức, hãy lưu ý việc cập nhật tự động từ kho gốc có thể ghi đè lên các sửa đổi cục bộ.

10. Sau khi nâng cấp vòng này, hãy bấm Sao chép thông tin chẩn đoán và xác nhận có dòng **Bản sửa đổi: 1.1.0-patch3**. Khi gặp ngữ cảnh không bảo mật, trên máy tính cục bộ hãy dùng `localhost`/`127.0.0.1`; khi dùng điện thoại truy cập máy tính hãy dùng HTTPS đáng tin cậy, đừng gõ `localhost` trên điện thoại làm địa chỉ máy tính. Khi đã ở ngữ cảnh bảo mật mà vẫn không có Web Locks thì hãy đổi sang trình duyệt có hỗ trợ API này chứ đừng tắt bảo vệ an ninh.
11. Khi hiện thông báo xung đột kiểm nghiệm, hãy làm mới dữ liệu và đối chiếu số dư trước rồi mới xác nhận lại; hệ thống không tự động trừ điểm lại và bạn cũng đừng bấm mua liên tiếp. Nếu ở bản cũ đã xảy ra lỗi ghi nhầm cuộc trò chuyện hoặc đẩy giá thu hồi lên cao, vui lòng khôi phục bản sao lưu trước khi thao tác và đối chiếu thủ công, gói này sẽ không đoán mò để tự động sửa lại sổ cái lịch sử.

## Tóm tắt kiểm chứng và ranh giới

**330/330 bài kiểm tra đơn vị, 10 bộ trình duyệt cô lập 301/301**; vượt qua kiểm tra cú pháp / nguồn gốc nguyên bản / biên dịch Python / khoảng trắng; đã đối chiếu toàn bộ `FILELIST`, CRC của tệp ZIP / tính nhất quán với cây thư mục làm việc và kiểm tra chồng lớp trên bản cơ sở. Chạy trên SillyTavern 1.19.0 cô lập thực tế với mô hình giả lập; không phải nghiệm thu trên bản cài đặt thực tế của người dùng, mô hình thật hay điện thoại vật lý. Chi tiết xem tại `docs/PATCH-1.1.0-3.md`. Đừng coi việc vượt qua các bài kiểm tra tự động là lời cam kết không còn bất kỳ lỗi nào.

## Toàn bộ đường dẫn thay thế / thêm mới

| Đường dẫn tương đối so với thư mục gốc tiện ích | Loại | Thay đổi |
|---|---|---|
| `CHANGELOG.md` | Thay thế | Nối thêm bản ghi 1.1.0 |
| `FILELIST.sha256` | Thay thế | Danh sách kiểm tra mã băm toàn bộ tệp tiện ích (không chỉ liệt kê các tệp thay đổi) |
| `README.md` | Thay thế | Lối vào và tổng quan bản mới, giữ nguyên thuyết minh các bản cũ |
| `docs/ACCEPTANCE-1.1.0.md` | Thêm mới | Kết quả, cách tái lập và giới hạn |
| `docs/CHANGES-1.1.0.md` | Thêm mới | Thuyết minh cập nhật đầy đủ |
| `docs/FEATURE_MATRIX.md` | Thay thế | Phạm vi kiểm chứng năng lực vòng này |
| `docs/PATCH-1.1.0-3.md` | Thêm mới | Tái hiện, vá lỗi, bằng chứng 330/301, quá trình xử lý lỗi và ranh giới chưa kiểm chứng của vòng này |
| `docs/REPLACE-1.1.0.md` | Thêm mới | Danh sách thay thế này và hướng dẫn thao tác trong quán rượu |
| `docs/REVIEW-1.1.0.md` | Thêm mới | Giữ lại lịch sử rà soát vòng hai, phần đầu ghi rõ đã được thay thế bởi bản vá vòng ba |
| `index.js` | Thay thế | Đăng ký các mô-đun mới và đưa vào quy trình gỡ cài đặt theo thứ tự ngược lại |
| `manifest.json` | Thay thế | Phiên bản tiện ích 1.1.0 |
| `package-lock.json` | Thay thế | Đồng bộ phiên bản tệp khóa |
| `package.json` | Thay thế | Phiên bản và kiểm tra cú pháp JS nguyên bản toàn diện |
| `src/action-support.js` | Thêm mới | Bắt cố định danh tính trước khi tạo, kiểm tra trước khi cam kết, ghi có kiểm nghiệm và nhật ký cục bộ |
| `src/api-center.js` | Thay thế | Cảnh báo trước khi lưu ở trang Kết nối, văn bản lưu trễ chuẩn xác; kế thừa bản sửa lỗi ngân sách |
| `src/api-stream.js` | Thay thế | Giữ lại cờ chẩn đoán, không làm lộ chính văn suy nghĩ |
| `src/appraise.js` | Thay thế | Khóa lô nhận diện nguồn gốc cụ thể; nâng phẩm giai không gộp chung, không đẩy giá thu hồi, không làm mất nguồn gốc |
| `src/assistant-host.js` | Thay thế | Tương thích kiểm tra ký ức, ngân sách kiểm tra kết nối cũ |
| `src/bonds-data.js` | Thêm mới | ID ổn định cho nhiều người, di chuyển / cô lập tương thích mục tiêu cũ |
| `src/bonds.js` | Thêm mới | Tìm kiếm danh sách, chi tiết, chuyển đổi tường minh |
| `src/commerce-plan.js` | Thêm mới | Xác suất / ô hàng / tùy chỉnh / khử trùng lặp cục bộ và kiểm tra sản phẩm |
| `src/commerce-rules.js` | Thêm mới | Văn bản Sách Thế Giới cho quy tắc hàng hóa, thu thập và quan hệ nhiều người |
| `src/commerce.js` | Thêm mới | Tiếp quản giao diện hộp mù Thương thành và kết toán một lần |
| `src/contracts.js` | Thay thế | Giữ 1.1.0 / schema 2, thêm nhãn bản sửa đổi chẩn đoán `1.1.0-patch3` |
| `src/data-io.js` | Thay thế | Di chuyển cấu trúc quan hệ nhiều người |
| `src/diag-report.js` | Thay thế | Tách dòng ngữ cảnh bảo mật & giao thức / khóa, nhãn bản sửa đổi, ghi nhận lỗi lưu cài đặt trễ của máy chủ |
| `src/errors.js` | Thay thế | Gợi ý bước tiếp theo chuẩn xác khi môi trường từ chối hoặc xung đột đồng thời |
| `src/features.js` | Thay thế | Ảnh hưởng khi nâng cấp Sách Thế Giới, bản sao lưu duy nhất, kiểm nghiệm máy chủ và giữ lại mục xung đột |
| `src/hub-atlas.js` | Thay thế | Sơ đồ quan hệ đọc kho nhiều người và chuyển trang |
| `src/hub-group.js` | Thay thế | Cầu viện / trò chuyện riêng / trò chuyện nhóm / phát trực tiếp / tự động tán gẫu cố định cuộc trò chuyện trước khi gửi yêu cầu, kiểm tra trước khi cam kết và bên trong khóa |
| `src/hub-settings.js` | Thay thế | Hiển thị cảnh báo môi trường trước khi lưu, khôi phục biểu mẫu khi thất bại, không coi gửi lệnh là đã ghi đĩa |
| `src/hub.js` | Thay thế | Khi không thể ghi nhớ trang vẫn cho phép điều hướng vào phần chẩn đoán |
| `src/ledger-ops.js` | Thay thế | Truyền danh tính cuộc trò chuyện dự kiến; nhập túi chung cô lập lô giám định / thu thập, giữ nguyên trường nguồn gốc |
| `src/ledger-plan.js` | Thay thế | Đường dẫn mua hàng dự phòng cũng giữ nguyên lô nguồn gốc; kế thừa bản sửa lỗi điều kiện nhận hàng Cấm kỵ của 1.1 |
| `src/ledger-service.js` | Thay thế | Kết toán dự phòng schema 2 cùng kiểm tra phiên bản tương lai / đóng băng |
| `src/model-response.js` | Thêm mới | Chẩn đoán chính văn rỗng / cắt cụt, bí danh ký ức không nhập nhằng |
| `src/native-owned.js` | Thêm mới | Bảo vệ các trường dữ liệu nguyên bản không bị engine cũ / chỉ thị biến mô hình ghi đè |
| `src/operation-records.js` | Thêm mới | Lọc bản ghi, xem trước, tinh giản vỏ bọc từ khóa |
| `src/prompt-filter.js` | Thay thế | Chỉ tinh giản vỏ bọc thao tác cũ đã biết trên bản sao gửi đi |
| `src/save-environment.js` | Thêm mới | Thêm kiểm tra trước ngữ cảnh bảo mật / giao thức / Web Locks, cách giải quyết theo từng tình huống và ghi nhật ký lỗi lưu |
| `src/settings.js` | Thay thế | Kiểm tra môi trường trước khi lưu, khôi phục cài đặt cũ khi thất bại đồng bộ, ghi nhận khi thất bại bất đồng bộ |
| `src/statusbar-host.js` | Thay thế | Kết nối bộ tăng cường iframe nội tuyến và định danh tầng tin nhắn |
| `src/story-collect.js` | Thêm mới | Ứng viên bằng chứng chính văn, ánh xạ phẩm giai / chờ giám định và nhập kho thống nhất |
| `src/th-bridge.js` | Thay thế | Ảnh chụp nhanh sổ cái bất biến, kiểm tra thay đổi trên trang sau khi kiểm nghiệm / sau khi chạy hàm cập nhật; kiểm tra trước khi lưu thống nhất và ghi nhận lỗi |
| `src/window-controls.js` | Thêm mới | Kéo thu phóng cảm ứng / chuyển đổi toàn màn hình / đặt lại, nút mở tròn bám mép và dọn dẹp |
| `src/worldbook.js` | Thay thế | Chồng lớp quy tắc 1.1, giữ nguyên cài đặt tùy chỉnh của mục từ điển |
| `tests/native_v084.py` | Thay thế | Đổi kiểm tra văn bản lưu kết nối sang đã giao cho máy chủ, không xóa kiểm tra dữ liệu lưu gốc |
| `tests/native_v090.py` | Thay thế | Hồi quy bố cục điện thoại khởi tạo tường minh trạng thái ảnh đứng |
| `tests/native_v091.py` | Thay thế | Hồi quy chẩn đoán / bàn phím khởi tạo tường minh trạng thái ảnh đứng |
| `tests/native_v100.py` | Thay thế | Hồi quy cũ tương thích schema 2 và tiền đề bố cục độc lập |
| `tests/native_v100_feedback.py` | Thay thế | Định vị theo khóa lô nguồn gốc giám định / mục hiển thị, giữ nguyên 44 mục nghiệm thu gốc |
| `tests/native_v110.py` | Thêm mới | 37 mục kiểm tra chuyên biệt trình duyệt cô lập / tiêm lỗi, có thể chạy lại |
| `tests/native_v110_patch3.py` | Thêm mới | 19 mục kiểm tra chuyên biệt máy chủ cô lập / trình duyệt thực tế, gồm số tiền ghi đĩa và ngữ cảnh không bảo mật |
| `tests/native_v110_review.py` | Thêm mới | 12 mục nghiệm thu trình duyệt hướng phủ định cho chuyển cuộc trò chuyện thật / vòng đời |
| `tests/v084.test.js` | Thay thế | Kiểm tra phiên bản Sách Thế Giới hiện tại |
| `tests/v100-feedback.test.js` | Thay thế | Đính chính kỳ vọng gộp nhầm trong bài kiểm tra cũ, xác minh tách hai lô và đóng băng giá |
| `tests/v100.test.js` | Thay thế | Kiểm tra nâng cấp schema hiện tại |
| `tests/v110-patch3.test.js` | Thêm mới | 25 bài kiểm tra đơn vị vòng này, gồm 3 phản ví dụ P1 / luồng bình thường / môi trường và nhật ký lưu máy chủ |
| `tests/v110-review.test.js` | Thêm mới | 20 bài kiểm tra đơn vị hồi quy hướng phủ định thêm mới |
| `tests/v110.test.js` | Thêm mới | 35 bài kiểm tra đơn vị thêm mới |
| `tests/version.test.js` | Thay thế | Tính nhất quán giữa phiên bản 1.1.0 và tài liệu |
