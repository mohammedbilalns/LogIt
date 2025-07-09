import { Notification } from "../../domain/entities/notification.entity";
import { INotificationRepository } from "../../domain/repositories/notifiction.repository.interface";
import NotificationModel, { NotificationDocument } from "../mongodb/notification.schema";
import { BaseRepository } from "./base.repository";

export class MongoNotificationRepository
  extends BaseRepository<NotificationDocument, Notification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  protected getSearchFields(): string[] {
    return ["title", "message", "type"];
  }

  protected mapToEntity(doc: NotificationDocument): Notification {
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      userId: obj.userId,
      type: obj.type,
      title: obj.title,
      message: obj.message,
      link: obj.link,
      isRead: obj.isRead,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      readAt: obj.readAt,
    };
  }

  async findByUserId(userId: string, limit = 20): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByUserIdPaginated(userId: string, page = 1, limit = 10): Promise<{ notifications: Notification[]; total: number }> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments({ userId })
    ]);
    return {
      notifications: docs.map((doc) => this.mapToEntity(doc)),
      total
    };
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date().toISOString() },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
     await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    // Debug logs
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false });
  }
}
