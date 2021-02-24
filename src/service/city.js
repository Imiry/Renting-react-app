/*
 * @Author: sitao
 * @Date: 2021-02-22 14:51:01
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-24 10:18:26
 */
import  city  from '../api/city.js';
import  http  from '../utils/axios.js';
const cityService = {
  getCityList: params => {
    return http('get',city.getCityList,params)
  },
  getHotCityList: params => {
    return http('get',city.getHotCityList,params)
  },
  getCityHouseList: params => {
    return http('get',city.getCityHouseList,params)
  }
  
}

export default cityService