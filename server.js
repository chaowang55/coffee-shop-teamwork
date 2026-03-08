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

//connent to database system
db.getConnection((err, conn) => {
  if (err) {
    console.error('Can not connent database:', err.message);
    setTimeout(() => db.getConnection((err, conn) => {
      if (err) console.error('reconnent fail:', err);
      else console.log('Connent successfully！');
      conn.release();
    }), 3000);
    return;
  }
  console.log('Connent successfully！');
  conn.release();
});

// get menu api 
app.get('/api/menu', (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) {
      console.error('Can not get menu:', err); 
      return res.status(500).json({ 
        error: 'Can not get menu', 
        detail: err.message 
      });
    }
    res.json(results);
  });
});

// 下单接口
// order api, create id number avoid the same number 
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  console.log(" reieve format data：", JSON.stringify(orderData)); 
  const mysqlTime = orderData.pick_up_time.replace('T', ' ') + ':00';
  console.log(" the time data ：", mysqlTime); 
  const sql = `INSERT INTO orders (items, pick_up_time, status) VALUES (?, ?, ?)`;
  const sqlParams = [JSON.stringify(orderData.items), mysqlTime, orderData.status];
  console.log(" 执行SQL：", sql, "参数：", sqlParams);
  db.query(sql, sqlParams, (err, result) => {
    if (err) {
      console.error(' Order placement failed：', err); 
      return res.status(500).json({ 
        error: 'Order placement failed', 
        detail: err.message, 
        sql: sql,
        params: sqlParams
      });
    }
    res.json({ 
      message: 'Order placement successfully！',
      orderId: result.insertId 
    });
  });
});
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Get wrong menu data:', err);
      return res.status(500).json({ 
        error: 'Get wrong menu data', 
        detail: err.message 
      });
    }
    const orders = results.map(order => {
      try {
        order.items = JSON.parse(order.items); 
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
    res.send('Cloud table created successfully! You can now place orders normally！');
  } catch (e) { res.send('wrong：' + e.message); }
});
//
app.listen(3001, () => {
  console.log(' 后端运行在 http://localhost:3001');
  console.log(' 支持其他设备访问！');
});
