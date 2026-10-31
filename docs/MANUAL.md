# Thiết Bị Đầu Cuối Chư Thiên · Lilith — Hướng dẫn sử dụng (Bản chính thức 1.1.5)

Bản hướng dẫn sử dụng này trình bày **toàn bộ tính năng của tiện ích, công dụng và cách dùng của từng nút bấm**. Trong thiết bị đầu cuối, nhấn vào cột bên trái 「Thiết bị đầu cuối → Hướng dẫn」 là sẽ thấy và có thể tìm kiếm; tệp `docs/MANUAL.md` trong thư mục tiện ích cũng chính là bản này.

> **Đọc câu này trước tiên**: Tất cả tính năng AI (nhập hàng thương thành, ước nguyện, hộp mù, bàn làm việc, tự động ký ức, trò chuyện riêng, nhóm chat, ghi bổ sung) đều mới chỉ được nghiệm thu bằng model mô phỏng và được gắn nhãn 「Thử nghiệm」. Trước khi dùng với model thật lần đầu tiên, vui lòng vào Cài đặt → Sổ cái & Bản lưu → 「Xuất / Nhập bản lưu」 để sao lưu trước.

Gợi ý khi đọc:
- 「Nhấn A → B」 nghĩa là nhấn A trước, sau đó trong trang mở ra nhấn tiếp B.
- 「Sổ cái」 chỉ dữ liệu Chư Thiên trong cuộc trò chuyện (Điểm Hệ Thống, túi đồ, nhiệm vụ, công pháp…), được lưu trong tệp trò chuyện, đổi cuộc trò chuyện là đổi sang một bản khác.
- Đánh dấu **1.1.5** là nội dung mới thêm hoặc thay đổi ở bản này (đánh dấu 1.1.4 là của bản trước).
- 「Lilith」 trong hướng dẫn này chỉ trợ lý hệ thống; sau khi đổi thiết lập nhân vật (Chương 18), trên giao diện sẽ hiển thị tên do bạn thiết lập.

---

## 1. Bắt đầu nhanh

### 1.1 Cài đặt & Cập nhật

1. SillyTavern → 「Tiện ích mở rộng (Extensions)」 → 「Cài đặt tiện ích (Install extension)」, dán: `https://github.com/abcxyzeric/chu-thien-thiet-bi-dau-cuoi-khe-uoc-lilith`
2. Cài đặt xong hãy làm mới trang web, mở một cuộc trò chuyện **đơn nhân vật** (không hỗ trợ trò chuyện nhóm của quán rượu).
3. Cần SillyTavern 1.16 trở lên (đã xác minh trên 1.16.0 / 1.17.0 / 1.18.0 / 1.19.0). Không cần Tavern Helper, cũng không cần nhập kịch bản Regex.
4. **Cập nhật**: Trong 「Tiện ích mở rộng → Quản lý tiện ích」 tìm 「Chư Thiên · Thiết Bị Đầu Cuối Khế Ước Lilith」, nhấn cập nhật, sau đó làm mới trang web. Chỉ làm mới trang web thôi sẽ không tải mã nguồn mới về.
5. **Gỡ cài đặt**: Xuất bản lưu và gỡ liên kết Sách Thế Giới trước, sau đó mới xóa tiện ích mở rộng (xem chi tiết tại `docs/UNINSTALL.md`).

### 1.2 Lần đầu sử dụng (Hướng dẫn tân thủ)

Lần đầu tiên mở thiết bị đầu cuối sẽ xuất hiện 「Hướng dẫn tân thủ」 (trang 「Hướng dẫn」 ở cột trái), tổng cộng có 3 bước, mỗi bước hoàn thành sẽ đánh dấu ✓:

| Bước | Làm gì | Nút bấm |
|---|---|---|
| 1 Nhập hoặc cập nhật Sách Thế Giới | Cài đặt và gắn kết Sách Thế Giới 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 (bản lưu Chư Thiên sẽ tự động thực hiện) | Tự động hoàn thành |
| 2 Thiết lập cổng kết nối AI | Điền cổng độc lập, hoặc dùng trực tiếp API chính của quán rượu | 「Sửa đổi」 → Chuyển tới trang 「Kết nối」 |
| 3 Bật trong cuộc trò chuyện hiện tại | Tạo sổ cái cho cuộc trò chuyện hiện tại | 「Bật trong cuộc trò chuyện hiện tại」 |

- 「Bỏ qua hướng dẫn」: Không hiển thị hướng dẫn nữa.
- 「Để vậy đã, tính sau」: Lần này đóng lại trước, về sau vẫn sẽ nhắc lại.
- Bất cứ lúc nào cũng có thể mở lại tại Cài đặt → Bắt đầu → 「Hướng dẫn tân thủ ›」.

### 1.3 Di chuyển từ bản cũ v1.1 (Sách Thế Giới + Regex + Kịch bản Tavern Helper)

1. Cài đặt tiện ích này xong, mở cuộc trò chuyện Chư Thiên. Tiện ích sẽ tự động cài đặt và gắn kết Sách Thế Giới ngoại vi, nếu đã tồn tại sẽ không ghi đè.
2. Cài đặt → Tương thích & Bảo trì → 「Tiếp quản bản cũ một chạm」: Tắt 4 kịch bản Regex cũ và kịch bản Tavern Helper cũ (chỉ tắt chứ không xóa), sau khi lưu sẽ tự động làm mới.
3. Muốn quay về bản cũ: Nhấn 「Khôi phục bản cũ」. Khi không mở được thiết bị đầu cuối, trong ngăn kéo cài đặt tiện ích mở rộng vẫn có nút 「Khôi phục khẩn cấp bản cũ」.
4. Khi 「Chẩn đoán tương thích」 nhắc 「Ngân sách Sách Thế Giới không đủ」, hãy nhấn 「Điều chỉnh một chạm」 (mặc định quán rượu chỉ cấp 25% ngữ cảnh cho Sách Thế Giới).
5. Sổ cái của cuộc trò chuyện cũ: Cài đặt → Sổ cái & Bản lưu → 「Di chuyển bản lưu cũ / Hoàn tác sổ cái ›」.

---

## 2. Cách mở thiết bị đầu cuối

| Lối vào | Cách dùng |
|---|---|
| Lilith nổi (Mặc định trên điện thoại / màn hình cảm ứng) | **Chạm 1 lần**: Mở thiết bị đầu cuối (khi thiết bị đầu cuối đang mở thì chỉ nói thoại). **Chạm đúp**: Chọc cô ấy một cái, sẽ có lời thoại và biểu cảm. **Nhấn giữ và kéo** (trên máy tính kéo trực tiếp): Di chuyển vị trí, kéo sát mép trái/phải màn hình sẽ ẩn đi chỉ lộ ra một chút, chạm vào phần lộ ra sẽ hiện lại. **Kéo xuống đáy màn hình**: Xuất hiện hai mục tiêu 「Đổi sang ảnh đại diện」 và 「Đóng cửa sổ nổi」. |
| Cửa sổ nổi ảnh đại diện (Mặc định trên máy tính) | Nhấn vào ảnh đại diện để mở thiết bị đầu cuối. Kéo xuống đáy màn hình cũng có thể đổi sang Lilith nổi hoặc đóng lại. |
| Phím tắt (Máy tính) | `Alt+Z` / `Alt+X` để mở hoặc đóng thiết bị đầu cuối, `Alt+S` để mở Tổng quan. Có thể tắt trong phần Cài đặt. |
| Lệnh gạch chéo (Slash command) | Nhập `/zt open` vào ô nhập trò chuyện (xem Chương 15). |
| Nhãn nhỏ ở tầng tin nhắn | Nhấn vào 「✧ Hệ thống đã ghi nhận … Xem ›」 bên dưới tầng tin nhắn trò chuyện, sẽ mở thiết bị đầu cuối và định vị tới dữ liệu của tầng đó. |
| Thanh xem nhanh sổ cái phía trên ô nhập liệu (HUD) | Hiển thị Điểm Hệ Thống / Thế giới hiện tại / Nhiệm vụ, nhấn vào đó để mở thiết bị đầu cuối. |

Sau khi đóng cửa sổ nổi, có thể chọn bật lại tại Cài đặt → Trợ lý hệ thống → 「Cửa sổ nổi」.

---

## 3. Cửa sổ thiết bị đầu cuối

### 3.1 Thanh tiêu đề

| Nút bấm | Công dụng |
|---|---|
| Số phiên bản (như 1.1.5) | Phiên bản tiện ích hiện tại. |
| ✥ Kéo cửa sổ | Nhấn giữ để kéo cửa sổ thiết bị đầu cuối (chế độ cửa sổ nổi). Góc dưới bên phải cửa sổ có thể kéo để thay đổi kích thước. |
| Toàn màn hình / Cửa sổ nổi | Chuyển đổi qua lại giữa toàn màn hình và cửa sổ nổi (trên điện thoại cả hai bố cục đều có nút này). |
| ↻ Đặt lại cửa sổ | Khôi phục vị trí và kích thước cửa sổ thiết bị đầu cuối về mặc định. |
| — Thu gọn | Thu gọn thiết bị đầu cuối (nhấn lại vào ảnh đại diện / Lilith nổi để mở). |
| × | Đóng thiết bị đầu cuối. Chỉ đóng thiết bị đầu cuối, không ảnh hưởng tới cửa sổ nổi. |

Trên điện thoại có thể dùng cử chỉ quay lại (Back) để đóng thiết bị đầu cuối (có thể tắt trong Cài đặt); việc nhấn ra bên ngoài thiết bị đầu cuối có đóng cửa sổ hay không do cài đặt 「Đóng khi nhấn ra ngoài thiết bị đầu cuối」 quyết định.

### 3.2 Thanh dữ liệu phía trên

Hiển thị lần lượt: **Thế giới hiện tại** (kèm nhãn loại thế giới, ví dụ 「Ngọc Giản」 = Tiên hiệp), **Điểm Hệ Thống**, 5 loại tài nguyên độc quyền (**Ấn Ký Thiên Mệnh / Kết Tinh Huyết Mạch / Quân Bài Nhân Quả / Danh Vọng / Năm Tháng Lắng Đọng**), **Cấp thương thành**. Dữ liệu lấy từ sổ cái của cuộc trò chuyện hiện tại, sau khi ghi thành công sẽ tự động làm mới.

### 3.3 Điều hướng bên trái

| Nhóm | Trang |
|---|---|
| Hệ thống | Tổng quan, Nhiệm vụ, Gắn kết, Tu hành |
| Giao dịch | Thương thành, Túi đồ, Nhật ký thao tác, Tùy chỉnh hàng hóa, Thu nạp cốt truyện |
| Năng lực | Phụ trợ, Tự tạo, Thần thông |
| Đồ giám | Dòng sự kiện, Sơ đồ gắn kết, Tinh đồ, Cây năng lực |
| Vạn Giới | Nhóm chat |
| Lilith | Bàn làm việc, Ký ức, Quy tắc |
| Thiết bị đầu cuối | Hướng dẫn, Kết nối, Trạng thái, Cài đặt, Cẩm nang |

