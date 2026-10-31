# Điểm cố định nguồn gốc và giao diện máy chủ

## Bản gốc

- Kho lưu trữ: https://github.com/falingzhi1-boop/zhutian-system-v1.1/tree/main/remote
- Commit: `3ee2db2e1388f9843335962c370888f746228d94`
- Mã băm 5 tệp gốc: `vendor/original/provenance.json`
- Mô-đun gốc sử dụng không gian tên riêng tư đóng gói (closure); tiêm hàm `atob` của nền tảng để giải mã trọng số hoạt ảnh gốc. Toàn văn mô-đun gốc không sửa đổi; bộ chuyển đổi Tavern Helper cũ không thực thi.
- Có thể chạy `python tools/extract_original.py` để tạo lại `runtime` hoàn toàn giống hệt từ các tệp gốc.

## SillyTavern

- Kho lưu trữ: https://github.com/SillyTavern/SillyTavern
- Bản 0.2.0 cố định tại 1.19.0 commit `06bde939fb1e9c4c8d8641d810f0a916b5bce127`; phạm vi hỗ trợ của bản 0.3.0 xem mục “Điểm cố định đa phiên bản 0.3.0” ở cuối bài.
- `public/scripts/extensions.js`: các hook trong manifest; `activate` trả về đồng bộ, quá trình khởi tạo bất đồng bộ do nội bộ tiện ích mở rộng đảm nhận.
- `public/scripts/st-context.js`: `getContext`, `chatMetadata`, `eventSource`, `saveChat`, `setExtensionPrompt`…
- `public/script.js`: **xuất nội bộ** `sendMessageAsUser(messageText,messageBias,insertAt=null,compact=false,name=name1,avatar=user_avatar)` và `is_send_press`. Không thể giả định `sendMessageAsUser` nằm trong `getContext`.
- `saveChatConditional` sẽ bắt ngoại lệ khi lưu, do đó việc Promise của nó hoàn tất không thể độc lập chứng minh đã ghi đĩa thành công. Tiện ích này đọc thêm `/api/chats/get` để đối chiếu chứng từ tin nhắn.
- `src/endpoints/chats.js`: POST `/api/chats/get`, thân yêu cầu gồm `avatar_url`, `file_name`, sử dụng tiêu đề CSRF của máy chủ.
- `/version` đọc trường `pkgVersion`. Từ bản 0.3.0 ngưỡng tối thiểu là 1.16.0 (`src/compat.js`), không còn khóa cứng ở 1.19.0 nữa.
- `public/lib/eventemitter.js`, `public/scripts/events.js`: `APP_READY` tự động kích hoạt cho cả các hàm lắng nghe đăng ký muộn; quá trình khởi tạo chờ `APP_READY`, khi tắt sẽ dọn dẹp các đăng ký lắng nghe.
- `public/scripts/chats.js`: ô nhập tệp đính kèm `file_form_input`; nếu có tệp đính kèm đang chờ xử lý sẽ từ chối lần gửi này.
- Bộ chọn hiển thị chính văn: `#chat .mes[mesid="i"] .mes_text`. Chỉ nối thêm nhãn không có hành vi thực thi, không viết lại chính văn của máy chủ.

## Tavern Helper: Chỉ tham khảo vị trí lưu trữ

- Kho lưu trữ: https://github.com/N0VI028/JS-Slash-Runner
- Commit `519599bc68247d8e759cc844a983f8f5252941a8`
- `src/function/variables.ts`: biến kiểu `chat` được lưu trong `chat_metadata.variables`.
- Chỉ dùng để xác minh ánh xạ lưu trữ; không cài đặt Helper vào máy chủ nghiệm thu, và cũng không phải là phụ thuộc chạy của các tính năng đã hiện thực hóa ở điểm kiểm tra này.

## Ranh giới giao diện

Đây là bộ chuyển đổi giao diện nội bộ có điểm cố định phiên bản rõ ràng, không phải API công cộng ổn định đa năng. Khi máy chủ nâng cấp trong tương lai bắt buộc phải đối chiếu lại giao diện, DOM và ngữ nghĩa lưu. Ảnh chụp nhanh ý định và khóa gửi trong mã nguồn chỉ bao phủ tiện ích mở rộng này; máy chủ hoặc các tiện ích mở rộng khác vẫn có thể chuyển đổi/ghi đè cuộc trò chuyện đồng thời. Điểm kiểm tra này có thể phát hiện một số thay đổi ngữ cảnh trong lúc gửi và đưa ra cảnh báo, nhưng chưa hiện thực hóa giao dịch nguyên tử xuyên tiện ích mở rộng hay xuyên thẻ trình duyệt.

## Các giao diện cố định thêm mới trong bản 0.2.0

