import Cookies from "js-cookie";

// App
const sidebarStatusKey = "sidebar_status";
export const getSidebarStatus = () => Cookies.get(sidebarStatusKey);
export const setSidebarStatus = (sidebarStatus) => Cookies.set(sidebarStatusKey, sidebarStatus);

const languageKey = "language";
export const getLanguage = () => Cookies.get(languageKey);
export const setLanguage = (language) => Cookies.set(languageKey, language);

const sizeKey = "size";
export const getSize = () => Cookies.get(sizeKey);
export const setSize = (size) => Cookies.set(sizeKey, size);

// token
const tokenKey = "token";
const hour = 1; // 默认一个小时
const inFifteenMinutes = new Date(new Date().getTime() + hour * 60 * 60 * 1000);
export const getToken = () => Cookies.get(tokenKey);
export const setToken = (token) =>{
  Cookies.set(tokenKey, token, {
    expires: inFifteenMinutes
  });
}
export const removeToken = () => Cookies.remove(tokenKey);