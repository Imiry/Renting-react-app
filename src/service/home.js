/*
 * @Author: sitao
 * @Date: 2021-02-20 16:54:14
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-22 14:28:10
 */
import  home  from '../api/home.js';
import  http  from '../utils/axios.js';
const homeService = {
  getSwiperList: params => {
    return http('get',home.getSwiper,params)
  },
  getGroupslist: params => {
    return http('get',home.getGroups,params)
  },
  getNewslist: params => {
    return http('get',home.getNews,params)
  },
  getCurrentCity: params => {
    return http('get',home.getCurrentCity,params)
  }
}

export default homeService