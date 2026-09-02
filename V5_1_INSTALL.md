# PATCH V5.1

Upload toàn bộ các file/thư mục trong patch lên GitHub và ghi đè file cũ.

Render sẽ tự chạy `init_db()` và thêm cột `image_data` vào bảng questions nếu chưa có.
Không cần vào Supabase SQL Editor và không cần đổi DATABASE_URL / SECRET_KEY / Build Command.

Sau deploy, nhấn Ctrl + F5.
