export interface IAuthCheckService {

  checkUserBlocked(userId: string): Promise<void>;
} 