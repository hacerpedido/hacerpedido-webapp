module.exports = {
  swcMinify: true,
  images: {
    domains: [
      "hacerpedido2-images.s3.amazonaws.com",
      "loremflickr.com",
      "ui-avatars.com",
      "hacerpedido.imgix.net",
    ],
    // deviceSizes: [320, 420, 768, 1024, 1200],
    // loader: "imgix",
    // path: "https://hacerpedido.imgix.net",
  },
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  // INFO: https://github.com/vercel/next.js/issues/31255#issuecomment-968614049
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    }

    config.resolve.extensions = [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ]
    return config
  },
}
