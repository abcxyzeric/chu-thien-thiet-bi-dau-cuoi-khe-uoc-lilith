# Bản ghi thay đổi 0.7.0: Chủ đề thế giới · Nhân vật giao diện Lilith · Đồ phổ · Hiệu ứng trình diễn

Cơ sở: Bản 0.6.0 cục bộ.
Mục tiêu: Thiết bị đầu cuối không còn chỉ là một bảng dữ liệu màu tím đơn điệu nữa. Giờ đây nó sẽ đổi chủ đề theo thế giới hiện tại; Lilith sẽ phản ứng lại những thứ bạn chọn và kết quả quyết toán; nhiệm vụ, gắn kết, các thế giới đã đi qua và năng lực đều có thể xem dưới dạng đồ phổ; các kết quả quan trọng sẽ phát một đoạn trình diễn ngắn. **Tất cả những tính năng này đều chỉ đọc sổ cái, và hiệu ứng trình diễn cũng chỉ phát sau khi sổ cái đã được ghi và đọc lại xác nhận.**

Kết quả nghiệm thu xem tại [ACCEPTANCE-0.7.0](ACCEPTANCE-0.7.0.md).

![Trình diễn quyết toán nhiệm vụ (Chủ đề Tiên hiệp)](evidence/w070-fx-task.png)

## I. Chủ đề thế giới

| Chủ đề | Kích hoạt (Tự động phán đoán) | Giao diện |
|---|---|---|
| Chư Thiên (Mặc định) | Khi không phán đoán ra được | Phối màu của bản 0.6.0, sắp xếp lại tầng bậc rõ ràng hơn |
| Tiên hiệp | Loại: Tu tiên, Tiên hiệp, Huyền huyễn, Võ hiệp, Hồng Hoang…; Tên thế giới: Tiên, Tông, Côn Luân, Thái Sơ…; Tiền tệ: Linh thạch, Tiên tinh… | Bảng màu thẻ ngọc, bản đồ sao, hoa văn trận pháp mờ ở nền thiết bị đầu cuối |
| Cyber | Loại: Cyber, Khoa học viễn tưởng, Tinh tế, Cơ giáp, Phế thổ…; Tên thế giới: Night City, 2077, Neon…; Tiền tệ: Điểm tín dụng… | Thiết bị đầu cuối toàn ảnh (Hologram): tông màu lạnh, lưới đường quét |
| Quỷ dị | Loại: Quỷ dị, Quái đàm, Cthulhu, Kinh dị, Linh dị…; Tên thế giới: Sương mù, Huyết nguyệt, Quản thúc…; Tiền tệ: Tiền âm phủ, Lý trí… | Cảm giác dị thường tiết chế: viền đỏ sẫm, bốn góc tối ăn mòn chậm rãi; chỉ có tên thế giới trên thanh đỉnh cứ 11 giây lệch nhịp một chút (khoảng 0.3 giây), không nhấp nháy toàn màn hình |

- Thứ tự phán đoán: `世界类型` (Loại thế giới) → Tên `当前世界` (Thế giới hiện tại) → Tiền tệ thế giới hiện tại. Khi xuyên không sang thế giới mới, `世界类型` cũ sẽ không bị mang theo sang thế giới mới (loại cũ chỉ được tin dùng khi tên thế giới không đổi).
- Cài đặt → Thế giới & Trình diễn → 「Chủ đề giao diện」 có thể cố định một chủ đề cụ thể, hoặc chọn 「Theo thế giới hiện tại」.
- Chủ đề **chỉ đổi màu sắc và họa tiết trang trí**, vị trí của toàn bộ nút bấm, điều hướng và ô nhập liệu dưới các chủ đề hoàn toàn giống hệt nhau (trong nghiệm thu đã đối chiếu tọa độ từng phần tử). Lớp trang trí có `pointer-events:none` nên không chặn thao tác bấm.
- Động cơ thanh trạng thái nguyên bản (8 trang bên trong thiết bị đầu cuối) cũng đổi màu theo: chỉ sửa các biến CSS vốn có của nó, không sửa bố cục.
- Hiệu ứng chuyển động trang trí đều rất chậm (hoa văn trận pháp 120 giây xoay một vòng, đường quét 7 giây chạy một lượt). Khi hệ thống bật tùy chọn 「Giảm chuyển động」 thì toàn bộ đứng yên.
- Bên cạnh mục 「Thế giới hiện tại」 trên thanh đỉnh hiển thị huy hiệu chủ đề (Thẻ ngọc / Toàn ảnh / Dị thường), bấm vào sẽ mở Bản đồ sao.
- **Trường sổ cái mới**: `诸天系统.世界类型` (chuỗi) và `诸天系统.万界足迹` (mảng, mỗi phần tử gồm `{名称, 类型, 主题, 首次, 首次楼层, 次数, 最近, 最近楼层}`). Khi thế giới hiện tại thay đổi sẽ tự động ghi một mục dấu chân, đi qua cơ chế ghi có khóa và đọc lại xác nhận của bản 0.6.0.
- 「Nhắc AI ghi nhận xuyên không」 (mặc định bật): tiêm một lời nhắc hệ thống để khi xuyên không mô hình ghi `当前世界` và `世界类型` vào mục 「变量更新」 nguyên bản. **Mới chỉ xác minh bằng mô hình mô phỏng, việc mô hình thực tế có tuân thủ hay không chưa được xác minh.**

