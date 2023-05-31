<template>
	<view class="box" :style="vskin">
		<view class="flex form-item">
			<view class="label">原密码：</view>
			<uni-easyinput type="password" v-model="formData.oldPwd" trim="all" />
		</view>
		<view class="flex form-item">
			<view class="label">新密码：</view>
			<uni-easyinput type="password" v-model="formData.newPwd" trim="all" />
		</view>
		<view class="flex form-item">
			<view class="label">确认密码：</view>
			<uni-easyinput type="password" v-model="formData.reNewPwd" trim="all" />
		</view>
		
		<button 
			type="primary" 
			:loading="loading" 
			class="comfirm-btn" 
			:class="disabled?'comfirm-disabled':'comfirm-main'" 
			:disabled="disabled" 
			@click="comfirm"
		>确 定</button>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { ChangeUserPassword } from "@/api/ApiUser"
	export default {
		data() {
			return {
				formData: {
					oldPwd: '',
					newPwd: '',
					reNewPwd: ''
				},
				disabled: true,
				loading: false
			}
		},
		computed: {
			...mapGetters(['token']),
		},
		watch: {
			formData: {
				handler(val) {
					if(val.oldPwd && val.newPwd && val.reNewPwd) {
						this.disabled = false
					} else {
						this.disabled = true
					}
				},
				deep: true
			}
		},
		methods: {
			comfirm() {
				if(this.formData.oldPwd.length < 6) {
					uni.showToast({
						icon:"none",
						title: '密码不能小于6位'
					})
					return
				} else if(this.formData.newPwd.length < 6) {
					uni.showToast({
						icon:"none",
						title: '密码不能小于6位'
					})
					return
				} else if(this.formData.reNewPwd !== this.formData.newPwd) {
					uni.showToast({
						icon:"none",
						title: '两次输入的密码不一致'
					})
					return
				} else {
					this.loading = true
					this.disabled = true
					ChangeUserPassword({
						id: this.$db.get('userInfo').id,
						oldPassword: this.formData.oldPwd,
						password: this.formData.newPwd
					}).then( res => {
						uni.showToast({
							title: '修改成功',
							icon: 'success',
							mask: true,
							success: () => {
								setTimeout(() => {
									this.$store.dispatch('user/removeToken')
									this.$store.commit('base/SET_MYAPPLIST', '');
									this.$customSwitchTab('/pages/index/index')
								}, 1000)
							}
						})
					}).catch(err => {
						this.loading = false
						this.disabled = false
						uni.showToast({
							icon: 'none',
							title: err.data.message,
							duration: 2000
						})
					})
				}
				
			},
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
	
	.form-item {
		margin-bottom: 30rpx;
		color: #333;
		font-size: 28rpx;
		align-items: center;
	}
	
	.comfirm-btn {
		width: 326rpx;
		height: 66rpx;
		line-height: 66rpx;
		border-radius: 30rpx;
		font-size: 32rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #FFFFFF;
		text-align: center;
		margin-top: 100rpx;
		margin-left: auto;
		margin-right: auto;
		border: none;
		
		&::after {
			border: none;
		}
	}
	
	.comfirm-main {
		background: var(--bg) !important;
	}
	
	.comfirm-disabled {
		background: var(--bg) !important;
		opacity: 0.5;
	}
</style>
