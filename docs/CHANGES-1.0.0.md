# Thuyết minh cập nhật 1.0.0

Nâng cấp trực tiếp từ 0.9.4 lên 1.0.0 (theo quyết định thiết kế: không phát hành bản trung gian hay rc, nghiệm thu bằng mô hình mô phỏng, mức tối thiểu vẫn hỗ trợ SillyTavern 1.16).
Phương án và sự đánh đổi xem tại Mục 6 trong [PLAN-1.0](PLAN-1.0.md).

## I. Lilith nổi trên điện thoại: Nhân vật tách nền, không còn là thẻ nhỏ

- Dùng tranh đứng phân lớp của bản gốc v1.1 (`ZhuTianLilithLayers`: plate, wings, tail, body, mảnh vá biểu cảm) ghép thành ảnh hoàn chỉnh, đưa qua mô hình phân đoạn nhân vật anime `isnet-anime` để lấy mặt nạ nhân vật, sau đó lấy giá trị nhỏ hơn với độ trong suốt sẵn có của lớp `body` để loại bỏ phông nền, ánh sao và màn sương tím bên ngoài mái tóc; chỉ lấy phần từ đầu tới đùi trên, làm mờ dần ở cạnh dưới. Công cụ: `tools/lilith_float_cutout.py`.
- Tài nguyên: `assets/lilith/float/` (cơ thể, cánh trái/phải, 9 mảnh vá biểu cảm, tổng cộng 12 tấm WebP), hằng số tọa độ `src/lilith-float-art.js`, nguồn gốc và mã băm sha256 xem tại `assets/lilith/float/PROVENANCE.md`.
- Lớp nổi không có nền thẻ hay khung viền, chỉ có bóng đổ bám sát đường nét nhân vật và ánh hào quang tím nhạt; vùng có thể bấm là phần giữa cơ thể nhân vật chứ không phải toàn bộ hình chữ nhật.
- Chuyển động sống động: nhịp thở, lơ lửng lên xuống, hai chiếc cánh vỗ quanh gốc cánh, khi kéo đi cánh vỗ nhanh hơn và cơ thể nghiêng theo hướng kéo; ở biểu cảm bình tĩnh cứ 2.5–6 giây chớp mắt một lần, khi nói chuyện miệng đóng mở; nhấn đúp (chọc) sẽ đổi biểu cảm, nảy nhẹ một cái và vỗ cánh.
- Tương tác giống hệt bản 0.8.2–0.9.0: bấm đơn mở thiết bị đầu cuối, nhấn giữ để kéo, kéo ra mép để ẩn nấp (lộ ra một phần), khi thiết bị đầu cuối đang mở sẽ đứng ở góc dưới, cài đặt kích thước (55%–100%).
- Sửa lỗi: Khi đang nấp ở mép mà cần nói chuyện (ví dụ lời thoại phản ứng trong thiết bị đầu cuối), cô ấy sẽ ló ra trước rồi mới nói, bong bóng thoại không còn bị khuất một nửa ở ngoài màn hình nữa.

## II. Phân tầng & Tìm kiếm cài đặt

- Trang Cài đặt được chia làm ba nhóm: **Thường dùng** (hiển thị trực tiếp), **Cài đặt nâng cao**, **Chẩn đoán & Bảo trì** (mặc định thu gọn, trên tiêu đề ghi rõ có bao nhiêu mục).
  Phím tắt, bóc tách lời nhắc, macro, tự động gắn kết Sách Thế Giới, thời gian chờ, cử chỉ cảm ứng, Live2D, góc máy / lời thoại cốt truyện của Lilith, phạm vi trình diễn v.v. (khoảng 20 mục) được chuyển vào nhóm 「Nâng cao」; 「Nâng cao · Quản trị viên」 nằm trong Nâng cao, 「Tương thích & Bảo trì」 nằm trong Chẩn đoán. Các phân vùng cài đặt do mô-đun khác nối thêm mặc định được xếp vào nhóm Nâng cao.
- Ô tìm kiếm ở trên đầu: lọc theo tiêu đề và thuyết minh, khi gõ nhiều từ thì tất cả các từ phải cùng khớp; khi khớp với mục nằm trong nhóm đang thu gọn sẽ tự động mở rộng nhóm đó ra, sau khi xóa trống ô tìm kiếm sẽ tự động thu gọn lại; khi không tìm thấy sẽ hiển thị thông báo.