## II. Lilith với tư cách là nhân vật giao diện

Chỉ sử dụng tranh đứng nguyên bản, chuyển động phân lớp nguyên bản (`rig`) và 8 biến thể biểu cảm sẵn có, **không thêm chuyển động mới, cũng không ngụy trang thành Live2D**.

- **Phản ứng** (có thể tắt trong cài đặt):
  - Khi chọn một nút trong Dòng sự kiện / Đồ phổ gắn kết / Bản đồ sao / Cây năng lực, hoặc bấm vào một bản ghi ở các trang Nhiệm vụ, Túi đồ, Tu hành nguyên bản, Lilith sẽ đổi biểu cảm và nói một câu mang dữ liệu sổ cái, ví dụ: 「Bái nhập Thanh Vân Môn」, đang tiến hành. Tiến độ 40%.
  - Hoàn thành nhiệm vụ, đột phá, khế ước, rút thẻ, nhập kho, nhiệm vụ thất bại: mỗi sự kiện đều có biểu cảm tương ứng (thất bại là sad).
  - Khi bước vào trang hệ thống sẽ nói một câu gợi ý ngắn gọn (mỗi trang một lần trong mỗi phiên làm việc, có thể tắt). Những câu gợi ý này không chiếm hạn mức tần suất phản ứng, nên không chặn mất phản ứng khi bạn bấm ngay sau đó.
- **Góc máy** (có thể tắt trong cài đặt):
  - Trang hệ thống: Bán thân;
  - Bàn làm việc Lilith: Toàn thân;
  - Trò chuyện riêng: vùng ảnh đại diện góc trên bên trái đổi thành dải cận cảnh khuôn mặt;
  - Gợi ý cốt truyện (thẻ kết quả khi thiết bị đầu cuối đang đóng): Ảnh bán thân (bust).
  - Toàn bộ đều cắt theo tọa độ điểm ảnh của ảnh gốc, không thu phóng làm biến dạng.

## III. Đồ phổ (Thanh điều hướng thêm mới nhóm 「Đồ phổ」)

Bốn trang, **mỗi nút trên đồ phổ đều tương ứng với một bản ghi thực tế trong sổ cái**. Sau khi bấm chuột hoặc dùng phím Tab / phím mũi tên + Enter để chọn, khung bên phải sẽ hiển thị các trường gốc và đường dẫn sổ cái của bản ghi đó (như `诸天系统.任务库.T2`), cùng các liên kết chuyển nhanh.

| Trang | Nguồn dữ liệu | Chuyển hướng |
|---|---|---|
| Dòng sự kiện | `任务库`, `任务结算凭据`; `来源` / `依据` của nhiệm vụ nối thành Nguyên nhân → Nhiệm vụ → Chứng từ quyết toán / Thất bại / Phần thưởng | 「Định vị ở trang Nhiệm vụ」 mở trang Nhiệm vụ nguyên bản và chọn đúng dòng đó; 「Định vị tầng」 cuộn tới tầng trò chuyện tương ứng |
| Đồ phổ gắn kết | `恋爱目标`, `聊天群.成员`, `打手`, Lilith nằm ở trung tâm | Thành viên nhóm → Trang Thành viên của Nhóm chat |
| Bản đồ sao | `万界足迹` (sắp xếp theo lần đầu đặt chân tới), Thế giới hiện tại | 「Ghi nhận xuyên không」 có thể khóa thủ công một thế giới mới (ghi và đọc lại, sẽ phát trình diễn xuyên không) |
| Cây năng lực | `宿主实力档`, `功法库`, `神通记录`, Ngoại quải (6 ngoại quải nguyên bản + trạng thái bật của ngoại quải tự tạo) | Công pháp → Trang Tu hành; Ngoại quải → Quản lý ngoại quải |

- Ở góc trên bên phải của các trang Tổng quan / Gắn kết / Nhiệm vụ / Tu hành trong động cơ nguyên bản có thêm liên kết 「Xem Bản đồ sao / Đồ phổ gắn kết / Dòng sự kiện / Cây năng lực」, hỗ trợ chuyển hướng hai chiều.
- Trên điện thoại, đồ phổ có thể kéo qua lại trái phải, không làm chữ bị thu nhỏ tới mức không đọc được.

## IV. Hiệu ứng trình diễn

| Trình diễn | Kích hoạt (Thay đổi đọc lại được từ sổ cái) |
|---|---|
| Xuyên không | `当前世界` thay đổi |
| Đột phá | `功法待播报` có thêm mục mới, hoặc `宿主实力档` tăng lên |
| Khế ước | `恋爱目标` khóa đối tượng mới, hoặc có thành viên mới vào nhóm chat |
| Hoàn thành nhiệm vụ / Nhiệm vụ thất bại | Có `任务结算凭据` mới, hoặc trạng thái nhiệm vụ đổi thành Đã hoàn thành / Đã thất bại |
| Rút thẻ | `累计抽数` tăng lên (phẩm cấp cao nhất lấy từ `神品次数` / `仙品次数`) |
| Phần thưởng nhập kho | Số lượng vật phẩm trong túi đồ tăng lên |

