<template>
	<view class="code-wrap">
		<view class="code-copy">
			<view class="item" :class="pw.length < 1 ? 'active' : ''">
				{{ pw.length > 0 ? "*" : "" }}
			</view>
			<view class="item" :class="pw.length === 1 ? 'active' : ''">
				{{ pw.length > 1 ? "*" : "" }}
			</view>
			<view class="item" :class="pw.length === 2 ? 'active' : ''">
				{{ pw.length > 2 ? "*" : "" }}
			</view>
			<view class="item" :class="pw.length === 3 ? 'active' : ''">
				{{ pw.length > 3 ? "*" : "" }}
			</view>
			<view class="item" :class="pw.length === 4 ? 'active' : ''">
				{{ pw.length > 4 ? "*" : "" }}
			</view>
			<view class="item" :class="[pw.length > 4 ? 'active' : '', pw.length > 5 ? 'is-last-item' : '']">
				{{ pw.length > 5 ? "*" : "" }}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			value: [String, Number]
		},
		data() {
			return {
				pw: ''
			}
		},
		watch: {
			value: {
				handler(val) {
					if(val.length <= 6) {
						this.pw = val
					}
				},
				immediate: true
			}
		},
	}
</script>

<style lang="scss" scoped>
// 模仿光标
.code-wrap {
  overflow: hidden;
  position: relative;
  margin-top: 40rpx;
  margin-bottom: 30rpx;
}

.code-copy {
  height: 70rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
	
	.item {
		display: flex;
		// align-items: center;
		justify-content: center;
		text-align: center;
		color: #000;
		box-sizing: border-box;
		width: 70rpx;
		height: 70rpx;
		line-height: 94rpx;
		border: 1rpx solid #ddd;
		border-radius: 4rpx;
		position: relative;
		font-size: 80rpx;
		margin-right: 15rpx;
		&:last-child {
		  margin-right: 0;
		}
	}
	
  .active {
    border: solid 1rpx #1989fa;
    box-shadow: 0 0 3rpx #1989fa;
  }
  /*模仿光标的样子*/
  .active::after {
    content: "";
    display: block;
    width: 1rpx;
    height: 40rpx;
    margin-top: 14rpx;
    animation: blink 1s infinite steps(1, start);
  }
  // 最后一个的时候
  .is-last-item {
    border: 1rpx solid #ddd;
    box-shadow: none;
    &::after {
      display: none;
    }
  }
}

@keyframes blink {
  0% {
    background-color: white;
  }
  50% {
    background-color: black;
  }
  100% {
    background-color: white;
  }
}
</style>