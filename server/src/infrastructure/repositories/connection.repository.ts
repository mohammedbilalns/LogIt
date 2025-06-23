import { Connection } from "../../domain/entities/connection.entity";
import { IConnectionRepository } from "../../domain/repositories/connection.repository.interface";
import ConnectionModel, { ConnectionDocument } from "../mongodb/connnection.schema";
import { BaseRepository } from "./base.repository";

export class MongoConnectionRepository
  extends BaseRepository<ConnectionDocument, Connection>
  implements IConnectionRepository
{
  constructor() {
    super(ConnectionModel);
  }

  protected getSearchFields(): string[] {
    return ["userId", "connectedUserId", "connectionType"];
  }

  protected mapToEntity(doc: ConnectionDocument): Connection {
    const connection = doc.toObject();
    return {
      ...connection,
      id: connection._id.toString(),
    };
  }

  async findConnection(userId: string, targetUserId: string): Promise<Connection | null> {
    const doc = await ConnectionModel.findOne({ userId, connectedUserId: targetUserId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async deleteConnection(userId: string, targetUserId: string): Promise<void> {
    await ConnectionModel.deleteOne({ userId, connectedUserId: targetUserId });
  }
} 