# Thay đổi 0.9.4 (Cải tiến nhỏ: Ô nhập liệu Lệnh Chiêu Mộ tự động chuyển theo chế độ)

Phản hồi từ người dùng (không phải lỗi mà là một bất tiện nhỏ): Trong Nhóm chat → Thành viên → Phát Lệnh Chiêu Mộ, khi đang chọn 「Thế giới ngẫu nhiên」, dù nhập gì vào ô nhập liệu bên cạnh cũng không có tác dụng, người được chiêu mộ ra vẫn đến từ thế giới ngẫu nhiên. Người dùng đề xuất hai phương án: khi ở chế độ ngẫu nhiên thì khóa không cho nhập, hoặc khi nhập chữ vào thì tự động đổi sang chế độ chỉ định. Phiên bản này áp dụng phương án thứ hai. Kết quả nghiệm thu xem tại [ACCEPTANCE-0.9.4](ACCEPTANCE-0.9.4.md).

- Các trường sổ cái, mục từ Sách Thế Giới, khóa lưu trữ và mục cài đặt đều không thay đổi, **không cần nhập lại Sách Thế Giới**.
- Mã nguồn v1.1 nguyên bản (`vendor/original`) giữ nguyên cấu trúc.

## Nguyên nhân

Lệnh Chiêu Mộ có ba chế độ: Thế giới ngẫu nhiên, Chỉ định thế giới, Chỉ định nhân vật. Ô nhập liệu bên cạnh lúc nào cũng cho phép gõ chữ với gợi ý “Tên thế giới hoặc nhân vật (để trống khi ngẫu nhiên)”. Tuy nhiên khi chế độ ngẫu nhiên tạo yêu cầu gửi đi lại hoàn toàn không đọc ô nhập liệu này, khiến cái tên người dùng điền vào khi đang để chế độ ngẫu nhiên bị âm thầm bỏ qua, hệ thống vẫn trừ 100 điểm và chiêu mộ một người từ thế giới ngẫu nhiên.

## Thay đổi (`src/hub-group.js`)

- **Gõ chữ tự động chuyển chế độ**: Khi đang chọn 「Thế giới ngẫu nhiên」 mà nhập chữ vào ô nhập liệu, chế độ sẽ lập tức đổi thành 「Chỉ định thế giới」 và giữ nguyên văn bản vừa nhập. Sau đó bạn vẫn có thể đổi thủ công sang 「Chỉ định nhân vật」.
- **Chuyển về ngẫu nhiên tự động xóa trống**: Khi chọn thủ công về lại 「Thế giới ngẫu nhiên」, hệ thống sẽ xóa trống ô nhập liệu vì chế độ ngẫu nhiên không dùng tới nó.
- **Văn bản gợi ý (placeholder) thay đổi theo chế độ**:
  - Thế giới ngẫu nhiên: “Không cần điền khi chọn ngẫu nhiên; nhập tên sẽ tự động đổi thành 「Chỉ định thế giới」”
  - Chỉ định thế giới: “Tên thế giới, ví dụ: Đấu La Đại Lục”
  - Chỉ định nhân vật: “Tên nhân vật, ví dụ: Tôn Ngộ Không”
- **Kiểm tra lại một lần nữa trước khi phát hành** (hàm thuần mới `recruitMode`, thực thi trước khi trừ phí chiêu mộ):
  - Đang ở chế độ ngẫu nhiên nhưng lại có tên (ví dụ trình duyệt tự động điền, hoặc kịch bản sửa giá trị): xử lý như Chỉ định thế giới.
  - Đang ở chế độ Chỉ định thế giới / Chỉ định nhân vật nhưng lại không điền tên: hiện thông báo “Khi chỉ định thế giới vui lòng điền tên thế giới.” / “Khi chỉ định nhân vật vui lòng điền tên nhân vật.”, **không trừ 100 điểm, cũng không gửi yêu cầu mô hình**.
  - Độ dài tên vẫn giới hạn tối đa 30 ký tự.
- Ô nhập liệu được bổ sung `aria-label` để trình đọc màn hình đọc được công dụng của nó.

Lý do không chọn phương án “vô hiệu hóa ô nhập liệu khi ở chế độ ngẫu nhiên”: làm vậy khi người dùng muốn chỉ định sẽ phải đổi hộp chọn thả xuống trước rồi mới được gõ, tốn thêm một bước; hơn nữa ô nhập liệu bị vô hiệu hóa trên điện thoại bấm vào không có phản ứng sẽ rất dễ khiến người dùng tưởng nhầm là giao diện bị hỏng.

## Kiểm thử

- `tests/v094.test.js` (mới, 5 hạng mục): các trường hợp của `recruitMode`, khi chế độ ngẫu nhiên có kèm tên thì trong yêu cầu ghi đúng thế giới đó, đấu nối giao diện (văn bản gợi ý, gõ chữ chuyển chế độ, chuyển về xóa trống, kiểm tra trước rồi mới trừ phí), mục trong bảng năng lực.
- `tests/native_v094.py` (mới, 9 hạng mục): SillyTavern thực tế + mô hình mô phỏng, điện thoại 390×844, sử dụng gõ bàn phím thực sự của Playwright.
- `tests/version.test.js`: cập nhật số phiên bản lên 0.9.4.

## Tài liệu

- README, FEATURE_MATRIX (thêm một dòng ở mục 「II.6」), bảng năng lực trong `src/contracts.js` thêm 「Ô nhập liệu Lệnh Chiêu Mộ đi theo chế độ」.
