# Thay đổi 0.8.2

Bản 0.8.2 xử lý bốn vấn đề do người dùng phản hồi và hợp nhất 「Nhóm tối ưu hóa thứ nhất」:

- Sau khi tắt plugin, trên thẻ nhân vật vẫn còn gắn Sách Thế Giới Chư Thiên;
- Trên điện thoại không nhìn thấy tranh đứng của Lilith;
- Khi tranh đứng không hiển thị trên điện thoại thì lời thoại cũng không nhìn thấy;
- Sau khi bật plugin, thanh trạng thái riêng của thẻ nhân vật hiển thị rất chậm hoặc thậm chí không hiển thị;
- Nhóm tối ưu hóa thứ nhất: vật phẩm trong túi đồ mang theo lai lịch, giới hạn tần suất tán gẫu tự động, cân bằng kinh tế cho lì xì và mở rộng nhóm.

Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.2](ACCEPTANCE-0.8.2.md).

**Nội dung Sách Thế Giới không thay đổi**, bản plugin vẫn gồm 36 mục từ của bản 0.8.1, không cần nhập lại hay cập nhật.

## I. Gỡ gắn kết Sách Thế Giới

### Gỡ gắn kết 1 chạm

Vị trí: Thiết bị đầu cuối → Cài đặt → Cài đặt / Gắn kết Sách Thế Giới → 「Gỡ gắn kết Sách Thế Giới 1 chạm」, sẽ bật hộp thoại xác nhận trước.

Sách Thế Giới Chư Thiên có thể đang được gắn ở bốn nơi, nút này sẽ tháo toàn bộ ra:

| Vị trí | Nơi lưu trong SillyTavern | Phương thức gỡ gắn kết |
|---|---|---|
| Sách Thế Giới chính của thẻ nhân vật | Tệp thẻ nhân vật `data.extensions.world` | Hàm `writeExtensionField` của chính SillyTavern, ghi ngược về tệp thẻ nhân vật |
| Sách Thế Giới phụ của thẻ nhân vật | `world_info.charLore[].extraBooks` | Gỡ khỏi danh sách và lưu cùng cài đặt |
| Sách Thế Giới toàn cục | `selected_world_info` | Hàm `onWorldInfoChange` của chính SillyTavern |
| Cuộc trò chuyện hiện tại | `chat_metadata.world_info` (tự động gắn kết của plugin ghi tại đây) | Xóa xong lưu lại siêu dữ liệu trò chuyện |

Một vài lưu ý:

- Các gắn kết trong những cuộc trò chuyện khác sẽ không bị chạm tới, chúng chỉ có hiệu lực bên trong các cuộc trò chuyện Chư Thiên đó.
- **Bản thân Sách Thế Giới không bị xóa**, chỉ gỡ bỏ gắn kết. Các Sách Thế Giới khác hoàn toàn không bị động chạm.
- Sau khi gỡ gắn kết, tính năng 「Tự động gắn kết」 cũng sẽ được tắt đi cùng lúc để tránh tự động gắn lại ở tin nhắn tiếp theo.
- Mỗi lần gỡ gắn kết đều được ghi lại trong cài đặt, tại cùng vị trí đó sẽ xuất hiện nút 「Khôi phục gắn kết」 giúp đưa **những gắn kết vừa tháo ra trong lần này** trở về nguyên trạng.
  - Nếu thẻ nhân vật đã bị xóa, hoặc trong thời gian đó bạn đã đổi sang Sách Thế Giới khác cho thẻ, khi khôi phục sẽ bỏ qua thẻ đó và báo rõ đã bỏ qua mấy nơi.

### Tự động gỡ gắn kết khi tắt plugin

- Khi tắt plugin này (hoặc xóa plugin này) trong danh sách tiện ích mở rộng, hệ thống sẽ tự động thực thi việc gỡ gắn kết nêu trên.
- Công tắc: Cài đặt → 「Tự động gỡ gắn kết Sách Thế Giới khi tắt plugin」, mặc định bật.
- Tính năng này dựa vào hook tiện ích mở rộng `manifest.hooks.disable` của SillyTavern (**có từ bản 1.17 trở đi**; trên bản 1.16 vui lòng bấm 「Gỡ gắn kết 1 chạm」 thủ công).
- SillyTavern đợi hook này tối đa 5 giây, plugin giới hạn việc gỡ gắn kết hoàn tất trong vòng 4.5 giây.
- Lần tới khi bật lại plugin, hệ thống sẽ thông báo một lần những nơi đã được gỡ gắn kết cùng vị trí của nút khôi phục.

