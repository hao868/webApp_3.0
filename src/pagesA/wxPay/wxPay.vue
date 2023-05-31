<template>
	<view></view>
</template>

<script>
export	default {
	data() {
		return {}
	},
	onLoad(options) {
		const payParamStr = decodeURIComponent(options.payParam);
		const payParamObj = JSON.parse(payParamStr)
		console.log(payParamObj)
		this.payment(payParamObj)
	},
	methods: {
		payment(param) {
			const _this = this
			uni.requestPayment({
			  provider: 'wxpay',
				timeStamp: param.timeStamp,
				nonceStr: param.nonceStr,
				package: param.package,
				signType: param.signType,
				paySign: param.paySign,
				success: res => {
					console.log('success:' + JSON.stringify(res));
					uni.showModal({
						title: '支付通知',
						content: '充值成功',
						showCancel: false,
						success: function (res) {
							if (res.confirm) {
								uni.navigateBack({
									delta: 2
								})
							}
						}
					});
				},
				fail: err => {
					console.log('fail:' + JSON.stringify(err));
					uni.showModal({
						title: '支付通知',
						content: '充值失败',
						showCancel: false,
						success: function (res) {
							if (res.confirm) {
								uni.navigateBack({
									delta: 2
								})
							}
						}
					});
				}
			});
		}
	}
}
</script>

<style>
</style>