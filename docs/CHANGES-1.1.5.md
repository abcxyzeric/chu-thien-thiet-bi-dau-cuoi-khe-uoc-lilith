# Bản chính thức 1.1.5 · Thuyết minh cập nhật

Dựa trên bản 1.1.4. Phiên bản này bổ sung ba tính năng mới, đều xuất phát từ phản hồi của người chơi: có thể tùy chỉnh nhân vật trợ lý hệ thống, có thể bật/tắt toàn bộ tính năng, và nhóm chat có thể đọc Sách Thế Giới cũng như triệu hồi nhân vật từ Sách Thế Giới. Ở cài đặt mặc định, trải nghiệm của người dùng cũ hoàn toàn giống hệt bản 1.1.4: trợ lý vẫn là Lilith, tất cả tính năng đều được bật.

## 1. Thiết lập nhân vật trợ lý hệ thống (Cài đặt → Làm quen → 「Thiết lập nhân vật trợ lý hệ thống ›」)

**Ba mẫu thiết lập sẵn:**

| Mẫu thiết lập | Thuyết minh |
|---|---|
| Lilith (Mặc định) | Khi chọn mẫu này, toàn bộ cơ chế thay thế bên dưới đều không chạy, plugin không thay đổi bất cứ điều gì đối với Lilith. |
| Quả cầu ánh sáng hệ thống (Số hiệu) | Hệ thống không có hình người, là một quả cầu ánh sáng mang số hiệu; điềm tĩnh, ngắn gọn, phát báo theo từng mục. Tên mặc định là 「Hệ Thống + Số hiệu」, ảnh đại diện là quả cầu ánh sáng SVG mang số hiệu được tạo tự động. |
| Tùy chỉnh | Tên, cách xưng hô, tính cách, cách nói chuyện, ảnh đại diện đều có thể tự viết. Ảnh đại diện sẽ được cắt vuông, nén về 256 pixel, giới hạn 400 KB và lưu vào cài đặt tiện ích mở rộng dưới dạng data URI. Trong tùy chọn nâng cao còn có thể thay thế toàn đoạn quy tắc cốt truyện và thiết lập trò chuyện riêng. |

**Cách thức có hiệu lực:** Mã nguồn gốc `vendor/original` có khóa mã băm. Thiết lập nhân vật được thay thế ở các khâu do chính plugin kiểm soát.

+- **Cốt truyện**
  - Mỗi lượt SillyTavern quét Sách Thế Giới sẽ phát ra sự kiện `WORLDINFO_ENTRIES_LOADED`, dữ liệu trong sự kiện là bản sao của các mục từ. Trong các bản sao này:
    - Mục `02｜Cốt lõi｜Trợ lý hệ thống Lilith` của 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 được đổi thành quy tắc thiết lập nhân vật mới, bên trong có sẵn định dạng lời thoại `【Tên】: “……”`;
    - Từ 「Lilith」 trong các mục từ Chư Thiên khác được đổi thành tên nhân vật mới.
  - Không ghi đè vào tệp Sách Thế Giới. Kiểm thử trình duyệt xác nhận sau khi đổi thiết lập nhân vật, tệp Sách Thế Giới trên máy chủ vẫn giữ nguyên văn bản gốc.
  - Khi máy chủ không có sự kiện này, plugin chuyển sang dùng một lời nhắc ghi đè ở độ sâu 4.
- **Trò chuyện riêng / Ký ức / Bàn làm việc**
  - Trong hàm fetch riêng tư của trợ lý, trước tiên phán đoán yêu cầu thuộc API phân nhánh tính năng nào theo nguyên văn, sau đó mới thay đổi nội dung:
    - Lời nhắc hệ thống `PERSONA` của trò chuyện riêng được thay thế toàn đoạn sang bản thiết lập nhân vật mới. Bản mới vẫn giữ nguyên các ràng buộc gốc: chỉ là trò chuyện riêng, không bịa đặt thao tác trò chơi, chỉ xuất nội dung lời nói, cuộc trò chuyện không sửa đổi sổ cái.
    - Tên trong các tin nhắn hệ thống khác cũng được thay thế.
  - Nội dung do chính người dùng viết không bị sửa đổi.
- **Giao diện**
  - Văn bản, `title` / `aria-label` / `alt` / `placeholder`, cùng hình ảnh đại diện gốc bên trong shadow root của trợ lý đều được thay thế theo thiết lập nhân vật. Trước khi thay thế đều ghi nhớ giá trị gốc, nên khi đổi về lại Lilith sẽ khôi phục ngay mà không cần làm mới trang.
  - Những phần sau đây không bị thay thế: ô nhập liệu, chính văn trò chuyện riêng, kết quả bàn làm việc, bản ghi ký ức, tin nhắn nhóm chat, và chính trang thiết lập nhân vật.
  - Khung thoại nhận diện lời thoại theo tên nhân vật thiết lập.
  - Tranh đứng phân lớp được đổi thành ảnh đại diện của nhân vật thiết lập, kèm hiệu ứng phát sáng nhịp thở.
  - Lilith nổi chỉ thuộc về riêng Lilith. Sau khi đổi thiết lập nhân vật sẽ chuyển sang dùng nút đánh thức hình tròn mang ảnh đại diện, khi kéo xuống dưới cùng cũng không còn hiện 「Đổi thành Lilith」.

