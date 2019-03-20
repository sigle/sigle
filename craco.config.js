const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const cracoBlockstackPlugin = require('craco-blockstack');

module.exports = {
  plugins: [{ plugin: cracoBlockstackPlugin }],
  webpack: {
    configure: webpackConfig => {
      if (process.env.ANALYZE) {
        webpackConfig.plugins.push(new BundleAnalyzerPlugin());
      }

      /**
       * We need to allow cra to accept a file in the root folder
       */
      webpackConfig.resolve.plugins[1].appSrcs.push(
        path.resolve(__dirname, 'tailwind.js')
      );

      return webpackConfig;
    },
  },
};
