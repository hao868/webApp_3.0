<template>
	<view :style="vskin" class="content" @click="() => showColorPicker = false">
		<view class="flex">
			<view class="label">选择主题：</view>
			<u-radio-group v-model="currentTheme" placement="row" size="20" labelSize="20">
				<u-radio 
					class="u-radio-item"
					v-for="(item, index) in themeList"
					:key="index" 
					:name="index"
					:inactiveColor="item.color"
					:activeColor="item.color" 
					:label="item.title" 
					:labelColor="item.color"
				></u-radio>
			</u-radio-group>
		</view>
		<view class="flex flex-y-center">
			<view class="label">卡片背景：</view>
			<view class="color-selected" :style="{background: cardBg}" @click.stop="() => showColorPicker = true">{{cardBg?'':'空'}}</view>
		</view>
		<button class="reset" @click="reset">重置所有</button>
		<zebra-color-picker v-show="showColorPicker" v-model="colors" width="600"></zebra-color-picker>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	import { themeList } from '@/constData/themeList'
	export default {
		data() {
			return {
				themeList,
				colors: {
					rgba: { 
						r: '', 
						g: '', 
						b: '', 
						a: '',
					},
				},
				showColorPicker: false
			};
		},
		watch: {
			cardBg:{
				immediate: true,
				handler(newval) {
					if(newval) {
						const rgbaValBefore = newval.substring(0, newval.length - 1)
						const rgbaValAfter = rgbaValBefore.substring(rgbaValBefore.indexOf("(")+1, rgbaValBefore.length)
						const rgbaValArr = rgbaValAfter.split(',')
						Object.keys(this.colors.rgba).forEach((key, i) => {
							this.$set(this.colors.rgba, key, Number(rgbaValArr[i]))
						})
					}
				}
			},
			'colors.rgba': {
				deep: true,
				handler(newval) {
					const RGBA = newval
					const bg = `rgba(${RGBA.r},${RGBA.g},${RGBA.b},${RGBA.a})`
					this.$store.commit('theme/SET_CARD_BG', bg)
				}
			}
		},
		computed: {
			...mapGetters(['cardBg']),
			currentTheme: {
				get: function() {
					return this.vthemeindex
				},
				set: function(newval) {
					this.vSetThemeStyle(this.themeList[newval].value)
					this.vSetThemeIndex(newval)
					this.setNavigateBarColor()
					uni.showToast({
						icon: 'loading',
						title: '主题生效中...',
						duration: 4000
					})
				}
			}
		},
		methods: {
			reset() {
				this.currentTheme = 0
				this.$store.commit('theme/SET_CARD_BG', '')
			}
		}
	}
</script>

<style lang="scss" scoped>
.content {
	width: 100%;
	box-sizing: border-box;
	padding: 30rpx;
	height: 100vh;
}

.flex {
	margin-bottom: 30rpx;
}

.label {
	color: #333333;
	font-size: 28rpx;
}

::v-deep .u-radio-group {
	justify-content: space-between !important;
}

.color-selected {
	width: 50rpx;
	height: 50rpx;
	border-radius: 6rpx;
	border: #eee solid 1rpx;
	font-size: 24rpx;
	text-align: center;
	line-height: 50rpx;
	color: #ccc;
}

.reset {
	margin-top: 80rpx;
	width: 50%;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	
}
</style>
