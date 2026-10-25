const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('./db');

// 创建Express应用
const app = express();
const port = 3000;

// 配置中间件：跨域、JSON解析、URL编码解析
app.use(cors());
app.use(express.json({ limit: '1mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// 设置响应头：UTF-8编码和跨域允许
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// 静态资源托管：uploads目录
app.use('/uploads', express.static(uploadDir));

// 配置multer文件上传：自定义文件名（时间戳+扩展名）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// ==================== 题目相关接口 ====================

// 获取所有科目列表
app.get('/getSubjectList', async (req, res) => {
  try {
    const sql = 'SELECT DISTINCT subject_name FROM subject_question';
    const results = await query(sql);
    const subjectList = results.map(item => item.subject_name);
    res.json({ code: 200, message: '获取成功', data: subjectList });
  } catch (err) {
    res.json({ code: 500, message: '获取失败', error: err.message });
  }
});

// 根据科目获取题目列表
app.get('/getQuestionBySubject', async (req, res) => {
  try {
    const { subName } = req.query;
    if (!subName) {
      return res.json({ code: 400, message: '请传入科目名称' });
    }
    const sql = 'SELECT * FROM subject_question WHERE subject_name = ?';
    const results = await query(sql, [subName]);
    res.json({ code: 200, message: '获取成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '获取失败', error: err.message });
  }
});

// 添加新题目
app.post('/addQuestion', async (req, res) => {
  try {
    const { subject_name, title, option_A, option_B, option_C, option_D, answer, analysis } = req.body;
    if (!subject_name || !title || !option_A || !option_B || !option_C || !option_D || !answer) {
      return res.json({ code: 400, message: '请填写完整题目信息' });
    }
    const sql = 'INSERT INTO subject_question (subject_name, title, option_A, option_B, option_C, option_D, answer, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const results = await query(sql, [subject_name, title, option_A, option_B, option_C, option_D, answer, analysis]);
    res.json({ code: 200, message: '添加成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '添加失败', error: err.message });
  }
});

// 修改题目
app.post('/updateQuestion', async (req, res) => {
  try {
    const { q_id, subject_name, title, option_A, option_B, option_C, option_D, answer, analysis } = req.body;
    if (!q_id) {
      return res.json({ code: 400, message: '请传入题目ID' });
    }
    const qid = parseInt(q_id);
    if (isNaN(qid)) {
      return res.json({ code: 400, message: '题目ID格式错误' });
    }
    const sql = 'UPDATE subject_question SET subject_name = ?, title = ?, option_A = ?, option_B = ?, option_C = ?, option_D = ?, answer = ?, analysis = ? WHERE q_id = ?';
    const results = await query(sql, [subject_name, title, option_A, option_B, option_C, option_D, answer, analysis, qid]);
    res.json({ code: 200, message: '修改成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '修改失败', error: err.message });
  }
});

// 删除题目
app.post('/delQuestion', async (req, res) => {
  try {
    const { q_id } = req.body;
    if (!q_id) {
      return res.json({ code: 400, message: '请传入题目ID' });
    }
    const qid = parseInt(q_id);
    if (isNaN(qid)) {
      return res.json({ code: 400, message: '题目ID格式错误' });
    }
    const sql = 'DELETE FROM subject_question WHERE q_id = ?';
    const results = await query(sql, [qid]);
    res.json({ code: 200, message: '删除成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '删除失败', error: err.message });
  }
});

// 获取所有题目
app.get('/getAllQuestion', async (req, res) => {
  try {
    const sql = 'SELECT * FROM subject_question ORDER BY subject_name, q_id';
    const results = await query(sql);
    res.json({ code: 200, message: '获取成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '获取失败', error: err.message });
  }
});

// ==================== 错题相关接口 ====================

// 添加错题
app.post('/addWrong', async (req, res) => {
  try {
    const { user_id, q_id } = req.body;
    if (!user_id || !q_id) {
      return res.json({ code: 400, message: '请传入用户ID和题目ID' });
    }
    const uid = parseInt(user_id);
    const qid = parseInt(q_id);
    if (isNaN(uid) || isNaN(qid)) {
      return res.json({ code: 400, message: 'ID格式错误' });
    }
    // 检查是否已存在
    const checkSql = 'SELECT * FROM wrong_question WHERE user_id = ? AND q_id = ?';
    const existResult = await query(checkSql, [uid, qid]);
    if (existResult.length > 0) {
      return res.json({ code: 400, message: '该题目已在错题本中' });
    }
    const insertSql = 'INSERT INTO wrong_question (user_id, q_id) VALUES (?, ?)';
    const results = await query(insertSql, [uid, qid]);
    res.json({ code: 200, message: '添加成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '添加失败', error: err.message });
  }
});

// 获取用户错题列表
app.get('/getUserWrong', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json({ code: 400, message: '请传入用户ID' });
    }
    const uid = parseInt(userId);
    if (isNaN(uid)) {
      return res.json({ code: 400, message: '用户ID格式错误' });
    }
    // 关联查询：错题表 + 题目表
    const sql = 'SELECT wq.*, sq.title, sq.subject_name, sq.option_A, sq.option_B, sq.option_C, sq.option_D, sq.answer, sq.analysis FROM wrong_question wq LEFT JOIN subject_question sq ON wq.q_id = sq.q_id WHERE wq.user_id = ? ORDER BY wq.add_time DESC';
    const results = await query(sql, [uid]);
    res.json({ code: 200, message: '获取成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '获取失败', error: err.message });
  }
});

// 删除单条错题
app.post('/delSingleWrong', async (req, res) => {
  try {
    const { w_id } = req.body;
    if (!w_id) {
      return res.json({ code: 400, message: '请传入错题ID' });
    }
    const wid = parseInt(w_id);
    if (isNaN(wid)) {
      return res.json({ code: 400, message: '错题ID格式错误' });
    }
    const sql = 'DELETE FROM wrong_question WHERE w_id = ?';
    const results = await query(sql, [wid]);
    res.json({ code: 200, message: '删除成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '删除失败', error: err.message });
  }
});

// 清空用户所有错题
app.post('/clearUserAllWrong', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.json({ code: 400, message: '请传入用户ID' });
    }
    const uid = parseInt(user_id);
    if (isNaN(uid)) {
      return res.json({ code: 400, message: '用户ID格式错误' });
    }
    const sql = 'DELETE FROM wrong_question WHERE user_id = ?';
    const results = await query(sql, [uid]);
    res.json({ code: 200, message: '清空成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '清空失败', error: err.message });
  }
});

// ==================== 用户相关接口 ====================

// 用户登录（新增或更新用户）
app.post('/login', async (req, res) => {
  try {
    const { user_id, wx_name, wx_avatar, phone } = req.body;
    let userId = parseInt(user_id);
    if (!userId || isNaN(userId)) {
      userId = 1;
    }
    // 检查用户是否存在
    const checkSql = 'SELECT * FROM user WHERE user_id = ?';
    const existResult = await query(checkSql, [userId]);
    if (existResult.length > 0) {
      // 更新用户信息
      const updateSql = 'UPDATE user SET wx_name = ?, wx_avatar = ?, phone = ? WHERE user_id = ?';
      await query(updateSql, [wx_name || '', wx_avatar || '', phone || '', userId]);
    } else {
      // 插入新用户
      const insertSql = 'INSERT INTO user (user_id, wx_name, wx_avatar, phone) VALUES (?, ?, ?, ?)';
      await query(insertSql, [userId, wx_name || '', wx_avatar || '', phone || '']);
    }
    // 返回用户信息
    const userSql = 'SELECT * FROM user WHERE user_id = ?';
    const userResult = await query(userSql, [userId]);
    res.json({ code: 200, message: '登录成功', data: userResult[0] });
  } catch (err) {
    res.json({ code: 500, message: '登录失败', error: err.message });
  }
});

// 获取用户列表（管理员用）
app.get('/getUserList', async (req, res) => {
  try {
    const sql = 'SELECT * FROM user ORDER BY create_time DESC';
    const results = await query(sql);
    res.json({ code: 200, message: '获取成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '获取失败', error: err.message });
  }
});

// 更新用户信息（管理员用）
app.post('/updateUser', async (req, res) => {
  try {
    const { user_id, wx_name, wx_avatar, phone } = req.body;
    if (!user_id) {
      return res.json({ code: 400, message: '请传入用户ID' });
    }
    const uid = parseInt(user_id);
    if (isNaN(uid)) {
      return res.json({ code: 400, message: '用户ID格式错误' });
    }
    const sql = 'UPDATE user SET wx_name = ?, wx_avatar = ?, phone = ? WHERE user_id = ?';
    const results = await query(sql, [wx_name || '', wx_avatar || '', phone || '', uid]);
    res.json({ code: 200, message: '修改成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '修改失败', error: err.message });
  }
});

// 删除用户（管理员用）
app.post('/delUser', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.json({ code: 400, message: '请传入用户ID' });
    }
    const uid = parseInt(user_id);
    if (isNaN(uid)) {
      return res.json({ code: 400, message: '用户ID格式错误' });
    }
    const sql = 'DELETE FROM user WHERE user_id = ?';
    const results = await query(sql, [uid]);
    res.json({ code: 200, message: '删除成功', data: results });
  } catch (err) {
    res.json({ code: 500, message: '删除失败', error: err.message });
  }
});

// 上传头像
app.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.json({ code: 400, message: '请传入用户ID' });
    }
    if (!req.file) {
      return res.json({ code: 400, message: '请选择图片' });
    }
    const uid = parseInt(user_id);
    if (isNaN(uid)) {
      return res.json({ code: 400, message: '用户ID格式错误' });
    }
    const avatarUrl = '/uploads/' + req.file.filename;
    const sql = 'UPDATE user SET wx_avatar = ? WHERE user_id = ?';
    await query(sql, [avatarUrl, uid]);
    res.json({ code: 200, message: '上传成功', data: { avatarUrl } });
  } catch (err) {
    res.json({ code: 500, message: '上传失败', error: err.message });
  }
});

// ==================== 管理员相关接口 ====================

// 管理员登录
app.post('/checkAdminLogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ code: 400, message: '请输入账号和密码' });
    }
    const sql = 'SELECT * FROM admin WHERE username = ? AND password = ?';
    const results = await query(sql, [username, password]);
    if (results.length > 0) {
      res.json({ code: 200, message: '登录成功', data: results[0] });
    } else {
      res.json({ code: 401, message: '账号或密码错误' });
    }
  } catch (err) {
    res.json({ code: 500, message: '登录失败', error: err.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器已启动，运行在 http://localhost:${port}`);
});