PATCH V4.7 - Fix mini game Ong tìm mật

Sửa lỗi:
- Ong bị vẽ lệch lên góc trái / chỉ thấy vòng vàng.
- Nút ↑ ↓ ← → không hiển thị.
- Ô dấu hỏi quanh Ong không hiển thị / không bấm được.

Cải tiến:
- Ong được vẽ trực tiếp tại ô xuất phát, không còn phụ thuộc Phaser Container.
- Có 4 mũi tên nhỏ ngay quanh Ong.
- Có bộ 4 nút điều hướng lớn bên phải.
- Có thể bấm trực tiếp ô dấu hỏi cạnh Ong để chọn hướng.
- Câu hỏi vẫn chỉ hiện sau khi Ong bay tới chướng ngại vật.
- Thêm cache-busting ?v=4.7 để trình duyệt tải đúng file JS mới.

Thay 2 file:
- static/js/phaser-games.js
- templates/play.html

Không đổi DATABASE_URL, Supabase, SECRET_KEY hay Build Command.
