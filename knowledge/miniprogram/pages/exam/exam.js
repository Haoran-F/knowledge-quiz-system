const app = getApp();

Page({
  // 页面响应式数据仓库
  data: {
    subject: '',           // 当前科目
    questionList: [],      // 题目列表
    currentIndex: 0,       // 当前题目索引
    currentQuestion: {},   // 当前题目详情
    options: [],           // 选项数组（格式化后）
    selectedOption: '',    // 用户选择的选项
    showAnswer: false,     // 是否显示答案
    isCorrect: false,      // 是否答对
    correctNum: 0,         // 正确数量
    correctRate: 0,        // 正确率
    showFinish: false,     // 显示完成弹窗
    showConfirm: false     // 显示返回确认弹窗
  },

  // 页面生命周期：页面刚加载时自动运行，接收首页传递的科目参数
  onLoad: function (options) {
    const subject = options.subjectName || '语文';
    this.setData({ subject });
    this.loadQuestions(subject);
  },

  // 自定义方法：根据科目向后端接口请求题目数据
  loadQuestions: function (subject) {
    wx.showLoading({ title: '加载题目中...', mask: true });
    app.request('/getQuestionBySubject', { subName: subject }).then(res => {
      const questions = res.data;
      wx.hideLoading();
      this.setData({
        questionList: questions,
        currentIndex: 0,
        currentQuestion: questions[0] || {},
        options: this.formatOptions(questions[0] || {}),
        selectedOption: '',
        showAnswer: false,
        correctNum: 0,
        correctRate: 0
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    });
  },

  // 工具方法：将题目选项格式化为数组
  formatOptions: function (question) {
    if (!question) return [];
    return [
      { key: 'A', value: question.option_A },
      { key: 'B', value: question.option_B },
      { key: 'C', value: question.option_C },
      { key: 'D', value: question.option_D }
    ];
  },

  // 工具方法：根据选项状态返回对应的样式类名
  getOptionClass: function (key) {
    if (!this.data.showAnswer) {
      return this.data.selectedOption === key ? 'selected' : '';
    }
    if (key === this.data.currentQuestion.answer) {
      return 'correct';
    }
    if (key === this.data.selectedOption && !this.data.isCorrect) {
      return 'wrong';
    }
    return '';
  },

  // 工具方法：根据科目名字匹配对应颜色（渐变）
  getSubjectGradient: function (subject) {
    const gradientMap = {
      '语文': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      '数学': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      '英语': 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    };
    return gradientMap[subject] || 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
  },

  // 工具方法：根据科目返回对应emoji
  getSubjectEmoji: function (subject) {
    const emojiMap = {
      '语文': '📖',
      '数学': '🔢',
      '英语': '🔤'
    };
    return emojiMap[subject] || '📚';
  },

  // 获取庆祝表情
  getCelebrateEmoji: function () {
    const rate = this.data.correctRate;
    if (rate >= 90) return '🏆';
    if (rate >= 70) return '🎉';
    if (rate >= 50) return '💪';
    return '🌱';
  },

  // 获取完成鼓励语
  finishEncourage: function () {
    const rate = this.data.correctRate;
    const total = this.data.questionList.length;
    if (rate >= 90) return `太厉害了！${total}道题几乎全对！`;
    if (rate >= 70) return `表现不错，继续加油哦~`;
    if (rate >= 50) return `及格啦！错题记得复习~`;
    return `别灰心，多练习就会进步！`;
  },

  // 获取分数颜色
  getScoreColor: function () {
    const rate = this.data.correctRate;
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#FF9800';
    return '#f44336';
  },

  // 选项点击事件
  selectOption: function (e) {
    if (this.data.showAnswer) return;
    const option = e.currentTarget.dataset.option;
    const isCorrect = option === this.data.currentQuestion.answer;
    const total = this.data.questionList.length;
    const newCorrectNum = isCorrect ? this.data.correctNum + 1 : this.data.correctNum;
    const newIndex = this.data.currentIndex + 1;
    const newRate = total > 0 ? Math.round(newCorrectNum / newIndex * 100) : 0;
    
    this.setData({
      selectedOption: option,
      showAnswer: true,
      isCorrect: isCorrect,
      correctNum: newCorrectNum,
      correctRate: newRate
    });
    
    // 轻微震动反馈
    if (isCorrect) {
      wx.vibrateShort({ type: 'light' });
    } else {
      this.saveWrongQuestion();
    }
  },

  // 自动保存错题方法
  saveWrongQuestion: function () {
    const userInfo = app.getUserInfo();
    if (!userInfo || !userInfo.user_id) return;
    app.request('/addWrong', {
      user_id: userInfo.user_id,
      q_id: this.data.currentQuestion.q_id
    }, 'POST').then(() => {}).catch(() => {});
  },

  // 上一题按钮点击事件
  prevQuestion: function () {
    if (this.data.currentIndex === 0) return;
    if (this.data.showAnswer) return; // 已答题不允许回退（防作弊）
    const newIndex = this.data.currentIndex - 1;
    const question = this.data.questionList[newIndex];
    this.setData({
      currentIndex: newIndex,
      currentQuestion: question,
      options: this.formatOptions(question),
      selectedOption: '',
      showAnswer: false
    });
  },

  // 下一题/完成按钮点击事件
  nextQuestion: function () {
    if (this.data.currentIndex < this.data.questionList.length - 1) {
      const newIndex = this.data.currentIndex + 1;
      const question = this.data.questionList[newIndex];
      const total = this.data.questionList.length;
      this.setData({
        currentIndex: newIndex,
        currentQuestion: question,
        options: this.formatOptions(question),
        selectedOption: '',
        showAnswer: false,
        correctRate: total > 0 ? Math.round(this.data.correctNum / (newIndex) * 100) : 0
      });
      // 滚动到顶部
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    } else {
      // 最后一题，显示完成弹窗
      const total = this.data.questionList.length;
      this.setData({
        showFinish: true,
        correctRate: total > 0 ? Math.round(this.data.correctNum / total * 100) : 0
      });
    }
  },

  // 跳过此题（未选答案时的下一题）
  skipQuestion: function () {
    if (this.data.currentIndex < this.data.questionList.length - 1) {
      const newIndex = this.data.currentIndex + 1;
      const question = this.data.questionList[newIndex];
      this.setData({
        currentIndex: newIndex,
        currentQuestion: question,
        options: this.formatOptions(question),
        selectedOption: '',
        showAnswer: false
      });
    } else {
      // 直接结束
      const total = this.data.questionList.length;
      this.setData({
        showFinish: true,
        correctRate: total > 0 ? Math.round(this.data.correctNum / total * 100) : 0
      });
    }
  },

  // 再练一次
  retryExam: function () {
    this.setData({ showFinish: false });
    this.loadQuestions(this.data.subject);
  },

  // 返回首页按钮点击事件
  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  // 点击返回按钮，弹出确认
  confirmBack: function () {
    if (this.data.showFinish) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    this.setData({ showConfirm: true });
  },

  // 取消返回
  cancelBack: function () {
    this.setData({ showConfirm: false });
  },

  // 确认退出
  doBack: function () {
    this.setData({ showConfirm: false });
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 200);
  },

  // 手动加入错题本按钮点击事件
  addToWrong: function () {
    const userInfo = app.getUserInfo();
    if (!userInfo || !userInfo.user_id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    app.request('/addWrong', {
      user_id: userInfo.user_id,
      q_id: this.data.currentQuestion.q_id
    }, 'POST').then(res => {
      wx.showToast({ title: '已加入错题本', icon: 'success' });
    }).catch(err => {
      wx.showToast({ title: '已存在或添加失败', icon: 'none' });
    });
  },

  // 空函数，阻止弹窗遮罩下的触摸滚动
  noop: function () {}
});
