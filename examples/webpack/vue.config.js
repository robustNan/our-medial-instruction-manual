const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    headers: [
      { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ],
  },
  chainWebpack: (config) => {
    // set worker-loader
    config.module
      .rule("worker")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .end();
    // 解决：worker 热更新问题
    config.module.rule("js").exclude.add(/\.worker\.js$/);
  },
});
