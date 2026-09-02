PATCH V4.8.1 - Fix canvas Đào kho báu bị trống

Thay 2 file:
- static/js/phaser-games.js
- templates/play.html

Nguyên nhân: Phaser Graphics không chạy hàm quadraticCurveTo() được dùng khi tạo texture thợ đào, làm Scene lỗi trước khi render.
Bản này bỏ hàm lỗi và tăng cache version lên 4.8.1.

Không cần sửa Supabase, DATABASE_URL, SECRET_KEY hay Build Command.
