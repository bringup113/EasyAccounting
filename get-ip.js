const os = require('os');

// 获取网络接口
const networkInterfaces = os.networkInterfaces();

console.log('可用的网络接口:');
console.log('-------------------');

// 遍历所有网络接口
for (const name of Object.keys(networkInterfaces)) {
  for (const net of networkInterfaces[name]) {
    // 跳过内部接口和非IPv4地址
    if (!net.internal && net.family === 'IPv4') {
      console.log(`接口名称: ${name}`);
      console.log(`IP地址: ${net.address}`);
      console.log(`子网掩码: ${net.netmask}`);
      console.log('-------------------');
    }
  }
}

console.log('\n配置说明:');
console.log('1. 在frontend/.env文件中设置:');
console.log('   REACT_APP_API_URL=http://YOUR_IP_ADDRESS:5001');
console.log('   将YOUR_IP_ADDRESS替换为上面显示的IP地址');
console.log('2. 重启前端服务器:');
console.log('   cd frontend && npm start');
console.log('3. 确保后端服务器正在运行:');
console.log('   cd backend && npm start');
console.log('4. 在其他设备上访问:');
console.log('   http://YOUR_IP_ADDRESS:3000'); 