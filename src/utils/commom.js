/**
 * 公共方法 
*/
import Vue from 'vue'
import * as db from '@/utils/db.js'

// #ifdef H5

import wx from 'jweixin-module'

// sdk签名注入
export const wxSdkConfig = (data) => {
  const { appId, nonceStr, signature, timestamp } = data;
  wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId, // 必填，公众号的唯一标识
    timestamp, // 必填，生成签名的时间戳
    signature, // 必填，签名，见附录1
		nonceStr, // 必填，生成签名的随机串
    jsApiList: ["scanQRCode", "chooseImage", "downloadImage", "getLocalImgData", "updateAppMessageShareData"],
    openTagList: ['wx-open-launch-weapp']
  });
}

/**
 *
 * @param jsApiList { wx.JSApiList[] }  // 微信sdk api列表  如 "scanQRCode"
 * @returns { Promise<any> }
 */
export const checkWxSdkApiSupport = (jsApiList) => {
  return new Promise((resolve, reject) => {
    wx.ready(function() {
      wx.checkJsApi({
        //判断当前客户端版本是否支持指定JS接口
        jsApiList,
        success: function(res) {
          // 以键值对的形式返回，可用true，不可用false。如：{"checkResult":{"scanQRCode":true},"errMsg":"checkJsApi:ok"}
          if (res.errMsg !== "checkJsApi:ok") {
            alert("抱歉，当前客户端版本不支持扫一扫");
            return;
          }
          resolve(res);
        },
        fail: function(err) {
          //检测getNetworkType该功能失败时处理
          reject("checkJsApi error:" + err);
        },
      });
    });
  });
};
// #endif

// #ifdef MP-WEIXIN

// 微信小程序获取code
export const getWxCode = (scope = 'base') => {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			scopes: scope == 'base' ? 'auth_base' : 'auth_user',
			success: (res) => {
				resolve(res.code)
			},
			fail: (err) => {
				reject(err.errMsg)
			}
		})
	})
}

// #endif


// 自定义switchTab
export const customSwitchTab = (url) => {
	let _url = typeof url == 'object' ? url.url : url
	uni.switchTab({
		url: _url,
		success: res => {
			const tabbarList = db.get('cacheTabbar') || Vue.prototype.$tabbarList;
			let i = tabbarList.findIndex(v => v.path == _url);
			Vue.prototype.$store.commit('base/SET_ACTIVEINDEX', i)
		},
		fail: (err) => {
			console.error('switchTab error msg',err)
		}
	})
}