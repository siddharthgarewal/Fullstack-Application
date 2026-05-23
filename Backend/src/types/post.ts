export interface Post {
  id: number;
  title: string;
}

export interface MockDbSchema {
  nextPostId: number;
  posts: Post[];
}
