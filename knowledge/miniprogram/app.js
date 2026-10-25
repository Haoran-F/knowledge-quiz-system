const BASE_URL = 'http://192.168.0.107:3000';

App({
  // 全局共享数据仓库，所有页面都能读取和调用
  globalData: {
    userInfo: null,           // 用户信息
    baseUrl: BASE_URL,        // 后端接口基础地址
    totalExamCount: 0         // 总刷题次数
  },

  // 封装网络请求方法，返回Promise
  request(url, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + url,  // 拼接完整URL
        data: data,
        method: method,
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            // 业务错误时弹出提示
            wx.showToast({ title: res.data.message, icon: 'none' });
            reject(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络请求失败', icon: 'none' });
          reject(err);
        }
      });
    });
  },

  // 保存用户登录信息：存入全局变量和本地缓存
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 获取登录用户信息：先读全局，没有就从本地缓存读取
  getUserInfo() {
    if (!this.globalData.userInfo) {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
    }
    return this.globalData.userInfo;
  },

  // 登录状态校验：判断是否存在有效用户ID
  checkLogin() {
    const userInfo = this.getUserInfo();
    return !!userInfo && !!userInfo.user_id;
  },

  // 退出登录：清空全局用户数据和本地缓存
  logout() {
    this.globalData.userInfo = null;
    wx.removeStorageSync('userInfo');
  },

  // 小程序初始化生命周期：打开小程序时自动执行，加载缓存的用户信息
  onLaunch: function () {
    this.getUserInfo();
  }
});