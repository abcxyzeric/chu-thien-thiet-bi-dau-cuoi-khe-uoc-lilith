# 1.1.2 · Chuyển đổi chế độ rút thẻ, Làm lại trang Gắn kết, Bảng điều khiển Quản trị viên

Sửa đổi tăng thêm trên nền bản 1.1.1 (xem [CHANGES-1.1.1](CHANGES-1.1.1.md)). Phiên bản plugin 1.1.2. Phiên bản cấu trúc sổ cái 2 giữ nguyên, phiên bản quy tắc Sách Thế Giới 1.1.1 giữ nguyên (bản này không cần cập nhật Sách Thế Giới). ID tiện ích mở rộng, khóa lưu trữ và các trường sổ cái đã có đều không đổi tên.

## 1. Chế độ rút thẻ: Gộp cổ điển (Mặc định) / 10 lượt 1 lần quyết toán

Phản hồi từ người chơi: Chế độ 10 lượt 1 lần quyết toán phải tạo từng món Phàm phẩm một, khi rút nhiều sẽ gọi mô hình rất nhiều lần và gây tải nặng cho mô hình. Hiện tại người chơi có thể chọn một trong hai chế độ:

| Chế độ | Cách quyết toán | Gọi mô hình |
|---|---|---|
| **Gộp cổ điển** (Mặc định) | Quyết toán toàn bộ lượt rút trong một lần, trừ phí một lần. **≥50 lượt**: toàn bộ Phàm phẩm được gộp thành một dòng 「Tạp vật Phàm phẩm ×N」; **≥100 lượt**: Linh phẩm cũng được gộp thành một dòng 「Tạp vật Linh phẩm ×N」. Tiên phẩm và Thần phẩm luôn được tạo từng món. Nếu thất bại sẽ không trừ phí và giữ nguyên bảo hiểm. | Chỉ tạo những vật phẩm không bị gộp, mỗi yêu cầu tối đa 20 món (khi bị cắt cụt sẽ tự động giảm một nửa để thử lại) |
| **10 lượt 1 lần quyết toán** (Cách của bản 1.1.1) | Cứ mỗi 10 lượt rút sẽ tạo, kiểm tra và trừ phí riêng; nếu thất bại giữa chừng, phần đã hoàn thành vẫn được ghi sổ bình thường, phần còn lại không trừ phí. | Tạo chi tiết từng món một, mỗi yêu cầu 5 món |

- Chuyển đổi ở đâu: Nằm ngay cạnh nút rút thẻ ở khu vực Hộp mù, và trên thẻ 「Chế độ rút thẻ」 ở đầu trang 「Tùy chỉnh hàng hóa」. Cả hai nơi đều điều khiển cùng một cài đặt (`gachaMode`, lưu trong cài đặt plugin, không ghi vào tệp trò chuyện).
- Giá trị của dòng đã gộp hoàn toàn giống hệt như khi tạo từng món: giá tính theo đơn giá phẩm giai, khi bấm 「Giữ lại」 đưa vào túi đồ sẽ có số lượng là N, các thao tác 「Phân giải / Phân giải theo phẩm giai / Giữ lại toàn bộ / Thu hồi」 đều tính theo `Số lượng × Đơn giá`, không thiếu cũng không thừa.
- Bảo hiểm vẫn đếm như bình thường: Phàm phẩm / Linh phẩm đã gộp vẫn được tính vào bảo hiểm Tiên phẩm 100 lượt, bảo hiểm Thần phẩm 1000 lượt và tổng số lượt rút tích lũy.

## 2. Làm lại trang Gắn kết

Phản hồi từ người chơi: Trang Gắn kết cũ trông rối mắt, hơn nữa thành viên của nhóm chat lại bị nhét hết vào trong đó.

