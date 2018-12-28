module.exports = {
	configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(pdf)(\?.*)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: 'files/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },
    devtool: 'source-map'
  },
  // devServer: {
  //   proxy: { // proxyTable 설정
  //     '/api' : {
  //         target : 'http://localhost:33000',
  //         ws: true,
  //         changeOrigin: true,
  //         // pathRewrite: {
  //         //     '^/api': ''
  //         //   }
  //     }
  //   }
  // },
}
