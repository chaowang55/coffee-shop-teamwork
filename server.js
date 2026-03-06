const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

const corsOptions = {
   origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// 2. 数据库连接池（解决重连+性能问题）
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'coffee_shop',
  connectionLimit: 10, // 连接池大小
  reconnect: true // 自动重连
});

// 测试连接
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

// 6. 更新状态接口（添加错误详情）
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

app.listen(3001, () => {
  console.log('✅ 后端运行在 http://localhost:3001');
  console.log('✅ 支持其他设备访问！');
});