## III. Xuất / Nhập bản lưu, Phiên bản cấu trúc sổ cái, Quay lui

- **Cài đặt → Sổ cái & Bản lưu → Xuất / Nhập bản lưu** (cũng có thể nhập lệnh `/zt export`):
  - Xuất: tạo một tệp `诸天存档-năm_tháng_ngày_giờ_phút.json`, bao gồm cài đặt plugin và sổ cái Chư Thiên của cuộc trò chuyện hiện tại (nhóm chat, dấu chân Bản đồ sao đều nằm trong sổ cái), tùy chọn kèm theo bản lưu ký ức và lịch sử trò chuyện riêng với Lilith. **Không chứa API Key**: các trường có tên giống key / token / secret / password, các giá trị dạng `sk-…` / `Bearer …` đều bị loại bỏ, tham số truy vấn của URL cũng được cắt bỏ. Trên điện thoại nếu không bật tải xuống có thể bấm 「Sao chép văn bản bản lưu」.
  - Nhập: chọn tệp hoặc dán văn bản, hệ thống sẽ hiển thị bảng xem trước “Hiện tại → Sau khi nhập” (Điểm Hệ Thống, Thế giới hiện tại, Túi đồ, Nhiệm vụ, Thành viên nhóm chat, Dấu chân Vạn Giới, số mục cài đặt thay đổi); sau khi xác nhận sẽ **sao lưu sổ cái hiện tại trước**, rồi mới ghi dữ liệu và đọc lại đối chiếu từng mục; API Key đã lưu trên máy trong cài đặt sẽ không bị xóa mất.
  - Định dạng tệp có số phiên bản; tệp đến từ plugin phiên bản mới hơn, tệp hỏng hoặc JSON lạ đều sẽ đưa ra lý do từ chối dễ hiểu.
- **Phiên bản cấu trúc sổ cái**: Được ghi tại `chatMetadata.zhutianCovenantTerminal.ledgerSchema` (không nằm trong sổ cái nên AI không nhìn thấy và cũng không sửa được).
  - Kiểm tra khi mở cuộc trò chuyện: sổ cái cũ (do bản 0.9.x trở về trước ghi, đánh số 0) sẽ được sao lưu trước, sau đó chuẩn hóa lại kiểu dữ liệu theo bước di chuyển (Túi đồ / Kho nhiệm vụ / Dấu chân Vạn Giới / Điểm Hệ Thống) và đánh dấu là 1;
  - Sổ cái từng được ghi bởi plugin phiên bản mới hơn: mọi thao tác ghi của plugin hiện tại đều sẽ từ chối và báo “Chỉ đọc, vui lòng cập nhật plugin” để không làm hỏng dữ liệu.
- **Quay lui**: Khi bấm quay lui trong 「Di chuyển bản lưu cũ / Quay lui sổ cái」, trạng thái trước khi quay lui **luôn luôn** được sao lưu trước và giữ lại trong danh sách. Trong danh sách sao lưu hiển thị rõ lý do sao lưu (Trước khi nhập / Trước khi quay lui / Trước khi nâng cấp cấu trúc).

## IV. Thống nhất thông báo lỗi

- Thêm mới `src/errors.js`: thông báo khi thất bại được thống nhất theo cấu trúc 「Chuyện gì đã xảy ra. Sổ cái: …. Bước tiếp theo: ….」
  - Bị chặn lại ngay từ trước khi ghi (đã chuyển cuộc trò chuyện, trò chuyện nhóm ST, không đủ Điểm Hệ Thống, chưa điền thông tin, Web Locks không khả dụng, sổ cái chỉ đọc) → 「Sổ cái: Không có thay đổi」;
  - Quá hạn (timeout), lỗi mạng, lỗi 5xx, lỗi phân tích định dạng (chi phí của các yêu cầu này khi thất bại sẽ được hoàn lại) → 「Sổ cái: Không có thay đổi (chi phí đã được hoàn lại)」;
  - Đọc lại không khớp → 「Sổ cái: Có thể đã được ghi」, và chỉ dẫn tới chức năng quay lui sổ cái;
  - Các lỗi không nhận diện được sẽ không ghi trạng thái sổ cái để tránh kết luận bừa.

## V. Điện thoại

