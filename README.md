# 基于微信小程序的知识题库系统

一个面向中小学语文 / 数学 / 英语学科的移动端刷题与错题管理应用，采用「微信小程序 + Node.js + MySQL」三层架构，支持在线答题、错题自动归集、错题回顾与后台管理。

## 功能特性

**学生端**

- 首页：按时间段问候、随机学习贴士、科目卡片入口
- 刷题：单选答题、实时进度与正确率统计、答错自动加入错题本、答题震动反馈、已答题目不可回退（防作弊）、完成后的成绩弹窗
- 错题本：按科目分类统计、折叠查看题干与解析、单条删除、一键清空
- 题目浏览：关键字搜索、科目筛选、展开查看答案与解析、手动加入错题本
- 我的：用户信息、头像上传、快捷入口、退出登录

**管理端**

- 管理员账号登录
- 题目管理：按科目筛选、新增 / 编辑 / 删除题目
- 用户管理：查看用户列表、编辑用户信息、删除用户

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | 微信小程序原生框架（WXML / WXSS / JS，无 UI 框架依赖） |
| 后端 | Node.js + Express 4 |
| 数据库 | MySQL 5.7 / 8.0（utf8mb4） |
| 文件上传 | Multer（头像存储到 `backend/uploads/`） |
| 跨域 | cors |

接口统一返回 `{ code, message, data }`，`code = 200` 表示成功。

## 目录结构

```
.
├── knowledge/
│   ├── backend/                  # 后端服务
│   │   ├── db.js                 # MySQL 连接池与查询封装
│   │   ├── init_db.js            # 数据库初始化脚本
│   │   ├── server.js             # Express 入口与全部 API 路由
│   │   └── package.json
│   ├── database/
│   │   └── create_table.sql      # 建库建表 + 测试数据
│   ├── miniprogram/              # 微信小程序前端
│   │   ├── app.js                # 全局逻辑（请求封装、登录态）
│   │   ├── app.json              # 页面注册与 tabBar 配置
│   │   ├── images/               # 图标与背景图
│   │   └── pages/
│   │       ├── index/            # 首页
│   │       ├── exam/             # 刷题页
│   │       ├── wrong/            # 错题本
│   │       ├── mine/             # 我的
│   │       ├── questions/        # 全部题目浏览
│   │       └── admin/            # 管理员登录与管理后台
│   └── 项目介绍文档.md / .pdf     # 详细设计说明
└── 基于微信小程序的知识题库系统-实训报告.doc
```

## 快速开始

### 环境要求

- Node.js 16+
- MySQL 5.7 / 8.0
- 微信开发者工具

### 1. 初始化数据库

```bash
cd knowledge/backend
npm install
node init_db.js
```

脚本会自动创建数据库 `knowledge_db`、4 张数据表，并写入 21 道测试题目、1 个测试用户和 1 个默认管理员。

若本机 MySQL 的 root 密码不是 `123456`，请先修改 `knowledge/backend/db.js` 与 `knowledge/backend/init_db.js` 中的 `password` 字段。

### 2. 启动后端服务

```bash
cd knowledge/backend
npm start
```

服务默认运行在 `http://localhost:3000`。用浏览器访问任意接口（如 `http://localhost:3000/getSubjectList`）可验证是否启动成功。

### 3. 运行小程序

1. 打开微信开发者工具，导入项目，目录选择 `knowledge/miniprogram/`
2. 修改 `knowledge/miniprogram/app.js` 顶部的 `BASE_URL`，改为本机局域网 IP（真机调试时手机与电脑需在同一网段）
3. 在「详情 → 本地设置」中勾选「不校验合法域名」（开发阶段使用 HTTP）

## 默认账号

| 角色 | 账号 |
| --- | --- |
| 普通用户 | 小程序内模拟登录，固定 `user_id = 1` |
| 管理员 | `admin` / `12345678` |

## 数据库设计

数据库 `knowledge_db`，共 4 张表：

| 表名 | 说明 | 关键约束 |
| --- | --- | --- |
| `user` | 用户信息 | `user_id` 主键 |
| `subject_question` | 题目总表（科目与题目合并） | `(subject_name, title(255))` 唯一 |
| `wrong_question` | 用户错题关联 | `(user_id, q_id)` 唯一 |
| `admin` | 管理员账号 | `username` 唯一 |

字段详情见 [create_table.sql](knowledge/database/create_table.sql)。

## 主要接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | `/getSubjectList` | 科目列表 |
| GET | `/getQuestionBySubject?subName=语文` | 按科目取题 |
| GET | `/getAllQuestion` | 全部题目 |
| POST | `/addQuestion` | 新增题目 |
| POST | `/updateQuestion` | 修改题目 |
| POST | `/delQuestion` | 删除题目 |
| POST | `/addWrong` | 加入错题（自动去重） |
| GET | `/getUserWrong?userId=1` | 用户错题（联表查题目详情） |
| POST | `/delSingleWrong` | 删除单条错题 |
| POST | `/clearUserAllWrong` | 清空用户错题 |
| POST | `/login` | 用户登录（不存在则新增） |
| GET | `/getUserList` | 用户列表 |
| POST | `/updateUser` | 修改用户 |
| POST | `/delUser` | 删除用户 |
| POST | `/uploadAvatar` | 上传头像（multipart/form-data） |
| POST | `/checkAdminLogin` | 管理员登录校验 |

所有 SQL 均使用参数化查询，数值型 ID 均做 `parseInt + isNaN` 校验。

## 已知限制

- 微信登录为模拟实现，未接入 `wx.login` + `code2session`
- 管理员密码以明文存储，生产环境应改为哈希加盐
- 仅支持单选题，暂未支持多选、判断、填空
- 未实现 HTTPS，正式发布需配置合法域名与证书

## 说明

本项目为课程实训作品，作者：冯昊冉（项目编号 225123241030）。