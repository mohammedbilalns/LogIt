import { BaseEntity } from "./base.entity";

export interface Chat extends BaseEntity {
    isGroup: boolean;
  name?: string;
  creator?: string;
  lastMessage?: string;
  deletedAt?: Date;
}