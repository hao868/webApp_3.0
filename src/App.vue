<script>
	import * as db from '@/utils/db.js'
	// #ifdef H5
	import { isWeiXinBrowser, browserType } from './utils/util.js'
	// #endif
	import { themeList } from '@/constData/themeList'
	export default {
		globalData: {
			statusBarH: 0, // 状态栏高度
			menuBtnTop: 0, // 微信小程序胶囊按钮顶部离屏幕顶部的距离
			menuBtnBottom: 0, // 微信小程序胶囊按钮底部离屏幕顶部的距离（状态栏+胶囊高度）
			navBarH: 0 // 状态栏+操作栏 高度
		},
		onLaunch: function() {
			uni.hideTabBar()
			// #ifdef H5
			db.set('platform', browserType())
			// #endif
			
			// #ifdef MP-WEIXIN
			const updateManager = uni.getUpdateManager();
			updateManager.onCheckForUpdate(function (res) {
			  // 请求完新版本信息的回调
			  console.log(res.hasUpdate);
				if(res.hasUpdate) { // 如果有新版本提醒并进行强制升级
					uni.showModal({
						content: '新版本已经准备好，是否重启应用？',
						showCancel: false,
						confirmText: '确定',
						success: res => {
							if (res.confirm) {
								db.del('webAppConfig')
								db.del('currentMechanism')
								db.del('currentSite')
								db.del('mechanismId')
								updateManager.onUpdateReady(res => { // 新版本下载完成的回调
									updateManager.applyUpdate() // 强制当前小程序应用上新版本并重启
								})

								updateManager.onUpdateFailed(res => { // 新版本下载失败的回调
									// 新版本下载失败，提示用户删除后通过冷启动重新打开
									uni.showModal({
										content: '下载失败，请删除当前小程序后重新打开',
										showCancel: false,
										confirmText: '知道了'
									})
								})
							}
						}
					})
				}
			});
			
			
			const systemInfo = uni.getSystemInfoSync()
			const menuBtnClient = wx.getMenuButtonBoundingClientRect()
			this.globalData.statusBarH = systemInfo.statusBarHeight
			this.globalData.menuBtnTop = menuBtnClient.top
			this.globalData.menuBtnBottom = menuBtnClient.bottom
			this.globalData.navBarH = systemInfo.statusBarHeight + menuBtnClient.height
			// #endif
			
		},
		onShow: function() {
			// uni.showTabBarRedDot({
			//   index: 1
			// })
			// uni.setTabBarBadge({
			//   index: 1,
			//   text: '...'
			// })
			this.vSetThemeStyle(themeList[this.vthemeindex].value)
			this.setNavigateBarColor()
		},
		onHide: function() {}
	}
</script>

<style lang="scss">
	// uView基础样式
	@import "@/uni_modules/uview-ui/index.scss";
	
	page {
		background: #F4F7FF;
	}
	
	.box {
		position: relative;
		height: 100%;
	}
	
	.uni-picker-container {
		z-index: 10076;
	}
	
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}
	
	
	/*每个页面公共css */
	.flex {
		display: flex;
		width: 100%;
	}
	
	.flex-column {
		@extend .flex;
		flex-direction: column;
	}
	
	.flex-x-around {
		@extend .flex;
		justify-content: space-around;
	}
	
	.flex-x-between {
		@extend .flex;
		justify-content: space-between;
	}
	
	.flex-x-center {
		@extend .flex;
		justify-content: center;
	}
	
	.flex-x-end {
		@extend .flex;
		justify-content: flex-end;
	}
	
	.flex-x-evenly {
		@extend .flex;
		justify-content: space-evenly;
	}
	
	.flex-y-center {
		@extend .flex;
		align-items: center;
	}
	
	.flex-column-x-center {
		@extend .flex;
		align-items: center;
	}
	
	.flex-column-y-center {
		@extend .flex;
		justify-content: center;
	}
	
	.flex-column-y-around {
		@extend .flex;
		justify-content: space-around;
	}
	
	.flex-column-y-between {
		@extend .flex;
		justify-content: space-between;
	}
	
	.flex-column-y-evenly {
		@extend .flex;
		justify-content: space-evenly;
	}
	
	.flex-xy-center {
		@extend .flex;
		justify-content: center;
		align-items: center;
	}
	
	.padding_l_r_30 {
		padding-left: 30rpx;
		padding-right: 30rpx;
	}
	
	.padding_t_b_30 {
		padding-top: 30rpx;
		padding-bottom: 30rpx;
	}
	
	// 底部安全区域
	.u-safe-area-inset-bottom {
		padding-bottom: 0;
		padding-bottom: calc(constant(safe-area-inset-bottom) - 28rpx);
		padding-bottom: calc(env(safe-area-inset-bottom) - 28rpx);
	}
</style>
