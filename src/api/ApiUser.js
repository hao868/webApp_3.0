/*
	平台用户相关接口
*/

import Request from '@/config/request'

// 获取验证码
export const GetMobileVerifyCode = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetMobileVerifyCode",
    method: "post",
    data,
		hideLoad: true
  });
};

// 手机登录
export const LoginByMobile = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/LoginByMobile",
    method: "post",
    data,
		hideLoad: true
  });
};

// 用户登录
export const UserLogin = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/UserLogin",
    method: "post",
    data,
		hideLoad: true
  });
};

// 退出登录
export const UserLogout = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/UserLogout",
    method: "post",
    data,
		hideLoad: true
  });
};

// 更新密码
export const ChangeUserPassword = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/ChangeUserPassword",
    method: "post",
    data,
		hideLoad: true
  });
};

// 验证用户Token
export const VerifyUserToken = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/VerifyUserToken",
    method: "post",
    data,
		hideLoad: true
  });
};

// 更新用户Token
export const UpdateUserToken = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/UpdateUserToken",
    method: "post",
    data,
		hideLoad: true
  });
};

// 绑定用户的Openid
export const BindingUserOpenid = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/BindingUserOpenid",
    method: "post",
    data,
		hideLoad: true
  });
};

// 解绑用户的Openid
export const UnboundUserOpenid = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/UnboundUserOpenid",
    method: "post",
    data,
		hideLoad: true
  });
};

//获取微信OpenId
export const GetWchatOpenIdApi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetWchatOpenId",
    method: "post",
    data,
		hideLoad: true
  });
};

// 查找用户绑定过的账号信息-微信授权登录
export const LoginByWeixin = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetLatestBindingUserByOpenId",
    method: "post",
    data,
		hideLoad: true
  });
};

//获取授权地址
export const GetAuthorizeUrl = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetAuthorizeUrl",
    method: "post",
    data,
		hideLoad: true
  });
};

// 通过OpenId获取用户列表
export const GetUserList = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetUserListByOpenId",
    method: "post",
    data,
  });
};

//切换账号
export const SwitchAccount = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/SwitchAccount",
    method: "post",
    data,
  });
};

// 身份码
export const GetQRCodeInfoByToken = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetQRCodeInfoByToken",
    method: "post",
    data
  });
};

// 通过验证码获取用户信息
export const GetUserInfoByYzm = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetUserInfoByYzm",
    method: "post",
    data,
  });
};

// 保存我的应用
export const SaveConvenientApplication = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/SaveConvenientApplication",
    method: "post",
    data,
  });
};

// 获取卡包列表
export const ListViewCardWallet = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/ListViewCardWallet",
    method: "post",
    data,
  });
};

// 获取我的图表列表
export const ListViewMyChart = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/ListViewMyChart",
    method: "post",
    data,
  });
};

// 获取图表数据
export const GetChartsData = (data = {}) => {
	return Request({
		url: "/ViewControllers/MobileView/GetChartData",
		method: 'post',
		data,
		hideLoad: true
	})
}