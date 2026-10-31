# Nghiệm thu cài đặt từ Git kho lưu trữ mới · Đã đạt

> **Hồ sơ lịch sử (Điểm kiểm tra 0.2.0).** Tài liệu này ghi lại quá trình cài đặt bản 0.2.0 từ Git bằng giao diện nguyên bản của quán rượu vào ngày 2026-09-29, mục 「Giới hạn」 bên dưới cũng mô tả trạng thái tại thời điểm đó (ví dụ lúc đó AI nhập hàng/rút thẻ/bàn làm việc vẫn chưa di chuyển sang, những tính năng này từ bản 0.4.0 trở đi đã được di chuyển và nghiệm thu trên cả 4 phiên bản máy chủ).
> Nghiệm thu của phiên bản hiện tại xem tại [ACCEPTANCE-0.8.1](ACCEPTANCE-0.8.1.md): trên 1.16 và 1.19 đạt `native_v081` 20/20, `native_group060` 44/44; trên 1.19 đạt `native_v080` 33/33, `native_world070` 40/40, `native_terminal050` 58/58, `native_guards` đạt; kiểm tra logic thuần túy 101/101; 1.17 / 1.18 và `native_replace040` (cần tệp v1.1 nguyên bản) không chạy trong vòng này. Cách thức cài đặt không thay đổi, vẫn là điền địa chỉ kho lưu trữ vào mục 「Install extension」 trong bảng Tiện ích mở rộng.

Ngày: 2026-09-29

Kho lưu trữ: https://github.com/abcxyzeric/chu-thien-thiet-bi-dau-cuoi-khe-uoc-lilith

Commit mã nguồn tính năng lần này: `a7678ddd8ea527c5b749239c06a70e27409b95c1`

## Bản ghi thực thi thực tế

1. Nhập gói Git bundle đã đối chiếu mã băm vào thư mục kho lưu trữ mới tách biệt với dự án cũ; không đưa các tệp JSON nhập cục bộ, khóa API hay dữ liệu máy chủ của dự án cũ vào kho lưu trữ mới.
2. Sử dụng xác thực Git có sẵn trên máy để chạy `git push --dry-run origin main`, sau khi thành công chạy `git push -u origin main` bình thường, mã thoát bằng 0; không sử dụng `force push`.
3. Truy vấn độc lập `git ls-remote` từ một môi trường khác, xác nhận nhánh `main` từ xa đúng là commit nêu trên.
4. **Xóa bản sao tiện ích mở rộng thủ công cũ trong quán rượu cô lập trước**, sau đó gửi yêu cầu qua giao diện cài đặt nguyên bản của SillyTavern:
   ```json
   {"url":"https://github.com/abcxyzeric/chu-thien-thiet-bi-dau-cuoi-khe-uoc-lilith","global":false}
   ```
5. `/api/extensions/install` trả về **HTTP 200**, vị trí cài đặt thực tế:
   ```text
   data/default-user/extensions/zhutianxitongchajianban
   ```
   Trả về phiên bản manifest **0.2.0** và đúng tên thư mục. Git HEAD thực tế trùng khớp với commit mã nguồn từ xa.
6. Sau khi làm mới trang quán rượu, chỉ có duy nhất một lối vào nguyên bản; lần này không còn dựa vào các tệp ở thư mục cũ nữa. Quá trình cài đặt đạt 0 `pageerror`.
7. Đối với **tiện ích mở rộng thực tế được nhân bản (clone) từ Git** này, lần lượt vượt qua lại toàn bộ:
   - `native_acceptance.py`: kết xuất phân lớp nguyên bản, tin nhắn người chơi trong chính văn, tải lại trang và vòng đời.
   - `native_guards.py`: chống gửi trùng lặp, tệp đính kèm, thay đổi lịch sử và lỗi kiểm nghiệm lưu.
   - `native_views.py`: 7 khung nhìn điện thoại, lùi về ảnh tĩnh, bật/tắt nhanh và chuyển đổi bản nháp đang lấy tiêu điểm.
   - `native_ledger.py`: 17 nhóm kiểm tra sổ cái thực tế, giao dịch, chứng từ chính văn và tiêm lỗi.
   - `native_ledger_guards.py`: khóa thẻ cùng nguồn, bản xem trước hết hạn và chuyển đổi nhân vật trong lúc chờ phản hồi lưu.

Cả 5 nhóm kịch bản trình duyệt đều vượt qua với **0 pageerror**. Kết quả gốc và ảnh chụp màn hình nằm trong `docs/evidence/`.

Điều này xác minh quá trình cài đặt từ Git thông qua giao diện nguyên bản (sử dụng cùng một backend với giao diện cài đặt tiện ích mở rộng), không phải dùng cách sao chép thư mục để thay thế cho cài đặt Git, và cũng không phải máy chủ giả.

Các commit tiếp theo chỉ cập nhật tài liệu nghiệm thu, ảnh chụp màn hình/kết quả và trường báo cáo kiểm thử, các tệp chạy tính năng vẫn giống hệt mã nguồn kiểm thử nêu trên; không dựa vào đó để tuyên bố đã hoàn thành toàn bộ tính năng của bản gốc.

## Giới hạn

- Chỉ mới nghiệm thu đường dẫn cài đặt theo người dùng của tài khoản mặc định trên SillyTavern 1.19.0.
- Chưa kiểm chứng toàn bộ các phiên bản khác, mọi tổ hợp quyền hạn đa tài khoản hay hiệu năng trên điện thoại vật lý.
- Chưa từng gọi mô hình thật. Các năng lực như AI nhập hàng/rút thẻ/bàn làm việc/tự động chỉnh lý ký ức… vẫn được liệt kê là chờ di chuyển theo ma trận tính năng.
- Điểm kiểm tra này chưa phải là bản phát hành chính thức đầy đủ tính năng; chưa tạo GitHub Release tuyên bố bản ổn định.
