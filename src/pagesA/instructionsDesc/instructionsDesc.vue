<template>
	<view class="u-content">
			<mp-html :content="content" :lazy-load="true" />
		</view>
</template>

<script>
	export default {
		data() {
			return {
				content: ''
			}
		},
		onLoad(options) {
			const param = JSON.parse(decodeURIComponent(options.item))
			uni.setNavigationBarTitle({
				title: param.title
			})
			this.content = param.content
		}
	}
</script>

<style>
	.u-content {
		padding: 24rpx;
	}
</style>