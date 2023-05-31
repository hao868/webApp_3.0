<template>
	<view class="box" :style="vskin">
		<view class="card-bag" v-for="(item, index) in qrcodeArr" :key="index">
			<view class="card-bag-info info-bg" :class="'info-bg'+index">
				<view class="card-bag-info-left">
					<view class="card-bag-info-left-name">{{item.name}}</view>
					<view class="card-bag-info-left-number">{{userInfo.studentNumber}}</view>
				</view>
				<view class="card-bag-info-right">{{userInfo.name}}</view>
			</view>
			<view :class="item.showQRCode?'card-bag-qrcode-show':'card-bag-qrcode-hide'">
				<tki-qrcode :ref="'qrcode'+index" :cid="'qrcode_'+index" :val="item.val" :onval="item.onval" :size="250" :showLoading="false" :loadMake="true" />
			</view>
			<view class="card-bag-bottom">
				<view class="card-bag-bottom-bg">
					<view class="btn-box" @click="traggleQrCode(item, index)">
						<view class="btn-icon">
							<uni-icons type="top" color="#fff" v-show="item.showQRCode"></uni-icons>
							<image v-show="!item.showQRCode" src="../../static/imgs/icon_qrcode.png" mode="widthFix"></image>
						</view>
						<view class="btn-txt">{{item.showQRCode?'收起':'出示二维码'}}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import tkiQrcode from "@/components/tki-qrcode/tki-qrcode.vue"
	import { ListViewCardWallet } from "@/api/ApiUser"
	export default {
		components: {tkiQrcode},
		data() {
			return {
				qrcodeArr: []
			}
		},
		computed: {
			...mapGetters(['userInfo', 'token']),
		},
		created() {
			this.getCardBagList()
		},
		mounted() {
			
		},
		methods: {
			getCardBagList() {
				ListViewCardWallet().then(res => {
					this.qrcodeArr = res.dataModel.map((v,i) => {
						return {
							...v,
							showQRCode: false,
							val: '',
							onval: false
						}
					})
				})
			},
			async traggleQrCode(item, index) {
				if(!this.qrcodeArr[index].showQRCode) {
					await this.requestCustom(item, index)
				}
				this.qrcodeArr[index].onval = !this.qrcodeArr[index].onval
				this.qrcodeArr[index].showQRCode = !this.qrcodeArr[index].showQRCode
			},
			async requestCustom(item, index) {
				uni.showLoading({
					title: '加载中'
				})
				await uni.request({
					url: item.url,
					timeout: 6000,
					header: {
						'Content-Type': 'application/json;charset=utf-8',
						'token': this.token
					},
					method: 'POST',
					data: {},
					success: response => {
						if (!response.data.isSuccess) {
							uni.showToast({
								mask: true,
								icon: 'none',
								title: `${response.data.message}`,
								duration: 2000
							})
						} else {
						  this.$set(this.qrcodeArr, index, {
								...this.qrcodeArr[index], 
								val: response.data.dataModel.context,
								onval: true
							})
						}
					},
					fail: err => {
						uni.showToast({
							icon: 'error',
							mask: true,
							title: err.errMsg
						})
					},
					complete: () => {
						uni.hideLoading()
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		overflow: hidden;
		background: #FFFFFF;
	}
	
	.box {
		margin: 30rpx;
	}
	.info-bg {
		background: linear-gradient(-42deg, #4A8FF6, #3164F3);
	}
	
	.info-bg0 {
		background: linear-gradient(75deg, #CD8EFE, #6F51BE);
	}
	
	.info-bg1 {
		background: linear-gradient(-42deg, #4A8FF6, #3164F3);
	}
	
	.info-bg2 {
		background: linear-gradient(-42deg, #EF4668, #FA8473);
	}
	
	.info-bg3 {
		background: linear-gradient(-42deg, #B5797B, #E7BEBE);
	}
	
	.info-bg4 {
		background: linear-gradient(75deg, #00aa00, #005500);
	}
	
	.card-bag {
		width: 690rpx;
		background: #FFFFFF;
		border-radius: 16rpx;
		box-shadow: 0rpx 2rpx 6rpx 6rpx #f5f5f5;
		box-sizing: border-box;
		overflow: hidden;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #FFFFFF;
		overflow: hidden;
		margin-bottom: 50rpx;
		
		&-info {
			width: 100%;
			height: 180rpx;
			// background: linear-gradient(75deg, #CD8EFE, #6F51BE);
			display: flex;
			justify-content: space-between;
			
			&-left {
				margin-top: 30rpx;
				margin-left: 40rpx;
				
				&-name {
					font-size: 34rpx;
					margin-bottom: 20rpx;
				}
				
				&-number {
					font-size: 26rpx;
				}
			}
			
			&-right {
				width: 110rpx;
				height: 110rpx;
				line-height: 110rpx;
				background: rgba(255,255,255,0.12);
				border-radius: 50%;
				text-align: center;
				font-size: 26rpx;
				margin-top: -10rpx;
				position: relative;
				
				
				&::before {
					content: "";
					width: 50rpx;
					height: 50rpx;
					border-radius: 50%;
					position: absolute;
					top: 0;
					left: -24rpx;
					background: rgba(255,255,255,0.12);
				}
			}
		}
		
		&-qrcode-show {
			margin-top: 24rpx;
			margin-bottom: 50rpx;
			margin-left: auto;
			margin-right: auto;
			width: 250rpx;
			height: 250rpx;
			transition: height 0.2s linear;
			
			// image {
			// 	width: 100%;
			// 	height: 100%;
			// }
		}
		
		&-qrcode-hide {
			margin-left: auto;
			margin-right: auto;
			width: 250rpx;
			// margin: 0 auto;
			transition: height 0.2s linear;
			height: 0;
		}
		
		&-bottom {
			width: 100%;
			height: 116rpx;
			box-shadow: 0 -4rpx 9rpx 0 rgba(100,100,100,0.16);
			position: relative;
			box-sizing: border-box;
			
			
			&::before {
				content: "";
				width: 146rpx;
				height: 68rpx;
				background: #FFFFFF;
				border-radius: 68rpx 68rpx 0 0;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				top: -24rpx;
				box-shadow: 0 -4rpx 9rpx 0 rgba(100,100,100,0.16);
			}
			
			&-bg {
				position: relative;
				width: 100%;
				height: 100%;
				background: #fff;
				z-index: 1;
				
				.btn-box {
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					align-items: center;
					position: absolute;
					top: -16rpx;
					left: 50%;
					transform: translateX(-50%);
					
					.btn-icon {
						width: 64rpx;
						height: 64rpx;
						background: var(--bg);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						
						image {
							width: 50%;
							height: 50%;
						}
					}
					
					.btn-txt {
						color: #333;
						font-size: 26rpx;
					}
				}
			}
		}
	}
</style>
