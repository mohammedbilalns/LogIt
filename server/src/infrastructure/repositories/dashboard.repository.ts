import UserModel from '../mongodb/user.schema';
import ArticleModel from '../mongodb/article.shema';
import LogModel from '../mongodb/log.schema';

export class DashboardRepository {
  async countUsers(): Promise<number> {
    return await UserModel.countDocuments();
  }

  async countArticles(): Promise<number> {
    return await ArticleModel.countDocuments();
  }

  async countLogs(): Promise<number> {
    return await LogModel.countDocuments();
  }

  async getUserJoinedChart(
    granularity: 'daily' | 'monthly' | 'yearly',
    startDate?: Date,
    endDate?: Date
  ): Promise<{ date: string; value: number }[]> {
    const match: Record<string, unknown> = {};
    if (startDate || endDate) {
      match.createdAt = {} as Record<string, Date>;
      if (startDate) (match.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (match.createdAt as Record<string, Date>).$lte = endDate;
    }
    let groupId: Record<string, unknown>;
    if (granularity === 'yearly') {
      groupId = { year: { $year: '$createdAt' } };
    } else if (granularity === 'monthly') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    } else {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    }
    const result: unknown[] = await UserModel.aggregate([
      { $match: match },
      { $group: { _id: groupId, value: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
    return result.map((r) => {
      const rec = r as { _id: Record<string, number>; value: number };
      let date: string;
      if (granularity === 'yearly') {
        date = `${rec._id.year}`;
      } else if (granularity === 'monthly') {
        date = `${rec._id.year}-${String(rec._id.month).padStart(2, '0')}`;
      } else {
        date = `${rec._id.year}-${String(rec._id.month).padStart(2, '0')}-${String(rec._id.day).padStart(2, '0')}`;
      }
      return { date, value: rec.value };
    });
  }

  async getArticleSharedChart(
    granularity: 'daily' | 'monthly' | 'yearly',
    startDate?: Date,
    endDate?: Date
  ): Promise<{ date: string; value: number }[]> {
    const match: Record<string, unknown> = {};
    if (startDate || endDate) {
      match.createdAt = {} as Record<string, Date>;
      if (startDate) (match.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (match.createdAt as Record<string, Date>).$lte = endDate;
    }
    let groupId: Record<string, unknown>;
    if (granularity === 'yearly') {
      groupId = { year: { $year: '$createdAt' } };
    } else if (granularity === 'monthly') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    } else {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    }
    const result: unknown[] = await ArticleModel.aggregate([
      { $match: match },
      { $group: { _id: groupId, value: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
    return result.map((r) => {
      const rec = r as { _id: Record<string, number>; value: number };
      let date: string;
      if (granularity === 'yearly') {
        date = `${rec._id.year}`;
      } else if (granularity === 'monthly') {
        date = `${rec._id.year}-${String(rec._id.month).padStart(2, '0')}`;
      } else {
        date = `${rec._id.year}-${String(rec._id.month).padStart(2, '0')}-${String(rec._id.day).padStart(2, '0')}`;
      }
      return { date, value: rec.value };
    });
  }
} 