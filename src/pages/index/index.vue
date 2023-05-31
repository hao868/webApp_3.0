<template>
	<view class="box" :style="vskin">
		<z-paging 
			ref="paging" 
			:auto="false"
			:refresher-only="true"
			refresher-threshold="100rpx"
			:refresher-max-angle="50"
			:refresher-complete-delay="300"
			:refresher-fixed-bac-height="searchOffsetTop"
			@query="queryList"
			:watch-refresher-touchmove="true" 
			@refresherTouchmove="refresherTouchmove"
			@refresherTouchend="refresherTouchend"
			:refresher-pulling-text="refresherPullingText"
		>
			<view class="top-box">
				<view class="search-btn flex-x-end flex-y-center" :style="{top: searchOffsetTop}">
					<uni-icons type="search" size="28" color="#888" @click="toSearch" />
				</view>
				<swiperIndex :list="swiperList" />
			</view>
			
			<myApp :myAppListInit="myAppList" :hasBg="true" :fixedStyle="{marginTop: '-40rpx'}" />
			<appList :appList="appList" />
			

			<view style="height: 110rpx;"></view>
		</z-paging>
		
		<dragTabbar	inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" />
		
		<!-- <u-tabbar :value="activeIndex" @change="tabbarChange" inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" zIndex="999">
			<u-tabbar-item v-for="(tabbar, index) in tabbarList" :key="index" :text="tabbar.name" :icon="tabbar.icon" :dot="tabbar.dot"></u-tabbar-item>
		</u-tabbar> -->
		
		<!-- 下拉消费码 -->
		<pullDownQRCode :show="showQrCodePopup" @close="event => showQrCodePopup = event" />
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	const $globalData = getApp().globalData
	// import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
	
	import swiperIndex from "./components/swiperIndex.vue";
	import pullDownQRCode from "@/components/pullDownQRCode/pullDownQRCode.vue";
	import appList from "@/components/appList/appList.vue";
	import myApp from "@/components/appList/myApp.vue";
	import dragTabbar from "@/components/dragTabbar/dragTabbar.vue";
	
	import { 
		toPx,
		// #ifdef H5
		getUrlParam, 
		isWeiXinBrowser,
		// #endif
	} from "@/utils/util.js"
	
	// #ifdef MP-WEIXIN
	import { getWxCode } from "@/utils/commom"
	// #endif

	import { 
		GetMechanismListApi, 
		GetSitesListApi, 
		GetApplistApi,
		ListViewHomeViewConfig
	} from "@/api/ApiBase"
	import { GetAuthorizeUrl, LoginByWeixin } from "@/api/ApiUser"
	// #ifdef H5
	import { LoginByJinZhi, GetAppUrlFromJinZhi, LoginBySuperApp, GetAppUrlFromSuperApp } from "@/api/ApiThirdParty"
	// #endif
	
	export default {
		// mixins: [ZPMixin], // 使用mixin
		components: {
			swiperIndex,
			pullDownQRCode,
			appList,
			myApp,
			dragTabbar
		},
		data() {
			return {
				tabbarList: this.$tabbarList,
				keyword: '',
				pageTitle: '首页',
				title: 'Hello',
				swiperList: [],
				// #ifdef MP-WEIXIN
				searchOffsetTop: ($globalData.menuBtnBottom * 2 + 20) + 'rpx',
				isWeixin: true,
				// #endif
				// #ifdef H5
				searchOffsetTop: 50 + 'rpx',
				isWeixin: isWeiXinBrowser(),
				// #endif
				refresherPullingText: '继续下拉刷新',
				refresherStatus: 1,
				dataList: [],
				showQrCodePopup: false,
				openId: this.$db.get('openId'),
			}
		},
		watch: {},
		computed: {
			...mapGetters(['appList', 'myAppList', 'token', 'activeIndex', 'webAppConfig']),
			autoLogin() {
				if(this.isWeixin && this.webAppConfig.isAutoLogin) {
					return true
				} else {
					return false
				}
			}
		},
		async onLoad(options) {
			console.log('参数---------',options)
			uni.hideTabBar()
			if(!this.webAppConfig) {
				await this.$store.dispatch('base/getMechanismList')
			}
			
			// #ifdef H5
			const mId = options.mechanismId || this.$db.get('currentMechanism')?.id || getUrlParam('mechanismId') || this.$store.state.base.currentMechanism.id
			
			const state =  options.state || getUrlParam('state')
			const code = options.code || getUrlParam('code')
			const token = options.token || getUrlParam('token')
			
			if(state && state.indexOf('jinzhi_') != -1) {
				// 金智
				const stateArr = state.split('_')
				console.log('金智---',stateArr, stateArr[1].indexOf('#') != -1)
				
				if(stateArr.length === 2) {
					const mechanismId = stateArr[1].indexOf('#') === -1 ? stateArr[1] : stateArr[1].slice(0, -2)
					this.$db.set('mechanismId', mechanismId)
					await this.$store.dispatch('base/getMechanismList')
					this.loginByJinZhi(code, mechanismId)
				} else if(stateArr.length === 3) {
					const mechanismId = stateArr[1]
					const appId = stateArr[2].indexOf('#') === -1 ? stateArr[2] : stateArr[2].slice(0, -2)
				
					this.getAppUrlFromJinZhi(code, appId, mechanismId)
				}
				return
			} else if(state && state.indexOf('superapp_') != -1) {
				// 超级APP
				const stateArr = state.split('_')
				const tokenStr = token.indexOf('#') === -1 ? token : token.slice(0, -2)
				
				if(stateArr.length === 2) {
					const mechanismId = stateArr[1]
					this.$db.set('mechanismId', mechanismId)
					await this.$store.dispatch('base/getMechanismList')
					this.loginBySuperApp(token, mechanismId)
				} else if(stateArr.length === 3) {
					const mechanismId = stateArr[1]
					const appId = stateArr[2]
				
					this.getAppUrlFromSuperApp(token, mechanismId, appId)
				}
				return
			}
			// #endif
			
			// #ifdef MP-WEIXIN
			const mId = options.mechanismId || this.$db.get('currentMechanism')?.id || this.$store.state.base.currentMechanism.id
			// #endif
			
			console.log('参数---------',options, '机构id-----',mId)
			
			if(options.mechanismId) {
				this.$db.set('mechanismId', options.mechanismId)
			}
			
			/* ------- 获取openid---------start */
			if(!this.token && !this.openId && mId) {
				let code = ''
				let wechatConfigType = 1
				// #ifdef H5
				if(this.isWeixin) {
					this.getAuthorizeUrl(mId)
					code = getUrlParam('code')
					wechatConfigType = 1
				}
				// #endif
				
				// #ifdef MP-WEIXIN
				code = await getWxCode()
				wechatConfigType = 2
				// #endif
				
				if(code && this.webAppConfig) {
					this.$store.dispatch('user/getWchatOpenId', { mechanismId: mId, code, wechatConfigType }).then(res => {
						this.openId = res
						// 自动登录
						if(!this.token && this.openId && this.autoLogin) {
							// this.autoLoginByWeiXin(this.$db.get('currentMechanism').id)
						}
					})
				}
			} else {
				// #ifdef H5
				if(this.isWeixin) {
					history.pushState({}, '', location.pathname)
				}
				// #endif
			}
			/* ------- 获取openid---------end */
			
		},
		onShow() {
			// this.getCurrentPageTitle()
			this.init()
		},
		methods: {
			handleChangeTab(index) {
				console.log(index)
				this.$store.commit('base/SET_ACTIVEINDEX', index)
			},
			longPress(event) {
				console.log(event)
			},
			// #ifdef H5
			// 金智登录
			async loginByJinZhi(authorizeCode, mechanismId) {
				LoginByJinZhi({authorizeCode, mechanismId}).then(res => {
					if(res.isSuccess) {
						const respData = res.dataModel
						this.$store.commit('user/SET_TOKEN', respData.token)
						this.$store.commit('user/STE_USERINFO', respData.userInfo)
						this.$store.dispatch('base/getApplist')
						history.pushState({}, '', location.origin + location.pathname)
					}
				})
			},
			// 金智获取应用链接
			getAppUrlFromJinZhi(code, appId, mechanismId) {
				GetAppUrlFromJinZhi({code, appId, mechanismId}).then(res => {
					if(res.isSuccess) {
						location.href = res.dataModel
					}
				})
			},
		// 超级app登录
			async loginBySuperApp(authorizeToken, mechanismId) {
				LoginBySuperApp({authorizeToken, mechanismId}).then(res => {
					if(res.isSuccess) {
						const respData = res.dataModel
						this.$store.commit('user/SET_TOKEN', respData.token)
						this.$store.commit('user/STE_USERINFO', respData.userInfo)
						this.$store.dispatch('base/getApplist')
						history.pushState({}, '', location.origin + location.pathname)
					}
				})
			},
			// 超级app获取应用链接
			getAppUrlFromSuperApp(authorizeToken, mechanismId, appId) {
				GetAppUrlFromSuperApp({authorizeToken, mechanismId, appId}).then(res => {
					if(res.isSuccess) {
						location.href = res.dataModel
					}
				})
			},
			// #endif
			async autoLoginByWeiXin(mechanismId) {
				uni.showLoading({
					title: '自动登录中...',
					mask: true
				})
				const openId = this.openId
				await LoginByWeixin({ mechanismId, openId }).then(res => {
					const respData = res.dataModel
					this.$store.commit('user/SET_TOKEN', respData.token)
					this.$store.commit('user/STE_USERINFO', respData.userInfo)
					this.$store.dispatch('base/getApplist')
					let i = setTimeout(() => {
						uni.hideLoading()
						clearTimeout(i)
					}, 800)
					this.updateToken()
				}).catch(err => {
					uni.hideLoading()
					this.$store.dispatch('base/getApplist')
				})
			},
			updateToken(mechanismId) {
				console.log('更新token')
				const sitesId = this.$db.get('currentSite').id
				const token = this.token
				const openId = this.openId
				UpdateUserToken({mechanismId, sitesId, token, openId})
			},
			// 获取轮播图
			getSwiper(mechanismId) {
				ListViewHomeViewConfig({mechanismId}).then(res => {
					if(res.isSuccess) {
						this.swiperList = res.dataModel
					}
				})
			},
			tabbarChange(index) {
				uni.switchTab({
					url: this.tabbarList[index].path
				})
				this.$store.commit('base/SET_ACTIVEINDEX', index)
			},
			async getAuthorizeUrl(mId) {
				await GetAuthorizeUrl({ mechanismId: mId, applicationType: 0 }).then(res => {
					const url = res.dataModel + "m$echanismId=" + mId
					document.location.href = url
				})
			},
			toSearch() {
				uni.navigateTo({
					url: '/pagesA/search/search'
				})
			},
			queryList(pageNo, pageSize) {
				//组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
				//这里的pageNo和pageSize会自动计算好，直接传给服务器即可
				//模拟请求服务器获取分页数据，请替换成自己的网络请求
				this.$refs.paging.complete(this.dataList);
			},
			async init() {
				
				await this.$store.dispatch('base/getMechanismList')
				await this.$store.dispatch('base/getSitesList')
				
				if(this.token) {
					await this.$store.dispatch('user/checkToken').finally(() => {
						this.getSwiper(this.$db.get('currentMechanism')?.id)
						this.$store.dispatch('base/getApplist')
					})
				} else {
					this.$store.dispatch('user/removeToken')
					
					this.getSwiper(this.$db.get('currentMechanism')?.id) 
					
					// 自动登录
					if(!this.token && this.openId && this.autoLogin) {
						this.autoLoginByWeiXin(this.$db.get('currentMechanism').id)
					} else {
						this.$store.dispatch('base/getApplist')
					}
				}
				
				
			},
			getCurrentPageTitle() {
				const pages = getCurrentPages()
				const page = pages[pages.length - 1]
				if(this.tabbarList[0].path == page.route) {
					this.pageTitle = this.tabbarList[0].name
				}
			},
			// 监听下拉距离
			async refresherTouchmove(event) {
				// console.log(event)
				if(event.pullingDistance > 50 && event.pullingDistance < 80) {
					this.refresherPullingText = '松开刷新'
				} else if(event.pullingDistance > 80 && event.pullingDistance < 100) {
					this.refresherPullingText = '继续下拉展示二维码'
				} else if(event.pullingDistance >= 100) {
					this.refresherPullingText = '松开展示二维码'
				}
			},
			// 监听下拉结束
			refresherTouchend(height) {
				if(height > 50 && height < 100) {
					this.init()
				} else if(height >= 100) {
					if(!this.token) {
						this.$store.dispatch('user/removeToken')
						uni.showToast({
							icon: 'none',
							title: '请登录'
						})
						return
					}
					this.$store.dispatch('user/checkToken').then(res => {
						console.log('mmmmmmmmmmmmm',res)
						this.showQrCodePopup = true
						this.refresherPullingText = '继续下拉刷新'
						this.$refs.paging.endRefresh()
					})
					
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.u-page__item__slot-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.top-box {
		position: relative;
		height: 426rpx;
	}
	
	.search-btn {
		position: fixed;
		top: 70rpx;
		right: 30rpx;
		z-index: 1;
		overflow: hidden;
	}
</style>
