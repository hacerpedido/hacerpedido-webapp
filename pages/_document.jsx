import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

const documentLayoutStyles = `
  html {
    height: 100%;
  }

  body {
    min-height: 100%;
  }

  #__next {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          <style dangerouslySetInnerHTML={{ __html: documentLayoutStyles }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
