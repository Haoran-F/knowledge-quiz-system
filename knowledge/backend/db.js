const mysql = require('mysql');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'knowledge_db',
  port: 3306,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
});

// 封装数据库查询方法，返回Promise
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        console.error('数据库查询失败:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// 导出连接池和查询方法
module.exports = {
  pool,
  query
};