> 1.1.5: Cài đặt → 「Công tắc tính năng」 có thể ẩn các trang không dùng khỏi thanh điều hướng (Tổng quan, Cài đặt, Kết nối luôn được giữ lại); nhóm điều hướng 「Lilith」 sau khi đổi thiết lập nhân vật sẽ hiển thị tên nhân vật mới.

Dưới đáy thiết bị đầu cuối có một dòng gợi ý của Lilith (ví dụ 「Đã chuyển cuộc trò chuyện; chỉ sử dụng ký ức của cuộc trò chuyện hiện tại」).

---

## 4. Hệ thống

### 4.1 Tổng quan

- **Tổng quan cơ bản**: Trạng thái Ký chủ, mục tiêu gắn kết, nhiệm vụ hiện tại, tài nguyên, v.v. (trang 1 của thanh trạng thái bản gốc).
- 「Dữ liệu hiển thị cho AI (诸天系统.实时数据)」: Mở rộng ra sẽ thấy phần dữ liệu sẽ báo cho AI ở lượt tiếp theo; nhấn 「Sao chép」 để sao chép.
- 「Xem Tinh đồ ›」: Chuyển tới Đồ giám → Tinh đồ.

### 4.2 Nhiệm vụ

- **Nhật ký nhiệm vụ**, khung thả xuống có thể lọc: Đang tiến hành / Chờ nhận, Nhiệm vụ dài hạn, Nhiệm vụ ngắn hạn, Đã lưu trữ, Toàn bộ nhiệm vụ.
- Nhấn vào một nhiệm vụ để xem chi tiết và tiến độ; 「Trang trước / Trang sau」 để lật trang.
- Nhiệm vụ do AI phát hành và cập nhật trong khối dữ liệu, hoặc cũng có thể đến từ Bàn làm việc, mục 「Cầu viện」 trong Nhóm chat.
- 「Xem Dòng sự kiện ›」: Chuyển tới Đồ giám → Dòng sự kiện.

### 4.3 Gắn kết

- **Gắn kết nhiều người**: Hiển thị nhân vật của thế giới này và tất cả thế giới (độ hảo cảm, quan hệ, hắc hóa / hối hận, v.v.).
- Ô tìm kiếm: Tìm kiếm theo nhân vật, thế giới, mối quan hệ.
- Bộ lọc: Thế giới này / Tất cả / Người yêu · Công lược / Tay đấm / Bạn cùng nhóm (con số là số lượng người).
- 「Ghi bổ sung nhân vật / Cập nhật quan hệ nhiều người (không trừ phí, không phát thưởng)」: Điền Họ tên, Thế giới xuất xứ (nhân vật trùng tên được phân biệt bằng thế giới), Quan hệ, Độ hảo cảm (0–100), Mô tả, sau đó nhấn 「Lưu nhân vật」. Dùng để bổ sung những nhân vật mà AI ghi sót.
- Thành viên nhóm chat mặc định **không tự đưa vào** trang Gắn kết; muốn thêm vào, tại Nhóm chat → Thành viên hãy nhấn 「Đưa vào Gắn kết」.

### 4.4 Tu hành

- **Tu hành Vạn Tượng**: Chọn công pháp và thời lượng tu luyện (Một canh giờ / Một ngày / Bảy ngày / Một tháng / Một năm / Mười năm), nhấn 「Ghi vào ô nhập liệu」, sẽ tạo ra một câu chỉ lệnh tu luyện đưa vào ô nhập trò chuyện để bạn gửi đi.
- Các giai đoạn độ thuần thục công pháp: Chưa Nhập Môn → Nhập Môn → Thuần Thục → Tinh Thông → Tông Sư → Nhập Đạo. Có thể bật 「Báo cho AI hiệu quả thực tế ở giai đoạn hiện tại của từng môn công pháp」: Thuần Thục tiêu hao −30%, Tinh Thông uy lực +100%, Tông Sư có áo nghĩa độc quyền, Nhập Đạo phát động tức thì không tiêu hao.
- 「Giám định phẩm giai ›」: Công pháp nhận được trong cốt truyện nhưng bị ghi thành Phàm phẩm có thể giám định lại tại đây (xem 5.6).
- 「Hiệu quả giai đoạn & Nguồn gốc ›」: Xem hiệu quả giai đoạn và nguồn gốc của từng môn công pháp.
- 「Thu nạp vật phẩm / công pháp cốt truyện」: Chuyển tới 「Thu nạp cốt truyện」.

---

## 5. Giao dịch

### 5.1 Thương thành

Phía trên có 5 nút phân khu:

| Phân khu | Công dụng |
|---|---|
| **Hộp Mù Vạn Giới** | 「Rút 1 lần · 1 vạn」「Rút 10 lần · 10 vạn」「Rút 50 lần · 50 vạn」; nhập số lượng rồi nhấn 「Số lần rút tùy chỉnh」. Bảo hiểm Thần phẩm ở lượt rút thứ 1000. Bên cạnh có thể chuyển đổi chế độ rút thẻ: **Gộp cổ điển** (mặc định, kết toán toàn bộ cùng lúc, khi ≥50 lượt rút thì Phàm phẩm gộp thành 1 dòng, khi ≥100 lượt rút thì Linh phẩm cũng gộp thành 1 dòng, phần gộp chỉ đếm số lượng chứ không gọi tạo chi tiết) hoặc **Kết toán mỗi 10 lượt**. |
| **Phần thưởng chờ xử lý** | Phần thưởng đã rút trúng nhưng chưa nhận / chưa xử lý. |
| **Ước Nguyện Vạn Năng** | Viết điều ước vào ô 「Nhập điều ước...」, nhấn 「Hỏi giá」, AI sẽ định giá và phán định, sau khi xác nhận sẽ trừ điểm. |
| **Kho hàng Thương thành** | 「Nhập hàng một chạm · 500 Điểm Hệ Thống」 để AI nhập một đợt hàng theo tùy chỉnh, sau đó mua sắm. 「Tùy chỉnh hàng hóa / Tránh trùng lặp gần đây」 chuyển tới trang Tùy chỉnh hàng hóa. |
| **Thu hồi vật phẩm** | Bán vật phẩm trong túi đồ lại cho hệ thống để đổi lấy Điểm Hệ Thống. |

Tất cả các thao tác trừ điểm / phát thưởng đều **khóa ghi và đọc lại để đối chiếu**. Khi đọc lại không khớp sẽ đóng băng sổ cái, xem Chương 13.

### 5.2 Túi đồ

- **Hành trang tùy thân**: Toàn bộ vật phẩm, hiển thị theo phân loại, có thể sử dụng và xem chi tiết.
- 「AI chỉnh lý túi đồ (Phân loại lại + Bổ sung giới thiệu công năng)」: Để AI sắp xếp lại phân loại và viết bổ sung phần giới thiệu.
- 「Giám định phẩm giai ›」: Phán định lại phẩm giai của vật phẩm cốt truyện.
- 「Thu nạp vật phẩm / công pháp cốt truyện」: Chuyển tới 「Thu nạp cốt truyện」.

### 5.3 Nhật ký thao tác

Các thao tác được ghi nhận trên máy (mua sắm, rút thẻ, ước nguyện…). Có thể đánh dấu chọn, phân loại, xem trước. Sau khi làm mới mặc định không đưa vào chính văn; chứng từ sổ cái thực sự vẫn được giữ nguyên.

### 5.4 Tùy chỉnh hàng hóa

- **Chế độ rút thẻ**: Gộp cổ điển (mặc định) / Kết toán mỗi 10 lượt.
- **Tùy chỉnh nhập hàng cửa hàng**:
  - Nguồn gốc: Hỗn hợp Chư Thiên / Thế giới hiện tại / Thế giới · Tác phẩm chỉ định (khi chỉ định hãy điền tên nguyên tác);
  - Đề tài: Khoa học viễn tưởng, Đô thị, Võ hiệp, Kỳ ảo, Lịch sử, Đời thường, Anime & Game, Tu tiên huyền huyễn;
  - Phân loại: Vật phẩm tiêu hao, Vũ khí, Trang bị, Trang phục, Nguyên liệu, Khác;
  - Công dụng: Thăm dò, Đời sống, Trị liệu, Chiến đấu, Xây dựng, Tình báo;
  - 「Mục loại trừ」: Phân cách bằng dấu phẩy, điền những vật phẩm hoặc đề tài không muốn xuất hiện lại;
  - 「Cho phép sáng tạo gốc」;
  - Chiến lược trùng lặp: Tránh trùng lặp gần đây (gồm cả hiệu ứng tương tự) / Cho phép vật phẩm tiêu hao thông dụng lặp lại;
  - Sửa xong nhấn 「Lưu cấu hình cửa hàng」.
- **Tùy chỉnh phần thưởng Hộp mù**: Các tùy chọn giống như trên, sửa xong nhấn 「Lưu cấu hình hộp mù」.

### 5.5 Thu nạp cốt truyện

Đăng ký chính thức những thứ nhận được trong chính văn vào túi đồ / kho công pháp, **không trừ điểm**:

1. Điền 「Tầng bắt đầu」「Tầng kết thúc」 và 「Thế giới xuất xứ」.
2. Tùy chọn: Đánh dấu chọn 「Đính kèm mô tả thẻ nhân vật hiện tại (tối đa 6000 chữ)」, chọn một cuốn Sách Thế Giới làm tham khảo, hoặc điền quan hệ ánh xạ rõ ràng (JSON) vào ô 「Ánh xạ」.
3. Nhấn 「Trích xuất ứng viên」, AI sẽ liệt kê các vật phẩm và công pháp ứng viên kèm theo nguyên văn bằng chứng.
4. Đánh dấu chọn các mục muốn thu nạp, xác nhận xong sẽ đưa vào kho.
5. Phẩm giai của thế giới gốc sẽ được giữ lại; những mục không phán đoán được sẽ gắn nhãn 「Chờ giám định」. Có thể xem tại 「Chờ giám định & Nguồn gốc thu nạp」.

### 5.6 Giám định phẩm giai

Công pháp / vật phẩm nhận được trong cốt truyện mặc định vào sổ ở mức Phàm phẩm. Tại đây có thể để AI giám định, hoặc tự hiệu chỉnh thủ công, **chỉ tăng không giảm**. Cài đặt liên quan nằm tại Cài đặt → 「Giám định phẩm giai」.

---

## 6. Năng lực

### 6.1 Phụ trợ (Xưởng Phụ Trợ)

Các phân khu phía trên:

