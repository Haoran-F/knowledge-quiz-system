const app = getApp();

Page({
   // 3. data：页面响应式数据仓库，存储输入框里的账号、密码内容
  data: {
    username: '',
    password: ''
  },
 // 4. 账号输入框绑定的输入事件，输入文字时实时触发
  onUsernameInput: function (e) {
    this.setData({ username: e.detail.value });
  },
 // 6. 密码输入框
  onPasswordInput: function (e) {
    this.setData({ password: e.detail.value });
  },
// 8. 登录按钮
  doLogin: function () {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({ title: '请输入账号密码', icon: 'none' });
      return;
    }
 // 11. 调用全局请求接口，携带账号密码，以POST方式请求管理员登录校验接口
    app.request('/checkAdminLogin', { username, password }, 'POST').then(res => {
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/admin/manage' });
      }, 1000);
    }).catch(err => {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    });
  }
});