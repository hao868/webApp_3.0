<template>
	<view class="outside-box" :style="vskin">
		<movable-area class="tabbarMovearea" ref="tabbarAreaBox" id="tabbarAreaBox">
			<view class="custom-tabbar">
				<view class="tab-item" 
					v-for="(item, index) in tabbarList" 
					:key="index" 
					:id="'tabbarItem' + index"
					:class="{select:hoverClass===('tabbarItem'+index)}"
					@longpress="Tabbar_longPress($event, index)"
					@touchmove.stop.prevent="Tabbar_touchmove" 
					@touchend="Tabbar_touchend(index)"
				>
					<view class="tab-content" @click.stop="changeTab(index)">
						<u-icon
							:name="item.icon"
							:color="activeIndex === index ? activeColor : inactiveColor"
							:size="20"
						></u-icon>
						<u-badge
							absolute
							:offset="[0, item.dot ? '34rpx' : item.badge > 9 ? '14rpx' : '20rpx']"
							:customStyle="badgeStyle"
							:isDot="item.dot"
							:value="item.badge || (item.dot ? 1 : null)"
							:show="item.dot || item.badge > 0"
						></u-badge>
						<text :style="{color: activeIndex === index ? activeColor : ''}">{{item.name}}</text>
					</view>
				</view>
			</view>
			<!-- 滑块 -->
			<movable-view v-if="moviewShow" :animation="false" class="moveV" :x="moveX" direction="horizontal" :style="{ width: moveViewSize + 'px' }">
				<u-icon :name="touchItem.icon" :size="20" />
				<text>{{touchItem.name}}</text>
			</movable-view>
		</movable-area>
		<u-safe-bottom ></u-safe-bottom>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
	export default {
		name:"drapTabbar",
		props: {
			active: {
				type: Number,
				default: 0
			},
			inactiveColor: {
				type: String,
				default: ''
			},
			activeColor: {
				type: String,
				default: ''
			},
			badgeStyle: {
				type: [Object, String],
				default: uni.$u.props.tabbarItem.badgeStyle
			}
		},
		data() {
			return {
				flag: true,
				tabbarList: this.$db.get('cacheTabbar') || this.$tabbarList,
				areaBoxInfo: null,//保存滑动区域盒子dom信息
				inBoxX: null,//鼠标在item中的坐标
				touchIndex: 0, //被移动index
				touchItem: '',//备份被移动item数据
				moviewShow: false,
				moveX: 0,//相对滑动盒子的坐标
				hoverClass: '',
				hoverClassIndex: null, //最终index
			};
		},
		watch: {
			activeIndex: {
				immediate: true,
				handler(val) {
					uni.switchTab({
						url: this.tabbarList[val].path
					})
				}
			}
		},
		computed:{
			...mapGetters(['activeIndex']),
			moveViewSize(){
				if(this.areaBoxInfo && this.areaBoxInfo.width){
					return this.areaBoxInfo.width / 3
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
			Tabbar_longPress(event, index) {
				console.log(index)
				// this.$emit('longPress', event, index)
				// this.$store.commit('base/SET_ACTIVEINDEX', index)
				this.touchItem = this.tabbarList[index];
				// 触感反馈（安卓上是150毫秒，ios无短触控反馈）
				uni.vibrateShort();
				
				// 拖动逻辑
				//显示可移动方块
				this.moviewShow = true
				//保存当前所选择的索引
				this.touchIndex = index;
				// 设置可移动方块的初始位置为当前所选中图片的位置坐标
				this.moveX = this.tabbarList[index].x;
				let x = event.changedTouches[0].clientX - this.areaBoxInfo.left;
				// 保存鼠标在图片内的坐标
				this.inBoxX = x - this.moveX
			},
			Tabbar_touchmove(event) {
				// console.log('AppLi_touchmove',event)
				if(!this.moviewShow) return
				let areaBoxTop = this.areaBoxInfo.top;
				let areaBoxLeft = this.areaBoxInfo.left;
				// 重置为以拖拽盒子左上角为坐标原点
				let x = event.changedTouches[0].clientX - areaBoxLeft;
				this.moveX = x - this.inBoxX;
							
				let setIng = false;
				this.tabbarList.forEach((item, idx) => {
					if(x > item.x && x < item.x + 120) {
						this.hoverClass = 'tabbarItem' + idx
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
			Tabbar_touchend(index) {
				// 移动结束隐藏可移动方块
				if (this.hoverClassIndex != null && this.touchIndex != this.hoverClassIndex) {
					this.$set(this.tabbarList, this.touchIndex, this.tabbarList[this.hoverClassIndex]);
					this.$set(this.tabbarList, this.hoverClassIndex, this.touchItem);
					
					if(this.activeIndex === this.touchIndex) {
						this.$store.commit('base/SET_ACTIVEINDEX', this.hoverClassIndex)
					} else if(this.hoverClassIndex === this.activeIndex) {
						this.$store.commit('base/SET_ACTIVEINDEX', this.touchIndex)
					}
					this.$db.set('cacheTabbar', this.tabbarList)
					
					this.$nextTick(() => {
						this.resetListDom()
					})
					
					console.log(this.tabbarList, 'activeIndex-', this.activeIndex, 'touchIndex-',this.touchIndex, 'hoverClassIndex-', this.hoverClassIndex)
				}
				this.touchItem = ""
				this.moviewShow = false
				this.hoverClass = ""
				this.hoverClassIndex = null;
			},
			changeTab(index) {
				this.$emit('changeTab', index)
				this.$customSwitchTab(this.tabbarList[index].path)
			},
			getDomInfo(id, callBack) {
				const query = uni.createSelectorQuery().in(this);
				query.select(id)
					.boundingClientRect()
					.exec(function(res) {
						callBack(res[0]);
					});
			},
			resetListDom() {
				let _this = this;
				this.getDomInfo('#tabbarAreaBox', info => {
					console.log('可移动区域dom信息', info)
					_this.areaBoxInfo = info;
					// 设置区域内所有图片的左上角坐标
					_this.tabbarList.forEach((item, idx) => {
						_this.getDomInfo(`#tabbarItem${idx}`, res => {
							console.log('每一项dom信息---', idx, res)
							item.x = res.left - info.left;
						});
					});
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.tabbarMovearea {
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
	.outside-box {
		position: fixed;
		bottom: 0;
		width: 100vw;
		background-color: #fff;
		box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
	}

	.custom-tabbar {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 10rpx;
		box-sizing: border-box;
		// background-color: #fff;
		// box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: 28rpx;
		color: #B6B6B6;
		cursor: pointer;
		transition: color 0.3s;
	}
	
	.tab-content {
		position: relative;
		width: 62%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.tab-item.active {
		color: var(--tabbar-act-color);
	}
</style>