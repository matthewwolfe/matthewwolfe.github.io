export interface PostYaml {
  date: string;
  title: string;
  description: string;
  publish: boolean;
  tags: string;
}

export interface PostMetadata {
  id: string;
  metadata: {
    date: string;
    title: string;
    description: string;
    publish: boolean;
    readingTime: string;
    tags: string[];
  };
}

export interface Post extends PostMetadata {
  content: string;
}
