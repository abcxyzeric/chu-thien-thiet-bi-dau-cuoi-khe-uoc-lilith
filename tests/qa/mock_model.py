"""Local OpenAI-compatible MOCK model for the isolated acceptance runs (tests/native_replace040.py).

Never a real model, never a real key. Every request is appended to a JSONL log ({path, auth, body}) so the
suite can assert what actually reached the "model". Replies are routed by the v1.1 prompt phrases (both
Vietnamese and Chinese), so each status-bar / assistant feature gets a well-formed answer in the format the parser expects.

Usage:  python3 tests/qa/mock_model.py [--port 5001] [--log /var/tmp/qa/mock.jsonl]
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import argparse, json, re, time

ap = argparse.ArgumentParser()
ap.add_argument('--port', type=int, default=5001)
ap.add_argument('--host', default='127.0.0.1')
ap.add_argument('--log', default='/var/tmp/qa/mock.jsonl')
ap.add_argument('--no-cors', action='store_true', help='send no CORS headers (a provider that blocks browsers; only server-side relays work)')
args = ap.parse_args()

STORY = ('Màn đêm đè nặng lên đầu thành, ngươi nắm chặt viên Dẫn Khí Đan vừa mới đổi được trong lòng bàn tay.\n\n'
         'Lilith: “Ký chủ đại nhân, đan dược đâu phải kẹo đậu, mỗi lần một viên thôi nhé~”\n\n'
         'Lilith (Thẹn thùng): “Đâu, đâu có lo cho ngài chứ…… chỉ là khế ước quy định phải chăm sóc tốt cho ngài thôi.”\n\n'
         'Từ xa vọng lại tiếng chuông, luồng linh khí đầu tiên men theo kinh mạch chầm chậm lưu chuyển.\n\n'
         '<ZhuTianPanel>\n系统点: 1350\n子系统: Săn Hoa Chư Thiên\n绑定目标: Diệp Thanh Hàn\n目标标签: Kiếm tu mặt lạnh\n好感度: 42/100\n'
         '当前任务: Dẫn khí nhập thể\n任务内容: Uống Dẫn Khí Đan hoàn thành chu thiên đầu tiên\n任务奖励: 150 Điểm Hệ Thống\n任务进度: 60\n'
         '当前货币: Linh thạch\n持有金额: 88\n系统播报: Độ thân hòa linh khí của Ký chủ tăng lên\n</ZhuTianPanel>')

SHOP = ['Phàm phẩm|Dẫn Khí Đan|500|Tăng nhẹ tốc độ tu luyện|Thường|Vật phẩm tiêu hao', 'Phàm phẩm|Kiếm Sắt|300|Kiếm sắt thông thường|Thường|Vũ khí', 'Phàm phẩm|Áo Vải|120|Y phục giản dị|Thường|Trang phục',
        'Phàm phẩm|Linh Thảo|80|Nguyên liệu luyện đan|Thường|Nguyên liệu', 'Linh phẩm|Thanh Phong Kiếm|20000|Chém sắt như bùn (mỗi ngày giới hạn chém ba lần)|Thường|Vũ khí', 'Linh phẩm|Tụ Linh Trận Bàn|50000|Tụ tập linh khí (hồi chiêu một ngày)|Thường|Trang bị',
        'Linh phẩm|Lông Vũ Của Lilith|3000|Khẽ trêu ghẹo (mỗi ngày một lần)|Sắc tình|Trang bị', 'Tiên phẩm|Cửu Chuyển Kim Đan|2000000|Thoát thai hoán cốt (chỉ giới hạn một lần)|Thường|Vật phẩm tiêu hao']


def text_of(messages):
    out = []
    for m in messages or []:
        c = m.get('content', '')
        if isinstance(c, list): c = ''.join(x.get('text', '') for x in c if isinstance(x, dict))
        out.append(str(c))
    return '\n'.join(out)


def recorder_reply(allt):
    """Memory recorder: quote 4-60 chars of this turn's text verbatim, as the original validator requires."""
    body = allt
    m = re.search(r'"本轮原文"\s*:\s*"((?:[^"\\]|\\.)*)"', allt)
    if m:
        try: body = json.loads('"' + m.group(1) + '"')
        except Exception: body = m.group(1)
    body_part = body.split('Chính văn: ', 1)[-1] if 'Chính văn: ' in body else body.split('正文：', 1)[-1]
    seg = next((s.strip() for s in re.split(r'[.。\n]', body_part) if 4 <= len(s.strip()) <= 60 and '{{' not in s), '')
    ups = [{'key': '事件/Dẫn khí nhập thể', 'kind': '事件', 'status': 'active', 'text': 'Ký chủ uống Dẫn Khí Đan, bắt đầu chu thiên đầu tiên.', 'evidence': seg}] if seg else []
    return json.dumps({'upserts': ups}, ensure_ascii=False)


