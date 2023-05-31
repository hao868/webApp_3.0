<template>
	<view class="box" :style="vskin">
		<view class="setting-item" v-for="(item, index) in settingList" :key="index" @click="handleSetting(item)">
			<template v-if="item.name !== '切换站点'">
				<view class="setting-left">
					<image :src="'../../static/setting/icon_' + item.icon + '.png'" mode="widthFix"></image>
					<view >{{item.name}}</view>
				</view>
				<uni-icons type="forward" size="22" color="#ccc"></uni-icons>
			</template>
			<template v-if="item.name == '切换站点'">
				<picker @change="bindPickerChange" :value="defaultIndex" :range="sitesList" range-key="siteName" style="width: 100%;">
					<view class="picker-box">
						<view class="setting-left">
							<image :src="'../../static/setting/icon_' + item.icon + '.png'" mode="widthFix"></image>
							<view>{{item.name}}</view>
						</view>
						<uni-icons type="forward" size="22" color="#ccc"></uni-icons>
					</view>
				</picker>
			</template>
		</view>
		
		<view class="logout-btn" @click="logout">退出登录</view>
		
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import {UnboundUserOpenid} from "@/api/ApiUser";
	export default {
		data() {
			return {
				settingList: [
					{ name: '修改密码', icon: 'edit_pwd' },
					{ name: '卡包', icon: 'card' },
					{ name: '绑定身份', icon: 'bind' },
					{ name: '解除绑定', icon: 'unbind' },
					{ name: '切换站点', icon: 'switch' },
					{ name: '主题', icon: 'theme' }
				],
				defaultIndex: 0,
			};
		},
		computed: {
			...mapGetters(['token', 'sitesList']),
		},
		onLoad() {
			const currentSite = this.$db.get('currentSite')
			const i = this.sitesList.findIndex(v => { return v.id == currentSite.id })
			this.defaultIndex = i
		},
		methods: {
			handleSetting(item) {
				switch(item.icon) {
					case 'theme':
						uni.navigateTo({
							url: "/pagesA/theme/theme"
						})
						break;
					case 'edit_pwd':
						uni.navigateTo({
							url: "/pagesA/changePassword/changePassword"
						})
						break;
					case 'card':
						uni.navigateTo({
							url: "/pagesA/cardBag/cardBag"
						})
						break;
					case 'bind':
						uni.navigateTo({
							url: "/pages/login/login"
						})
						break;
					case 'unbind':
						const _this = this
						uni.showModal({
							content: '确定解绑当前账号吗？',
							success: function (res) {
								if (res.confirm) {
									const openId = _this.$db.get('openId')
									// #ifdef MP-WEIXIN
									const codeType = 4
									// #endif
									// #ifdef H5
									const codeType = 1
									// #endif
									if(!openId) {
										uni.showToast({
											icon: 'none',
											title: 'openId为空，不可解绑'
										})
										return
									}
									UnboundUserOpenid({openId, codeType}).then(res => {
										_this.logout('','解绑成功')
										// _this.$store.commit('user/SET_OPENID', '')
									})
								}
							}
						});
						break;
				}
			},
			async bindPickerChange(e) {
				const i = parseInt(e.detail.value)
				console.log(e,'picker发送选择改变，携带值为', i)
				this.defaultIndex = i
				this.$store.commit("base/SET_CURRENTSITE", this.sitesList[i])
				this.$store.commit('base/SET_MYAPPLIST', []);
				await this.$store.dispatch('base/getApplist', this.sitesList[i].id)
				this.$customSwitchTab('/pages/index/index')
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
	page {
		overflow: hidden;
	}
	
	.box {
		margin: 30rpx;
	}
	
	.picker-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #f2f3f2;
		
		&:first-of-type {
			padding-top: 0;
		}
		
		.setting-left {
			display: flex;
			align-items: center;
			font-size: 32rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #524F4F;
			
			image {
				width: 42rpx;
				height: 42rpx;
				margin-right: 20rpx;
			}
		}
	}
	
	.logout-btn {
		width: 326rpx;
		height: 66rpx;
		line-height: 66rpx;
		background: var(--bg);
		border-radius: 20rpx;
		font-size: 32rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #FFFFFF;
		text-align: center;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
	}
</style>
