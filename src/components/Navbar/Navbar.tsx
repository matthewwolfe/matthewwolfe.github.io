import { Anchor, Flex, Title } from '@mantine/core';
import Link from 'next/link';

import type { Props } from './Navbar.types';

function Navbar({ title }: Props) {
  return (
    <Flex justify="space-between" pb="xl">
      <Title order={1}>{title}</Title>

      <Flex gap="xl">
        <Link href="/" legacyBehavior passHref>
          <Anchor>Home</Anchor>
        </Link>

        <Link href="/blog" legacyBehavior passHref>
          <Anchor>Blog</Anchor>
        </Link>
      </Flex>
    </Flex>
  );
}

export default Navbar;
