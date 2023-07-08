import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { NODE_ENV } from '@pkg/config/constants';

import type { Post, PostMetadata, PostYaml } from '@pkg/types/posts';

const postsDirectory = path.join(process.cwd(), 'blog-posts');

function getMetadata(content: string): PostMetadata['metadata'] {
  const yamlContent = content.slice(3, content.lastIndexOf('---'));
  const metadata = yaml.parse(yamlContent) as PostYaml;

  return {
    ...metadata,
    tags: metadata.tags.split(','),
  };
}

function getMarkdown(content: string): string {
  return content.slice(content.lastIndexOf('---') + 3);
}

export function getBlogPosts(): PostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .map((fileName) => {
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
    })
    .filter((postMetadata) => {
      if (NODE_ENV === 'production') {
        return postMetadata.metadata.publish;
      }

      return true;
    });
}

export function getBlogPostIds(): string[] {
  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((filename) => {
      if (NODE_ENV !== 'production') {
        return true;
      }

      const fullPath = path.join(postsDirectory, filename);
      const content = fs.readFileSync(fullPath, 'utf8');
      const metadata = getMetadata(content);

      if (!metadata.publish) {
        return false;
      }

      return true;
    })
    .map((fileName) => fileName.replace(/\.md$/, ''));
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

  if (NODE_ENV === 'production' && !metadata.publish) {
    return undefined;
  }

  const markdown = getMarkdown(content);

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
