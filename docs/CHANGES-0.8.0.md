# Bản ghi thay đổi 0.8.0: Thống nhất giao diện · Bong bóng Lilith · Lối vào Quản trị viên · Lối vào Ngoại quải tự tạo · Độ thuần thục có hiệu lực thực tế · Công pháp thẻ nhân vật

Cơ sở: 0.7.0 (GitHub `main`, commit `ed45c8d`).
Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.0](ACCEPTANCE-0.8.0.md).

## I. Các trang Lilith nguyên bản đi theo chủ đề thế giới (Thống nhất giao diện)

Vấn đề của bản 0.7.0: Sau khi chuyển sang chủ đề Tiên hiệp / Cyber / Quỷ dị, các trang thiết bị đầu cuối và động cơ thanh trạng thái đều đổi màu, nhưng các trang Lilith nguyên bản (Bàn làm việc, Ký ức, Quy tắc, Kết nối, Trạng thái), dòng trạng thái dưới cùng và bảng trò chuyện riêng vẫn giữ màu tím nguyên bản. Trong cùng một cửa sổ lại có hai bộ phối màu khác nhau.

- `styles/world.css` thêm mới cầu nối chủ đề: dưới các chủ đề khác mặc định, thẻ, nút bấm, nút chính, ô nhập liệu, nhãn, `details`, `pre`, nút gợi ý nhanh, dòng trạng thái dưới cùng, vùng tiêu đề cửa sổ, tiêu đề tranh đứng, bảng trò chuyện riêng (đầu trang, tin nhắn, vùng nhập liệu, nút gửi), cùng bong bóng thoại tranh đứng của các trang nguyên bản đều chuyển sang dùng chung bộ biến màu `--zt-*` của thiết bị đầu cuối.
- Chỉ đổi màu sắc, đường viền và phông chữ tiêu đề, không đổi kích thước, khoảng cách hay vị trí. Chủ đề mặc định giữ nguyên hoàn toàn màu tím nguyên bản (trong nghiệm thu đã đối chiếu màu sắc sau khi tính toán).
- Bộ chọn được giới hạn trong `.page:not(.zt-hub-page)`, nên các trang riêng của thiết bị đầu cuối không bị ảnh hưởng.

## II. Dòng Lilith ở đáy thanh trạng thái chuyển thành bong bóng thoại tranh đứng

- Trong thiết bị đầu cuối không còn hiển thị dòng 「◆ Lilith: ……」 ở dưới cùng thanh trạng thái nữa (`ENGINE_CSS` ẩn `.mvu-msg`). Chế độ tương thích cũ trong tầng không bị ảnh hưởng.
- Mục 「Thông báo hệ thống」 (`系统播报`) trong khối dữ liệu chuyển sang do bong bóng thoại trên tranh đứng nói ra: mỗi thông báo mới nói một lần, chuyển động và biểu cảm sử dụng `speak(zone)` nguyên bản. Khi thiết bị đầu cuối đang đóng sẽ ghi nhớ lại trước, lần mở tiếp theo sẽ nói ra. 6 câu thoại chờ nguyên bản (khi không có thông báo) sẽ không tự động bật lên.
- Bấm vào khoảng trống trên tranh đứng (không phải bộ phận cơ thể, cũng không phải vuốt ve hay nhấn giữ) sẽ nói một câu thoại theo cốt truyện. Lời thoại luân phiên theo thứ tự, nội dung lấy từ sổ cái: thông báo mới nhất, đột phá công pháp đang chờ phát báo, nhiệm vụ chưa hoàn thành và tiến độ, công pháp chủ tu còn cách giai đoạn tiếp theo bao nhiêu, thế giới hiện tại, độ hảo cảm và giá trị hắc hóa của đối tượng gắn kết, số dư Điểm Hệ Thống, và cuối cùng là câu thoại chờ nguyên bản. Bấm vào các bộ phận cơ thể vẫn giữ phản ứng nguyên bản.
- Khi cửa sổ quá nhỏ khiến tranh đứng bị ẩn đi (trên điện thoại), phát báo sẽ chuyển sang hiển thị bằng thanh thông báo ở đáy thiết bị đầu cuối.
- Có thể tắt trong Cài đặt → Lilith → 「Phát báo qua bong bóng」.

## III. Điểm Hệ Thống trên thanh đỉnh và trong Tổng quan cơ bản không khớp nhau (Đã sửa)

Nguyên nhân: Động cơ nguyên bản bên trong thiết bị đầu cuối khi tải sẽ điền con số dựa theo văn bản khối dữ liệu. Chỉ khi tầng gắn kết có khối dữ liệu và thực thi bắt dữ liệu nguyên bản thì nó mới đọc lại từ sổ cái một lần. Do đó, sau khi phát sinh các thao tác ghi bên ngoài tầng như điểm danh, nhóm chat, ngoại quải tự tạo, quản trị viên, chỉ có thanh đỉnh được làm mới, còn 「Tổng quan cơ bản」 vẫn hiển thị con số trong khối dữ liệu cũ. Khi trong cuộc trò chuyện chưa có khối dữ liệu AI nào, trang tổng quan sẽ luôn hiển thị số 0.

