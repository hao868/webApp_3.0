import Vue from 'vue'
import App from './App'
import * as db from 'utils/db.js'
import store from './store'
import uView from '@/uni_modules/uview-ui'
import { tabbarList } from '@/constData/tabbar';
import { customSwitchTab } from '@/utils/commom';

Vue.use(uView)
// uni.$u.config.unit = 'rpx';

import themeMixin from '@/mixin/themeMixin'
Vue.use(themeMixin)

Vue.config.productionTip = false

Vue.prototype.$db = db
Vue.prototype.$store = store
Vue.prototype.$tabbarList = db.get('cacheTabbar') || tabbarList
Vue.prototype.$customSwitchTab = customSwitchTab

// #ifdef H5
import Bridge from './utils/bridge.js'
Vue.prototype.$bridge = Bridge
// #endif

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
