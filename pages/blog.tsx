import { Badge, Flex, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { blog } from '@pkg/scripts/blog';

import type { PostMetadata } from '@pkg/types/posts';

interface Props {
  posts: PostMetadata[];
}

function Blog({ posts }: Props) {
  const router = useRouter();

  return (
    <Flex direction="column" gap="3rem" pt="xl">
      {posts.map((post) => (
        <Flex direction="column" gap="sm" key={post.id}>
          <Flex direction="column">
            <Title
              onClick={() => router.push(`/blog/${post.id}`)}
              order={2}
              style={{
                cursor: 'pointer',
              }}
            >
              {post.metadata.title}
            </Title>

            <Text c="dimmed">
              {new Date(post.metadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </Text>
          </Flex>

          <Text>{post.metadata.description}</Text>

          <Flex gap="sm" wrap="wrap">
            {post.metadata.tags.map((tag, index) => (
              <Badge
                gradient={{ from: 'cyan', to: 'blue' }}
                key={index}
                variant="gradient"
              >
                {tag}
              </Badge>
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

export function getStaticProps() {
  const posts = blog.getBlogPosts();

  return {
    props: {
      title: 'Blog',
      posts,
    },
  };
}

export default Blog;
