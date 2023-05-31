<template>
	<page-meta :page-style="'overflow:'+(visible?'hidden':'visible')"></page-meta>
	<view class="ubox" :style="vskin">
		<view class="head-box">
			<view class="switch-account" @click="open">切换账号</view>
			<u-avatar :src="userInfo.picture" size="60" v-if="userInfo.picture && userInfo.picture != null"></u-avatar>
			<u-avatar icon="account-fill" size="60" fontSize="38" v-else></u-avatar>
			<view class="user-nmae">姓名：{{userInfo.name}}</view>
		</view>
		<view class="flex-x-between row-box" v-for="(item, index) in userInfoList" :key="index" v-show="userInfo[item.value]">
			<text class="title">{{item.title}}</text>
			<text class="value">{{userInfo[item.value]?userInfo[item.value]:'-'}}</text>
		</view>
		<view class="flex-x-between row-box pointer" v-if="webAppConfig.loginType == 1" @click="jump('/pagesA/changePassword/changePassword')">
			<text class="title">修改登陆密码</text>
			<uni-icons type="right" size="14" color="#969799"></uni-icons>
		</view>
		<view class="flex-x-between row-box pointer" v-if="!webAppConfig.isAutoLogin" @click="jump('/pages/login/login')">
			<text class="title">绑定身份</text>
			<uni-icons type="right" size="14" color="#969799"></uni-icons>
		</view>
		<view class="unbind-btn" @click="unbind">解除绑定</view>
		
		<!-- 切换账号弹窗 -->
		<u-popup :show="visible" :round="10" :closeOnClickOverlay="false" mode="bottom" @close="close">
			<view class="btns-box">
				<view class="cancel" @click="close">取消</view>
				<view class="comfirm" @click="comfirm">确定</view>
			</view>
			<picker-view :indicator-style="indicatorStyle" :value="currentIndex" @change="e => tempIndex = e.detail.value" class="picker-view">
				<picker-view-column>
					<view class="item" v-for="(item,index) in accountsColumns" :key="index">{{item.text}}</view>
				</picker-view-column>
			</picker-view>
		</u-popup>
	</view>
</template>

<script>
	import { mapState, mapGetters } from 'vuex'
	import {UnboundUserOpenid, GetUserList, SwitchAccount, BindingUserOpenid} from "@/api/ApiUser";
	export default {
		data() {
			return {
				userInfoList: [
					{title: '性别',value: 'sexLabel'},
					{title: '手机号',value: 'mobileNumber'},
					{title: '电子邮箱',value: 'email'},
					{title: '住址',value: 'address'},
					{title: '生日',value: 'birthday'},
					{title: '籍贯',value: 'nativeName'},
					{title: '民族',value: 'nationName'},
					{title: '身份证号',value: 'idNmber'},
					{title: '出生地',value: 'birthplaceRegionName'},
					{title: '国籍',value: 'countryName'},
					{title: '政治面貌',value: 'politicsName'}
				],
				visible: false,
				accountsColumns: [],
				currentIndex: [0],
				tempIndex: [0],
				indicatorStyle: `height: 40px;`
			}
		},
		computed: {
			...mapGetters(['userInfo', 'webAppConfig']),
		},
		async created() {
			await this.$store.dispatch('user/checkToken')
			this.getUserList()
		},
		methods: {
			open() {
				if(!this.accountsColumns.length) {
					uni.showToast({
						icon: 'none',
						title: '当前没有其他身份可切换',
					})
					return
				}
				this.visible = true
			},
			comfirm() {
				this.currentIndex = this.tempIndex
				this.switchAccount()
			},
			close() {
				this.visible = false
				this.tempIndex = this.currentIndex
			},
			// 切换用户
			switchAccount() {
				const currentUser = this.accountsColumns[this.currentIndex[0]]
				const param = {
					mechanismId: currentUser.mechanismId,
					userId: currentUser.userInfoId
				}
				SwitchAccount(param).then(res => {
					if (res.isSuccess) {
						this.$store.commit('user/SET_TOKEN', res.dataModel.token)
						this.$store.commit('user/STE_USERINFO', res.dataModel.userInfo)
						this.close()
						this.bindingOpenid()
					}
				})
			},
			// 绑定用户的Openid
			bindingOpenid() {
				const openId = this.$db.get('openId')
				//  #ifdef H5
				const codeType = 1
				// #endif
				//  #ifdef MP-WEIXIN
				const codeType = 4
				// #endif
				BindingUserOpenid({openId, codeType})
			},
			// 获取当前openid下的用户列表
			getUserList() {
				const openId = this.$db.get('openId')
				//  #ifdef H5
				const codeType = 1
				// #endif
				//  #ifdef MP-WEIXIN
				const codeType = 4
				// #endif
				GetUserList({code: openId, codeType}).then(res => {
					if (res.isSuccess) {
						if (res.dataModel && res.dataModel.length) {
							const accounts = res.dataModel.map(v => {
								v.text = v.mechanismName + ' ' + v.userName
								return v
							})
							this.accountsColumns = accounts
							this.currentIndex = [res.dataModel.findIndex(v => v.userInfoId === this.userInfo.id)]
						}
					}
				})
			},
			jump(pageName) {
				uni.navigateTo({
					url: pageName
				})
			},
			unbind() {
				const _this = this
				uni.showModal({
					content: '确定解绑当前账号吗？',
					success: function (res) {
						if (res.confirm) {
							// #ifdef MP-WEIXIN
							const codeType = 4
							// #endif
							// #ifdef H5
							const codeType = 1
							// #endif
							const openId = _this.$db.get('openId')
							if(!openId) {
								uni.showToast({
									icon: 'none',
									title: 'openId为空，不可解绑'
								})
								return
							}
							UnboundUserOpenid({openId, codeType}).then(res => {
								_this.logout('','解绑成功')
							})
						}
					}
				});
			},
			async logout(e, tipsTitle = '退出成功！') {
				this.$store.dispatch('user/removeToken')
				uni.showToast({
					title: tipsTitle,
					icon: 'success',
					mask: true,
					success: () => {
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/login/login'
							})
							// this.$store.commit('base/SET_ACTIVEINDEX', 0)
						}, 1000)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ubox {
		padding-bottom: 40rpx;
	}
	.head-box {
		box-sizing: border-box;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--bg);
		color: #fff;
		flex-direction: column;
		padding: 80rpx 10%;
		
		.switch-account {
			font-size: 24rpx;
			text-align: right;
			width: 70%;
			margin-bottom: 10rpx;
			cursor: pointer;
		}
		
		.user-nmae {
			font-size: 28rpx;
			margin-top: 10rpx;
		}
	}
	
	.row-box {
		width: calc(100% - 52rpx);
		box-sizing: border-box;
		margin: 0 26rpx;
		padding: 16rpx 0;
		font-size: 28rpx;
		line-height: 48rpx;
		color: #323232;
		border-bottom: 1rpx solid #eee;
		
		.title {
			flex: 1;
		}
		
		.value {
			color: #969799;
			text-align: right;
			overflow: hidden;
			vertical-align: middle;
			word-wrap: break-word;
		}
		
		.pointer {
			cursor: pointer;
		}
	}
	
	.unbind-btn {
		width: 80%;
		background: var(--bg);
		border-radius: 50rpx;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		margin: 40rpx auto;
		color: #fff;
		font-size: 28rpx;
	}
	
	.picker-view {
		width: 100%;
		height: 500rpx;
	}
	
	.item {
		font-size: 28rpx;
		color: #666;
		height: 40px;
		line-height: 40px;
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