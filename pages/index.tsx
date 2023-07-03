import { Title } from '@mantine/core';

function Blog() {
  return null;
}

export function getStaticProps() {
  return {
    props: {
      title: 'Matt Wolfe',
    },
  };
}

export default Blog;
