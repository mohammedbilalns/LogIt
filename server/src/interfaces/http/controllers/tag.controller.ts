import { Request, Response } from "express";
import { TagService } from "../../../application/usecases/articles/tag.service";
import { HttpStatus } from "../../../config/statusCodes";

export class TagController {
  constructor(private tagService: TagService) {}

  async createTag(req: Request, res: Response) {
    const { name } = req.body;
    const tag = await this.tagService.createTag({
      name,
      usageCount: 0,
      promoted: false,
    });
    return res.status(HttpStatus.CREATED).json(tag);
  }

  async updateTag(req: Request, res: Response) {
    const { id: tagId } = req.params;
    const { name, promoted } = req.body;
    const tag = await this.tagService.updateTag(tagId, { name, promoted });
    res.status(HttpStatus.OK).json(tag);
  }

  async getTag(req: Request, res: Response) {
    const { id: tagId } = req.params;
    const tag = await this.tagService.getTag(tagId);

    return res.status(HttpStatus.OK).json(tag);
  }

  async getTags(req: Request, res: Response) {
    const { page, limit, search, promoted } = req.query;
    const userId = req.user?.id;

    const defaultLimit = 5;
    const tags = await this.tagService.getTags({
      page: Number(page) || 1,
      limit: Number(limit) || defaultLimit,
      search: search as string,
      promoted: promoted === "true",
      userId: userId as string,
    });

    return res.status(HttpStatus.OK).json(tags);
  }

  async deleteTag(req: Request, res: Response) {
    const { id: tagId } = req.params;
    await this.tagService.deleteTag(tagId);
    return res.send();
  }

  async promoteTag(req: Request, res: Response) {
    const { id: tagId } = req.params;
    const tag = await this.tagService.promoteTag(tagId);
    return res.status(HttpStatus.OK).json(tag);
  }

  async demoteTag(req: Request, res: Response) {
    const { id: tagId } = req.params;
    const tag = await this.tagService.demoteTag(tagId);
    return res.status(HttpStatus.OK).json(tag);
  }

  async searchTags(req: Request, res: Response) {
    const { query } = req.query;

    const tags = await this.tagService.getTags({
      search: query as string,
      limit: 10,
    });

    return res.status(HttpStatus.OK).json(tags.tags);
  }

  async getPromotedAndUserTags(req: Request, res: Response) {
    const userId = req.user?.id;
    const { limit } = req.query;

    const tags = await this.tagService.getPromotedAndUserTags(
      userId,
      Number(limit) || 5
    );

    return res.status(HttpStatus.OK).json(tags);
  }
}
