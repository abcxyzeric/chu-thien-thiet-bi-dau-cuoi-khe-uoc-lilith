# Đường tới bản chính thức 1.0: Còn thiếu những gì

> **Bản 1.0.0 đã phát hành (2026-10-02)**: lộ trình này được viết ở bản 0.9.0; thực tế đã làm những gì và bỏ qua những gì xem tại Mục VI của [PLAN-1.0](PLAN-1.0.md) và [CHANGES-1.0.0](CHANGES-1.0.0.md). Mô hình thật, máy thật và giai đoạn chơi thử chưa thực hiện, đã được ghi chú trung thực trong README.

Viết ở bản 0.9.0. Căn cứ: hiện trạng kho lưu trữ (bảng năng lực `src/contracts.js`, [FEATURE_MATRIX](FEATURE_MATRIX.md), mục 「Chưa hoàn thành」 trong README), báo cáo nghiệm thu các bản 0.8.x, kiểm tra giao diện điện thoại 0.9.0.

**Tiêu chuẩn của bản 1.0**: người dùng thông thường cài đặt theo README, **sử dụng mô hình thật của chính mình** chơi trọn vẹn một ván (Xuyên không → Nhiệm vụ → Thương thành / Rút thưởng → Đột phá → Nhóm chat → Trò chuyện riêng → Chuyển cuộc trò chuyện → Tắt tiện ích), suốt quá trình không mất sổ cái, không treo cứng, không cần đọc tài liệu để gỡ lỗi; dùng tốt trên cả máy tính và điện thoại.

Khoảng cách hiện tại chủ yếu nằm ở **nghiệm thu môi trường thực tế**, chứ không phải ở số lượng tính năng. Toàn bộ các luồng AI mới chỉ chạy qua mô hình giả lập cục bộ; điện thoại mới chỉ thử trên trình giả lập; bản 1.17 / 1.18 từ sau 0.8.2 chưa kiểm tra lại.

---

## P0: Chưa hoàn thành thì chưa thể gọi là bản 1.0

### 1. Nghiệm thu mô hình thật (Khoảng trống lớn nhất)

Trong bảng năng lực vẫn còn 6 mục ở trạng thái `pending`, tất cả đều vướng ở chỗ “chưa có mô hình thật”:

| Năng lực | Hiện trạng |
| --- | --- |
| Tự động chỉnh lý ký ức nguyên bản, đọc bù và API độc lập | Logic đang chạy, chưa nghiệm thu bằng yêu cầu thật |
| Công cụ đầy đủ của Bàn làm việc và nối tiếp gợi ý | Như trên |
| AI nhập hàng Thương thành, ước nguyện, rút thưởng, thanh toán phụ trợ & thần thông | Nút bấm đã chạy, chưa nghiệm thu việc ghi trả kết quả từ mô hình thật |
| Tạo phản hồi trò chuyện riêng thực tế | Chỉ mới xác minh gửi và lưu |
| AI tự động ghi `当前世界` / `世界类型` | Đã tiêm lời nhắc, chưa rõ mô hình thật có làm theo hay không |
| Di chuyển bản lưu cũ, sao lưu & hoàn tác sổ cái | Đã có giao diện, chưa nghiệm thu bấm trên trình duyệt |

Ngoài ra, giọng điệu thành viên nhóm chat, nhịp độ lì xì, lời nhắc độ thuần thục và nhận diện công pháp thẻ nhân vật cũng chỉ mới xác minh bằng mô hình giả lập.

**Cách làm:**

- Viết một 《Kịch bản nghiệm thu mô hình thật》: cố định thẻ nhân vật thử nghiệm + cố định 20 lượt thao tác + tiêu chuẩn vượt qua của từng bước (thay đổi trường sổ cái, tiêm Sách Thế Giới, không còn sót `<ZhuTianPanel>` thô).
- Chạy ít nhất 3 nhóm mô hình:
  - Một mô hình lớn nội địa (DeepSeek hoặc GLM);
  - Một mô hình suy luận (xuất quá trình suy nghĩ trước);
  - Một mô hình truy cập qua trạm trung chuyển / reverse proxy, bao phủ các vấn đề lỗi 502 hay sót sự kiện kết thúc đã sửa ở bản 0.8.4 / 0.8.5.
- Ghi lại tỷ lệ tuân thủ định dạng của từng nhóm mô hình (khối cập nhật biến có đầy đủ không, có viết bừa trường dữ liệu không). Nếu thấp hơn ngưỡng cho phép thì hiển thị thông báo dễ đọc ngay trong tiện ích chứ không âm thầm thất bại.
- Do người dùng nắm giữ Key thực thi trên máy cục bộ và chỉ gửi nhật ký đã che thông tin nhạy cảm; trong kho lưu trữ tuyệt đối không xuất hiện Key hay bản lưu trò chuyện.

