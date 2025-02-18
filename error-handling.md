### Error handling

- Gọi next() để chuyển request sang request handler tiếp theo
- Gọi next(err) để chuyển request sang error handler tiếp theo

#### Request handler

- Request handler **phải khai báo 3 tham số** là req, res, next

#### Error handler

- Nhận error từ request handler và trả về response
- Error handler **bắt buộc phải khai báo đủ 4 tham số** là err, req, res, next

```
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message
  })
}
```

- khi throw một error trong code đồng bộ (synchronous) thì sẽ nhận được error message ở error handler
- khi throw một error trong code đồng bộ thì expressjs sẽ tự động next(error)

```
(req, res, next) => {
  <!-- next(new Error('lỗi rồi')) -->
  throw new Error('lỗi rồi')
}, (error req, res, next) => {
  console.log(error.message) // lỗi rồi
}
```

- khi throw một error trong code bất đồng bộ (asynchronous)
- khi throw một error trong code đồng bộ thì expressjs sẽ không tự động next(error) -> phải tự next() thủ công
- khi dùng async thì throw Error ở đây sẽ là một Promise nên chúng ta try...catch nó

```
async (req, res, next) => {
  try {
    throw new Error('lỗi rồi')
  } catch(err) {
    next(err)
  }
}, (error req, res, next) => {
  console.log(error.message) // lỗi rồi
}
```
