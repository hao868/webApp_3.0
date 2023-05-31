<template>
	<u-popup
		:show="show" 
		overlayOpacity="0.7" 
		:safeAreaInsetBottom="false" 
		:safeAreaInsetTop="false"	
		bgColor="transparent" 
		mode="top" 
		@close="close"
	>
		<view class="qrcode-box flex-column flex-x-center flex-y-center" :style="vskin">
			<view class="qrcode-content flex-column">
				<view class="qrcode-head">
					<view class="qrcode-head-top">
						<view class="">
							{{walletList&&walletList.length?cardTypeTxt(walletList[curentIndex].CardType):cardTypeTxt(0)}}
							<text style="visibility: hidden;">卡</text>
							{{walletList&&walletList.length?walletList[curentIndex].CardId : ''}}
						</view>
						<!-- <view class="qrcode-head-top-switch">
							<text style="margin-right: 6rpx;">卡片类型</text>
							<u-icon name="arrow-down-fill" color="#E8E7EB" size="11"></u-icon>
						</view> -->
					</view>
					<view class="blance">
						{{walletList&&walletList.length?(walletList[curentIndex].Balance == 0 ? '0.00' : walletList[curentIndex].Balance/100):'0.00'}}
					</view>
					<view>账户余额(元)</view>
				</view>
				
				<view class="qrcode-swiper">
					<uni-swiper-dot :info="walletList" :current="curentIndex" mode="round" :dots-styles="dotsStyles">
						<swiper class="swiper-box" @change="cardChange">
							<swiper-item v-for="(item, index) in walletList" :key="index">
								<tki-qrcode ref="qrcode" cid="qrcode" :val="urldata" :onval="onval" :size="400" :showLoading="showLoading" />
								<view class="mask" v-if="showMask">
									<view class="">二维码已失效</view>
									<view>请<text class="refresh-code" @click.stop="refreshQr(index)">刷新</text>使用</view>
								</view>
							</swiper-item>
						</swiper>
					</uni-swiper-dot>
				</view>
				<picker @change="bindPickerChange" :value="curentIndex" :range="walletOpt" range-key="strData" style="width: 100%;">
					<view class="qrcode-bottom flex-y-center">
						<image src="@/static/imgs/icon_wallet.png" mode="widthFix"></image>
						<view class="wallet-txt">
							<view class="wallet-name">{{walletList&&walletList.length?walletTypeTxt(walletList[curentIndex].WalletType):walletTypeTxt(0)}}</view>
							<view class="wallet-default-txt">优先使用此付款方式</view>
						</view>
						<uni-icons type="forward" size="12" color="#ccc" class="wallet-forward"></uni-icons>
					</view>
				</picker>
			</view>
			<view class="close-btn" @click="close">关闭</view>
		</view>
	</u-popup>
</template>

