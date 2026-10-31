# Thay đổi 0.8.1 (Bản sửa lỗi)

Bản 0.8.1 giải quyết những vấn đề thực tế mà người dùng gặp phải ở bản 0.7 / 0.8: Lilith không kết nối được API độc lập, chiêu mộ trong nhóm chat ngẫu nhiên giả và định giá quá cao, thành viên nhóm phát lì xì quá dày, chính văn không biết những chuyện đã xảy ra trong nhóm chat. Ngoài ra Sách Thế Giới do plugin cài đặt được nâng cấp lên 「Bản Plugin」, hỗ trợ cập nhật sách cũ chỉ bằng một chạm. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.8.1](ACCEPTANCE-0.8.1.md).

## I. Nút 「Lấy mô hình」 ở trang Kết nối của Lilith luôn báo lỗi CORS (Đã sửa)

Triệu chứng: Vào Lilith → Kết nối → Lấy mô hình, bất kể địa chỉ đúng hay sai đều hiển thị lỗi yêu cầu mạng trình duyệt thất bại (có thể do CORS, mạng hoặc địa chỉ cổng kết nối), bên dưới là `Yêu cầu lần này: GET https://…/v1/models`.

Có hai nguyên nhân:
1. Nút lấy mô hình ở trang kết nối nguyên bản gọi `root.fetch(…/models)`, trong đó `root` là `globalThis` riêng tư của kịch bản nguyên bản. Khi plugin cung cấp phạm vi riêng tư cho bản gốc, chỉ thay thế `fetch` ở cấp mô-đun mà chưa gắn `fetch` lên `globalThis` riêng tư, khiến dòng này **ném trực tiếp lỗi TypeError** mà chưa hề gửi yêu cầu đi, và bản gốc đã coi đó là lỗi mạng rồi hiển thị thành 「CORS」.
2. Khi trình duyệt thực sự bị CORS chặn lại, plugin chuyển sang đi qua máy chủ của chính SillyTavern để chuyển tiếp, nhưng trước khi chuyển tiếp lại cắt mất `/v1` trong địa chỉ, khiến máy chủ SillyTavern gửi yêu cầu tới `https://tên-miền/models` và bị nhiều trạm trung chuyển trả về lỗi 404.

Cách sửa:
- Gắn cùng hàm `fetch` có hỗ trợ chuyển tiếp lên cả `globalThis` riêng tư (`src/assistant-host.js`).
- Khi chuyển tiếp sẽ giữ nguyên đường dẫn cơ sở do người dùng điền; khi chỉ điền tên miền sẽ lần lượt thử 「nguyên bản」 và 「thêm `/v1`」 (`src/th-bridge.js`).
- Sửa luôn lỗi phụ: khi chỉ điền tên miền có dấu gạch chéo cuối, địa chỉ cơ sở biến thành `https://tên-miền/` làm ghép ra địa chỉ hai dấu gạch chéo `https://tên-miền//models` và `//chat/completions`.

Yêu cầu chuyển tiếp do **chính máy chủ SillyTavern của bạn** gửi đi, Key chỉ gửi tới cổng kết nối mà bạn điền, không đi qua bất kỳ bên thứ ba nào.

## II. Chiêu mộ Nhóm chat (Đã sửa)

| Vấn đề | Nguyên nhân | 0.8.1 |
|---|---|---|
| Ứng viên đầu tiên không đủ tiền mời, chiêu mộ lại vẫn ra đúng người đó | Lời nhắc chỉ loại trừ những người 「đã ở trong nhóm」, không loại trừ ứng viên vừa bị từ bỏ; lời nhắc mỗi lần giống hệt nhau từng chữ nên mô hình tất nhiên đưa ra cùng một câu trả lời | Thêm trường mới `聊天群.候选历史` (12 người gần nhất) đưa vào mục 【Không được chọn】; chế độ ngẫu nhiên rút ngẫu nhiên một loại thế giới (24 loại) và bậc thực lực mục tiêu **ngay tại máy cục bộ**, nên lời nhắc mỗi lần đều khác nhau; khi mô hình vẫn đưa ra người trùng lặp sẽ tự động đính chính hỏi lại một lần, nếu vẫn trùng sẽ hoàn lại phí Lệnh Chiêu Mộ và thông báo |
| Chỉ có vài trăm Điểm Hệ Thống nhưng lại chiêu mộ ra người đòi phí vào nhóm hàng tỷ điểm | Phí vào nhóm dùng thẳng bảng giá của Thần thông 「Sao Chép Đồ Giám」 (1 nghìn … 100 tỷ), và lời nhắc cũng không báo cho mô hình biết Ký chủ đang có bao nhiêu điểm | Phí vào nhóm đổi sang đường cong độc lập: 300 / 1.500 / 6.000 / 3 vạn / 20 vạn / 200 vạn / 3.000 vạn / 500 triệu (bậc 1–8); chế độ ngẫu nhiên và chỉ định thế giới sẽ chọn bậc thực lực mục tiêu dựa theo số Điểm Hệ Thống hiện tại của bạn, khi mô hình đưa ra người mạnh hơn sẽ đính chính hỏi lại một lần; thẻ ứng viên vẫn vượt ngân sách sẽ ghi rõ 「Điểm Hệ Thống không đủ」, khi bấm mời sẽ không bị trừ thành số âm |
| Chi phí Lệnh Chiêu Mộ | 200 điểm | 100 điểm (thất bại vẫn được hoàn lại như cũ) |

