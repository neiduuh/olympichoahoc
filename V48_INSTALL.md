PATCH V4.8 - ĐÀO KHO BÁU

Ghi đè các file sau trong repository hiện tại:
- app.py
- static/js/phaser-games.js
- templates/play.html
- templates/questions.html
- templates/index.html

Sau đó Commit changes và để Render deploy lại.
Không đổi DATABASE_URL, SECRET_KEY, Supabase hoặc Build Command.

Lưu ý: trong database, game này vẫn dùng game_type="bee" để giữ tương thích dữ liệu cũ; trên giao diện đã đổi thành Đào kho báu.