### 2. Kiểm thử trên máy thật (Bước tiếp nối trực tiếp của 0.9.0)

Bản 0.9.0 chỉ mới nghiệm thu trong mô phỏng cảm ứng của Chromium. Trình giả lập không kiểm tra được những điểm sau:

- **iOS Safari**:
  - Hành vi thực tế của `visualViewport` khi bàn phím bật lên (bộ gõ bên thứ ba, bộ gõ có thanh chọn chữ ứng viên);
  - `100dvh`, vùng an toàn của tai thỏ và thanh cử chỉ dưới đáy;
  - Nhấn giữ có làm bật trình đơn hệ thống hay không;
  - Cuộn đàn hồi (rubber-band scrolling) có kéo lệch cả trang hay không.
- **Android Chrome / WebView hệ thống**: phím quay lại (đã có cài đặt `hubBackClose`), chia đôi màn hình, màn hình gập.
- **Cách đóng gói quán rượu vào vỏ ứng dụng (App wrapper)** (như truy cập cục bộ qua Termux, các trình duyệt đóng gói).

**Cách làm:** Lập danh sách máy thật (ít nhất gồm iPhone + Safari, một máy Android tầm trung + Chrome, một máy màn hình nhỏ rộng 360px), mỗi thiết bị đi qua một lượt các mục trong `tests/native_v090.py`, ghi chép kết quả thủ công và đưa vào `ACCEPTANCE`.

> **Tiến độ ở 0.9.1**: các mục trên đã được đưa vào công cụ 「Tự kiểm tra trên điện thoại thật」 ngay trong quán rượu (Cài đặt → Tương thích & Bảo trì) để sao chép kết quả một chạm. **Việc cần làm**: lấy kết quả trên máy Android thật và ghi vào `ACCEPTANCE`; iPhone, màn hình nhỏ rộng 360px và trình duyệt đóng gói vẫn chưa thử.

### 3. Bổ sung đầy đủ ma trận phiên bản máy chủ

- Bản 1.17 / 1.18 từ sau 0.8.2 chưa kiểm tra lại, hook tắt tiện ích chỉ mới thử thực tế trên 1.19. Trước bản 1.0 cần chạy toàn bộ `tests/qa/run_matrix.sh` (1.16–1.19).
- Phiên bản chính thức mới nhất của quán rượu tại thời điểm đó cũng phải chạy. Ngưỡng phiên bản (`minimum_client_version` và phạm vi đã kiểm thử) phải khớp với thực tế kiểm thử.
- `native_replace040.py` (tiếp quản một chạm v1.1) từ sau 0.4.0 chưa chạy lại vì cần tệp nguyên bản không được tải lên. Cần chọn một trong hai cách:
  - Tạo một bản thay thế tổng hợp có thể công khai (cùng cấu trúc, không chứa nội dung bản gốc);
  - Do người bảo trì chạy trên máy cục bộ và ghi rõ ngày chạy trong báo cáo.

### 4. Khép kín an toàn dữ liệu

- **Di chuyển / Sao lưu / Hoàn tác**: hoàn tất nghiệm thu bấm trên trình duyệt (Xuất → sửa hỏng → hoàn tác → đọc lại khớp nhau).
- **Xuất / Nhập tổng thể**: xuất một chạm toàn bộ dữ liệu của tiện ích (cài đặt, sổ cái, nhóm chat, bộ nhớ đệm đồ phổ), mặc định **không chứa API Key**; trước khi nhập tự động sao lưu trước.
- **Số phiên bản cấu trúc sổ cái**: sau này khi trường dữ liệu thay đổi sẽ có hàm di chuyển và bài kiểm tra, không chỉ dựa vào “đọc tương thích”.
- **Hướng dẫn gỡ cài đặt**: sau khi tạm dừng / xóa tiện ích thì những dữ liệu nào còn lưu lại trong siêu dữ liệu trò chuyện, cách dọn dẹp và cách quay về v1.1.

### 5. Các nút chưa bấm thử từng mục

Nhóm nút trả phí của Thần thông (Sao chép, Cải biên trạng thái), Phái Đi Phân Thân, Động Thiên Tùy Thân, rút thẻ số lượt tùy chỉnh. Mỗi nút đi qua ít nhất một lượt “Bấm → ghi sổ cái → đọc lại”.

---

## P1: Bản 1.0 nên có (Trải nghiệm và khả năng bảo trì)

### 6. Lần đầu mở của người mới

Lộ trình làm quen hiện tại phải đi qua khá nhiều trang: cài Sách Thế Giới, điền cổng AI, bật ký ức trong cuộc trò chuyện hiện tại, bấm lưu. Bản 1.0 đề xuất:

