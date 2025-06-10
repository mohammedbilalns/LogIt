import { Request, Response } from 'express';
import { TagService } from '../../../application/usecases/articles/tag.service';

export class TagController {
  constructor(private tagService: TagService) {}

  async createTag(req: Request, res: Response) {
    const { name } = req.body;
    const tag = await this.tagService.createTag({ name, usageCount: 0, promoted: false });
    return res.status(201).json(tag);
  }

  async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, promoted } = req.body;
      const tag = await this.tagService.updateTag(id, { name, promoted });
      res.json(tag);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getTag(req: Request, res: Response) {
    const { id } = req.params;
    const tag = await this.tagService.getTag(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    return res.json(tag);
  }

  async getTags(req: Request, res: Response) {
    const { page, limit, search, promoted } = req.query;
    const userId = req.user?.id;
    
    // default to 5 tags
    const defaultLimit = 5;
    const tags = await this.tagService.getTags({
      page: Number(page) || 1,
      limit: Number(limit) || defaultLimit,
      search: search as string,
      promoted: promoted === 'true',
      userId: userId as string
    });
    
    // Add cache control headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json(tags);
  }

  async deleteTag(req: Request, res: Response) {
    const { id } = req.params;
    await this.tagService.deleteTag(id);
    return res.status(204).send();
  }

  async promoteTag(req: Request, res: Response) {
    const { id } = req.params;
    const tag = await this.tagService.promoteTag(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    return res.json(tag);
  }

  async demoteTag(req: Request, res: Response) {
    const { id } = req.params;
    const tag = await this.tagService.demoteTag(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    return res.json(tag);
  }

  async searchTags(req: Request, res: Response) {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const tags = await this.tagService.getTags({
      search: query,
      limit: 10
    });
    
    // Add cache control headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json(tags.tags);
  }
} 