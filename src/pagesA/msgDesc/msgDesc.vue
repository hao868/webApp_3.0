<template>
	<view class="box">
		<mp-html :content="content" :lazy-load="true" />
	</view>
</template>

<script>
	import { SelectNews } from '@/api/ApiBase.js'
	export default {
		data() {
			return {
				detail: {},
				content: ''
			};
		},
		onLoad(options) {
			uni.setNavigationBarTitle({
				title: options.title
			})
			this.getDetail(options.newsId)
		},
		methods: {
			getDetail(newsId) {
				uni.showLoading({
					title: '加载中...',
					mask:true
				})
				SelectNews({newsId}).then(res => {
					if(res.isSuccess) {
						this.detail = res.dataModel
						this.content = res.dataModel.content
					}
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		overflow: hidden;
	}
</style>
