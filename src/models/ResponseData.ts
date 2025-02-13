export default class ResponseData<T> {
  data: T
  status: number
  message: string

  constructor({ data, status, message }: { data: T; status: number; message: string }) {
    this.data = data
    this.status = status
    this.message = message
  }
}
