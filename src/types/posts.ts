export interface PostMetadata {
  id: string;
  metadata: {
    date: string;
    title: string;
    description: string;
    tags: string[];
  };
}

export interface Post extends PostMetadata {
  content: string;
}