**Các tệp liên quan:**
- Thêm mới: `src/persona.js`, `src/hub-persona.js`
- Sửa đổi: `src/voice-box.js`, `src/assistant-host.js`, `src/lilith-float.js`, `src/window-controls.js`, `src/hub-settings.js`, `index.js`

## 2. Công tắc tính năng (Cài đặt → Làm quen → 「Công tắc tính năng ›」)

`src/hub-switches.js` (mới) đưa toàn bộ tính năng vào chung một bảng, chia làm 5 nhóm với tổng cộng 37 mục, ngoài ra còn có hai nhóm 「Trang thiết bị đầu cuối」 và 「Công tắc theo cuộc trò chuyện」:

| Nhóm | Nội dung |
|---|---|
| Trợ lý hệ thống | Cửa sổ, cửa sổ nổi, khung thoại, chạm tương tác, rung, nhân vật giao diện, lời thoại trang, góc máy, bong bóng phát báo |
| Tầng trò chuyện & Khối dữ liệu | Ghi sổ, nhãn nhỏ, lọc tầng cũ, bảo vệ sửa lỗi / ghi bù / nhắc nhở / gợi ý công pháp, macro biến số, tự động cài đặt / gỡ gắn kết Sách Thế Giới |
| Gợi ý cốt truyện | Xuyên không, gợi ý / đính chính phẩm giai, đồng bộ độ thuần thục / thực chiến / thẻ nhân vật, ngoại quải tự tạo |
| Nhóm chat | Toàn bộ nhóm chat, công tắc tổng tán gẫu tự động, đọc Sách Thế Giới, tiêm ký ức thành viên nhóm |
| Giao diện & Thao tác | Xem nhanh, phím tắt, lệnh gạch chéo, tự động bật hướng dẫn tân thủ, chủ đề thế giới, hiệu ứng trình diễn, thẻ gợi ý cốt truyện |
| Trang thiết bị đầu cuối | Có thể ẩn bất kỳ trang điều hướng nào. Tổng quan, Cài đặt, Kết nối luôn được giữ lại; bấm vào trang đã tắt sẽ hiện thông báo. |
| Công tắc theo cuộc trò chuyện | Chỉnh lý ký ức, tiêm tóm tắt nhóm chat, bật ngoại quải — các mục này đi theo từng cuộc trò chuyện, trên bảng có nút chuyển nhanh tới nơi cài đặt. |

- Các công tắc trên bảng ghi trực tiếp vào chính những khóa cài đặt mà từng tính năng vốn đang đọc. Chỉ có ba khóa cài đặt mới được thêm vào: `modules.{group, groupAuto, plugins, slash, guide}`, `navHidden`, và `groupWorld` dùng cho nhóm chat.
- Khi tắt toàn bộ một mô-đun, trang giao diện, nội dung tiêm và yêu cầu chạy ngầm sẽ dừng lại cùng lúc:
  - Nhóm chat: xóa trống nội dung tiêm, không tự động tán gẫu nữa, tạm dừng đếm ngược giáng lâm;
  - Ngoại quải tự tạo: xóa trống lời nhắc ngoại quải;
  - `/zt`: chỉ trả lời thông báo đã tắt.
- Chỉ riêng 「Cửa sổ trợ lý hệ thống」 là cần làm mới trang để có hiệu lực.
- Dữ liệu của các tính năng bị tắt đều được giữ nguyên. Trên bảng có nút 「Bật tất cả」.

## 3. Nhóm chat × Sách Thế Giới (Nhóm chat → Thành viên → 「Triệu hồi từ Sách Thế Giới」)

Được thực hiện cùng nhau bởi `src/group-world.js` (mới) và `src/hub-group.js`.

- **Triệu hồi**
  - Chọn một Sách Thế Giới (★ biểu thị đang được cuộc trò chuyện hiện tại sử dụng; danh sách không chứa Sách Thế Giới Chư Thiên), tìm kiếm mục từ theo tên hoặc từ khóa (chỉ đọc).
  - Sau khi bấm 「Triệu hồi」, mô hình xuất ra một dòng hồ sơ dựa theo nội dung mục từ (`Tên|Xuất xứ|Bậc thực lực|Tính cách|Đặc sản`), giống hệt định dạng của Lệnh Chiêu Mộ. Chi phí cũng giống nhau: mỗi lần 100 điểm, thất bại được hoàn lại; phí vào nhóm tính theo bậc thực lực.
  - Cả ứng viên lẫn thành viên sau khi vào nhóm đều ghi nhớ `来源 {book, uid, comment}`.
