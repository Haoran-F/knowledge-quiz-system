const app = getApp();

Page({
  // 3. data：页面所有渲染、弹窗、表单、列表的存储仓库
  data: {
    currentTab: 'question',
    subjectList: [],
    questionList: [],
    userList: [],
    currentSubject: '',
    showModal: false,
    showUserModal: false,
    editingQuestion: null,
    editingUser: null,
    formData: {
      subject_name: '',
      title: '',
      option_A: '',
      option_B: '',
      option_C: '',
      option_D: '',
      answer: '',
      analysis: ''
    },
    userFormData: {
      user_id: '',
      wx_name: '',
      wx_avatar: '',
      phone: ''
    }
  },
 // 4. onLoad：页面首次加载自动执行
  onLoad: function () {
    this.loadSubjects();
    this.loadQuestions();
  },
// 5. onShow：每次切回本页面触发
  onShow: function () {
    if (this.data.currentTab === 'user') {
      this.loadUserList();
    }
  },
// 6. 顶部标签切换点击事件（题目管理 / 用户管理
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'user') {
      this.loadUserList();
    }
  },
 // 7. 请求后端获取全部用户列表
  loadUserList: function () {
    app.request('/getUserList').then(res => {
      this.setData({ userList: res.data });
    }).catch(err => {
      console.error('加载用户列表失败:', err);
    });
  },
 // 8. 编辑用户按钮点击事件，回填用户信息到表单并打开弹窗
  editUser: function (e) {
    const user = e.currentTarget.dataset.user;
    this.setData({
      showUserModal: true,
      editingUser: user,
      userFormData: {
        user_id: user.user_id,
        wx_name: user.wx_name || '',
        wx_avatar: user.wx_avatar || '',
        phone: user.phone || ''
      }
    });
  },
// 9. 关闭用户编辑弹窗，清空编辑标记
  closeUserModal: function () {
    this.setData({ showUserModal: false, editingUser: null });
  },
// 10. 用户表单输入实时同步到userFormData
  onUserFormInput: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`userFormData.${field}`]: e.detail.value });
  },
// 11. 提交修改用户表单
  submitUser: function () {
    const { userFormData } = this.data;
    if (!userFormData.wx_name) {
      wx.showToast({ title: '请输入用户昵称', icon: 'none' });
      return;
    }

    app.request('/updateUser', userFormData, 'POST').then(res => {
      wx.showToast({ title: '修改成功', icon: 'success' });
      this.closeUserModal();
      this.loadUserList();
    }).catch(err => {
      console.error('修改用户失败:', err);
    });
  },
// 12. 删除指定用户
  deleteUser: function (e) {
    const userId = e.currentTarget.dataset.userid;
    app.request('/delUser', { user_id: userId }, 'POST').then(res => {
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadUserList();
    }).catch(err => {
      console.error('删除用户失败:', err);
    });
  },
 // 13. 获取全部科目列表
  loadSubjects: function () {
    app.request('/getSubjectList').then(res => {
      this.setData({
        subjectList: res.data,
        currentSubject: res.data[0] || ''
      });
    }).catch(err => {
      console.error('获取科目列表失败:', err);
    });
  },
 // 14. 根据当前选中科目加载对应所有题目
  loadQuestions: function () {
    const { currentSubject } = this.data;
    app.request('/getQuestionBySubject', { subName: currentSubject }).then(res => {
      this.setData({ questionList: res.data });
    }).catch(err => {
      console.error('加载题目列表失败:', err);
    });
  },
 // 15. 切换筛选科目，重新加载该科目题目
  filterBySubject: function (e) {
    const subject = e.currentTarget.dataset.subject;
    this.setData({ currentSubject: subject });
    this.loadQuestions();
  },
// 16. 打开新增题目弹窗，清空表单并填入当前科目
  showAddModal: function () {
    this.setData({
      showModal: true,
      editingQuestion: null,
      formData: {
        subject_name: this.data.currentSubject,
        title: '',
        option_A: '',
        option_B: '',
        option_C: '',
        option_D: '',
        answer: '',
        analysis: ''
      }
    });
  },
// 17. 编辑已有题目，把题目数据回填表单并打开弹窗
  editQuestion: function (e) {
    const question = e.currentTarget.dataset.question;
    this.setData({
      showModal: true,
      editingQuestion: question,
      formData: {
        subject_name: question.subject_name,
        title: question.title,
        option_A: question.option_A,
        option_B: question.option_B,
        option_C: question.option_C,
        option_D: question.option_D,
        answer: question.answer,
        analysis: question.analysis || ''
      }
    });
  },
 // 18. 关闭题目新增/编辑弹窗
  closeModal: function () {
    this.setData({ showModal: false });
  },
// 19. 题目表单输入实时同步formData
  onFormInput: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },
 // 20. 提交题目表单：区分新增 / 修改
  submitQuestion: function () {
    const { formData, editingQuestion } = this.data;
    if (!formData.subject_name || !formData.title || !formData.option_A || !formData.option_B || !formData.option_C || !formData.option_D || !formData.answer) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (editingQuestion) {
      app.request('/updateQuestion', {
        q_id: editingQuestion.q_id,
        ...formData
      }, 'POST').then(res => {
        wx.showToast({ title: '修改成功', icon: 'success' });
        this.closeModal();
        this.loadQuestions();
      }).catch(err => {
        console.error('修改题目失败:', err);
      });
    } else {
      app.request('/addQuestion', formData, 'POST').then(res => {
        wx.showToast({ title: '新增成功', icon: 'success' });
        this.closeModal();
        this.loadQuestions();
      }).catch(err => {
        console.error('新增题目失败:', err);
      });
    }
  },
 // 21. 删除指定题
  deleteQuestion: function (e) {
    const qId = e.currentTarget.dataset.qid;
    app.request('/delQuestion', { q_id: qId }, 'POST').then(res => {
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadQuestions();
    }).catch(err => {
      console.error('删除题目失败:', err);
    });
  }
});