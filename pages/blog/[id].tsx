import { Title, Text, Flex } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { blog } from '@pkg/scripts/blog';

import type { GetStaticPropsContext } from 'next';
import type { Post } from '@pkg/types/posts';

interface Props {
  post: Post;
}

function BlogPost({ post }: Props) {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="xs">
        <Title order={1}>{post.metadata.title}</Title>

        <Text c="dimmed">
          {new Date(post.metadata.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </Text>
      </Flex>

      <Flex direction="column" gap="md">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');

              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                >
                  {children.toString().replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => <Title order={1}>{children}</Title>,
            h2: ({ children }) => <Title order={2}>{children}</Title>,
            h3: ({ children }) => <Title order={3}>{children}</Title>,
            h4: ({ children }) => <Title order={4}>{children}</Title>,
            h5: ({ children }) => <Title order={5}>{children}</Title>,
            h6: ({ children }) => <Title order={6}>{children}</Title>,
            p: ({ children }) => <Text>{children}</Text>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </Flex>
    </Flex>
  );
}

export async function getStaticPaths() {
  return {
    paths: blog.getBlogPostIds().map((id) => ({ params: { id } })),
    fallback: 'blocking',
  };
}

export function getStaticProps(context: GetStaticPropsContext) {
  const id = context.params?.id as string;
  const post = blog.getBlogPostById(id);

  return {
    props: {
      post,
    },
  };
}

export default BlogPost;
