const getters = {
	webAppConfig: state => state.base.webAppConfig,
	mechanismList: state => state.base.mechanismList,
	sitesList: state => state.base.sitesList,
	myAppList: state => state.base.myAppList,
  appList: state => state.base.appList,
	vskin: state => state.theme.skin,
	vthemeindex: state => state.theme.currentThemeIndex,
	cardBg: state => state.theme.cardBg,
	userInfo: state => state.user.userInfo,
	token: state => state.user.token,
	activeIndex: state => state.base.activeIndex,
	apiToken: state => state.user.apiToken,
	walletList: state => state.user.walletList,
	searchHistory: state => state.base.searchHistory
};
export default getters;