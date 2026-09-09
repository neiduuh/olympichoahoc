# V5.3 – Trang chủ nhận diện trường

## Cách cập nhật trên Vercel
Nếu project hiện tại đang chạy V5.2 trên GitHub/Vercel:
1. Tải bản PATCH V5.3.
2. Giải nén và chép đè đúng cấu trúc vào repository GitHub hiện tại.
3. Commit changes.
4. Vercel sẽ tự động deploy bản mới.
5. Khi deployment hoàn tất, mở trang và nhấn Ctrl + F5 nếu trình duyệt còn cache giao diện cũ.

Không cần thay DATABASE_URL, SECRET_KEY, ADMIN_INITIAL_PASSWORD hoặc cấu hình Vercel/Supabase.
