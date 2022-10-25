import Document, { Html, Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  render() {
    return (
      <Html style={{ height: "100%" }} lang={"es"}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Roboto+Slab:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </Head>

        <body style={{ minHeight: "100%" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
