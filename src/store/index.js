import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

import user from "./modules/user"
import base from "./modules/base"
import theme from "./modules/theme"

import getters from './getters';

export default new Vuex.Store({
	getters,
	state: {},
	mutations: {},
	actions: {},
	modules: {
		user,
		base,
		theme
	},
	// #ifdef H5
	//创建持久化状态
	plugins: [createPersistedState({
		//存储位置，默认存储到localStorage
		storage: window.localStorage,
		//指定需要存储的模块
		paths: [
			'user', 
			'base', 
			'theme'
		],
	})],
	// #endif
})