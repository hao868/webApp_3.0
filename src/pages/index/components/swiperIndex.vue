<template>
	<u-swiper 
		:list="list" 
		keyName="pictureInfo" 
		circular 
		:radius="0" 
		imgMode="scaleToFill" 
		height="100%"
		@click="clickEvent"
	></u-swiper>
</template>

<script>
	export default {
		name: 'swiperIndex',
		props: {
			list: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				
			}
		},
		created() {},
		methods: {
			clickEvent(index) {
				const tabbarPathList = ['/pages/index/index', '/pages/msg/msg', '/pages/mine/mine']
				const obj = this.list[index]
				if(obj.jumpType === 1) {
					if(tabbarPathList.includes(obj.url)) {
						this.$customSwitchTab(obj.url)
					} else {
						uni.navigateTo({
							url: obj.url
						})
					}
				} else if(obj.jumpType === 2) {
					// #ifdef MP-WEIXIN
					uni.navigateTo({
						url: `/pagesA/webviewWrap/webviewWrap?urlPath=${obj.url}`
					})
					// #endif
					// #ifdef H5
					location.href = obj.url
					// #endif
				}
				
				
			}
		}
	}
</script>

<style>
</style>