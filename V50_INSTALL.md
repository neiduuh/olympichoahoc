# Cập nhật V5.0 – Mini game lái xe vượt chướng ngại vật

## Điểm mới
- Làm lại mini game **Lái xe vượt chướng ngại vật**.
- Mỗi lượt thi, hệ thống **chọn ngẫu nhiên 2 trong 3 chướng ngại vật**:
  - hòn đá
  - vũng nước
  - bụi cây
- Xe có **hoạt ảnh chạy tới**, **dừng lại trước chướng ngại vật**, sau đó mới hiện câu hỏi.
- Câu hỏi được **lấy ngẫu nhiên từ ngân hàng câu hỏi** của mini game.
- Nếu là câu hỏi trắc nghiệm hoặc đúng/sai, các đáp án/ý sẽ được **đảo ngẫu nhiên** để công bằng hơn.
- Đã thêm 3 ảnh minh họa chướng ngại vật vào thư mục `static/img/`.

## Nếu thầy dùng bản PATCH
1. Giải nén file patch.
2. Chép đè các file/thư mục vào project cũ.
3. Commit lên GitHub.
4. Render sẽ tự deploy lại.

## Nếu thầy dùng bản FULL
- Có thể giải nén toàn bộ và deploy lại từ đầu.

## Các file đã thay đổi
- `templates/play.html`
- `static/js/phaser-games.js`
- `static/img/race_obstacle_rock_v50.png`
- `static/img/race_obstacle_puddle_v50.png`
- `static/img/race_obstacle_bush_v50.png`
