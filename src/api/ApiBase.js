/*
	平台基础接口
*/

import Request from '@/config/request'

//获取机构微信配置
export const GetMobileConfig = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetMobileConfig",
    method: "post",
    data,
		hideLoad: true
  });
};

//获取机构列表
export const GetMechanismListApi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetMechanismInfos",
    method: "post",
    data
  });
};

//获取站点信息
export const GetSitesListApi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetSitesInfos",
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取应用分类和应用列表
export const GetApplistApi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/ListApplicatonClassification",
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取应用跳转链接
export const GetRedirectUrl = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetApplicationRedirectUrl",
    method: "post",
    data
  });
};

// 获取 微信权限签名算法
export const GetWxtiket = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/GetWeChatJsdkSign',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取服务协议列表
export const ListViewInstructions = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/ListViewInstructions',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取首页轮播图
export const ListViewHomeViewConfig = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/ListViewHomeViewConfig',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取消息
export const ListNewsPage = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/ListNewsPage',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取消息详情
export const SelectNews = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/SelectNews',
    method: "post",
    data,
		hideLoad: true
  });
};

// 消息全部标记已读
export const MarkerNewsRead = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/MarkerNewsRead',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取我的页面配置
export const QueryMyViewConfig = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/QueryMyViewConfig',
    method: "post",
    data,
		hideLoad: true
  });
};

// 获取登录页配置
export const QueryLogOnViewConfig = (data = {}) => {
  return Request({
    url: '/ViewControllers/MobileView/QueryLogOnViewConfig',
    method: "post",
    data,
		hideLoad: true
  });
};