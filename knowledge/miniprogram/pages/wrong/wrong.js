const app = getApp();

Page({
  data: {
    wrongList: [],
    filteredList: [],
    subjectList: ['全部', '语文', '数学', '英语'],
    activeSubject: '全部',
    totalWrong: 0,
    subjectStats: [],
    expandedMap: {}
  },

  onLoad: function () {
    this.loadWrongList();
  },

  onShow: function () {
    this.loadWrongList();
  },

  loadWrongList: function () {
    const userInfo = app.getUserInfo();
    const userId = userInfo && userInfo.user_id ? userInfo.user_id : 1;
    
    app.request('/getUserWrong', { userId: userId }).then(res => {
      const list = res.data || [];
      this.setData({ wrongList: list });
      this.computeStats(list);
      this.applyFilter();
    }).catch(err => {
      console.error('加载错题列表失败:', err);
    });
  },

  computeStats: function (list) {
    const subjects = ['语文', '数学', '英语'];
    const subjectCounts = {};
    let total = list.length;

    subjects.forEach(s => { subjectCounts[s] = 0; });
    list.forEach(item => {
      if (subjectCounts[item.subject_name] !== undefined) {
        subjectCounts[item.subject_name]++;
      }
    });

    const stats = subjects.map(s => ({
      name: s,
      count: subjectCounts[s],
      emoji: this.getSubjectEmoji(s),
      gradient: this.getSubjectGradient(s),
      percent: total > 0 ? Math.round((subjectCounts[s] / total) * 100) : 0
    }));

    this.setData({
      totalWrong: total,
      subjectStats: stats
    });
  },

  applyFilter: function () {
    const { wrongList, activeSubject } = this.data;
    let filtered = wrongList;
    if (activeSubject !== '全部') {
      filtered = wrongList.filter(item => item.subject_name === activeSubject);
    }
    this.setData({ filteredList: filtered });
  },

  switchSubject: function (e) {
    const subject = e.currentTarget.dataset.subject;
    this.setData({ activeSubject: subject }, () => {
      this.applyFilter();
    });
  },

  getSubjectCount: function (subject) {
    if (subject === '全部') return this.data.totalWrong;
    const stat = this.data.subjectStats.find(s => s.name === subject);
    return stat ? stat.count : 0;
  },

  getSubjectGradient: function (subject) {
    const gradientMap = {
      '语文': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      '数学': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      '英语': 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    };
    return gradientMap[subject] || 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
  },

  getSubjectEmoji: function (subject) {
    const emojiMap = {
      '语文': '📖',
      '数学': '🔢',
      '英语': '🔤'
    };
    return emojiMap[subject] || '📚';
  },

  toggleCard: function (e) {
    const wid = e.currentTarget.dataset.wid;
    const map = Object.assign({}, this.data.expandedMap);
    map[wid] = !map[wid];
    this.setData({ expandedMap: map });
  },

  redoQuestion: function (e) {
    const subject = e.currentTarget.dataset.subject;
    wx.navigateTo({
      url: `/pages/exam/exam?subjectName=${subject}`
    });
  },

  confirmDelete: function (e) {
    const wId = e.currentTarget.dataset.wid;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道错题吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#e53935',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.deleteWrong(wId);
        }
      }
    });
  },

  deleteWrong: function (wId) {
    app.request('/delSingleWrong', { w_id: wId }, 'POST').then(res => {
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadWrongList();
    }).catch(err => {
      console.error('删除错题失败:', err);
    });
  },

  confirmClearAll: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空全部错题吗？此操作不可恢复！',
      confirmText: '清空全部',
      confirmColor: '#e53935',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          this.clearAllWrong();
        }
      }
    });
  },

  clearAllWrong: function () {
    const userInfo = app.getUserInfo();
    const userId = userInfo && userInfo.user_id ? userInfo.user_id : 1;
    app.request('/clearUserAllWrong', { user_id: userId }, 'POST').then(res => {
      wx.showToast({ title: '已全部清空', icon: 'success' });
      this.loadWrongList();
    }).catch(err => {
      console.error('清空错题失败:', err);
    });
  },

  goToHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