- **Trò chuyện nhóm / Trò chuyện riêng đọc Sách Thế Giới**
  - Mỗi lần trò chuyện nhóm hoặc trò chuyện riêng đều đính kèm mục từ của chính thành viên được triệu hồi (mỗi người khoảng 360 chữ), cộng thêm các mục từ cùng sách khớp từ khóa trong cuộc hội thoại (tối đa 3 mục).
  - Tổng ngân sách mặc định là 1.600 chữ, có thể chỉnh từ 400–6.000 chữ.
  - Khi trong nhóm không có thành viên nào được triệu hồi từ Sách Thế Giới, yêu cầu gửi đi hoàn toàn giống hệt bản 1.1.4.
- **Ký ức thành viên nhóm** (Quyết định thiết kế)
  - Không ghi vào Sách Thế Giới, chỉ ghi nguồn gốc trong sổ cái.
  - Khi 4 tầng chính văn gần nhất xuất hiện tên hoặc từ khóa mục từ của thành viên nhóm, trong phần tóm tắt nhóm chat sẽ có thêm một đoạn 「Ký ức thành viên nhóm」: trò chuyện nhóm gần đây, trò chuyện riêng, vật phẩm đã tặng qua nhóm chat, độ hảo cảm, tối đa 3 người.
  - Làm mới đoạn nội dung này khi bắt đầu tạo phản hồi (`GENERATION_STARTED`) và khi gửi tin nhắn (`MESSAGE_SENT`), nên luôn lấy được chính văn mới nhất.
  - Yêu cầu cuộc trò chuyện hiện tại đang bật 「Tiêm tóm tắt vào cốt truyện」. Có thể tắt tính năng này trong Công tắc tính năng.

## 4. Khác

- `src/hub-manual.js`: Mô-đun sách hướng dẫn của bản 1.1.4 thiếu `dispose()`, khi gỡ cài đặt sẽ báo cảnh báo, bản này đã bổ sung đầy đủ. Kịch bản `check` trong `package.json` cũng đã bổ sung `hub-manual.js` và các tệp mới của bản này.
- Sách hướng dẫn (`docs/MANUAL.md`) thêm mới Chương 18 「Thiết lập nhân vật trợ lý hệ thống」 và Chương 19 「Công tắc tính năng」, mục 8.2 bổ sung triệu hồi từ Sách Thế Giới, các mục câu hỏi thường gặp, lệnh gạch chéo, vị trí dữ liệu và giới hạn cũng được cập nhật đồng bộ.
- Kiểm thử:
  - Mô hình mô phỏng `tests/qa/mock_model.py` bổ sung câu trả lời cho triệu hồi và trò chuyện riêng theo thiết lập nhân vật;
  - Kiểm tra phiên bản trong `tests/native_v114.py` đổi thành ≥ 1.1.4;
  - Thêm mới `tests/v115.test.js` và `tests/native_v115.py`.

## Bản sửa lỗi tự kiểm tra r1 (Số phiên bản giữ nguyên, mục 「Bản sửa đổi」 trong chẩn đoán hiển thị 1.1.5-r1)

Sau khi phát hành đã tiến hành tự kiểm tra mã nguồn mới của bản 1.1.5 và sửa 5 vấn đề dưới đây:

