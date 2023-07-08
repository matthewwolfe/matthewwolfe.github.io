import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

import type { Post, PostMetadata, PostYaml } from '@pkg/types/posts';

const postsDirectory = path.join(process.cwd(), 'blog-posts');

function getMetadata(content: string) {
  const yamlContent = content.slice(3, content.lastIndexOf('---'));
  const metadata = yaml.parse(yamlContent) as PostYaml;

  return {
    ...metadata,
    tags: metadata.tags.split(','),
  };
}

function getMarkdown(content: string) {
  return content.slice(content.lastIndexOf('---') + 3);
}

export function getBlogPosts(): PostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const content = fs.readFileSync(fullPath, 'utf8');
    const metadata = getMetadata(content);

    return {
      id,
      metadata,
    };
  });
}

export function getBlogPostIds(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getBlogPostById(id: string): Post | undefined {
  const fileNames = fs.readdirSync(postsDirectory);

  const fileName = fileNames.find(
    (fileName) => fileName.replace(/\.md$/, '') === id,
  );

  if (!fileName) {
    return undefined;
  }

  // Read markdown file as string
  const fullPath = path.join(postsDirectory, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');
  const metadata = getMetadata(content);
  const markdown = getMarkdown(content);

  console.log(markdown);

  return {
    id,
    metadata,
    content: markdown,
  };
}

export const blog = {
  getBlogPosts,
  getBlogPostById,
  getBlogPostIds,
} as const;
