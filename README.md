# JLPT N1 Study

Ứng dụng web tiến bộ (PWA) học ngữ pháp JLPT N1, giao diện tiếng Việt.

## Chức năng trong MVP
- 12 mẫu ngữ pháp mẫu kèm ý nghĩa, cấu trúc, ví dụ, sắc thái và phân biệt.
- Tìm kiếm bài học, đánh dấu hoàn thành và theo dõi tiến độ.
- Trắc nghiệm ngẫu nhiên 5 câu.
- Nhắc ôn sau 1 ngày.
- Xuất/nhập bản sao lưu JSON.
- Service worker cache các tệp để hỗ trợ sử dụng ngoại tuyến sau lần tải đầu.

## Chạy trên Windows
1. Giải nén dự án.
2. Mở terminal tại thư mục `jlpt_n1_pwa`.
3. Chạy `python -m http.server 8000`.
4. Mở `http://localhost:8000`.

## Cài trên iPhone
Triển khai ứng dụng trên HTTPS, mở bằng Safari, chọn Chia sẻ → Thêm vào Màn hình chính.

## Giới hạn hiện tại
Đây là MVP thử nghiệm, gồm 12 mẫu, chưa phải khóa học N1 đầy đủ. Tiến độ lưu cục bộ trong từng trình duyệt và chưa đồng bộ giữa các thiết bị. Nội dung cần được biên tập, kiểm chứng thêm.


## Nghe câu ví dụ tiếng Nhật
Trong mỗi bài học và phần phản hồi trắc nghiệm, nhấn nút **Nghe** để phát câu ví dụ bằng giọng đọc tiếng Nhật của trình duyệt/thiết bị. Nút **Dừng** ngắt phần đọc đang phát. Trên iPhone, mở ứng dụng bằng Safari; chất lượng và lựa chọn giọng đọc phụ thuộc các giọng tiếng Nhật được cài trong iOS.
