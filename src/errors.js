// 1.0 Thông báo lỗi thống nhất: Chuyện gì đã xảy ra · Sổ cái có thay đổi không · Bước tiếp theo làm gì.
// Only says "Sổ cái không thay đổi" when the error comes from a check that runs BEFORE any write (or from a request whose fee is
// refunded on failure); a failed read-back says the ledger may have changed and points to the rollback; anything
// unknown gets no ledger claim at all.
const RULES = [
    { re: /当前环境无法保存|Môi trường hiện tại không thể lưu/i, ledger: 'Không thay đổi', next: '' },
    { re: /核验期间页面账本已变化|Sổ cái trên trang đã thay đổi trong lúc kiểm nghiệm/i, ledger: 'Không thay đổi', next: 'Làm mới dữ liệu rồi xác nhận lại, giữ nguyên các thay đổi sổ cái từ nguồn khác, không tự động gửi lặp lại' },
    // read-back / partial write — the one case where the ledger may have changed
    { re: /读回不一致|写入状态不明|已冻结|Đọc lại không khớp|Trạng thái ghi không rõ|đã đóng băng|đã bị đóng băng/i, ledger: 'Có thể đã ghi', next: 'Mở Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra và mở khóa sổ cái」: nếu máy chủ và trang khớp nhau sẽ mở khóa ngay, nếu không khớp hãy tải lại trang; khi sổ cái bị sai hãy vào Di chuyển bản lưu cũ / Hoàn tác sổ cái để quay về bản sao lưu trước' },
    { re: /只读|结构版本|chỉ đọc|phiên bản cấu trúc/i, ledger: 'Không thay đổi (chỉ đọc)', next: 'Cập nhật tiện ích lên phiên bản mới nhất' },
    { re: /聊天已经切换|取消写入|未写入|已停止发动|Trò chuyện đã chuyển|hủy ghi|chưa ghi|đã dừng kích hoạt/i, ledger: 'Không thay đổi', next: 'Quay lại cuộc trò chuyện ban đầu rồi thử lại' },
    { re: /群聊暂不写入|请先打开单角色聊天|请先打开|Nhóm chat tạm không ghi|Vui lòng mở cuộc trò chuyện đơn nhân vật|Vui lòng mở/i, ledger: 'Không thay đổi', next: 'Mở một cuộc trò chuyện đơn nhân vật rồi thử lại' },
    { re: /Web Locks/i, ledger: 'Không thay đổi', next: 'Đổi sang trình duyệt mới hơn (Chrome / Edge / Safari 16+)' },
    { re: /已有操作正在进行|正在生成|扩展已停用|Đang có thao tác khác|đang tạo|Tiện ích đã tắt/i, ledger: 'Không thay đổi', next: 'Đợi thao tác hiện tại hoặc phản hồi AI kết thúc rồi thử lại' },
    { re: /不足|只有 [\d,]+ ?点|余额|không đủ|chỉ có [\d,]+|số dư/i, ledger: 'Không thay đổi', next: 'Hãy tích lũy đủ Điểm Hệ Thống trước, hoặc chọn mục rẻ hơn' },
    { re: /请填写|请选择|不能为空|格式不对|无法识别|不是有效|Vui lòng điền|Vui lòng chọn|không được để trống|định dạng không đúng|không thể nhận diện|không hợp lệ/i, ledger: 'Không thay đổi', next: 'Điền đủ hoặc sửa lại theo gợi ý rồi thử lại' },
    { re: /超时|quá thời gian|timeout|timed out/i, ledger: 'Không thay đổi (đã hoàn trả chi phí)', next: 'Thử lại sau; với mô hình suy nghĩ có thể vào Cài đặt → Kết nối để tăng thời gian chờ' },
    { re: /HTTP ?(401|403)|unauthori[sz]ed|invalid api key|密钥|khóa API/i, ledger: 'Không thay đổi', next: 'Kiểm tra khóa API trong Cài đặt → Thiết lập cổng AI' },
    { re: /HTTP ?(429)|rate limit|限流|giới hạn tần suất|too many/i, ledger: 'Không thay đổi', next: 'Yêu cầu quá dày, vui lòng đợi một lát rồi thử lại' },
    { re: /HTTP ?5\d\d|Failed to fetch|NetworkError|网络|连接失败|mạng|kết nối thất bại|ECONN|502|503|504/i, ledger: 'Không thay đổi (đã hoàn trả chi phí)', next: 'Kiểm tra mạng hoặc trạm trung chuyển có hoạt động không rồi thử lại sau' },
    { re: /解析|没有按格式|格式错误|phân tích|không đúng định dạng|lỗi định dạng|JSON/i, ledger: 'Không thay đổi (đã hoàn trả chi phí)', next: 'Thử lại một lần; nếu thường xuyên gặp lỗi hãy đổi sang mô hình tuân thủ định dạng tốt hơn' },
    { re: /世界书|Sách Thế Giới/i, ledger: '', next: 'Mở Cài đặt → Cài đặt / Gắn kết / Gỡ gắn kết Sách Thế Giới để xem trạng thái' },
];

/** {what, ledger, next} for an error (pure). `ledger` / `next` are '' when nothing reliable can be said. */
export function explain(err) {
    const what = String(err?.message ?? err ?? 'Lỗi không xác định').trim().replace(/\s+/g, ' ') || 'Lỗi không xác định';
    if (/账本[:：]|下一步[:：]|Sổ cái[:：]|Bước tiếp theo[:：]/i.test(what)) return { what, ledger: '', next: '' };     // already in the 1.0 format
    const r = RULES.find(x => x.re.test(what));
    return { what, ledger: r?.ledger || '', next: r?.next || '' };
}
/** One line: 「Chuyện gì đã xảy ra. Sổ cái: …. Bước tiếp theo: ….」 (pure). */
export function errorLine(err) {
    const { what, ledger, next } = explain(err);
    const head = /[。！？.!?）)]$/.test(what) ? what : what + '.';
    return head + (ledger ? ` Sổ cái: ${ledger}.` : '') + (next ? ` Bước tiếp theo: ${next}.` : '');
}
