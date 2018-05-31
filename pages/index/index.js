//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
import config from '../../config.js'

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        itemList: [
            {
                id: 1,
                value: 10,
                rmb: 4
            },
            {
                id: 2,
                value: 30,
                rmb: 10
            },
            {
                id: 3,
                value: 50,
                rmb: 16
            },
            {
                id: 4,
                value: 100,
                rmb: 32
            },
            {
                id: 5,
                value: 150,
                rmb: 50
            },
            {
                id: 6,
                value: 200,
                rmb: 66
            }
        ],
        disabled: false,
        chooseable: false,
        tmpPhone: null,
        phone: null,
        fee: null
    },
    //事件处理函数
    getItems: function () {
        wx.request({
            url: config.host + config.api.getItems,
            data: {
                openid: '',
                y: ''
            },
            method: 'GET',
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                console.log(res.data)
                this.setData({
                    itemList: res.data
                })
            }
        })
    },
    onLoad: function () {
        // 获取本地的手机号
        wx.getStorage({
            key: 'tmpPhone',
            success: (res) => {
                console.log(res)
                // var p = res.data + ''
                // var lastD = p.substr(0, 3) + ' ' + p.substr(3, 4) + ' ' + p.substr(-4)
                let resD = res.data
                let realD = resD.replace(/\s/g, '')
                this.setData({
                    tmpPhone: resD,
                    phone: realD
                })
                if (realD.length && realD.match(/^(13|14|15|16|17|18|19)\d{9}$/)) {
                    this.setData({
                        chooseable: true
                    })
                }
            }
        })
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
            this.getItems()
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
                this.getItems()
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                    this.getItems()
                }
            })
        }
    },
    getUserInfo: function (e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    getPhoneNumber: function (e) {
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '未授权',
                success: function (res) {
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '同意授权',
                success: function (res) {
                }
            })
        }

        wx.login({
            success: res => {
                console.log(res.code);
                wx.request({
                    url: 'https://你的解密地址',
                    data: {
                        'encryptedData': encodeURIComponent(e.detail.encryptedData),
                        'iv': e.detail.iv,
                        'code': res.code
                    },
                    method: 'GET',
                    header: {
                        'content-type': 'application/json'
                    }, // 设置请求的 header
                    success: function (res) {
                        if (res.status == 1) {//我后台设置的返回值为1是正确
                            //存入缓存即可
                            wx.setStorageSync('phone', res.phone);
                        }
                    },
                    fail: function (err) {
                        console.log(err);
                    }
                })
            }
        })
    },
    clear: function () {
        this.setData({
            disabled: false,
            chooseable: false,
            tmpPhone: null,
            phone: null,
            fee: null
        })
    },
    history: function () {
        wx.navigateTo({
            url: '../history/history'
        })
    },
    checkPhone: function (e) {
        // console.log(e)
        var val = e.detail.value
        var valLen = e.detail.value.replace(/\s/g, '')
        if (val.length > 12) {
            //   val = val.substr(0, 11)
            this.setData({
                disabled: true,
                chooseable: false
            })
        }
        if (valLen.length === 11) {
            this.setData({
                disabled: false,
                chooseable: true
            })
        } else {
            this.setData({
                chooseable: false
            })
        }
        // 空格分割手机号
        if (this.data.phone && this.data.phone.length) {
            console.log(val.length, this.data.phone.length)
            if (valLen.length >= this.data.phone.length) { // 文本框中输入
                if (val.length === 3 || val.length === 8) {
                    val += ' '
                }
            } else { // 文本框中删除
                if (val.length === 9 || val.length === 4) {
                    val = val.replace(/\s/g, '')
                }
            }
        }
        this.setData({
            phone: val.replace(/\s/g, ''),
            tmpPhone: val
        })
    },
    topUp: function (e) {
        /*校验手机号*/
        if (!this.data.chooseable) {
            wx.showToast({
                title: 'Please input telephone number！',
                icon: 'none',
                duration: 1500
            })
            return false
        }
        /*缓存手机号*/
        wx.setStorage({
            key: 'tmpPhone',
            data: this.data.tmpPhone
        })
        /*发起支付*/
        wx.requestPayment({
            'timeStamp': new Date().getTime(),
            'nonceStr': util.randomStr(),
            'package': '',
            'signType': 'MD5',
            'paySign': '',
            'success': function (res) {
            },
            'fail': function (res) {
            }
        })
    }
})
