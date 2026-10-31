# Phương án cập nhật Thiết Bị Đầu Cuối Chư Thiên 1.0 (Bản thảo)

Viết sau bản 0.9.4 (2026-10-02). Phương án này dựa trên nền tảng [ROADMAP-1.0](ROADMAP-1.0.md) (viết ở bản 0.9.0), sắp xếp lại theo tiến độ thực tế của các bản 0.9.1–0.9.4 và cụ thể hóa từng bước thành các mục có thể nghiệm thu. **Sau khi xác nhận sẽ gộpกลับ vào ROADMAP.**

---

## I. Tiêu chuẩn phát hành bản 1.0

Tóm gọn trong một câu: người dùng thông thường cài đặt theo README, **sử dụng mô hình thật của chính mình** chơi trọn vẹn một ván trên cả máy tính và điện thoại mà suốt quá trình không bị mất sổ cái, không bị treo cứng, không cần phải đọc tài liệu để tự gỡ lỗi. Cụ thể là 6 cửa ải dưới đây, vượt qua toàn bộ mới phát hành bản 1.0:

| # | Cửa ải | Tiêu chuẩn vượt qua |
| --- | --- | --- |
| 1 | Mô hình thật | 3 nhóm mô hình (mô hình lớn nội địa, mô hình suy luận, mô hình truy cập qua trạm trung chuyển) mỗi nhóm chạy xong 《Kịch bản nghiệm thu một ván chơi》; sổ cái không bị mất hay ghi hỏng; tỷ lệ tuân thủ định dạng khối cập nhật biến ≥ 90%; khi sai định dạng giao diện đưa ra thông báo dễ hiểu chứ không âm thầm thất bại |
| 2 | Xóa sạch mục chờ trong bảng năng lực | Toàn bộ 6 mục `pending` hiện tại trong `src/contracts.js` đều chuyển thành `implemented`; những mục chưa làm được phải đánh dấu rõ là 「Thử nghiệm」 và ghi明 ngay trên giao diện |
| 3 | Máy thật | iPhone + Safari, Android tầm trung + Chrome, màn hình nhỏ rộng 360px, TauriTavern: mỗi thiết bị chạy qua một lượt 「Tự kiểm tra trên điện thoại thật」 và một ván quy trình cốt lõi |
| 4 | Ma trận máy chủ | Từng phiên bản SillyTavern trong phạm vi hỗ trợ cộng thêm bản chính thức mới nhất tại thời điểm phát hành, mỗi bản chạy một vòng toàn bộ kiểm thử trình duyệt ở cả hai chế độ có cài và không cài Tavern Helper |
| 5 | An toàn dữ liệu | Xuất → sửa hỏng → nhập hoặc hoàn tác → đọc lại khớp nhau; sổ cái có số phiên bản cấu trúc và bài kiểm tra di chuyển; viết đầy đủ hướng dẫn gỡ cài đặt |
| 6 | Giai đoạn chơi thử | Trong thời gian bản `rc` ít nhất một tuần, một vài người dùng chơi trên mô hình và điện thoại của chính họ mà không gặp lỗi mất dữ liệu cũng như không còn lỗi nghiêm trọng nào chưa giải quyết |

## II. Hiện trạng (0.9.4)

- **Bảng năng lực**: 45 mục `implemented`, 6 mục `pending`, 1 mục chỉ đọc. Trong 6 mục `pending` có 5 mục vướng ở chỗ “chưa có mô hình thật”, 1 mục vướng ở chỗ “chưa nghiệm thu bấm trên trình duyệt” (di chuyển bản lưu cũ, sao lưu và hoàn tác).
- **Kiểm thử**: 208 bài kiểm tra đơn vị; 16 bộ kiểm thử trình duyệt. Chỉ có SillyTavern 1.19.0 là vừa chạy lại toàn bộ gần đây.
  - Bản 1.17 / 1.18 từ sau 0.8.2 chưa kiểm tra lại.
  - `native_replace040` (tiếp quản một chạm v1.1) từ sau 0.4.0 chưa chạy lại vì cần tệp nguyên bản không được phép tải lên kho lưu trữ.
