<template>
	<view class="box" :style="vskin">
		<view class="handle-btn-box">
			<view class="cancel" @click="cancel">取消</view>
			<view class="comfirm" @click="saveApp">完成</view>
		</view>
		<view class="tips">长按拖动可调整顺序</view>
		
		<view class="box-white">
			<view class="app-title-box padding_l_r_30">
				<view class="app-class-title">我的应用</view>
			</view>
			
			<dragApp :listData="myApp" @listChange="dragChange" />
			<view class="empty" v-if="myApp.length < 1">请添加</view>
		</view>
		
		<appList :appList="appList" :myApp="myApp" :isEdit="true" @addMyApp="addMyApp" />
		
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	import appList from "@/components/appList/appList.vue";
	import dragApp from "./components/dragAppList/dragAppList.vue";
	
	import { SaveConvenientApplication } from "@/api/ApiUser"
	
	export default {
		name : 'manageMyApp',
		components: { appList, dragApp },
		data() {
			return {
				myApp: []
			};
		},
		computed: {
			...mapGetters(['appList', 'myAppList']),
			myApps: {
				get() {
					return this.myApp
				},
				set(newval) {
					this.myApp = newval
				}
			}
			// 可移动区域高度
			// movableAreaHeight() {
			// 	const appLength = this.myApp.length
			// 	const rowNum = parseInt((appLength + 4) / 5) // 行数
			// 	const height = 158 * rowNum
			// 	return height
			// }
		},
		onLoad() {
			this.myApp = JSON.parse(JSON.stringify(this.myAppList)) 
		},
		methods: {
			saveApp() {
				const apps = this.myApp.map(v => {
					return {
						applicationInfoId: v.id,
						sort: v.sort
					}
				})
				SaveConvenientApplication({apps}).then(res => {
					if(res.isSuccess) {
						uni.showToast({
							icon:'success',
							title: '保存成功',
							success: () => {
								this.$store.commit('base/SET_MYAPPLIST', apps)
								this.$store.dispatch('base/getApplist')
								this.cancel()
							}
						})
					}
				})
			},
			dragChange(event) {
				console.log(event)
				this.myApp = event.map((v,i) => {
					return {...v, sort: i}
				})
			},
			addMyApp(item) {
				if(this.myApp.every(v => v.id !== item.id)) {
					this.myApp.push(item)
				}
			},
			cancel() {
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		overflow: hidden;
	}
	
	.handle-btn-box {
		display: flex;
		justify-content: space-between;
		font-family: Microsoft YaHei;
		font-weight: 400;
		margin: 30rpx 30rpx 0;
		
		.cancel {
			font-size: 24rpx;
			color: #8A8A8A;
		}
		
		.comfirm {
			width: 98rpx;
			height: 42rpx;
			line-height: 42rpx;
			border-radius: 5px;
			background: var(--bg);
			border-radius: 6rpx;
			text-align: center;
			font-size: 24rpx;
			color: #F9F9F9;
		}
	}
	
	.tips {
		font-size: 24rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #8A8A8A;
		text-align: center;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.box-white {
		position: relative;
		background: #fff;
		padding-top: 40rpx;
		padding-bottom: 30rpx;
		margin: 0 30rpx 30rpx;
		border-radius: 50rpx;
		box-shadow: 3rpx -3rpx 54rpx 0 rgba(6,0,1,0.05);
	}
	
	.app-title-box {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.app-icon {
		width: 54rpx;
		height: 54rpx;
	}
	
	.remove-icon {
		position: absolute;
		top: -14rpx;
		right: 30rpx;
		z-index: 1;
	}
	
	.app-name {
		font-size: 24rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #0E254E;
		margin-top: 20rpx;
		width: 110rpx;
		height: 64rpx;
		text-align: center;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
	
	.app-class-title {
		font-size: 32rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #000000;
	}
	
	.empty {
		color: #999;
		font-size: 24rpx;
		text-align: center;
	}
	
	.cus-grid {
		justify-content: flex-start;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		overflow: visible;
		
		.cus-grid-item {
			align-items: center;
			justify-content: center;
			position: relative;
			flex-direction: column;
			box-sizing: border-box;
			display: flex;
			background: transparent;
			width: 20%;
			height: auto;
			margin-bottom: 20rpx;
		}
	}
</style>
