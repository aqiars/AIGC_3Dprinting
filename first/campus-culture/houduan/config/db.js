const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'campus_culture',   // 数据库名（你刚创建的）
  'root',             // 用户名
  '123456789.z',           // 你的MySQL密码（改成你自己的！）
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false
  }
);

// 测试连接
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 连接成功！');
  } catch (err) {
    console.error('❌ MySQL 连接失败：', err);
  }
})();

module.exports = sequelize;