| Phụ trợ | Cách dùng |
|---|---|
| **Túi Không Giới Hạn** | Chọn vật phẩm từ túi đồ rồi nhấn 「Gửi vào」; điền số lượng rồi nhấn 「Lấy ra ×N cái」; 「Xóa trống」. |
| **Tay Đấm Chư Thiên** | Điền tên nhân vật (ví dụ: Uchiha Itachi) và xuất xứ (tùy chọn), nhấn 「Triệu hồi」, AI sẽ tạo thẻ chiêu mộ, thanh toán theo bậc thực lực. |
| **Mắt Thấu Thị** | Chọn bậc thực lực mục tiêu và độ sâu tình báo (Hồ sơ bề nổi / Tình báo bí mật / Át chủ bài & Điểm yếu), nhấn 「Thanh toán & Thấu thị」. |
| **Phái Khiển Phân Thân** | Chọn nhiệm vụ (Làm thuê kiếm điểm / Tu luyện thay / Tầm bảo tìm cơ duyên) và số lượt (3 / 5 / 10), nhấn 「Thanh toán & Phái đi」. |
| **Động Thiên Tùy Thân** | Chọn phẩm giai, nhấn 「Gieo linh chủng」; 「Mở rộng linh điền」. |
| **Lò Nung Vạn Vật** | Chọn 2 vật phẩm trong túi đồ, nhấn 「Mở lò dung luyện」. |
| **Bản ghi thao tác** | Lịch sử sử dụng các phụ trợ. |

- 「＋ Phụ trợ tự tạo」「Quản lý phụ trợ ›」: Chuyển tới trang 「Tự tạo」.

### 6.2 Tự tạo (Quản lý phụ trợ)

- 「‹ Quay lại Xưởng Phụ Trợ」.
- **Mô-đun mạnh**: Tương ứng với các mục trong Sách Thế Giới, có hiệu lực với mọi cuộc trò chuyện, dùng công tắc để bật/tắt.
- **Phụ trợ bản gốc**: Công tắc chỉ có hiệu lực đối với cuộc trò chuyện này.
- **Phụ trợ tự tạo**: Tự viết phụ trợ riêng, lưu trong kho phụ trợ trên máy, công tắc chỉ ảnh hưởng tới cuộc trò chuyện này.
  - 「Xuất .json」「Nhập .json」: Chia sẻ hoặc sao lưu kho phụ trợ.
  - **Tạo mới**: Điền Tên, Phẩm giai (Phàm phẩm ~ Cấm kỵ), Loại (Bị động / Chủ động / Số lần mỗi ngày), Số lần mỗi ngày, Cái giá phải trả (Không / Điểm Hệ Thống / Tài nguyên độc quyền) cùng loại tài nguyên, Số lượng tiêu hao mỗi lần, Số lượt hồi chiêu, Mô tả quy tắc (viết cho AI đọc: hiệu quả, giới hạn, tác dụng phụ), sau đó nhấn 「Thêm vào kho phụ trợ」.
- **Lịch sử phát động**: 30 lần phát động gần nhất trong cuộc trò chuyện này.

### 6.3 Thần thông

| Phân khu | Cách dùng |
|---|---|
| **Thiết lập thực lực** | Thiết lập bậc thực lực của Ký chủ và đối thủ (Bậc 1 Đỉnh cao phàm nhân ~ Bậc 8 Khái niệm / Toàn năng). Mở rộng 「Hai bậc này có tác dụng gì?」 để xem giải thích. 「AI đánh giá bậc thực lực」 để AI đánh giá dựa theo cốt truyện. |
| **Sao Chép Đồ Giám** | Sao chép một năng lực nào đó, trả phí theo bậc, nhấn 「Thanh toán & Sao chép」. |
| **Cải Biên Trạng Thái** | Chọn loại cải biên (Thương bệnh bình phục, Hồi sinh, Áp đặt trạng thái tiêu cực lên kẻ địch, v.v.), điền đối tượng, nhấn 「Thanh toán & Cải biên」. |
| **Ngôn Linh Cải Tự** | Chọn mức độ sửa chữ (Vô hại hóa / Đảo chiều nhỏ / Đảo chiều kết quả), điền câu nói muốn sửa, nhấn 「Thanh toán & Cải tự」. |
| **Bản ghi Thần thông** | Lịch sử sử dụng. |

- 「Xem Cây năng lực ›」: Chuyển tới Đồ giám → Cây năng lực.

---

## 7. Đồ giám

| Trang | Nội dung |
|---|---|
| **Dòng sự kiện** | Nhiệm vụ, chứng từ kết toán, dấu chân Vạn Giới được xếp thành một trục thời gian. 「Trình diễn trong phiên này」: chỉ phát sau khi sổ cái đọc lại xác nhận thành công, những mục bị hoàn tác sẽ gắn nhãn 「Chưa vào sổ」; nhấn 「Xem」 để xem lại. |
| **Sơ đồ gắn kết** | Sơ đồ quan hệ của mục tiêu tình yêu, tay đấm, thành viên nhóm. Nhấn vào nhân vật có thể chuyển tới trang Gắn kết; thành viên nhóm có thể 「Đưa vào Gắn kết」. |
| **Tinh đồ** | Các thế giới đã ghé thăm. 「Ghi nhận xuyên việt」: Điền tên thế giới, chọn loại (Tự động / Tiên hiệp / Cyberpunk / Quỷ dị / Đô thị / Kỳ ảo phương Tây / Mạt thế / Khác), nhấn 「Ghi nhận xuyên việt」, sẽ ghi vào Thế giới hiện tại / Loại thế giới / Dấu chân Vạn Giới, chủ đề giao diện cũng chuyển đổi theo. |
| **Cây năng lực** | Tổng hợp bậc thực lực, công pháp, thần thông, phụ trợ thành một sơ đồ cây. |

---

## 8. Vạn Giới: Nhóm chat

Nhóm Chat Chư Thiên Vạn Giới là một nhóm trò chuyện xuyên thế giới nằm trong thiết bị đầu cuối, **không liên quan tới tính năng trò chuyện nhóm của quán rượu**. Phía trên ghi tên nhóm, số lượng thành viên, cấp thương thành và giới hạn lì xì (phẩm giai lì xì sẽ không vượt quá cấp thương thành).

Chia làm 4 trang con: **Trò chuyện / Thành viên / Chợ phiên / Việc nhóm**.

### 8.1 Trò chuyện

- Viết tin nhắn vào ô nhập liệu, nhấn Enter hoặc nhấn 「Gửi」. Các thành viên nhóm sẽ trả lời theo chủ đề; mỗi lần có mấy người phát biểu và mỗi tin dài bao nhiêu được thiết lập tại Việc nhóm → 「Tạo trò chuyện nhóm」.
- Thanh công cụ:

| Nút bấm | Công dụng |
|---|---|
| 🧧 Phát lì xì | Bạn phát lì xì cho cả nhóm (Điểm Hệ Thống hoặc vật phẩm), các thành viên nhóm sẽ giật lì xì. |
| Điểm danh | Mỗi ngày một lần, phần thưởng = 100 × số ngày điểm danh liên tiếp (tối đa 7) + 10 × số thành viên nhóm. |
| Cầu viện | Viết ra việc cần giúp đỡ, một thành viên nhóm sẽ biến nó thành một nhiệm vụ và gửi tới trang Nhiệm vụ (trạng thái 「Chờ nhận」). |
| Phát sóng trực tiếp | Một thành viên nhóm phát sóng trực tiếp sự việc đang diễn ra tại thế giới của họ ngay lúc này. |
| **↻ Reroll (1.1.4)** | Tạo lại lượt phát biểu **mới nhất** của các thành viên nhóm, xem chi tiết bên dưới. |
| **🗑 Quản lý (1.1.4)** | Sau khi bật, bên cạnh mỗi tin nhắn sẽ xuất hiện biểu tượng 🗑 để xóa từng tin nhắn; nhấn 「✓ Hoàn tất」 để thoát. |
| Tự động tán gẫu (Đánh dấu chọn) | Cứ sau vài lượt ở cuộc trò chuyện chính, trong nhóm sẽ tự động trò chuyện một lượt (tối đa 3 người phát biểu), khoảng cách lượt được đặt trong phần Việc nhóm. |

- Tin nhắn của thành viên nhóm có thể kèm theo **Lì xì** (nhấn 「Giật」) hoặc **Quà tặng** (nhấn 「Nhận」, đưa vào túi đồ). Sau khi nhận sẽ hiển thị 「Đã nhận」.

#### ↻ Reroll (1.1.4)

- Đối tượng tác dụng là lượt mới nhất: có thể là phản hồi sau khi bạn gửi tin nhắn, hoặc một lần tự động tán gẫu. Nội dung nhập không đổi, phát biểu của bạn được giữ nguyên.
- Sẽ bật hộp thoại xác nhận trước rồi mới gửi yêu cầu. **Sau khi phản hồi mới tới nơi** mới thay thế lượt cũ; nếu yêu cầu thất bại hoặc quá thời gian, lượt cũ vẫn được giữ nguyên vẹn.
- **Trường hợp không thể reroll** (nút bấm sẽ báo lý do): Bạn đã giật lì xì hoặc đã nhận quà tặng của lượt này rồi.
- Khi có thể reroll, sẽ thu hồi cùng lúc: lì xì chưa giật, quà tặng chưa nhận, số lì xì đã nhận hôm nay, nhịp độ lì xì, số lượt cấm ngôn đã tiêu hao trong lượt này.
- Tin nhắn từ bản 1.1.3 trở về trước không có bản ghi lượt nên không thể reroll, nhưng có thể xóa từng tin một.

#### 🗑 Xóa (1.1.4)

- Tin nhắn thông thường, gợi ý hệ thống, phát biểu của chính bạn: xóa trực tiếp.
- **Không thể xóa**: Lì xì bạn đã giật, lì xì do chính bạn phát (đã trừ sổ cái), quà tặng bạn đã nhận.
- Lì xì chưa giật / quà tặng chưa nhận: sau khi xác nhận sẽ hủy bỏ cùng với tin nhắn.
- Việc xóa chỉ ảnh hưởng tới tin nhắn nhóm, không làm thay đổi Điểm Hệ Thống và túi đồ trong sổ cái.

#### Gợi ý bị cắt cụt (1.1.4)

Khi phản hồi chạm giới hạn đầu ra và bị cắt cụt, nửa tin nhắn cuối cùng sẽ bị loại bỏ và trong nhóm xuất hiện một dòng gợi ý ⚠. Lúc này bạn có thể nhấn 「↻ Reroll」, hoặc vào Việc nhóm → 「Tạo trò chuyện nhóm」 để tăng giới hạn đầu ra, giảm giới hạn số chữ mỗi tin.

Lưu ý: Khi đi qua 「API chính của quán rượu」, quán rượu không trả về nguyên nhân kết thúc nên tiện ích không nhận diện được tình trạng cắt cụt, chỉ cần tăng trực tiếp giới hạn đầu ra là được.

### 8.2 Thành viên

