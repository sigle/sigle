const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CracoBlockstackPlugin = require('craco-blockstack');

module.exports = {
  plugins: [{ plugin: CracoBlockstackPlugin }],
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
