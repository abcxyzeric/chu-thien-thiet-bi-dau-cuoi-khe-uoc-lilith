# 1.1.1 · Bản ghi xác minh

> Bản cập nhật nhỏ sửa lỗi (bugfix), chi tiết thay đổi xem tại [CHANGES-1.1.1](CHANGES-1.1.1.md). Kết luận (bao gồm các bản sửa lỗi thẩm tra trước khi phát hành): kiểm thử đơn vị 381/381; chuyên đề thẩm tra 34/34 (SillyTavern thực tế, chạy liên tiếp 3 lần); chuyên đề 1.1.1 đạt 32/32, chuyên đề ảnh đại diện điện thoại đạt 12/12; hồi quy trình duyệt cũ đồng nhất với cơ sở 1.1.0. **Chưa kiểm thử bằng mô hình thực tế, cũng chưa kiểm thử trên điện thoại vật lý**, vui lòng xem thêm mục 「Những phần chưa kiểm thử」 bên dưới.

## Môi trường & Quy chuẩn

- Cơ sở: main `bfa4807` (1.1.0-patch4). Trước khi sửa mã, toàn bộ 348 bài kiểm thử đơn vị gốc, `check` và `filelist:check` đều đạt.
- Ngày: 2026-10-06. SillyTavern 1.19.0 cô lập (`7e8663c`) + Chromium/Playwright, cổng 8019. Chỉ dùng nhân vật nghiệm thu, không chạm tới bất kỳ SillyTavern hay dữ liệu người dùng nào.
- Phản hồi mô hình toàn bộ là mô phỏng tất định (`tests/qa/mock_model.py` và chặn trong trang), chỉ chứng minh logic của plugin chứ không đại diện cho cách viết của mô hình thực tế. Lưu cuộc trò chuyện, lưu biến số và tải lại trang đều đi qua máy chủ SillyTavern cô lập thực sự.

## Kết quả

| Kiểm tra | Kết quả & Phạm vi |
|---|---|
| `npm test` | **381/381**: 348 mục cũ + `tests/v111.test.js` 20 mục + `tests/v111-audit.test.js` 13 mục; cập nhật giá trị kỳ vọng của 3 bài kiểm thử cũ (số phiên bản, bản sửa đổi Sách Thế Giới, mục từ cũ chưa sửa không tính là tự sửa), khẳng định cộng dồn của `group060.test.js` được viết lại theo quy tắc cộng dồn mới, nguyên nhân xem tại CHANGES |
| `npm run check` | Kiểm tra cú pháp JS, trích xuất vendor và mã băm nguồn đều đạt |
| `npm run filelist:check` | Đồng nhất với cây thư mục tệp bàn giao |
| `tests/native_v111_audit.py --isolated-test-only` | **34/34**, chuyên đề thẩm tra trước khi phát hành (xem bên dưới), sau khi hoàn tất toàn bộ sửa lỗi thẩm tra chạy liên tiếp 3 lần đều đạt 34/34 |
| `tests/native_v111.py --isolated-test-only` | **32/32**, chuyên đề 1.1.1 (xem bên dưới), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_v111_mobile.py --isolated-test-only` | **12/12**, chuyên đề ảnh đại diện điện thoại (xem bên dưới), chạy lại sau khi sửa lỗi thẩm tra; cùng bộ này nếu chạy với `window-controls.js` của bản 1.1.0 chỉ đạt 4/12 |
| `tests/native_v110.py` | 37/37 (hồi quy 1.1: thương thành, hộp mù, thu nạp, kéo/thu phóng cửa sổ nổi cảm ứng, v.v.), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_v100.py` | 28/28 (bản lưu, cài đặt, tranh đứng, màn hình ngang, v.v.), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_v090.py` | 24/24 (thích ứng toàn màn hình điện thoại 0.9, né bàn phím), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_v110_review.py` | 11/12, **giống hệt cơ sở `bfa4807`** có 1 mục thất bại: kịch bản phúc tra cũ này tính lỗi 「Trang thiết bị đầu cuối đã hết hiệu lực」 do patch4 cố ý ném ra là ngoại lệ trang, không phải do thay đổi đợt này gây ra |
| `tests/native_v110_patch3.py` | 19/19 (chuyển cuộc trò chuyện, lưu đĩa, chẩn đoán ngữ cảnh bảo mật), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_group060.py` | 44/44 (nhóm chat, lì xì, trò chuyện riêng), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_world070.py` | 40/40 (cài đặt, nâng cấp, xung đột Sách Thế Giới), chạy lại sau khi sửa lỗi thẩm tra |
| `tests/native_guards.py` | Cả 5 nhóm đều đạt (khử trùng lặp gửi tin, nhãn không thực thi, v.v.) |
| `tests/native_terminal050.py` | 49/58, **9 mục thất bại giống hệt cơ sở 1.1.0 `bfa4807`** (khẳng định thương thành/điều hướng cũ thời 0.5.0, đã được thay thế bởi thương thành 1.0 từ lâu), đợt này không có thất bại mới |
| Ngoại lệ chưa bắt được trên trình duyệt | Cả chuyên đề lẫn hồi quy đều có 0 pageerror |
| `vendor/original` | Giữ nguyên cấu trúc |

