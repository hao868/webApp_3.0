/**
 * 工具函数
 */

// #ifdef H5
/**
 * [通过参数名获取url中的参数值]
 * 示例URL:http://alipay.weixin.baidu/getrequest.html?uid=admin&rid=1&fid=2&name=小明
 * @param  {[string]} queryName [参数名]
 * @return {[string]}           [参数值]
 */
export const getQueryValue = (queryName) => {
  const reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)", "i");
  const result = window.location.search.substr(1).match(reg);
  if (result != null) {
    return decodeURI(result[2]);
  }
  return null;
}

/**  
 * 根据参数名 获取 URL 路径中的参数  
 * @param {String} name 要读取的参数名称  
 */  
export const getUrlParam = (name) => {   
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')  
  let url = window.location.href.split('#')[0]   
  let search = url.split('?')[1]  
  if (search) {  
    var r = search.substr(0).match(reg)  
    if (r !== null) return unescape(r[2])  
    return null  
  } else {  
    return null  
  }  
} 

/**
 * 获取url参数
 *
 * @param {*} name
 * @param {*} [url=window.location.serach]
 * @returns
 */
export const getQueryString = (name, url) => {
	var url = url || window.location.href
	var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
	var r = url.substr(1).match(reg)
	if (r != null) {
		return r[2]
	}
	return null
}

