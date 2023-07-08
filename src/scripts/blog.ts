import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'blog-posts');

export function getBlogPosts() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    return {
      id,
      metadata: {
        ...matterResult.data,
        tags: matterResult.data.tags.split(','),
      },
    };
  });
}

export function getBlogPostIds(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getBlogPostById(id: string) {
  const fileNames = fs.readdirSync(postsDirectory);

  const fileName = fileNames.find(
    (fileName) => fileName.replace(/\.md$/, '') === id
  );

  if (!fileName) {
    return undefined;
  }

  // Read markdown file as string
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  return {
    id,
    metadata: {
      ...matterResult.data,
      tags: matterResult.data.tags.split(','),
    },
    content: matterResult.content,
  };
}

export const blog = {
  getBlogPosts,
  getBlogPostById,
  getBlogPostIds,
} as const;