GROUP_N = [0]
V114_COT = ('<think>\nViết nháp trước: <ZhuTianPanel>\n系统点: Bản nháp\nLilith: Câu này chỉ là bản nháp\n</think>\nMàn đêm dần sâu, linh khí chầm chậm lưu chuyển trong kinh mạch.\n\n'
            'Lilith: “Ký chủ đại nhân, hôm nay tới đây thôi nhé.”\n\n<ZhuTianPanel>\n系统点: 1400\n好感度: 45/100\n当前任务: Dẫn khí nhập thể\n任务进度: 70\n系统播报: Kiểm tra chuỗi tư duy\n</ZhuTianPanel>')


def group_reply(allt):
    """诸天聊天群: answer as the listed members; the host's test phrases ask for a red packet / a gift / an over-grade item."""
    names = re.findall(r'(?m)^- ([^（(\n]+)[（(]', allt)
    names = [n.strip() for n in names if '禁言中' not in allt.split(f'- {n}', 1)[1].split('\n', 1)[0] and 'Đang bị cấm chat' not in allt.split(f'- {n}', 1)[1].split('\n', 1)[0]] or ['Vô Danh']
    said = allt.rsplit('【Ký chủ vừa gửi】', 1)[-1] if '【Ký chủ vừa gửi】' in allt else (allt.rsplit('【宿主刚发】', 1)[-1] if '【宿主刚发】' in allt else '')
    a, b = names[0], names[1 % len(names)]
    # 1.1.4: numbered answers (重roll must show a NEW one) and a reply cut off by the output limit
    if '【1.1.4' in said:
        GROUP_N[0] += 1
        if '【1.1.4截断】' in said: return f'@{a}: Lần thứ {GROUP_N[0]} · Một câu hoàn chỉnh.\n@{b}: Đang nói nửa chừng thì bị'
        return f'@{a}: Phản hồi lần thứ {GROUP_N[0]}.\n@{b}: Đã nhận.'
    out = [f'@{a}: Chào chủ nhóm! Cốt truyện bên chỗ ngài hôm nay náo nhiệt ghê nhỉ.']
    if '发红包' in said or 'phát lì xì' in said.lower(): out.append(f'@{a}: [Lì xì] Điểm Hệ Thống 3000 3 | Ai thấy cũng có phần')
    elif '【测试】贪心' in allt: out.append(f'@{a}: [Lì xì] Điểm Hệ Thống 500 3 | Lại phát lì xì nữa đây')   # ignores the rhythm rule on purpose
    if '物品红包' in said or 'lì xì vật phẩm' in said.lower(): out.append(f'@{b}: [Lì xì] Vật phẩm Đào Hoa Nhưỡng Thanh Khâu/Tiên phẩm/Vật phẩm tiêu hao/Uống vào tâm thần an tĩnh 3 | Nếm thử rượu Thanh Khâu của chúng tôi đi')
    if '送礼' in said or 'tặng quà' in said.lower(): out.append(f'@{b}: [Tặng lễ] Thái Hư Kiếm Phổ Tàn Quyển/Thần phẩm/Công pháp/Ghi chép ba thức đầu của Thái Hư Kiếm Ý | Cái này ngài dùng được đấy')
    if len(names) > 1: out.append(f'@{b}: Ta đang ở đây, có chuyện gì cứ nói.')
    out.append('@Người không ở trong nhóm: Dòng này bắt buộc phải bị bỏ qua')
    return '\n'.join(out)