// 删除指定 字符串export
export const deleteParams = (name) => {
  const loca = window.location;
  const baseUrl = loca.origin + loca.pathname + "?";
  const query = loca.search.substr(1);
  if (query.indexOf(name) > -1) {
    const obj = {};
    const arr = query.split("&");
    for (let i = 0; i < arr.length; i++) {
      let strm = [];
      strm = arr[i].split("=");
      obj[strm[0]] = strm[1];
    }
    delete obj[name];
    const url =
      baseUrl +
      JSON.stringify(obj)
        .replace(/[\"\{\}]/g, "")
        .replace(/\:/g, "=")
        .replace(/\,/g, "&");
    return url;
  }
}

/**
 *
 *  判断是否在微信浏览器 true是
 */
export const isWeiXinBrowser = () => {
	// window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
	const ua = window.navigator.userAgent.toLowerCase()
	// 通过正则表达式匹配ua中是否含有MicroMessenger字符串
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true
	} else {
		return false
	}
}

/**
 * 获取当前是在哪个浏览器打开  微信/支付宝
*/
export const browserType = () => {
	const ua = window.navigator.userAgent.toLowerCase()
	console.log(window.navigator.userAgent)
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return 'wx'
	} else if (ua.match(/Alipay/i) == 'alipay') {
		return 'alipay'
	} else {
		return 'other'
	}
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

// #endif

/**
 * 时间戳转时间格式
 * @date 时间戳、世界时
 */
export const timestampToDateTime = (date, flag = false) => {
	var date = new Date(date) //如果date为13位不需要乘1000
	var Y = date.getFullYear() + '/'
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
	var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
	var F = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
	var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
	var m =
		(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
	var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
	if (flag) {
		return Y + M + F
	} else {
		return Y + M + D + h + m + s
	}
}

/**
 * 时间戳转日期格式
 * @date 时间戳、世界时
 */
export const timeToDate = date => {
	var date = new Date(date) //如果date为13位不需要乘1000
	var Y = date.getFullYear() + '/'
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
	var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
	return Y + M + D
}

/**
 * 计算某个时间到当前时间的时间差
 * @param {[String, Number]} startTime 时间戳
 */
export const diffTimer = (startTime) => {
  let createTime = new Date(startTime);
  let current = new Date();
  let diff = current.getTime() - createTime.getTime(); //时间差的毫秒数
  let minutes = Math.floor(diff / (60 * 1000) % 60);
  let hour = Math.floor(diff / (60 * 60 * 1000));
  let second = Math.floor(diff / 1000 % 60);
  // console.log(hour, minutes, second)
  let diffTimes = ""
  hour = 23 - hour;
  minutes = 59 - minutes;
  // console.log(minutes)
  if (hour < 0 || minutes < 0 || second < 0) {
    diffTimes = '00小时00分钟00秒';
  } else if (hour == 0 && minutes == 0) {
    // let second = 60 - Math.floor(diff / 1000 % 60);
    diffTimes = second + '秒'
  } else {
    // let second = 60 - Math.floor(diff / 1000 % 60);
    diffTimes = hour + "小时" + minutes + "分钟" + (60 - second) + "秒"; //hour+ "小时"
  }
  return diffTimes
}


let now = new Date(); //当前日期
let nowDayOfWeek = now.getDay(); //今天本周的第几天
let nowDay = now.getDate(); //当前日
let nowMonth = now.getMonth(); //当前月
let nowYear = now.getYear(); //当前年
nowYear += (nowYear < 2000) ? 1900 : 0; //
let lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
let lastYear = lastMonthDate.getYear();
let lastMonth = lastMonthDate.getMonth();
//获得某月的天数
function getMonthDays(myMonth) {
  var monthStartDate = new Date(nowYear, myMonth, 1);
  var monthEndDate = new Date(nowYear, myMonth + 1, 1);
  var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
  return days;
}
/* 获取今天 */
export const getToday = () => {
  return nowYear+'/'+doHandleMonth(nowMonth+1)+'/'+doHandleMonth(nowDay);
}
//获取前day天的日期
export const getLastDayByDay = function(day){
  var today = new Date();
  var targetday_milliseconds=today.getTime() - 1000*60*60*24*day;
  today.setTime(targetday_milliseconds); 
  var tYear = today.getFullYear();
  var tMonth = today.getMonth();
  var tDate = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear+"/"+tMonth+"/"+tDate;
}
// 不足10补0
function doHandleMonth(month){
  var m = month;
  if(month.toString().length == 1){
    m = "0" + month;
  }
  return m;
}

// 获取指定日期的后几天的日期
export const getNextDate = (date, days) => {
	let nowDate = ''
	if(date) {
		nowDate = new Date(date)
	} else {
		nowDate = new Date()
	}
	
	nowDate.setDate(nowDate.getDate() - days)
	const dateStr = {
		year: nowDate.getFullYear(),
		month: nowDate.getMonth() + 1,
		day: nowDate.getDate()
	}
	const newMonth = dateStr.month.toString().padStart(2,'0')
	const newDay = dateStr.day.toString().padStart(2,'0')
	return `${dateStr.year}/${newMonth}/${newDay}`
}

/**
* @desc 函数防抖
* @param func 函数
* @param wait 延迟执行毫秒数
* @param immediate true 表立即执行，false 表非立即执行
*/
export function debounce(func, wait, immediate) {
	let timeout;

	return function () {
		let context = this;
		let args = arguments;

		if (timeout) clearTimeout(timeout);
		if (immediate) {
			var callNow = !timeout;
			timeout = setTimeout(() => {
				timeout = null;
			}, wait)
			if (callNow) func.apply(context, args)
		}
		else {
			timeout = setTimeout(function(){
				func.apply(context, args)
			}, wait);
		}
	}
}

/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
*/
export const throttle = (func, wait = 2000) => {
	let previous = 0;
	return function() {
		let context = this;
		let args = arguments;
		let now = Date.now();

		if (now - previous > wait) {
			func.apply(context, args);
			previous = now;
		}

	}
}

/* 防止重复点击 */

let clickTimer = 0
export const clickThrottle = (interval = 3000) => {
	let now = +new Date(); // 获取当前时间的时间戳
	let timer = clickTimer; // 记录触发事件的事件戳

	if (now - timer < interval) {
		// 如果当前时间 - 触发事件时的事件 < interVal，那么不符合条件，直接return false，
		// 不让当前事件继续执行下去
			return false;
	} else { 
		// 反之，记录符合条件触发了事件的时间戳，并 return true，使事件继续往下执行
			clickTimer = now;
			return true;
	}
}

//number,rpx,upx,px,% --> px的数值
export const toPx = (num) => {
	if (typeof num === 'string') {
		if (num.indexOf('px') !== -1) {
			if (num.indexOf('rpx') !== -1) {
				// "10rpx"
				num = num.replace('rpx', '');
			} else if (num.indexOf('upx') !== -1) {
				// "10upx"
				num = num.replace('upx', '');
			} else {
				// "10px"
				return Number(num.replace('px', ''));
			}
		} else if (num.indexOf('%') !== -1) {
			// 传百分比,则相对于windowHeight,传"10%"则等于windowHeight的10%
			let rate = Number(num.replace('%', '')) / 100;
			return this.windowHeight * rate;
		}
	}
	return num ? uni.upx2px(Number(num)) : 0;
}

/**
 * @param {number} time
 * @returns {string}
 */
export const formatTime = (time) => {
	if (('' + time).length === 10) {
		time = parseInt(time) * 1000
	} else {
		time = +time
	}
	const d = new Date(time)
	const now = Date.now()

	const diff = (now - d) / 1000

	if (diff < 30) {
		return '刚刚'
	} else if (diff < 3600) {
		// less 1 hour
		return Math.ceil(diff / 60) + '分钟前'
	} else if (diff < 3600 * 24) {
		return Math.ceil(diff / 3600) + '小时前'
	} else if (diff < 3600 * 24 * 2) {
		return '1天前'
	} else {
		if(d.getFullYear() != new Date().getFullYear()) {
			return (d.getFullYear() + '年' + (d.getMonth() + 1) + '月' +	d.getDate() +'日' + d.getHours() +'时' +d.getMinutes() +'分')
		} else {
			return ((d.getMonth() + 1) + '月' +	d.getDate() +'日' + d.getHours() +'时' +d.getMinutes() +'分')
		}
	}
}