import { HttpError } from "./base.errors"
import { HttpStatus } from "../../constants/statusCodes"

export class MissingFieldsError extends HttpError  {
    constructor(message: string = 'Fill all the fileds'){
        super(HttpStatus.BAD_REQUEST, message)
        this.name = "MissingFieldsError"
    }
}

export class InvalidFieldsError extends HttpError {
    constructor(message: string = "Invalid data"){
        super(HttpStatus.BAD_REQUEST, message)
        this.name = "InvalidFieldsError"
    }
}