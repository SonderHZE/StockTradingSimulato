
module.exports = {
  devServer: {
    port: 8080,
    host: '127.0.0.1',
    proxy: {
      '/api': { 
        target: 'http://127.0.0.1:12345', 
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
};