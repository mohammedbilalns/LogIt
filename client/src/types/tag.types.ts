export interface Tag {
  id: any;
  _id: string;
  name: string;
  usageCount: number;
  promoted: boolean;
}

export interface TagState {
    tags: Tag[];
    searchResults: Tag[];
    tagNames: Tag[];
    loading: boolean;
    error: string | null;
    total: number;
    promotedTags: Tag[];
    loadingAllTags: boolean;
    errorAllTags: string | null;
    loadingPromotedTags: boolean;
    errorPromotedTags: string | null;
  }