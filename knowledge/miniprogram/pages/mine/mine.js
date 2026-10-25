const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onLoad: function () {
    this.loadUserInfo();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = app.getUserInfo();
    this.setData({ userInfo });
  },

  wxLogin: function () {
    const existingUser = app.getUserInfo();
    const userId = existingUser && existingUser.user_id ? existingUser.user_id : 1;

    const userInfo = {
      user_id: userId,
      wx_name: '汉堡好热',
      wx_avatar: '/images/icon-user.png'
    };

    app.request('/login', userInfo, 'POST').then(res => {
      app.saveUserInfo(res.data);
      wx.showToast({ title: '登录成功', icon: 'success' });
      this.loadUserInfo();
    }).catch(err => {
      app.saveUserInfo(userInfo);
      wx.showToast({ title: '登录成功', icon: 'success' });
      this.loadUserInfo();
    });
  },

  confirmClearAllWrong: function () {
    wx.showModal({
      title: '确认清空错题本',
      content: '此操作将清空全部错题记录，且无法恢复，确定继续吗？',
      confirmText: '确认清空',
      confirmColor: '#e53935',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.clearAllWrong();
        }
      }
    });
  },

  clearAllWrong: function () {
    const userInfo = app.getUserInfo();
    app.request('/clearUserAllWrong', { user_id: userInfo.user_id }, 'POST').then(res => {
      wx.showToast({ title: '清空成功', icon: 'success' });
    }).catch(err => {
      console.error('清空错题失败:', err);
    });
  },

  goToAdmin: function () {
    wx.navigateTo({ url: '/pages/admin/login' });
  },

  viewAllQuestions: function () {
    wx.navigateTo({ url: '/pages/questions/questions' });
  },

  goToWrong: function () {
    wx.switchTab({ url: '/pages/wrong/wrong' });
  },

  logout: function () {
    app.logout();
    this.setData({ userInfo: null });
    wx.showToast({ title: '已退出登录', icon: 'success' });
  },

  chooseAvatar: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadAvatar(res.tempFilePaths[0]);
      },
      fail: () => {
        wx.showToast({ title: '取消选择', icon: 'none' });
      }
    });
  },

  uploadAvatar: function (filePath) {
    const userInfo = app.getUserInfo();
    if (!userInfo || !userInfo.user_id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.uploadFile({
      url: app.globalData.baseUrl + '/uploadAvatar',
      filePath: filePath,
      name: 'avatar',
      formData: { user_id: userInfo.user_id },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            userInfo.wx_avatar = app.globalData.baseUrl + data.data.avatarUrl;
            app.saveUserInfo(userInfo);
            this.setData({ userInfo });
            wx.showToast({ title: '头像更新成功', icon: 'success' });
          } else {
            wx.showToast({ title: data.message, icon: 'none' });
          }
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  }
});
