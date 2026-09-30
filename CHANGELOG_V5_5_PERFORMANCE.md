# V5.5 Performance

- Cache user theo từng request, tránh query Supabase lặp lại khi render template.
- /play dùng một kết nối DB thay vì nhiều kết nối và không tải cột image_data nặng.
- /api/answer giảm còn 1 lần đọc + 1 lần ghi DB trên PostgreSQL.
- Dùng process-local psycopg connection pool cho warm Vercel Functions.
- Hot API dùng uid trong signed session, không query user riêng trước mỗi đáp án.
- Mini-game static assets chuyển sang public/static để Vercel CDN phục vụ trực tiếp.
- Loại static/ legacy khỏi Vercel function bundle để giảm cold-start.
- Phaser tải trực tiếp từ CDN, phaser-games.js tải từ Vercel CDN.
- Hiển thị "ĐANG CHẤM..." ngay khi bấm đáp án để UI phản hồi tức thì.
- Đặt Vercel Function tại Tokyo (hnd1), gần Supabase ap-northeast-1.
