import { Anchor, Flex } from '@mantine/core';
import Link from 'next/link';

function Navbar() {
  return (
    <Flex gap="lg" pb="xl">
      <Link href="/" legacyBehavior passHref>
        <Anchor>Home</Anchor>
      </Link>

      <Link href="/blog" legacyBehavior passHref>
        <Anchor>Blog</Anchor>
      </Link>

      <Anchor href="https://github.com/matthewwolfe">Github</Anchor>
      <Anchor href="https://www.linkedin.com/in/matthewwolfe2/">
        LinkedIn
      </Anchor>
    </Flex>
  );
}

export default Navbar;