- **Phát Lệnh Chiêu Mộ**: Mỗi lần 100 điểm (thất bại được hoàn lại), phí vào nhóm tính theo bậc thực lực. Có 3 phương thức:
  - Thế giới ngẫu nhiên: Chọn bậc thực lực dựa theo Điểm Hệ Thống của bạn;
  - Thế giới chỉ định;
  - Nhân vật chỉ định: Khi nhập tên sẽ tự động chuyển sang 「Thế giới chỉ định」.
  - Điền xong nhấn 「Phát hành」.
- 「Mở rộng +5 · 5,000 điểm」: Tăng giới hạn số người trong nhóm thêm 5 người (khởi đầu là 5 người).
- **Triệu hồi từ Sách Thế Giới (1.1.5)**: Thẻ nằm bên dưới Lệnh Chiêu Mộ.
  1. Chọn một cuốn Sách Thế Giới (★ là cuốn mà cuộc trò chuyện hiện tại đang dùng; 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 không nằm trong danh sách);
  2. Nhập tên nhân vật hoặc từ khóa (để trống sẽ liệt kê toàn bộ), nhấn 「Tìm kiếm」;
  3. Trong kết quả nhấn 「Triệu hồi」: Model sẽ dựa theo nội dung mục từ để chỉnh lý ra hồ sơ thành viên nhóm (Tên / Xuất xứ / Bậc thực lực / Tính cách / Đặc sản) và đưa vào danh sách ứng viên. Chi phí giống hệt Lệnh Chiêu Mộ: mỗi lần 100 điểm (thất bại được hoàn lại), khi 「Mời vào nhóm」 sẽ trả phí vào nhóm theo bậc thực lực;
  4. Sau khi vào nhóm, trên thẻ thành viên sẽ có nhãn 「📖 Sách Thế Giới」, di chuột lên sẽ hiển thị xuất xứ từ mục nào của cuốn sách nào.
  - Tiện ích **chỉ đọc** Sách Thế Giới, không sửa đổi tệp Sách Thế Giới; thành viên nhóm chỉ ghi lại 「Tên sách + Mã mục + Tên mục」. Sau khi mục từ bị xóa, thành viên vẫn ở trong nhóm như bình thường, chỉ là không còn mang theo dữ liệu mục từ nữa.
  - Khi **Trò chuyện nhóm / Trò chuyện riêng**, tiện ích sẽ đính kèm mục từ riêng của thành viên được triệu hồi (mỗi người khoảng 360 chữ) và các mục từ cùng cuốn sách khớp từ khóa trong cuộc hội thoại (tối đa 3 mục) gửi cho model, tổng số chữ có giới hạn trần (mặc định 1,600 chữ).
  - **Tiêm ký ức thành viên nhóm**: Khi trong 4 tầng chính văn gần nhất xuất hiện tên của thành viên này hoặc từ khóa mục từ, trong bản tóm tắt nhóm chat gửi cho AI chính văn sẽ có thêm một đoạn 「Ký ức thành viên nhóm」: nội dung trò chuyện nhóm gần đây của người đó, trò chuyện riêng với bạn, những thứ đã tặng bạn qua nhóm chat và độ hảo cảm. Nhờ vậy khi người đó xuất hiện trong cốt truyện sẽ nhớ được những giao lưu trong nhóm. Cần bật 「Tiêm tóm tắt vào cốt truyện」 của cuộc trò chuyện này; có thể tắt tại Cài đặt → Công tắc tính năng → Nhóm chat.
- Nút bấm của từng thành viên nhóm:

| Nút bấm | Công dụng |
|---|---|
| Trò chuyện riêng | Trò chuyện riêng với thành viên này. |
| Đưa vào Gắn kết | Thêm người này vào trang Gắn kết (thành viên nhóm mặc định không vào trang Gắn kết). |
| Giáng lâm · 100,000 | Người này thông qua nhóm chat giáng lâm tới bên cạnh bạn, xuất hiện trong 3 lượt cốt truyện tiếp theo. Cùng một thời điểm chỉ có thể có 1 người giáng lâm. |
| Phát sóng | Để người này mở một buổi phát sóng trực tiếp trong nhóm. |
| Đặt làm Quản trị | Đặt làm / Hủy quyền quản trị viên. |
| Cấm ngôn | Cấm ngôn 3 lượt, nhấn thêm lần nữa để gỡ. Thành viên bị cấm ngôn sẽ không phát biểu. |
| Trục xuất | Xóa khỏi nhóm chat (có xác nhận). |

### 8.3 Chợ phiên

- **Gian hàng thành viên**: Nhấn 「Xem hàng hôm nay」, làm mới mỗi ngày. Phẩm giai tuân theo quy tắc nhóm: không cao hơn cấp thương thành, và cũng không cao hơn thực lực của thành viên nhóm.
- **Gian hàng của tôi**: Chọn vật phẩm trong túi đồ, điền giá bán (để trống sẽ tính theo giá ước tính), nhấn 「Treo bán」. Khi giá bán cao hơn giá ước tính 30%, thành viên nhóm sẽ chê đắt.

### 8.4 Việc nhóm

- **Hồ sơ nhóm**: Tên nhóm, Thông báo (ghim đầu trang, cũng sẽ báo cho thành viên nhóm), Nội quy nhóm (mỗi dòng một mục, mỗi lần gửi yêu cầu trò chuyện nhóm đều mang theo), sửa xong nhấn 「Lưu」.
- **Giới hạn quy tắc**: Không thể tắt, ví dụ vật phẩm Cấm kỵ không được lưu thông trong nhóm.
- **Liên kết với cốt truyện**:
  - 「Tiêm tóm tắt nhóm chat vào cốt truyện」: Đưa danh sách thành viên và nội dung trò chuyện nhóm gần đây vào gợi ý của cuộc trò chuyện chính;
  - Khoảng cách tự động tán gẫu: Mỗi 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 lượt.
- **Tạo trò chuyện nhóm (1.1.4)**:

| Cài đặt | Tùy chọn | Mặc định |
|---|---|---|
| Số người phát biểu tối thiểu mỗi lần | 1–6, 8, 10 người | 1 |
| Số người phát biểu tối đa mỗi lần | 1–6, 8, 10 người | 6 |
| Giới hạn số chữ mỗi tin nhắn | 120 / 200 / 300 / 400 / 600 / 800 chữ | 300 |
| Số tin nhắn gần nhất gửi kèm cho model | 8 / 16 / 30 / 50 tin | 16 |
| Giới hạn đầu ra (max tokens) | Tự động / 1200 / 2000 / 3000 / 4000 / 6000 / 8000 | Tự động |

- Khi giới hạn dưới lớn hơn giới hạn trên, mục còn lại sẽ tự điều chỉnh theo.
- Cách tính 「Tự động」: 600 + số người tối đa × (số chữ mỗi tin + 20), giới hạn trong khoảng 1200–6000.
- Độ ưu tiên của giới hạn đầu ra (từ cao xuống thấp):
  1. Giới hạn đặt riêng cho Nhóm chat trong mục 「API theo từng tính năng」 ở trang Kết nối;
  2. Con số cụ thể chọn tại đây;
  3. Độ dài đầu ra tối đa mặc định ở trang Kết nối;
  4. Ước tính tự động.

---

## 9. Lilith

### 9.1 Bàn làm việc

Bàn bạc với Lilith xem bước tiếp theo nên đi thế nào:

1. Chọn 「Lần này muốn làm gì」 (Tư vấn & Quy hoạch / Dự thảo nhiệm vụ Dài hạn · Ngắn hạn / Phúc tra tiến triển nhiệm vụ hiện có).
2. Chọn 「Mang theo bao nhiêu tin nhắn gần đây」 (4 / 6 / 10 / 12 tin).
3. Viết câu hỏi hoặc dự định của bạn.
4. Nhấn một nút để gửi yêu cầu: 「Hệ thống lại việc dang dở」「Quy hoạch bước tiếp theo」「Để Lilith suy nghĩ」. Hoặc cũng có thể nhấn 「Xem trước dữ liệu gửi đi」 trước để xem lần này sẽ gửi những gì cho AI.
5. Trong 「Hồi âm của Lilith」 là bản nháp đề xuất, có thể chỉnh sửa. Đề xuất sẽ không bị coi là cốt truyện hay nhiệm vụ đã xảy ra.
   - 「Tạm dừng tự động nối tiếp」: Chính văn lượt tiếp theo sẽ không tự động nối tiếp đề xuất này nữa.
   - 「Cách cũ: Đưa vào ô nhập trò chuyện」.
   - 「Bản ghi qua lại」: Xem các bức thư hồi âm trước đây.
- 「Xem nhiệm vụ hiện tại · Sổ cái gốc chỉ đọc」「Dữ liệu gửi đi lần này」: Mở rộng để xem.

### 9.2 Ký ức

- **Khế ước ký ức** (Lưu theo từng cuộc trò chuyện):
  - Bật trợ lý và tiêm ký ức trong cuộc trò chuyện hiện tại;
  - Tự động chỉnh lý sau khi kết thúc chính văn (tối đa 1 yêu cầu độc lập mỗi lượt);
  - Chính văn lượt sau tự động nối tiếp ký ức & đề xuất bàn làm việc (không sửa tầng cũ);
  - Lilith giám sát sổ cái & phần thưởng.
  - 「Xác minh ngay chính văn mới nhất (không gọi model)」.
  - 「Ngân sách gợi ý mỗi lượt · Ký tự」.
  - Sửa xong nhấn 「Lưu cài đặt cuộc trò chuyện hiện tại」.
- 「Chỉnh lý phản hồi mới nhất」「Đọc bù 6 phản hồi gần nhất」: Chỉnh lý ký ức thủ công. 「Hủy yêu cầu hiện tại」.
- **Ghi nhớ cố định**: Viết một lời nhắc luôn có hiệu lực (ví dụ 「Trước khi Trương Tam bị giải tán, luôn đi theo với tư cách là tay đấm thường trực」), nhấn 「Lưu ghi nhớ」.
- 「Tra cứu sự thật đã lưu」: Tìm kiếm theo nhân vật, nhiệm vụ, tên vật phẩm.
- 「Xuất bản sao lưu ký ức & bản nháp」.
- **1.1.4**: Khi model viết ra khóa ký ức không đạt chuẩn (có chứa 「·」「：」, khoảng trắng, chữ Nhật, ký tự toàn giác, hoặc bị trùng lặp trong cùng một đợt), tiện ích sẽ tự động làm sạch trước chứ không báo lỗi toàn bộ đợt là 「Khóa ký ức bị trùng lặp hoặc không an toàn」 nữa.

### 9.3 Quy tắc (Kho Quy Tắc Chư Thiên)

- **Bối cảnh thế giới bổ sung**:
  - 「Đọc danh mục sách」 liệt kê các Sách Thế Giới trong quán rượu;
  - Chọn một cuốn, nhấn 「Đọc cuốn sách này」 để làm bối cảnh bổ sung cho Lilith;
  - 「Chỉ dùng quy tắc tích hợp」: Không dùng bối cảnh bổ sung.
