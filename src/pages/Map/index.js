/*
 * @Author: sitao
 * @Date: 2021-02-22 11:27:57
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-24 16:05:23
 */
import React, { Component } from 'react'
import { Toast } from 'antd-mobile'
import { Link } from 'react-router-dom'
import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'

// 导入样式
import './index.scss'

import classNames from 'classnames'

//导入服务
import cityService from '../../service/city'
import houseService from '../../service/house'

// 导入BASE_URL
import { BASE_URL } from '../../utils/url'

// 解决脚手架中全局变量访问的问题
const BMap = window.BMapGL


// 覆盖物样式
const labelStyle = {
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  padding: '0px',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  color: 'rgb(255, 255, 255)',
  textAlign: 'center'
}

export default class Map extends Component {
  state = {
    // 小区下的房源列表
    housesList: [],
    // 表示是否展示房源列表
    isShowList: false
  }
  componentDidMount(){
    this.renderMap()
  }
  //初始化地图的方法
  renderMap = () =>{
    // 获取当前定位城市  label:城市  value:城市的id值
    const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))
    // 初始化地图实例
    const map = new BMap.Map('container')
    // 作用：能够在其他方法中通过 this 来获取到地图对象
    this.map = map
    // 创建地址解析器实例
    const myGeo = new BMap.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      label,
      async point => {
        if (point) {
          //  初始化地图
          map.centerAndZoom(point, 11)
          // 添加常用控件
          map.enableScrollWheelZoom(true);
          map.addControl(new BMap.ScaleControl());    // 添加比例尺控件
          map.addControl(new BMap.ZoomControl()); // 添加缩放控件

           /* 
            1 获取房源数据。
            2 遍历数据，创建覆盖物，给每个覆盖物添加唯一标识（后面要用）。
            3 给覆盖物添加单击事件。
            4 在单击事件中，获取到当前单击项的唯一标识。
            5 放大地图（级别为13），调用 clearOverlays() 方法清除当前覆盖物。
          */
          // 调用 renderOverlays 方法
          this.renderOverlays(value)
        }
        
      },
      label
    )
  }
  // 渲染覆盖物入口
  // 1 接收区域 id 参数，获取该区域下的房源数据
  // 2 获取房源类型以及下级地图缩放级别
  async renderOverlays(id) {
    try {
      //开启loading
      Toast.loading('加载中...',0,false)
      const { body:res } = await cityService.getCityHouseList({id:id})
      // 关闭 loading
      Toast.hide()

      // 调用 getTypeAndZoom 方法获取级别和类型
      const { nextZoom, type } = this.getTypeAndZoom()
      res.forEach(item => {
        // 创建覆盖物
        this.createOverlays(item, nextZoom, type)
      })
    } catch(e) {
      // 关闭 loading
      Toast.hide()
    }
  }
  // 计算要绘制的覆盖物类型和下一个缩放级别
  // 区   -> 11 ，范围：>=10 <12
  // 镇   -> 13 ，范围：>=12 <14
  // 小区 -> 15 ，范围：>=14 <16
  getTypeAndZoom() {
    // 调用地图的 getZoom() 方法，来获取当前缩放级别
    const zoom = this.map.getZoom()
    let nextZoom, type

    // console.log('当前地图缩放级别：', zoom)
    if (zoom >= 10 && zoom < 12) {
      // 区
      // 下一个缩放级别
      nextZoom = 13
      // circle 表示绘制圆形覆盖物（区、镇）
      type = 'circle'
    } else if (zoom >= 12 && zoom < 14) {
      // 镇
      nextZoom = 15
      type = 'circle'
    } else if (zoom >= 14 && zoom < 16) {
      // 小区
      type = 'rect'
    }

    return {
      nextZoom,
      type
    }
  }

  // 创建覆盖物
  createOverlays(data, zoom, type){
    const {
      coord: { longitude, latitude },
      label: areaName,
      count,
      value
    } = data

    // 创建坐标对象
    const areaPoint = new BMap.Point(longitude, latitude)

    if (type === 'circle') {
      // 区或镇
      this.createCircle(areaPoint, areaName, count, value, zoom)
    } else {
      // 小区
      this.createRect(areaPoint, areaName, count, value)
    }
  }

  //创建区，镇覆盖物
  createCircle(point,name,count,id,zoom) {
    const label = new BMap.Label('', {
          position: point,
          offset: new BMap.Size(-35, -35)
        })
        // 给 label 对象添加一个唯一标识
        label.id = id

        // 设置房源覆盖物内容
        label.setContent(`
          <div class="bubble">
            <p class="name">${name}</p>
            <p>${count}套</p>
          </div>
        `)

        //添加单机事件
         // 添加单击事件
        label.addEventListener('click', () => {
          // 调用 renderOverlays 方法，获取该区域下的房源数据
          this.renderOverlays(id)
          // 放大地图，以当前点击的覆盖物为中心放大地图
          this.map.centerAndZoom(point, zoom)

          // 解决清除覆盖物时，百度地图API的JS文件自身报错的问题
          setTimeout(() => {
            // 清除当前覆盖物信息
            this.map.clearOverlays()
          }, 0)
        })
        //覆盖物添加到地图中
        this.map.addOverlay(label)
        // 设置样式
       label.setStyle(labelStyle)
  }

  // 创建小区覆盖物
  createRect(point, name, count, id) {
    // 创建覆盖物
    const label = new BMap.Label('', {
      position: point,
      offset: new BMap.Size(-50, -28)
    })

    // 给 label 对象添加一个唯一标识
    label.id = id

    // 设置房源覆盖物内容
    label.setContent(`
      <div class="rect">
        <span class="housename">${name}</span>
        <span class="housenum">${count}套</span>
        <i class="arrow"></i>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 添加单击事件
    label.addEventListener('click', e => {
      // 获取并渲染房源数据
      this.getHousesList(id)

      // 获取当前被点击项
      // const target = e.changedTouches[0]
      this.map.panBy(
        window.innerWidth / 2 - e.clientX,
        (window.innerHeight - 330) / 2 - e.clientY
      )
    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  // 获取小区房源数据
  async getHousesList(id) {
    try {
      // 开启loading
      Toast.loading('加载中...', 0, null, false)

      const {body:res} = await houseService.getHouseList({cityId:id})
      
      // 关闭 loading
      Toast.hide()

      this.setState({
        housesList: res.list,
        // 展示房源列表
        isShowList: true
      })
    } catch (e) {
      // 关闭 loading
      Toast.hide()
    }
  }

  // 封装渲染房屋列表的方法
  renderHousesList() {
    return this.state.housesList.map(item => (
      <HouseItem
        onClick={() => this.props.history.push(`/detail/${item.houseCode}`)}
        key={item.houseCode}
        src={BASE_URL + item.houseImg}
        title={item.title}
        desc={item.desc}
        tags={item.tags}
        price={item.price}
      />
    ))
  }
  render() {
    
    return (
      <div className="map">
        <NavHeader >地图找房</NavHeader>
        <div id="container" className="container" ></div>
        {/* 房源列表*/}
        {/* 添加 styles.show 展示房屋列表 */}
        <div
          className={classNames({show:this.state.isShowList},"houseList")}
        >
          <div className="titleWrap">
            <h1 className="listTitle">房屋列表</h1>
            <Link className="titleMore" to="/home/list">
              更多房源
            </Link>
          </div>

          <div className="houseItems">
            {/* 房屋结构 */}
            {this.renderHousesList()}
          </div>
        </div>
      </div>
    )
  }
}
