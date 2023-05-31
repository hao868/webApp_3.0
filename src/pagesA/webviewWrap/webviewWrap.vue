<template>
	<web-view :src="urlPath"></web-view>
</template>

<script>
	export default {
		data() {
			return {
				urlPath: ''
			}
		},
		onLoad(options) {
			console.log(decodeURIComponent(options.urlPath))
			this.urlPath = decodeURIComponent(options.urlPath)
		},
	}
</script>

<style>
</style>