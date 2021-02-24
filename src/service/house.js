/*
 * @Author: sitao
 * @Date: 2021-02-24 14:53:00
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-24 14:53:50
 */
import  house  from '../api/house.js';
import  http  from '../utils/axios.js';
const houseService = {
  getHouseList: params => {
    return http('get',house.getHouseList,params)
  },
  
  
}

export default houseService