- **Thành viên nhóm chat mặc định không đi vào Gắn kết**. Trang Gắn kết chỉ liệt kê các nhân vật trong kho gắn kết và đả thủ.
- **Ưu tiên thế giới hiện tại**: Khi mở trang mặc định chọn bộ lọc 「Thế giới này」, thứ tự sắp xếp cũng ưu tiên người của thế giới hiện tại lên trước. Các bộ lọc khác: Tất cả / Người yêu / Đả thủ / Bạn cùng nhóm, kèm theo ô tìm kiếm.
- Danh sách: Mỗi người một thẻ, có khối màu ảnh đại diện, nhãn quan hệ (Người yêu màu hồng / Đả thủ màu cam / Bạn cùng nhóm màu xanh lam), thế giới đang ở, cùng giai đoạn hảo cảm (Xa lạ / Quen biết / Thân thiện / Thân mật / Chí ái).
- Chi tiết:
  - Ba thanh tiến độ Hảo cảm / Hắc hóa / Hối hận; hồ sơ đã được sắp xếp gọn gàng (Tính cách, Thân phận, Ngoại hình, Trạng thái, Đặc sản, v.v.); các trường còn lại được gom vào mục 「Bản ghi khác」.
  - Các nút bấm: Xem trên đồ phổ quan hệ, Đặt làm mục tiêu công lược, Tới nhóm chat (với bạn cùng nhóm), Đưa ra khỏi Gắn kết (chỉ áp dụng với nhân vật liên kết từ thành viên nhóm), Mở trang Đả thủ.
  - Khung 「Ghi bù nhân vật」 được đưa vào vùng thu gọn.
- Bấm 「Xem」 sẽ không tự động thay đổi mục tiêu công lược hiện tại (giữ nguyên quy tắc của bản 1.1.0).

### Đưa thành viên nhóm chat vào Gắn kết

- Có hai lối vào, chọn cách nào cũng được:
  - **Nhóm chat → Thành viên**: Mỗi thành viên đều có nút 「Đưa vào Gắn kết」, nếu đã ở trong Gắn kết sẽ hiển thị 「Đã ở trong Gắn kết」 (bấm vào sẽ mở thẳng hồ sơ).
  - **Đồ phổ quan hệ**: Bấm vào nút thành viên nhóm → 「Đưa vào Gắn kết」.
- Sau khi đưa vào: quan hệ được ghi là 「Bạn cùng nhóm」, độ hảo cảm ban đầu lấy từ độ hảo cảm trong nhóm. Phần chi tiết trên trang Gắn kết sẽ hiển thị thời gian thực trạng thái của người đó trong nhóm: thân phận, bậc thực lực, hảo cảm trong nhóm; nếu bị trục xuất khỏi nhóm sẽ hiển thị 「Không còn trong nhóm」, còn hồ sơ gắn kết vẫn được giữ nguyên.
- Nếu người cùng tên cùng thế giới đã có sẵn trong Gắn kết, hệ thống sẽ chỉ liên kết hai bên lại với nhau chứ không tạo thêm bản sao trùng lặp. Sau đó nếu bấm 「Đưa ra khỏi Gắn kết」 cũng chỉ ngắt liên kết chứ không xóa mất nhân vật ban đầu.
- Mục tiêu công lược hiện tại không thể đưa ra khỏi Gắn kết. Việc đưa ra không ảnh hưởng tới nhóm chat.
- Trên đồ phổ quan hệ, thành viên nhóm đã được đưa vào Gắn kết chỉ vẽ một lần (vẽ thành nhân vật gắn kết), không còn xuất hiện lặp lại trên vòng thành viên nhóm nữa.

## 3. Bảng điều khiển Quản trị viên (Cài đặt → Bảng điều khiển Quản trị viên)

Bảng nguyên bản chỉ sửa được các trường thời 3.1 và lại là hộp thoại bật lên riêng lẻ. Hiện đã được thiết kế thành một trang mới bên trong thiết bị đầu cuối, đồng bộ phong cách với các trang khác:

| Nhóm | Các trường |
|---|---|
| Tài sản | Điểm Hệ Thống, Số lượng hệ thống con, Số lượng con cái, Tiền tệ hiện tại, Số tiền nắm giữ |
| Tài nguyên độc quyền | Ấn Ký Thiên Mệnh, Kết Tinh Huyết Mạch, Quân Bài Nhân Quả, Danh Vọng, Năm Tháng Lắng Đọng |
| Thực lực | Bậc thực lực Ký chủ, Bậc giới hạn thế giới này (1–8), Giới hạn dưới cấp Thương thành (1–5) |
| Công pháp | Công pháp chủ tu, Độ thuần thục, Giới hạn trần (đồng bộ kho công pháp, dùng chung logic với bảng nguyên bản; cần mở trang 「Tổng quan」 của thiết bị đầu cuối trước một lần) |
| **Hộp mù (Mới)** | Bộ đếm bảo hiểm Tiên phẩm (0–99), Bộ đếm bảo hiểm Thần phẩm (0–999), Tổng lượt rút tích lũy, Số lần nổ Tiên phẩm, Số lần nổ Thần phẩm, và hiển thị 「Còn N lượt tới bảo hiểm Tiên phẩm / Thần phẩm」 |
| **Gắn kết (Mới)** | Chọn bất kỳ nhân vật gắn kết nào để sửa Độ hảo cảm / Giá trị hắc hóa / Giá trị hối hận (0–100); khi sửa đúng mục tiêu công lược hiện tại sẽ đồng bộ sang mục 「恋爱目标」 |
| **Nhóm chat (Mới)** | Chọn bất kỳ thành viên nhóm nào để sửa Độ hảo cảm (0–100) |

