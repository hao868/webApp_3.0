<template>
	<view class="box">
		<u-search 
			v-model="keyword" 
			bgColor="#fff" 
			borderColor="#e5e5e5" 
			:actionStyle="{color: '#dd6161'}" 
			:placeholder="placeholder" 
			@search="search" 
			@custom="search" 
			@clear="clear"
		/>
		
		<!-- <view class="hot-search-box" v-if="hotSearch.length">
			<view class="hot-search-title">热门搜索</view>
			<view class="search-list">
				<view class="search-item" v-for="(item, index) in hotSearch" :key="index" @click="handleItemSearch(item)">{{item}}</view>
			</view>
		</view> -->
		<view class="search-result" v-show="hasSearch">
			<view class="title" >搜索结果</view>
			<view class="result-item" v-for="v in searchResult" :key="v.id" @click="jumpApp(v)">{{v.name}}</view>
			<view class="empty" v-if="searchResult.length < 1">无内容</view>
		</view>
		
		<view class="search-history" v-if="searchHistory.length">
			<view class="search-history-title flex-x-between flex-y-center">
				<view class="hot-search-title">搜索历史</view>
				<uni-icons type="trash-filled" size="22" color="#ccc" @click="delAllHistory"></uni-icons>
			</view>
			<view class="search-history-item flex-x-between flex-y-center" v-for="(item, i) in searchHistory" :key="i">
				<view class="name" @click="handleItemSearch(item)">{{item}}</view>
				<uni-icons type="closeempty" size="16" color="#ccc" @click="delHistory(i)"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { throttle } from "@/utils/util.js"
	import { GetRedirectUrl } from "@/api/ApiBase"
	export default {
		name: "searchPage",
		data() {
			return {
				hasSearch: false,
				keyword: '',
				placeholder: '请输入关键字搜索',
				searchResult: [], // 搜索结果
				// hotSearch: ['水电维修', '卡片充值', '失物招领', '发达司机大佬打'],
			}
		},
		computed: {
			...mapGetters(['appList', 'searchHistory']),
			allAppList() {
				let all = []
				this.appList.forEach((v, i) => {
					v.appList.forEach(list => {
						all.push(list)
					})
				})
				return all
			}
		},
		onLoad(options) {
			
		},
		methods: {
			jumpApp(item) {
				console.log(item)
				GetRedirectUrl({applicationId: item.id}).then(res => {
					if(res.isSuccess) {
						let pathUrl = res.dataModel.linkUrl
						if(pathUrl.indexOf('pagesA/userInfo/userInfo') >= 0) {
							pathUrl = '/pagesA/userInfo/userInfo'
							uni.navigateTo({
								url: pathUrl
							})
							return
						}
						// #ifdef MP-WEIXIN
						uni.navigateTo({
							url: `/pagesA/webviewWrap/webviewWrap?urlPath=${encodeURIComponent(res.dataModel.linkUrl)}`
						})
						// #endif
						// #ifdef H5
						location.href = res.dataModel.linkUrl
						// #endif
					} else {
						uni.showToast({
							icon: 'none',
							title: res.message
						})
					}
				})
			},
			clear() {
				this.searchResult = []
				this.hasSearch = false
			},
			focus(value) {
				if(!value) {
					this.keyword = this.placeholder
				}
			},
			search(value) {
				if(!value) {
					uni.showToast({
						icon: "none",
						title: '请输入搜索内容'
					})
					return
				}
				this.hasSearch = true
				throttle(this.handlerSearch(value))
			},
			handlerSearch(value) {
				const filterList = this.allAppList.filter(v => { return v.name.indexOf(value) != -1 })
				console.log(filterList)
				this.searchResult = filterList
				if(!this.searchHistory.includes(value)) {
					this.searchHistory.unshift(value)
					this.$store.commit('base/SET_SEARCHHISTORY', this.searchHistory)
				}
			},
			handleItemSearch(value) {
				this.keyword = value
				this.search(value)
			},
			delHistory(i) {
				this.searchHistory.splice(i, 1)
				this.$store.commit('base/SET_SEARCHHISTORY', this.searchHistory)
				this.$db.set('searchHistory', this.searchHistory)
			},
			delAllHistory() {
				this.$store.commit('base/SET_SEARCHHISTORY', [])
			}
		}
	}
</script>

<style lang="scss" scoped>
	.box {
		position: relative;
		padding: 30rpx;
		box-sizing: border-box;
	}
	
	.hot-search-box {
		margin: 40rpx 0;
		
		.hot-search-title {
			color: #333;
			font-weight: 600;
			margin-bottom: 28rpx;
			font-size: 32rpx;
		}
		
		.search-list {
			display: flex;
			flex-wrap: wrap;
			
			.search-item {
				margin-bottom: 30rpx;
				margin-right: 30rpx;
				border: 2rpx solid #c5c5c5;
				border-radius: 50rpx;
				padding: 20rpx 40rpx;
				font-size: 28rpx;
				color: #777;
			}
		}
	}
	
	.search-history {
		margin-top: 30rpx;
		
		.search-history-title {
			margin-bottom: 10rpx;
		}
		
		.search-history-item {
			padding-top: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #eee;
		}
		
		.name {
			color: #777;
			font-size: 28rpx;
		}
	}
	
	.search-result {
		color: #666;
		font-weight: 400;
		margin-top: 30rpx;
		margin-bottom: 50rpx;
		font-size: 30rpx;
		
		.title {
			text-align: center;
		}
		
		.result-item {
			color: #333;
			margin: 10rpx 0;
			border-bottom: #eee solid 1rpx;
			padding: 8rpx 0;
			cursor: pointer;
		}
		
		.empty {
			text-align: center;
			margin: 20rpx 0;
			font-size: 24rpx;
		}
	}
	
</style>