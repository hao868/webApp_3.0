const path = require('path')
const resolve = dir => path.join(__dirname, dir)
module.exports = {
  transpileDependencies: ['uview-ui'],
	configureWebpack: {
		devServer: {
			disableHostCheck: true
		}
	}
}