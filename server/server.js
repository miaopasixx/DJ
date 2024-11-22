const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../')));

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
    
    // 打开 QQ 浏览器的无痕模式
    exec('"C:\\Program Files\\Tencent\\QQBrowser\\QQBrowser.exe" --incognito http://localhost:8000', (err) => {
        if (err) {
            console.error('无法打开 QQ 浏览器:', err);
        }
    });
});