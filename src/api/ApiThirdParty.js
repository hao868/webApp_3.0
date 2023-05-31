/*
	第三方相关接口
*/

import Request from '@/config/request'

// 金智登录
export const LoginByJinZhi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/LoginByJinZhi",
    method: "post",
    data
  });
};

// 获取从金智跳转过来的应用链接
export const GetAppUrlFromJinZhi = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetAppUrlFromJinZhi",
    method: "post",
    data
  });
};

// 超级app登录
export const LoginBySuperApp = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/LoginBySuperApp",
    method: "post",
    data
  });
};

// 获取从超级app跳转过来的应用链接
export const GetAppUrlFromSuperApp = (data = {}) => {
  return Request({
    url: "/ViewControllers/MobileView/GetAppUrlFromSuperApp",
    method: "post",
    data
  });
};