## Chuyên đề thẩm tra trước khi phát hành (34 hạng mục, `tests/native_v111_audit.py`)

Toàn bộ đều thao tác thông qua giao diện hoặc sự kiện SillyTavern bên trong SillyTavern 1.19.0 cô lập thực tế, cuộc trò chuyện và biến số đều được lưu xuống đĩa máy chủ rồi đọc lại để đối chiếu. Phản hồi mô hình do `tests/qa/mock_model.py` mô phỏng.

1. **#7 Roll lại (Reroll)** (API chính nối với mô hình mô phỏng, trong phản hồi có Danh Vọng +50, Số tiền nắm giữ +100):
   - Phản hồi đầu tiên: Danh Vọng 100 → 150, trong lời nhắc là Danh Vọng 100.
   - Vuốt đổi (swipe): trong lời nhắc là Danh Vọng 100 trước tầng này (chứ không phải 150), kết quả là 150, không bị cộng dồn lên 200. Vuốt quay về tin đầu tiên vẫn là 150.
   - Tạo lại (regenerate): lời nhắc Danh Vọng 100, kết quả 150, sổ cái trên đĩa đồng nhất; Số tiền nắm giữ 600 (tính từ mốc 500), không bị cộng dồn.
   - **Đối chiếu**: Tắt bộ bảo vệ rồi thực hiện swipe tương tự, Danh Vọng bị cộng dồn lên 200, chứng tỏ bài kiểm thử thực sự bắt được lỗi này.
2. **#3 Ghi bù nhảy nhầm cuộc trò chuyện**: Sau khi cuộc trò chuyện A nhận phản hồi thiếu khối dữ liệu 50 mili-giây thì chuyển sang cuộc trò chuyện B. Cuộc trò chuyện B không phát sinh yêu cầu ghi bù, không bị nối thêm nội dung; cuộc trò chuyện A cả trong bộ nhớ lẫn trên đĩa đều không bị ghi khối dữ liệu ghi bù quá hạn.
3. **#2 Ghi bù ghi đè giao dịch**: Trong lúc tự động ghi bù đang chờ mô hình, người dùng tiêu điểm xuống còn 1000 và lưu lại. Kết quả ghi bù bị từ chối, cả bộ nhớ lẫn đĩa đều giữ nguyên 1000, và hiện thông báo 「Sổ cái đã thay đổi trong lúc bổ sung… bản bổ sung lần này chưa được ghi」.
4. **#6 Tắt plugin**: Tắt plugin trong lúc đang chờ ghi bù, cuộc trò chuyện không đổi, không lưu, đĩa không đổi.
5. **#4 Khôi phục nguyên văn**: Phản hồi bị nhiễu dài 63.084 chữ được tự động chỉnh lý, bản sao lưu giữ trọn vẹn 63.084 chữ; sau khi khôi phục, cả bộ nhớ lẫn đĩa đều là 63.084 chữ.
6. **#5 / #1 Vật phẩm** (nút bấm thực tế do động cơ kết xuất):
   - Giữ lại Tiên phẩm hộp mù (giá 10.000.000): nằm riêng một dòng, không bị gộp vào Tiên phẩm cốt truyện có giá 1; đĩa đồng nhất, chỉ ghi một bản ghi thao tác.
   - Khi phân giải, cho máy chủ kiểm tra trả về HTTP 500: thông báo 「Vật phẩm và Điểm Hệ Thống đều không thay đổi」, thực tế đều không đổi; sau khi thử lại +20 Điểm Hệ Thống, vật phẩm giảm 1 món.
   - Bấm liên tiếp hai lần vào Giữ lại toàn bộ: chỉ giữ lại một lần, danh sách chờ xử lý trống, đĩa đồng nhất.
   - Thu hồi món Tiên phẩm hộp mù này: +1.000.000 Điểm Hệ Thống (chứ không phải chỉ nhận được 1 theo giá sau khi gộp).
   - Hàm `bagAdd` nguyên bản của Túi Vô Hạn cũng áp dụng quy tắc cộng dồn nghiêm ngặt tương tự.
