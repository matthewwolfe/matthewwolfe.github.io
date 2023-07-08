import { Container, MantineProvider } from '@mantine/core';
import Head from 'next/head';
import { IBM_Plex_Serif, IBM_Plex_Sans } from 'next/font/google';
import { Navbar } from '@pkg/components/Navbar';

import type { AppProps } from 'next/app';

interface StaticProps {
  title: string;
  [key: string]: unknown;
}

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
});

function App(props: AppProps<StaticProps>) {
  const {
    Component,
    pageProps: { title, ...pageProps },
  } = props;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <main className={ibmPlexSerif.className}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'light',
            fontFamily: ibmPlexSerif.style.fontFamily,
            headings: {
              fontFamily: ibmPlexSans.style.fontFamily,
            },
            components: {
              Badge: {
                styles: {
                  root: {
                    fontFamily: ibmPlexSans.style.fontFamily,
                  },
                },
              },
            },
          }}
        >
          <Container p="md" py="xl" size="md">
            <Navbar />

            <Component {...pageProps} />
          </Container>
        </MantineProvider>
      </main>
    </>
  );
}

export default App;
