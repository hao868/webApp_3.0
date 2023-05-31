<template>
	<view class="box" :style="vskin">
		<z-paging 
			ref="pagingmsg" 
			:safe-area-inset-bottom="true"
			v-model="msgList" 
			:refresher-complete-delay="300" 
			refresher-threshold="100rpx"
			:refresher-max-angle="50" 
			:default-page-no="queryParams.pageIndex"
			:default-page-size="queryParams.pageSize"
			@query="queryList" 
			:watch-refresher-touchmove="true"
			@refresherTouchmove="refresherTouchmove"
			@refresherTouchend="refresherTouchend"
			:refresher-pulling-text="refresherPullingText"
			loading-more-no-more-text="我也是有底线的~"
		>
			<view class="box-tabs">
				<view class="top-box">
					<u-tabs
						:list="tabs"
						:current="tabIndex"
						@change="tabsChange"
						:scrollable="false"
						lineColor="var(--bg)"
						lineWidth="20"
						lineHeight="2"
						:activeStyle="{color:'var(--bg)', fontWeight: 'bold'}"
						:inactiveStyle="{color:'#888'}"
						:badgeCustomStyle="{padding:'0 4rpx'}"
					></u-tabs>
					
					<u-search placeholder="搜索" v-model="queryParams.keyword" shape="square" :animation="true" height="26" @search="handleSearch" @custom="handleSearch" />
					
					<view class="clear-msg" @click="handMarkRead">
						<image src="../../static/imgs/icon_clear.png"></image>
						<!-- <uni-icons type="trash" color="#fff" size="14"></uni-icons> -->
					</view>
				</view>
				
				<view class="tabs-btn-box">
					<view class="tab-btn" :class="tabBtnActIndex===i?'tab-btn-act':''" v-for="(btn, i) in tabsBtns" :key="i" @click="tabBtnChange(i)">
						{{btn.name}}
					</view>
				</view>
			</view>
			
			<view style="margin-top: 240rpx;">
				<view class="msg-item" v-for="(msg, index) in msgList" :key="msg.newsId" @click="toDesc(msg)">
					<view class="msg-head">
						<view class="msg-badge" v-show="queryParams.readStatus === 1"></view>
						<view class="msg-type msg-type-public" v-if="msg.isNoticeNews">公共</view>
						<view class="msg-type msg-type-self" v-if="!msg.isNoticeNews">我的</view>
						<view class="msg-title">{{msg.title}}</view>
						<view class="msg-time">{{formatTime(new Date(msg.upDataDateTime))}}</view>
					</view>
					<view class="msg-content" v-if="msg.description || msg.pictureDisplay">
						<view class="msg-desc" v-if="msg.description">{{msg.description}}</view>
						<view class="msg-img-box">
							<image v-if="msg.pictureDisplay" :src="msg.pictureDisplay" mode="widthFix"></image>
						</view>
						
					</view>
					<view class="msg-btn" @click="toDesc(msg)">
						<view>查看详情</view>
						<uni-icons type="right" size="13" color="#888"></uni-icons>
					</view>
				</view>
			</view>
		</z-paging>
		
		<dragTabbar ref="dragTabbar"	inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" />
		
		<!-- <u-tabbar :value="activeIndex" @change="tabbarChange" inactiveColor="#B6B6B6" activeColor="var(--tabbar-act-color)" zIndex="999">
			<u-tabbar-item v-for="(tabbar, index) in tabbarList" :key="index" :text="tabbar.name" :icon="tabbar.icon" :dot="tabbar.dot"></u-tabbar-item>
		</u-tabbar> -->

		<!-- 下拉消费码 -->
		<pullDownQRCode :show="showQrCodePopup" @close="event => showQrCodePopup = event" />
	</view>
</template>

