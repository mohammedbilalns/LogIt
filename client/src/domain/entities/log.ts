import {Tag} from "./tag"
export interface Log {
    _id: string;
    title: string;
    content: string;
    tags: Tag[];
    createdAt: string;
    mediaUrls: string[];
}