const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://server:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding
      },
    })
  );

  // Also proxy all other non-static requests
  app.use(
    ['/sessions', '/users', '/items', '/accounts', '/appFunds', '/institutions', '/link-token', '/link-event'],
    createProxyMiddleware({
      target: 'http://server:5000',
      changeOrigin: true,
    })
  );
};
