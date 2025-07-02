export interface ConnectionState {
  loading: boolean;
  error: string | null;
  success: boolean;
  followers: any[];
  following: any[];
  followersLoading: boolean;
  followingLoading: boolean;
  followersError: string | null;
  followingError: string | null;
}