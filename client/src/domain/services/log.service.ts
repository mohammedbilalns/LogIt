import {Log} from "./../entities/log"
import {Tag} from "./../entities/tag"

export interface LogService {
    fetchLogs: (page: number, limit: number) => Promise<Log[]>;
    fetchUserLogs: (page: number, limit: number) => Promise<Log[]>;
    fetchLog: (id: string) => Promise<Log>;
    createLog: (title: string, content: string, tags: Tag[]) => Promise<Log>;
    updateLog: (id: string, title: string, content: string, tags: Tag[]) => Promise<Log>;
    deleteLog: (id: string) => Promise<void>;
}