- **Máy thật**: bản 0.9.1 đã làm công cụ 「Tự kiểm tra trên điện thoại thật」, nhưng kết quả trên máy Android thật vẫn chưa gửi về; iPhone, màn hình nhỏ rộng 360px và TauriTavern trên máy thật đều chưa thử.
- **Dung lượng**: các tệp thuộc quản lý phiên bản trong kho lưu trữ nặng khoảng 12.3 MB, trong đó riêng `docs/evidence/` chiếm 8.3 MB. Quán rượu cài đặt tiện ích mở rộng bằng `git clone`, nên mọi người dùng đều phải tải những ảnh chụp màn hình và nhật ký này về.
- **Tài liệu**: README dài 393 dòng, quá nửa là nhật ký cập nhật từng phiên bản; kho lưu trữ vẫn chưa có tệp `LICENSE`; có 36 mục cài đặt nhưng chưa chia nhóm.
- **Máy chủ**: bản chính thức mới nhất của SillyTavern là 1.19.0 (2026-09-14). Trong thông báo bảo mật tháng 5 năm 2026, đội ngũ phát triển quán rượu cho biết các phiên bản trước 1.17.0 đều không an toàn (do sự cố tiện ích mở rộng bên thứ ba đánh cắp API Key). Phiên bản tối thiểu hiện tại của tiện ích đang là 1.16.0.

## III. Kế hoạch phiên bản

4 phiên bản nhỏ đầu tiên mỗi bản giải quyết một việc, sau đó đóng băng tính năng để bước vào giai đoạn `rc`. Mỗi phiên bản đều tuân thủ quy tắc hiện tại: bàn giao tệp đầy đủ, đối chiếu số phiên bản ở 4 nơi, cập nhật `CHANGES` và `ACCEPTANCE`, chạy kiểm tra đơn vị và hồi quy trình duyệt.

### 0.9.5 Nghiệm thu mô hình thật và dung sai định dạng (P0, khoảng trống lớn nhất)

Phía tôi không có và cũng không nên cầm API Key của bạn, vì vậy cách làm là **đưa công cụ nghiệm thu vào ngay trong tiện ích để bạn chạy trên máy cục bộ và chỉ gửi lại kết quả đã che thông tin nhạy cảm**.

1. **「Khám sức khỏe mô hình」** (Cài đặt → Tương thích & Bảo trì, đặt cạnh 「Tự kiểm tra trên điện thoại thật」):
   - Sử dụng cổng kết nối mà bạn đã cấu hình sẵn, lần lượt gửi 6 yêu cầu nhỏ:
     - Khối cập nhật biến của cuộc trò chuyện chính;
     - Ghi Thế giới hiện tại / Loại thế giới;
     - Nhập hàng Thương thành;
     - Thẻ chiêu mộ;
     - Phản hồi trò chuyện nhóm;
     - Trò chuyện riêng.
   - Mỗi mục sẽ phán định xem có phân tích cú pháp được không, có viết bừa trường dữ liệu không, mất bao nhiêu thời gian, cuối cùng sao chép báo cáo bằng một chạm.
   - Trong báo cáo chỉ có tên mô hình, loại cổng, kết quả đạt/trượt và nguyên nhân thất bại của từng mục, đoạn lỗi chỉ cắt 80 chữ đầu và đã che thông tin nhạy cảm; **không chứa Key và không chứa nội dung trò chuyện**.
   - Trước khi bắt đầu sẽ báo trước ước tính tốn khoảng bao nhiêu lần gửi yêu cầu.
