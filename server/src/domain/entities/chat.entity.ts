
export interface Chat{
    id : string; 
    isGroup: boolean;
    name?:string ;
    creator: string; 
    lastMessage:string; 
    createAt:string;
    updatedAt: string;
    deletedAt:Date;

}