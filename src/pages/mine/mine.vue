<template>
	<view class="box" :style="vskin">
		<z-paging
			ref="pagingMine" 
			v-model="dataList" 
			@query="queryList" 
			:auto="false"
			:refresher-only="true"
			:refresher-max-angle="50" 
			:watch-refresher-touchmove="true"
			@refresherTouchmove="refresherTouchmove"
			@refresherTouchend="refresherTouchend"
			:refresher-pulling-text="refresherPullingText"
		>
			<view class="" v-for="t in dataList" :key="t"></view>
			<view class="head-info-box" :style="{background: cardBgValue}">
				<view class="card-top">
					<image :src="pageConfig.schoolLogo" mode="heightFix" class="logo"></image>
					<view class="site-name">{{currentSite?currentSite.siteName:''}}</view>
					<view class="switch-site-btn" @click="jump('setting')">设 置 <uni-icons type="right" size="10" color="#fff" class="switch-site-btn-icon" /></view>
				</view>
				
				<view class="card-info" v-if="hasLogin" @click="jump('userInfo')">
					<view class="info">
						<view class="name">{{userInfo.name}}</view>
						<view class="department" v-if="userInfo.departmentFullPath">{{userInfo.departmentFullPath}}</view>
						<view class="studentnum">{{userInfo.studentNumber}}</view>
					</view>
					<u-avatar :src="userInfo.picture" size="60" v-if="userInfo.picture"></u-avatar>
					<u-avatar icon="account-fill" size="60" fontSize="38" v-else></u-avatar>
				</view>
				
				<view class="card-info" v-else @click="jumpLogin">
					<view class="info">
						<view class="name" style="text-align: center;">登录</view>
						<view class="department">查看详情</view>
					</view>
					<u-avatar icon="account-fill" size="60" fontSize="38"></u-avatar>
				</view>
				
				<view class="qrcode-box flex-x-center flex-y-center">
					<image src="../../static/imgs/icon_qrcode.png" @click="open"></image>
				</view>
			</view>
			
			<myApp :myAppListInit="myAppList" />
			
			<block v-if="hasLogin">
				<view class="charts-box" v-for="(chartsItem, index) in chartsArr" :key="index">
					<view class="charts-top">
						<view class="charts-top-title">{{chartsItem.title}}</view>
						<view class="charts-top-time">统计周期：{{chartsItem.statisticalTime}}</view>
					</view>
					
					<view class="charts-content">
						<view class="" style="width:610rpx">
							<qiun-data-charts
								:reshow="hasLogin" 
								:canvasId="chartsItem.type+index" 
								:canvas2d="true"
								:type="chartsItem.type" 
								:tapLegend="false"
								:opts="opts" 
								:chartData="chartDataArr[chartsItem.type]" 
							/>
						</view>
						
						<!-- <view class="legend-data" v-if="chartsItem.type != 'mount'">
							<view v-for="(item,i) in chartDataArr[chartsItem.type].series && chartDataArr[chartsItem.type].series[0].data" :key="i">
								￥{{item.value | toFixed}}
							</view>
						</view> -->
					</view>
				</view>
			</block>
			<view style="padding: 80rpx;"></view>
		</z-paging>
		
		<dragTabbar	inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" />
		
		<!-- <u-tabbar :value="activeIndex" @change="tabbarChange" inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" zIndex="999">
			<u-tabbar-item v-for="(tabbar, index) in tabbarList" :key="index" :text="tabbar.name" :icon="tabbar.icon" :dot="tabbar.dot">
			</u-tabbar-item>
		</u-tabbar> -->
		
		<!-- 身份码 -->
		<u-popup :show="showSFCodePopup" overlayOpacity="0.7" :safeAreaInsetBottom="false" :safeAreaInsetTop="false"	bgColor="transparent" mode="top" @close="closeSFCode">
			<view class="qrcode-Popup-box flex-x-center flex-column flex-y-center">
				<view class="qrcode-out">
					<view class="name">身份码</view>
					<tki-qrcode ref="sfqrcode" cid="sfqrcode" :val="qrcodeVal" :onval="onval" :size="380" />
				</view>
				<view class="close-btn" @click="closeSFCode">关闭</view>
			</view>
		</u-popup>
		
		<!-- 下拉消费码 -->
		<pullDownQRCode :show="showQrCodePopup" @close="event => showQrCodePopup = event" />
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	import { opts } from "./chartsConstConfig.js"
	import { getToday, getMonthDays, getLastDayByDay, timeToDate } from "@/utils/util.js"
	
	import myApp from "@/components/appList/myApp.vue";
	import pullDownQRCode from "@/components/pullDownQRCode/pullDownQRCode.vue";
	import tkiQrcode from "@/components/tki-qrcode/tki-qrcode.vue"
	import dragTabbar from "@/components/dragTabbar/dragTabbar.vue";
	
	import { GetQRCodeInfoByToken, ListViewMyChart, GetChartsData } from "@/api/ApiUser"
	import { QueryMyViewConfig } from "@/api/ApiBase"
	
	export default {
		components: {
			myApp,
			pullDownQRCode,
			tkiQrcode,
			dragTabbar
		},
		data() {
			return {
				tabbarList: this.$tabbarList,
				opts,
				pageConfig: {},
				currentSite: this.$db.get('currentSite'),
				chartsArr: [],
				chartDataArr: {
					ring: {},
					pie: {},
					mount: {}
				},
				showSFCodePopup: false, // 身份码
				showQrCodePopup: false, // 消费码
				qrcodeVal: '',
				onval: false,
				hasLogin: false,
				refresherPullingText: '下拉展示二维码',
				dataList: []
			}
		},
		computed: {
			...mapGetters(['appList', 'myAppList', 'userInfo', 'token', 'activeIndex', 'cardBg', 'webAppConfig']),
			cardBgValue() {
				if(this.token && this.cardBg) {
					return this.cardBg
				} else {
					if(this.pageConfig.backgroundType===1) {
						return this.pageConfig.cardBackgroundPicture
					} else if(this.pageConfig.backgroundType===2) {
						return 'url('+this.pageConfig.cardBackgroundPicture+')'
					} else {
						return ''
					}
				}
				
			}
		},
		filters: {
			toFixed(value) {
				return value.toFixed(2)
			}
		},
		onLoad(options) {
			uni.hideTabBar()
			console.log(this.appList, '---------appList')
			console.log('token=',this.token, !!this.token, 'userInfo=', this.userInfo, 'oooooooooooo', !!this.userInfo, !!this.token && !!this.userInfo)
		},
		async onShow() {
			this.setNavigateBarColor()
			this.getMinePageConfig()
			this.hasLogin = !!this.token && !!this.userInfo
			if(this.token) {
				this.$store.dispatch('base/getApplist')
				await this.$store.dispatch('user/checkToken')
				await this.getChartList()
				this.getServerData();
			}
			
		},
		mounted() {},
		methods: {
			getMinePageConfig() {
				const mechanismId = this.$db.get('currentMechanism')?.id
				QueryMyViewConfig({mechanismId}).then(res => {
					if(res.isSuccess) {
						this.pageConfig = res.dataModel
					}
				})
			},
			// 获取chart列表
			async getChartList() {
				await ListViewMyChart().then(res => {
					this.chartsArr = res.dataModel.map((v,i) => {
						return {
							...v,
							type: this.chartType(v.chartType),
							title: v.name,
							statisticalTime: ''
						}
					})
				})
			},
			chartType(type) {
				if(type === 1) {
					return 'ring'
				} else if(type === 2) {
					return 'pie'
				} else if(type === 3) {
					return 'mount'
				}
			},
			tabbarChange(index) {
				uni.switchTab({
					url: this.tabbarList[index].path
				})
				this.$store.commit('base/SET_ACTIVEINDEX', index)
			},
			// 获取身份码
			async getQRCode() {
				await GetQRCodeInfoByToken().then(res => {
					this.qrcodeVal = res.dataModel.context
					this.onval = true
				})
			},
			async open() {
				// console.log('open');
				if(!this.token) {
					uni.showToast({
						icon: 'none',
						title: '请登录'
					})
					return
				} else if(!this.webAppConfig.showSFM) {
					uni.showToast({
						icon: 'none',
						title: '身份码未启用，请联系管理员'
					})
					return
				}
				await this.getQRCode()
				this.showSFCodePopup = true
				this.$nextTick(() => {
					this.$refs.sfqrcode._makeCode()
				})
			},
			closeSFCode() {
				this.$nextTick(() => {
					this.$refs.sfqrcode._clearCode()
				})
				this.showSFCodePopup = false
			},
			jumpLogin() {
				uni.navigateTo({
					url: `/pages/login/login`
				})
			},
			jump(pageName) {
				if(!this.token) {
					this.jumpLogin()
					return
				}
				uni.navigateTo({
					url: `/pagesA/${pageName}/${pageName}`
				})
			},
			getServerData() {
				this.chartsArr.forEach((item, index) => {
					GetChartsData({ cycleType: item.cycleType, url: item.url }).then(response => {
						const resData = response.dataModel
						
						this.opts.yAxis.data[0].title = `金额/${resData.unitName}`
						
						this.chartsArr[index].statisticalTime = `${timeToDate(resData.beginDate)}-${timeToDate(resData.endDate)}`
						
						const res = {
							series: [
								{
									data: resData.chartDatas.map(v => {
										return {
											...v,
											labelText: `${v.value}${resData.unitName}`
										}
									})
								}
							]
						};
						Object.keys(this.chartDataArr).forEach((key,i) => {
							if(key === item.type) {
								this.chartDataArr[key] = JSON.parse(JSON.stringify(res));
							}
						});
						console.log(this.chartDataArr)
					})
				});
			},
			// 监听下拉距离
			async refresherTouchmove(event) {
				// console.log(event)
				if(event.pullingDistance > 50) {
					this.refresherPullingText = '松开展示二维码'
				}
			},
			// 监听下拉结束
			refresherTouchend(height) {
				if(height > 50) {
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
						this.refresherPullingText = '下拉展示二维码'
						this.$refs.pagingMine.endRefresh()
					})
				}
			},
			queryList() {
				this.$refs.pagingMine.complete([]);
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import url('./mine.css');
	
	page {
		overflow: hidden;
	}
	
	.box {
		padding-bottom: 30rpx;
	}
	
	.qrcode-Popup-box {
		position: relative;
		height: 100vh;
		// padding-top: 20%;
		
		.qrcode-out {
			background: #fff;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding:  30rpx 60rpx 60rpx;
			border-radius: 40rpx;
			
			.name {
				color: #333;
				font-size: 28rpx;
				margin-bottom: 30rpx;
			}
		}
		
		.close-btn {
			margin-top: 48rpx;
			color: #aaa;
			font-size: 32rpx;
		}
	}
	
	.qrcode-box-sfm {
		position: relative;
		height: 100vh;
		
		.close-btn {
			margin-top: 48rpx;
			color: #aaa;
			font-size: 32rpx;
		}
	}
</style>