<script>
	import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	const $globalData = getApp().globalData
	import pullDownQRCode from "@/components/pullDownQRCode/pullDownQRCode.vue";
	import dragTabbar from "@/components/dragTabbar/dragTabbar.vue";
	
	import { ListNewsPage, MarkerNewsRead } from '@/api/ApiBase.js'
	
	import {formatTime} from '@/utils/util.js'
	
	export default {
		components: {pullDownQRCode, dragTabbar},
		data() {
			return {
				tabbarList: this.$tabbarList,
				keyword: '',
				pageTitle: '消息',
				pageTotal: 0,
				queryParams: {
					pageSize: 10,
					pageIndex: 1, 
					newsCategory: 0, // 消息类型；0、所有，1、公告消息，2、我的消息
					readStatus: 1, // 消息状态；1、未读；2、已读
					keyword: "",
					mechanismId: this.$db.get('currentMechanism')?.id
				},
				msgList: [],
				tabIndex: 0,
				tabs: [
					{ 
						name:'未读', 
						badge: { 
							value: 0, 
							max: 99, 
							absolute: true, 
							offset: [6, -2],
						}
					}, 
					{ name:'已读' },
				],
				tabBtnActIndex: 0,
				tabsBtns: [
					{ name: '全部消息', type: 0 },
					{ name: '公共消息', type: 1 },
					{ name: '我的消息', type: 2 }
				],
				refresherPullingText: '继续下拉刷新',
				refresherStatus: 1,
				showQrCodePopup: false,
			}
		},
		computed: {
			...mapGetters(['token', 'activeIndex']),
		},
		onLoad(options){
			uni.hideTabBar()
			console.log(uni.$u.props.badge)
		},
		onShow() {
			this.setNavigateBarColor()
			this.queryList(this.queryParams.pageIndex,this.queryParams.pageSize)
		},
		methods: {
			formatTime,
			tabbarChange(index) {
				uni.switchTab({
					url: this.tabbarList[index].path
				})
				this.$store.commit('base/SET_ACTIVEINDEX', index)
			},
			queryList(pageNo, pageSize) {
				console.log('pageNo------',pageNo)
				ListNewsPage({...this.queryParams, pageIndex: pageNo}).then(res => {
					if(res.isSuccess) {
						this.pageTotal = res.pageTotal
						this.$refs.pagingmsg.complete(res.dataModel);
						if(this.$db.get('cacheTabbar')) {
							let cacheTabbar = this.$db.get('cacheTabbar')
							let i = cacheTabbar.findIndex(v => v.id == 2)
							cacheTabbar[i].dot = res.unreadCount > 0 ? true : false
							this.$db.set('cacheTabbar', cacheTabbar)
							this.$nextTick(() => {
								this.$refs.dragTabbar.tabbarList[i].dot = res.unreadCount > 0 ? true : false
							})
							
						} else {
							this.$tabbarList[1].dot = res.unreadCount > 0 ? true : false
							this.$nextTick(() => {
								this.$refs.dragTabbar.tabbarList[1].dot = res.unreadCount > 0 ? true : false
							})
							
						}
						
						this.$set(this.tabs[0].badge, 'value', res.unreadCount)
						console.log(this.$refs.dragTabbar)
					}
				})
			},
			handleSearch() {
				this.$refs.pagingmsg.reload();
			},
			// 已读、未读切换
			tabsChange(param) {
				if(!this.token && param.index) {
					uni.showToast({
						icon: 'none',
						title: '请登录'
					})
				}
				this.queryParams = {
					...this.queryParams,
					pageIndex: 1,
					newsCategory: 0,
					readStatus: param.index + 1
				}
				this.tabBtnActIndex = 0
				this.$refs.pagingmsg.reload();
			},
			// 消息类型切换
			tabBtnChange(index) {
				if(!this.token && index == 2) {
					uni.showToast({
						icon: 'none',
						title: '请登录'
					})
				}
				this.tabBtnActIndex = index
				this.queryParams = {
					...this.queryParams,
					pageIndex: 1,
					newsCategory: index
				}
				this.$nextTick(() => {
					this.$refs.pagingmsg.reload();
				})
			},
			// 全部标记已读
			handMarkRead() {
				if(!this.token) {
					uni.showToast({
						icon: 'none',
						title: '请登录'
					})
					return
				}
				MarkerNewsRead().then(res => {
					if(res.isSuccess) {
						this.$set(this.tabs[0].badge, 'value', 0)
						this.$refs.pagingmsg.reload();
					}
				})
			},
			toDesc(item) {
				uni.navigateTo({
					url: `/pagesA/msgDesc/msgDesc?newsId=${item.newsId}&title=${item.title}`
				})
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
					// this.init()
				} else if(height >= 100) {
					if(!this.token) {
						uni.showToast({
							icon: 'none',
							title: '请登录'
						})
						return
					}
					this.$store.dispatch('user/checkToken').then(res => {
						this.showQrCodePopup = true
						this.refresherPullingText = '继续下拉刷新'
						this.$refs.pagingmsg.endRefresh()
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .zp-l-container {
		// height: 200rpx !important;
		padding-bottom: 100rpx;
	}
	.clear-msg {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 22rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #888888;
		margin-right: 30rpx;
		margin-left: 20rpx;
		// margin-top: 10rpx;
		background: var(--bg);
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		
		image {
			width: 28rpx;
			height: 28rpx;
		}
	}
	.box-tabs {
		position: fixed; 
		top: 0;
		z-index: 11;
		width: 100%;
		background: #fff;
		border-bottom: 1rpx solid #f5f5f5;
		padding-bottom: 10rpx;
		
		.top-box {
			display: flex;
			justify-content: space-around;
			align-items: center;
		}
	
		.tabs-btn-box {
			display: flex;
			justify-content: space-around;
			font-size: 24rpx;
			padding: 0 60rpx 30rpx;
			margin-top: 30rpx;
			
			.tab-btn {
				width: 134rpx;
				height: 50rpx;
				line-height: 50rpx;
				background: #eee;
				border-radius: 8rpx;
				color: #666666;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			
			.tab-btn-act {
				background: var(--bg);
				color: #fff;
			}
		}
	}
	
	.msg-item {
		background: #fff;
		margin: 30rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		border-radius: 30rpx;
		
		.msg-head {
			position: relative;
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;
			padding: 30rpx 50rpx 0;
			
			.msg-badge {
				position: absolute;
				left: 24rpx;
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				background: #f56c6c;
			}
			
			.msg-type {
				width: 60rpx;
				height: 32rpx;
				line-height: 32rpx;
				border-radius: 4rpx;
				margin-right: 14rpx;
				font-size: 22rpx;
				color: #FFFFFF;
				text-align: center;
			}
			
			.msg-type-public {
				background: #75BA5F;
			}
			
			.msg-type-self {
				background: #F19149;
			}
			
			.msg-title {
				font-size: 32rpx;
				color: #000000;
				flex: 1;
				margin-right: 10rpx;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			
			.msg-time {
				font-size: 20rpx;
				color: #888888;
			}
		}
		
		.msg-content {
			border-top: 1rpx solid #eee;
			
			margin: 0 51rpx 30rpx;
			padding-top: 30rpx;
			font-size: 24rpx;
			color: #888888;
			line-height: 36rpx;
			box-sizing: border-box;
			
			.msg-desc {
				margin-bottom: 20rpx;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
			}
			
			.msg-img-box {
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		
		.msg-btn {
			margin: 0 51rpx 30rpx;
			border-top: 1rpx solid #eee;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 26rpx;
			color: #333333;
			padding-top: 20rpx;
			padding-bottom: 30rpx;
		}
	}
	
	.qrcode-box {
		position: relative;
		height: 100vh;
		
		.close-btn {
			margin-top: 48rpx;
			color: #aaa;
			font-size: 32rpx;
		}
	}
</style>