<script>
	const expires = 60
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	import crypto from "@/utils/crypto";
	import tkiQrcode from "@/components/tki-qrcode/tki-qrcode.vue"
	import { CreateQRcodeAppointType, ParseQrcode } from "@/api/ApiColumn";
	export default {
		name: 'pullDownQRCode',
		options: { styleIsolation: 'shared' },
		components: {
			tkiQrcode
		},
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				intervalTime: null,
				showMask: false,
				expiresTime: expires, // 过期时间
				curentIndex: 0, // 当前钱包下标
				onval: false,
				showLoading: false,
				urldata: '',
				dotsStyles: {
					backgroundColor: '#E8E7EB',
					border: '1px #E8E7EB solid',
					selectedBackgroundColor: '#6C63FF',
					selectedBorder: '1px #6C63FF solid'
				}
			}
		},
		computed: {
			...mapGetters(['walletList', 'apiToken',  'webAppConfig']),
			walletOpt() {
				return this.walletList.map((v,i) => {
					return {
						...v,
						strData: v.type == 0 || !v.type 
										 ? `${this.webAppConfig.mainWalletName || '主钱包'} 余额: ${v.Balance / 100}` 
										 : `${this.webAppConfig.eWalletName}${i+1}` || `副钱包${i+1} 余额: ${v.Balance / 100}`
					}
				})
			}
		},
		watch: {
			async show(val) {
				if(val) {
					if(!this.webAppConfig.showXFM) {
						uni.showToast({
							icon: 'none',
							title: '消费码未启用，请联系管理员'
						})
						this.close()
						return
					}
					this.expiresTime = expires
					uni.showLoading({
						title: '加载中'
					})
					await this.$store.dispatch('user/getApiToken')
					await this.$store.dispatch('user/getWallet')
					await this.GetXFMQrcode()
					uni.hideLoading()
				}
			}
		},
		methods: {
			cardTypeTxt(type) {
				if(type == 0 || !type) {
					return '主卡'
				} else {
					return `副卡${this.curentIndex}`
				}
			},
			walletTypeTxt(type) {
				if(type == 0 || !type) {
					return this.webAppConfig.mainWalletName || '主钱包'
				} else {
					return `${this.webAppConfig.eWalletName}${this.curentIndex+1}` || `副钱包${this.curentIndex+1}`
				}
			},
			// 钱包切换
			async bindPickerChange(e) {
				if(this.walletList && this.walletList.length && !this.webAppConfig.hasCanUseEWallet && this.walletList[e.detail.value].CardType == 2) {
					uni.showToast({
						icon: 'none',
						title: '子/电子钱包不可消费，请联系管理员'
					})
					return
				}
				this.curentIndex = e.detail.value
				uni.showLoading({
					title: '加载中'
				})
				this.resetData()
				await this.GetXFMQrcode()
				this.expiresTime = expires
				this.showMask = false
				uni.hideLoading()
			},
			// 刷新
			async refreshQr(index) {
				clearInterval(this.intervalTime)
				uni.showLoading({
					title: '刷新中'
				})
				this.resetData()
				this.curentIndex = index
				await this.GetXFMQrcode()
				this.expiresTime = expires
				this.showMask = false
				uni.hideLoading()
			},
			resetData() {
				this.urldata = ''
				this.showLoading = false
				this.onval = false
			},
			// 卡片切换
			async cardChange(e) {
				if(!this.webAppConfig.hasCanUseEWallet && this.walletList[e.detail.current].CardType == 2) {
					uni.showToast({
						icon: 'none',
						title: '子/电子钱包不可消费，请联系管理员'
					})
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				this.resetData()
				this.curentIndex = e.detail.current
				await this.GetXFMQrcode()
				this.expiresTime = expires
				this.showMask = false
				uni.hideLoading()
			},
			close() {
				this.$emit('close', false)
				uni.hideLoading()
				this.resetData()
				clearInterval(this.intervalTime)
				this.expiresTime = expires
				this.showMask = false
			},
			// 生成二维码
			async GetXFMQrcode() {
				// this['showLoading'+this.curentIndex] = true
				this.showLoading = true
				const userInfo = this.$db.get('userInfo')
				let param = {
					WalletType: this.walletList[this.curentIndex].WalletType || 0,
					WalletTypeCode: "",
					InterfaceIdentityId: userInfo && userInfo.studentNumber,
					InterfaceIdentityIdType: 2,
					CampusId: this.webAppConfig.yunCampusId,
					StudentNumber: userInfo && userInfo.studentNumber,
					Sign: "0",
					Token: this.$db.get('apiToken')
				};
				await CreateQRcodeAppointType(param).then(res => {
					if (res.isSuccess) {
						let dat = JSON.parse(crypto.decrypted(res.dataModel));
						console.log(dat)
						this.urldata = dat.QRcode
						this.showLoading = false
						this.onval = true
						this.intervalTime = setInterval(() => {
							this.expiresTime--
							if(this.expiresTime <= 0) {
								clearInterval(this.intervalTime)
								this.showMask = true
							}
						}, 1000) 
					} else {
						Toast(res.message);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qrcode-box {
		position: relative;
		height: 100vh;
		
		.close-btn {
			margin-top: 48rpx;
			color: #aaa;
			font-size: 32rpx;
		}
	}
	.qrcode-content {
		width: 684rpx;
		height: 900rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 0 77rpx 34rpx rgba(139,130,131,0.05);
		overflow: hidden;
		box-sizing: border-box;
		text-align: center;
		
		.qrcode-head {
			// background: #6C63FF;
			background: var(--bg);
			height: 250rpx;
			padding: 48rpx;
			color: #fff;
			font-family: Microsoft YaHei;
			font-weight: 400;
			font-size: 24rpx;
			letter-spacing: 2rpx;
			box-sizing: border-box;
			
			&-top {
				display: flex;
				justify-content: space-between;
				
				&-switch {
					display: flex;
					align-items: center;
				}
			}
			
			.blance {
				font-size: 50rpx;
				margin: 20rpx 0 20rpx;
			}
		}
		
		.qrcode-swiper {
			flex: 1;
			box-sizing: border-box;
			padding: 40rpx 60rpx;
			width: 520rpx;
			height: 480rpx;
			margin: 0 auto;
			box-sizing: border-box;
		}
		
		.qrcode-bottom {
			width: 100%;
			height: 128rpx;
			border-top: 1rpx solid rgba(138, 138, 138, 0.15);
			padding: 28rpx 26rpx 28rpx 54rpx;
			// display: flex;
			// // justify-content: space-between;
			// align-items: center;
			box-sizing: border-box;
			font-size: 24rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			line-height: 36rpx;
			
			image {
				width: 54rpx;
				margin-right: 40rpx;
			}
			
			.wallet-txt {
				flex: 1;
				text-align: left;
			}
			
			.wallet-name {
				color: #414040;
			}
			
			.wallet-default-txt {
				color: #999797;
			}
			
		}
		.mask {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 87.5%;
			background: rgba(0,0,0,.7);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 32rpx;

			.refresh-code {
				background: #ffac2f;
				margin: 0 8rpx;
				padding-left: 8rpx;
				padding-right: 8rpx;
				border-radius: 8rpx;
				font-size: 36rpx;
			}
		}
	}
	
	::v-deep .u-swiper {
		overflow: visible !important;
	}
	::v-deep .swiper-box {
		height: 460rpx;
	}
	::v-deep .uni-swiper {
		height: 460rpx;
	}
	::v-deep .uni-swiper__dots-item {
		width: 30rpx !important;
		height: 4rpx !important;
		border-radius: 10rpx !important;
	}
	::v-deep .uni-swiper__dots-long {
		width: 60rpx !important;
	}
</style>