def route(allt):
    if '你是诸天万界聊天群的招募系统。' in allt or 'Bạn là hệ thống chiêu mộ của Nhóm Chat Chư Thiên Vạn Giới.' in allt:
        if '青丘' in allt or 'Thanh Khâu' in allt: return 'Bạch Thiển|Thanh Khâu|4|Lạnh lùng bênh người nhà|Đào Hoa Nhưỡng Thanh Khâu'
        avoid = allt.split('【Không được chọn】', 1)[1].split('(', 1)[0] if '【Không được chọn】' in allt else (allt.split('【不要选】', 1)[1].split('（', 1)[0] if '【不要选】' in allt else allt.split('Thành viên hiện có:', 1)[-1].split('(', 1)[0])
        if '刚刚出现过或已在群里' in allt or 'vừa mới xuất hiện hoặc đã ở trong nhóm' in allt: return 'Lục Thiên Phàm|Thiên Cơ Các|2|Tâm tư kín kẽ|Thiên Cơ Toán Trù'
        for card in ('Diệp Thanh Hàn|Vấn Kiếm Tông|2|Kiếm tu mặt lạnh|Tua kiếm Vấn Kiếm Tông', 'Tô Tiểu Man|Làng chài Đông Hải|1|Hoạt bát nói nhiều|Cá khô Đông Hải', 'Lâm Tiểu Hòa|Trấn Thanh Thạch|1|Thật thà chất phác|Bánh gạo Trấn Thanh Thạch'):
            if card.split('|', 1)[0] not in avoid: return card
        return 'Diệp Thanh Hàn|Vấn Kiếm Tông|2|Kiếm tu mặt lạnh|Tua kiếm Vấn Kiếm Tông'
    if '你是诸天万界聊天群的召唤系统' in allt or 'Bạn là hệ thống triệu hồi của Nhóm Chat Chư Thiên Vạn Giới' in allt:
        m = re.search(r'【(?:条目|Mục từ)】([^（(\n]+)', allt); n = (m.group(1).strip() if m else 'Vô Danh')[:12]
        return f'{n}|Khách từ Sách Thế Giới|1|Điềm tĩnh ít lời|Viên sỏi quê nhà'
    if (allt.lstrip().startswith('你是系统') or allt.lstrip().startswith('Bạn là Hệ Thống')) and ('私聊' in allt or 'Trò chuyện riêng' in allt) and 'ZhuTianPanel' not in allt:
        return 'PERSONA_OK: Phát hiện Ký chủ gọi, hệ thống đang trực tuyến.'
    if '你是诸天万界聊天群的任务发布系统。' in allt or 'Bạn là hệ thống phát hành nhiệm vụ của Nhóm Chat Chư Thiên Vạn Giới.' in allt:
        return 'Tìm kiếm kiếm phổ thất lạc|Đến hậu sơn Vấn Kiếm Tông tìm về tàn quyển 《Thái Hư Kiếm Phổ》|5000 Điểm Hệ Thống'
    if '你是诸天万界聊天群的群直播。' in allt or 'Bạn là hệ thống phát sóng trực tiếp nhóm của Nhóm Chat Chư Thiên Vạn Giới.' in allt:
        return 'Trước sơn môn Vấn Kiếm Tông, hàng trăm đệ tử xếp trận luyện kiếm.\nKiếm quang hội tụ thành một dải ngân hà, lao thẳng lên tầng mây.\nChưởng môn đứng trên đỉnh núi, ánh mắt hướng về phía ống kính.'
    if '你是诸天万界聊天群的群员私聊' in allt or 'Bạn là hệ thống trò chuyện riêng thành viên của Nhóm Chat Chư Thiên Vạn Giới' in allt:
        return '(Tua kiếm khẽ đung đưa) Chủ nhóm tìm ta có việc gì? Nếu là tỷ thí thì bất cứ lúc nào cũng xin phụng bồi.'
    if '你是诸天万界聊天群。' in allt or 'Bạn là Nhóm Chat Chư Thiên Vạn Giới.' in allt: return group_reply(allt)
    if '回复两个字：成功' in allt or 'chỉ trả lời hai chữ: Thành công' in allt: return 'Thành công'
    if '你是诸天系统外挂世界书的事实记录员' in allt or 'Bạn là nhân viên ghi chép sự thật' in allt: return recorder_reply(allt)
    if '只返回JSON {"answer"' in allt or '只返回JSON{"answer"' in allt or 'Chỉ trả về JSON {"answer"' in allt:
        return json.dumps({'answer': 'Theo ghi chép: Ký chủ đang hoàn thành “Dẫn khí nhập thể”.', 'checks': []}, ensure_ascii=False)
    if '你是诸天系统的品阶鉴定官' in allt or 'Bạn là Quan Giám Định Phẩm Giai của Hệ Thống Chư Thiên' in allt:
        return 'Tiên phẩm|Kiếm ý cấp đại lục, vượt xa võ học phàm tục'
    if '严格执行格式要求，只输出一行' in allt or 'Thực hiện nghiêm ngặt yêu cầu định dạng, chỉ xuất ra 1 dòng' in allt:
        return '5|Cốt truyện thúc đẩy ổn định, kết toán theo bậc trung'
    if '严格只输出一行' in allt or 'Chỉ xuất ra đúng 1 dòng' in allt:
        return 'Cửu Chuyển Ngưng Nguyên Đan|Vật phẩm tiêu hao|Sau khi uống hồi phục ba phần linh lực (mỗi ngày giới hạn dùng một lần)'
    if '你是背包整理助手' in allt or 'Bạn là trợ lý sắp xếp túi đồ' in allt:
        names = re.findall(r'(?m)^\d+\.\s*([^|\n]+)\|', allt) or ['Dẫn Khí Đan']
        return '\n'.join(f'{n}|Phàm phẩm|Vật phẩm tiêu hao|Hồi phục lượng nhỏ linh khí' for n in names[:40])
    if '你是诸天万界的招募官。' in allt or 'Bạn là quan chiêu mộ của Chư Thiên Vạn Giới.' in allt:
        return 'Diệp Thanh Hàn|Vấn Kiếm Tông|B+|80|Kiếm ý sắc bén'
    if '你是诸天系统的奖励生成器' in allt or 'Bạn là trình tạo phần thưởng của Hệ Thống Chư Thiên' in allt:
        cnt = {k: int(v) for k, v in re.findall(r'(Thần phẩm|Tiên phẩm|Linh phẩm|Phàm phẩm|神品|仙品|灵品|凡品)\s*(\d+)\s*(?:món|cái|个)', allt)}
        lines = [f'{g}|Bí bảo {g} {i + 1}|Tăng tu vi (hồi chiêu một ngày)|Trang bị' for g in ['Thần phẩm', 'Tiên phẩm', 'Linh phẩm', 'Phàm phẩm', '神品', '仙品', '灵品', '凡品'] for i in range(cnt.get(g, 0))]
        return '\n'.join(lines or ['Phàm phẩm|Hồi Khí Tán|Hồi phục thể lực|Vật phẩm tiêu hao'])
    if '用户许愿：' in allt or 'Người dùng ước nguyện:' in allt:
        return 'Linh phẩm|20000|Giá tham chiếu 5000×Dài hạn 4=20000 (Bảo toàn năng lượng)'
    if '只输出规定的格式列表' in allt or 'Chỉ xuất ra danh sách đúng định dạng quy định' in allt: return '\n'.join(SHOP)
    if ('莉莉丝' in allt or 'Lilith' in allt) and ('私聊' in allt or 'Trò chuyện riêng' in allt or 'LILITH_CHAT' in allt or '契约恶魔' in allt or 'ác ma khế ước' in allt.lower()) and 'ZhuTianPanel' not in allt:
        return 'Hừ, Ký chủ đại nhân cuối cùng cũng nhớ tới Lilith rồi sao? Tu luyện có mệt mấy cũng phải nhớ tới trò chuyện với ta đó nhé.'
    return STORY