- **Điều hướng màn hình ngang**: Thanh điều hướng bên trái trước đây có hơn 20 lối vào phải cuộn mới tìm thấy; hiện chỉ đặt 6 mục thường dùng là Tổng quan / Nhiệm vụ / Thương thành / Túi đồ / Nhóm chat / Cài đặt, cộng thêm nút 「Thêm」. Trang đang mở luôn được hiển thị; sau khi chọn trang từ trong 「Thêm」 sẽ tự động thu gọn lại. Màn hình dọc giữ nguyên.
- **Hiệu ứng động** (Cài đặt → Cài đặt nâng cao → Hiệu ứng động): Tự động / Đầy đủ / Rút gọn.
  - Tự động: khi hệ thống bật “Giảm chuyển động”, hoặc thiết bị cảm ứng có tốc độ khung hình lấy mẫu trong 2 giây (sau khi khởi động 6 giây) thấp hơn 40 fps thì sẽ dùng chế độ Rút gọn; máy tính không tự động hạ cấp theo tốc độ khung hình.
  - Rút gọn: Lilith nổi không còn lơ lửng đung đưa, bóng đổ đơn giản hóa, miệng không cử động; hoạt ảnh trang trí thế giới, đóng/mở thiết bị đầu cuối và quầng sáng đồ phổ dừng lại; trình diễn chỉ hiển thị thẻ kết quả. Tính năng không đổi.

## VI. Khác

- Sửa lỗi `/zt init`: trước đây sau khi khởi tạo xong bịเปิด nhầm thêm hộp thoại Sách Thế Giới (do thiếu `return` trong `switch`).
- `/zt export`, `/zt import`: mở hộp thoại Xuất / Nhập bản lưu.
- **LICENSE**: Mã nguồn hiển thị công khai, bảo lưu mọi quyền. Cho phép cá nhân cài đặt, sử dụng và sửa đổi tự dùng; nghiêm cấm phân phối lại (kể cả bản sửa đổi), sử dụng thương mại, cũng như dùng nội dung kho lưu trữ để huấn luyện, tinh chỉnh (fine-tune), chưng cất, đánh giá, tạo bộ dữ liệu hoặc cơ sở tri thức RAG cho AI / học máy.
- **README** được tinh gọn xuống dưới 150 dòng; lịch sử từng phiên bản được chuyển sang `CHANGELOG.md` ở thư mục gốc; thêm mới `docs/UNINSTALL.md` (Gỡ cài đặt và quay lại phiên bản cũ).

## VII. Bổ sung từ phản hồi người chơi (Số phiên bản vẫn là 1.0.0)

Tiếp tục tối ưu hóa theo phản hồi của người chơi sau khi phát hành bản 1.0.0 mà không tăng số phiên bản.

### 1. Công pháp / vật phẩm nhận được trong cốt truyện không còn bị khóa chết ở Phàm phẩm (Giám định phẩm giai)

- **Nguyên nhân**: Động cơ 3.1 nguyên bản khi gặp dòng `收录:Tên công pháp` trong khối dữ liệu mà không ghi `[Phẩm giai]` sẽ nhất loạt ghi sổ là Phàm phẩm; sau đó dù có ghi lại `收录:Cùng tên[Tiên phẩm]` thì cũng bị bỏ qua vì công pháp đã tồn tại. Vật phẩm từ thẻ nhân vật, bản lưu cũ hoặc nguồn khác khi không có phẩm cấp cũng bị hiển thị và thu hồi theo mức Phàm phẩm.
- **Thêm mới trang 「Giám định phẩm giai」** (Cài đặt → Sổ cái & Bản lưu → Giám định phẩm giai; trên trang Tu hành, Tu hành · Độ thuần thục và Túi đồ đều có lối vào):
  Liệt kê toàn bộ công pháp và vật phẩm **không phải do hệ thống cấp** (nguồn gốc là thu lục, khối dữ liệu, bản lưu cũ, thẻ nhân vật, để trống……).
  - **AI Giám định**: Dựa theo tiêu chuẩn thống nhất của Chư Thiên (Phàm phẩm = vật của phàm nhân / võ học phàm tục, Linh phẩm = Võ đạo tông sư / Siêu phàm, Tiên phẩm = cấp thành phố tới đại lục, Thần phẩm = cấp hành tinh trở lên) để mô hình đưa ra 「Phẩm giai + Một câu lý do」. Đi qua 「API phân nhánh tính năng → Giám định phẩm giai」, nếu chưa cài đặt riêng sẽ dùng cổng mặc định.
  - **Sửa thủ công**: Chọn phẩm giai cao hơn từ hộp chọn thả xuống, xác nhận xong sẽ ghi vào sổ.
  - Chỉ tăng không giảm, cao nhất là Thần phẩm (giám định không cấp Cấm kỵ). Giới hạn trần của công pháp tăng theo phẩm giai (Phàm 100 / Linh 500 / Tiên 2000 / Thần 10000), xóa nhãn 「Viên Mãn」; vật phẩm sau khi đổi phẩm cấp **vẫn giữ nguyên giá thu hồi ban đầu** (chống lợi dụng đổi phẩm giai để cày điểm thu hồi), các vật phẩm cùng tên cùng phẩm cấp sẽ được gộp lại.