- `src/endpoints/chats.js`: POST `/api/chats/save` nhận `avatar_url`, `file_name`, mảng `chat`; dòng đầu tiên là header/metadata gốc, các dòng sau là tin nhắn. Bắt cố định mục tiêu tường minh; `force:false`; yêu cầu phản hồi `ok:true`, sau đó đọc lại thực tế toàn bộ bản ghi dự kiến để đối chiếu.
- Tính toàn vẹn (`integrity`) của `/api/chats/save` không phải là phiên bản CAS tăng dần sau mỗi lần ghi, không tuyên bố giao dịch nguyên tử xuyên thiết bị.
- `public/script.js`: `ensureSwipes` không xử lý các tin nhắn `extra.isSmallSys`. Kết toán nguyên bản sử dụng cờ này để tránh việc giai đoạn hiển thị thêm trường swipe chưa ghi vào đĩa.
- `context.addOneMessage` chỉ dùng để hiển thị tin nhắn hệ thống đã lưu bền vững khi kết quả trên đĩa đã được xác minh và ngữ cảnh hiện tại chưa thay đổi, không gọi giao diện tạo văn bản.
- `src/endpoints/extensions.js`: lối vào cài đặt POST `/api/extensions/install`, tham số JSON gồm `url`, `global`, `branch` tùy chọn. Nghiệm thu cài đặt được tiến hành trên thực thể cô lập.
- Nhân gốc: 52 hàm và hằng số trong `vendor/original/ledger-kernel.js` được trích xuất từng đoạn từ `part2` gốc; quy hoạch phần thưởng vật phẩm và hàm gọi lại nhập túi được trích xuất từ trợ lý gốc. Phạm vi và mã băm xem tại `ledger-provenance.json`.
- Lớp phủ bảo mật bổ sung rõ ràng `任务实物凭据` vào bảng bảo vệ chỉ thị biến mô hình gốc; 5 tệp gốc không thay đổi từng byte.

## Điểm cố định đa phiên bản 0.3.0

Máy chủ nghiệm thu: 1.16.0 `e3b866b5`, 1.17.0 `e3f41666`, 1.18.0 `51ad27fb`, 1.19.0 `7e8663cd` (mã băm đầy đủ xem tại `docs/ACCEPTANCE-0.3.0.md`).

- `public/scripts/extensions.js`: `hooks` trong manifest (`activate`…) **bắt đầu cung cấp từ bản 1.17.0**. Bản 1.16.0 có tải tệp `js` nhưng không gọi hook, tiện ích này tự khởi chạy trong `index.js` (thăm dò `getContext` rồi chờ `APP_READY`).
- `public/lib/eventemitter.js`: cả 4 phiên bản đều có `autoFireLastArgs` / `autoFireAfterEmit`, `APP_READY` sẽ được phát bù cho các bộ lắng nghe đăng ký sau.
- `public/scripts/st-context.js`: cả 4 phiên bản đều cung cấp `generateRaw`, `sendMessageAsUser` (nhập động qua `/script.js`), `setExtensionPrompt`, `saveChat`, `saveMetadata`,
  `loadWorldInfo`, `saveWorldInfo`, `updateWorldInfoList`, `callGenericPopup`, `registerSlashCommand`, `substituteParams`, `executeSlashCommandsWithOptions`, `powerUserSettings`, `macros`.
- Macro: cả 4 phiên bản đều có `macros.register(name, {handler, description})`, nhưng `power_user.experimental_macro_engine` ở **1.16.0 mặc định là `false`**, từ 1.17.0 trở đi mặc định là `true`.
  Khi engine mới tắt thì `substituteParams` chỉ nhìn vào `MacrosParser` cũ, vì vậy tiện ích này sẽ đăng ký bổ sung mục macro cũ tùy theo trạng thái công tắc và kiểm tra lại khi có sự kiện `SETTINGS_UPDATED`.
  Từ bản 1.16 trở đi mỗi lần gọi `registerMacro` cũ đều sẽ in ra `[DEPRECATED]`.
- Hướng dẫn khởi chạy lần đầu: thư mục `data` hoàn toàn mới sẽ bật hộp thoại chọn ngôn ngữ và hướng dẫn người dùng, trước khi đóng hộp thoại này sẽ không kích hoạt `APP_READY`. Đây là hành vi của máy chủ; kịch bản nghiệm thu sẽ tự động đóng nó.
- Biến toàn cục `SillyTavern` bên trong iframe của Tavern Helper là **đối tượng ngữ cảnh** (`getCurrentChatId`, `name1`, `groupId` được gắn trực tiếp trên nó), trong khi `SillyTavern` trên trang máy chủ là không gian tên có chứa `getContext()`.
  Trợ lý nguyên bản phụ thuộc vào kiểu thứ nhất, nên cầu nối dùng `stContextProxy` để ủy nhiệm thời gian thực cho `getContext()`.
