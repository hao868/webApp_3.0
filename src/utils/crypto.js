import CryptoJS from "crypto-js"
import * as db from '@/utils/db.js'

// 密钥 16 位
let key = db.get('webAppConfig').desKey; //$config.desKey;
// 初始向量 initial vector 16 位
let iv = '00000000';
// key 和 iv 可以一致

// 二次加密key
let k = 'CwACBQEGDAYLAgkEBQMPBAoJBg4OAgAK';
k = CryptoJS.enc.Utf8.parse(k);

iv = CryptoJS.enc.Utf8.parse(iv);

//加密 
const encrypted = (param) => {
  // 解密aseKey
  const keys = CryptoJS.enc.Utf8.parse(decryptedTwo(key));
  
  var encrypted = CryptoJS.AES.encrypt(param, keys, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  encrypted = encrypted.toString();
  return encrypted;
}

//解密 
const decrypted = (param) => {
  // 解密aseKey
  const keys = CryptoJS.enc.Utf8.parse(decryptedTwo(key));

  var decrypted = CryptoJS.AES.decrypt(param, keys, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
  return decrypted;
}

// 二次解密
const decryptedTwo = (param) => {
  var decryptedTwo = CryptoJS.AES.decrypt(param, k, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  decryptedTwo = CryptoJS.enc.Utf8.stringify(decryptedTwo);
  return decryptedTwo;
}

// MD5加密
const md5 = (param) => {
  var hash = CryptoJS.MD5(param);
  return hash.toString();
}


export default {
  encrypted,
  decrypted,
  decryptedTwo,
  md5
}