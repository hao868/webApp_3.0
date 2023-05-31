import Vue from 'vue'
import * as db from '@/utils/db.js'
// #ifdef H5
import { wxSdkConfig } from "@/utils/commom.js"
// #endif
import { 
	GetMobileConfig, 
	GetMechanismListApi, 
	GetSitesListApi, 
	GetApplistApi,
	ListNewsPage, 
	GetWxtiket ,
} from "@/api/ApiBase.js"

export default {
	namespaced: true,
	
	state: {
		myAppList: db.get('myAppList') || [], // 应用列表
		appList: db.get('applist') || [], // 应用列表
		mechanismList: db.get('mechanismList') || [], //机构列表
		currentMechanism: db.get('currentMechanism') || '', // 当前机构
		sitesList: db.get('sitesList') || [], // 站点列表
		currentSite: db.get('currentSite') || '', // 当前站点
		activeIndex: db.get('activeIndex') || 0,
		webAppConfig: db.get('webAppConfig') || {}, // 微信配置
		wxTiket: db.get('wxTiket') || {}, // 微信sdk
		searchHistory: db.get('searchHistory') || [],
	},
	
	mutations: {
		SET_MYAPPLIST(state, data) {
			state.myAppList = data
			db.set("myAppList", data)
		},
		//应用列表
		SET_BASEAPPLIST(state, data) {
			state.appList = data
			db.set("appList", data)
		},
		SET_MECHANISMLIST(state, data) {
			state.mechanismList = data
			db.set("mechanismList", data)
		},
		SET_CURRENTMECHANISM(state, data) {
			state.currentMechanism = data
			db.set("currentMechanism", data)
		},
		SET_SITESLIST(state, data) {
			state.sitesList = data
			db.set("sitesList", data)
		},
		SET_CURRENTSITE(state, data) {
			state.currentSite = data
			db.set("currentSite", data)
		},
		SET_ACTIVEINDEX(state, data) {
			state.activeIndex = data
			db.set("activeIndex", data)
		},
		SET_WEBAPPCONFIG(state, data) {
			state.webAppConfig = data
			db.set('webAppConfig', data)
		},
		// 微信sdk凭证
		SET_TIKET(state, tiket) {
			state.wxTiket = tiket
			db.set('wxTiket', tiket)
		},
		SET_SEARCHHISTORY(state, data) {
			state.searchHistory = data
			db.set('searchHistory', data)
		}
	},
	
	actions: {
		// #ifdef H5
		// 获取微信 SDK 
		async getWxTiket({ commit }, value) {
			const url = window.location.href.split("#")[0];
			// console.log(url);
			await GetWxtiket({ Url: url }).then((res) => {
				if (res.isSuccess) {
					commit('SET_TIKET', res.dataModel);
					// 微信sdk注入
					wxSdkConfig(res.dataModel);
				}
			});
		},
		// #endif
		// 获取应用
		async getApplist({ commit }, siteId) {
			const currentSiteId = siteId || db.get('currentSite').id
			GetApplistApi({sitesId: currentSiteId}).then(res => {
				if(res.isSuccess) {
					commit('SET_BASEAPPLIST', res.dataModel.filter(v => {return res.dataModel.length && v.id !== 'StaticQuick'}) || [])
					
					if(res.dataModel.length && res.dataModel[0].id === 'StaticQuick') {
						commit('SET_MYAPPLIST', res.dataModel[0].appList || [])
					}
				}
			})
		},
		
		// 获取机构
		getMechanismList({ dispatch, commit }) {
			return new Promise((resolve, reject) => {
				GetMechanismListApi().then(async res => {
					if (res.isSuccess) {
						
						commit('SET_MECHANISMLIST', res.dataModel)
						
						const cacheCurrentMechanism = db.get('currentMechanism')
						const paramMechanismId = db.get('mechanismId')
						
						if(paramMechanismId && res.dataModel && res.dataModel.length) {
							const obj = res.dataModel.find(v => { return v.id == paramMechanismId })
							commit('SET_CURRENTMECHANISM', obj)
							await dispatch('getWebAppConfig', paramMechanismId)
						} else if(!paramMechanismId && !cacheCurrentMechanism && res.dataModel && res.dataModel.length) {
							commit('SET_CURRENTMECHANISM', res.dataModel[0])
							await dispatch('getWebAppConfig', res.dataModel[0].id)
						} else if(!paramMechanismId && cacheCurrentMechanism && res.dataModel && res.dataModel.length) {
							await dispatch('getWebAppConfig', cacheCurrentMechanism.id)
						}
						
						resolve(res.dataModel)
					}
				})
			})
		},
		
		// 获取站点
		getSitesList({ commit }, mId) {
			let mechanismId = mId ? mId : db.get('currentMechanism').id
			return new Promise((resolve, reject) => {
				GetSitesListApi({mechanismId}).then(res => {
					if (res.isSuccess) {
						commit("SET_SITESLIST", res.dataModel)
						
						const cacheCurrentSite = db.get('currentSite')
						if(!cacheCurrentSite && res.dataModel && res.dataModel.length) {
							commit("SET_CURRENTSITE", res.dataModel[0])
						}
						
						resolve(res.dataModel)
					} else {
						reject(res)
					}
				});
			})
		},
		// 获取机构微信配置
		async getWebAppConfig({ commit }, mechanismId){
			GetMobileConfig({mechanismId}).then(res => {
				if(res.isSuccess) {
					commit('SET_WEBAPPCONFIG', res.dataModel)
					
					// 获取消息红点
					const queryParams = {
						pageSize: 10,
						pageIndex: 1, 
						newsCategory: 0, // 消息类型；0、所有，1、公告消息，2、我的消息
						readStatus: 1, // 消息状态；1、未读；2、已读
						keyword: "",
						mechanismId: db.get('currentMechanism')?.id
					}
					ListNewsPage(queryParams).then(resp => {
						if(resp.isSuccess) {
							if(db.get('cacheTabbar')) {
								let cacheTabbar = db.get('cacheTabbar')
								let i = cacheTabbar.findIndex(v => v.id == 2)
								cacheTabbar[i].dot = resp.unreadCount > 0 ? true : false
								db.set('cacheTabbar', cacheTabbar)
							} else {
								Vue.prototype.$tabbarList[1].dot = resp.unreadCount > 0 ? true : false
							}
						}
					})
				}
			}).then(() => db.del('mechanismId')).catch(err => {
				console.error(err)
				if(err.data.message == '机构下没有相关配置') {
					uni.showModal({
						title: `当前机构没有相关配置`,
						content: '是否切换？',
						cancelText: '否',
						confirmText: '是',
						success: res => {
							if(res.confirm) {
								uni.navigateTo({
									url: '/pages/selectMechanism/selectMechanism',
									success: res => {},
									fail: () => {},
									complete: () => {}
								});
							}
						}
					});
				}
			})
		}
		
	}
}