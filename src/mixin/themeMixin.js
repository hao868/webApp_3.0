import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { themeList } from '@/constData/themeList'
import Vue from 'vue'
export default {
	install(Vue) {
		Vue.mixin({
			data() {
				return {}
			},
			computed: {
				...mapGetters(['vthemeindex', 'vskin'])
			},
			onReady() {},
			onShow() {
				this.setNavigateBarColor()
				// this.$nextTick(() => {
				// 	const pages = getCurrentPages()
				// 	const page = pages[pages.length - 1]
				// 	const whitePath = ['pages/index/index', 'pages/msg/msg', 'pages/mine/mine']
				// 	if(whitePath.includes(page?.route)) {
				// 		this.setTabBarStyle()
				// 	}
				// })
			},
			methods: {
				...mapMutations({
					vSetThemeStyle: 'theme/SKIN_PEELER',
					vSetThemeIndex: 'theme/SET_THEME_INDEX'
				}),
				// 设置状态栏样式
				setNavigateBarColor() {
					const obj = {}
					themeList[this.vthemeindex].value.forEach((v,i) => {
						obj[v.name] = v.value
					})
					uni.setNavigationBarColor({
						frontColor: obj['--nav-color'],
						backgroundColor: obj['--nav-bg'],
						animation: {
							duration: 400,
							timingFunc: 'easeIn'
						}
					})
				},
				// 动态设置tabar样式
				setTabBarStyle() {
					const obj = {}
					themeList[this.vthemeindex].value.forEach((v,i) => {
						obj[v.name] = v.value
					})
					uni.setTabBarStyle({
					  color: obj['--color'],
					  selectedColor: obj['--tabbar-act-color']
					})
				}
			}
		})
	}
}