Chế độ 「Chỉ định nhân vật」 không bị giới hạn bởi ngân sách: bạn chỉ đích danh ai thì sẽ chiêu mộ người đó, đánh giá trung thực bậc thực lực theo nguyên tác và hiển thị đúng phí vào nhóm thực tế. Phí giáng lâm không thay đổi (vẫn bằng 1/10 bảng giá Thần thông gốc).

## III. Tần suất lì xì / quà tặng của thành viên nhóm

- Trước đây chỉ viết trong lời nhắc là 「thỉnh thoảng (đừng phát mỗi lượt)」, nên mô hình hầu như lượt nào cũng phát.
- Hiện tại do sổ cái cưỡng chế: lì xì và quà tặng của thành viên nhóm **ba đến bốn lượt trò chuyện nhóm mới cho phép một lần** (mỗi lần chọn ngẫu nhiên 3 hoặc 4), khi chưa tới lượt thì trong lời nhắc ghi rõ 「Lượt này cấm phát」, và dòng do mô hình cố tình phát ra cũng sẽ bị loại bỏ, không ghi vào sổ.
- **Ngoại lệ khi Ký chủ chủ động yêu cầu**: khi bạn nói những câu như 「phát lì xì / tặng quà / quà tặng / thưởng」 trong nhóm, lượt đó sẽ được phép phát tối đa 3 cái.
- Giới hạn nhận lì xì mỗi ngày (6 cái) không đổi. Thêm trường mới `聊天群.节奏 {距上次, 间隔}`.

## IV. Chính văn không biết chuyện trong nhóm chat / Lai lịch vật phẩm bị viết sai

- Trường mới `聊天群.入库记录` (20 mục gần nhất): giật lì xì, nhận quà tặng, mua / bán ở chợ nhóm, điểm danh nhóm — phàm là những thứ thực sự được ghi vào sổ cái đều ghi lại 「vật gì, ai đưa (Tên@Thế giới), nhận bằng cách nào」.
- Lời nhắc cốt truyện (`zhutian-covenant-terminal/group`) hiện bao gồm:
  - Danh sách thành viên nhóm;
  - 8 bản ghi nhập kho thực tế gần nhất;
  - Trò chuyện nhóm gần đây;
  - Yêu cầu rõ ràng: lai lịch của những thứ này chính là Nhóm Chat Chư Thiên, **không được sửa thành nhặt được, mua được hay tặng trực tiếp trước mặt**; có thể nối tiếp tự nhiên, nhưng đừng tự bịa ra trò chuyện nhóm, lì xì hay quà tặng không có trong bản ghi.
- Độ sâu tiêm được điều chỉnh từ 4 về 2 để nằm gần cốt truyện mới nhất hơn.
- Sách Thế Giới thêm mới mục từ 「36｜Liên kết｜Nhóm Chat Chư Thiên (Plugin)」, viết cùng quy tắc này thành quy tắc thường trực.

## V. Sách Thế Giới 「Bản Plugin」

- 35 mục từ nguyên bản được giữ nguyên trong `vendor/original`, tệp mới `src/worldbook.js` khi cài đặt sẽ áp chồng:
  - Trong mục số 05, đổi hướng dẫn mở bảng Quản trị viên sang 「Cài đặt → Nâng cao · Quản trị viên → Bảng điều khiển Quản trị viên」;
  - Trong mục số 05, đổi chú thích 「cần có Tavern Helper」 thành 「Plugin này hỗ trợ gốc, không cần Tavern Helper」;
  - Thêm mới mục số 36 (Liên kết nhóm chat).
- Trong Cài đặt → Cài đặt / Gắn kết Sách Thế Giới, thêm mới hai nút:
  - 「Cập nhật lên bản mới nhất (Sao lưu trước)」: lưu toàn bộ quyển sách cũ thành `诸天万界最强系统-备份-thời_gian` trước, sau đó thay thế các mục từ tích hợp sẵn; các mục từ do chính bạn thêm vào và trạng thái bật / tắt của các mục tích hợp sẵn đều được giữ nguyên.
  - 「Xuất JSON」: tải xuống tệp Sách Thế Giới có nội dung giống hệt bản do plugin cài đặt, có thể dùng để nhập thủ công trong SillyTavern.
- Khi mở cuộc trò chuyện Chư Thiên đang gắn kết Sách Thế Giới bản cũ, mỗi phiên làm việc sẽ nhắc một lần 「Không phải bản mới nhất」. Sách cũ **sẽ không bị tự động ghi đè**.

## Các trường sổ cái thêm mới / sửa đổi

| Trường | Thuyết minh |
|---|---|
| `诸天系统.聊天群.候选历史` | Tên các ứng viên đã xuất hiện gần đây (tối đa 12 người), dùng để loại trừ khi chiêu mộ |
| `诸天系统.聊天群.节奏` | `{距上次, 间隔}`, nhịp độ lì xì / quà tặng |
| `诸天系统.聊天群.入库记录[]` | `{t, what, src, how}`, 20 mục gần nhất, dùng cho lời nhắc cốt truyện |
| `诸天系统.聊天群.候选.超预算` | Bậc thực lực của ứng viên vượt quá ngân sách hiện tại |