2. **《Kịch bản nghiệm thu một ván chơi》** (`docs/REAL_MODEL_SCRIPT.md`):
   - Cố định thẻ nhân vật thử nghiệm với 20 bước thao tác: Xuyên không → Nhiệm vụ → Thương thành / Rút thưởng → Đột phá → Nhóm chat → Trò chuyện riêng → Chuyển cuộc trò chuyện → Tắt tiện ích.
   - Mỗi bước đều ghi rõ tiêu chuẩn vượt qua: trường nào trong sổ cái phải thay đổi, Sách Thế Giới có được tiêm vào không, trong tầng tin nhắn có còn sót `<ZhuTianPanel>` thô hay không.
   - Bạn chơi một ván theo kịch bản rồi dùng 「Sao chép thông tin chẩn đoán」 gửi kết quả lại.
3. **Dung sai định dạng**:
   - Trước tiên dùng một loạt mẫu “đầu ra lỗi” để viết thành bài kiểm tra đơn vị (ít nhất 30 mẫu):
     - Quá trình suy nghĩ bị trộn lẫn vào trong chính văn;
     - JSON bị bọc trong khối mã;
     - Dấu ngoặc kép tiếng Trung, dấu hai chấm toàn giác;
     - Trôi lệch tên trường (ví dụ viết 「Điểm Hệ Thống」 thành 「Tích phân」);
     - Đầu ra bị cắt cụt;
     - Cùng một khối xuất hiện hai lần.
   - Sau đó vá bổ sung dựa theo báo cáo thực tế mà bạn gửi về.
   - Những trường hợp không thể tự sửa được sẽ hiện thông báo dễ hiểu, ví dụ “Mô hình này không viết biến theo đúng định dạng, lượt này chưa ghi sổ, bạn có thể thử lại hoặc đổi mô hình khác”.
4. **Nghiệm thu**:
   - Cả 3 nhóm mô hình đều có báo cáo khám sức khỏe và kết quả kịch bản một ván chơi, ghi vào `ACCEPTANCE-0.9.5`.
   - Đổi trạng thái của 5 mục `pending` liên quan tới mô hình trong bảng năng lực theo kết quả thực tế.

**Cần bạn hỗ trợ**: chuẩn bị 1–3 nhóm mô hình chạy trên máy của bạn, tốt nhất là DeepSeek hoặc GLM, một mô hình suy luận, và một mô hình truy cập qua trạm trung chuyển.

### 0.9.6 Khép kín an toàn dữ liệu + Bấm thử nốt các nút còn lại (P0)

1. **Xuất / Nhập tổng thể**:
   - Một tệp JSON duy nhất chứa cài đặt, sổ cái, nhóm chat, bộ nhớ đệm đồ phổ và trạng thái hướng dẫn, mặc định không chứa API Key.
   - Trước khi nhập sẽ tự động sao lưu một lần và hiển thị bản xem trước khác biệt “Sắp ghi đè những gì”.
2. **Số phiên bản cấu trúc sổ cái**:
   - Thêm mới `诸天系统.结构版本` kèm một bộ hàm di chuyển dữ liệu, mỗi bước di chuyển đều có bài kiểm tra.
   - Khi đọc phải phiên bản mới hơn tiện ích hiện tại sẽ chuyển sang chế độ chỉ đọc và hiện thông báo chứ không ghi đè làm hỏng.
3. **Sao lưu và hoàn tác**: hoàn tất nghiệm thu bấm trên trình duyệt theo quy trình “Ghi → sửa hỏng → hoàn tác → đọc lại khớp nhau”. Đổi mục 「Di chuyển bản lưu cũ, sao lưu & hoàn tác sổ cái」 trong bảng năng lực thành `implemented`.
4. **Hướng dẫn gỡ cài đặt**: sau khi tạm dừng / xóa tiện ích thì những dữ liệu nào vẫn còn lưu lại trong siêu dữ liệu trò chuyện, cách dọn dẹp và cách quay về bản v1.1.
5. **Bấm thử nốt các nút**: nhóm nút trả phí của Thần thông (Sao chép, Cải biên trạng thái), Phái Đi Phân Thân, Động Thiên Tùy Thân, rút thẻ số lượt tùy chỉnh. Mỗi nút đi qua ít nhất một lượt “Bấm → ghi sổ cái → đọc lại” và đưa vào kiểm thử trình duyệt.

