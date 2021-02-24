/*
 * @Author: sitao
 * @Date: 2021-02-24 15:29:06
 * @LastEditors: sitao
 * @LastEditTime: 2021-02-24 15:41:48
 */
import PropTypes from 'prop-types'
import classNames from 'classnames'

import './index.scss'
function HouseItem({ src, title, desc, tags, price, onClick }) {
  return <div className="house"  onClick={onClick}>
  <div className="imgWrap">
    <img
      className="img"
      src={src}
      alt=""
    />
  </div>
  <div className="content">
    <h3 className="title">{title}</h3>
    <div className="desc">{desc}</div>
    <div>
      {tags.map(tag => (
        <span
          className={classNames("tag","tag1")}
          key={tag}
        >
          {tag}
        </span>
      ))}
    </div>
    <div className="price">
      <span className="priceNum">{price}</span> 元/月
    </div>
  </div>
</div>
}

HouseItem.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  desc: PropTypes.string,
  tags: PropTypes.array.isRequired,
  price: PropTypes.number,
  onClick: PropTypes.func
}

export default HouseItem