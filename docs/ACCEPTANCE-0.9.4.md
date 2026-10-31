# Nghiệm thu trình duyệt trên máy chủ thực tế 0.9.4

## Môi trường

- **Máy chủ**: SillyTavern 1.19.0 (cài đặt mới hoàn toàn theo tag chính thức, commit `7e8663c`), sử dụng thư mục dữ liệu cô lập.
- **Hai lượt kiểm thử**:
  - **Không cài đặt Tavern Helper**: chạy toàn bộ các bộ kiểm thử trình duyệt (`native_replace040` cần tệp nhập nguyên bản v1.1 nên đợt này không chạy).
  - **Có cài đặt Tavern Helper** (JS-Slash-Runner 4.11.2, tag GitHub chính thức, không chỉnh sửa, trên trang `TavernHelper.getTavernHelperVersion()` = `4.11.2`): chạy `native_v094`, `native_group060`, `native_v093`.
- **Trình duyệt**: Playwright Chromium (headless), mô phỏng cảm ứng điện thoại 390×844 (UA Android 14 / Chrome). Ô nhập liệu dùng gõ bàn phím thực sự (`keyboard.type`), hộp chọn thả xuống dùng `select_option`.
- **Mô hình mô phỏng**: cổng 5001 trả về bình thường (khi trong yêu cầu có 「Thanh Khâu」 sẽ trả về Bạch Thiển), cổng 5002 không gửi tiêu đề CORS.

Suốt quá trình không sử dụng API Key thật, lịch sử trò chuyện thật hay tệp nhập nguyên bản v1.1.

## Người dùng kiểm thử lại

**Chờ bổ sung.** Sau khi cập nhật lên bản 0.9.4: Nhóm chat → Thành viên → Phát Lệnh Chiêu Mộ, giữ nguyên 「Thế giới ngẫu nhiên」, nhập tên một thế giới vào ô nhập liệu, hộp chọn thả xuống sẽ tự động đổi thành 「Chỉ định thế giới」; sau khi bấm 「Phát hành」, người được chiêu mộ sẽ đến từ thế giới này.

## Tái hiện: So sánh 0.9.3 và 0.9.4 (`native_v094.py`)

Cùng một kịch bản chạy trên mã 0.9.3 trước (đạt 3/9), sau đó chạy trên mã 0.9.4 (đạt 9/9).

| Kịch bản | 0.9.3 | 0.9.4 |
| --- | --- | --- |
| Gợi ý trong ô nhập liệu | “Tên thế giới hoặc nhân vật (để trống khi ngẫu nhiên)” | ✅ “Không cần điền khi chọn ngẫu nhiên; nhập tên sẽ tự động đổi thành 「Chỉ định thế giới」”; khi chọn chỉ định thế giới / chỉ định nhân vật thì gợi ý cũng thay đổi theo |
| Đang chọn 「Thế giới ngẫu nhiên」 mà nhập 「Thanh Khâu」 | ❌ Hộp chọn thả xuống vẫn là Thế giới ngẫu nhiên | ✅ Tự động đổi thành 「Chỉ định thế giới」, văn bản được giữ nguyên |
| Sau đó đổi thủ công thành 「Chỉ định nhân vật」 | Được | ✅ Được, văn bản được giữ nguyên |
| Chuyển về lại 「Thế giới ngẫu nhiên」 | ❌ Văn bản vẫn còn đó (nhưng sẽ không được sử dụng) | ✅ Ô nhập liệu được xóa trống |
| Chọn 「Chỉ định nhân vật」 nhưng không điền tên mà bấm phát hành | ❌ Trừ 100 điểm và gửi yêu cầu đi | ✅ Thông báo “Khi chỉ định nhân vật vui lòng điền tên nhân vật.”, không trừ phí, không gửi yêu cầu mô hình |
| Đang ở ngẫu nhiên, nhập 「Thanh Khâu」 rồi bấm phát hành | ❌ Yêu cầu gửi đi là “đến từ thế giới loại 「…」”, chiêu mộ ra Diệp Thanh Hàn (Vấn Kiếm Tông) — khớp với mô tả của người dùng | ✅ Yêu cầu gửi đi là “một nhân vật đến từ thế giới 「Thanh Khâu」”, trừ 100 điểm, chiêu mộ được Bạch Thiển (Thanh Khâu) |
| Chọn 「Thế giới ngẫu nhiên」 không điền tên rồi bấm phát hành | Thế giới loại ngẫu nhiên | ✅ Không đổi, vẫn là thế giới loại ngẫu nhiên |
| Lỗi trang | Không có | ✅ Không có |

Ở lượt chạy 0.9.3, hạng mục 「Chỉ định nhân vật」 được tính là đạt vì văn bản gợi ý cũ cũng có chữ “tên nhân vật”; về mặt hành vi thì bản 0.9.3 vốn đã cho phép chọn thủ công chỉ định nhân vật, hạng mục này không phải tính năng mới.

## Hồi quy

**Không cài đặt Tavern Helper** (toàn bộ bộ kiểm thử, SillyTavern 1.19.0):

| Bộ kiểm thử | Kết quả |
| --- | --- |
| native_group060 | 44/44 |
| native_guards | Đạt (exit 0, không có lỗi trang) |
| native_terminal050 | 58/58 |
| native_v080 | 33/33 |
| native_v081 | 20/20 |
| native_v082 | 24/24 |
| native_v083 | 13/13 |
| native_v084 | 29/29 |
| native_v085 | 20/20 |
| native_v090 | 24/24 |
| native_v091 | 35/35 |
| native_v092 | 14/14 |
| native_v093 | 29/29 |
| native_v094 | 9/9 |
| native_world070 | 40/40 |

**Có cài đặt Tavern Helper 4.11.2**: native_v094 9/9, native_group060 44/44, native_v093 29/29.

Hai bước vốn có trong `native_group060` là 「Chỉ định thế giới Thanh Khâu → Bạch Thiển」 và 「Ngẫu nhiên + ô nhập trống → thành viên thứ ba」 vẫn đạt bình thường: bài kiểm thử đó chọn chế độ trước rồi mới điền chữ, nên cơ chế tự động chuyển đổi và xóa trống của bản 0.9.4 không ảnh hưởng tới trình tự này.

## Kiểm tra tĩnh

- `npm test`: 208/208 đạt (thêm mới `tests/v094.test.js` 5 hạng mục).
- `npm run check`: Đạt (dựng lại runtime đồng nhất, mã băm nguồn đồng nhất).
- `npm run filelist` / `npm run filelist:check`: Đã cập nhật và đồng nhất (203 tệp).
- Toàn bộ tệp văn bản под quản lý phiên bản đều dùng ngắt dòng LF; không có nội dung nhạy cảm như API Key.

## Chưa xác minh

- Mới chỉ chạy trên SillyTavern 1.19.0; các bản 1.16–1.18 đợt này không chạy lại (lần này chỉ sửa logic biểu mẫu của trang Nhóm chat, không liên quan tới giao diện máy chủ).
- Không có máy thật Android / iOS hay TauriTavern; hành vi dưới bộ gõ điện thoại (ghép chữ Pinyin/Telex) mới chỉ được mô phỏng bằng gõ trực tiếp trên Chromium máy tính. Trong lúc đang ghép chữ, trình duyệt cũng phát sự kiện `input`, nên hộp chọn thả xuống có thể chuyển đổi ngay khi gõ chữ cái đầu tiên — đây là hành vi đúng như dự kiến.
- Không kết nối mô hình thực tế; kết quả chiêu mộ đến từ mô hình mô phỏng.