### 0.9.7 Trau chuốt trải nghiệm (P1)

1. **Chia nhóm cài đặt**: chia 36 mục cài đặt thành 3 nhóm 「Thường dùng / Nâng cao / Chẩn đoán」, nhóm Nâng cao mặc định thu gọn, đồng thời thêm một ô tìm kiếm.
2. **Thông báo lỗi thống nhất**:
   - Đổi toàn bộ thông báo thất bại thành cấu trúc 3 phần: Chuyện gì đã xảy ra / Sổ cái có bị ghi hay không / Bước tiếp theo làm gì.
   - Rà soát lại toàn bộ văn bản báo lỗi hiện có và dùng một bài kiểm tra đơn vị để kiểm tra định dạng.
3. **Điện thoại**:
   - Thanh điều hướng cột trái khi xoay ngang đổi thành “6 trang thường dùng + Thêm”, không cần phải cuộn mới tìm thấy lối vào nữa.
   - Tự động giảm nhẹ trên máy cấu hình thấp: tự động đi theo khi hệ thống bật “Giảm chuyển động”; khi phát hiện tụt khung hình rõ rệt sẽ gợi ý tắt hoạt ảnh diễn xuất.
4. **Tốc độ khởi chạy**:
   - Đổi engine thiết bị đầu cuối, nhóm chat và đồ phổ sang chỉ tải khi mở lần đầu tiên, không tải dồn cùng lúc khi khởi động quán rượu.
   - Đo thời gian khởi động quán rượu trên điện thoại trước và sau khi sửa, ghi vào báo cáo nghiệm thu.

### 0.9.8 Chuẩn bị phát hành (P1)

1. **Viết lại README**:
   - Đổi cấu trúc thành: Cài đặt → Làm quen (kết hợp với Hướng dẫn tân thủ) → Câu hỏi thường gặp → Cập nhật / Gỡ cài đặt, mục tiêu gói gọn trong 150 dòng.
   - Chuyển lịch sử phiên bản sang `CHANGELOG.md`; giữ nguyên `docs/CHANGES-*.md` làm thuyết minh chi tiết.
2. **LICENSE**: ghi rõ giấy phép đối với phần mã nguồn do tiện ích tự viết, cũng như ranh giới bản quyền của mã nguồn v1.1 gốc, ảnh đứng Lilith và Live2D Cubism Core (cần bạn quyết định, xem Mục V).
3. **Dung lượng gói cài đặt**: chuyển `docs/evidence/` sang nhánh `evidence` riêng hoặc tệp đính kèm Release, nhánh chính chỉ giữ lại văn bản báo cáo để giảm dung lượng tải về của người dùng từ khoảng 12 MB xuống 4 MB. Ở bản 0.9.1 bạn đã quyết định tạm hoãn, tại đây cần xác nhận lại.
4. **Kiểm tra tĩnh**: thêm ESLint; bổ sung JSDoc cho tầng cầu nối và các mô-đun liên quan tới sổ cái trước, đồng thời dùng `tsc --checkJs` để kiểm tra kiểu dữ liệu. Chạy chung trong CI.
5. **Toàn bộ ma trận**:
   - Mỗi phiên bản SillyTavern trong phạm vi hỗ trợ cộng thêm bản chính thức mới nhất, chạy một vòng toàn bộ kiểm thử trình duyệt ở cả hai chế độ có cài và không cài Tavern Helper.
   - Đổi `native_replace040` sang dùng một bản thay thế tổng hợp có thể công khai (cùng cấu trúc với bản gốc nhưng không chứa nội dung bản gốc) để lần nào cũng chạy kiểm tra được.
