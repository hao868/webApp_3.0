<template>
	<view class="box">
		<view class="top-logo">
			<image :src="pageConfig.logo" mode="aspectFit"></image>
		</view>
		
		<view class="login-content">
			<view class="title">{{pageConfig.bigText}}</view>
			<view class="welcome">{{pageConfig.smallText}}</view>
			
			<view class="form-box">
				<uni-data-picker 
					placeholder="请选择机构/站点" 
					popup-title="选择机构/站点" 
					v-model="value" 
					:localdata="dataTree" 
					@change="pickerChange" 
				/>
				<uni-easyinput trim="all" :inputBorder="false" placeholder="账号" v-model="formFields.account" />
				
				<template v-if="loginType == 1">
					<uni-easyinput type="password" trim="all" :inputBorder="false" placeholder="密码" v-model="formFields.password" />
				</template>
				
				<template v-else-if="loginType == 2">
					<uni-easyinput type="number" trim="all" :inputBorder="false" placeholder="手机号" v-model="formFields.mobile" />
					<u-input placeholder="验证码" placeholderStyle="color: #999;font-size: 24rpx" v-model="formFields.code">
						<template slot="suffix">
							<u-code ref="uCode"	@change="text => tips = text" :seconds="seconds" changeText="X秒重新获取"></u-code>
							<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
						</template>
					</u-input>
				</template>
				
			</view>
			
			<view class="login-btn" @click="login">立即登录</view>
			<view class="login-btn" v-if="isWeixin" @click="loginByWeixin">微信授权登录</view>
			
			<view class="forget-pwd">忘记密码？请联系管理员</view>
		</view>
		
		<view class="agreed">
			<uni-icons v-show="!checked" type="circle" size="20" color="#6C63FF" @click="checked = !checked" />
			<uni-icons v-show="checked" type="checkbox" size="20" color="#6C63FF" @click="checked = !checked" />
			<view class="text-box">
				<text @click="checked = !checked">我已阅读并同意</text>
				<text v-for="item in instructionsList" :key="item.id" class="blue" @click="viewServiceAgreement(item)">《{{item.title}}》</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
	
	import {clickThrottle } from '@/utils/util'
	// #ifdef H5
	import { isWeiXinBrowser } from '@/utils/util'
	// #endif
	// #ifdef MP-WEIXIN
	import { getWxCode } from "@/utils/commom.js"
	// #endif
	
	import { GetSitesListApi, ListViewInstructions, QueryLogOnViewConfig } from "@/api/ApiBase.js"
	import {
	  UserLogin,
	  UpdateUserToken,
	  GetMechanismInfos,
	  GetMobileVerifyCode,
	  LoginByMobile,
		GetWchatOpenIdApi,
		LoginByWeixin,
		BindingUserOpenid
	} from "@/api/ApiUser";
	
	export default {
		options: { styleIsolation: 'shared' },
		data() {
			return {
				formFields: {
					mechanismId: '', // 机构id
					siteId: '', // 站点id
					account: '07713969391', // 账号
					password: '123456', // 密码
					mobile: '', // 手机号
					code: '' ,// 验证码
					openId: ''
				},
				tips: '',
				seconds: 30,
				value: '',
				dataTree: [],
				checked: false,
				// #ifdef H5
				isWeixin: isWeiXinBrowser(),
				// #endif
				// #ifdef MP-WEIXIN
				isWeixin: true,
				// #endif
				instructionsList: [],
				pageConfig: {}
			}
		},
		computed: {
			...mapGetters(['mechanismList', 'webAppConfig', 'token']),
			loginType() {
				return this.webAppConfig.loginType
			}
		},
		async onLoad() {
			await this.$store.dispatch('base/getMechanismList').then(async mList => {
				const child = await Promise.all(mList.map(v => {
					return this.$store.dispatch('base/getSitesList', v.id).then(res => {
						return res && res.map(item => {
							return {
								...item,
								value: item.id,
								text: item.siteName
							}
						}) || []
					})
				}))
				
				mList.forEach(async (v,i) => {
					this.$set(this.dataTree, i, {
						value: v.id,
						text: v.mechanismName,
						children: child[i],
						disable: child[i].length ? false : true
					})
				})
			})
			
			this.value = this.$store.state.base.currentSite.id
			this.formFields.mechanismId = this.$store.state.base.currentMechanism.id
			this.formFields.siteId = this.$store.state.base.currentSite.id
			this.getLoginPageConfig()
			this.getListInstructions()
		},
		mounted() {},
		methods: {
			// 获取页面配置
			getLoginPageConfig() {
				const mechanismId = this.$db.get('currentMechanism')?.id
				QueryLogOnViewConfig({mechanismId}).then(res => {
					if(res.isSuccess) {
						this.pageConfig = res.dataModel
					}
				})
			},
			// 获取隐私政策列表
			getListInstructions() {
				const mechanismId = this.$db.get('currentMechanism').id
				ListViewInstructions({mechanismId}).then(res => {
					if(res.isSuccess) {
						this.instructionsList = res.dataModel
					}
				})
			},
			async getOpenId() {
				const openId = this.$db.get('openId')
				const mId = this.$db.get('currentMechanism')?.id
				if(openId) {
					return openId
				} else {
					// #ifdef MP-WEIXIN
					const code = await getWxCode()
					if(code) {
						return await this.$store.dispatch('user/getWchatOpenId', { mechanismId: mId, code })
					}
					// #endif
				}
				
			},
			// 微信登录
			async loginByWeixin() {
				if(!this.formFields.mechanismId && !this.formFields.siteId) {
					this.customShowToast('请选择机构/站点')
					return
				} else if(!this.checked) {
					this.customShowToast('请勾选服务协议')
					return
				}
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				const mechanismId = this.formFields.mechanismId
				const openId = await this.getOpenId()
				LoginByWeixin({ mechanismId, openId }).then(res => {
					const respData = res.dataModel
					this.$store.commit('user/SET_TOKEN', respData.token)
					this.$store.commit('user/STE_USERINFO', respData.userInfo)
					uni.hideLoading()
					this.customShowToast('登录成功', 'success', 2000, true)
					this.updateToken()
				})
			},
			login() {
				if(!this.formFields.mechanismId && !this.formFields.siteId) {
					this.customShowToast('请选择机构/站点')
					return
				} else if(!this.formFields.account) {
					this.customShowToast('请输入账号')
					return
				} else if(!this.checked) {
					this.customShowToast('请勾选服务协议')
					return
				}
				
				if(this.loginType == 1) {
					this.loginByAccount()
				} else if(this.loginType == 2) {
					if(!this.formFields.code) {
						this.customShowToast('请输入验证码')
						return
					}
					this.loginByMobile()
				}
			},
			// 账号密码登录
			async loginByAccount() {
				if(!this.formFields.password) {
					this.customShowToast('请输入密码')
					return
				}
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				const {account, mechanismId, password} = this.formFields
				const openId = this.$db.get('openId')
				await UserLogin({account, password, mechanismId, openId}).then(res => {
					const respData = res.dataModel
					this.$store.commit('user/SET_TOKEN', respData.token)
					this.$store.commit('user/STE_USERINFO', respData.userInfo)
					this.bindOpenId()
					uni.hideLoading()
					this.customShowToast('登录成功', 'success', 2000, true)
					this.updateToken()
				})
				
			},
			// 手机验证码登录
			loginByMobile() {
				const regMobile = /^1[3-9]\d{9}$/
				if(!this.formFields.mobile) {
					this.customShowToast('请输入手机号')
					return
				} else if(!regMobile.test(this.formFields.mobile)) {
					this.customShowToast('手机号不符合规范')
					return
				}
				
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				const {account, mechanismId, mobile, code} = this.formFields
				
				LoginByMobile({mobile, code, account, mechanismId}).then(res => {
					const respData = res.dataModel
					this.$store.commit('user/SET_TOKEN', respData.token)
					this.$store.commit('user/STE_USERINFO', respData.userInfo)
					this.bindOpenId()
					uni.hideLoading()
					this.customShowToast('登录成功', 'success', 2000, true)
					this.updateToken()
				})
			},
			// 获取手机验证码
			getCode() {
				const regMobile = /^1[3-9]\d{9}$/
				if(!this.formFields.mobile) {
					this.customShowToast('请输入手机号')
					return
				} else if(!regMobile.test(this.formFields.mobile)) {
					this.customShowToast('手机号不符合规范')
					return
				}
				
				if (this.$refs.uCode.canGetCode) {
					const lastSendTime = this.$db.get('MobileVerifyCodeTime')
					const now = +new Date()
					if(lastSendTime && now - lastSendTime < this.seconds * 1000) {
						this.customShowToast(`验证码已发送，${this.calcTime(this.seconds)}钟内请勿重复发送`)
						return
					}
					// 模拟向后端请求验证码
					uni.showLoading({
						title: '正在获取验证码',
						mask: true
					})
					GetMobileVerifyCode({
						account: this.formFields.account, 
						mobile: this.formFields.mobile,
					}).then(res => {
						uni.hideLoading();
						// 这里此提示会被this.start()方法中的提示覆盖
						this.customShowToast('验证码已发送');
						// 通知验证码组件内部开始倒计时
						this.$refs.uCode.start();
						this.$db.set('MobileVerifyCodeTime', +new Date())
					})
				} else {
					this.customShowToast('验证码已发送,请注意查收');
				}
			},
			pickerChange(e) {
				console.log(e.detail)
				if(!e.detail.value.length) {
					this.formFields.mechanismId = ''
					this.formFields.siteId = ''
				} else {
					this.formFields.mechanismId = e.detail.value[0].value
					this.formFields.siteId = e.detail.value[1].value
				}
				
				console.log(this.formFields)
			},
			updateToken() {
				console.log('更新token')
				const mechanismId = this.formFields.mechanismId
				const sitesId = this.formFields.siteId
				const token = this.token
				const openId = this.$db.get('openId')
				UpdateUserToken({mechanismId, sitesId, token, openId}).then(res => {
					this.$customSwitchTab('/pages/index/index')
				})
			},
			// 绑定openid
			bindOpenId() {
				console.log('绑定openid', this.$db.get('openId'))
				const openId = this.$db.get('openId')
				if(!openId) return
				//  #ifdef H5
				const codeType = 1
				// #endif
				//  #ifdef MP-WEIXIN
				const codeType = 4
				// #endif
				BindingUserOpenid({openId, codeType});
			},
			viewServiceAgreement(item) {
				uni.navigateTo({
					url: `/pagesA/instructionsDesc/instructionsDesc?item=${encodeURIComponent(JSON.stringify(item))}`
				})
			},
			// 重新封装提示
			customShowToast(title, icon = 'none', time = 1000, mask = false) {
				uni.showToast({title, icon, time, mask})
			},
			calcTime(s) {
				if(!s) return;
				let minutes = parseInt(s / 60);
				let seconds = s % 60;
				if(minutes > 0 && seconds > 0) {
					return `${minutes}分${seconds}秒`
				} else if(minutes > 0 && seconds <= 0) {
					return `${minutes}分`
				} else if(minutes <= 0 && seconds > 0) {
					return `${seconds}秒`
				} else {
					return `0秒`
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		height: 100vh;
		overflow: hidden;
	}
	
	::v-deep .uni-select, ::v-deep .input-value-border, ::v-deep .u-input {
		border: none;
		border-radius: 0;
		// padding: 0;
	}
	
	::v-deep .uni-easyinput, ::v-deep .uni-stat__select, ::v-deep .uni-data-tree-input, ::v-deep .u-input {
		margin-top: 16rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #E5E5E5;
		border-radius: unset;
	}
	
	.top-logo {
		width: 234rpx;
		height: 226rpx;
		margin-top: 46rpx;
		margin-bottom: 42rpx;
		margin-left: auto;
		margin-right: auto;
		
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	.login-content {
		width: 650rpx;
		background: #FFFFFF;
		box-shadow: 3rpx -3rpx 54rpx 0 rgba(6,0,1,0.05);
		border-radius: 40rpx;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 50rpx 40rpx 42rpx;
		
		.title {
			font-size: 48rpx;
			font-family: Source Han Sans CN;
			font-weight: bold;
			color: #201F22;
			text-align: center;
		}
		
		.welcome {
			font-size: 24rpx;
			font-family: AlibabaPuHuiTi_2_55_Regular;
			font-weight: 400;
			color: #646367;
			text-align: center;
			margin-top: 36rpx;
			margin-bottom: 36rpx;
		}
		
		.form-box {
			position: relative;
			
			.vertify-code {
				
				image {
					width: 150rpx;
					height: 88rpx;
					margin-left: 38rpx;
					align-self: flex-end;
				}
			}
		}
		
		.login-btn {
			width: 257rpx;
			height: 54rpx;
			line-height: 54rpx;
			background: #6C63FF;
			border-radius: 10rpx;
			font-size: 22rpx;
			text-align: center;
			font-family: SourceHanSerifCN;
			color: #FFFFFF;
			margin-left: auto;
			margin-right: auto;
			margin-top: 50rpx;
			margin-bottom: 20rpx;
			letter-spacing: 4rpx;
		}
		
		.forget-pwd {
			font-size: 18rpx;
			font-family: Source Han Sans CN;
			color: #4C4B4B;
			text-align: center;
		}
	}
	
	.agreed {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
		
		.text-box {
			font-size: 24rpx;
			color: #333;
			
			.blue {
				color: #6C63FF;
			}
		}
	}
</style>