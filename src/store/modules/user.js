import * as db from '@/utils/db.js'

import crypto from "@/utils/crypto";

import {
	VerifyUserToken,
	GetWchatOpenIdApi,
	UserLogout
} from "@/api/ApiUser";

import {
	GetUTC,
	GetApiToken,
	GetUserCardInfo,
	CreateQRcodeXFM,
	CreateQRcodeAppointType,
	ParseQrcode
} from "@/api/ApiColumn";


export default {
	namespaced: true,
	state: {
		token: db.get('token') || '', // 平台token
		userInfo: db.get('userInfo') || '',
		openId: db.get('openId') || '',
		parseQrCodeData: db.get('parseQrCodeData') || '', // 二维码扫到的code 解析后的数据
		parseQrCodeStr: db.get('parseQrCodeStr') || '', // 二维码扫出的数据
		apiToken: db.get('apiToken') || '', // 统一api token
		walletList: db.get('walletList') || [], // 钱包
	},
	mutations: {
		SET_TOKEN(state, token) {
			state.token = token
			db.set('token', token)
		},
		STE_USERINFO(state, userInfo) {
			state.userInfo = userInfo
			db.set('userInfo', userInfo)
		},
		SET_OPENID(state, openId) {
			state.openId = openId
			db.set('openId', openId)
		},
		// 解析的二维码的结果
		SET_QRCODEDATA(state, qrData) {
			state.parseQrCodeData = qrData;
			db.set('parseQrCodeData', qrData)
		},
		// 扫码得到的结果
		SET_QRCODESTR(state, qrStr) {
			state.parseQrCodeStr = qrStr
			db.set('parseQrCodeStr', qrStr)
		},
		SET_API_TOKEN(state, token) {
			state.apiToken = token
			db.set('apiToken', token)
		},
		SET_WALLETLIST(state, data) {
			state.walletList = data
			db.set('walletList', data)
		},
	},
	actions: {
		// 校验token
		checkToken({ commit }, payload) {
			return new Promise((resolve, reject) => {
				VerifyUserToken().then(res => {
					if(res.isSuccess) {
						const resp = res.dataModel
						commit('SET_TOKEN', resp.token)
						commit('STE_USERINFO', resp.userInfo)
						resolve(res)
					} else {
						reject(res)
					}
				}).catch(err => {
					uni.showToast({
						icon: 'error',
						title: err.data.message
					})
					reject(err)
				})
			})
		},
		// 获取openid
		getWchatOpenId({ commit }, payload) {
			return new Promise((resolve, reject) => {
				GetWchatOpenIdApi(payload).then(res => {
					if(res.isSuccess) {
						commit('SET_OPENID', res.dataModel)
						resolve(res.dataModel)
					} else {
						reject(res)
					}
				})
			})
		},
		// 获取世界时
		async getUTC() {
			return await GetUTC()
		},
		// 获取统一API token
		async getApiToken({ dispatch, commit }) {
			const webAppConfig = db.get('webAppConfig')
			
			const res = await dispatch('getUTC')
			
			let param = {
				Password: crypto.decryptedTwo(webAppConfig.yunPassword),
				Account: webAppConfig.yunAccount,
				UTC: res,
				Sign: "0",
				Token: "0"
			};
			await GetApiToken(param).then(async resp => {
				if (resp.isSuccess) {
					commit("SET_API_TOKEN", crypto.decrypted(resp.dataModel));
				} else {
					Toast(resp.message);
				}
			});
		},
		// 获取钱包
		async getWallet({ dispatch, commit }) {
			const webAppConfig = db.get('webAppConfig')
			let userInfo = db.get('userInfo')
			let param = {
				InterfaceIdentityId: userInfo && userInfo.studentNumber,
				InterfaceIdentityIdType: 2,
				CampusId: webAppConfig.yunCampusId,
				StudentNumber: userInfo && userInfo.studentNumber,
				Sign: "0",
				Token: db.get('apiToken')
			};
			console.log(param)
			if(userInfo && userInfo.account) {
				await GetUserCardInfo(param).then(res => {
					console.log("钱包", res);
					if(res.isSuccess) {
						let cardinfos = JSON.parse(crypto.decrypted(res.dataModel));
						console.log("钱包解析------", cardinfos);
						// this.moneyarry = cardinfos;
						commit('SET_WALLETLIST', cardinfos)
					} else {
						uni.showToast({
							icon: 'none',
							mask: true,
							title: res.message
						})
					}
				});
			}
		},
		removeToken({ commit }, payload) {
			commit('SET_TOKEN', '');
			commit('STE_USERINFO', '');
			this.commit('base/SET_MYAPPLIST', []);
			commit('SET_API_TOKEN', '')
			commit('SET_WALLETLIST', [])
		}
	},
}