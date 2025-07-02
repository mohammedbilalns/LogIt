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


  export interface TagManagementState {
  tags: Tag[];
  promotedTags: Tag[];
  loadingAllTags: boolean;
  errorAllTags: string | null;
  loadingPromotedTags: boolean;
  errorPromotedTags: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}
