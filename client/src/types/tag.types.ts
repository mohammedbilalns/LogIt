export interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  promoted: boolean;
}

export interface TagState {
    tags: Tag[];
    searchResults: Tag[];
    loading: boolean;
    error: string | null;
  }