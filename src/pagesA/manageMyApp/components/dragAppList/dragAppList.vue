<template>
	<!-- 
	 组件思路：
		利用touch事件返回坐标值，赋值滑动视图，得到滑动视图跟随鼠标的效果，视觉上达到拖拽。
	 -->
	<!-- 可移动区域容器 -->
	<movable-area class="movarea" ref="areaBox" id="areaBox">
		<!-- 这块只是循环出固定内容，监听其元素touch事件获取坐标 -->
		<view class="cus-grid">
			<view 
				class="cus-grid-item" 
				v-for="(appItem, index) in listData_c" 
				:key="index" 
				:id="'appLi' + index"
				:class="{select:hoverClass===('appLi'+index)}"
				@longpress="AppLi_touchstart($event, index, appItem)"
				@touchmove.stop.prevent="AppLi_touchmove" 
				@touchend="AppLi_touchend(index)"
			>
				<image :src="appItem.logo" class="app-icon"></image>
				<text class="app-name">{{appItem.name}}</text>
				<uni-icons type="minus-filled" color="#fa3534" size="16" class="remove-icon" @click="deleteAppItem(index)" />
			</view>
		</view>
		<!-- 滑块 -->
		<movable-view v-if="moviewShow" :animation="false" class="moveV" :x="moveX" :y="moveY" direction="all" :style="{ width: moveViewSize + 'px' }">
			<image :src="touchItem.logo" class="app-icon"></image>
			<text class="app-name">{{touchItem.name}}</text>
		</movable-view>
	</movable-area>
</template>

<script>
	export default {
		name: "dragAppList",
		props: {
			listData: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				listData_c: this.listData || [], //缓存props
				moviewShow: false,//滑块状态
				areaBoxInfo: null,//保存滑动区域盒子dom信息
				inBoxXY: {},//鼠标在item中的坐标
				touchIndex: 0, //被移动index
				touchItem: '',//备份被移动item数据
				moveX: 0,//相对滑动盒子的坐标
				moveY: 0,//相对滑动盒子的坐标
				hoverClass: '',
				hoverClassIndex: null, //最终index
			};
		},
		watch: {
			listData: {
				handler(val) {
					this.listData_c = val.map((v,i) => {
						return {...v, sort: i}
					})
					let t = setTimeout(() => {
						this.resetListDom()
						clearTimeout(t)
					}, 500)
				},
				deep: true
			}
		},
		computed:{
			moveViewSize(){
				if(this.areaBoxInfo && this.areaBoxInfo.width){
					return this.areaBoxInfo.width / 5
				}else{
					return 0
				}
			}
		},
		mounted() {
			// 获取dom信息
			this.resetListDom()
		},
		methods: {
			getDomInfo(id, callBack) {
				const query = uni.createSelectorQuery().in(this);
				query.select(id)
					.boundingClientRect()
					.exec(function(res) {
						callBack(res[0]);
					});
			},
			AppLi_touchstart(event, index, item) {
				// console.log(
				// 	'下标-----------', index,
				// 	'当前项目-------', this.listData_c[index],
				// 	'可移动区域-----', this.areaBoxInfo,
				// 	'触摸开始-----', event
				// )
				this.touchItem = this.listData_c[index];
				// 触感反馈（安卓上是150毫秒，ios无短触控反馈）
				uni.vibrateShort();
				
				// 拖动逻辑
				//显示可移动方块
				this.moviewShow = true
				//保存当前所选择的索引
				this.touchIndex = index;
				// 设置可移动方块的初始位置为当前所选中图片的位置坐标
				this.moveX = this.listData_c[index].x;
				this.moveY = this.listData_c[index].y;
				var x = event.changedTouches[0].clientX - this.areaBoxInfo.left;
				var y = event.changedTouches[0].clientY - this.areaBoxInfo.top;
				// 保存鼠标在图片内的坐标
				this.inBoxXY = {
					x: x - this.listData_c[index].x,
					y: y - this.listData_c[index].y,
				}
			},
			AppLi_touchmove(event) {
				// console.log('AppLi_touchmove',event)
				if(!this.moviewShow) return
				let areaBoxTop = this.areaBoxInfo.top;
				let areaBoxLeft = this.areaBoxInfo.left;
				// 重置为以拖拽盒子左上角为坐标原点
				let x = event.changedTouches[0].clientX - areaBoxLeft;
				let y = event.changedTouches[0].clientY - areaBoxTop;
				this.moveX = x - this.inBoxXY.x;
				this.moveY = y - this.inBoxXY.y;
			
				let setIng = false;
				this.listData_c.forEach((item, idx) => {
					if (x > item.x && x < item.x + 80 && y > item.y && y < item.y + 80) {
						this.hoverClass = 'appLi' + idx
						this.hoverClassIndex = idx;
						setIng = true
					}
				});
				// 都不存在代表脱离
				if (!setIng) {
					this.hoverClass = ""
					this.hoverClassIndex = null;
				}
			},
			AppLi_touchend(index) {
				// 移动结束隐藏可移动方块
				if (this.hoverClassIndex != null && this.touchIndex != this.hoverClassIndex) {
					this.$set(this.listData_c, this.touchIndex, this.listData_c[this.hoverClassIndex]);
					this.$set(this.listData_c, this.hoverClassIndex, this.touchItem);
					this.$emit("listChange", this.listData_c)
					this.$nextTick(() => {
						this.resetListDom()
					})
				}
				this.touchItem = ""
				this.moviewShow = false
				this.hoverClass = ""
				this.hoverClassIndex = null;
			},
			deleteAppItem(index) {
				this.listData_c.splice(index, 1)
				this.$emit("listChange", this.listData_c)
				this.$nextTick(() => {
					this.resetListDom()
				})
			},
			resetListDom() {
				let _this = this;
				this.getDomInfo('#areaBox', info => {
					_this.areaBoxInfo = info;
					// 设置区域内所有图片的左上角坐标
					_this.listData_c.forEach((item, idx) => {
						_this.getDomInfo(`#appLi${idx}`, res => {
							item.x = res.left - info.left;
							item.y = res.top - info.top;
						});
					});
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.movarea {
		width: 100%;
		height: auto;
	}

	.moveV {
		opacity: 0.8;
		z-index: 1;
		height: auto;
		box-sizing: border-box;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.select {
		border-radius: 16rpx;
		border: 1rpx dashed #C0C0C0;
		color: #C0C0C0;
	}
	
	.app-icon {
		width: 54rpx;
		height: 54rpx;
	}
	
	.remove-icon {
		position: absolute;
		top: -14rpx;
		right: 30rpx;
		z-index: 1;
	}
	
	.app-name {
		font-size: 24rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #0E254E;
		margin-top: 20rpx;
		width: 110rpx;
		height: 64rpx;
		text-align: center;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
	
	.app-class-title {
		font-size: 32rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #000000;
	}
	
	.empty {
		color: #999;
		font-size: 24rpx;
		text-align: center;
	}
	
	.cus-grid {
		justify-content: flex-start;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		overflow: visible;
		
		.cus-grid-item {
			align-items: center;
			justify-content: center;
			position: relative;
			flex-direction: column;
			box-sizing: border-box;
			display: flex;
			background: transparent;
			width: 20%;
			height: auto;
			margin-bottom: 20rpx;
		}
	}
</style>
