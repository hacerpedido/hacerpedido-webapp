import Document, { Html, Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  render() {
    return (
      <Html style={{ height: "100%" }} lang={"es"}>
        <Head />

        <body style={{ minHeight: "100%" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