- **Dòng `收录:Tên công pháp[Phẩm giai cao hơn]` có thể đính chính công pháp cốt truyện**: Trong khối dữ liệu mới, khi viết phẩm giai cao hơn cho công pháp phi hệ thống đã có sẵn sẽ tự động nâng cấp (chỉ tăng không giảm, công pháp do hệ thống cấp không bị ảnh hưởng). Có thể tắt trong cài đặt.
- **Nhắc AI ghi rõ phẩm giai**: Mỗi lượt tiêm một dòng nhắc nhở (độ sâu 4) — khi thu lục hãy ghi `[Phẩm giai]` dựa theo uy lực bản thân của nó, nếu không ghi sẽ bị ghi sổ là Phàm phẩm. Có thể tắt trong cài đặt.

### 2. API phân nhánh tính năng (Mỗi nơi gọi mô hình đều có thể cấu hình riêng)

Trang Kết nối (Cài đặt → Cài đặt cổng AI) thêm mới vùng thu gọn 「API phân nhánh tính năng」, liệt kê toàn bộ 11 nơi: Nhập hàng thương thành, Rút thẻ / Hộp mù, Ước nguyện, Chiêu mộ đả thủ, Sắp xếp túi đồ / Lò Nung Vạn Vật, Đánh giá chiến lực, Giám định phẩm giai, Nhóm Chat Chư Thiên, Trò chuyện riêng Lilith, Tự động chỉnh lý ký ức Lilith, Bàn làm việc Lilith.
Mỗi mục có thể chọn: **Theo mặc định** / **API chính hiện tại của SillyTavern** / **Một cấu hình sẵn (preset)** / **Cấu hình riêng** (bấm 「Dùng thông tin điền ở trên」 để lưu địa chỉ, khóa bảo mật, mô hình trong biểu mẫu cho riêng mục này).

### 3. Cấu hình sẵn cổng kết nối (Không cần nhập đi nhập lại trạm API)

Đầu trang Kết nối thêm mới mục 「Cấu hình sẵn cổng kết nối」: chọn cấu hình sẵn từ hộp chọn thả xuống để điền địa chỉ / khóa bảo mật / mô hình vào biểu mẫu (bấm lưu thêm lần nữa để đổi cổng mặc định); bên dưới nhập tên cấu hình sẵn rồi bấm 「Lưu làm cấu hình sẵn」. Hỗ trợ tối đa 30 cấu hình sẵn.

### 4. Tắt plugin 1 chạm

Cài đặt → Thường dùng → 「Công tắc plugin」 → 「Tắt plugin 1 chạm」. Bật hộp thoại xác nhận trước (giải thích rõ sổ cái và cài đặt đều được giữ nguyên, Sách Thế Giới sẽ tự động gỡ gắn kết, cùng cách bật lại), sau khi xác nhận sẽ gọi `disableExtension` của chính SillyTavern.

### 5. Đóng Lilith nổi

- Khi kéo Lilith nổi, ở giữa đáy màn hình sẽ xuất hiện 「Kéo vào đây để đóng cửa sổ nổi」; kéo vào đó rồi thả tay → bật hộp thoại xác nhận. Trên máy tính cũng có thể nhấp chuột phải vào cô ấy: Mở Thiết Bị Đầu Cuối Chư Thiên / Giấu vào mép màn hình / Đóng cửa sổ nổi.
- Để mở lại: bấm nút 「Hiển thị Lilith nổi」 mới thêm trong bảng tiện ích mở rộng, hoặc vào 「Cài đặt → Lilith → Lilith nổi」 trong thiết bị đầu cuối.
