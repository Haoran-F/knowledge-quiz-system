const app = getApp();

Page({
  // 页面响应式数据仓库
  data: {
    subjectList: [],          // 科目列表数组
    userName: '学习达人',     // 用户昵称
    userAvatar: '',           // 用户头像
    greetingText: '早上好',   // 问候语
    dailyTip: '复习错题是提高成绩最有效的方法，记得每天回顾几道错题哦！坚持就是胜利！'  // 每日学习小贴士
  },

  // 页面生命周期：页面刚加载时自动运行
  onLoad: function () {
    this.refreshGreeting();
    this.loadUserData();
    this.loadSubjectList();
  },

  // 页面显示时刷新数据
  onShow: function () {
    this.loadUserData();
  },

  // 刷新问候语（根据时间段）
  refreshGreeting: function () {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour >= 5 && hour < 9) greeting = '早上好';
    else if (hour >= 9 && hour < 12) greeting = '上午好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    this.setData({ greetingText: greeting });

    // 随机每日小贴士
    const tips = [
      '复习错题是提高成绩最有效的方法，记得每天回顾几道错题哦！坚持就是胜利！',
      '不积跬步，无以至千里。每天坚持做几道题，考试一定没问题！',
      '学而不思则罔，做题后一定要认真看解析，理解为什么选这个答案！',
      '好记性不如烂笔头，遇到难题可以写下来反复练习，加深记忆！',
      '今日事今日毕，今天的错题今天清，明天学习更轻松！',
      '学习是一场马拉松，不是百米冲刺。保持节奏，稳步前进！'
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    this.setData({ dailyTip: randomTip });
  },

  // 加载用户信息
  loadUserData: function () {
    const userInfo = app.getUserInfo();
    if (userInfo) {
      this.setData({
        userName: userInfo.wx_name || '学习达人',
        userAvatar: userInfo.wx_avatar || ''
      });
    } else {
      this.setData({
        userName: '游客同学',
        userAvatar: ''
      });
    }
  },

  // 自定义方法：向后端请求获取全部科目
  loadSubjectList: function () {
    app.request('/getSubjectList').then(res => {
      this.setData({ subjectList: res.data });
    }).catch(() => {});
  },

  // 工具方法：根据科目名字匹配对应图标图片
  getSubjectIcon: function (subject) {
    const iconMap = {
      '语文': '/images/icon-chinese.png',
      '数学': '/images/icon-math.png',
      '英语': '/images/icon-english.png'
    };
    return iconMap[subject] || '/images/icon-book.png';
  },

  // 工具方法：根据科目返回描述文案
  getSubjectDesc: function (subject) {
    const descMap = {
      '语文': '诗词歌赋·阅读理解',
      '数学': '逻辑思维·计算推理',
      '英语': '词汇语法·听说读写'
    };
    return descMap[subject] || '综合知识练习';
  },

  // 科目卡片点击事件：跳转到刷题页面
  goToExam: function (e) {
    const subject = e.currentTarget.dataset.subject;
    wx.navigateTo({
      url: '/pages/exam/exam?subjectName=' + subject
    });
  }
});
