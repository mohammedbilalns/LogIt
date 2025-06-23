import mongoose, {Document} from "mongoose";

import { Connection } from "../../domain/entities/connection.entity";

type ConnectionWithoutId = Omit<Connection, 'id'>
export interface ConnectionDocument extends Document,ConnectionWithoutId {}

const connectionSchema = new mongoose.Schema<ConnectionDocument>(
    {
        userId: {type: String, required: true },
        connectedUserId: {type: String,required: true},
        connectionType: {type: String, required:true, default:"following",
            enum: ['following', 'blocked']
        }
    
    }
)

const ConnectionModel = mongoose.model<ConnectionDocument>("Connection", connectionSchema)

export default ConnectionModel