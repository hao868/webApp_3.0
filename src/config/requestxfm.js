// #ifdef MP-WEIXIN
import $config from "/public/config.js"
// #endif
import * as db from '@/utils/db.js'
import store from "@/store";
import crypto from "@/utils/crypto";

const request = (config) => {
	return new Promise((resolve, reject) => {
		
		const BASE_URL_XFM = store.getters.webAppConfig.yunAPIUrl
		
		let baseUrl = BASE_URL_XFM ? BASE_URL_XFM : $config.BASE_URL_XFM
		// let baseUrl = $config.BASE_URL_XFM
		let apiUrl = config.url
		if(baseUrl.substr(-1) == '/') {
			baseUrl = baseUrl.substr(0, baseUrl.length - 1)
		}
		if(apiUrl.substr(0, 1) == '/') {
			apiUrl = apiUrl.substr(1)
		}
		
		// console.log('当前环境----', baseUrl)
		// console.log('当前api ----统一api', `${baseUrl}/${apiUrl}`)
		
		uni.request({
			url: `${baseUrl}/${apiUrl}`,
			timeout: 5000,
			header: {
				'Content-Type': config.contentType || 'application/json;charset=utf-8',
				// 'token': db.get('token')
			},
			method: config.method || 'GET',
			data: {
				...config.data,
				Sign: crypto.md5(JSON.stringify(config.data))
			},
			success: response => {
				// console.log('统一api',response)
				if (response.data && response.data.code === 3) {
					uni.showToast({
						mask: true,
						icon: 'none',
						title: `${response.data.message}`,
						duration: 2000
					})
					reject(response)
				} else {
				  resolve(response.data)
				}
			},
			fail: err => {
				uni.showToast({
					icon: 'error',
					mask: true,
					title: err.errMsg
				})
				reject(err)
			}
		})
	})
}

export default request;