# Tư liệu tách nền Lilith nổi · Thuyết minh nguồn gốc (1.0.0)

Thư mục này chứa bộ tư liệu ảnh trong suốt của Lilith nổi trên điện thoại (`src/lilith-float.js`, Cài đặt → Lilith nổi), được tạo bởi
`tools/lilith_float_cutout.py` từ bộ tư liệu nguyên bản đã có sẵn trong kho lưu trữ, các hằng số tọa độ được ghi trong `src/lilith-float-art.js`.

## Đầu vào

| Đầu vào | Thuyết minh |
| --- | --- |
| `ZhuTianLilithLayers` trong `vendor/original/assistant-v1.1.js` | Ảnh đứng phân lớp 636×948 của bản gốc v1.1: nền `plate`, `wings`, `tail`, `body`, các mảnh vá biểu cảm `faces`. **Tư liệu của tác giả gốc**, bản quyền thuộc về tác giả gốc. |
| `assets/lilith/variants/sad.webp` | Biểu cảm tủi thân (`sad`): trong bộ phân lớp nguyên bản không có, được lấy từ vùng khuôn mặt của ảnh đứng biến thể AI (xem `assets/lilith/variants/PROVENANCE.md`). |
| Mô hình tách nền `isnet-anime.onnx` | Mô hình phân đoạn nhân vật anime do `rembg` phát hành (<https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-anime.onnx>), chỉ dùng khi tạo ảnh, **không phân phối kèm theo kho lưu trữ**. |

## Xử lý

1. Ghép `plate` + `wings` + `tail` + `body` thành ảnh hoàn chỉnh rồi đưa vào `isnet-anime` để lấy mặt nạ (mask) nhân vật.
2. Nếu chỉ dùng riêng mô hình sẽ làm mất cánh và để lại sương tím: lấy giá trị nhỏ hơn giữa kênh alpha có sẵn của lớp `body` và mặt nạ mô hình, sau đó chỉnh mức sắc độ (0.45–0.90) để loại bỏ cặn nền còn sót lại.
3. Chỉ lấy phần từ đầu đến phần trên đùi `(0,0)-(636,700)`, làm mờ dần (feather) 22% ở cạnh dưới để khi lơ lửng không bị vết cắt cứng.
4. Xuất riêng hai chiếc cánh (mỗi cánh có trục xoay riêng để vỗ nhẹ khi lơ lửng); các mảnh vá biểu cảm xuất nguyên trạng theo tọa độ gốc (biểu cảm tủi thân được căn chỉnh khớp theo khuôn mặt).
5. Toàn bộ đều ở định dạng WebP (có kênh trong suốt alpha). Không dùng bất kỳ mô hình hình ảnh nào để vẽ lại nhân vật; mọi điểm ảnh đều lấy từ bộ phân lớp nguyên bản hoặc ảnh đứng biến thể đã có.

Tạo lại: `python3 tools/lilith_float_cutout.py /path/to/isnet-anime.onnx` (cần `onnxruntime`, `numpy`, `Pillow`).

## Tệp và mã kiểm tra

| Tệp | Kích thước | sha256 |
| --- | --- | --- |
| `body.webp` | 636×700 | `35c0aabfd4f268f68680c1f54e405442d1c20b2e79a280b2325e2b036177c1db` |
| `face-blink.webp` | 126×58 | `47aa2d0ddf25fb55a8d82c0366d499092fb403be70bb7111ea57077758641652` |
| `face-pout.webp` | 147×127 | `a1bfbe28b6b2c8d20ae292efe574b5bc8ae95bd5e272194edb51e3c8aae5c835` |
| `face-sad.webp` | 148×128 | `4e6bc9564a015e4365b1b51d7baaace62c8eda85a055c26c1df93b38b368b1d8` |
| `face-shy.webp` | 148×128 | `4f468b67a93bb7a1f17f15bbf7b864b45e7b0e85c5ee7c39a1d5a03caaf303eb` |
| `face-smile.webp` | 126×121 | `ab0c8198c49d96455cbfe7af7b47ff585690c00ec99109eff9cd9a66bedf89c4` |
| `face-smug.webp` | 147×128 | `d6c717d6da8fd1d79c87c6da2170ebaf8b29ab7a52d01532f5151d0f27c85fd0` |
| `face-surprised.webp` | 129×127 | `0382929ef15bcc2bcfdccfaf79697c61d3d18e5c5725a044bfad0f907833ee6a` |
| `face-talk.webp` | 133×58 | `a25b0459c43ea557c4796bd1cd7c5435383bb66f8b8c673f62b59b42c80f1ee4` |
| `face-wink.webp` | 147×127 | `235a7e95d127ea14a4c6e3390684658ac4315ff1815928ba7cb06a33acceb308` |
| `wingl.webp` | 100×391 | `69fcab77c6bab5f7b766f36ddbeaa4c94a04c5719f665f2ad3afb1ac2ca5bf1f` |
| `wingr.webp` | 130×561 | `47f4e573e4498aaf36ec3251cbf0db2cb7c636e91078b734ee8e4f6898e230fe` |

`tests/v100.test.js` sẽ đối chiếu từng mã `sha256` trong bảng trên. Điều kiện sử dụng tư liệu xem tại tệp `LICENSE` ở thư mục gốc của kho lưu trữ: quyền đối với ảnh đứng nguyên bản vẫn thuộc về tác giả gốc,
tiện ích này chỉ hiển thị khi cài đặt sử dụng, nghiêm cấm trích xuất riêng để phân phối lại.
