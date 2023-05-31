/*
	统一api消费相关接口
*/

import RequestXFM from '@/config/requestxfm'

// 解析二维码
export const ParseQrcode = (data = {}) => {
  return RequestXFM({
    url: '/ParseQRcodeApi/ParseQRcode',
    method: "post",
    data
  });
};

// 卡消费 需要商户号和订单号 
export const CardConsume = (data = {}) => {
  return RequestXFM({
    url: '/CardConsumeApi/CardConsume',
    method: "post",
    data
  });
};

// 二维码消费 不需要商户号和订单号 
export const QRcodePay = (data = {}) => {
  return RequestXFM({
    url: '/QrcodePayApi/QRcodePay',
    method: "post",
    data
  });
};


// 获取协调世界时间
export const GetUTC = (data = {}) => {
  return RequestXFM({
    url: "/TokenAPI/GetUTC",
    method: "get",
    data
  });
};

// 获取Token
export const GetApiToken = (data = {}) => {
  return RequestXFM({
    url: "/TokenAPI/GetToken",
    method: "post",
    data
  });
};

// 获取消费二维码
export const CreateQRcodeXFM = (data = {}) => {
  return RequestXFM({
    url: "/CreateQRcodeApi/CreateQRcode",
    method: "post",
    data
  });
};

// 获取一卡通用户信息
export const GetUserCardInfo = (data = {}) => {
  return RequestXFM({
    url: "/UserCardInfoApi/GetUserCardInfo",
    method: "post",
    data
  });
};

// 获取指定钱包的消费二维码
export const CreateQRcodeAppointType = (data = {}) => {
  return RequestXFM({
    url: "/CreateQRcodeApi/QRcodeAppointType",
    method: "post",
    data
  });
};

// 校验支付密码
export const CheckPassword = (data) => {
  return RequestXFM({
    url: '/CheckPwdApi/CheckPwd',
    method: 'post',
    data
  })
}