Quy tắc ghi dữ liệu:

- Chỉ ghi những mục bạn đã sửa đổi. Ô nhập liệu đã sửa sẽ sáng nổi bật, thanh đáy hiển thị 「N mục thay đổi chưa lưu」.
- Trước khi ghi, hộp thoại xác nhận sẽ liệt kê từng mục theo dạng 「Giá trị cũ → Giá trị mới」. Toàn bộ thay đổi được ghi trong một lần có khóa rồi đọc lại từ máy chủ để đối chiếu.
- Sau khi mở trang, nếu cùng một mục trong sổ cái vừa bị phản hồi AI hoặc thao tác khác làm thay đổi, hệ thống sẽ **từ chối ghi toàn bộ lượt đó** và báo 「Sổ cái đã thay đổi… vui lòng đọc lại」 để không ghi đè mất dữ liệu mới.
- Khi giá trị vượt ngưỡng hoặc không phải số nguyên, hệ thống sẽ báo rõ tên mục và phạm vi hợp lệ chứ không âm thầm cắt bớt.
- Các thay đổi về tài nguyên độc quyền sẽ được cộng đồng bộ vào bản chụp nhanh của từng tầng, nên sau đó dù có swipe hay tạo lại phản hồi cũng không làm quay lui mất chỉnh sửa của Quản trị viên.
- Mỗi lần ghi đều lưu lại một bản ghi thao tác 「Quản trị viên sửa đổi: …」.
- Nút 「Mở bảng nguyên bản」 ở góc trên bên phải trang vẫn mở được hộp thoại bật lên nguyên bản.

## 4. Các tệp thay đổi

| Tệp | Thay đổi |
|---|---|
| `src/commerce.js` | Chế độ rút thẻ, quyết toán Gộp cổ điển, nút chuyển đổi chế độ |
| `src/settings.js` | Mặc định `gachaMode: 'classic'` |
| `src/bonds-data.js` | Danh sách gắn kết không chứa thành viên nhóm, ưu tiên sắp xếp thế giới hiện tại, đưa vào / đưa ra |
| `src/bonds.js` | Viết lại trang Gắn kết |
| `src/hub-atlas.js` | Nút 「Đưa vào Gắn kết」 trên nút thành viên nhóm của đồ phổ quan hệ, không vẽ lặp người đã đưa vào |
| `src/hub-group.js` | Nút 「Đưa vào Gắn kết / Đã ở trong Gắn kết」 ở trang Thành viên nhóm |
| `src/admin.js` (mới) | Trang Bảng điều khiển Quản trị viên |
| `src/hub.js` | `openAdmin` mở trang mới, hộp thoại cũ chuyển sang `openOriginalAdmin` |
| `src/hub-settings.js` | Văn bản thuyết minh Bảng điều khiển Quản trị viên |
| `index.js` | Khởi động mô-đun Bảng điều khiển Quản trị viên |
| `styles/hub.css` | Kiểu dáng trang Gắn kết và Bảng điều khiển Quản trị viên |
| `src/contracts.js` | Số phiên bản và ma trận tính năng |
| `tests/v112.test.js` (mới) | Kiểm thử đơn vị 1.1.2 |
| `tests/v110.test.js` | Danh sách gắn kết không còn chứa thành viên nhóm |
| `tests/native_v112.py` (mới) | Chuyên đề trình duyệt 1.1.2 |
| `tests/native_v111.py` | Kiểm tra hộp mù chuyển sang 10 lượt 1 lần quyết toán trước, kết thúc khôi phục mặc định |
| `tests/native_v080.py` | Lối vào quản trị viên đi tới trang mới trước rồi bấm 「Mở bảng nguyên bản」 |
| `tests/version.test.js`, `package.json`, `package-lock.json`, `manifest.json` | Phiên bản 1.1.2; `check` bổ sung `src/admin.js` |
| `README.md`, `CHANGELOG.md`, `docs/FEATURE_MATRIX.md`, `docs/CHANGES-1.1.2.md`, `docs/ACCEPTANCE-1.1.2.md` | Tài liệu |