Cách sửa (`src/hub.js`):
- Sau khi động cơ điền dữ liệu lần đầu hoàn tất (`__ztDataReady`), và mỗi lần sổ cái thay đổi sau đó, đều dùng `applyVarsToDisplay` và `ztRefreshVisible` nguyên bản để đọc lại sổ cái vào trang hiện tại. Bản thân văn bản khối dữ liệu không bị sửa đổi.
- Khi đang mở hộp thoại bật lên hoặc đang gõ phím sẽ hoãn việc làm mới lại.

## IV. Đưa Bảng điều khiển Quản trị viên vào trong Cài đặt

- Cài đặt → Nâng cao · Quản trị viên → 「Bảng điều khiển Quản trị viên」: mở bảng quản trị viên nguyên bản, có thể sửa Điểm Hệ Thống, tài nguyên độc quyền, hảo cảm / hắc hóa / hối hận, công pháp chủ tu, tiền tệ và bậc thực lực, sau khi lưu sẽ ghi thực tế vào sổ cái.
- Lối vào cũ trong thiết bị đầu cuối (bấm liên tiếp 5 lần vào biểu tượng ◆ ở dưới cùng) được ẩn đi cùng với dòng Lilith, thuyết minh cũ 「bấm liên tiếp 5 lần vào ◆」 trên bảng cũng được ẩn đi.

## V. Ngoại quải tự tạo

Từ bản 0.5.0 đã có trình chỉnh sửa ngoại quải tự tạo (quy tắc, phẩm cấp, bị động / chủ động / số lần mỗi ngày, cái giá phải trả, hồi chiêu, tiêm lời nhắc, nhập/xuất), nhưng lối vào chỉ nằm trong thanh công cụ của trang 「Ngoại quải」 nên khó tìm thấy. Ở bản này:
- Nhóm điều hướng 「Năng lực」 thêm mới mục 「Tự tạo」 (di chuột lên hiển thị tên đầy đủ 「Ngoại quải tự tạo」), đi thẳng vào trang chỉnh sửa và quản lý.
- Thanh công cụ trang 「Ngoại quải」 thêm mới nút 「＋ Ngoại quải tự tạo」, bấm một cái sẽ mở ngay trình chỉnh sửa trống và đặt tiêu điểm sẵn vào ô tên.
- **Sửa lỗi**: Khi phát động ngoại quải tự tạo trừ Điểm Hệ Thống / tài nguyên độc quyền trước đây chưa ghi `界面记账时间`, khiến khối dữ liệu AI ở lượt tiếp theo có thể “hoàn trả” nhầm số điểm vừa trừ. Hiện tại cả hai loại chi phí đều đóng dấu thời gian đầy đủ (kiểm thử đơn vị + nghiệm thu trình duyệt).

## VI. Độ thuần thục không còn chỉ để trang trí (Mô-đun mới `src/skill-sync.js`)

1. **Lời nhắc hiệu quả thực tế của công pháp** (mặc định bật): Mỗi lượt đều báo cho AI biết hiệu quả nguyên bản ở giai đoạn hiện tại của từng môn công pháp trong kho công pháp, môn chủ tu xếp đầu tiên, tối đa 12 bộ. Các hiệu quả bao gồm: Thuần Thục giảm 30% tiêu hao; Tinh Thông tăng 100% uy lực; Tông Sư có áo nghĩa độc quyền; Nhập Đạo phát động tức thì không tiêu hao; Chưa Nhập Môn thi triển không ổn định. Đồng thời nêu rõ giai đoạn tiếp theo cần bao nhiêu độ thuần thục, và cách ghi dòng 「功法修炼」 (thường ngày 1–5, khổ luyện 5–20, chiến đấu sinh tử / đốn ngộ 20–100). Trước đây những hiệu quả này chỉ nằm trong gợi ý giao diện nên AI không nhìn thấy được.
2. **Tích lũy thực chiến** (mặc định bật): Sau khi tầng AI mới nhất được động cơ nguyên bản ghi sổ, nếu trong chính văn thực sự có thi triển một môn công pháp trong kho công pháp nhưng dòng 「功法修炼」 trong khối dữ liệu lại quên ghi, hệ thống sẽ tự động ghi bù một lượng nhỏ độ thuần thục theo phẩm giai.
   - Phàm phẩm +3, Linh phẩm +2, Tiên phẩm / Thần phẩm +1, mỗi tầng tối đa 2 bộ, không vượt quá giới hạn trần của phẩm giai đó.
   - Khi thăng giai sẽ được đưa vào mục 「Đột phá chờ phát báo」 (`功法待播报`) nguyên bản để AI phát báo và kết toán bằng `结算:`, giống hệt như đột phá thông thường. Thiết bị đầu cuối sẽ phát trình diễn 「Đột phá」.
   - Chứng từ được ghi trong `功法记录` (đây là trường thuộc bản chụp nhanh). Khi lật trang swipe hoặc tạo lại phản hồi, bản gốc khôi phục bản chụp nhanh của tầng nên phần ghi bù cũng tự động được hoàn tác cùng phản hồi cũ; cùng một tầng kết xuất lại sẽ không bị ghi bù lặp.
