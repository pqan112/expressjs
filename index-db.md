### Đánh index trường trong database giúp cho việc query nhanh hơn

- ví dụ:
  - trong 1 model schema nếu đánh index ở cột \_id thì khi thực hiện query với id được truyền lên cho database sẽ trả về kết quả nhanh hơn
  - field email không được đánh index thì khi query database sẽ thực hiện vòng lặp qua tất cả các collection (record) để tìm và trả về khi có email trùng khớp -> lâu quá đi thôi
  - và không phải tất cả các field đều nên đánh index vì nó sẽ làm tăng bộ nhớ của database lên nên cần phải cân nhắc khi đánh index
