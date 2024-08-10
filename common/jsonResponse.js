class JsonResponse {
  constructor(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success(data) {
    return new JsonResponse(200, 'Success', data);
  }

  static fail(code, data) {
    return new JsonResponse(code, 'Fail', data);
  }

  send(res) {
    res.status(this.code).json({
      message: this.message,
      data: this.data
    })
  }
}

export default JsonResponse;