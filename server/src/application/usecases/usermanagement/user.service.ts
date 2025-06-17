import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { IArticleRepository } from "../../../domain/repositories/article.repository.interface";
import { ILogRepository } from "../../../domain/repositories/log.repository";
import { Article } from "../../../domain/entities/article.entity";
import { Log } from "../../../domain/entities/log.entity";
import {
  UserNotFoundError,
  InvalidPasswordError,
  PasswordMismatchError,
  UserBlockedError,
  UnauthorizedError,
} from "../../errors/auth.errors";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoLogRepository } from "../../../infrastructure/repositories/log.repository";

import bcrypt from "bcryptjs";
import { MissingFieldsError } from "../../errors/form.errors";
import { HttpResponse } from "../../../config/responseMessages";
import { InternalServerError } from "../../errors/internal.errors";

export class UserService {
  private userRepository: IUserRepository;
  private articleRepository: IArticleRepository;
  private logsRepository: ILogRepository;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.articleRepository = new MongoArticleRepository();
    this.logsRepository = new MongoLogRepository();
  }

  async checkUserBlocked(userId: string): Promise<void> {
    const isBlocked = await this.userRepository.isUserBlocked(userId);
    if (isBlocked) {
      throw new UserBlockedError();
    }
  }

  async updateProfile(
    userId: string | undefined,
    profileData: {
      name?: string;
      profileImage?: string;
      profession?: string;
      bio?: string;
    }
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
    oldPassword: string,
    newPassword: string
  ): Promise<User> {
    if (!userId) {
      throw new UnauthorizedError();
    }
    if (!oldPassword || !newPassword) {
      throw new MissingFieldsError();
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Verify old password
    const isPasswordValid = await this.userRepository.verifyPassword(
      userId,
      oldPassword
    );
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    // Check if new password is same as old password
    const isSamePassword = await this.userRepository.verifyPassword(
      userId,
      newPassword
    );
    if (isSamePassword) {
      throw new PasswordMismatchError();
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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

  async getHomeData(userId: string | undefined) {
    try {
      if (!userId) {
        throw new UnauthorizedError();
      }
      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      // Check if user is blocked
      await this.checkUserBlocked(userId);

      // Get counts
      const [articlesCount, logsCount] = await Promise.all([
        this.articleRepository.count({ authorId: userId }),
        this.logsRepository.count({ userId }),
      ]);

      // Static values f
      const messagesCount = 434;
      const followersCount = 534;

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
      const recentActivities = [
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

      // Get all logs and articles for the past week
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
      const chartData = Array.from({ length: 7 }, (_, i) => {
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
}
