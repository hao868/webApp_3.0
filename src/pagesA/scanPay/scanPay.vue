<template>
	<view class="qr-code" :class="!success?'':'success-page'">
		<view class="container" v-if="!success">
			<view class="content">
				<view class="title">金额</view>
				<view class="money" v-if="amount"><text>¥</text>{{ price }}</view>
				<view class="money write-input" v-else>
					<text>¥</text>
					<uni-easyinput
						placeholder="请输入内容"
						border="digit"
						clearable
						focus
						ref="writeInput" 
						class="input" 
						v-model="price" 
						trim="all"
					></uni-easyinput>
				</view>
			</view>

			<view class="submit">
				<u-button type="primary" :disabled="!price" @click="passwordDialog = true">付款</u-button>
			</view>
			
			<!-- 支付金额及密码输入 -->
			<u-popup :show="passwordDialog" mode="center" :closeOnClickOverlay="false" :closeable="true" @close="close">
				<view class="pay-pwd">
					<view class="pay-pwd-head">
						<view>消费</view>
						<view class="price">¥{{ price || 0 }}元</view>
					</view>
					<inputPwd v-model="password" />
					<u-button type="primary" :disabled="password.length < 6" @click="payMentSubmit">确认支付</u-button>
				</view>
			</u-popup>
			<u-keyboard 
				mode="number" 
				:overlay="false" 
				:closeOnClickOverlay="false" 
				:show="passwordDialog" 
				:showCancel="false"
				:showConfirm="false"
				:showTips="false"
				:tooltip="false"
				@change="valChange" 
				@backspace="backspace" 
			/>
		</view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	import crypto from "@/utils/crypto";
	import inputPwd from "./component/inputPwd.vue"
	import { CardConsume, QRcodePay, CheckPassword } from "@/api/ApiColumn";
	export default {
		components: { inputPwd },
		data() {
			return {
				passwordDialog: false, // 显示密码输入键盘
				price: '', // 输入的金额
				success: false, 
				password: '', // 支付密码
				successResult: '', // 支付结果
			}
		},
		computed: {
			...mapGetters(['appList', 'apiToken', 'token', 'userInfo', 'webAppConfig']),
			...mapState({
				parseQrCodeStr: state => state.user.parseQrCodeStr,
				parseQrCodeData: state => state.user.parseQrCodeData,
				amount: state => state.user.parseQrCodeData.Amount
			}),
		},
		created() {
			this.checkIfHasCode()
		},
		methods: {
			// 点击支付
			async payMentSubmit() {
				console.log("点击确认支付");
				await this.$store.dispatch('/user/getApiToken')
				const res = await this.checkPassword()
				if(!res.isSuccess) {
					uni.showToast({
						icon:'none',
						title: res.message
					})
					return
				}
				// 二维码类型为商户码（带交易金额）且有商户码和金额时使用二维码支付
				this.confrimPayMentByQR();
			},
			// 验证支付密码
			async checkPassword() {
				const param = {
					Password: crypto.encrypted(this.password),
					InterfaceIdentityId: this.userInfo && this.userInfo.studentNumber,
					InterfaceIdentityIdType: 2,
					CampusId: this.webAppConfig.yunCampusId,
					StudentNumber: this.userInfo && this.userInfo.studentNumber,
					Sign: '0',
					Token: this.apiToken
				}
				const res = await CheckPassword(param)
				return res
			},
			// 二维码消费
			async confrimPayMentByQR() {
				uni.showLoading({
					title: '正在支付中...',
					mask: true
				})
				const param = {
					QRcode: this.parseQrCodeStr,
					InterfaceIdentityId: this.userInfo && this.userInfo.studentNumber, // 对接第三方使用的唯一标识 学号或身份证
					InterfaceIdentityIdType: 2, // 第三方标识类型 0：消费账户 1：身份证 2：学号
					CampusId: this.webAppConfig.yunCampusId, // 校区id
					StudentNumber: this.userInfo && this.userInfo.studentNumber, // 学号
					Sign: '0', // 签名（MD5签名）MD5加密描述
					Token: this.apiToken
				}
				// param.Sign = crypto.md5(JSON.stringify(param));
				QRcodePay(param).then(res => {
					this.close()
					if (res.isSuccess) {
						const result = JSON.parse(crypto.decrypted(res.dataModel))
						console.log('支付成功', result)
						this.successResult = result
						this.success =  true
					} else {
						uni.showModal({
							title: '提示',
							content: res.message,
							confirmText: '重新支付',
							success: (res) => {
								if(res.confirm) {
									this.passwordDialog = true;
								}
							}
						})
					}
				}).finally(() => {
					uni.hideLoading()
				})
			},
		
			// 执行支付 卡消费
			async confrimPayMentByCard() {
				uni.showLoading({
					title: '正在支付中...',
					mask: true
				})
				const payTime = await this.getConsumeTime()
				console.log(payTime)
				const param = {
					OrderNumber: this.OrderNumber, // 订单号
					ThirdSerial: this.OrderNumber, // 第三方流水号 微信/支付宝
					Money: Number(this.price) * 100, // 金额（单位：分）
					Mercacc: this.parseQrCodeData.DealerNum, // 商户号
					ConsumeTime: payTime, // 交易时间 yyyy/MM/dd HH:mm:ss
					InterfaceIdentityId: this.userInfo && this.userInfo.studentNumber, // 对接第三方使用的唯一标识 学号或身份证
					InterfaceIdentityIdType: 2, // 第三方标识类型 0：消费账户 1：身份证 2：学号
					CampusId: this.webAppConfig.yunCampusId, // 校区id
					StudentNumber: this.userInfo && this.userInfo.studentNumber, // 学号
					Sign: '0', // 签名（MD5签名）MD5加密描述
					Token: this.apiToken
				}
		
				CardConsume(param).then(res => {
					this.close()
					if (res.isSuccess) {
						this.successResult = crypto.decrypted(res.dataModel)
						this.success =  true
					} else {
						uni.showModal({
							title: '提示',
							content: res.message,
							confirmText: '重新支付',
							success: (res) => {
								if(res.confirm) {
									this.passwordDialog = true;
								}
							}
						})
					}
				}).finally(() => {
					uni.hideLoading()
				})
			},
			// 获取交易时间
			async getConsumeTime() {
				const utc = await this.$store.dispatch('/user/getUTC')
				return utc
			},
			close() {
				this.passwordDialog = false
				this.password = ''
			},
			// 按键被点击(点击退格键不会触发此事件)
			valChange(val) {
				// 将每次按键的值拼接到password变量中，注意+=写法
				this.password += val;
			},
			// 退格键被点击
			backspace() {
				// 删除password的最后一个字符
				if(this.password.length) this.password = this.password.substr(0, this.password.length - 1);
			},
			// 检查code 解析后成功了没.
			checkIfHasCode() {
				if (!this.parseQrCodeData) {
					uni.showModal({
						title: '扫码失败',
						content: '二维码解析失败请重新扫码',
						showCancel: false,
						complete: () => {
							this.$customSwitchTab('/pages/index/index')
						}
					})
				} else if(!this.parseQrCodeData.Amount && this.parseQrCodeData.Type == '3') {
					uni.showModal({
						title: '扫码失败',
						content: '二维码解析失败请重新扫码',
						showCancel: false,
						complete: () => {
							this.$customSwitchTab('/pages/index/index')
						}
					})
				} else {
					this.price = this.parseQrCodeData.Amount
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qr-code {
	  min-height: 100vh;
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	  overflow: hidden;
	  background-color: #f5f5f5;
	  .merchant {
	    padding: 50rpx 40rpx;
	    min-height: 120rpx;
	    h4 {
	      margin: 0;
	      font-weight: 500;
	      padding-bottom: 20rpx;
	    }
	    text {
	      font-size: 30rpx;
	    }
	  }
	  .container {
	    flex: 1;
	    min-height: 0;
	    display: flex;
	    flex-direction: column;
	    padding: 0 40rpx;
	    overflow: hidden;
	    background-color: #fff;
	    .content {
	      flex: 1;
	      margin-top: 40rpx;
	      min-height: 0;
	      .money {
	        font-size: 80rpx;
	        font-weight: bold;
	      }
	      .title {
	        font-size: 30rpx;
	        margin-bottom: 30rpx;
	      }
	      text {
	        font-size: 80rpx;
	        font-weight: bold;
	        padding-right: 15rpx;
	      }
	    }
	    .write-input {
	      display: flex;
	      border-bottom: solid 1rpx #f5f5f5;
	      // text {
	      //   padding-top: 15px;
	      // }
	      .input {
	        padding: 0;
	        font-size: 80rpx;
	      }
	      ::-webkit-input-placeholder {
	        color: #999;
	        font-size: 36rpx;
	      }
	    }
	    .submit {
	      height: 240px;
	    }
	  }
	}
	
	.success-page{
	  background-color: #fff;
	}
	
	.pay-pwd {
		width: 66vw;
		padding: 0 60rpx;
		font-size: 28rpx;
		text-align: center;
		
		&-head {
			margin: 20rpx 0;
			
			.price {
				font-size: 40rpx;
				font-weight: bold;
				margin-top: 20rpx;
			}
		}
	}
</style>