- Thêm một **Trình hướng dẫn chạy lần đầu** (3 bước, có thể bỏ qua): Nhập hoặc cập nhật Sách Thế Giới → Cài đặt cổng AI (tái sử dụng biểu mẫu 3 bước của 0.8.5) → Bật trong cuộc trò chuyện hiện tại. Mỗi bước hoàn thành sẽ tự đánh dấu tích.
- Trang Cài đặt hiện đã có rất nhiều mục: chia thành 3 nhóm 「Thường dùng / Nâng cao / Chẩn đoán」, nhóm Nâng cao mặc định thu gọn, thêm ô tìm kiếm.
- README hiện dài hơn 300 dòng, quá nửa là nhật ký cập nhật từng phiên bản. Đổi thành Cài đặt → Làm quen → Câu hỏi thường gặp; chuyển lịch sử phiên bản sang `CHANGELOG.md`.

> **Tiến độ ở 0.9.3**: Trình hướng dẫn chạy lần đầu đã hoàn thành (Thiết bị đầu cuối → Hướng dẫn / Cài đặt → Làm quen → Hướng dẫn tân thủ, 3 bước tự đánh dấu tích theo trạng thái thực tế, có thể bỏ qua, tự động hiện một lần khi mở thiết bị đầu cuối lần đầu). Chia nhóm cài đặt và viết lại README vẫn chờ thực hiện.

### 7. Người dùng có thể tự báo cáo khi gặp lỗi

- Trong Chẩn đoán tương thích thêm nút **「Sao chép thông tin chẩn đoán」**: phiên bản tiện ích, phiên bản quán rượu, trình duyệt / hệ điều hành, các cài đặt quan trọng (không chứa Key), 20 lỗi tiện ích gần nhất, trạng thái tầng mới nhất. Khi người dùng gửi phản hồi chỉ cần dán trực tiếp.
- Thống nhất định dạng thông báo lỗi: Chuyện gì đã xảy ra + Đã ghi vào sổ cái hay chưa + Bước tiếp theo làm gì.

> **Tiến độ ở 0.9.1**: 「Sao chép thông tin chẩn đoán」 đã hoàn thành (30 lỗi tiện ích gần nhất, không chứa Key). Thống nhất định dạng thông báo lỗi vẫn chờ thực hiện.

### 8. Trau chuốt tiếp giao diện điện thoại

- **Hộp thoại bật lên bên trong trang engine** (kết quả rút thẻ, chi tiết vật phẩm): mở bên trong iframe, đợt này chỉ mới xác nhận không bị tràn khung và cỡ chữ đủ lớn; cảm giác bàn phím và cuộn trang cần đợi thử trên máy thật.
- **Điều hướng khi xoay ngang**: cột dọc bên trái hiện có 20 lối vào, phải cuộn mới nhìn thấy hết. Có thể cân nhắc phương án “6 trang thường dùng + Thêm”.
- **Hiệu năng trên máy cấu hình thấp**: họa tiết trang trí chủ đề thế giới và hoạt ảnh diễn xuất có thể gây tụt khung hình trên máy Android yếu. Có thể tự động giảm nhẹ theo `prefers-reduced-motion` hoặc phát hiện tốc độ khung hình; hiện tại mới chỉ có thể bật thủ công 「Giảm chuyển động」.
- **Tốc độ khởi chạy**: `vendor/original` nặng khoảng 1.6 MB và đang được tải cùng lúc khi khởi động quán rượu. Có thể đổi engine thiết bị đầu cuối, nhóm chat và đồ phổ sang chỉ tải khi mở lần đầu tiên, đồng thời đo thực tế thời gian khởi động quán rượu trên điện thoại.

### 9. Thu gọn dung lượng gói cài đặt

- `docs/evidence/` chứa tới 8 MB ảnh chụp màn hình và nhật ký. Quán rượu dùng `git clone` để cài đặt tiện ích mở rộng nên mọi người dùng đều tải những tệp này về. Đề xuất chuyển sang nhánh `evidence` riêng hoặc tệp đính kèm Release, nhánh chính chỉ giữ lại văn bản báo cáo.

### 10. Chuẩn hóa kỹ thuật