6. **Ngưỡng phiên bản**: `minimum_client_version` và phạm vi hỗ trợ ghi trong README phải khớp với các phiên bản đã thực sự kiểm thử.

### 1.0.0-rc.1 → 1.0.0

- **Đóng băng tính năng**, chỉ sửa lỗi, có bản sửa lỗi sẽ phát hành `rc.2`, `rc.3`.
- **Danh sách máy thật**: theo Mục I.3, đi qua thủ công từng thiết bị một và ghi kết quả vào `ACCEPTANCE-1.0.0`.
- **Chơi thử**: 3–5 người dùng chơi thử một tuần trên mô hình và điện thoại của chính họ, phản hồi vấn đề bằng 「Sao chép thông tin chẩn đoán」.
- **Phát hành**: thỏa mãn toàn bộ 6 cửa ải ở Mục I, và trong vòng một tuần sau bản `rc` cuối cùng không phát sinh lỗi mất dữ liệu thì sẽ chính thức phát hành 1.0.0.

### Sau bản 1.0 (1.x)

Mô hình Live2D của chính Lilith, phối hợp với tính năng trò chuyện nhóm của quán rượu, giao diện đa ngôn ngữ, bảng màu do người dùng tự tùy chỉnh, bố cục chuyên biệt cho máy tính bảng.

## IV. Rủi ro

| Rủi ro | Ảnh hưởng | Cách ứng phó |
| --- | --- | --- |
| Mô hình thật chỉ thử được 1–2 nhóm | Cửa ải số 1 chưa trọn vẹn | Trong tài liệu 1.0 ghi rõ “Các mô hình đã nghiệm thu”; các nhóm mô hình chưa thử sẽ ghi “Chưa kiểm chứng” chứ không nói chung chung là “Hỗ trợ” |
| Không đủ máy thật và người chơi thử | Cửa ải số 3 và 6 bị trễ hạn | Ưu tiên đảm bảo điện thoại của chính bạn và TauriTavern; nếu không tìm được người thử trên iPhone thì ghi rõ “Chưa thử thực tế trên iOS” trong tài liệu |
| Trong thời gian `rc` quán rượu phát hành bản 1.20 | Phải chạy lại ma trận phiên bản | Sau khi bản mới phát hành sẽ chạy bổ sung một vòng ma trận; nếu phát hiện không tương thích sẽ tạm thu hẹp ngưỡng phiên bản trước, sửa xong mới mở lại |
| Bản quyền của bản gốc v1.1 và ảnh đứng chưa rõ ràng | Tệp LICENSE chỉ có thể bao phủ phần mã do tiện ích tự viết | Viết tách bạch trong LICENSE, phần nguyên bản ghi rõ nguồn gốc và điều kiện sử dụng |
| Lỗi khi di chuyển dữ liệu | Người dùng bị mất bản lưu | Tự động sao lưu trước mỗi lần di chuyển; hàm di chuyển bắt buộc phải có bài kiểm tra; khi đọc phải phiên bản mới hơn sẽ chuyển sang chế độ chỉ đọc |

## V. Những việc cần bạn quyết định

1. **Mô hình thật**: hiện tại bạn có thể dùng những nhóm mô hình và cổng kết nối nào? (Quyết định mức độ nghiệm thu của bản 0.9.5)
2. **Phiên bản hỗ trợ tối thiểu**: giữ nguyên SillyTavern 1.16 hay nâng lên 1.17 (đội ngũ quán rượu cho biết các bản trước 1.17 đều không an toàn)?
3. **Giấy phép**: MIT (thoải mái nhất), AGPL-3.0 (giống bản thân quán rượu), hay tạm thời chưa cấp phép mã nguồn mở (bảo lưu mọi quyền)?
4. **Tệp bằng chứng**: chuyển `docs/evidence/` ra khỏi nhánh chính ở bản 0.9.8 hay tiếp tục giữ lại?
5. **Nhịp độ**: đi theo 4 phiên bản nhỏ như trên hay gộp thành 2 phiên bản lớn (0.9.5 = Mô hình + Dữ liệu, 0.9.6 = Trải nghiệm + Chuẩn bị phát hành)?
6. **Người dùng chơi thử**: trong giai đoạn `rc` có thể tìm được 3–5 người dùng chơi thử một tuần không?

