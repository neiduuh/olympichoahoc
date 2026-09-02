
# Olympic Hóa học

Website thi Hóa học theo vòng cho Trường PTDTNT THCS và THPT Vân Canh.

## Chức năng đã có
- Đăng ký / đăng nhập.
- Thí sinh điền hồ sơ, admin duyệt và phân khối 6–12.
- Admin tạo vòng thi, mở/đóng vòng.
- Admin nhập câu hỏi riêng cho 4 mini game; mỗi vòng thi hệ thống bốc một lần và dùng cố định Ong + Lái xe + 1 trong 2 game thể thao:
  - Ong tìm mật: trả lời ngắn.
  - Sút bóng: trắc nghiệm 4 lựa chọn.
  - Ném bóng: trắc nghiệm 4 lựa chọn.
  - Lái xe: 4 ý đúng/sai, chấm 5/15/25/50 điểm.
- Thí sinh có thể thi lại nhiều lần.
- Bảng xếp hạng lấy điểm cao nhất; bằng điểm thì thời gian tốt nhất ngắn hơn đứng trên.
- Ghi nhận số lần chuyển tab / ẩn cửa sổ khi thi.
- Không gửi đáp án đúng xuống trình duyệt; đáp án được chấm ở server.
- SQLite dùng cho bản chạy thử/local.

## Tài khoản admin mặc định
- Tài khoản: admin
- Mật khẩu: Admin@123

**Đổi mật khẩu admin trước khi dùng thật.**

## Chạy trên máy
```bash
pip install -r requirements.txt
python app.py
```
Mở http://127.0.0.1:5000

## Đưa lên Render
1. Tạo repository GitHub và đưa toàn bộ thư mục này lên.
2. Render > New > Web Service > chọn repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`

### Lưu ý dữ liệu
SQLite trên Render Free không phù hợp để lưu dữ liệu lâu dài vì filesystem có thể bị thay đổi khi deploy/restart.
Khi dùng thật, nên chuyển database sang Supabase PostgreSQL hoặc Render PostgreSQL.

## Gợi ý nâng cấp
- Giới hạn thời gian riêng: Ong 20 phút, bóng đá/bóng rổ 2 phút/câu, lái xe 10 phút/câu.
- Import câu hỏi Excel/CSV.
- Trộn câu hỏi theo ngân hàng lớn, cấu hình số câu mỗi game.
- Reset mật khẩu, xác minh số điện thoại, nhật ký admin.
- Chống gian lận nâng cao: fullscreen, cảnh báo copy/paste, giới hạn thiết bị/IP (cân nhắc quyền riêng tư).
- Xuất bảng xếp hạng Excel/PDF.

## Luật mini game hiện tại
- Ong tìm mật: tối đa 20 phút, chọn hướng; trả lời sai khóa hướng, đủ 4 hướng bị khóa thì kết thúc game. Lấy tối đa 10 câu từ ngân hàng.
- Sút bóng / Ném rổ: khi tạo vòng, hệ thống bốc ngẫu nhiên đúng 1 game và lưu cố định cho vòng đó; tối đa 10 câu, 2 phút/câu, đúng 10 điểm.
- Lái xe: tối đa 2 câu; mỗi câu 4 ý đúng/sai, chấm 5/15/25/50 điểm và 10 phút/câu.
- Mỗi lượt thi có đúng 3 mini game khi ngân hàng câu hỏi đã được nhập đủ.
