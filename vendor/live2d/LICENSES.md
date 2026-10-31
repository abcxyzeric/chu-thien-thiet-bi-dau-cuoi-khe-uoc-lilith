# Thành phần bên thứ ba và giấy phép trong vendor/live2d

Thư mục này chỉ chứa các thành phần mã nguồn mở **được phép tự do phân phối lại**. Thư viện chạy độc quyền **Cubism Core** của Live2D **không được đóng gói kèm**, người dùng cần tự tải về.

| Tệp | Nguồn | Phiên bản | Giấy phép | SHA-256 |
| --- | --- | --- | --- | --- |
| `pixi.min.js` | npm `pixi.js` (`dist/pixi.min.js`) | 6.5.10 | MIT | `403f2f2ee8145fa17f60c5c89403056efe2680e5096ec2762036486914ed19c5` |
| `cubism4.min.js` | npm `pixi-live2d-display` (`dist/cubism4.min.js`) | 0.4.0 | MIT (bên trong có chứa Live2D Cubism Framework, xem bên dưới) | `af1267e6d52759b245766c578d905bfa025b532d5c3cc727c370957c4409e21b` |

## Cubism Core (Không đóng gói kèm)

- `live2dcubismcore.min.js` là phần mềm độc quyền của Live2D Inc., chịu sự ràng buộc của **Live2D Proprietary Software License Agreement**:
  <https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html>
- Tiện ích này **không phân phối** Core. Chỉ sau khi người dùng tích chọn đồng ý giấy phép trong phần Cài đặt, tiện ích mới tải tệp này từ `https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js`
  hoặc từ địa chỉ do chính người dùng điền (ví dụ bản sao đặt trong `data/<người_dùng>/user/files/` của quán rượu); khi chưa tích chọn sẽ không gửi bất kỳ yêu cầu nào.
- Trang tải chính thức: <https://www.live2d.com/download/cubism-sdk/download-web/>. Tài liệu của `pixi-live2d-display` cũng nêu rõ liên kết trực tiếp chính thức “không đảm bảo phù hợp cho môi trường sản xuất”,
  nếu sử dụng lâu dài nên tải về rồi đặt vào thư mục `user/files`.

## Live2D Cubism Framework

`cubism4.min.js` có đóng gói phần **Framework** (thành phần mã nguồn mở) của Live2D Cubism SDK for Web, điều khoản sử dụng là
**Live2D Open Software License Agreement**: <https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html>.
Khi phát hành tác phẩm của riêng mình có sử dụng mô hình Live2D, bạn còn phải tuân thủ **SDK Release License** của Live2D
(<https://www.live2d.com/en/sdk/license/>): cá nhân / doanh nghiệp quy mô nhỏ có doanh thu hằng năm dưới 10 triệu Yên Nhật thông thường được phát hành miễn phí, các trường hợp khác cần ký hợp đồng với Live2D.
Bản thân tiện ích này không đính kèm bất kỳ mô hình `.moc3` nào; mô hình do người dùng tự tải lên có bản quyền và điều khoản sử dụng do tác giả mô hình đó quyết định.

## Mô hình dùng khi kiểm thử

Quá trình nghiệm thu trình duyệt sử dụng mô hình mẫu chính thức của Live2D là “Haru” (`haru_greeter_t03`), chỉ đặt trong thư mục `user/files` của máy chủ kiểm thử cô lập, **không đưa vào kho lưu trữ này**.

---

## pixi.js 6.5.10 — MIT

```
The MIT License

Copyright (c) 2013-2017 Mathew Groves, Chad Engler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## pixi-live2d-display 0.4.0 — MIT

```
MIT License

Copyright (c) 2020 Guan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
