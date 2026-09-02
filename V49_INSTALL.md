PATCH V4.9 - Nâng cấp mini game bóng rổ

Nội dung cập nhật:
1) Đổi giao diện bóng rổ theo ảnh mẫu đã duyệt: phòng tập sáng màu, bảng rổ lớn phía trên, người đứng trước rổ.
2) Thêm hoạt ảnh ném bóng theo quỹ đạo cong vào rổ hoặc trượt ra ngoài.
3) Đáp án A/B/C/D được đảo ngẫu nhiên ở phía client nhưng vẫn chấm đúng theo đáp án gốc.
4) Câu hỏi game bóng rổ vẫn lấy ngẫu nhiên từ ngân hàng câu hỏi Admin đã nhập (đã có sẵn từ V4).

Chỉ cần ghi đè các file sau:
- static/js/phaser-games.js
- templates/play.html
- static/img/basketball_scene_v49.png

Sau đó commit lên GitHub và để Render deploy lại.
Không cần sửa DATABASE_URL, SECRET_KEY hay Build Command.
