<template>
	<view>
		<view class="msg-item" v-for="(msg, index) in msgList" :key="index">
			<view class="msg-head">
				<view class="msg-badge" v-show="msg.status==0"></view>
				<view class="msg-type msg-type-public" v-if="msg.type == 1">公共</view>
				<view class="msg-type msg-type-self" v-if="msg.type == 2">我的</view>
				<view class="msg-title">{{msg.title}}</view>
				<view class="msg-time">{{msg.time}}</view>
			</view>
			<view class="msg-content">
				<!-- <u-parse :content="msg.content"></u-parse> -->
				<view class="msg-desc">{{msg.content.desc}}</view>
				<image v-if="msg.content.img" :src="msg.content.img" mode="widthFix"></image>
			</view>
			<view class="msg-btn" @click="toDesc(msg)">
				<view>查看详情</view>
				<uni-icons type="right" size="13" color="#888"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"msgList",
		props: {
			msgData: {
				type: Array,
				default: () => []
			}
		},
		watch: {
			msgData: {
				handler(val) {
					console.log(val)
					this.msgList = val
				},
				deep: true
			}
		},
		data() {
			return {
				msgList: this.msgData
			};
		},
		methods: {
			toDesc(item) {
				uni.navigateTo({
					url: `/pagesA/msgDesc/msgDesc?item=${JSON.stringify(item)}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.msg-item {
	background: #fff;
	// margin-bottom: 30rpx;
	margin: 0 30rpx 30rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	border-radius: 30rpx;
	
	.msg-head {
		position: relative;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		padding: 30rpx 50rpx 0;
		
		.msg-badge {
			position: absolute;
			left: 24rpx;
			width: 16rpx;
			height: 16rpx;
			border-radius: 50%;
			background: #f56c6c;
		}
		
		.msg-type {
			width: 60rpx;
			height: 32rpx;
			line-height: 32rpx;
			border-radius: 4rpx;
			// margin-left: 14rpx;
			margin-right: 14rpx;
			font-size: 22rpx;
			color: #FFFFFF;
			text-align: center;
		}
		
		.msg-type-public {
			background: #75BA5F;
		}
		
		.msg-type-self {
			background: #F19149;
		}
		
		.msg-title {
			font-size: 32rpx;
			color: #000000;
			flex: 1;
			margin-right: 10rpx;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
		
		.msg-time {
			font-size: 20rpx;
			color: #888888;
		}
	}
	
	.msg-content {
		border-top: 1rpx solid #eee;
		
		margin: 0 51rpx 30rpx;
		padding-top: 30rpx;
		font-size: 24rpx;
		color: #888888;
		line-height: 36rpx;
		
		.msg-desc {
			margin-bottom: 20rpx;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
		}
	}
	
	.msg-btn {
		margin: 0 51rpx 30rpx;
		border-top: 1rpx solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 26rpx;
		color: #333333;
		padding-top: 20rpx;
		padding-bottom: 30rpx;
	}
}
</style>