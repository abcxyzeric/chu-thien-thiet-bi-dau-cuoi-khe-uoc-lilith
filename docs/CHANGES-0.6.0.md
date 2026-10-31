# Bản ghi thay đổi 0.6.0: Nhóm Chat Chư Thiên Vạn Giới

Cơ sở: 0.5.0.
Mục tiêu: Bổ sung một **Nhóm chat xuyên thế giới** kiểu nhóm QQ vào trong thiết bị đầu cuối. Thành viên nhóm đến từ các thế giới khác nhau, có thể trò chuyện, phát lì xì, tặng quà, cầu viện, phát sóng trực tiếp, giáng lâm; những món đồ do thành viên nhóm gửi tặng **thực sự được ghi vào sổ cái**.

Kết quả nghiệm thu xem tại [ACCEPTANCE-0.6.0](ACCEPTANCE-0.6.0.md).

## Lối vào

Thanh điều hướng thiết bị đầu cuối thêm mới nhóm 「Vạn Giới · Nhóm chat」, nằm giữa 「Thần thông」 và 「Bàn làm việc」. Trang nhóm có bốn phân trang: **Trò chuyện · Thành viên · Chợ nhóm · Công việc nhóm**.

Dữ liệu được lưu tại biến trò chuyện `诸天系统.聊天群`, đi theo bản lưu và nhánh cốt truyện. Với những cuộc trò chuyện chưa có sổ cái Chư Thiên, trang sẽ nhắc vào 「Cài đặt → Khởi tạo cuộc trò chuyện mới」 trước.

## Cách chơi

