import { HttpStatus } from "../../config/statusCodes";
import { HttpError } from "./base.errors";

export class ResourceNotFoundError extends HttpError {
    constructor(message: string = 'Resource Not found'){
        super(HttpStatus.NOT_FOUND, message)
        this.name = "ResourceNotFoundError"
    }
}

export class ResourceConflictError extends HttpError {
    constructor(message: string = 'Resource already exists'){
        super(HttpStatus.CONFLICT, message)
        this.name = 'ResourceConflictError'
    }
}   

