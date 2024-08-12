class AppError extends Error {
    constructor(messsage, statuseCode) {
        super(messsage)
        this.statusCode = statuseCode;
        this.status = `${statuseCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError
