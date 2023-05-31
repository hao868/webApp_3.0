import * as db from '@/utils/db.js'
export default {
	namespaced: true,
	state: {
		currentThemeIndex: db.get('themeIndex') || 0,
		skin: `
			--bg:#333333;
			--color:#333333;
			--nav-bg: #ffffff;
			--nav-color: #000000;
			--tabbar-act-color: #333333;
		`,
		cardBg: db.get('cardBg') || ''
	},
	mutations: {
		SET_THEME_INDEX(state, themeIndex) {
			state.currentThemeIndex = themeIndex
			db.set('themeIndex', themeIndex)
		},
		SKIN_PEELER(state, skin = []){
			// 将皮肤配置JSON转为以 ; 分割的字符串（style 值）
			let style = skin.map((item,index) => {
				return `${item.name}:${item.value}`
			}).join(";");
			state.skin = style;
		},
		SET_CARD_BG(state, bg) {
			state.cardBg = bg
			db.set('cardBg', bg)
		}
	},
	actions: {},
}