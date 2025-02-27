class ApiError {
    constructor(code, message) {
        this.code = code;
        this.message = message
    }
    static badRequest(msg) {
        return new ApiError(400, msg);
    }
    static dbConnectionError(msg) {
        return new ApiError(500, msg);
    }
    static validationError(msg) {
        return new ApiError(422, msg);
    }
    static invalidApiError(msg) {
        return new ApiError(404, msg);
    }
    static serverError(msg) {
        return new ApiError(500, msg);
    }
    static authError(msg) {
        return new ApiError(401, msg);
    }
    static forbiddenAccessError(msg) {
        return new ApiError(403, msg);
    }
    static fileTypeError(msg) {
        return new ApiError(415, msg);
    }
}

module.exports = ApiError;