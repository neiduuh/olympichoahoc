# Cài mini game bóng đá V4.3 vào website V4.2

Nếu website đang chạy V4.2, chỉ cần thay 3 file:

1. `static/js/phaser-games.js`
2. `templates/play.html`
3. `static/css/style.css`

Sau đó commit GitHub và chờ Render deploy.

## Cách hoạt động
`play.html` truyền nội dung câu hỏi, 4 phương án, tên/lớp, điểm và thời gian vào Phaser.
`phaser-games.js` vẽ giao diện và gọi callback khi thí sinh chọn A/B/C/D.
Đáp án vẫn được gửi tới `/api/answer` để chấm ở server như V4.2; đáp án đúng không nằm trong browser.

## Lưu ý
- Không cần thêm bảng database.
- Không cần thay Supabase.
- Không cần thay biến môi trường.
- Build command vẫn là: `pip install -r requirements.txt && python build_assets.py`
