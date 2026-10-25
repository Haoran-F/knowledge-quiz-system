const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// 先不指定数据库连接，用于创建数据库
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  port: 3306,
  multipleStatements: true
});

console.log('正在连接 MySQL 服务器...');

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL 连接失败！');
    console.error('错误信息:', err.message);
    console.error('\n请检查以下内容：');
    console.error('1. MySQL 服务是否已启动');
    console.error('2. 用户名(root)和密码(12345678)是否正确');
    console.error('3. MySQL 端口是否为 3306');
    process.exit(1);
  }

  console.log('✅ MySQL 连接成功！');

  // 读取 SQL 文件
  const sqlPath = path.join(__dirname, '..', 'database', 'create_table.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  console.log('正在执行数据库初始化脚本...');

  connection.query(sqlContent, (err, results) => {
    if (err) {
      console.error('❌ SQL 执行失败！');
      console.error('错误信息:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('✅ 数据库初始化成功！');
    console.log('   - 数据库: knowledge_db');
    console.log('   - 包含表: user, subject_question, wrong_question, admin');
    console.log('   - 测试数据: 3个科目，共21道题目');
    console.log('   - 默认管理员账号: admin / 12345678');

    connection.end();
    console.log('\n🎉 数据库初始化完成！');
  });
});