## II. Lilith nổi (Điện thoại)

Dưới bố cục điện thoại, cửa sổ thiết bị đầu cuối không đủ chỗ đặt tranh đứng nên trước đây người dùng điện thoại hoàn toàn không nhìn thấy Lilith. Giờ đây nút đánh thức ở góc dưới bên trái được đổi thành **chính Lilith** (tranh đứng biểu cảm cắt thành thẻ nhỏ), tệp mới là `src/lilith-float.js`.

| Thao tác | Hiệu quả |
|---|---|
| Bấm 1 lần | Mở Thiết Bị Đầu Cuối Chư Thiên. Khi thiết bị đầu cuối đang mở, cô ấy sẽ nói một câu thoại theo cốt truyện |
| Nhấn đúp | Chọc cô ấy, cô ấy sẽ đổi biểu cảm để đáp lại |
| Nhấn giữ khoảng 0.4 giây rồi kéo | Nhấc lên để di chuyển (điện thoại sẽ rung nhẹ một cái) |
| Kéo tới mép trái / phải màn hình rồi thả tay | Phát hoạt ảnh ẩn nấp, rụt vào trong mép, chỉ để lộ một góc và đứng yên ở đó |
| Bấm vào góc lộ ra | Cô ấy bước ra |
| Vị trí | Tự động ghi nhớ, giữ nguyên sau khi làm mới trang |

- Vuốt nhanh mà không nhấn giữ sẽ không làm kéo cô ấy đi, nhờ đó không bị xung đột với thao tác lật trang hay cuộn trang.
- Khi mở thiết bị đầu cuối, cô ấy sẽ tạm thời lùi về mép gần nhất để không che khuất thiết bị đầu cuối; sau khi đóng thiết bị đầu cuối sẽ quay về vị trí cũ.

Cài đặt → 「Lilith nổi」 có ba tùy chọn:

- **Tự động** (mặc định): bật trên màn hình cảm ứng hoặc màn hình hẹp (≤720px), trên máy tính vẫn là nút đánh thức nguyên bản.
- **Luôn bật**.
- **Tắt**.

## III. Khi không nhìn thấy tranh đứng, lời thoại vẫn bật lên bình thường

Trong các trường hợp dưới đây, phản ứng của Lilith và thông báo hệ thống đều sẽ bật lên trong **bong bóng thoại bên cạnh Lilith nổi**:

- Bố cục điện thoại;
- Cửa sổ quá nhỏ khiến tranh đứng bị ẩn đi;
- Thiết bị đầu cuối đang đóng.

Ngay cả khi cô ấy đang nấp ở mép màn hình, lúc nói chuyện cô ấy cũng sẽ ló ra, nói xong lại rụt vào.

## IV. Thanh trạng thái riêng của thẻ nhân vật không hiển thị / hiển thị rất chậm (Lỗi, đã sửa)

**Đây là lỗi (bug), không phải vấn đề hiệu năng.**

### Nguyên nhân

Khi Tavern Helper kết xuất thanh trạng thái giao diện của thẻ nhân vật, nó sẽ bọc mỗi khối mã HTML trong tầng vào một `div.TH-render` và gắn một iframe bên trong. Nó chỉ gắn **đúng một lần** trong sự kiện kết xuất tầng.

Để hiển thị khung thoại Lilith, khối dữ liệu Chư Thiên và thay thế macro, plugin sẽ dựng lại `.mes_text` của tầng đó. Trước đây plugin dùng cách thay thế toàn khối (`replaceChildren`), vô tình xóa mất luôn iframe mà Tavern Helper vừa gắn vào.

### Cách sửa (`src/statusbar-host.js`)

- Khi dựng lại tầng, tìm lại khối bao bọc `div.TH-render` và iframe bên trong dựa theo nội dung mã nguồn rồi giữ nguyên tại chỗ: cùng một nút DOM, không tải lại, trạng thái kịch bản bên trong thanh trạng thái cũng không bị mất.
- Plugin chỉ thay thế những phần do chính nó phụ trách.
- Khi văn bản đã bị macro sửa đổi, thực hiện khớp thêm một lần nữa theo tiêu chí 「là mã giao diện frontend」.
- Thanh trạng thái nằm lồng bên trong khối thu gọn hoặc khối trích dẫn cũng được giữ nguyên.
- Khi macro của Tavern Helper đã bật, plugin không xử lý lặp lại các macro dạng `{{get_chat_variable::…}}` nữa, tránh việc cùng một tầng bị sửa hai lần.