- **CI**: mỗi lần đẩy mã lên sẽ tự chạy `npm run check` + `npm test` (GitHub Actions, mất vài chục giây). Bộ kiểm thử trình duyệt có thể kích hoạt thủ công hoặc chạy hằng đêm (dùng Docker dựng quán rượu cô lập).
- **Ký tự xuống dòng**: trong kho lưu trữ có 26 tệp CRLF, phần còn lại là LF. Thêm `.gitattributes` để thống nhất, nếu không mỗi lần sửa sẽ xuất hiện diff toàn bộ tệp.
- **`FILELIST.sha256`**: đổi sang tạo bằng kịch bản (`npm run filelist`), CI kiểm tra xem đã là bản mới nhất chưa.
- **Kiểm tra phiên bản**: hiện tại bài kiểm tra của từng phiên bản đều kiểm tra số phiên bản nên mỗi lần nâng cấp phải sửa ở nhiều nơi (bản 0.9.0 đã phải sửa 4 tệp). Gom về một tệp `version.test.js` duy nhất.
> **Tiến độ ở 0.9.1**: CI, `.gitattributes` (đổi toàn bộ sang LF), `npm run filelist` và `tests/version.test.js` đều đã hoàn thành.

- **Kiểm tra tĩnh**: thêm ESLint; dùng JSDoc + `tsc --checkJs` để kiểm tra kiểu dữ liệu cho `src/`, bắt đầu từ tầng cầu nối và các mô-đun liên quan tới sổ cái trước.
- **Giấy phép**: kho lưu trữ chưa có tệp `LICENSE`. Cần viết rõ hai việc: giấy phép của mã nguồn tiện ích, cùng ranh giới bản quyền của mã nguồn v1.1 gốc và bộ tư liệu ảnh đứng Lilith.

---

## P2: Có thể để sang nhánh 1.x

- Mô hình Live2D của chính Lilith (cần dùng tệp PSD gắn xương thủ công trong Cubism Editor).
- Phối hợp với tính năng trò chuyện nhóm của quán rượu (hiện tại quy định rõ là không hỗ trợ).
- Giao diện đa ngôn ngữ (hiện tại chỉ có tiếng Trung, đối tượng người dùng mục tiêu cũng chủ yếu dùng tiếng Trung).
- Người dùng tự tùy chỉnh chủ đề / bảng màu (hiện tại là 7 bảng màu cố định).
- Bố cục chuyên biệt cho máy tính bảng (trong bản 0.9.0 máy tính bảng vẫn dùng cửa sổ nổi giống máy tính).

---

## Nhịp độ phát hành đề xuất

| Phiên bản | Nội dung |
| --- | --- |
| 0.9.1 | ✅ Tự kiểm tra trên điện thoại thật, 「Sao chép thông tin chẩn đoán」, nhận diện bàn phím làm thu thấp toàn trang, CI, `.gitattributes`; ⏳ Chờ gửi lại kết quả trên máy Android thật; việc chuyển tệp bằng chứng ra khỏi nhánh chính tạm hoãn theo quyết định |
| 0.9.2 | ✅ Sửa lỗi phản hồi trên máy thật: lặp lời thoại Lilith, lộ nguyên văn thanh trạng thái, lời thoại trong khối mã (xem `CHANGES-0.9.2`); ⏳ Kiểm tra lại trên máy thật |
| 0.9.3 | ✅ Sửa lỗi phản hồi người dùng: Quy tắc → Bối cảnh thế giới bổ sung đọc được Sách Thế Giới (không còn báo “thiếu giao diện đọc Sách Thế Giới”), Bản đồ sao đính chính được thế giới nhận diện sai; ✅ Trình hướng dẫn chạy lần đầu (đẩy sớm từ 0.9.5 lên); ⏳ Kiểm tra lại trên máy thật / TauriTavern |
| 0.9.4 | ✅ Cải tiến nhỏ (phản hồi người dùng): ô nhập liệu lệnh chiêu mộ nhóm chat đi theo chế độ——khi đang chọn 「Thế giới ngẫu nhiên」 mà gõ chữ sẽ tự động đổi sang 「Chỉ định thế giới」, không còn bị “điền tên rồi vẫn ra ngẫu nhiên”; ⏳ Kiểm tra lại trên máy thật |
| 0.9.5 | Kịch bản nghiệm thu mô hình thật, chạy 3 nhóm mô hình, sửa dung sai định dạng và thông báo theo kết quả |
| 0.9.6 | Khép kín an toàn dữ liệu (Xuất / Nhập, nghiệm thu bấm hoàn tác, số phiên bản cấu trúc); bấm thử nốt các nút còn lại; toàn bộ ma trận 1.16–1.19 + bản mới nhất |
| 0.9.7 | Chia nhóm cài đặt, viết lại README, `LICENSE` |
| 1.0.0-rc | Đóng băng tính năng, mời một vài người dùng chơi thử một tuần trên mô hình và điện thoại của chính họ, chỉ sửa lỗi |
| 1.0.0 | Trong thời gian `rc` không phát sinh lỗi mất dữ liệu thì chính thức phát hành |
