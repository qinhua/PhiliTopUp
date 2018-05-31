//logs.js
const util = require('../../utils/util.js')
import config from '../../config.js'

Page({
  data: {
    list: [{
      status: 0,
      phone: 13552524252,
      value: 10,
      createTime: 1527764653840
    }, {
      status: 1,
      phone: 13452524252,
      value: 150,
      createTime: 1527764653840
    }, {
      status: 3,
      phone: 13652524252,
      value: 50,
      createTime: 1527764653840
    }, {
      status: 2,
      phone: 15952524252,
      value: 200,
      createTime: 1527764653840
    }],
    status: { 0: '充值中', 1: '充值成功', 2: '充值失败', 3: '充值失败(已退款)' },
  },
  getList: function () {
    wx.request({
      url: config.host + config.api.getHistory,
      data: {
        openid: '',
        y: ''
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var resD = res.data
        console.log(resD)
        for (var i = 0; i < resD.length; i++) {
          resD[i].createTime = util.formatTime(resD[i].createTime)
          resD[i].statusTxt = this.data.status[resD[i].status]
        }
        this.setData({
          list: resD
        })
      }
    })
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '充值记录',
    })
    var resD=this.data.list
    for (var i = 0; i < resD.length; i++) {
      resD[i].createTime = util.formatTime(new Date(resD[i].createTime))
      resD[i].statusTxt = this.data.status[resD[i].status]
    }
    this.setData({
      list: resD
    })
    this.getList()
  }
})