3. **Trang hiệu quả giai đoạn**: Thanh công cụ trang 「Tu hành」 hiển thị giai đoạn của công pháp chủ tu, còn thiếu bao nhiêu để lên giai đoạn tiếp theo, lần tích lũy thực chiến gần nhất, cùng lối vào trang 「Hiệu quả giai đoạn & Nguồn gốc ›」. Trang này liệt kê hiệu quả đang có hiệu lực và hiệu quả giai đoạn tiếp theo của từng môn công pháp, quy tắc giai đoạn và giới hạn phẩm giai nguyên bản, cùng lịch sử tích lũy thực chiến.

## VII. Đọc biến số công pháp từ các thẻ nhân vật khác nhau

- Các nguồn đọc:
  - Các biến khác của cuộc trò chuyện hiện tại (do kịch bản khác hoặc thẻ nhân vật ghi, bỏ qua `诸天系统` và trợ lý ký ức);
  - `stat_data` MVU của tầng mới nhất trong 30 tầng gần đây;
  - Biến Tavern Helper của thẻ nhân vật.
- Tìm các khóa có tên chứa 功法 / 技能 / 武技 / 武学 / 法术 / 神通 / 秘籍 / 招式 / 心法 / 绝学 / skills / abilities, đi sâu tối đa 6 tầng.
- Hỗ trợ các cách viết:
  - Mảng và đối tượng;
  - Cặp `[giá trị, thuyết minh]` của MVU;
  - Chuỗi dạng 「Tên〔Nhập Môn〕」;
  - Các trường Độ thuần thục / Cảnh giới / Phẩm giai / Mô tả (bao gồm cả các tên tiếng Anh phổ biến).
  - Các từ chỉ cảnh giới sẽ được quy đổi thành ngưỡng tương ứng, ví dụ Nhập Môn 100, Tiểu Thành 500, Đại Thành 2000.
- Trang 「Tu hành · Độ thuần thục」 sẽ liệt kê các công pháp tìm thấy cùng đường dẫn nguồn của chúng, sau khi bấm 「Nhập / Đồng bộ vào kho công pháp」:
  - Công pháp mới sẽ được thu lục; khi không ghi phẩm giai sẽ lấy phẩm giai thấp nhất đủ sức chứa độ thuần thục đó;
  - Độ thuần thục và phẩm giai của công pháp đã có chỉ tăng không giảm;
  - Bản chụp nhanh của toàn bộ các tầng đều được nâng lên đồng bộ, nên khi đổi swipe công pháp đã nhập sẽ không bị mất;
  - Mỗi lần nhập đều được ghi vào `功法记录` và `诸天系统.角色卡功法同步` (thời gian, nguồn, số bộ, số mục thay đổi).
- Không ghi đè biến số của chính thẻ nhân vật. Trong Cài đặt có thể bật 「Tự động đồng bộ」 (mặc định tắt).

## VIII. Các vấn đề khác đã tìm thấy và sửa chữa

- **Động cơ có thể bị tải lại khi hộp thoại bật lên đang mở**: `engineBusy` và phán đoán phím Esc trước đây dùng `.overlay.show`, trong khi các hộp thoại Quản trị viên, Rút thẻ, Chi tiết vật phẩm nguyên bản đều hiển thị bằng cách gỡ bỏ thuộc tính `[hidden]`, nên không bao giờ khớp được. Kết quả là khi hộp thoại đang mở, hễ có tầng mới hoặc sổ cái thay đổi là động cơ có thể bị dựng lại, làm hộp thoại biến mất ngay lập tức. Hiện đã đổi sang phán đoán theo `[id$="-overlay"]:not([hidden])`, bao gồm cả trường hợp đang nhập trong ô số hoặc hộp chọn thả xuống.
- Mục 「Giữ lại khối dữ liệu của mấy tầng mới nhất」 trong Cài đặt đã được bổ sung thuyết minh: mỗi lượt AI đều đọc được sổ cái mới nhất từ mục 「Dữ liệu thời gian thực」 trong Sách Thế Giới, nên có thể đặt là 0.

## Các trường sổ cái thêm mới / sửa đổi

| Trường | Thuyết minh |
|---|---|
| `诸天系统.功法记录[].凭据` / `.楼层` | Chứng từ tích lũy thực chiến (`tầng:mã băm bảng`), chỉ xuất hiện ở các mục tích lũy thực chiến |
| `诸天系统.角色卡功法同步` | `{时间, 来源, 部数, 变化, 自动}` |
| `诸天系统.功法库[].来源 = '角色卡'` | Công pháp được nhập từ thẻ nhân vật |
| Không gian tên lời nhắc `zhutian-covenant-terminal/mastery` | Lời nhắc hiệu quả thực tế của công pháp |
| Cài đặt tiện ích mở rộng `skills`, `lilith.story` | Công tắc mới |