- Thanh trạng thái nguyên bản v3.1 chỉ dùng 7 giao diện của Tavern Helper: `getVariables`, `replaceVariables`, `updateVariablesWith`, `getLastMessageId`, `getCurrentMessageId`, `generateRaw`, `SillyTavern`, tất cả đều do `src/th-bridge.js` cung cấp.

## Thư viện chạy bên thứ ba trong bản 0.3.0

- PixiJS 6.5.10, `pixi-live2d-display` 0.4.0 (`cubism4.min.js`), phiên bản, mã băm và giấy phép xem tại `vendor/live2d/LICENSES.md`.
- Không đóng gói sẵn Cubism Core, địa chỉ mặc định là `https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js`, có thể đổi thành bản sao trong thư mục `user/files` ở phần Cài đặt.

## Phụ thuộc thêm mới trong bản 0.4.0

Máy chủ nghiệm thu giống hệt bản 0.3.0: 1.16.0 `e3b866b5`, 1.17.0 `e3f41666`, 1.18.0 `51ad27fb`, 1.19.0 `7e8663cd`. Vòng này cài đặt lại từ kho lưu trữ chính thức trên cả 4 phiên bản, kết quả xem tại `docs/ACCEPTANCE-0.4.0.md`.

- **Bộ chặn tạo văn bản (Generate Interceptor)**: `generate_interceptor: "zhutianGenerateInterceptor"` trong `manifest.json`. Mảng `chat` mà bộ chặn nhận được không chứa các tin nhắn ẩn và là đối tượng của máy chủ, nên tiện ích này sao chép (clone) trước rồi mới sửa đổi. Chỉ ảnh hưởng tới lời nhắc gửi cho mô hình, không sửa bản lưu.
- **Macro biến**:
  - Ngữ nghĩa mô phỏng y hệt `macro_like` của Tavern Helper.
  - Phía lời nhắc: thay thế trong sự kiện `GENERATE_AFTER_DATA` (bỏ qua `dry run`). Cả 4 bản 1.16–1.19 đều có sự kiện này; nếu thiếu sẽ chỉ thay thế ở phía hiển thị và ghi rõ nguyên nhân trên bảng chẩn đoán.
  - Phía hiển thị: trình kết xuất tin nhắn của tiện ích gọi trực tiếp `replaceMacroLike()`, giống cách làm của trình kết xuất cốt truyện trong Tavern Helper.
  - `getLocalVariable` không hỗ trợ đường dẫn dấu chấm, nên đường dẫn lồng nhau do tiện ích này tự phân tích.
- **Sách Thế Giới**:
  - Liên kết cuộc trò chuyện: `chatMetadata.world_info`.
  - Lựa chọn toàn cục: `selected_world_info` của `/scripts/world-info.js`.
  - Ngân sách: `world_info_budget`, `world_info_budget_cap` của cùng mô-đun đó; đếm token dùng `getTokenCountAsync`.
  - Kích thước ngữ cảnh: Chat Completion đọc `chatCompletionSettings.openai_max_context` (khi `mainApi === 'openai'`), các kiểu kết nối khác đọc `maxContext`.
  - Điều chỉnh một chạm: kích hoạt sự kiện `input`/`change` thông qua hai điều khiển `#world_info_budget` và `#world_info_budget_cap` để SillyTavern tự lưu.
- **Biểu thức chính quy (Regex)**: `extensionSettings.regex[]`, tạm dừng hoặc khôi phục theo `id`. Engine regex của SillyTavern sẽ thực thi `substituteParams` trên toàn bộ đoạn văn bản thay thế, vì vậy việc kết xuất nguyên bản không đi qua regex cũng giúp tránh bị macro thay thế nhầm.
- **Lưu trữ Tavern Helper**:
  - Toàn cục: `extensionSettings.tavern_helper.script.scripts[]`.
  - Nhân vật: `data.extensions.tavern_helper`, ghi lại thông qua `writeExtensionField`.
- **Ghi cài đặt xuống đĩa**:
  - Tiếp quản một chạm gọi `saveSettings()` của `/script.js` (có `await`), khi không lấy được sẽ lùi về dùng `saveSettingsDebounced`.
  - Kiểm thử E2E dùng `POST /api/settings/get` đọc lại từ máy chủ để xác nhận đã ghi xuống đĩa trước khi làm mới trang.
- **Kênh API chính**:
  - Địa chỉ URL trong mã nguồn gốc sẽ được đổi thành địa chỉ cầm canh (sentinel) `https://st-main.zhutian.invalid/v1`, mô hình là `API chính hiện tại của SillyTavern` (`酒馆当前主API`).
  - Yêu cầu được chuyển sang phát đi qua `generateRaw`, địa chỉ cầm canh không bao giờ bị gọi mạng thực sự (E2E đã kiểm tra nhật ký mock).
  - Ở chế độ này, các tham số như nhiệt độ (`temperature`) được lấy từ thiết lập sẵn hiện tại của SillyTavern.
