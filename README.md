# Olympic Hóa học V4 - Phaser + Supabase PostgreSQL

Bản V4 giữ toàn bộ mini game Phaser của V3.1 nhưng chuyển dữ liệu production sang Supabase PostgreSQL để không mất tài khoản/câu hỏi/điểm khi Render redeploy.

## 1. Tạo Supabase
1. Vào https://supabase.com và tạo Project mới.
2. Ghi nhớ Database Password.
3. Trong Project bấm **Connect**.
4. Chọn **Session pooler** (port 5432) và copy connection string.
5. Thay `[YOUR-PASSWORD]` bằng database password. Nếu mật khẩu có ký tự đặc biệt trong URL, phải percent-encode ký tự đó.

Ví dụ định dạng:
`postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres`

Không cần tự tạo table trong SQL Editor. Ứng dụng tự tạo schema khi chạy lần đầu.

## 2. Render Environment Variables
Giữ `SECRET_KEY` như trước và thêm:

- `DATABASE_URL` = connection string Session pooler của Supabase
- `ADMIN_INITIAL_PASSWORD` = mật khẩu admin muốn dùng ở lần tạo database đầu tiên (khuyến nghị đặt chuỗi mạnh)

Lưu ý: `ADMIN_INITIAL_PASSWORD` chỉ có tác dụng khi user `admin` chưa tồn tại. Sau khi database đã có admin, đổi biến này không tự đổi mật khẩu cũ.

## 3. Render
Build Command:
`pip install -r requirements.txt && python build_assets.py`

Start Command:
`gunicorn app:app`

Health Check Path:
`/health`

## 4. An toàn dữ liệu
- Trên Render, V4 bắt buộc phải có `DATABASE_URL`. Nếu thiếu, app chủ động không khởi động để tránh dùng SQLite tạm.
- Sau khi đã dùng Supabase, update GitHub/Render không xóa dữ liệu.
- Admin có nút tải backup JSON và Excel.

## 5. Chạy local
Nếu không đặt DATABASE_URL, app dùng `olympic.db` trên máy để test local.

```bash
pip install -r requirements.txt
python build_assets.py
python app.py
```

## Tài khoản Admin
Nếu database mới và không đặt `ADMIN_INITIAL_PASSWORD`, mặc định vẫn là `admin / Admin@123`.
Khuyến nghị đặt `ADMIN_INITIAL_PASSWORD` trên Render trước lần chạy đầu tiên.


## V4.1 build fix
- Cập nhật psycopg binary từ 3.2.9 sang >=3.2.13,<3.4 để tương thích Python mới trên Render.