- **Tra cứu mục từ hoàn chỉnh**: Tra cứu toàn văn quy tắc bản gốc theo từ khóa (nhiệm vụ, tay đấm, hộp mù, thả thời gian…).

### 9.4 Trò chuyện riêng, Chạm tương tác & Tranh đứng

- **Trò chuyện riêng**: Nhấn vào Lilith nổi hoặc ảnh đại diện để mở cửa sổ Lilith là có thể trò chuyện riêng với cô ấy (sử dụng cấu hình API của 「Lilith」). Nội dung trò chuyện riêng được lưu trong cuộc trò chuyện này.
- **Chạm tương tác** (Có thể tắt trong Cài đặt):
  - Chạm / vuốt ve qua lại trên các bộ phận của tranh đứng: sẽ có lời thoại và biểu cảm tăng dần theo từng cấp;
  - Nhấn giữ yên 0.65 giây: phản ứng nhấn giữ;
  - Trên màn hình cảm ứng ánh mắt sẽ dõi theo ngón tay;
  - Trên điện thoại sẽ có phản hồi rung.
- **Chế độ tranh đứng** (Cài đặt → Trợ lý hệ thống; bản 1.1.4 trở về trước gọi là nhóm 「Lilith」):
  - Hoạt ảnh phân lớp bản gốc (Giả Live2D);
  - Bản gốc + Biểu cảm biến thể (chuyển đổi theo giọng điệu);
  - Live2D thật (cần tự chuẩn bị mô hình Cubism, gắn kết tại 「Cài đặt Tranh đứng / Live2D ›」).
- **Sau khi đổi thiết lập nhân vật (1.1.5)**: Lilith nổi, tranh đứng phân lớp, biểu cảm biến thể và chạm tương tác chỉ thuộc về Lilith; các thiết lập nhân vật khác sử dụng ảnh đại diện tròn (ở góc trên bên trái thiết bị đầu cuối và nút đánh thức), vị trí tranh đứng hiển thị ảnh đại diện nhân vật kèm hiệu ứng phát sáng nhịp thở nhẹ nhàng. Trò chuyện riêng vẫn dùng bình thường, tiêu đề cửa sổ và tên đối phương đổi thành tên nhân vật mới.
- **Nhân vật giao diện**: Nói một câu khi vào trang hệ thống; đưa ra phản ứng với nhiệm vụ / vật phẩm / công pháp đang chọn và kết quả kết toán thành bại; góc máy ở trang hệ thống là bán thân, ở bàn làm việc là toàn thân, ở trò chuyện riêng là cận cảnh khuôn mặt (tất cả đều có thể tắt riêng từng mục).

---

## 10. Trang Thiết bị đầu cuối

### 10.1 Kết nối (Cổng AI)

- **Cấu hình cổng định sẵn (Preset)** (Khung thả xuống phía trên): Chọn một mục để tải lên; nhấn 「Xóa」 để xóa cấu hình định sẵn hiện tại.
- Hai phương thức:
  - **API riêng biệt (Khuyên dùng)**: Điền địa chỉ cổng tương thích OpenAI (thường kết thúc bằng /v1), khóa API, model (có thể nhấn 「Lấy danh sách model」 hoặc tự điền);
  - **Dùng trực tiếp model quán rượu đang dùng**: Không cần điền địa chỉ; nhưng mỗi yêu cầu sẽ chiếm dụng cuộc trò chuyện chính, khi cuộc trò chuyện chính đang tạo phản hồi thì phải chờ nó.
- 「Kiểm tra kết nối」「Lưu」.
- 「Lưu thành cấu hình định sẵn」: Cần điền tên cấu hình trước (ví dụ 「Trạm API A」).
- **API theo từng tính năng** (Tùy chọn): Mỗi tính năng có thể chọn riêng 「Theo mặc định / API chính hiện tại của quán rượu / Một cấu hình định sẵn nào đó」, hoặc nhấn 「Dùng thông tin điền ở trên」. Các tính năng bao gồm:
  - Nhập hàng AI Thương Thành Vạn Giới, Rút Hộp mù, Hồ Ước Nguyện, Tay Đấm Chư Thiên, Chỉnh lý túi đồ / Dung luyện, Đánh giá bậc năng lực, Giám định phẩm giai;
  - Nhóm chat (Trò chuyện nhóm, Trò chuyện riêng với thành viên, Lệnh Chiêu Mộ, Giáng lâm, Treo bán);
  - Ghi bổ sung khối dữ liệu, Trò chuyện riêng với Lilith, Chỉnh lý ký ức, Bàn làm việc.
- **Cài đặt nâng cao**:
  - Đầu ra tối đa mặc định / định sẵn (tokens, bao gồm cả phần suy nghĩ; để trống sẽ do từng tính năng quyết định, có thể ghi đè theo từng tính năng);
  - Những tính năng nào dùng bộ cổng kết nối này (Tính năng AI thanh trạng thái / Lilith).
- Nửa dưới trang 「Thiết lập kết nối với Lilith」 là biểu mẫu cổng kết nối Lilith bản gốc: Địa chỉ, Key, Model, Độ dài đầu ra tối đa, cùng các nút 「Lưu cấu hình kết nối」「Kiểm tra kết nối」「Hủy yêu cầu kết nối」.
- Khóa API chỉ lưu trong quán rượu và trình duyệt của riêng bạn, không ghi vào lịch sử trò chuyện và cũng không bị xuất ra ngoài.

### 10.2 Trạng thái

- Kiểm tra môi trường quán rượu, ranh giới quyền hạn.
- 「Gợi ý ký ức có hiệu lực ở lượt tiếp theo」: Phần ký ức sẽ được tiêm vào ở lượt tiếp theo.
- 「Bản ghi yêu cầu bàn làm việc」.

### 10.3 Cẩm nang / Hướng dẫn (1.1.4)

Chính là tài liệu này. Ô tìm kiếm phía trên có thể tìm theo tên tính năng hoặc nút bấm (nhiều từ cách nhau bằng dấu cách); mục lục có thể thu gọn, nhấn vào tên chương sẽ nhảy tới chương đó.

### 10.4 Cài đặt

Xem Chương 11. Phía trên trang Cài đặt có ô tìm kiếm (ví dụ tìm 「nổi」「Sách Thế Giới」「quá thời gian」).

### 10.5 Công tắc tính năng (1.1.5)

Cài đặt → Bắt đầu → 「Công tắc tính năng ›」. Xem Chương 19.

### 10.6 Thiết lập nhân vật Trợ lý hệ thống (1.1.5)

Cài đặt → Bắt đầu → 「Thiết lập nhân vật Trợ lý hệ thống ›」. Xem Chương 18.

---

## 11. Giải thích từng mục Cài đặt

### 11.1 Thường dùng

| Nhóm | Cài đặt / Nút bấm | Công dụng |
|---|---|---|
| Bắt đầu | Hướng dẫn tân thủ › | Mở lại hướng dẫn tân thủ. |
| Bắt đầu | Công tắc tính năng › (1.1.5) | Bảng tổng hợp toàn bộ tính năng, xem Chương 19. |
| Bắt đầu | Thiết lập nhân vật Trợ lý hệ thống › (1.1.5) | Lilith / Quả Cầu Ánh Sáng Hệ Thống / Tùy chỉnh, xem Chương 18. |
| Hiển thị | Khối dữ liệu hệ thống trong tầng trò chuyện | 「Thiết bị đầu cuối ghi sổ, tầng tin nhắn chỉ để lại nhãn nhỏ」 (khuyên dùng) hoặc 「Tắt (không xử lý khối dữ liệu)」. |
| Hiển thị | Nhãn nhỏ ở tầng tin nhắn 「Hệ thống đã ghi nhận」 | Công tắc bật/tắt nhãn nhỏ bên dưới tầng tin nhắn. |
| Hiển thị | Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại | Tự động (điện thoại toàn màn hình) / Luôn toàn màn hình / Cửa sổ nổi. |
| Prompt & Sách Thế Giới | Cài đặt / Gắn kết / Gỡ liên kết Sách Thế Giới › | Quản lý Sách Thế Giới 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」. Trước khi nâng cấp sẽ giải thích ảnh hưởng và tự động sao lưu; những nội dung, công tắc, từ khóa và cài đặt chèn do bạn tự sửa đều được giữ nguyên. |
| Prompt & Sách Thế Giới | Gỡ liên kết Sách Thế Giới một chạm | Gỡ liên kết khỏi nhân vật / cuộc trò chuyện hiện tại. |
| Prompt & Sách Thế Giới | Bản lưu Chư Thiên tự động cài đặt và gắn kết Sách Thế Giới | Công tắc. |
| Prompt & Sách Thế Giới | Nhắc AI ghi nhận xuyên việt | Mỗi lượt nhắc AI viết Thế giới hiện tại / Loại thế giới. |
| Sổ cái & Bản lưu | Khởi tạo cuộc trò chuyện mới | Tạo sổ cái Chư Thiên hoặc bù đủ các mục còn thiếu cho cuộc trò chuyện hiện tại (`/zt init`). |
| Sổ cái & Bản lưu | Di chuyển bản lưu cũ / Hoàn tác sổ cái › | Di chuyển bản lưu v1.1; hoàn tác về 1 trong 5 bản sao lưu sổ cái gần nhất. |
| Sổ cái & Bản lưu | Giám định phẩm giai › | Xem 5.6. |
| Sổ cái & Bản lưu | Xuất / Nhập bản lưu › | Xuất sổ cái, ký ức, cài đặt (không bao gồm khóa API). Khi nhập sẽ kiểm tra tính hợp lệ trước và xem trước những gì sắp bị ghi đè; sau khi xác nhận sẽ sao lưu sổ cái hiện tại trước rồi mới ghi. |
| Kết nối | Cài đặt cổng AI (Trang Kết nối) | Chuyển tới trang 「Kết nối」. |
| Trợ lý hệ thống | Cửa sổ nổi (Đổi kiểu dáng) | Tự động / Lilith nổi / Ảnh đại diện / Đã đóng. |
| Trợ lý hệ thống | Đóng cửa sổ nổi › | Đóng cửa sổ nổi (sẽ hỏi xác nhận trước). |
| Trợ lý hệ thống | Kích thước Lilith nổi, Kích thước cửa sổ nổi ảnh đại diện | 20%–100%. |
| Trợ lý hệ thống | Chế độ tranh đứng | Xem 9.4. |
| Thế giới & Trình diễn | Chủ đề giao diện | Theo thế giới hiện tại / Chư Thiên / Tiên hiệp / Cyberpunk / Quỷ dị (chỉ đổi màu sắc và trang trí, vị trí nút bấm không đổi). |
| Thế giới & Trình diễn | Bảng màu | Tử Dạ, Mặc Kim, Thanh Từ, Phi Anh, Sương Lam, Xích Hà, Thạch Mặc, hoặc Theo chủ đề. |
| Thế giới & Trình diễn | Trình diễn | Trình diễn đầy đủ (≤2 giây, có thể bỏ qua) / Chỉ hiện thẻ kết quả / Tắt. |
| Thế giới & Trình diễn | Hiển thị thẻ gợi ý cốt truyện ở góc trò chuyện khi thiết bị đầu cuối đóng | Công tắc. |
| Công tắc tiện ích | Tắt tiện ích một chạm | Tắt toàn bộ tiện ích (có thể bật lại trong phần cài đặt tiện ích mở rộng). |
| Tu hành · Độ thuần thục | Báo cho AI hiệu quả thực tế ở giai đoạn hiện tại của từng môn công pháp | Xem 4.4. |
| Tu hành · Độ thuần thục | Tích lũy thực chiến | Khi trong chính văn có dùng công pháp nhưng khối dữ liệu ghi sót, tự động ghi bù một lượng nhỏ độ thuần thục (Phàm phẩm +3 / Linh phẩm +2 / Tiên phẩm · Thần phẩm +1, mỗi tầng tối đa 2 môn; khi tạo lại sẽ hoàn tác theo phản hồi cũ). |
| Tu hành · Độ thuần thục | Tự động đồng bộ công pháp thẻ nhân vật (chỉ tăng không giảm) | Sau khi tắt có thể nhập thủ công ở trang Tu hành. |
| Giám định phẩm giai | Nhắc AI ghi rõ phẩm giai khi thu lục | Mỗi lượt thêm 1 dòng gợi ý. |
| Giám định phẩm giai | 「收录:Tên công pháp[Phẩm giai cao hơn]」 có thể hiệu chỉnh phẩm giai công pháp cốt truyện | Chỉ tăng không giảm, chỉ có hiệu lực với công pháp không phải do hệ thống ban cho. |
| Nâng cao · Quản trị viên | Bảng điều khiển Quản trị viên › | Sửa trực tiếp sổ cái (Điểm Hệ Thống, tài nguyên, bảo hiểm hộp mù, hảo cảm, v.v.), hãy cẩn trọng khi dùng. Chỉ ghi những mục đã sửa; nếu sổ cái có thay đổi trong thời gian đó sẽ từ chối ghi. |