| Tính năng | Cách dùng | Quy tắc |
|---|---|---|
| Chiêu mộ | Trang Thành viên → 「Phát Lệnh Chiêu Mộ」: thế giới ngẫu nhiên, hoặc chỉ định tên thế giới/nhân vật | Mỗi lần 200 Điểm Hệ Thống, khi mô hình không đưa ra nhân vật hợp lệ sẽ được hoàn lại. Thẻ ứng viên hiển thị thế giới, bậc thực lực, tính cách, đặc sản |
| Mời vào nhóm | Nút 「Mời vào nhóm」 trên thẻ ứng viên | Phí vào nhóm = giá chuẩn của bậc thực lực đó (`ZT_TIERS` nguyên bản: Phàm nhân 1.000 · Võ đạo tông sư 10.000 · Cấp thành phố 1.000.000 …) |
| Mở rộng nhóm | Trang Thành viên → 「Mở rộng +5」 | Sức chứa hiện tại × 2.000 Điểm Hệ Thống; khởi đầu 5 người, tối đa 30 người |
| Trò chuyện nhóm | Ô nhập liệu ở trang Trò chuyện, nhấn Enter để gửi | Ký chủ gửi 1 tin = gọi mô hình 1 lần, từ 1–6 thành viên trả lời; lời nói của người không ở trong nhóm hoặc thành viên đang bị cấm chat sẽ bị loại bỏ |
| Lì xì thành viên | Thành viên gửi `[红包]` / `[Lì xì]` trong câu trả lời | Lì xì Điểm Hệ Thống: số tiền ≤ giá chuẩn bậc thực lực của thành viên đó, và ≤ giới hạn cấp độ thương thành (Lv1 2.000 · Lv2 20.000 · Lv3 200.000 · Lv4 200 vạn · Lv5 2.000 vạn). Lì xì vật phẩm: phẩm giai xem tại mục 「Giới hạn quy tắc tối thiểu」 bên dưới |
| Giật lì xì | Nút 「Giật」 trên thẻ lì xì | Thử vận may (ngẫu nhiên gấp đôi trung bình). **Ghi vào sổ cái và đọc lại xác nhận trước, sau đó mới hiện thông báo 「Đã nhập kho」**; vật phẩm mang nguồn gốc 「Tên@Thế giới」. Mỗi ngày nhận tối đa 6 lì xì của thành viên |
| Quà tặng | `[赠礼]` / `[Tặng lễ]` trong câu trả lời của thành viên | Đi vào thanh 「Chờ nhận」 ở trên cùng, bấm một cái để nhận vào túi đồ, cũng ghi sổ trước rồi mới thông báo |
| Ký chủ phát lì xì | Trang Trò chuyện → 「Phát lì xì」: Điểm Hệ Thống hoặc vật phẩm trong túi đồ | Trừ từ sổ cái và đọc lại trước rồi mới phát ra; thành viên giật được sẽ tăng độ hảo cảm và có thể đáp lễ (đi vào mục chờ nhận). Mỗi ngày phát tối đa 10 cái; hàng Cấm kỵ không thể phát |
| Điểm danh | Trang Trò chuyện → 「Điểm danh」 | 100 × số ngày liên tiếp (tính tối đa theo mốc 7 ngày) + 10 × số thành viên nhóm, mỗi ngày chỉ được điểm danh một lần |
| Cầu viện | Trang Trò chuyện → 「Cầu viện」 viết nhu cầu, có thể chỉ định thành viên hoặc ngẫu nhiên | Sau khi thành viên nhận lời sẽ tạo ra một nhiệm vụ nguyên bản đi vào `任务库`, trạng thái 「Chờ nhận」, nguồn gốc 「Cầu viện nhóm chat · Tên@Thế giới」, nhìn thấy được ở trang 「Nhiệm vụ」; thẻ nhiệm vụ trong nhóm có nút 「Xem」 dẫn thẳng tới trang Nhiệm vụ |
| Phát sóng trực tiếp | Trang Trò chuyện → 「Phát sóng trực tiếp」 (ngẫu nhiên 1 người), hoặc nút 「Trực tiếp」 của một người ở trang Thành viên | Thành viên dùng 3–5 tin nhắn để phát sóng trực tiếp những gì đang diễn ra tại thế giới của mình ngay lúc này |
| Trò chuyện riêng | Trang Thành viên → 「Trò chuyện riêng」 | Hội thoại riêng, lưu lại 30 tin nhắn gần nhất của mỗi thành viên |
| Giáng lâm | Trang Thành viên → 「Giáng lâm」 | Tốn `max(100, giá chuẩn bậc thực lực ÷ 10)` Điểm Hệ Thống, trong **3 lượt cốt truyện tiếp theo** thành viên đó sẽ xuất hiện trong chính văn với tư cách đồng hành (ghi vào lời nhắc cốt truyện), sau đó tự động kết thúc |
| Chợ nhóm | Trang Chợ nhóm | Mỗi ngày mỗi thành viên treo bán một món đặc sản của thế giới mình (phẩm giai chịu sự ràng buộc của giới hạn quy tắc tối thiểu), có thể mua về, giá tiền trừ từ sổ cái và đọc lại xác nhận. Ký chủ cũng có thể treo bán vật phẩm trong túi đồ: giá bán ≤ định giá nguyên bản × 1.3 mới có người mua, nếu cao hơn thành viên sẽ chê đắt; có thể rút đơn lấy về |
| Công việc nhóm | Trang Công việc nhóm | Tên nhóm, thông báo, nội quy nhóm (có thể sửa, tối đa 12 điều); cấm chat, trục xuất, đặt làm quản trị viên; hai công tắc 「Tiêm tóm tắt nhóm chat vào cốt truyện」 và 「Tự động tán gẫu sau mỗi lượt cốt truyện」 |

## Giới hạn quy tắc tối thiểu (Không thể tắt)

