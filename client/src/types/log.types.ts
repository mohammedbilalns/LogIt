import { Tag } from "./tag.types";
export interface Log {
    _id: string;
    title: string;
    content: string;
    tags: Tag[];
    createdAt: string;
    mediaUrls: string[];
}

export interface LogState {
    logs: Log[];
    loading: boolean;
    error: string | null;
    total: number;
    searchQuery: string;
    currentLog: Log | null;
    hasMore: boolean;
}
