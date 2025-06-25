import { Message } from "../entities/message.entity";
import { IBaseRepository } from "./base.repository.interface";
 
export interface IMessageRepository extends IBaseRepository<Message> {} 