### 11.2 Cài đặt nâng cao (Mở rộng 「Cài đặt nâng cao」)

| Cài đặt | Công dụng |
|---|---|
| Đóng khi nhấn ra ngoài thiết bị đầu cuối | Chỉ điện thoại / Luôn luôn / Không bao giờ. |
| Cử chỉ quay lại trên điện thoại đóng thiết bị đầu cuối | Công tắc. |
| Không gửi khối dữ liệu tầng cũ cho AI (tiết kiệm token) | Khi tạo phản hồi sẽ loại bỏ khối dữ liệu của các tầng cũ khỏi prompt (bản thân lịch sử trò chuyện không bị sửa). |
| Giữ lại khối dữ liệu của mấy tầng mới nhất | Mặc định là 2. |
| Thời gian chờ API độc lập | 60–600 giây (model suy luận khuyên dùng từ 300 giây trở lên). |
| Macro biến số Sách Thế Giới `{{get_chat_variable::…}}` | Giúp các macro biến số trong Sách Thế Giới hoạt động được. |
| Thanh xem nhanh sổ cái phía trên ô nhập liệu | Công tắc HUD. |
| Phím tắt | Alt+Z / Alt+X / Alt+S. |
| Khung thoại độc quyền của Lilith (Làm đẹp khung thoại) | Kết xuất các dòng 「【Lilith】: “……”」 trong chính văn thành thẻ giọng nói. |
| Chạm tương tác chân thực / Phản hồi rung khi chạm | Xem 9.4. |
| Phản ứng nhân vật giao diện, Góc máy, Lời thoại trang, Thông báo bong bóng | Xem 9.4. |
| Cài đặt Tranh đứng / Live2D › | Gắn kết mô hình Live2D, biểu cảm biến thể. |
| Hiệu ứng chuyển động | Tự động / Đầy đủ / Tinh giản (khuyên dùng cho máy cấu hình thấp). |
| Xem trước trình diễn | Phát thử một lần trình diễn để xem hiệu ứng. |
| Tự động gỡ liên kết Sách Thế Giới khi tắt tiện ích | Cần SillyTavern 1.17+. |

### 11.3 Bảo vệ định dạng khối dữ liệu

| Cài đặt / Nút bấm | Công dụng |
|---|---|
| Tự động sửa khối dữ liệu của phản hồi mới | Chỉ sửa tầng vừa mới tạo: chuyển chính văn ra ngoài khối dữ liệu, thêm thẻ đóng còn thiếu, chuyển khối dữ liệu chỉ viết trong chuỗi suy nghĩ ra sau chính văn, chuẩn hóa cách viết thu lục công pháp. Nguyên văn được sao lưu ngay trong tầng đó. |
| Tự động ghi bổ sung khi thiếu khối dữ liệu | 「Chỉ ghi bổ sung khi bị thiếu」 sẽ gọi thêm 1 lần API bằng cổng 「Ghi bổ sung khối dữ liệu」; hoặc cũng có thể tắt đi. |
| Mỗi lượt nhắc AI định dạng khối dữ liệu | Một dòng gợi ý hệ thống; khi lượt trước bị lỗi, lời nhắc sẽ cụ thể hơn. |
| **Độ sâu chèn lời nhắc định dạng (1.1.4)** | Mặc định độ sâu là 1 (trước tin nhắn mới nhất). Độ sâu 0 là vị trí của bản 1.1.3 trở về trước, khi đặt chung với phần điền sẵn (prefill) / mở đầu chuỗi suy nghĩ của một số preset có thể làm rối định dạng. |
| Nhắc nhở khi học được công pháp trong cốt truyện nhưng chưa vào sổ | Bật thông báo nhắc nhở, có thể vào Thu nạp cốt truyện để đăng ký. |
| Ghi bổ sung khối dữ liệu tầng mới nhất | Để AI viết bổ sung khối dữ liệu thủ công dựa theo chính văn lượt này. |
| Khôi phục lần tự động sửa mới nhất | Khôi phục về nguyên văn của AI. |

### 11.4 Chẩn đoán & Bảo trì (Mở rộng 「Chẩn đoán & Bảo trì」)

| Nút bấm | Công dụng |
|---|---|
| **Kiểm tra tầng mới nhất: Tiện ích có can thiệp không? (1.1.4)** | Dùng khi thẻ chuỗi suy nghĩ biến mất hoặc tầng tin nhắn hiển thị bất thường. Sẽ liệt kê: có phải bản lưu Chư Thiên không; tầng mới nhất có bị Bảo vệ khối dữ liệu sửa đổi không (và có khôi phục được không); trong chính văn có mấy đoạn chuỗi suy nghĩ, trong khung suy luận có nội dung không; có phải do tiện ích kết xuất không; các prompt đang được **tất cả tiện ích mở rộng** tiêm vào hiện tại (vị trí / độ sâu / vai trò). Kết quả sẽ được sao chép vào bộ nhớ tạm, khi báo lỗi chỉ cần dán trực tiếp. |
| Chẩn đoán tương thích › | Kiểm tra phiên bản quán rượu, ngân sách Sách Thế Giới, tàn dư bản cũ, v.v.; 「Điều chỉnh một chạm」 ngân sách Sách Thế Giới. |
| **Đối chiếu và mở khóa sổ cái (1.1.4)** | Dùng khi xuất hiện thông báo 「Trạng thái ghi kết toán nguyên bản trước đó không rõ… đã đóng băng」, xem 13.2. |
| Sao chép thông tin chẩn đoán | Sao chép thông tin môi trường, khóa API sẽ tự động được che đi. |
| Tự kiểm tra trên điện thoại thật › | Kiểm tra bố cục, vùng an toàn, bộ gõ ngay trên điện thoại của bạn. |
| Tiếp quản bản cũ một chạm / Khôi phục bản cũ | Xem 1.3. |

---

## 12. Những thành phần trong tầng tin nhắn trò chuyện

### 12.1 Khối dữ liệu `<ZhuTianPanel>`

Mỗi lượt AI viết một khối dữ liệu `<ZhuTianPanel>…</ZhuTianPanel>` (Trường: Giá trị) ở cuối phản hồi. Tiện ích đọc xong sẽ ghi sổ, trong tầng tin nhắn chỉ để lại một nhãn nhỏ 「✧ Hệ thống đã ghi nhận Điểm Hệ Thống … Nhiệm vụ … Xem ›」. Nhấn vào nhãn nhỏ sẽ mở thiết bị đầu cuối và định vị tới tầng này.

- Mỗi tầng chỉ ghi sổ một lần. Khi tạo lại (swipe / reroll), trước tiên sẽ hoàn tác về sổ cái trước tầng này rồi mới ghi nhận phản hồi mới, tài nguyên sẽ không bị cộng dồn.
- Khối dữ liệu của tầng cũ không gửi cho AI (có thể tắt).

### 12.2 Khung thoại Lilith

Dòng 「【Lilith】: “……”」 trong chính văn sẽ hiển thị thành thẻ giọng nói có ảnh đại diện (có thể tắt). **1.1.4**: Lời thoại nằm trong chuỗi suy nghĩ sẽ không bị biến thành thẻ nữa.

### 12.3 Bảo vệ chuỗi suy nghĩ (1.1.4)

Nếu preset bạn dùng có xuất chuỗi suy nghĩ như `<think>` / `<thinking>`:

- Khi Bảo vệ khối dữ liệu sửa lỗi, chuỗi suy nghĩ nằm **bên ngoài** khối dữ liệu được giữ nguyên vẹn, các thẻ sẽ không bị chèn thêm, di chuyển hay xóa mất.
- **Bản nháp** khối dữ liệu viết bên trong chuỗi suy nghĩ sẽ bị vô hiệu hóa: thẻ được đổi sang ký tự toàn giác `＜ZhuTianPanel＞`, việc đọc không bị ảnh hưởng nhưng sẽ không bị coi là khối dữ liệu chính thức nữa. Trước đây bản nháp kiểu này sẽ ghép cặp với thẻ đóng của khối dữ liệu chính thức, nuốt mất cả `</think>`, chính văn lẫn khối dữ liệu chính thức — đó chính là nguyên nhân thực sự gây "mất thẻ chuỗi suy nghĩ" ở bản 1.1.3.
- Khi khối dữ liệu chỉ được viết bên trong chuỗi suy nghĩ, nó sẽ được chuyển ra sau chính văn, bản thân chuỗi suy nghĩ không thay đổi.
- Khi phản hồi bị cắt cụt và chuỗi suy nghĩ chưa đóng thẻ: tầng này sẽ không tự sửa và cũng không ghi bổ sung.
- Khi hiển thị, ghi sổ và lọc prompt cho các tầng cũ (lưu trước bản 1.1.4), các bản nháp trong chuỗi suy nghĩ cũng sẽ được bỏ qua.
- Cuộc trò chuyện không phải Chư Thiên: tiện ích không xử lý (chỉ xử lý bản lưu Chư Thiên hoặc tầng có chứa khối dữ liệu).

