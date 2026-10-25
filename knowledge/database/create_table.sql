-- ======================================
-- 知识题库系统 - MySQL建表语句
-- 数据库名称：knowledge_db
-- ======================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS knowledge_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE knowledge_db;

-- ======================================
-- 1. 用户表 user
-- 存储微信登录用户信息，错题关联用户id
-- ======================================
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键自增',
    wx_name VARCHAR(100) NOT NULL COMMENT '微信昵称',
    wx_avatar VARCHAR(500) COMMENT '微信头像URL',
    phone VARCHAR(20) COMMENT '联系电话',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ======================================
-- 2. 题目总表 subject_question
-- 合并科目和题目，省去单独科目表，简化结构
-- ======================================
CREATE TABLE IF NOT EXISTS subject_question (
    q_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '题目ID，主键自增',
    subject_name VARCHAR(50) NOT NULL COMMENT '科目名称（如：语文、数学、英语）',
    title TEXT NOT NULL COMMENT '题干内容',
    option_A VARCHAR(500) NOT NULL COMMENT '选项A',
    option_B VARCHAR(500) NOT NULL COMMENT '选项B',
    option_C VARCHAR(500) NOT NULL COMMENT '选项C',
    option_D VARCHAR(500) NOT NULL COMMENT '选项D',
    answer VARCHAR(10) NOT NULL COMMENT '正确答案（A/B/C/D）',
    analysis TEXT COMMENT '答案解析',
    UNIQUE KEY uk_question_unique (subject_name, title(255)) COMMENT '防止同一科目重复题目'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目总表';

-- ======================================
-- 3. 错题表 wrong_question
-- 关联用户和题目，记录用户做错的题目
-- ======================================
CREATE TABLE IF NOT EXISTS wrong_question (
    w_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '错题ID，主键自增',
    user_id INT NOT NULL COMMENT '用户ID，关联user表',
    q_id INT NOT NULL COMMENT '题目ID，关联subject_question表',
    add_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    UNIQUE KEY uk_user_question (user_id, q_id) COMMENT '防止同一用户同一题目重复添加'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='错题表';

-- ======================================
-- 4. 管理员表 admin
-- 存储管理员账号信息，支持多管理员
-- ======================================
CREATE TABLE IF NOT EXISTS admin (
    a_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID，主键自增',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '管理员账号',
    password VARCHAR(255) NOT NULL COMMENT '管理员密码（MD5加密）',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_admin_username (username) COMMENT '管理员账号唯一'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- ======================================
-- 测试数据插入（全部不重复）
-- 3个科目：语文、数学、英语，共12道测试题
-- ======================================

-- 语文题目（7道）
INSERT IGNORE INTO subject_question (subject_name, title, option_A, option_B, option_C, option_D, answer, analysis) VALUES
('语文', '《静夜思》的作者是谁？', '李白', '杜甫', '白居易', '王维', 'A', '《静夜思》是唐代诗人李白的代表作之一，表达了诗人的思乡之情。'),
('语文', '"床前明月光"中的"床"指的是什么？', '睡床', '井栏', '窗户', '桌子', 'B', '这里的"床"指的是井栏，古代有"床前明月光，疑是地上霜"的说法。'),
('语文', '下列哪个成语表示"做事有恒心"？', '半途而废', '锲而不舍', '三心二意', '朝三暮四', 'B', '"锲而不舍"出自《荀子·劝学》，比喻有恒心，有毅力。'),
('语文', '"春眠不觉晓"出自哪首诗？', '《春晓》', '《春望》', '《春夜喜雨》', '《春江花月夜》', 'A', '"春眠不觉晓"出自唐代诗人孟浩然的《春晓》，描写春天早晨的美好景象。'),
('语文', '"欲穷千里目"的下一句是？', '更上一层楼', '一览众山小', '手可摘星辰', '疑是银河落九天', 'A', '"欲穷千里目，更上一层楼"出自王之涣的《登鹳雀楼》。'),
('语文', '下列哪个是《红楼梦》的作者？', '罗贯中', '施耐庵', '曹雪芹', '吴承恩', 'C', '《红楼梦》的作者是清代作家曹雪芹。'),
('语文', '"飞流直下三千尺"描写的是哪里？', '长江', '黄河', '庐山瀑布', '黄果树瀑布', 'C', '这句诗出自李白的《望庐山瀑布》。');

-- 数学题目（7道）
INSERT IGNORE INTO subject_question (subject_name, title, option_A, option_B, option_C, option_D, answer, analysis) VALUES
('数学', '2+2×3等于多少？', '8', '12', '6', '10', 'A', '根据运算顺序，先乘除后加减，2×3=6，再加上2等于8。'),
('数学', '一个正方形的边长是4厘米，它的面积是多少？', '8平方厘米', '12平方厘米', '16平方厘米', '20平方厘米', 'C', '正方形面积=边长×边长，4×4=16平方厘米。'),
('数学', '圆的面积公式是什么？', 'S=πr', 'S=2πr', 'S=πr²', 'S=2πr²', 'C', '圆的面积公式是S=πr²，其中r是圆的半径。'),
('数学', '100以内最大的质数是多少？', '97', '98', '99', '100', 'A', '质数是指大于1且只能被1和自身整除的数，97是100以内最大的质数。'),
('数学', '三角形的内角和是多少度？', '90度', '180度', '270度', '360度', 'B', '任意三角形的内角和都是180度。'),
('数学', '1公里等于多少米？', '100米', '500米', '1000米', '10000米', 'C', '1公里=1000米，这是国际通用的长度单位换算。'),
('数学', '下列哪个是偶数？', '13', '17', '20', '23', 'C', '偶数是能被2整除的整数，20÷2=10，所以20是偶数。');

-- 英语题目（7道）
INSERT IGNORE INTO subject_question (subject_name, title, option_A, option_B, option_C, option_D, answer, analysis) VALUES
('英语', '"Hello"的中文意思是？', '再见', '你好', '谢谢', '对不起', 'B', '"Hello"是英语中最常用的问候语，意思是"你好"。'),
('英语', '下列哪个单词是"苹果"的意思？', 'Banana', 'Orange', 'Apple', 'Grape', 'C', '"Apple"是英语中"苹果"的意思。'),
('英语', '"I love you"的中文翻译是？', '我恨你', '我喜欢你', '我爱你', '我想念你', 'C', '"I love you"是表达爱意的常用句子。'),
('英语', '下列哪个单词是"书"的意思？', 'Pen', 'Book', 'Pencil', 'Ruler', 'B', '"Book"是英语中"书"的意思，其他选项分别是钢笔、铅笔、尺子。'),
('英语', '"Water"的中文意思是？', '火', '水', '土', '风', 'B', '"Water"在英语中是"水"的意思。'),
('英语', '下列哪个是星期几的英文？', 'Apple', 'Monday', 'Book', 'Pen', 'B', '"Monday"是"星期一"的英文表达。'),
('英语', '"Thank you"的中文意思是？', '对不起', '你好', '谢谢', '再见', 'C', '"Thank you"是英语中表达感谢的常用语。');

-- 插入一条测试用户数据
INSERT IGNORE INTO user (wx_name, wx_avatar) VALUES ('汉堡好热', '');

-- 插入默认管理员数据（密码为明文12345678）
INSERT IGNORE INTO admin (username, password, real_name) VALUES ('admin', '12345678', '系统管理员');

-- ======================================
-- 如果已经有重复数据，执行以下语句清理
-- ======================================
-- DELETE FROM subject_question WHERE q_id NOT IN (SELECT MIN(q_id) FROM subject_question GROUP BY subject_name, title);
-- ALTER TABLE subject_question AUTO_INCREMENT = 1;
