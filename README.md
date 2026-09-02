# Olympic Hóa học – Phaser V3

Website tổ chức cuộc thi Hóa học theo vòng cho Trường PTDTNT THCS và THPT Vân Canh.

## Điểm mới của V3
- 4 mini game được viết lại bằng **Phaser.js 3.90.0** với canvas, tween và đồ họa vector vẽ trực tiếp bằng Phaser.
- Mỗi vòng chỉ dùng 3 game: **Ong tìm mật + Lái xe + ngẫu nhiên một trong Sút bóng/Ném rổ**.
- Game thể thao được bốc một lần khi tạo vòng và lưu cố định cho toàn bộ thí sinh trong vòng đó.
- Giao diện câu hỏi/HUD/timer được thiết kế lại theo phong cách game.
- Điểm số, thời gian và số lần rời tab được tăng cường kiểm soát phía server.

## Luật mini game
### Ong tìm mật
- Trả lời ngắn.
- Chọn một trong 4 hướng ngay trên canvas game.
- Đúng: ong bay sang chặng tiếp theo và mở lại các hướng.
- Sai: hướng vừa chọn bị khóa.
- Đủ 4 hướng bị khóa: mini game kết thúc và giữ điểm đã có.
- Tối đa 20 phút cho toàn bộ phần Ong tìm mật.

### Sút bóng / Ném bóng
- Hệ thống chọn đúng 1 trong 2 game cho mỗi vòng.
- Tối đa 10 câu trắc nghiệm 4 phương án.
- 2 phút/câu, 10 điểm/câu.
- Có hoạt ảnh riêng cho đúng/sai.

### Lái xe
- Tối đa 2 câu, mỗi câu 4 ý Đúng/Sai.
- Đúng 1/2/3/4 ý: 5/15/25/50 điểm.
- 10 phút/câu.
- Xe tiến về đích theo số điểm đạt được.

## Chức năng hệ thống
- Đăng ký / đăng nhập.
- Học sinh điền hồ sơ; Admin duyệt và phân khối 6–12.
- Admin tạo vòng, mở/đóng vòng và nhập câu hỏi.
- Thi lại nhiều lần.
- Bảng xếp hạng: điểm cao nhất trước; bằng điểm thì thời gian tốt nhất ngắn hơn xếp trên.
- Ghi nhận rời tab / ẩn cửa sổ.
- Không gửi đáp án đúng xuống trình duyệt.
- Server tự cộng điểm từng câu và ngăn một câu được cộng điểm nhiều lần.

## Tài khoản Admin mặc định
- Username: `admin`
- Password: `Admin@123`

Hãy đổi mật khẩu Admin trước khi sử dụng chính thức.

## Chạy local
```bash
pip install -r requirements.txt
python app.py
```
Sau đó mở `http://127.0.0.1:5000`.

## Deploy Render
Nếu repository hiện tại đã được kết nối Render thì **không cần tạo Web Service mới**.

1. Upload/commit toàn bộ file V3 này đè lên repository hiện tại.
2. Push/Commit lên nhánh `main`.
3. Render sẽ Auto Deploy nếu đang bật Auto-Deploy.

Cấu hình vẫn là:
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`
- Environment variable: `SECRET_KEY`

## Phaser
Trang thi tải Phaser từ:
`https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js`

Phaser 3.90.0 được chọn vì API ổn định và phù hợp với cấu trúc Flask/JavaScript hiện tại.

## Lưu ý về dữ liệu Render
Phiên bản hiện vẫn dùng SQLite. SQLite phù hợp để thử nghiệm/local nhưng không nên dùng làm dữ liệu lâu dài trên Render Free. Khi đưa vào sử dụng chính thức nên chuyển sang Supabase PostgreSQL hoặc PostgreSQL khác.

## V3.1 - Sửa lỗi Phaser CDN
Nếu trình duyệt báo không tải được Phaser, phiên bản này ưu tiên dùng Phaser cục bộ.
Trên Render, Build Command nên là:

```bash
pip install -r requirements.txt && python build_assets.py
```

`build_assets.py` sẽ tải Phaser 3.90.0 vào `static/vendor/phaser.min.js` khi deploy. Nếu file cục bộ chưa có, trang thi vẫn thử cdnjs, jsDelivr và unpkg làm nguồn dự phòng.
