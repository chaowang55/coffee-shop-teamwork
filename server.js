const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); 
const fs = require('fs');
const path = require('path');
const app = express()

const corsOptions = {
   origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

const db = mysql.createPool({
  host: 'mysql-16e7842f-newcastle-5563.a.aivencloud.com',
  port: 19561,
  user: 'avnadmin',
  password: 'AVNS_L1pzylSOHZEIRLKThm2',
  database: 'defaultdb',
  ssl: {
ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
  rejectUnauthorized: false
  }
});

db.getConnection((err, conn) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    // 重连逻辑
    setTimeout(() => db.getConnection((err, conn) => {
      if (err) console.error('重连失败:', err);
      else console.log('✅ 数据库重连成功！');
      conn.release();
    }), 3000);
    return;
  }
  console.log('✅ MySQL 连接成功！');
  conn.release();
});

// 3. 获取菜单接口（添加错误详情）
app.get('/api/menu', (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) {
      console.error('获取菜单错误:', err); // 打印具体错误
      return res.status(500).json({ 
        error: '获取菜单失败', 
        detail: err.message // 返回错误详情（生产环境可隐藏）
      });
    }
    res.json(results);
  });
});

// 4. 下单接口（自动生成ID，避免冲突）
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  console.log("📥 收到前端订单数据：", JSON.stringify(orderData)); // 打印前端传的原始数据

  // 关键修复：转换时间格式（前端T分隔 → MySQL空格分隔）
  const mysqlTime = orderData.pick_up_time.replace('T', ' ') + ':00';
  console.log("⏰ 转换后的MySQL时间：", mysqlTime); // 打印转换后的时间

  // 去掉手动ID，改用数据库自增（需确保orders表id是自增主键）
  const sql = `INSERT INTO orders (items, pick_up_time, status) VALUES (?, ?, ?)`;
  const sqlParams = [JSON.stringify(orderData.items), mysqlTime, orderData.status];
  console.log("🔧 执行SQL：", sql, "参数：", sqlParams); // 打印要执行的SQL和参数

  db.query(sql, sqlParams, (err, result) => {
    if (err) {
      console.error('❌ 下单SQL执行失败：', err); // 打印完整错误（重点！）
      return res.status(500).json({ 
        error: '下单失败', 
        detail: err.message, // 返回具体错误给前端
        sql: sql,
        params: sqlParams
      });
    }
    // 返回自增的订单ID
    res.json({ 
      message: '✅ 订单提交成功！',
      orderId: result.insertId 
    });
  });
});

// 5. 获取订单接口（添加错误详情）
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('获取订单错误:', err);
      return res.status(500).json({ 
        error: '获取订单失败', 
        detail: err.message 
      });
    }
    const orders = results.map(order => {
      try {
        order.items = JSON.parse(order.items); // 容错JSON解析
      } catch (e) {
        order.items = [];
      }
      return order;
    });
    res.json(orders);
  });
});


app.post('/api/update-status', (req, res) => {
   const { id, status, cancelReason } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'Missing order ID or status' });
  }

  const sql = cancelReason 
    ? 'UPDATE orders SET status = ?, cancel_reason = ? WHERE id = ?'
    : 'UPDATE orders SET status = ? WHERE id = ?';
  const params = cancelReason 
    ? [status, cancelReason, id]
    : [status, id];

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Update status error:', err);
      return res.status(500).json({ error: 'Status update failed', detail: err.message });
    }
    res.json({ message: 'Status updated successfully' });
  });
});
//
app.get('/create-tables', async (req, res) => {
  try {
    const db = await require('mysql2/promise').createConnection({
      host: 'mysql-16e7842f-newcastle-5563.a.aivencloud.com',
      port: 19561, user: 'avnadmin', password: 'AVNS_L1pzylSOHZEIRLKThm2',
      database: 'defaultdb', ssl: { rejectUnauthorized: false }
    });

    await db.query(`CREATE TABLE IF NOT EXISTS menu (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50),regular DECIMAL(5,2),large DECIMAL(5,2))`);
    await db.query(`CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY,items TEXT NOT NULL,pick_up_time DATETIME NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'Accepted',cancel_reason VARCHAR(50))`);
    await db.query(`INSERT INTO menu (name, regular, large) VALUES ('Americano',1.5,2),('Latte',2.5,3),('Cappuccino',2.5,3),('Hot Chocolate',2,2.5),('Mocha',2.5,3)`);

    await db.end();
    res.send('✅ 云端表创建成功！现在可以正常下单！');
  } catch (e) { res.send('❌ 错误：' + e.message); }
});
//
app.listen(3001, () => {
  console.log('✅ 后端运行在 http://localhost:3001');
  console.log('✅ 支持其他设备访问！');
});
