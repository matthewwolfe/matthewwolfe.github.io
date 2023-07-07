import { Center, Flex, Text, Title } from '@mantine/core';

function Index() {
  return (
    <Center maw={640} h={400} mx="auto">
      <Flex align="center" direction="column" gap="md">
        <Title align="center" size="4rem">
          Hi! I'm Matt
        </Title>

        <Text align="center">
          I'm a Lead Software Engineer, currently working at Centene.
        </Text>

        <Text align="center">
          I mostly write about boring, basic, uneventful software development. A
          strong foundation and commitment to the fundamentals is surprisingly
          enough to make great software.
        </Text>
      </Flex>
    </Center>
  );
}

export function getStaticProps() {
  return {
    props: {
      title: 'Matt Wolfe',
    },
  };
}

export default Index;
