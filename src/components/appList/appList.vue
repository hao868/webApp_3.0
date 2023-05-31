<template>
	<view class="">
		<view class="box-white" v-for="(classItem, index) in myAppList" :key="classItem.id" :style="{background:hasBg?'#fff':'none'}">
			<view class="app-title-box padding_l_r_30">
				<view class="app-class-title">{{classItem.name}}</view>
				<!-- <view class="app-edit" v-if="index === 0">编辑</view> -->
			</view>
			<u-grid :border="false" col="5" customStyle="overflow: visible">
				<u-grid-item 
					v-for="(item, i) in classItem.appList" 
					:key="item.id" 
					:customStyle="{
						marginBottom:'40rpx',
						display:classItem.triggleType == 'down'&& i > 8 && classItem.appList.length > 10 && !isEdit?'none':'flex'
					}"
					@click="jumpApp(item)"
				>
					<image :src="item.logo" class="app-icon"></image>
					<text class="app-name grid-text">{{item.name}}</text>
					<uni-icons v-if="isEdit" type="plus-filled" color="var(--bg)" size="16" class="add-icon" @click="addMyApp(item)" />
				</u-grid-item>
				
				<u-grid-item 
					v-if="classItem.appList.length > 10 && !isEdit" 
					:customStyle="{marginBottom: '40rpx', marginLeft: 'auto'}" 
					@click="trigglePull(index, classItem.triggleType)"
				>
					<image src="@/static/imgs/pullDown.png" class="app-icon" :style="{display:classItem.triggleType=='down'?'flex':'none'}"></image>
					<image src="@/static/imgs/pullUp.png" class="app-icon" :style="{display:classItem.triggleType=='up'?'flex':'none'}"></image>
					<text class="app-name grid-text">{{classItem.btnTxt}}</text>
				</u-grid-item>
			</u-grid>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import {GetRedirectUrl} from "@/api/ApiBase"
	export default {
		name:"appList",
		props: {
			appList: {
				type: Array,
				default: () => []
			},
			myApp: {
				type: Array,
				default: () => []
			},
			// 是否有背景
			hasBg: {
				type: Boolean,
				default: false
			},
			// 是否是编辑状态
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				myAppList: []
			}
		},
		computed: {
			...mapGetters(['token']),
		},
		watch: {
			appList: {
				handler(val) {
					console.log(val,'---------------------------app')
					this.myAppList = val.map((v,i) => {
						return {
							...v,
							triggleType: 'down',
							btnTxt: '展开'
						}
					}) || []
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			jumpApp(item) {
				console.log(item)
				if(this.isEdit) return;
				
				if(!this.token && item.isVerify) {
					uni.showToast({
						icon: 'none',
						title: '请登录后使用此应用'
					})
					return
				}
				
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
			addMyApp(item) {
				if(this.myApp.some(v => v.id == item.id)) {
					uni.showToast({
						icon: 'none',
						title: '请勿重复添加'
					})
					return
				}
				this.$emit('addMyApp', item)
			},
			trigglePull(index, type) {
				switch(type) {
					case 'down':
						this.$set(this.myAppList, index, {
							...this.myAppList[index],
							triggleType: 'up',
							btnTxt: '收起'
						})
					break;
					case 'up':
						this.$set(this.myAppList, index, {
							...this.myAppList[index],
							triggleType: 'down',
							btnTxt: '展开'
						})
					break;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
@import url('./style.css');
</style>