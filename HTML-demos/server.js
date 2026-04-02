const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const PORT = 3000;  // 使用 3000 端口，你也可以改成 8000

const server = http.createServer((req, res) => {
    console.log(`📡 请求: ${req.url}`);

    // 处理根路径和 HTML 文件
    if (req.url === '/' || req.url === '/global-attributes.html' || req.url === '/index.html') {
        // 读取你的 HTML 文件
        const htmlPath = path.join(__dirname, 'global-attributes.html');

        fs.readFile(htmlPath, 'utf8', (err, html) => {
            if (err) {
                console.error('❌ 读取文件失败:', err);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <h1>❌ 找不到文件</h1>
                    <p>请确保 global-attributes.html 文件存在于当前目录</p>
                    <p>当前目录: ${__dirname}</p>
                `);
                return;
            }

            // 生成随机 nonce（每次请求都不同）
            const nonce = crypto.randomBytes(16).toString('base64');
            console.log(`🔑 生成 nonce: ${nonce}`);

            // 替换 HTML 中的 {{NONCE}} 占位符
            const modifiedHtml = html.replace(/\{\{NONCE\}\}/g, nonce);

            // 设置 CSP 响应头
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Security-Policy': `script-src 'nonce-${nonce}' 'strict-dynamic'`
            });

            res.end(modifiedHtml);
            console.log(`✅ 响应发送成功 (nonce: ${nonce.substring(0, 10)}...)`);
        });
    }
    // 处理静态资源（CSS, JS, 图片等）
    else {
        const filePath = path.join(__dirname, req.url);
        const ext = path.extname(filePath);

        // 只允许安全的文件类型
        const allowedExts = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

        if (!allowedExts.includes(ext)) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }

            let contentType = 'text/plain';
            switch (ext) {
                case '.html': contentType = 'text/html'; break;
                case '.css': contentType = 'text/css'; break;
                case '.js': contentType = 'application/javascript'; break;
                case '.png': contentType = 'image/png'; break;
                case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
});

server.listen(PORT, () => {
    console.log('\n🚀 ====================================');
    console.log(`✅ CSP nonce 测试服务器已启动`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`📄 测试文件: global-attributes.html`);
    console.log(`💡 按 Ctrl+C 停止服务器`);
    console.log('====================================\n');
});