7. **Thứ yếu · Rút thẻ**: Khi đọc lại sau khi lưu thất bại sẽ thông báo 「Chưa thể xác nhận kết quả lưu của lượt rút 1–10 (có thể đã trừ điểm và ghi vào mục chờ xử lý), giao dịch đã bị đóng băng…」, không còn nói 「chưa trừ Điểm Hệ Thống」 nữa; sau đó cuộc trò chuyện này không ghi sổ cái nữa cho tới khi tải lại trang.
8. Suốt quá trình không có pageerror.

## Bao phủ chuyên đề 1.1.1 (32 hạng mục)

1. **Bộ bảo vệ định dạng khối dữ liệu (#7/#4)**: Đi qua API chính của SillyTavern bằng nút gửi thực tế, phản hồi mô phỏng viết cả chính văn và `<think>` vào bên trong khối dữ liệu, thẻ viết chữ thường và không có thẻ đóng.
   - Kết quả: Tầng này được sửa sạch. Khối dữ liệu được đóng thẻ, tên thẻ chuẩn hóa, chính văn được chuyển ra ngoài khối, chuỗi tư duy đi vào `reasoning`.
   - Văn bản swipe đồng bộ, nguyên văn có bản sao lưu, tệp trò chuyện trên đĩa cũng là phiên bản đã sửa.
   - Thanh trạng thái gắn vào tầng này, động cơ ghi sổ theo khối đã sửa (Điểm Hệ Thống 1300).
   - Bộ lắng nghe `MESSAGE_RECEIVED` của bộ bảo vệ được xếp ở vị trí đầu tiên.
2. **Công pháp (#3)**: Dòng `功法修炼: Lĩnh ngộ 《Thái Hư Kiếm Ý》[Tiên phẩm]` được viết lại thành `收录:Thái Hư Kiếm Ý[Tiên phẩm]`, trong kho công pháp thực sự xuất hiện 「Thái Hư Kiếm Ý」.
3. **Nhắc nhở định dạng**: Trong yêu cầu chính mỗi lượt đều mang theo một dòng nhắc nhở. Sau khi lượt trước vừa được sửa lỗi, lời nhắc sẽ ghi rõ vấn đề cụ thể (thiếu thẻ đóng, chính văn viết nhầm vào trong khối).
4. **Ghi bù (Backfill)**: Mô phỏng một lượt phản hồi chỉ có chính văn mà không có khối dữ liệu.
   - Cổng ghi bù chỉ được gọi 1 lần, khối dữ liệu được nối vào cuối tầng và ghi nhận `panelBackfill.via=auto`, động cơ ghi sổ theo khối ghi bù (1250).
   - Trong yêu cầu ghi bù có bản mẫu Sách Thế Giới (macro biến số đã được thay bằng giá trị thực), chính văn lượt này và đầu vào của người dùng.
5. **Bảo hiểm Thần phẩm (#1)**: Khi bản lưu cũ chỉ có tổng cộng 300 lượt rút tích lũy, thẻ hiển thị 「Còn 700 lượt tới bảo hiểm Thần phẩm」. Sau khi rút xong, `神品保底计数` được di chuyển từ số lượt rút tích lũy sang và tiếp tục tăng dần.
6. **Rút ≥10 lượt (#6)**:
   - Rút 20 lượt, lô phản hồi đầu tiên bị cắt cụt: các món hàng hoàn chỉnh được giữ lại, kích thước lô tự động thu nhỏ. Chia làm hai lần quyết toán 10 lượt, trừ phí đúng 200.000, mục chờ xử lý có 20 món.
   - Khi mô hình trả về sai phẩm giai, phân loại, đề tài, kết quả cuối cùng lấy theo ô cục bộ làm chuẩn.
   - Thất bại giữa chừng: 10 lượt đầu đã ghi sổ, 10 lượt còn lại không bị trừ phí và có thông báo rõ ràng.
   - Thất bại ngay từ đầu: không trừ điểm, bảo hiểm không đổi.
7. **Trang bị trượt lên trên (#5)**: Xác nhận trước rằng trang kiểm thử thực sự có thể bị cuộn bởi kịch bản.
   - Bấm 「Tạo mới」 trong Công xưởng ngoại quải, trang đứng yên.
   - Khi động cơ gọi `insertIntoChatInput`, nếu thiết bị đầu cuối đang mở thì chỉ ghi văn bản, không đặt tiêu điểm, không cuộn trang.
   - Khi thiết bị đầu cuối đang mở mà trang bị cuộn thì sẽ được đưa về vị trí cũ; khi thiết bị đầu cuối đóng lại thì bộ bảo vệ không can thiệp nữa.
8. **Lì xì (#2)**: Lì xì văn bản thuần kiểu cũ hiển thị nút 「Ghi bù」, sau khi bấm sẽ biến thành lì xì có thể giật (Đồng Tiền Cổ Thấm Máu ×3), nút biến mất, chỉ có thể ghi bù một lần.
9. Trong Cài đặt có phân vùng 「Bảo vệ định dạng khối dữ liệu」 (hộp chọn ghi bù, nút khôi phục); trong thông tin chẩn đoán có thống kê bộ bảo vệ, không chứa chính văn hay khóa bảo mật.
10. Nút 「Khôi phục lần tự động sửa gần nhất」 có thể khôi phục tầng về lại nguyên văn của AI; suốt quá trình không có pageerror.

## Chuyên đề ảnh đại diện điện thoại (12 hạng mục, `tests/native_v111_mobile.py`)

Dùng CDP `Emulation.setSafeAreaInsetsOverride` để mô phỏng thanh trạng thái / tai thỏ điện thoại. Đây là mô phỏng Chromium, **không phải máy thật**.

1. Màn hình dọc 360×780, thanh trạng thái 40px:
   - Thiết bị đầu cuối toàn màn hình, ảnh đại diện neo trong thanh tiêu đề: ảnh đại diện 45–89px, thanh tiêu đề 40–95px. Trước khi sửa, ảnh đại diện nằm ở 14–58px.
   - Ảnh đại diện căn giữa theo chiều dọc, nằm bên trái tiêu đề 「Thiết Bị Đầu Cuối Chư Thiên」; bấm vào tâm ảnh đại diện trúng ngay ảnh đại diện.
2. Bấm vào ảnh đại diện để vào trò chuyện riêng: ảnh đại diện xếp chồng lên ảnh đại diện của chính thanh tiêu đề trò chuyện riêng, nằm bên dưới thanh trạng thái và bấm trúng được. Sau khi quay lại thiết bị đầu cuối, ảnh đại diện trở về thanh tiêu đề thiết bị đầu cuối.
3. Chuyển sang cửa sổ nổi cảm ứng: cả cửa sổ nổi và ảnh đại diện đang neo đều nằm bên dưới thanh trạng thái. Trước khi sửa, đỉnh cửa sổ nổi nằm ở pixel thứ 9, lọt vào trong thanh trạng thái.
4. Khi không có thanh trạng thái (thẻ trình duyệt thông thường): ảnh đại diện vẫn căn giữa trong thanh tiêu đề như bình thường.
5. Màn hình ngang 780×360, tai thỏ trái phải mỗi bên 36px: ảnh đại diện nằm bên phải tai thỏ, bên trong thanh tiêu đề.
6. Cửa sổ máy tính: ảnh đại diện căn giữa trong thanh tiêu đề, chỉnh dịch lên trên khoảng 8px so với trước đây; không có pageerror.

## Những phần chưa kiểm thử

- **Mục #1 trong thẩm tra 「Sau khi Giữ lại toàn bộ cất vào túi đồ xong thì xóa mục chờ xử lý thất bại」**: Hiện tại chỉ còn duy nhất một lần ghi, trạng thái trung gian này không còn tồn tại nữa; đã xác minh bằng kiểm thử đơn vị và kịch bản máy chủ trả về lỗi 500, không mô phỏng trình duyệt bị sập giữa hai lần lưu.
- **Mô hình thực tế của mục #7 trong thẩm tra**: Mới chỉ xác minh bằng phản hồi mô phỏng cố định. Nếu thẻ nhân vật ghi nhận tài sản bằng phương thức ngoài khối dữ liệu (ví dụ kịch bản riêng của thẻ), phần đó không nằm trong phạm vi quay lui.
- **Mô hình thực tế**: Hiệu quả của việc ghi bù, việc lời nhắc định dạng có thực sự giảm lỗi hay không, và biểu hiện thực tế của việc thu nhỏ lô sau khi bị cắt cụt đều mới chỉ được xác minh bằng mô hình mô phỏng. Tính năng ghi bù được đánh dấu là Thử nghiệm.
- **Điện thoại vật lý**: Đợt này không có máy thật. Hiện tượng trang bị trượt lên mới chỉ xác minh trên Chromium máy tính với trang ép cuộn; vị trí ảnh đại diện mới chỉ xác minh bằng mô phỏng thanh trạng thái / tai thỏ của Chromium, chiều cao thanh trạng thái do các trình duyệt khác nhau (đặc biệt là chế độ toàn màn hình / tràn viền, Quark, Via, v.v.) báo cáo có thể khác nhau.
- **Thanh trạng thái MVU / thẻ nhân vật biến mất (#4)**: Do không có nguyên văn tầng lỗi nên chưa tái hiện được tranh chấp thứ tự giữa Tavern Helper / MVU và plugin. Các biện pháp giảm thiểu đã thực hiện: xếp bộ bảo vệ lên đầu tiên để sửa tầng trước, khối không có trường hợp lệ không bị coi là khối dữ liệu, khi thiếu khối sẽ ghi bù. Vẫn cần nguyên văn tầng của người dùng để xác nhận thêm.
- **Chế độ ghi bù `always` không được triển khai**, chỉ có 「Chỉ bổ sung khi bị thiếu」 và 「Tắt」.
- Tự động ghi bù chỉ xử lý phản hồi được tạo ra bình thường (`received`), không xử lý lời mở đầu, lệnh gạch chéo hay tầng do tiện ích mở rộng khác chèn vào; phía trước phải có tin nhắn người dùng và trong cuộc trò chuyện phải có sẵn sổ cái Chư Thiên.
- Bản lưu cũ trước khi rút thẻ lần đầu tiên, mục 「Tiến độ bảo hiểm Thần phẩm」 trong Sách Thế Giới sẽ hiển thị trống.
- Đường dẫn API chính không lấy được `finish_reason`, nên việc phát hiện cắt cụt chỉ có thể dựa vào văn bản.
- Chỉ chạy thực tế trên SillyTavern 1.19.0, chưa kiểm thử lại từng bản 1.16–1.18.
