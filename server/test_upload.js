const http = require('http');
const fs = require('fs');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const filePath = '../Real Estate.xlsx';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const fileStats = fs.statSync(filePath);
const fileContent = fs.readFileSync(filePath);

let postData = '';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="file"; filename="Real Estate.xlsx"\r\n';
postData += 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n';

const head = Buffer.from(postData, 'utf8');
const tail = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8');
const body = Buffer.concat([head, fileContent, tail]);

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/import/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {

    try {
      const json = JSON.parse(data);

    } catch (e) {
      console.log('RAW RESPONSE:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(body);
req.end();
