<template>
	<view class="" :style="[fixedStyle]">
		<view class="box-white" :style="{background:hasBg?'#fff':'none',boxShadow:hasBg?'':'none'}">
			<view class="app-title-box padding_l_r_30">
				<view class="app-class-title">我的应用</view>
				<view class="app-edit" @click="edidtMyApp">编辑</view>
			</view>
			<u-grid :border="false" col="5">
				<u-grid-item v-if="showScanCode && token" :customStyle="{marginBottom:'40rpx'}" @click="handlerScan">
					<u-icon name="scan" color="#18b566" size="28" />
					<text class="app-name grid-text">扫一扫</text>
				</u-grid-item>
				<u-grid-item 
					v-for="(item, index) in myAppList" 
					:key="item.id" 
					:customStyle="{
						marginBottom:'40rpx',
						display:gridItemFlag(index)?'none':'flex'
					}"
					@click="jumpApp(item)"
				>
					<image :src="item.logo" class="app-icon"></image>
					<text class="app-name grid-text">{{item.name}}</text>
				</u-grid-item>
				
				<u-grid-item 
					v-if="triggleBtnFlag()" 
					:customStyle="{marginBottom: '40rpx', marginLeft: 'auto'}" 
					@click="trigglePull"
				>
					<image src="@/static/imgs/pullDown.png" class="app-icon" :style="{display:triggleType=='down'?'flex':'none'}"></image>
					<image src="@/static/imgs/pullUp.png" class="app-icon" :style="{display:triggleType=='up'?'flex':'none'}"></image>
					<text class="app-name grid-text">{{btnTxt}}</text>
				</u-grid-item>
			</u-grid>
			<view class="empty" v-if="emptyFlag()" @click="edidtMyApp">暂无，请添加</view>
		</view>
	</view>
</template>

<script>
	// #ifdef H5
	import wx from 'jweixin-module'
	// #endif
	import { mapGetters} from 'vuex'
	import crypto from "@/utils/crypto";
	import { checkWxSdkApiSupport } from "@/utils/commom.js"
	import { GetRedirectUrl } from "@/api/ApiBase"
	import { ParseQrcode } from "@/api/ApiColumn"
	export default {
		name:"myappList",
		options: { styleIsolation: 'shared' },
		props: {
			myAppListInit: {
				type: Array,
				default: () => []
			},
			hasBg: {
				type: Boolean,
				default: false
			},
			fixedStyle: Object
		},
		data() {
			return {
				myAppList: [],
				triggleType: 'down',
				btnTxt: '展开'
			}
		},
		computed: {
			...mapGetters(['webAppConfig', 'token', 'userInfo', 'apiToken']),
			showScanCode() {
				return this.webAppConfig.showScanCode
			}
		},
		watch: {
			myAppListInit: {
				handler(val) {
					console.log(val,'---------------------------myapp')
					this.myAppList = val || []
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			gridItemFlag(index) {
				if(this.showScanCode) {
					return this.triggleType=='down'&&index>7&&this.myAppList.length>9?true:false
				} else {
					return this.triggleType=='down'&&index>8&&this.myAppList.length>10?true:false
				}
			},
			triggleBtnFlag() {
				if(this.showScanCode) {
					return this.myAppList.length>9?true:false
				} else {
					return this.myAppList.length>10?true:false
				}
			},
			emptyFlag() {
				if(!this.token) {
					return true
				} else if(!this.showScanCode && this.token) {
					return this.myAppList.length<1?true:false
				} else if(this.showScanCode && this.token) {
					return false
				}
			},
			// 扫一扫
			async handlerScan() {
				// #ifdef MP-WEIXIN
				uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode'],
					success: (res) => {
						this.$store.commit("user/SET_QRCODESTR", res.result);
						this.parseQrcode(res.result)
					},
					fail: (err) => {
						uni.showToast({
							icon: 'error',
							title: '扫码失败'
						})
					}
				});
				// #endif
				// #ifdef H5
				await this.$store.dispatch('base/getWxTiket')
				checkWxSdkApiSupport(["scanQRCode"]).then(res => {
					if(res.checkResult.scanQRCode) {
						wx.scanQRCode({
							needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
							scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有 ["qrCode","barCode"]
							success: (data) => {
								this.$store.commit("user/SET_QRCODESTR", data.resultStr);
								this.parseQrcode(data.resultStr);
							},
							fail: (err) => {
								alert(`扫一扫调用失败了 ${err.errMsg}`)
							}
						});
					}
				})
				// #endif
			},
			// 扫一扫解析
			async parseQrcode(QRcode) {
				uni.showLoading({
					mask: true,
					title: '扫码解析中...'
				})
				await this.$store.dispatch('user/getApiToken')
				const param = { 
					QRcode,
					InterfaceIdentityId: this.userInfo && this.userInfo.studentNumber,
					InterfaceIdentityIdType: 2,
					CampusId: this.webAppConfig.yunCampusId,
					StudentNumber: this.userInfo && this.userInfo.studentNumber,
					Sign: '0',
					Token: this.apiToken
				}
				await ParseQrcode({...param}).then(res => {
					if (res.isSuccess) {
						console.log(res.dataModel)
						this.$store.commit("user/SET_QRCODEDATA", JSON.parse(crypto.decrypted(res.dataModel)));
						uni.hideLoading()
						uni.navigateTo({
							url: '/pagesA/scanPay/scanPay'
						})
						console.log(JSON.parse(crypto.decrypted(res.dataModel)))
					} else {
						uni.hideLoading()
						uni.showToast({
							icon: 'error',
							title: res.message,
							duration: 2000
						})
					}
				}).catch(err => {
					uni.hideLoading()
					uni.showToast({
						icon: 'error',
						title: res.message
					})
				})
			},
			jumpApp(item) {
				console.log(item)
				GetRedirectUrl({applicationId: item.id}).then(res => {
					if(res.isSuccess) {
						const pathUrl = res.dataModel.linkUrl
						if(!!pathUrl.match(/\/pages./g)) {
							// 匹配到路径包含pages时跳转内部页面
							const newPath = pathUrl.substring(pathUrl.indexOf('#') + 1)
							console.log(newPath)
							uni.navigateTo({
								url: newPath
							})
							return
						}
						// #ifdef MP-WEIXIN
						uni.navigateTo({
							url: `/pagesA/webviewWrap/webviewWrap?urlPath=${encodeURIComponent(pathUrl)}`
						})
						// #endif
						// #ifdef H5
						location.href = pathUrl
						// #endif
					} else {
						uni.showToast({
							icon: 'none',
							title: res.message
						})
					}
				})
			},
			trigglePull(index) {
				switch(this.triggleType) {
					case 'down':
						this.triggleType = 'up',
						this.btnTxt = '收起'
					break;
					case 'up':
						this.triggleType = 'down',
						this.btnTxt = '展开'
					break;
				}
			},
			edidtMyApp() {
				const token = this.$db.get('token')
				if(!token) {
					uni.navigateTo({
						url: `/pages/login/login`
					})
					return
				}
				uni.navigateTo({
					url: '/pagesA/manageMyApp/manageMyApp'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
@import url('./style.css');
.box-white {
	position: relative;
	background: #fff;
	padding-top: 40rpx;
	padding-bottom: 30rpx;
	margin-bottom: 20rpx;
	margin: 0 30rpx;
	border-radius: 50rpx;
	box-shadow: 3rpx -3rpx 54rpx 0 rgba(6,0,1,0.05);
}
</style>