---

## 13. An toàn sổ cái

### 13.1 Khóa ghi dữ liệu

Mọi thao tác trừ điểm, phát thưởng, nhập kho đều tiến hành theo quy trình 「Khóa → Ghi → Đọc lại từ máy chủ để đối chiếu」. Cùng một thời điểm chỉ có một thao tác được ghi; mở hai tab cùng lúc cũng không bị trừ điểm lặp lại.

### 13.2 Đóng băng & 「Đối chiếu và mở khóa sổ cái」 (1.1.4)

- Khi nội dung đọc lại sau khi ghi không khớp với nội dung đã ghi, sổ cái sẽ **đóng băng** để ngăn gửi lặp lại. Thông báo hiển thị là 「Trạng thái ghi kết toán nguyên bản trước đó không rõ, đã đóng băng mọi thao tác ghi sổ cái của cuộc trò chuyện này」.
- Bản 1.1.4 đã sửa lỗi đóng băng nhầm: trước đây biến số của thẻ / kịch bản khác thay đổi hoặc quá trình lưu trễ của quán rượu đều bị coi là ghi thất bại. Hiện tại chỉ đối chiếu những mục được sửa trong lần ghi này; khi không khớp sẽ tự động lưu lại và đọc lại một lần trước.
- Nếu thực sự bị đóng băng: Vào Cài đặt → Chẩn đoán & Bảo trì → 「**Đối chiếu và mở khóa sổ cái**」.
  - Bản lưu trên máy chủ và trang hiện tại **khớp nhau**: Mở khóa trực tiếp, không cần làm mới trang. Nếu thao tác vừa rồi chưa có hiệu lực, chỉ cần thực hiện lại một lần là được.
  - **Không khớp**: Sẽ liệt kê các mục khác biệt và hỏi có muốn tải lại trang hay không. Sau khi tải lại sẽ lấy bản lưu trên máy chủ làm chuẩn và tự động gỡ đóng băng.

### 13.3 Sao lưu & Hoàn tác

- Trước mỗi lần ghi quan trọng, tự động giữ lại 5 bản sao lưu sổ cái gần nhất: Cài đặt → 「Di chuyển bản lưu cũ / Hoàn tác sổ cái ›」.
- Xuất / Nhập bản lưu: Sổ cái, ký ức, cài đặt (không bao gồm khóa API).

---

## 14. Câu hỏi thường gặp

**Thông báo 「Trạng thái ghi kết toán nguyên bản trước đó không rõ… đã đóng băng」?**
Cài đặt → Chẩn đoán & Bảo trì → 「Đối chiếu và mở khóa sổ cái」. Xem 13.2.

**Thông báo 「Chỉnh lý ký ức thất bại: Khóa ký ức bị trùng lặp hoặc không an toàn」?**
Bản 1.1.4 đã sửa lỗi này, khóa ký ức sẽ được tự động làm sạch trước. Nếu sau khi cập nhật vẫn xuất hiện, vui lòng dùng 「Sao chép thông tin chẩn đoán」 để phản hồi.

**Thẻ chuỗi suy nghĩ biến mất / bị "nuốt mất"?**
1. Trước tiên hãy dùng Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra tầng mới nhất: Tiện ích có can thiệp không?」.
2. Nếu báo cáo nói rằng chính văn **chưa bị sửa đổi** và tầng tin nhắn **không phải do tiện ích kết xuất**, thì phần lớn là do preset, tiện ích mở rộng khác hoặc kịch bản Regex gây ra; hãy tắt từng cái một rồi thử lại.
3. Nếu là bản lưu Chư Thiên, còn 2 điểm nữa có thể kiểm tra:
   - Giữ 「Độ sâu chèn lời nhắc định dạng」 ở mức 1;
   - Trong Sách Thế Giới 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 có 3 mục thường trực được chèn ở độ sâu 0 (04 Khối dữ liệu thanh trạng thái & Dữ liệu thời gian thực, 05 Bổ sung quy tắc thanh trạng thái, 34 Thước đo thực lực thống nhất & Quy chuẩn báo giá, tổng cộng khoảng 3,700 chữ), sẽ xếp sau tin nhắn cuối cùng. Nếu preset của bạn dựa vào tin nhắn cuối cùng hoặc phần điền sẵn (prefill) để mở đầu chuỗi suy nghĩ, bạn có thể đổi độ sâu của 3 mục này trong Sách Thế Giới thành 1 hoặc 2 rồi thử lại.

**Phản hồi của Nhóm chat bị cắt cụt?**
Vào Việc nhóm → 「Tạo trò chuyện nhóm」 để tăng giới hạn đầu ra, hoặc giảm số chữ mỗi tin / số người phát biểu tối đa. Lượt bị cắt cụt có thể nhấn 「↻ Reroll」.

**Muốn xóa / muốn làm lại tin nhắn nhóm?**
Dùng 「🗑 Quản lý」 để xóa từng tin, dùng 「↻ Reroll」 để tạo lại lượt mới nhất. Lì xì / quà tặng đã nhận không thể thu hồi.

**Muốn đổi Lilith thành hệ thống khác / không muốn thiết lập nhân vật Succubus?**
Cài đặt → 「Thiết lập nhân vật Trợ lý hệ thống」 chọn 「Quả Cầu Ánh Sáng Hệ Thống (Số hiệu)」 hoặc 「Tùy chỉnh」, lưu lại là có hiệu lực ngay; bất cứ lúc nào cũng có thể 「Đổi lại về Lilith」. Tệp Sách Thế Giới sẽ không bị sửa đổi.

**Có một số tính năng không dùng tới, muốn tắt đi?**
Cài đặt → 「Công tắc tính năng」. Dữ liệu của các tính năng bị tắt đều được giữ nguyên; những trang không dùng có thể ẩn khỏi thanh điều hướng.

**Nhóm chat có thể kéo nhân vật trong Sách Thế Giới của tôi vào không?**
Được: Nhóm chat → Thành viên → 「Triệu hồi từ Sách Thế Giới」 (xem 8.2).

**Rút thẻ chậm quá?**
Hãy dùng chế độ 「Gộp cổ điển」: chỉ gọi 1 yêu cầu duy nhất để tạo toàn bộ vật phẩm không bị gộp.

**AI trả lời không có khối dữ liệu?**
Hãy bật 「Tự động ghi bổ sung khi thiếu khối dữ liệu」, hoặc nhấn thủ công 「Ghi bổ sung khối dữ liệu tầng mới nhất」.

**Trên điện thoại thiết bị đầu cuối quá nhỏ / quá to?**
Vào Cài đặt → 「Cửa sổ thiết bị đầu cuối & trò chuyện riêng trên điện thoại」, hoặc dùng nút 「Toàn màn hình / Cửa sổ nổi」 trên thanh tiêu đề.

---

## 15. Lệnh gạch chéo (Slash commands)

| Lệnh | Tác dụng |
|---|---|
| `/zt open [trang]` | Mở thiết bị đầu cuối; `status`, `shop`, `bag` là lối tắt tới các trang thường dùng |
| `/zt status` / `/zt shop` / `/zt bag` | Mở trực tiếp Tổng quan / Thương thành / Túi đồ |
| `/zt init` | Khởi tạo hoặc bù đủ sổ cái Chư Thiên cho cuộc trò chuyện hiện tại |
| `/zt world` | Cài đặt, gắn kết, gỡ liên kết Sách Thế Giới |
| `/zt backup` | Di chuyển bản lưu cũ / Hoàn tác sổ cái |
| `/zt export` | Xuất / Nhập bản lưu |
| `/zt diag` / `/zt copydiag` | Chẩn đoán tương thích / Sao chép thông tin chẩn đoán (khóa API tự động che) |
| `/zt selftest` | Tự kiểm tra trên điện thoại thật |
| `/zt points` | Trả về Điểm Hệ Thống hiện tại (có thể nối ống lệnh trong STscript) |
| `/zt live2d` / `/zt live2d off` | Chuyển sang tranh đứng Live2D thật / Chuyển về hoạt ảnh phân lớp bản gốc |

1.1.5: Sau khi tắt 「Lệnh gạch chéo /zt」 trong 「Công tắc tính năng」, lệnh `/zt` sẽ chỉ trả lời “Đã tắt”.

---

## 16. Dữ liệu được lưu ở đâu

| Dữ liệu | Vị trí |
|---|---|
| Sổ cái Chư Thiên (gồm Nhóm chat, thế giới, đồng bộ công pháp) | Tệp trò chuyện `chatMetadata.variables.诸天系统` |
| Ký ức / Trò chuyện riêng của Lilith | `chatMetadata.variables.诸天记忆助手_v1` v.v. |
| Bản ghi cấp cuộc trò chuyện của tiện ích (chứng từ, 5 bản sao lưu sổ cái gần nhất) | `chatMetadata.zhutianCovenantTerminal` |
| Nguyên văn trước khi tự động sửa tầng tin nhắn, dấu hiệu ghi bổ sung | `extra.zhutianCovenantTerminal` của tầng tin nhắn |
| Cài đặt tiện ích (gồm thiết lập nhân vật `persona` của 1.1.5, công tắc tính năng `modules` / `navHidden`, Sách Thế Giới nhóm chat `groupWorld`; ảnh đại diện nhân vật sau khi nén cũng lưu tại đây) | Cài đặt tiện ích mở rộng `zhutian-covenant-terminal` |
| Nguồn gốc thành viên nhóm được triệu hồi từ Sách Thế Giới (Tên sách + Mã mục + Tên mục) | Trường `来源` của thành viên nhóm chat trong sổ cái |
| Cấu hình API (gồm khóa API, **sẽ không bị xuất ra**) | Biến toàn cục `诸天系统_API`, `诸天系统_API路由`, `诸天记忆助手_v1_API` của Lilith |

Tiện ích sẽ không bao giờ ghi khóa API vào lịch sử trò chuyện, và cũng không tải lên bất kỳ dữ liệu nào.

---

## 17. Chưa xác minh / Giới hạn

