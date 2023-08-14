const webpack = require("webpack");
module.exports = function override(config) {
  let fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto:  require.resolve("crypto-browserify"),
    stream:  require.resolve("stream-browserify"),
    assert:  require.resolve("assert"),
    http:  require.resolve("stream-http"),
    https:  require.resolve("https-browserify"),
    os:  require.resolve("os-browserify/browser"),
    url:  require.resolve("url"),
    zlib:  require.resolve("browserify-zlib"),
    path:  require.resolve("path-browserify"),
    timers:  require.resolve("timers-browserify"),
    dns:  require.resolve("dns"),
    net:  require.resolve("net-browserify"),
    tls:  require.resolve("tls-browserify"),
    fs:  require.resolve("browserify-fs"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};