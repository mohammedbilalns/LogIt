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

export interface SubscriptionLimitData {
    currentPlan: {
        id: string;
        name: string;
        price: number;
        maxLogsPerMonth: number;
        maxArticlesPerMonth: number;
        description: string;
    };
    nextPlan?: {
        id: string;
        name: string;
        price: number;
        maxLogsPerMonth: number;
        maxArticlesPerMonth: number;
        description: string;
    };
    currentUsage: number;
    limit: number;
    exceededResource: 'logs' | 'articles';
}

export class ResourceLimitExceededError extends HttpError {
    public subscriptionData?: SubscriptionLimitData;

    constructor(message: string = "Maximum number of resource exceeded", subscriptionData?: SubscriptionLimitData){
        super(HttpStatus.FORBIDDEN, message)
        this.name = 'ResourceLimitExceededError'
        this.subscriptionData = subscriptionData;
    }
}
