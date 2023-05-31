<template>
	<view>
		<view class="btns-box">
			<view class="cancel" @click="close">取消</view>
			<view class="comfirm" @click="comfirm">确定</view>
		</view>
		<picker-view :indicator-style="indicatorStyle" :value="currentIndex" @change="bindChange" class="picker-view">
			<picker-view-column>
				<view class="item" v-for="(item,index) in mechanismList" :key="index">{{item.mechanismName}}</view>
			</picker-view-column>
			<picker-view-column>
				<view class="item" v-for="(item,index) in sitesList" :key="index">{{item.siteName}}</view>
			</picker-view-column>
		</picker-view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
	import { GetMechanismListApi } from "@/api/ApiBase.js"
	export default {
		data() {
			return {
				mechanismList: [],
				sitesList: [],
				visible: true,
				indicatorStyle: `height: 70rpx;`,
				tempIndex: [0,0],
				currentIndex: [0,0]
			}
		},
		async onLoad() {
			this.getMechanismList().then(mechanismArr => {
				this.mechanismList = mechanismArr
				return mechanismArr
			}).then(res => {
				this.$store.dispatch('base/getSitesList', res[0].id).then(site => {
					if(site && site.length) {
						this.sitesList = site
					} else {
						this.sitesList = []
						uni.showToast({
							icon: 'none',
							title: '此机构下没有站点，请联系管理员配置站点'
						})
					}
				})
			})
		},
		methods: {
			async bindChange (e) {
				const valArr = e.detail.value
				console.log(valArr, this.tempIndex)
				if(valArr[0] != this.tempIndex[0]) {
					uni.showLoading()
					await this.$store.dispatch('base/getSitesList', this.mechanismList[valArr[0]].id).then(site => {
						if(site && site.length) {
							this.sitesList = site
						} else {
							this.sitesList = []
							uni.showToast({
								icon: 'none',
								title: '此机构下没有站点，请联系管理员配置站点'
							})
						}
					}).finally(() => uni.hideLoading())
				}
				this.tempIndex = valArr
			},
			comfirm() {
				this.currentIndex = this.tempIndex
				// this.switchAccount()
				this.$store.commit('base/SET_CURRENTMECHANISM', this.mechanismList[this.currentIndex[0]])
				this.$store.commit("base/SET_CURRENTSITE", this.sitesList[this.currentIndex[1]])
				this.$store.commit('base/SET_ACTIVEINDEX', 0)
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			close() {
				this.tempIndex = this.currentIndex
				uni.navigateBack({
					delta: 1
				})
			},
			getMechanismList() {
				return new Promise((resolve, reject) => {
					GetMechanismListApi().then(async res => {
						if (res.isSuccess) {
							resolve(res.dataModel)
						}
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.picker-view {
		width: 750rpx;
		height: 600rpx;
		margin-top: 20rpx;
	}
	.item {
		height: 70rpx;
		line-height: 70rpx;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	
	.btns-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 30rpx;
		padding: 20rpx 30rpx;
		
		.cancel {
			color: #666;
			cursor: pointer;
		}
		
		.comfirm {
			color: #00aaff;
			cursor: pointer;
		}
	}
</style>
