### Đánh index trường trong database giúp cho việc query nhanh hơn

- ví dụ:
  - trong 1 model schema nếu đánh index ở cột \_id thì khi thực hiện query với id được truyền lên cho database sẽ trả về kết quả nhanh hơn
  - field email không được đánh index thì khi query database sẽ thực hiện vòng lặp qua tất cả các collection (record) để tìm và trả về khi có email trùng khớp -> lâu quá đi thôi
  - và không phải tất cả các field đều nên đánh index vì nó sẽ làm tăng bộ nhớ của database lên nên cần phải cân nhắc khi đánh index

#### Ưu điểm:

- Ưu điểm là tăng tốc độ truy vấn, đặc biệt là đối với những collection có nhiều records

#### Nhược điểm:

- Tốn dung lượng lưu trữ: Index tạo ra các bảng chỉ mục riêng biệt, làm tăng dung lượng bộ nhớ
- Tốn thời gian khi thêm, sửa, xóa dữ liệu. Khi thêm, sửa, xóa dữ liệu trong các trường đã tạo index, MongoDB sẽ phải cập nhật lại chỉ mục liên quan. Quá trình này tiêu tốn thời gian và tài nguyên hơn so với việc không sử dụng index.

#### Giới hạn của index:

- Một collection chỉ có thể có tối đa 64 index
- Một collection chỉ có 1 text index để text search được nhiều trường thì dùng compound index
