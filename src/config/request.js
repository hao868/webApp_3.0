// #ifdef MP-WEIXIN
import $config from "/public/config.js"
// #endif
import * as db from '@/utils/db.js'
import store from "@/store";
import { customSwitchTab } from '@/utils/commom';

const request = (config) => {
	return new Promise((resolve, reject) => {
		
		if(!config.hideLoad) {
			uni.showLoading({
				title: '加载中',
				mask: false,
			})
		}
		
		const BASE_URL = store.getters.webAppConfig.serverUrl
		console.log(BASE_URL ? '配置api------'+BASE_URL+config.url : '本地api------'+$config.BASE_URL+config.url)
		
		let baseUrl = BASE_URL ? BASE_URL : $config.BASE_URL
		let apiUrl = config.url
		if(baseUrl.substr(-1) == '/') {
			baseUrl = baseUrl.substr(0, baseUrl.length - 1)
		}
		if(apiUrl.substr(0, 1) == '/') {
			apiUrl = apiUrl.substr(1)
		}
		
		// console.log('当前环境----', baseUrl)
		// console.log('当前api ----', `${baseUrl}/${apiUrl}`)
		
		uni.request({
			url: `${baseUrl}/${apiUrl}`,
			timeout: 6000,
			header: {
				'Content-Type': config.contentType || 'application/json;charset=utf-8',
				'token': db.get('token')
			},
			method: config.method || 'GET',
			data: config.data || '',
			success: response => {
				// console.log(response)
				if(response.data.code === 3) {
					uni.showToast({
						title: '登录失效',
						icon: 'none',
						mask: true,
						success: () => {
							setTimeout(() => {
								store.dispatch('user/removeToken')
								store.commit('base/SET_MYAPPLIST', []);
								customSwitchTab('/pages/index/index')
							}, 1000)
						}
					})
					reject(response)
				} else if (response.data.code !== 3 && !response.data.isSuccess) {
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
			},
			complete: () => {
				if(!config.hideLoad) {
					uni.hideLoading()
				}
			}
		})
	})
}

export default request;