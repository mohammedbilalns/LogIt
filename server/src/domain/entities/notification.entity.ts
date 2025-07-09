import { BaseEntity } from "../repositories/base.repository.interface";

export interface Notification extends BaseEntity {
    userId: string;
    type: "chat" | "subscription" | "group";
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    readAt?: string;
}