export abstract class HttpError extends Error {
    constructor(
        public statusCode: number, 
        message: string 
    ){
        super(message)
        this.name = "HttpError"
        Error.captureStackTrace(this, this.constructor)
    }

}