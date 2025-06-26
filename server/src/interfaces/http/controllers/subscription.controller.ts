import { Request, Response } from "express";
import { ISubscriptionService } from "../../../domain/services/subsription.service.interface";
import { HttpResponse } from "../../../config/responseMessages";
import { HttpStatus } from "../../../config/statusCodes";

export class SubscriptionController {
  constructor(private subscriptionService: ISubscriptionService) {}

  fetchSubscriptions = async (_req: Request, res: Response): Promise<void> => {
    const subscriptions = await this.subscriptionService.fetchSubscriptions();
    res.status(HttpStatus.OK).json({ message: HttpResponse.FETCH_SUBSCRIPTIONS_SUCCESS, data: subscriptions });
  };

  updateSubscription = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    const updated = await this.subscriptionService.updateSubscription(id, req.body);
    if (!updated) {
      res.status(HttpStatus.NOT_FOUND).json({ message: HttpResponse.SUBSCRIPTION_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json({ message: HttpResponse.SUBSCRIPTION_UPDATED, data: updated });
  };
}
