/*
 * @Author: sitao
 * @Date: 2021-02-22 16:00:00
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-22 16:53:52
 */
import homeService from '../service/home'
// 1 在 utils 目录中，新建 index.js，在该文件中封装
// 2 创建并导出获取定位城市的函数 getCurrentCity
const BMap = window.BMapGL
export const getCurrentCity = () => {
  // 3 判断 localStorage 中是否有定位城市
  const localCity = JSON.parse(localStorage.getItem('hkzf_city'))
  if(!localCity){
    // 4 如果没有，就使用首页中获取定位城市的代码来获取，并且存储到本地存储中，然后返回该城市数据
    return new Promise((resolve,reject) => {
      const curCity = new BMap.LocalCity()
      curCity.get(async res => {
        try{
          const { body:data } = await homeService.getCurrentCity({name:`${res.name}`})
          // 存储到本地存储中
          localStorage.setItem('hkzf_city', JSON.stringify(data))
          // 返回该城市数据
          // return result.data.body
          resolve(data)
        }catch (e) {
          // 获取定位城市失败
          reject(e)
        }
      })
    })
  }
  // 5 如果有，直接返回本地存储中的城市数据
  // 注意：因为上面为了处理异步操作，使用了Promise，因此，为了该函数返回值的统一，此处，也应该使用Promise
  // 因为此处的 Promise 不会失败，所以，此处，只要返回一个成功的Promise即可
  return Promise.resolve(localCity)
}