## VI. Kết quả thực thi (1.0.0, 2026-10-02)

Quyết định của bạn: ① Tạm thời chưa nối mô hình thật, chỉ dùng mô hình giả lập; ② Giữ phiên bản tối thiểu là SillyTavern 1.16; ③ Giấy phép dùng hình thức 「Mã nguồn hiển thị công khai, bảo lưu mọi quyền」, nghiêm cấm phân phối lại, thương mại hóa và huấn luyện AI; ④ Tệp bằng chứng “sao cũng được”; ⑤ Cập nhật một mạch lên thẳng 1.0.0, không phát hành phiên bản trung gian và `rc`; ⑥ Không có người dùng chơi thử; ngoài ra thêm mới: đổi Lilith nổi trên điện thoại sang nhân vật tách nền.

| Kế hoạch ban đầu | Kết quả bản 1.0.0 |
| --- | --- |
| 0.9.5 Mô hình thật, khám sức khỏe mô hình, dung sai đầu ra lỗi | **Chưa làm** (Quyết định ①). 5 năng lực liên quan tới mô hình được đánh dấu là `experimental` (Thử nghiệm) và ghi rõ ở đầu README |
| 0.9.6 Xuất / Nhập, phiên bản cấu trúc, nghiệm thu bấm hoàn tác, hướng dẫn gỡ cài đặt | **Đã làm**: `src/data-io.js`, `docs/UNINSTALL.md`; bắt buộc sao lưu trước khi hoàn tác |
| 0.9.6 Bấm thử nốt các nút còn lại | **Chưa làm**: nhóm trả phí Thần thông, Phái Đi Phân Thân, Động Thiên Tùy Thân, rút thẻ số lượt tùy chỉnh vẫn chưa bấm thử từng mục |
| 0.9.7 Chia nhóm cài đặt + tìm kiếm, thông báo lỗi thống nhất, điều hướng ngang, giảm nhẹ trên máy yếu | **Đã làm** (`src/hub-settings.js`, `src/errors.js`, `src/mobile.js`, `src/perf.js`). Giảm nhẹ trên máy yếu được làm thành tự động chuyển sang chế độ rút gọn thay vì chỉ hiện thông báo |
| 0.9.7 Tải theo nhu cầu, đo thời gian khởi động | **Chưa làm**, để dành sang nhánh 1.x |
| 0.9.8 README ≤150 dòng + CHANGELOG, LICENSE | **Đã làm** |
| 0.9.8 Chuyển `evidence` ra khỏi nhánh chính | **Chưa làm**: kịch bản bàn giao cục bộ không hỗ trợ xóa tệp nên vẫn giữ lại |
| 0.9.8 ESLint / checkJs, bản thay thế công khai cho `replace040` | **Chưa làm** |
| 0.9.8 Toàn bộ ma trận | Xem [ACCEPTANCE-1.0.0](ACCEPTANCE-1.0.0.md) |
| `rc`, danh sách máy thật, chơi thử | **Chưa làm** (Quyết định ⑤ ⑥); máy thật và TauriTavern chưa thử |
| Thêm mới: Tách nền Lilith nổi | **Đã làm**: `tools/lilith_float_cutout.py`, `assets/lilith/float/`, `src/lilith-float.js` |

Do đó bản 1.0.0 chưa thỏa mãn các cửa ải số 1, 3, 6 ở Mục I; cửa ải số 2 được xử lý theo cách “những mục chưa kiểm chứng trên mô hình thật được đánh dấu là Thử nghiệm”. Tất cả những điểm này đều được liệt kê trung thực trong mục 「Chưa hoàn thành / Chưa kiểm chứng」 của README.
