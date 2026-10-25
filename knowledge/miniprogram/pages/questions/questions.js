const app = getApp();

Page({
  data: {
    allQuestions: [],
    questionList: [],
    displayList: [],
    subjectList: [],
    currentSubject: '',
    searchText: '',
    totalCount: 0,
    filteredCount: 0,
    searchCount: 0,
    expandedIds: {}
  },

  onLoad: function () {
    this.setData({ currentSubject: '全部' });
    this.loadAllQuestions();
    this.loadSubjectList();
  },

  loadAllQuestions: function () {
    app.request('/getAllQuestion').then(res => {
      const list = res.data || [];
      this.setData({
        allQuestions: list,
        totalCount: list.length
      });
      this.updateDisplay();
    }).catch(err => {
      console.error('加载题目失败:', err);
    });
  },

  loadSubjectList: function () {
    app.request('/getSubjectList').then(res => {
      this.setData({ subjectList: ['全部'].concat(res.data || []) });
    }).catch(err => {
      console.error('获取科目列表失败:', err);
    });
  },

  getSubjectGradient: function (subject) {
    const gradientMap = {
      '语文': 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      '数学': 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
      '英语': 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      '物理': 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
      '化学': 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
      '生物': 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      '历史': 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
      '地理': 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)',
      '政治': 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
      '科学': 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)'
    };
    return gradientMap[subject] || 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)';
  },

  getSubjectIcon: function (subject) {
    const iconMap = {
      '语文': '📖',
      '数学': '📐',
      '英语': '🔤',
      '物理': '⚡',
      '化学': '🧪',
      '生物': '🧬',
      '历史': '📜',
      '地理': '🌍',
      '政治': '⚖️',
      '科学': '🔬'
    };
    return iconMap[subject] || '📚';
  },

  getSubjectCount: function (subject) {
    const all = this.data.allQuestions || [];
    return all.filter(q => q.subject_name === subject).length;
  },

  filterBySubject: function (e) {
    const subject = e.currentTarget.dataset.subject;
    this.setData({ currentSubject: subject });
    let filtered;
    if (subject === '全部') {
      filtered = this.data.allQuestions;
    } else {
      filtered = (this.data.allQuestions || []).filter(q => q.subject_name === subject);
    }
    this.setData({
      questionList: filtered,
      filteredCount: filtered.length
    });
    this.updateDisplay();
  },

  onSearchInput: function (e) {
    const text = e.detail.value || '';
    this.setData({ searchText: text });
    this.updateDisplay();
  },

  onClearSearch: function () {
    this.setData({ searchText: '' });
    this.updateDisplay();
  },

  updateDisplay: function () {
    const { questionList, searchText } = this.data;
    const source = questionList && questionList.length > 0
      ? questionList
      : (this.data.allQuestions || []);
    const keyword = (searchText || '').trim().toLowerCase();
    let display;
    if (!keyword) {
      display = source;
    } else {
      display = source.filter(q => {
        const title = (q.title || '').toLowerCase();
        return title.indexOf(keyword) !== -1;
      });
    }
    this.setData({
      displayList: display,
      searchCount: display.length,
      filteredCount: source.length === this.data.totalCount && !this.data.currentSubject
        ? this.data.totalCount
        : source.length
    });
  },

  toggleExpand: function (e) {
    const qid = e.currentTarget.dataset.qid;
    const expanded = this.data.expandedIds || {};
    expanded[qid] = !expanded[qid];
    this.setData({ expandedIds: expanded });
  },

  addToWrong: function (e) {
    const qId = e.currentTarget.dataset.qid;
    const userInfo = app.getUserInfo();
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    app.request('/addWrong', {
      user_id: userInfo.user_id,
      q_id: qId
    }, 'POST').then(res => {
      wx.showToast({ title: '加入成功', icon: 'success' });
    }).catch(err => {
      wx.showToast({ title: '已存在或添加失败', icon: 'none' });
    });
  }
});
