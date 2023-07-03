import { createGetInitialProps } from '@mantine/next';
import NextDocument, { Head, Html, Main, NextScript } from 'next/document';

const getInitialProps = createGetInitialProps();

class Document extends NextDocument {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
