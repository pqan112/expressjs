## Stream video

- Yêu cầu Content-Range là end phải luôn nhỏ hơn videoSize
  ❌ 'Content-Range': 'bytes 0-100/100' video sẽ load mà không play được\
  ✅ 'Content-Range': 'bytes 0-99/100'

- Content-Length sẽ là end - start + 1. Đại diện cho khoảng cách
  Từ số 0 đến số 10 thì chúng ta có 11 con số
  Byte cũng tương tự nếu start=0, end=10 thì chúng ta có 11 byte\
  => Công thức là end - start + 1

  - VD: chunkSize=50, videoSize = 100\
    |0---------------50|51-------------99|100(end)\
    stream 1: start=0, end=50, contentLength=51\
    stream 2: start=51, end=99, contentLength=49

    request header 1:\
    'Content-Range': 'bytes 0-50/100`,\
    'Accept-Ranges': 'bytes',\
    'Content-Length': 51,\
    'Content-Type': 'video/mp4'

    request header 2:\
    'Content-Range': 'bytes 51-99/100`,\
    'Accept-Ranges': 'bytes',\
    'Content-Length': 49,\
    'Content-Type': 'video/mp4'
