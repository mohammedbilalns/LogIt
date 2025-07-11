import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IArticleRepository } from "../../domain/repositories/article.repository.interface";
import { ILogRepository } from "../../domain/repositories/log.repository";
import { Article } from "../../domain/entities/article.entity";
import { Log } from "../../domain/entities/log.entity";
import { ICryptoProvider } from "../../domain/providers/crypto.provider.interface";
import { IUserService } from "../../domain/services/user.service.interface";
import {
  UserNotFoundError,
  InvalidPasswordError,
  PasswordMismatchError,
  UserBlockedError,
  UnauthorizedError,
} from "../errors/auth.errors";
import { MissingFieldsError } from "../errors/form.errors";
import { HttpResponse } from "../../constants/responseMessages";
import { InternalServerError } from "../errors/internal.errors";
import {
  UpdateProfileData,
  ChangePasswordData,
  HomeData,
  RecentActivity,
  ChartDataPoint,
} from "../dtos";
import { UserInfoWithRelationship } from "../../domain/entities/user.entity";
import { IConnectionRepository } from "../../domain/repositories/connection.repository.interface";
import { IUserSubscriptionService } from "../../domain/services/user-subscription.service.interface";
import { IMessageRepository } from "../../domain/repositories/message.repository.interface";

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private articleRepository: IArticleRepository,
    private logsRepository: ILogRepository,
    private cryptoProvider: ICryptoProvider,
    private connectionRepository: IConnectionRepository,
    private userSubscriptionService: IUserSubscriptionService,
    private messageRepository: IMessageRepository
  ) {}

  async checkUserBlocked(userId: string): Promise<void> {
    const isBlocked = await this.userRepository.isUserBlocked(userId);
    if (isBlocked) {
      throw new UserBlockedError();
    }
  }

  async updateProfile(
    userId: string | undefined,
    profileData: UpdateProfileData
  ): Promise<User> {
    if (!userId) {
      throw new UnauthorizedError();
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Check if user is blocked
    await this.checkUserBlocked(userId);

    const updatedUser = await this.userRepository.update(userId, profileData);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return updatedUser;
  }

  async changePassword(
    userId: string | undefined,
    passwordData: ChangePasswordData
  ): Promise<User> {
    if (!userId) {
      throw new UnauthorizedError();
    }
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      throw new MissingFieldsError();
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordValid = await this.userRepository.verifyPassword(
      userId,
      passwordData.oldPassword
    );
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    // Check if new password is same as old password
    const isSamePassword = await this.userRepository.verifyPassword(
      userId,
      passwordData.newPassword
    );
    if (isSamePassword) {
      throw new PasswordMismatchError();
    }

    // Hash new password
    const hashedPassword = await this.cryptoProvider.hash(
      passwordData.newPassword,
      10
    );

    // Update password
    const updatedUser = await this.userRepository.updatePassword(
      userId,
      hashedPassword
    );
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return updatedUser;
  }

  async getHomeData(userId: string | undefined): Promise<HomeData> {
    try {
      if (!userId) {
        throw new UnauthorizedError();
      }
      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      await this.checkUserBlocked(userId);

      // Get counts
      const [articlesCount, logsCount, followersCount, messagesCount] = await Promise.all([
        this.articleRepository.count({ authorId: userId }),
        this.logsRepository.count({ userId }),
        this.connectionRepository.count({connectedUserId: userId}),
        this.messageRepository.count({senderId:userId})
      ]);

      console.log("Messages count", messagesCount)

      // const messagesCount = 434;

      const [recentLogs, recentArticles] = await Promise.all([
        this.logsRepository.findMany(userId, {
          limit: 3,
          sortOrder: "desc",
          sortBy: "createdAt",
        }),
        this.articleRepository.findAll({
          limit: 3,
          sortOrder: "desc",
          sortBy: "createdAt",
          filters: { authorId: userId },
        }),
      ]);

      // Combine and sort recent activities
      const recentActivities: RecentActivity[] = [
        ...recentLogs.map((log: Log) => ({
          type: "log" as const,
          id: log.id,
          title: log.title,
          createdAt: log.createdAt,
        })),
        ...recentArticles.data.map((article: Article) => ({
          type: "article" as const,
          id: article.id,
          title: article.title,
          createdAt: article.createdAt || new Date(),
        })),
      ]
        .sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      // Get chart data for past week
      const today = new Date();

      const [logsByDay, articlesByDay] = await Promise.all([
        this.logsRepository.findMany(userId, {
          sortBy: "createdAt",
          sortOrder: "asc",
        }),
        this.articleRepository.findAll({
          sortBy: "createdAt",
          sortOrder: "asc",
          filters: { authorId: userId },
        }),
      ]);

      // Process chart data
      const chartData: ChartDataPoint[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const logsForDay = logsByDay.filter(
          (log: Log) => log.createdAt.toISOString().split("T")[0] === dateStr
        ).length;

        const articlesForDay = articlesByDay.data.filter(
          (article: Article) =>
            (article.createdAt || new Date()).toISOString().split("T")[0] ===
            dateStr
        ).length;

        return {
          date: dateStr,
          logs: logsForDay,
          articles: articlesForDay,
        };
      }).reverse();

      return {
        articlesCount,
        logsCount,
        messagesCount,
        followersCount,
        recentActivities,
        chartData,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_HOME;
      throw new InternalServerError(message);
    }
  }

  async getUserInfoWithRelationship(
    requestedUserId: string,
    targetUserId: string
  ): Promise<UserInfoWithRelationship> {
    // Fetch user info
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new UserNotFoundError();

    // Relationship checks
    const followConn = await this.connectionRepository.findConnection(requestedUserId, targetUserId);
    const followedByConn = await this.connectionRepository.findConnection(targetUserId, requestedUserId);
    const isBlocked = !!(followedByConn && followedByConn.connectionType === "blocked");

    // Fetch counts
    const [followersCount, followingCount, articlesCount] = await Promise.all([
      this.connectionRepository.count({ connectedUserId: targetUserId, connectionType: "following" }),
      this.connectionRepository.count({ userId: targetUserId, connectionType: "following" }),
      this.articleRepository.count({ authorId: targetUserId })
    ]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      profession: user.profession,
      bio: user.bio,
      isBlocked,
      isFollowed: !!(followConn && followConn.connectionType === "following"),
      isFollowingBack: !!(followedByConn && followedByConn.connectionType === "following"),
      isBlockedByYou: !!(followConn && followConn.connectionType === "blocked"),
      followersCount,
      followingCount,
      articlesCount
    };
  }

  async getUserStats(userId: string) {
    // Fetch counts
    const [followersCount, followingCount, articlesCount] = await Promise.all([
      this.connectionRepository.count({ connectedUserId: userId, connectionType: "following" }),
      this.connectionRepository.count({ userId: userId, connectionType: "following" }),
      this.articleRepository.count({ authorId: userId })
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const [monthlyArticles, monthlyLogs] = await Promise.all([
      this.articleRepository.count({
        authorId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      this.logsRepository.count({
        userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ]);

    const currentPlan = await this.userSubscriptionService.getUserCurrentPlan(userId);
    const activeSubscription = await this.userSubscriptionService.findActiveSubscriptionByUserId(userId);

    return { 
      followersCount, 
      followingCount, 
      articlesCount,
      currentPlan,
      activeSubscription,
      monthlyArticles,
      monthlyLogs
    };
  }

  async getUsersForGroupChat(
    currentUserId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: User[]; total: number; hasMore: boolean }> {
    // Verify current user exists
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser) {
      throw new UserNotFoundError();
    }

    await this.checkUserBlocked(currentUserId);

    const filters: Record<string, unknown> = { 
      _id: { $ne: currentUserId },
      isBlocked: false 
    };

    if (search && search.trim()) {
      filters.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const result = await this.userRepository.findAll({
      page,
      limit,
      filters,
      sortBy: "name",
      sortOrder: "asc"
    });

    return {
      users: result.data,
      total: result.total,
      hasMore: result.data.length === limit
    };
  }
}