### Kiểm thử thực tế (1.19 + Tavern Helper 4.11.2, 13 tầng, 12 thanh trạng thái thẻ nhân vật)

| | Trước khi sửa | Sau khi sửa |
|---|---|---|
| Tắt plugin | Kết xuất 12/12 | Kết xuất 12/12 |
| Bật plugin | **0/12** | **12/12**, xuất hiện toàn bộ trong vòng 0.8 giây |

## V. Nhóm tối ưu hóa thứ nhất

### Lưu lai lịch vật phẩm ngay trên vật phẩm trong túi đồ

- Các vật phẩm nhận được từ giật lì xì, nhận quà tặng, mua ở chợ nhóm sẽ có `背包[].来源` được ghi thành `聊天群·Tên@Thế giới·红包 / 赠礼 / 集市购买`.
- Mục 「Vật phẩm Ký chủ nhận được từ nhóm chat」 trong lời nhắc cốt truyện chuyển sang đọc trực tiếp từ **túi đồ**: chỉ cần vật phẩm vẫn còn trong túi, bất kể nhận được từ bao lâu trước đó, lai lịch của nó đều sẽ được báo cho mô hình chính văn biết (tối đa 12 món).
- Các khoản thu thuộc nhóm Điểm Hệ Thống (điểm lì xì, điểm danh) không đi vào túi đồ nên vẫn lấy 4 bản ghi nhập kho gần nhất.

### Giới hạn tần suất tán gẫu tự động

- Trước đây sau khi bật 「Tự động tán gẫu」, **mỗi lần** có phản hồi chính văn đều khiến thành viên nhóm tán gẫu một lượt, tức mỗi tin nhắn đều phát sinh thêm một yêu cầu mô hình.
- Hiện đổi thành cứ mỗi N lần phản hồi chính văn mới tán gẫu một lần:
  - Cài đặt mới `聊天群.设置.闲聊间隔`, mặc định là 3;
  - Có thể chọn 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10;
  - Vị trí: Nhóm chat → Cài đặt nhóm;
  - Bộ đếm nằm tại `聊天群.节奏.闲聊`.

### Cân bằng kinh tế

| Hạng mục | 0.8.1 | 0.8.2 |
|---|---|---|
| Giới hạn tổng điểm lì xì của thành viên | min(giá bậc thực lực, giới hạn cấp độ thương thành) | Thêm một điều kiện: **không vượt quá phí vào nhóm của thành viên đó** (ít nhất là 100). Ký chủ chỉ giật một phần trong đó |
| Mở rộng nhóm +5 người | Sức chứa hiện tại × 2.000 (5 → 10 người: 10.000) | Sức chứa hiện tại × 1.000 (5 → 10 người: 5.000), cân xứng với đường cong phí vào nhóm khởi điểm từ 300 |

## Các trường & cài đặt thêm mới / sửa đổi

| Tên | Thuyết minh |
|---|---|
| Cài đặt tiện ích mở rộng `wbUnbindOnDisable` | Tự động gỡ gắn kết khi tắt plugin, mặc định `true` |
| Cài đặt tiện ích mở rộng `wbUnbound` | Bản ghi gỡ gắn kết gần nhất `{name, chars[], extra[], global, chat, count, auto, noticed}`, dùng cho nút 「Khôi phục gắn kết」 |
| Cài đặt tiện ích mở rộng `floatLilith` | `auto` / `on` / `off` |
| Cài đặt tiện ích mở rộng `floatPos` | `{x, y, edge, tucked}`, vị trí của Lilith nổi |
| `诸天系统.聊天群.设置.闲聊间隔` | Khoảng cách tán gẫu tự động, mặc định 3 |
| `诸天系统.聊天群.节奏.闲聊` | Số lần phản hồi chính văn kể từ lần tán gẫu tự động trước |
| `诸天系统.背包[].来源` | Vật phẩm nhóm chat có dạng `聊天群·Nguồn·Phương thức` |