V111_POLLUTED = '（1.1.1 Kiểm tra cô lập）Lilith chống cằm nhìn ngài.\n\n<zhutianpanel>\n<think>Nghĩ trước xem khối dữ liệu viết thế nào</think>\nHắn đẩy cửa đá động phủ ra, hàn khí ập thẳng vào mặt.\n\n系统点: 1300\n好感度: 35/100\n当前任务: Dẫn khí nhập thể\n任务进度: 40\n功法修炼: Lĩnh ngộ 《Thái Hư Kiếm Ý》[Tiên phẩm]\n系统播报: Hôm nay Ký chủ rất nỗ lực\n\nCửa đá phía sau chầm chậm khép lại.'
V111_MISSING = '（1.1.1 Kiểm tra cô lập）Lượt này chỉ có chính văn, ngươi gặp một vị kiếm khách áo trắng trên đường núi.'


def audit_reroll(last_user, msgs):
    """1.1.1 审计 #7: like a real model, the new 名望 = the value the prompt shows (+50) and 持有金额 = last block in history (+100)."""
    fame = int((re.search(r'(?:名望|Danh Vọng)\s*(\d+)', last_user) or [0, 0])[1])
    hist = ''.join(text_of([m]) for m in msgs if m.get('role') == 'assistant')
    money = int((re.findall(r'(?:持有金额|Số tiền nắm giữ):\s*(\d+)', hist) or ['500'])[-1])
    return (f'（Kiểm toán roll lại）Ngươi hoàn thành một ủy thác, nhận được Danh Vọng. {time.time_ns()}\n\n<ZhuTianPanel>\n系统点: 1200\n好感度: 30/100\n当前任务: Dẫn khí nhập thể\n'
            f'任务进度: 30\n当前货币: Linh thạch\n持有金额: {money + 100}\n专属资源: 天命印记0｜血脉结晶0｜因果筹码0｜名望{fame + 50}｜岁月沉淀0\n'
            f'功法修炼: Không\n系统播报: Kiểm tra roll lại\n</ZhuTianPanel>')

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def send_header(self, k, v):
        if args.no_cors and k.lower().startswith('access-control-'): return
        super().send_header(k, v)

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b)))
        self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); self.wfile.write(b)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in (('Access-Control-Allow-Origin', '*'), ('Access-Control-Allow-Headers', '*'), ('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')): self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip('/').endswith('/models'): return self._json({'object': 'list', 'data': [{'id': 'mock-zt', 'object': 'model'}, {'id': 'mock-zt-mini', 'object': 'model'}]})
        self._json({'ok': True, 'mock': True})

    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        try: body = json.loads(self.rfile.read(n) or b'{}')
        except Exception: body = {}
        with open(args.log, 'a', encoding='utf8') as f:
            f.write(json.dumps({'t': time.time(), 'path': self.path, 'auth': self.headers.get('Authorization', ''), 'body': body}, ensure_ascii=False) + '\n')
        reply = route(text_of(body.get('messages')) or str(body.get('prompt', '')))
        # 1.1.1 数据块格式守卫: a polluted / missing data block, chosen by a marker in the LAST user message only
        last_user = next((text_of([m]) for m in reversed(body.get('messages') or []) if m.get('role') == 'user'), '')
        if '【1.1.1污染】' in last_user: reply = V111_POLLUTED
        elif '【1.1.1缺块】' in last_user: reply = V111_MISSING
        elif '【审计重roll】' in last_user: reply = audit_reroll(last_user, body.get('messages') or [])
        elif '【1.1.4思维链】' in last_user: reply = V114_COT
        finish = 'length' if '【1.1.4截断】' in last_user else 'stop'   # 1.1.4: the output limit was hit
        # 0.8.4 timeout check: a message containing 慢速测试 takes ~66 s (longer than the original fixed 60 s abort)
        slow = '慢速测试' in (text_of(body.get('messages')) or '')
        if slow: reply = 'Phản hồi chậm: ' + 'luồng ' * 10
        model = body.get('model') or 'mock-zt'
        if body.get('stream'):
            self.send_response(200); self.send_header('Content-Type', 'text/event-stream'); self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers()
            step = 2 if slow else 24
            for i in range(0, len(reply), step):
                chunk = {'id': 'mock', 'object': 'chat.completion.chunk', 'model': model, 'choices': [{'index': 0, 'delta': {'content': reply[i:i + step]}, 'finish_reason': None}]}
                self.wfile.write(('data: ' + json.dumps(chunk, ensure_ascii=False) + '\n\n').encode()); self.wfile.flush(); time.sleep(9 if slow else 0.01)
            end = {'id': 'mock', 'object': 'chat.completion.chunk', 'model': model, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': finish}]}
            self.wfile.write(('data: ' + json.dumps(end) + '\n\ndata: [DONE]\n\n').encode()); self.wfile.flush(); return
        if slow: time.sleep(66)
        self._json({'id': 'mock', 'object': 'chat.completion', 'model': model,
                    'choices': [{'index': 0, 'finish_reason': finish, 'message': {'role': 'assistant', 'content': reply}}],
                    'usage': {'prompt_tokens': 1, 'completion_tokens': 1, 'total_tokens': 2}})


if __name__ == '__main__':
    print(f'mock model on http://{args.host}:{args.port}/v1  log={args.log}', flush=True)
    ThreadingHTTPServer((args.host, args.port), H).serve_forever()