- **Chỉ phát sau khi sổ cái đã lưu và đọc lại xác nhận**: so sánh hai bản sổ cái đọc lại trước và sau khi lưu, không nhìn vào văn bản của mô hình. Trước khi phát còn đối chiếu lại sổ cái hiện tại thêm một lần nữa; những mục đã bị quay lui (ví dụ bạn xóa tầng, chuyển nhánh) sẽ không phát trình diễn và được đánh dấu trong lịch sử là 「Chưa ghi sổ」.
- Mỗi đoạn dài 1.4–2.1 giây, bấm chuột, nhấn Esc hoặc Enter đều có thể bỏ qua; sau khi bỏ qua, tiêu điểm quay về vị trí ban đầu.
- Sau khi kết thúc luôn để lại một thẻ kết quả: chuyện gì vừa xảy ra, số lượng / vật phẩm, và dòng 「✓ Sổ cái đã xác nhận」; nút 「Xem bản ghi」 trên thẻ nhảy tới nút đồ phổ hoặc phân trang tương ứng.
- Khi thiết bị đầu cuối đang không mở, sẽ không bật trình diễn toàn màn hình mà hiện một thẻ gợi ý cốt truyện có ảnh bán thân của Lilith ở cạnh khung trò chuyện; khi mở thiết bị đầu cuối sẽ tự động thu gọn lại.
- Cài đặt → Trình diễn: Trình diễn đầy đủ / Chỉ hiển thị thẻ kết quả / Tắt. Khi hệ thống bật 「Giảm chuyển động」 sẽ tự động chỉ hiển thị thẻ. Khi tắt vẫn lưu lại bản ghi trong mục 「Trình diễn trong phiên này」.
- Nút 「Xem trước trình diễn」 có thể xem thử hiệu ứng mà không ghi sổ cái, trên thẻ sẽ ghi rõ “Xem trước”.
- Sau khi giật lì xì hoặc nhận quà tặng trong nhóm chat được ghi sổ cũng sẽ hiển thị cùng thẻ kết quả này.

## V. Bố cục & Dọn dẹp

- Kiểu dáng thiết bị đầu cuối được quy hoạch thành các biến CSS; chủ đề, bố cục, đồ phổ và trình diễn mỗi phần có một tệp CSS riêng (`world.css` / `atlas.css` / `fx.css`), tệp chủ đề không chạm tới quy tắc bố cục.
- Điều chỉnh lại tầng bậc và khoảng cách của thanh đỉnh, thanh điều hướng và thẻ; huy hiệu chủ đề trên thanh đỉnh điện thoại không còn đè lên chữ 「Điểm Hệ Thống」.
- **Xử lý chế độ tương thích của thanh trạng thái**:
  - Trong Cài đặt không còn cung cấp tùy chọn 「Thanh trạng thái nguyên bản trong tầng (Chế độ tương thích cũ)」 cũng như hai mục chỉ có hiệu lực với nó là 「Hiển thị rút gọn tầng cũ」 và 「Độ sâu tối đa của thanh trạng thái」.
  - Các bản lưu đang dùng chế độ tương thích cũ khi nâng cấp sẽ được **tự động di chuyển một lần** sang chế độ thiết bị đầu cuối (đánh dấu `migrated070`, chỉ di chuyển một lần).
  - Mã nguồn của chế độ cũ vẫn được giữ lại (các bộ kiểm thử hồi quy như `native_replace040.py` vẫn dùng tới nó), bảng chẩn đoán hiển thị theo chế độ thiết bị đầu cuối.
- Khi nhảy từ thiết bị đầu cuối tới tầng trò chuyện, tầng đó sẽ sáng viền nổi bật trong chốc lát (`styles/host.css`).

## Các tệp thay đổi

Thêm mới:
- `src/world.js`: Phán đoán chủ đề, Dấu chân Vạn Giới, lời nhắc xuyên không.
- `src/lilith-stage.js`: Phản ứng, lời thoại và góc máy của Lilith.
- `src/hub-atlas.js`: Bốn trang đồ phổ.
- `src/fx.js`: Phát hiện khác biệt sổ cái, đối chiếu đọc lại, trình diễn và thẻ kết quả.
- `styles/world.css`, `styles/atlas.css`, `styles/fx.css`.
- `tests/v070.test.js` (thuần logic, 15 hạng mục), `tests/native_world070.py` (trình duyệt máy chủ thực tế), `tests/qa/seed070.js` (sổ cái kiểm thử cô lập dùng để chụp ảnh màn hình).
- `docs/CHANGES-0.7.0.md`, `docs/ACCEPTANCE-0.7.0.md`, `docs/evidence/w070-*.png`.
