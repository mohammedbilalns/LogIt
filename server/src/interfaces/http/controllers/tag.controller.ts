import { Request, Response } from "express";
import { TagService } from "../../../application/usecases/tag/tag.service";
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
    const { page, limit, search, promoted, sortBy, sortOrder } = req.query;
    const userId = req.user?.id;

    const defaultLimit = 5;
    const tags = await this.tagService.getTags({
      page: Number(page) || 1,
      limit: Number(limit) || defaultLimit,
      search: search as string,
      promoted: promoted === "true",
      userId: userId as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    return res.status(HttpStatus.OK).json(tags);
  }

  async getTagsByIds(req: Request, res: Response) {
    const { ids } = req.query;
    
    if (!ids || typeof ids !== 'string') {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        message: 'Tag IDs are required' 
      });
    }

    const tagIds = ids.split(',').filter(id => id.trim());
    const tags = await this.tagService.getTagsByIds(tagIds);

    return res.status(HttpStatus.OK).json({ tags });
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
}