Nội quy nhóm “không quá khắt khe, nhưng có khuôn phép”. Các điều dưới đây được viết cứng trong mã nguồn, dù sửa nội quy nhóm thế nào cũng không thể lách qua:
- Vật phẩm do thành viên gửi ra (lì xì, quà tặng, chợ nhóm) phải có phẩm giai ≤ cấp độ thương thành của Ký chủ, ≤ bậc thực lực của chính người tặng, hàng Cấm kỵ bị cấm tuyệt đối. Khi vượt chuẩn sẽ **tự động hạ xuống phẩm giai cao nhất được phép**, chứ không từ chối cả tin nhắn.
- Lì xì Điểm Hệ Thống có giới hạn trần (xem bảng trên); số lượng món trong mỗi lì xì vật phẩm cũng có giới hạn trần (Phàm phẩm/Linh phẩm 5, Tiên phẩm 2, Thần phẩm 1).
- Mỗi ngày nhận tối đa 6 lì xì của thành viên và phát tối đa 10 lì xì, phần vượt quá sẽ hiển thị trong nhóm là “bị nội quy nhóm chặn lại”.
- Toàn bộ giao dịch thu chi đều đi qua cùng một hàm ghi có khóa, và đọc lại đối chiếu theo `[rev, 系统点, số món túi đồ, số nhiệm vụ]`; nếu đọc lại không khớp sẽ báo lỗi chứ không thông báo thành công.

## Liên kết với cốt truyện

- 「Tiêm tóm tắt nhóm chat vào cốt truyện」 (mặc định bật): đưa danh sách thành viên và 4 tin nhắn nhóm gần nhất làm lời nhắc hệ thống vào quá trình tạo chính văn (độ sâu 4), để các nhân vật trong cốt truyện biết tới sự tồn tại của nhóm này.
- Thành viên đang giáng lâm được tiêm riêng một đoạn lời nhắc, yêu cầu chính văn miêu tả người đó xuất hiện đúng theo tính cách và thiết lập thế giới gốc.
- 「Tự động tán gẫu sau mỗi lượt cốt truyện」 (mặc định tắt): mỗi lần nhận được phản hồi cốt truyện, trong nhóm sẽ tự động trò chuyện một lượt (Ký chủ không phát biểu).

## Các sửa đổi khác

- Cấp độ thương thành trên thanh đỉnh của thiết bị đầu cuối được đổi sang tính toán thời gian thực giống hệt `ztShopLevel` nguyên bản.
- Giao diện nhóm chat khi vẽ lại vẫn giữ nguyên tiêu điểm ô nhập liệu, vị trí con trỏ và vị trí cuộn.
- Bản di động: thanh đỉnh nhóm được nén thành một dòng, phân trang trải kín chiều rộng, các nút công cụ và thanh chờ nhận chuyển sang cuộn ngang, vùng trò chuyện dành ra ít nhất khoảng 250 px.

## Các tệp thay đổi

Thêm mới:
- `src/hub-group.js`: Trang Nhóm chat, quy tắc và gọi mô hình.
- `src/ledger-ops.js`: Các thao tác sổ cái dùng chung: hằng số phẩm giai/bậc thực lực, cấp độ thương thành, trừ điểm/cộng điểm/vào túi/ra túi, cùng hàm `commit()` có đọc lại xác nhận.
- `tests/group060.test.js` (thuần logic), `tests/native_group060.py` (trình duyệt máy chủ thực tế).
- `docs/CHANGES-0.6.0.md`, `docs/ACCEPTANCE-0.6.0.md`.

Sửa đổi:
- `index.js`: Đấu nối Nhóm chat.
- `src/hub.js`: Cấp độ thương thành trên thanh đỉnh.
- `styles/hub.css`: Các kiểu `.zt-g*`.
- `tests/qa/mock_model.py`: Mô hình mô phỏng trả lời được chiêu mộ, trò chuyện nhóm, nhiệm vụ, phát sóng trực tiếp, trò chuyện riêng.
- `tests/qa/zt_common.py`: `open_chat()`, mở lại cuộc trò chuyện nghiệm thu sau khi làm mới trang.
- `tests/qa/run_matrix.sh`: Thêm `group060`.
- `package.json`: Kịch bản `check` thêm các tệp mới.
- `README.md`, `docs/FEATURE_MATRIX.md`, cùng số phiên bản ở các nơi.
