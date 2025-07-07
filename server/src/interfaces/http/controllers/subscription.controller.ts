import { Request, Response } from "express";
import { ISubscriptionService } from "../../../domain/services/subsription.service.interface";
import { HttpResponse } from "../../../constants/responseMessages";
import { HttpStatus } from "../../../constants/statusCodes";
import { CreateSubscriptionData, UpdateSubscriptionData } from "../../../application/dtos";

export class SubscriptionController {
  constructor(private subscriptionService: ISubscriptionService) {}

  fetchSubscriptions = async (_req: Request, res: Response): Promise<void> => {
    const subscriptions = await this.subscriptionService.fetchSubscriptions();
    res.status(HttpStatus.OK).json({ message: HttpResponse.FETCH_SUBSCRIPTIONS_SUCCESS, data: subscriptions });
  };

  createSubscription = async (req: Request, res: Response): Promise<void> => {
    const subscriptionData: CreateSubscriptionData = req.body;
    const subscription = await this.subscriptionService.createSubscription(subscriptionData);
    res.status(HttpStatus.CREATED).json({ message: HttpResponse.SUBSCRIPTION_CREATED, data: subscription });
  };

  deActivateSubscription = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deactivated = await this.subscriptionService.deActivateSubscription(id);
    if (!deactivated) {
      res.status(HttpStatus.NOT_FOUND).json({ message: HttpResponse.SUBSCRIPTION_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json({ message: HttpResponse.SUBSCRIPTION_UPDATED, data: deactivated });
  };

  updateSubscription = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    const updateData: UpdateSubscriptionData = req.body;
    const updated = await this.subscriptionService.updateSubscription(id, updateData);
    if (!updated) {
      res.status(HttpStatus.NOT_FOUND).json({ message: HttpResponse.SUBSCRIPTION_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json({ message: HttpResponse.SUBSCRIPTION_UPDATED, data: updated });
  };
}