- **Model thật**: Tất cả tính năng AI mới chỉ được nghiệm thu bằng model mô phỏng (Thử nghiệm).
- **Thiết bị thật**: Bố cục điện thoại mới chỉ được nghiệm thu trong trình mô phỏng di động của trình duyệt không giao diện (headless), chưa thử nghiệm trên iOS / Android thật. Có thể dùng 「Tự kiểm tra trên điện thoại thật」 để kiểm tra.
- **Chưa nhấn thử từng mục**: Các nút thanh toán của Thần thông, Phái Khiển Phân Thân, Động Thiên Tùy Thân, rút thẻ với số lần tùy chỉnh.
- **Các ứng dụng chủ khác như TauriTavern**: Chưa thử nghiệm.
- **Trò chuyện nhóm của quán rượu**: Không hỗ trợ.
- Mô hình Live2D của bản thân Lilith cần người dùng tự gắn kết thủ công.
- Nhận diện cắt cụt của Nhóm chat chỉ có hiệu lực với API độc lập (API chính của quán rượu không trả về nguyên nhân kết thúc).
- **1.1.5**: **Hiệu quả nhập vai** của thiết lập nhân vật tùy chỉnh, Quả Cầu Ánh Sáng Hệ Thống, triệu hồi từ Sách Thế Giới và tiêm ký ức thành viên nhóm mới chỉ được nghiệm thu bằng model mô phỏng; việc thay thế thiết lập nhân vật vào Sách Thế Giới phụ thuộc vào sự kiện `WORLDINFO_ENTRIES_LOADED` của SillyTavern (các bản 1.16–1.19 đều có), trên ứng dụng chủ không có sự kiện này sẽ chuyển sang tiêm một gợi ý ghi đè. Những chỗ nhắc tới 「Lilith」 trong các mục khác của Sách Thế Giới sẽ được thay thế cơ học bằng tên nhân vật mới (bao gồm cả nội dung hướng người lớn của bản gốc), nếu muốn loại bỏ triệt để vui lòng tự viết quy tắc cốt truyện trong phần 「Nâng cao: Thay thế toàn đoạn」, hoặc chỉnh sửa trực tiếp Sách Thế Giới.

---

## 18. Thiết lập nhân vật Trợ lý hệ thống (1.1.5)

Cài đặt → Bắt đầu → 「Thiết lập nhân vật Trợ lý hệ thống ›」.

| Định sẵn | Mô tả |
|---|---|
| Lilith (Mặc định) | Bản gốc: Sứ ma Succubus tóc bạc. Khi chọn mục này tiện ích **không thay đổi bất cứ thứ gì**, giống hệt bản 1.1.4. |
| Quả Cầu Ánh Sáng Hệ Thống (Số hiệu) | Không có hình người, là một quả cầu ánh sáng mang số hiệu; bình tĩnh, ngắn gọn, thông báo theo từng mục. Tên mặc định là 「Hệ Thống + Số hiệu」, ảnh đại diện là quả cầu ánh sáng có số hiệu được tạo tự động. |
| Tùy chỉnh | Tên, cách xưng hô, tính cách, cách nói chuyện, ảnh đại diện đều do bạn tự viết. |

Các mục trên trang:

| Mục | Công dụng |
|---|---|
| Tên | Định dạng lời thoại trong cốt truyện sẽ đổi thành `【Tên】: “……”`, khung thoại, giao diện và trò chuyện riêng đều dùng tên này. Quả cầu ánh sáng để trống = Hệ Thống + Số hiệu; Tùy chỉnh để trống = Trợ lý hệ thống. Khi điền cần ít nhất 2 ký tự (1 ký tự sẽ dễ nhận nhầm các câu như 「Ta nói: “……”」 trong chính văn thành lời thoại hệ thống). |
| Số hiệu (Quả cầu ánh sáng) | Số hiệu hiển thị trên quả cầu ánh sáng, tối đa 8 chữ cái / chữ số. |
| Cách xưng hô với bạn | Mặc định là 「Ký chủ」. |
| Tên tiếng Anh | Phụ đề bên dưới tiêu đề thiết bị đầu cuối (vốn là LILITH), có thể để trống. |
| Tải ảnh đại diện lên / Dùng mặc định | Chọn một bức ảnh, tự động cắt thành hình vuông và nén về 256 pixel; khi không có ảnh đại diện sẽ dùng hình quả cầu ánh sáng. |
| Tính cách & Thiết lập, Cách nói chuyện | Đưa vào quy tắc cốt truyện và thiết lập trò chuyện riêng. Quả cầu ánh sáng để trống sẽ dùng mặc định. |
| Nâng cao: Thay thế toàn đoạn | Để trống = Tự động tạo. Nếu điền vào sẽ thay thế toàn bộ đoạn quy tắc cốt truyện (mục Sách Thế Giới 02｜Cốt lõi｜Trợ lý hệ thống Lilith) hoặc prompt hệ thống trò chuyện riêng. Vui lòng giữ lại định dạng lời thoại và các ràng buộc như 「trò chuyện riêng không sửa sổ cái」. |
| Xem trước | Mở rộng để xem quy tắc cốt truyện và thiết lập trò chuyện riêng được tạo tự động. |
| Lưu & Áp dụng / Hủy thay đổi / Đổi lại về Lilith / Quay lại Cài đặt | Sau khi lưu, lần tạo phản hồi tiếp theo, trò chuyện riêng và giao diện sẽ có hiệu lực ngay lập tức mà không cần làm mới trang. |

Phạm vi có hiệu lực:
- **Cốt truyện**: Mỗi khi tạo phản hồi, tiện ích tạm thời thay thế quy tắc Lilith trong Sách Thế Giới 「Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới」 bằng quy tắc nhân vật mới, chữ 「Lilith」 trong các mục khác cũng được đổi thành tên nhân vật mới, đồng thời ở cuối quy tắc nhân vật sẽ đính kèm một đoạn 「Đối chiếu xưng hô」: chữ 「Lilith」 trong các tầng cũ, tin nhắn gửi từ thanh trạng thái hay ký ức cũ đều chỉ thiết lập nhân vật hiện tại. Tệp Sách Thế Giới không bị sửa đổi; khi đổi lại về Lilith sẽ khôi phục ngay lập tức.
- **Trò chuyện riêng / Ký ức / Bàn làm việc**: Thay thế thiết lập hệ thống của Lilith trong các yêu cầu gửi đi (nội dung bạn viết không bị sửa).
- **Giao diện**: Tên, ảnh đại diện, khung thoại, tiêu đề trò chuyện riêng đều đổi theo. Lilith nổi, tranh đứng phân lớp và chạm tương tác chỉ thuộc về Lilith, các thiết lập nhân vật khác sử dụng nút đánh thức dạng ảnh đại diện tròn (khi 「Cửa sổ nổi」 đặt là Tự động / Lilith nổi thì cũng hiển thị ảnh đại diện tròn).
- Các lời thoại cũ và lịch sử trò chuyện riêng cũ đã ghi vào cuộc trò chuyện sẽ không bị sửa đổi.

---

## 19. Công tắc tính năng (1.1.5)

Cài đặt → Bắt đầu → 「Công tắc tính năng ›」. Toàn bộ tính năng nằm trên một bảng, thay đổi có hiệu lực ngay lập tức (trừ các mục ghi 「Có hiệu lực sau khi làm mới」), các tính năng bị tắt **vẫn giữ nguyên toàn bộ dữ liệu**, bật lại là khôi phục như cũ. Phía trên có ô tìm kiếm và nút 「Bật tất cả」.

| Nhóm | Công tắc | Sau khi tắt |
|---|---|---|
| Trợ lý hệ thống | Cửa sổ Trợ lý hệ thống (Có hiệu lực sau khi làm mới) | Không có cửa sổ bản gốc, bàn làm việc, ký ức, quy tắc, trò chuyện riêng và tự động ký ức; các trang khác của thiết bị đầu cuối vẫn hoạt động bình thường. |
| Trợ lý hệ thống | Cửa sổ nổi | Trên trang không hiển thị lối vào nổi (vẫn có thể mở thiết bị đầu cuối từ trình đơn tiện ích mở rộng, phím tắt, nhãn nhỏ ở tầng tin nhắn). |
| Trợ lý hệ thống | Khung thoại / Chạm tương tác / Rung / Phản ứng nhân vật giao diện / Lời thoại trang / Góc máy / Thông báo bong bóng | Các hiệu ứng trình diễn tương ứng sẽ không xuất hiện nữa. |
| Tầng trò chuyện & Khối dữ liệu | Ghi sổ khối dữ liệu hệ thống | Tiện ích không xử lý khối dữ liệu trong cốt truyện nữa, sổ cái sẽ không tự động vào sổ từ cốt truyện. |
| Tầng trò chuyện & Khối dữ liệu | Nhãn nhỏ ở tầng tin nhắn / Không gửi khối dữ liệu tầng cũ cho AI / Tự động sửa / Ghi bổ sung khi thiếu / Nhắc định dạng / Gợi ý công pháp cốt truyện / Macro biến số / Tự động cài đặt Sách Thế Giới / Tự động gỡ liên kết khi tắt tiện ích | Giống các cài đặt tương ứng tại Chương 11. |
| Gợi ý cốt truyện | Ghi nhận xuyên việt / Gợi ý phẩm giai / Hiệu chỉnh phẩm giai / Hiệu quả độ thuần thục / Tích lũy thực chiến / Đồng bộ công pháp thẻ nhân vật | Không đính kèm quy tắc này cho AI chính văn nữa. |
| Gợi ý cốt truyện | Phụ trợ tự tạo | Ẩn trang 「Tự tạo」, quy tắc của các phụ trợ đang bật không gửi cho AI nữa (bản thân phụ trợ vẫn được giữ lại). |
| Nhóm chat | Nhóm chat | Ẩn trang Nhóm chat, không tiêm tóm tắt nhóm chat vào chính văn nữa, không tự động tán gẫu nữa; mục 「36｜Liên kết｜Nhóm Chat Chư Thiên (Tiện ích)」 mà tiện ích cài vào Sách Thế Giới Chư Thiên cũng không gửi cho chính văn nữa (chỉ bỏ qua lúc tạo phản hồi, tệp Sách Thế Giới không bị sửa). |
| Nhóm chat | Tự động tán gẫu sau cốt truyện (Công tắc tổng) | Tất cả cuộc trò chuyện đều không tự động tán gẫu (trong từng cuộc trò chuyện vẫn có công tắc riêng). |
| Nhóm chat | Đọc Sách Thế Giới | Không có mục 「Triệu hồi từ Sách Thế Giới」, trò chuyện nhóm không đính kèm dữ liệu mục từ nữa. |
| Nhóm chat | Tiêm ký ức thành viên nhóm | Chính văn không nhận được 「Ký ức thành viên nhóm」 nữa. |
| Giao diện & Thao tác | Xem nhanh sổ cái / Phím tắt / Lệnh gạch chéo / Tự động bật Hướng dẫn tân thủ / Chủ đề thế giới / Trình diễn / Thẻ gợi ý cốt truyện | Các tính năng tương ứng ngừng hoạt động. |
| Trang thiết bị đầu cuối | Từng trang điều hướng | Ẩn khỏi thanh điều hướng (Tổng quan, Cài đặt, Kết nối luôn được giữ lại; khi nhấn vào trang bị tắt sẽ có thông báo). |
| Công tắc theo cuộc trò chuyện | Chỉnh lý ký ức, Tiêm tóm tắt nhóm chat / Khoảng cách tán gẫu, Bật phụ trợ | Đi theo từng cuộc trò chuyện, nhấn 「Đi tới thiết lập」 để chuyển tới trang tương ứng. |
