const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../')));

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
}); 