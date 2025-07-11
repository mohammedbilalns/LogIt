import { Request, Response } from 'express';
import { ICallService } from '../../../domain/services/call.service.interface';
import { HttpResponse } from '../../../constants/responseMessages';
import { HttpStatus } from '../../../constants/statusCodes';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: "user" | "admin" | "superadmin";
  };
}

export class CallController {
  constructor(private callService: ICallService) {}

  async createCallLog(req: Request, res: Response): Promise<void> {
    try {
      const { type, chatId, participants } = req.body;
      const call = await this.callService.createCallLog({ type, chatId, participants });
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: call,
        message: HttpResponse.CALL_LOG_CREATED,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: errorMessage || HttpResponse.CALL_LOG_CREATION_FAILED,
      });
    }
  }

  async updateCallLog(req: Request, res: Response): Promise<void> {
    try {
      const { callId } = req.params;
      const { endedAt, endedBy, status, duration } = req.body;
      
      const call = await this.callService.updateCallLog(callId, {
        endedAt,
        endedBy,
        status,
        duration,
      });

      if (!call) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: HttpResponse.CALL_NOT_FOUND,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: call,
        message: HttpResponse.CALL_LOG_UPDATED,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: errorMessage || HttpResponse.CALL_LOG_UPDATE_FAILED,
      });
    }
  }

  async getCallHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { chatId, page = 1, limit = 20 } = req.query;
      
      const result = await this.callService.getCallHistory(
        userId,
        chatId as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: HttpResponse.CALL_HISTORY_FETCHED,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: errorMessage || HttpResponse.CALL_HISTORY_FETCH_FAILED,
      });
    }
  }

  async emitCallEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;
      await this.callService.emitCallEvent(event);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.CALL_EVENT_EMITTED,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: errorMessage || HttpResponse.CALL_EVENT_EMISSION_FAILED,
      });
    }
  }
} 