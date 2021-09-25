/*
 * @Author: xuziyong
 * @Date: 2021-09-25 11:24:28
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-09-25 21:59:38
 * @Description: TODO
 */
const HANDLE_TYPE = {
  http: 1
}
module.exports = {
  HANDLE_TYPE,
  FromCenter: function (wsStr) {
    this.id = ''
    this.name = ''
    this.type = ''
    this.data = null
    try {
      const jsonStr = wsStr.toString()
      const jsonData = JSON.parse(jsonStr)
      this.id = jsonData.id
      this.name = jsonData.name
      this.type = jsonData.type
      this.data = jsonData.data
    } catch (error) {
      console.log(error)
    }
  },
  ToCenter: function (id, name, data, type, isFirst = false) {
    this.id = id
    this.name = name
    this.type = type
    this.data = data
    this.isFirst = isFirst

    this.msg = () => {
      console.log('发送数据: ', this.data)
      try {
        const res = JSON.stringify({
          id: this.id,
          name: this.name,
          type: this.type,
          data: this.data,
          isFirst: this.isFirst,
        })
        return res
      } catch (error) {
        const res = JSON.stringify({
          id: this.id,
          name: this.name,
          type: this.type,
          data: error,
          isFirst: this.isFirst,
        })
        return res
      }
    }
  },
  FromTarget: function () {},
  ToTarget: function () {},
}