| # | Vấn đề | Hệ quả | Cách sửa |
|---|---|---|---|
| 1 | Khi trong nhóm chat có thành viên triệu hồi từ Sách Thế Giới, một lượt trò chuyện nhóm phải đọc Sách Thế Giới trước, đọc xong mới đánh dấu 「Thành viên đang nhập…」 | Ngay khoảnh khắc đang đọc Sách Thế Giới (lần đầu có thể mất vài trăm mili-giây), nếu bấm gửi liên tiếp hoặc đúng lúc gặp tán gẫu tự động sau cốt truyện, sẽ **chạy song song hai lượt**: hai yêu cầu, hai lượt phản hồi cùng ghi vào sổ | Đánh dấu trạng thái bận trước rồi mới đọc Sách Thế Giới; trò chuyện riêng cũng xử lý tương tự |
| 2 | Sau khi tắt nhóm chat trong 「Công tắc tính năng」, mục từ thường trực 「36｜Liên kết｜Nhóm Chat Chư Thiên (Plugin)」 trong Sách Thế Giới Chư Thiên vẫn được gửi cho AI chính văn mỗi lượt | AI chính văn vẫn tưởng Ký chủ có nhóm chat, có thể tự bịa ra trò chuyện nhóm hoặc lì xì | Khi tắt nhóm chat, loại bỏ mục từ này khỏi bản sao Sách Thế Giới của lượt đó (không sửa tệp Sách Thế Giới); khi bật lại thì khôi phục |
| 3 | Ký ức thành viên nhóm làm mới lúc `GENERATION_STARTED`, nhưng SillyTavern phải sau thời điểm đó mới thêm câu bạn vừa gửi vào cuộc trò chuyện | Khi câu nói đó của bạn lần đầu nhắc tới thành viên được triệu hồi, phải sang lượt tiếp theo mới tiêm ký ức | Làm mới thêm một lần nữa tại sự kiện `MESSAGE_SENT` (sau khi tin nhắn người dùng đã vào cuộc trò chuyện, trước khi ghép lời nhắc) |
| 4 | Sau khi đổi thiết lập nhân vật, các tầng cũ, tin nhắn do chính động cơ thanh trạng thái gửi đi (như 「vui lòng đưa ra phản hồi phát báo của Lilith」) và ký ức cũ vẫn còn chữ 「Lilith」 | AI chính văn dễ bị kéo ngược về, tiếp tục dùng 【Lilith】 để nói chuyện | Ở cuối quy tắc thiết lập nhân vật thêm một đoạn 「Đối chiếu xưng hô」: chữ 「Lilith」 ở những nơi đó đều chỉ nhân vật thiết lập hiện tại, hãy phản hồi theo thiết lập và định dạng lời thoại hiện tại. Quy tắc tùy chỉnh thay thế toàn đoạn cũng được đính kèm đoạn này |
| 5 | Tên thiết lập nhân vật có thể chỉ điền 1 chữ | Ví dụ điền chữ 「Ta」, khung thoại sẽ vẽ mọi câu 「Ta nói: “……”」 trong chính văn thành thẻ lời thoại hệ thống; khi tên có chứa ký tự kiểu `$&`, biểu thức chính quy nhận diện giọng nói sẽ bị hỏng | Tên phải có ít nhất 2 ký tự (nhắc nhở khi lưu); thay thế biểu thức chính quy không còn bung chuỗi `$` |

Kiểm thử mới thêm: `tests/v115.test.js` thêm 5 hạng mục (gồm bài kiểm thử tích hợp 「trong lúc đọc Sách Thế Giới đã ở trạng thái bận」); `tests/native_v115.py` thêm 3 hạng mục (đối chiếu xưng hô đi vào lời nhắc chính văn; khi tắt nhóm chat thì mục từ 36 không được gửi; sau khi bật lại thì khôi phục).

## Các tệp thay thế / thêm mới

**Thêm mới:**
- `src/persona.js`
- `src/hub-persona.js`
- `src/hub-switches.js`
- `src/group-world.js`
- `tests/v115.test.js`
- `tests/native_v115.py`
- `docs/CHANGES-1.1.5.md`
- `docs/ACCEPTANCE-1.1.5.md`

**Sửa đổi:**
- Lối vào & Siêu dữ liệu: `index.js`, `manifest.json`, `package.json`, `package-lock.json`, `FILELIST.sha256`
- Mã nguồn: `src/assistant-host.js`, `src/contracts.js`, `src/features.js`, `src/hub-group.js`, `src/hub-manual.js`, `src/hub-plugins.js`, `src/hub-settings.js`, `src/hub.js`, `src/lilith-float.js`, `src/onboarding.js`, `src/settings.js`, `src/voice-box.js`, `src/window-controls.js`
- Giao diện (CSS): `styles/hub.css`
- Tài liệu: `README.md`, `CHANGELOG.md`, `docs/FEATURE_MATRIX.md`, `docs/MANUAL.md`, `docs/evidence/guards.json` (kết quả chạy lại native_guards)
- Kiểm thử: `tests/version.test.js`, `tests/v114.test.js` (nới lỏng kiểm tra phiên bản tiêu đề sách hướng dẫn), `tests/native_v114.py`, `tests/qa/mock_model.py`

## Giới hạn

- Hiệu quả nhập vai của nhân vật tùy chỉnh, quả cầu ánh sáng hệ thống, triệu hồi và ký ức thành viên nhóm mới chỉ được nghiệm thu bằng mô hình mô phỏng (Tính năng thử nghiệm).
- Từ 「Lilith」 trong các mục từ Sách Thế Giới khác là thay thế cơ học, nội dung hướng người lớn của bản gốc cũng sẽ đổi sang tên mới theo. Nếu muốn loại bỏ triệt để, hãy dùng 「Nâng cao: Thay thế toàn đoạn」, hoặc trực tiếp chỉnh sửa Sách Thế Giới.
- Những lời thoại cũ và cuộc trò chuyện riêng cũ đã được ghi vào lịch sử trò chuyện sẽ không bị sửa đổi.
